import ApiError from "../utils/ApiError.js";
import parser from "../services/parser.js";
import Interview from "../models/interview.js";
import ai from "../services/ai.js";

const TOTAL_QUESTION = 5;
const MAX_RESUME_SIZE = 5 * 1024 * 1024; //5 mb

export const startInterview = async(req, res) => {
    const { resumeBase64, resumeName, mimeType, jobRole } = req.body;

    //Validation
    if(!resumeBase64 || !mimeType || !jobRole){
        throw new ApiError(400, 'resumeBase64, mimetype and jobRole are required' );
    };
    const buffer = Buffer.from(resumeBase64,'base64');
    if(buffer.length > MAX_RESUME_SIZE){
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
        qaList: [{question: firstQuestion}],
    })
    
    res.status(201).json({
        interviewId: interview._id,
        question: firstQuestion,
        questionNumber: 1,
        totalQuestions: TOTAL_QUESTION,
    });
};