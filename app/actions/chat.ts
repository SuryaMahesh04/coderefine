"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeCode(code: string, userMessage: string, context?: { analysis?: any, execution?: any }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    let contextInfo = "";
    if (context?.analysis) {
      contextInfo += `\nCURRENT CODE ANALYTICS OUTPUT:\n${JSON.stringify(context.analysis, null, 2)}\n`;
    }
    if (context?.execution) {
      contextInfo += `\nLAST CODE EXECUTION OUTPUT:\n${JSON.stringify(context.execution, null, 2)}\n`;
    }

    const prompt = `
You are CodeRefine (Morph), a proactive senior AI software engineer.
Your personality is professional, technically deep, and highly helpful.
When interacting with the user:
1. **Explain your rationale**: Always explain *what* you are changing and *why* it improves the code. Use technical terms correctly (e.g., "I'm optimizing this O(N^2) loop to O(N) using a Map for linear lookups").
2. **Be proactive**: If you see a security risk or performance bottleneck that the user didn't mention, point it out and offer a fix.
3. **Be clear**: Use bullet points if you are making multiple changes.

The user is viewing their code in an editor and sent you a chat message.
${contextInfo}
USER MESSAGE: "${userMessage}"

CURRENT CODE:
${code}

INSTRUCTIONS:
1. Figure out if the user wants information or if they want to modify their code.
2. If they want to modify the code (e.g., fix bugs, optimize, secure):
   - **Optimization Rule**: NEVER simply delete a block of logic or a variable to "fix" a performance or security issue. 
   - **Preserve Intent**: Always rewrite the code to achieve the same result but with a more efficient algorithm (e.g., use a Map/Set for O(1) lookups instead of O(N^2) loops) or more secure pattern (e.g., use process.env for secrets).
   - Provide the rewritten code for that exact line (without line breaks unless necessary).
   - "line" must be a 1-indexed integer.
3. If the user asks to "run the code", just acknowledge it in \`chat_response\` (the client will handle execution separately).
4. If they just ask a question, answer it in \`chat_response\` and leave \`changes\` empty.

Return a valid JSON object matching this schema EXACTLY:
{
  "chat_response": "Your conversational reply to the user, explaining what you found and what fixes you are applying.",
  "changes": [
    {
      "line": 12,
      "original": "exact text of the line to replace",
      "rewritten": "the new text to insert at this line",
      "reason": "short explanation, e.g., SQL injection fix",
      "category": "bug" | "security" | "performance" | "quality"
    }
  ]
}
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
    console.error("Gemini Error:", error);
    return {
      chat_response: "Sorry, I am having trouble connecting to the AI brain right now. Please check your GEMINI_API_KEY.",
      changes: []
    };
  }
}
