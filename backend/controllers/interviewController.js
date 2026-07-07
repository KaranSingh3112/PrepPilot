import ApiError from "../utils/ApiError.js";
import parser from "../services/parser.js";
import Interview from "../models/interview.js";
import ai from "../services/ai.js";

const TOTAL_QUESTIONS = 5;
const MAX_RESUME_SIZE = 5 * 1024 * 1024; //5 mb

export const startInterview = async (req, res) => {
    const { resumeBase64, resumeName, mimeType, jobRole } = req.body;

    //Validation
    if (!resumeBase64 || !mimeType || !jobRole) {
        throw new ApiError(400, 'resumeBase64, mimetype and jobRole are required');
    };
    const buffer = Buffer.from(resumeBase64, 'base64');
    if (buffer.length > MAX_RESUME_SIZE) {
        throw new ApiError(400, "Resume file exceeds 5 MB limit");
    }

    //Parse resume
    const resumeText = await parser.parseResume(buffer, mimeType);
    const skills = parser.extractSkills(resumeText)

    //Generating first question
    const firstQuestion = await ai.generateQuestion({
        jobRole,
        skills,
        previousQuestions: [],
        previousAnswers: []
    })

    const interview = await Interview.create({
        user: req.user.id,
        jobRole,
        skills,
        resumeName: resumeName || 'resume',
        qaList: [{ question: firstQuestion }],
    })

    res.status(201).json({
        interviewId: interview._id,
        question: firstQuestion,
        questionNumber: 1,
        totalQuestions: TOTAL_QUESTIONS,
    });
};

export const submitAnswer = async (req, res) => {
    const { answer } = req.body;
    const { id } = req.params;
    if (!answer || !answer.trim()) {
        throw new ApiError(400, "Answer cannot be empty!")
    }
    const interview = await Interview.findOne({
        _id: id,
        user: req.user.id
    });
    if (!interview) {
        throw new ApiError(404, "Interview not found!")
    }
    if (interview.completed) {
        throw new ApiError(400, "Interview already completed");
    };
    const currentIndex = interview.qaList.length - 1;
    const currentQA = interview.qaList[currentIndex];

    const evaluation = await ai.evaluateAnswer({
        question: currentQA.question,
        answer,
        jobRole: interview.jobRole,
    });
    interview.qaList[currentIndex].answer = answer;
    interview.qaList[currentIndex].score = evaluation.score;
    interview.qaList[currentIndex].feedback = (await evaluation).feedback;

    if (interview.qaList.length >= TOTAL_QUESTIONS) {
        const report = await ai.generateQuestion({
            jobRole: interview.jobRole,
            qaList: interview.qaList,
            skills: interview.skills
        });

        interview.totalScore = report.totalScore;
        interview.recommendation = report.recommendation;
        interview.strengths = report.strengths;
        interview.weaknesses = report.weaknesses;
        interview.suggestions = report.suggestions;
        interview.detailedFeedback = report.detailedFeedback;
        interview.completed = true;

        await interview.save();
        return res.json({
            completed: true,
            interviewId: interview._id
        })
    }
    const previousQuestions = interview.qaList.map((q) => q.question);
    const previousAnswers = interview.qaList.map((q) => q.answer);

    const nextQuestion = await ai.generateQuestion({
        jobRole: interview.jobRole,
        skills: interview.skills,
        previousQuestions,
        previousAnswers
    });
    interview.qaList.push({ question: nextQuestion });
    await interview.save();
    res.json({
        completed: false,
        question: nextQuestion,
        questionNumber: interview.qaList.length,
        totalQuestions: TOTAL_QUESTIONS
    });
}

export const getInterview = async (req, res) => {
    const interview = await Interview.findOne({
        _id: req.params.id,
        user: req.user.id
    })
    if (!interview) {
        throw new ApiError(404, "Interview not found");
    }
    res.json(interview);
}

export const getHistory = async (req, res) => {
    const interviews = await Interview.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select('jobRole resumeName totalScore recommenation createdAt completed')
    res.json(interviews)
}