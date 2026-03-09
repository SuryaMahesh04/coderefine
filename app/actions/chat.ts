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

INSTRUCTIONS:
1. Figure out if the user is just saying hello, asking a general question, or explicitly requesting a code modification.
2. **STRICT RULE ON INITIAL GREETINGS**: If the user just says "hi", "hello", or similar simple conversational greetings, you MUST ONLY reply with a friendly greeting. DO NOT perform an unsolicited code review. DO NOT list bugs, vulnerabilities, or performance issues. Wait for the user to ask for help with their code.
3. **STRICT RULE ON OFF-TOPIC/GENERAL QUESTIONS**: If the user asks a question that is NOT related to the project, folder, or code, you MUST ONLY answer their specific question. Do NOT mention the codebase, do not offer code reviews, and do not try to pivot the conversation to the code.
4. **CRITICAL RULE ON CHANGES**: If the user asks a conversational question, answer it in 'chat_response' and leave 'changes' empty. HOWEVER, if the user explicitly asks you to "fix bugs", "optimize", "improve", or "analyze" the code, you MUST IMMEDIATELY provide 'changes' and a 'planDocument'. Do NOT just talk about the issues in 'chat_response' and ask for permission. You MUST generate the plan and the code changes proactively.
5. **Generating the Improvement Plan & Changes**: When modifying or optimizing code:
   - **Strict Contextual Filtering**: If the user asks for a specific type of improvement (e.g., "improve security", "fix performance"), you MUST ONLY focus on that specific domain. Do NOT include other unrelated optimizations in the plan or changes.
   - **Generate a Professional Plan Document**: You MUST provide a highly detailed, professional "Improvement Plan." INSTEAD of putting this in the 'chat_response', you MUST return it in the 'planDocument' field.
     - The 'planDocument' content must be formatted in clean Markdown.
     - For every major change, explicitly state the **Issue**, the **Optimization/Fix**, and the **Impact** (e.g., "Improves Time Complexity from O(N^2) to O(N)" or "Resolves Critical SQL Injection vulnerability").
     - Include **Before** and **After** code snippet blocks to clearly illustrate what is changing and why.
     - The document should read like a formal audit report intended for a Senior Engineer.
   - **Optimization Rule**: NEVER simply delete a block of logic or a variable to "fix" a performance or security issue. 
   - **Preserve Intent**: Always rewrite the code to achieve the same result but with a more efficient algorithm or more secure pattern.
   - Provide the exact rewritten code for the 'changes' array so the client can apply them automatically upon user approval.
   - "line" must be a 1-indexed integer.
   - Your 'chat_response' should be very short, e.g., "I have generated a detailed professional improvement plan in your workspace. Please review the file and let me know whether to accept the code changes."
6. If the user asks to "run the code", just acknowledge it in 'chat_response' (the client will handle execution separately).

Return a valid JSON object matching this schema EXACTLY:
{
  "chat_response": "Your conversational reply to the user.",
  "planDocument": {
    "filename": "improvement_plan.md",
    "content": "Detailed markdown explaining your optimizations or fixes."
  },
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
