"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeCode(code: string, userMessage: string, context?: { analysis?: any, execution?: any }) {
  try {
    const proModel = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
    const flashModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let contextInfo = "";
    if (context?.analysis) {
      contextInfo += `\nCURRENT CODE ANALYTICS OUTPUT:\n${JSON.stringify(context.analysis, null, 2)}\n`;
    }
    if (context?.execution) {
      contextInfo += `\nLAST CODE EXECUTION OUTPUT:\n${JSON.stringify(context.execution, null, 2)}\n`;
    }

    // Step 1: Get Insights and Chat Response from Pro Model
    const proPrompt = `
You are CodeRefine (Morph), a senior AI engineer.
Analyze the user's request and the code. 
Provide a thorough conversational response. 
If the user wants to change code, briefly describe WHAT exactly needs to be changed and WHY, but do NOT provide the line-by-line diff codes here.

USER MESSAGE: "${userMessage}"
${contextInfo}
CURRENT CODE:
${code}

Return a JSON with:
{
  "chat_response": "Deep analysis and friendly engineer response.",
  "intendsToChange": boolean (true if the user explicitly asked for code modification)
}
`;

    const proResult = await proModel.generateContent({
      contents: [{ role: "user", parts: [{ text: proPrompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    const proData = JSON.parse(proResult.response.text());
    let finalChanges: any[] = [];

    // Step 2: If code changes are needed, use Flash for the "Rewrites"
    if (proData.intendsToChange) {
      const flashPrompt = `
You are a fast code rewrite engine. 
Based on the analysis: "${proData.chat_response}", generate the exact line-by-line code changes needed for the following source.

SOURCE CODE:
${code}

Return valid JSON:
{
  "changes": [
    {
      "line": number,
      "original": "exact original line",
      "rewritten": "new line",
      "reason": "why",
      "category": "bug" | "security" | "performance" | "quality"
    }
  ]
}
`;

      const flashResult = await flashModel.generateContent({
        contents: [{ role: "user", parts: [{ text: flashPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      });

      const flashData = JSON.parse(flashResult.response.text());
      finalChanges = flashData.changes || [];
    }

    return {
      chat_response: proData.chat_response,
      changes: finalChanges
    };

  } catch (error: any) {
    console.error("Multi-Model Gemini Error:", error);
    return {
      chat_response: "I encountered an error while orchestrating the AI models. Please check your implementation.",
      changes: []
    };
  }
}
