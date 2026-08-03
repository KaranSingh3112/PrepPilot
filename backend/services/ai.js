// import Groq from "groq-sdk";

// const client = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });


// // Interview Configuration

// const AI_MODEL = "llama-3.3-70b-versatile";


import Groq from "groq-sdk";

const API_KEY = process.env.GROQ_API_KEY?.trim();
const client = API_KEY ? new Groq({ apiKey: API_KEY }) : null;

const AI_MODEL = "llama-3.3-70b-versatile";

const DEFAULT_QUESTION_TEMPLATES = [
  "How have you used {skill} in a recent project?",
  "Describe one way to solve a practical problem with {skill}.",
  "How would you build a small feature using {skill}?",
  "What is one tradeoff when using {skill} in a real app?",
  "Explain {skill} simply as if to a junior teammate."
];

const getSkillText = (skills = []) => {
  if (!skills || !skills.length) return "your background";
  return skills.slice(0, 3).join(", ");
};

const buildFallbackQuestion = ({ jobRole, skills, previousQuestions = [] }) => {
  const role = jobRole || "this role";
  const skillList = skills && skills.length ? skills : ["problem solving"];
  const skill = skillList[0];
  const template =
    DEFAULT_QUESTION_TEMPLATES[
      Math.floor(Math.random() * DEFAULT_QUESTION_TEMPLATES.length)
    ];

  const question = template.replace("{skill}", skill);
  const base = `For a ${role} position, ${question}`;

  if ((previousQuestions || []).includes(base)) {
    return `Tell me about a recent experience where you used ${skillList.join(" or ")} to solve a practical problem in ${role}.`;
  }

  return base;
};

const createPrompt = ({
  task,
  jobRole,
  skills,
  previousQuestions = [],
  previousAnswers = [],
  question,
  answer,
  qaList = []
}) => {
  const skillText = getSkillText(skills);
  const roleText = jobRole || "the target role";

  if (task === "question") {
    return `You are a friendly technical interviewer for ${roleText}. Generate ONE easy-to-moderate interview question based on the candidate's resume skills: ${skillText}. Keep the question concise and clear, ideally one sentence and under 25 words. Avoid asking something too advanced. Do not ask multiple questions. Do not mention the resume directly. Make sure it is different from these previous questions: ${previousQuestions.join(" | ") || "none"}`;
  }

  if (task === "evaluate") {
    return `You are evaluating an interview answer for ${roleText}. Score the answer from 1 to 10 and provide a short constructive feedback. Respond strictly as JSON with fields: {"score": number, "feedback": string}. Question: ${question}. Candidate answer: ${answer}`;
  }

  return `You are creating a hiring summary for ${roleText}. Use the candidate's skills: ${skillText}. Based on these Q&A entries: ${qaList
    .map((qa, index) => `Q${index + 1}: ${qa.question} | A: ${qa.answer || "No answer"}`)
    .join("\n")}. Return strict JSON with fields: {"totalScore": number, "recommendation": string, "strengths": string[], "weaknesses": string[], "suggestions": string[], "detailedFeedback": string}.`;
};

const parseJsonResponse = (content) => {
  try {
    const cleaned = (content || "").replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const callGroq = async (prompt) => {
  if (!client) {
    throw new Error("Groq client is not configured");
  }

  const response = await client.chat.completions.create({
    model: AI_MODEL,
    temperature: 0.75,
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful interview assistant for hiring interviews. Be concise, practical, and structured."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response?.choices?.[0]?.message?.content || "";
};

const generateQuestion = async ({
  jobRole,
  skills,
  previousQuestions = [],
  previousAnswers = []
}) => {
  try {
    const prompt = createPrompt({
      task: "question",
      jobRole,
      skills,
      previousQuestions,
      previousAnswers
    });

    const response = await callGroq(prompt);
    const content = response.trim();

    if (content) {
      return content.replace(/^\s*[-*]\s*/, "").trim();
    }
  } catch (error) {
    console.warn("Groq question generation failed, using fallback", error.message);
  }

  return buildFallbackQuestion({ jobRole, skills, previousQuestions });
};

const evaluateAnswer = async ({ question, answer, jobRole }) => {
  try {
    const prompt = createPrompt({
      task: "evaluate",
      jobRole,
      question,
      answer
    });

    const response = await callGroq(prompt);
    const parsed = parseJsonResponse(response);

    if (parsed && typeof parsed.score === "number" && typeof parsed.feedback === "string") {
      return {
        score: Math.min(10, Math.max(1, Math.round(parsed.score))),
        feedback: parsed.feedback.trim()
      };
    }
  } catch (error) {
    console.warn("Groq answer evaluation failed, using fallback", error.message);
  }

  const normalized = (answer || "").trim();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const hasKeywords =
    /project|build|used|implemented|debug|team|api|database|design|architecture|deploy|test|optimi/i.test(normalized);

  const score = Math.min(
    10,
    Math.max(4, 5 + Math.min(3, Math.floor(wordCount / 20)) + (hasKeywords ? 1 : 0))
  );

  return {
    score,
    feedback:
      normalized.length > 40
        ? "Good answer. You explained your experience clearly and gave practical detail."
        : "Your answer should include a bit more detail about the approach, result, and tools you used."
  };
};

const generateReport = async ({ jobRole, qaList = [], skills = [] }) => {
  try {
    const prompt = createPrompt({
      task: "report",
      jobRole,
      skills,
      qaList
    });

    const response = await callGroq(prompt);
    const parsed = parseJsonResponse(response);

    if (parsed && typeof parsed.totalScore === "number") {
      return {
        totalScore: Math.min(10, Math.max(1, Math.round(parsed.totalScore))),
        recommendation: parsed.recommendation || "Maybe",
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        detailedFeedback: parsed.detailedFeedback || "Interview completed."
      };
    }
  } catch (error) {
    console.warn("Groq report generation failed, using fallback", error.message);
  }

  const averageScore =
    qaList.reduce((sum, qa) => sum + (qa.score || 0), 0) / Math.max(1, qaList.length);

  const roundedAverage = Number(averageScore.toFixed(1));

  let recommendation = "Maybe";
  if (roundedAverage >= 8.5) recommendation = "Strong Hire";
  else if (roundedAverage >= 7.0) recommendation = "Hire";
  else if (roundedAverage >= 5.5) recommendation = "Maybe";
  else recommendation = "No Hire";

  const strengths = skills.length
    ? [`Strong command of ${skills.slice(0, 2).join(" and ")}`]
    : ["Clear communication and structured examples"];

  const weaknesses = [
    "Add more depth to your examples",
    "Be more specific about the impact of your work"
  ];

  const suggestions = [
    "Practice explaining your projects in a simple, measurable way",
    "Prepare examples that show your thinking and tradeoffs"
  ];

  return {
    totalScore: roundedAverage,
    recommendation,
    strengths,
    weaknesses,
    suggestions,
    detailedFeedback: `You completed ${qaList.length} interview questions with an average score of ${roundedAverage}/10. Focus on explaining your decisions, business impact, and tradeoffs more clearly.`
  };
};

export default {
  generateQuestion,
  evaluateAnswer,
  generateReport
};