"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeCodebase(files: { filename: string, code: string }[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const formattedCode = files.map(f => `File: ${f.filename}\n---\n${f.code}\n---`).join('\n\n');

    const prompt = `
You are an expert enterprise code auditor. Your job is to analyze the following codebase
and provide a strict JSON report containing scores out of 100 for Security, Performance, Quality, and an Overall Rating,
along with a list of specific bugs or issues found across all files.

CURRENT CODEBASE:
${formattedCode}

INSTRUCTIONS:
Return a valid JSON object matching this schema EXACTLY:
{
  "security": number (0-100),
  "performance": number (0-100),
  "quality": number (0-100),
  "overallRating": number (0-100),
  "bugs": [
    {
      "severity": "critical" | "medium" | "low",
      "filename": "string (the name of the file where the bug exists)",
      "line": number,
      "message": "string briefly describing the issue",
      "category": "Security" | "Performance" | "Quality"
    }
  ]
}

ADDITIONAL RULES:
- **Logic Preservation**: If you find that the user has "fixed" an issue by simply deleting a large block of functional logic, penalize the "Quality" score harshly.
- **Intent**: A good solution optimizes the algorithm (e.g., O(N) instead of O(N^2)) while keeping the functional output the same.
- If the code is perfectly fine or empty, return 100 for scores and an empty bugs array.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    return {
      security: 0,
      performance: 0,
      quality: 0,
      overallRating: 0,
      bugs: [{ severity: "critical", filename: "System", line: 0, message: "AI Analysis Engine offline.", category: "System" }]
    };
  }
}
