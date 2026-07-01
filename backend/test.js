import fs from "fs";
import { parseResume, extractSkills } from "./services/parser.js";

async function test() {
    try {
        // Read PDF
        const buffer = fs.readFileSync("./Karan_Resume.pdf");

        // Extract text
        const text = await parseResume(buffer, "application/pdf");

        console.log("===== Resume Text =====");
        console.log(text);

        // Extract skills
        const skills = extractSkills(text);

        console.log("\n===== Skills =====");
        console.log(skills);

    } catch (err) {
        console.error(err);
    }
}

test();