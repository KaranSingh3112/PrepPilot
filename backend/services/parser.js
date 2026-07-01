import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth"
import ApiError from "../utils/ApiError.js";

const parseResume = async (buffer, mimeType) => {
    try {
        if (mimeType === 'application/pdf') {
            const data = await pdfParse(buffer);
            return data.text;
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else {
            throw new ApiError(400, 'Unsupported file type. Use PDF or DOCX.');
        }
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(400, 'Failed to parse resume file');
    }
};


const extractSkills = (text) => {
    // A curated keyword list - extend as needed
    const SKILL_KEYWORDS = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Next.js',
        'MongoDB', 'MySQL', 'PostgreSQL', 'SQL', 'Redis', 'HTML', 'CSS',
        'Tailwind', 'Sass', 'Redux', 'Vue', 'Angular', 'Python', 'Django',
        'Flask', 'FastAPI', 'Java', 'Spring', 'C++', 'C#', '.NET', 'PHP',
        'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'Docker', 'Kubernetes',
        'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'CI/CD', 'Jenkins',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
        'NLP', 'Data Analysis', 'Power BI', 'Tableau', 'Excel', 'Figma',
        'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum',
    ];

    const lowerText = text.toLowerCase();
    const found = new Set();

    SKILL_KEYWORDS.forEach((skill) => {
        // Word boundary check would be ideal, but simple includes() works.
        if (lowerText.includes(skill.toLowerCase())) {
          found.add(skill);
        }
        // const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");

        // if (regex.test(text)) {
        //     found.add(skill);
        // }
    });

    return [...found];
};

export default {parseResume, extractSkills}