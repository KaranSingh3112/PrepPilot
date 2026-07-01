// ============================================================
// services/ai.js
// Purpose: All AI-related tasks:
//   1. generateQuestion()  -> FR-4.10 / FR-3.6
//   2. evaluateAnswer()    -> FR-4.8 / Section 7.2
//   3. generateReport()    -> FR-4.12 / Section 7.3
//
// Uses OpenAI's API (OpenAI-compatible). 
// If you want to use GrokAI (xAI), just change the baseURL:
//   const client = new OpenAI({
//     apiKey: process.env.XAI_API_KEY,
//     baseURL: 'https://api.x.ai/v1'
//   });
//
// Every function has a robust FALLBACK so that the system works
// even when the AI API is down or the key is missing (great for
// college project demos).
// ============================================================
// import OpenAI from "openai";
import GroqAI from "groq";

const client = new GroqAI({
  apiKey: process.env.GROKAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
});

// Total number of questions per interview (FR-4.11)
const TOTAL_QUESTIONS = 5;

// ============================================================
// Fallback questions if AI is unavailable
// ============================================================
const FALLBACK_QUESTIONS = [
  'Tell me about yourself and your background.',
  'What interests you about this role?',
  'Describe a challenging project you worked on recently.',
  'What are your strongest technical skills?',
  'How do you handle tight deadlines or pressure?',
  'Where do you see yourself professionally in 5 years?',
  'Why should we hire you for this position?',
];

// ============================================================
// generateQuestion({ jobRole, skills, previousQuestions, previousAnswers })
//   - Returns ONE interview question as a string.
// ============================================================
const generateQuestion = async ({
  jobRole,
  skills,
  previousQuestions = [],
  previousAnswers = [],
}) => {
  try {
    const history = previousQuestions
      .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${previousAnswers[i] || '(no answer)'}`)
      .join('\n\n');

    const prompt = `You are a professional interviewer for a ${jobRole} position.

Candidate's skills: ${skills.length ? skills.join(', ') : 'general'}.

Previous interview Q&A so far:
${history || '(none — this is the first question)'}

Generate ONE thoughtful, contextual interview question. 
- If this is the first question, ask a "tell me about yourself" style question tailored to ${jobRole}.
- Otherwise, ask a question that builds on the candidate's previous answers.
- Keep it under 30 words. Return ONLY the question text, no numbering, no quotes.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error('AI generateQuestion failed, using fallback:', err.message);
    // FALLBACK: pick next question in rotation
    const idx = previousQuestions.length;
    return FALLBACK_QUESTIONS[idx] || FALLBACK_QUESTIONS[FALLBACK_QUESTIONS.length - 1];
  }
};

// ============================================================
// evaluateAnswer({ question, answer, jobRole })
//   - Returns { score (1-10), feedback (string) }
// ============================================================
const evaluateAnswer = async ({ question, answer, jobRole }) => {
  try {
    const prompt = `You are evaluating a candidate's answer in a mock interview for a ${jobRole} role.

Question: ${question}
Candidate Answer: ${answer}

Score the answer from 1 to 10 using these guidelines:
- 8-10: Excellent — clear, specific, shows depth
- 5-7:  Average — relevant but generic or missing detail
- 1-4:  Poor — vague, irrelevant, or too short

Respond ONLY with valid JSON in this exact shape:
{"score": <number 1-10>, "feedback": "<one short paragraph>"}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 200,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Sanitize: ensure score is integer 1-10
    const score = Math.max(1, Math.min(10, Math.round(result.score)));
    return { score, feedback: result.feedback || 'No feedback provided.' };
  } catch (err) {
    console.error('AI evaluateAnswer failed, using fallback:', err.message);
    // FALLBACK: simple heuristic based on answer length
    const wordCount = answer.trim().split(/\s+/).length;
    let score = 5;
    if (wordCount >= 30 && wordCount <= 120) score = 7;
    else if (wordCount > 120) score = 8;
    else if (wordCount < 10) score = 3;

    return {
      score,
      feedback: `Auto-graded (${wordCount} words). Try to give more specific examples next time.`,
    };
  }
};

// ============================================================
// generateReport({ jobRole, qaList, skills })
//   - Returns the final interview report object.
// ============================================================
const generateReport = async ({ jobRole, qaList, skills }) => {
  try {
    const qaString = qaList
      .map(
        (qa, i) =>
          `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}\nScore: ${qa.score}\nFeedback: ${qa.feedback}`
      )
      .join('\n\n');

    const prompt = `Generate a final hiring report for a ${jobRole} candidate based on this interview.

Candidate Skills: ${skills.join(', ')}

Full Q&A transcript:
${qaString}

Recommendation rules (based on AVERAGE score):
- avg >= 8   → "Strong Hire"
- avg >= 6.5 → "Hire"
- avg >= 5   → "Maybe"
- avg < 5    → "No Hire"

Respond ONLY with valid JSON in this exact shape:
{
  "totalScore": <number, average rounded to 1 decimal>,
  "recommendation": "<one of: Strong Hire | Hire | Maybe | No Hire>",
  "strengths": ["<string>", "<string>", "<string>"],
  "weaknesses": ["<string>", "<string>", "<string>"],
  "suggestions": ["<string>", "<string>", "<string>"],
  "detailedFeedback": "<one paragraph summary>"
}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('AI generateReport failed, using fallback:', err.message);
    // FALLBACK: do math locally
    const avg =
      qaList.reduce((sum, qa) => sum + (qa.score || 0), 0) / qaList.length;

    let recommendation = 'No Hire';
    if (avg >= 8) recommendation = 'Strong Hire';
    else if (avg >= 6.5) recommendation = 'Hire';
    else if (avg >= 5) recommendation = 'Maybe';

    return {
      totalScore: Math.round(avg * 10) / 10,
      recommendation,
      strengths: [
        'Completed all interview questions',
        'Demonstrated interest in the role',
      ],
      weaknesses: ['Answers could include more specific examples'],
      suggestions: [
        'Practice using the STAR method (Situation, Task, Action, Result)',
        'Prepare concrete examples from past projects',
      ],
      detailedFeedback: `Your average score was ${avg.toFixed(1)}/10. Keep practicing to improve!`,
    };
  }
};

export default {generateQuestion, evaluateAnswer, generateReport}