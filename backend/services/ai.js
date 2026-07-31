import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// Interview Configuration

const AI_MODEL = "llama-3.3-70b-versatile";

// Generic fallback questions
const FALLBACK_QUESTIONS = [
  "Tell me about yourself.",
  "What interests you about this role?",
  "Describe a project you are proud of.",
  "How do you solve technical problems?",
  "Why should we hire you?",
  "Describe a difficult bug you fixed.",
  "What would you like to improve technically?"
];

// Curated Question Banks
const ROLE_BANKS = {
  "Frontend Developer": {
    introduction: [
      "Tell me about yourself and why you chose frontend development."
    ],
    fundamentals: [
      "Explain the difference between var, let and const.",
      "What is Virtual DOM?",
      "Explain closures in JavaScript.",
      "What is event delegation?",
      "Explain CSS specificity."
    ],
    practical: [
      "How would you debounce a search input?",
      "How would you center a div in CSS?",
      "Explain responsive web design.",
      "How would you optimize a slow React application?"
    ],
    tools: [
      "How do you debug React applications?",
      "Explain Chrome DevTools.",
      "How do you improve accessibility?"
    ],
    scenario: [
      "Your React application becomes slow after loading 5000 items. What would you do?",
      "How would you reduce unnecessary re-renders?"
    ],
    project: [
      "Explain your best frontend project in detail."
    ],
    closing: [
      "Why should we hire you as a frontend developer?"
    ]
  },
  "Backend Developer": {
    introduction: [
      "Tell me about your backend development experience."
    ],
    fundamentals: [
      "Explain REST APIs.",
      "Difference between SQL and NoSQL.",
      "What are HTTP status codes?",
      "Explain middleware in Express.",
      "What is JWT authentication?"
    ],
    practical: [
      "How would you secure a REST API?",
      "How would you design authentication?",
      "How do you upload files using Node?"
    ],
    tools: [
      "How do you debug Node.js?",
      "Explain Postman workflow.",
      "How do you monitor APIs?"
    ],
    scenario: [
      "Your API suddenly becomes slow. What steps will you take?"
    ],
    project: [
      "Explain your backend architecture."
    ],
    closing: [
      "Why are you interested in backend development?"
    ]
  },
  "MERN Stack Developer": {
    introduction: [
      "Tell me about yourself and your MERN experience."
    ],
    fundamentals: [
      "Explain the MERN architecture.",
      "What is Redux?",
      "Explain JWT authentication.",
      "Difference between useState and useEffect."
    ],
    practical: [
      "How would you build authentication?",
      "Explain protected routes.",
      "How do you upload images?",
      "How do you deploy a MERN project?"
    ],
    tools: [
      "Explain Git workflow.",
      "Explain Docker.",
      "How do you use MongoDB Atlas?"
    ],
    scenario: [
      "Your deployed MERN project crashes randomly. How would you debug it?"
    ],
    project: [
      "Explain your favorite MERN project."
    ],
    closing: [
      "Why should we hire you as a MERN developer?"
    ]
  },
  "React Developer": {
    introduction: [
      "Tell me about yourself."
    ],
    fundamentals: [
      "Explain hooks.",
      "Difference between state and props.",
      "Explain Context API.",
      "Explain reconciliation."
    ],
    practical: [
      "How do you optimize rendering?",
      "Explain lazy loading.",
      "Explain memoization."
    ],
    tools: [
      "How do you debug React?",
      "Explain React DevTools."
    ],
    scenario: [
      "Your component renders 30 times. How do you debug it?"
    ],
    project: [
      "Explain your best React project."
    ],
    closing: [
      "Why React?"
    ]
  }
};

// Helper Functions
const ROLE_ALIASES = {
  "Frontend Developer": [
    "frontend",
    "frontend developer",
    "react",
    "react developer",
    "ui developer",
    "web developer",
  ],
  "Backend Developer": [
    "backend",
    "backend developer",
    "node",
    "nodejs",
    "express",
    "api developer",
  ],
  "MERN Stack Developer": [
    "mern",
    "mern stack",
    "full stack",
    "fullstack",
    "full stack developer",
  ],
  "React Developer": [
    "react",
    "reactjs",
    "react developer",
  ],
};

function getRoleBank(jobRole = "") {
  const role = jobRole.toLowerCase();

  for (const [bankName, aliases] of Object.entries(ROLE_ALIASES)) {
    if (aliases.some(alias => role.includes(alias))) {
      return ROLE_BANKS[bankName];
    }
  }

  return null;
}

function getFallbackQuestion(jobRole, index) {
  const bank = getRoleBank(jobRole);
  if (!bank)
    return FALLBACK_QUESTIONS[index] ||
      FALLBACK_QUESTIONS[FALLBACK_QUESTIONS.length - 1];
  const sections = [
    bank.introduction,
    bank.fundamentals,
    bank.practical,
    bank.tools,
    bank.scenario,
    bank.project,
    bank.closing
  ];
  const list = sections[index];
  if (!list)
    return FALLBACK_QUESTIONS[index] ||
      FALLBACK_QUESTIONS[FALLBACK_QUESTIONS.length - 1];
  return list[
    Math.floor(Math.random() * list.length)
  ];
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    try {
      const match = text.match(/\{[\s\S]*\}/);

      if (match) {
        return JSON.parse(match[0]);
      }

      return null;
    } catch {
      return null;
    }
  }
}

// Generate AI Interview Question
const generateQuestion = async ({
  jobRole,
  skills = [],
  previousQuestions = [],
  previousAnswers = [],
}) => {
  try {
    const interviewRound = previousQuestions.length + 1;
    const history =
      previousQuestions.length === 0
        ? "This is the first question."
        : previousQuestions
          .map(
            (q, i) => `
Question ${i + 1}: ${q}
Candidate Answer: ${previousAnswers[i] || "No answer"}
`
          )
          .join("\n");

    const prompt = `
You are a Senior Technical Interviewer.

You are interviewing a candidate for the role:

${jobRole}

Candidate Skills:
${skills.length ? skills.join(", ") : "General Programming"}

Current Interview Round:
${interviewRound}

Previous Interview:

${history}

Instructions:

1. Ask ONLY ONE interview question.

2. Never repeat a previous question.

3. If this is Question 1:
- Ask a friendly "Tell me about yourself" style question related to ${jobRole}.

4. If this is Question 2-5:
- Ask technical questions.
- Mix theory and practical knowledge.
- Prefer skills mentioned in the resume.
- Increase difficulty gradually.

5. If this is Question 6-7:
- Ask scenario-based or project-based questions.
- Test problem-solving ability.
- Avoid basic definitions.

6. The question should:
- Be under 30 words.
- Be natural.
- Sound like a real interviewer.
- Not include numbering.
- Not include quotation marks.

Return ONLY the question.
`;

    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.7,
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    let question =
      completion.choices?.[0]?.message?.content?.trim() || "";
    question = question
      .replace(/^["']|["']$/g, "")
      .replace(/^Question[:\d\s-]*/i, "")
      .trim();

    // Prevent duplicate AI questions
    const normalize = (text = "") =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const isDuplicate = previousQuestions.some(
      q => normalize(q) === normalize(question)
    );

    if (isDuplicate) {
      return getFallbackQuestion(jobRole, previousQuestions.length);
    }
    return question;
  } catch (err) {
    console.error("AI Question Generation Failed:", err.message);
    return getFallbackQuestion(jobRole, previousQuestions.length);
  }
};

// =====================================================
// Evaluate Candidate Answer
// =====================================================
const evaluateAnswer = async ({
  question,
  answer,
  jobRole,
}) => {
  try {
    const prompt = `
You are an experienced Technical Interviewer.

Job Role:
${jobRole}

Interview Question:
${question}

Candidate Answer:
${answer}

Evaluate this answer carefully.

Scoring Criteria:

1. Technical Accuracy (40%)
2. Depth of Knowledge (20%)
3. Communication Skills (15%)
4. Practical Examples (15%)
5. Confidence & Clarity (10%)

Scoring Guide:

9-10 = Excellent
7-8 = Good
5-6 = Average
3-4 = Weak
1-2 = Poor

Return ONLY valid JSON.

{
  "score": 8,
  "feedback": "One concise paragraph explaining the strengths and weaknesses."
}
`;

    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
      max_tokens: 250,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = safeParseJSON(
      completion.choices[0].message.content
    );

    if (!result)
      throw new Error("Invalid JSON");

    let score = Number(result.score);

    if (Number.isNaN(score))
      score = 5;

    score = Math.max(1, Math.min(10, Math.round(score)));

    return {
      score,
      feedback:
        result.feedback ||
        "The answer was evaluated successfully."
    };
  } catch (err) {
    console.error("AI Evaluation Failed:", err.message);

    // Smart Local Evaluation

    const words = answer
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const wordCount = words.length;
    let score = 5;
    let feedback = "";

    if (wordCount < 5) {
      score = 2;
      feedback =
        "The answer is too short. Try explaining your thought process with more detail.";
    }

    else if (wordCount < 15) {
      score = 4;
      feedback =
        "Your answer is relevant but lacks sufficient explanation and examples.";
    }

    else if (wordCount < 40) {
      score = 6;
      feedback =
        "Good answer, but adding practical examples would make it stronger.";
    }

    else if (wordCount < 80) {
      score = 7;
      feedback =
        "Good explanation with reasonable detail. Consider adding more technical depth.";
    }

    else if (wordCount < 150) {
      score = 8;
      feedback =
        "Strong answer with good explanation. Including measurable project outcomes could improve it further.";
    }

    else {
      score = 9;
      feedback =
        "Excellent detailed answer demonstrating good understanding and communication.";
    }

    // Bonus for technical keywords
    const technicalWords = [
      "react",
      "node",
      "express",
      "mongodb",
      "javascript",
      "typescript",
      "api",
      "rest",
      "jwt",
      "authentication",
      "authorization",
      "database",
      "performance",
      "optimization",
      "component",
      "hook",
      "state",
      "props",
      "css",
      "html",
      "async",
      "await",
      "promise",
      "git",
      "docker"
    ];

    let keywordMatches = 0;

    technicalWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(answer)) {
        keywordMatches++;
      }
    });

    if (keywordMatches >= 6)
      score++;

    if (keywordMatches >= 10)
      score++;

    score = Math.min(score, 10);

    // Penalize repeated words
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (
      wordCount > 40 &&
      uniqueWords.size < wordCount * 0.45
    ) {
      score--;
      feedback +=
        " Try avoiding repetitive wording.";
    }
    score = Math.max(score, 1);
    return {
      score,
      feedback,
    };
  }
};

// =====================================================
// Generate Final Interview Report
// =====================================================
const generateReport = async ({
  jobRole,
  qaList,
  skills = [],
}) => {
  try {
    const average =
      qaList.reduce((sum, q) => sum + (q.score || 0), 0) /
      Math.max(qaList.length, 1);

    const transcript = qaList
      .map(
        (qa, index) => `
Question ${index + 1}: ${qa.question}

Candidate Answer:
${qa.answer}

Score: ${qa.score}

Feedback:
${qa.feedback}
`
      )
      .join("\n\n");

    const prompt = `
You are an experienced Technical Hiring Manager.

Evaluate the following completed interview.

Job Role:
${jobRole}

Candidate Skills:
${skills.length ? skills.join(", ") : "General"}

Average Score:
${average.toFixed(1)}

Interview Transcript:

${transcript}

Recommendation Rules

Average >= 8.5
Strong Hire

Average >= 7
Hire

Average >= 5
Maybe

Below 5
No Hire

Return ONLY valid JSON.

{
  "totalScore": 8.2,
  "recommendation":"Hire",
  "strengths":[
      "...",
      "...",
      "..."
  ],
  "weaknesses":[
      "...",
      "...",
      "..."
  ],
  "suggestions":[
      "...",
      "...",
      "..."
  ],
  "detailedFeedback":"One professional summary."
}
`;

    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.3,
      response_format: {
        type: "json_object",
      },
      max_tokens: 900,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const report = safeParseJSON(
      completion.choices[0].message.content
    );

    if (!report)
      throw new Error("Invalid JSON");

    const validRecommendations = [
      "Strong Hire",
      "Hire",
      "Maybe",
      "No Hire",
    ];

    const recommendation = validRecommendations.includes(
      report.recommendation
    )
      ? report.recommendation
      : "Maybe";

    return {
      totalScore: Number(report.totalScore) || Number(average.toFixed(1)),
      recommendation,

      strengths:
        Array.isArray(report.strengths)
          ? report.strengths
          : [],

      weaknesses:
        Array.isArray(report.weaknesses)
          ? report.weaknesses
          : [],

      suggestions:
        Array.isArray(report.suggestions)
          ? report.suggestions
          : [],

      detailedFeedback:
        report.detailedFeedback ||
        "Interview completed successfully.",
    };
  } catch (err) {
    console.error("AI Report Failed:", err.message);

    // Local Fallback
    const average =
      qaList.reduce((sum, q) => sum + (q.score || 0), 0) /
      Math.max(qaList.length, 1);

    let recommendation = "No Hire";

    if (average >= 8.5)
      recommendation = "Strong Hire";

    else if (average >= 7)
      recommendation = "Hire";

    else if (average >= 5)
      recommendation = "Maybe";

    const strengths = [];

    if (average >= 8)
      strengths.push(
        "Strong technical understanding"
      );

    if (average >= 7)
      strengths.push(
        "Clear communication skills"
      );

    if (skills.length)
      strengths.push(
        `Relevant skills: ${skills.slice(0, 3).join(", ")}`
      );

    if (!strengths.length)
      strengths.push(
        "Completed the interview successfully"
      );

    const weaknesses = [];

    if (average < 7)
      weaknesses.push(
        "Needs deeper technical explanations"
      );

    if (average < 6)
      weaknesses.push(
        "Should provide more real-world examples"
      );

    if (average < 5)
      weaknesses.push(
        "Needs stronger problem-solving skills"
      );

    const suggestions = [
      "Practice explaining projects using the STAR method.",
      "Strengthen core programming fundamentals.",
      "Solve more coding and system design problems.",
    ];

    return {
      totalScore: Number(average.toFixed(1)),
      recommendation,
      strengths,
      weaknesses,
      suggestions,
      detailedFeedback: `The candidate completed ${qaList.length} interview question(s) with an average score of ${average.toFixed(
        1
      )}/10. Overall recommendation: ${recommendation}.`,
    };
  }
};

export default {
  generateQuestion,
  evaluateAnswer,
  generateReport,
};