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

    // Step 1: Get Insights, Plan, and Chat Response from Pro Model
    const systemPrompt = "You are Loom AI (Morph), a senior AI engineer.";
    const proPrompt = `
${systemPrompt}
Analyze the user's request and the code.

USER MESSAGE: "${userMessage}"
${contextInfo}
CURRENT CODE:
${code}

INSTRUCTIONS:
1. Figure out if the user is just saying hello, asking a general question, or explicitly requesting a code modification.
2. **STRICT RULE ON INITIAL GREETINGS**: If the user just says "hi", "hello", or similar simple conversational greetings, you MUST ONLY reply with a friendly greeting and empty steps/thoughts.
3. **CRITICAL RULE ON CHANGES**: If the user asks a conversational question, answer it in 'chat_response' and leave 'planDocument' null.
4. HOWEVER, if the user explicitly asks you to "fix bugs", "optimize", "improve", or "analyze" the code:
   - Provide a professional "Improvement Plan" in Markdown in the 'planDocument' field.
   - Set 'intendsToChange' to true.
   - Your 'chat_response' should be short, e.g., "I have generated a detailed professional improvement plan. Please review it."

Return a JSON with:
{
  "thoughts": ["step 1 reasoning", "step 2 reasoning"], 
  "steps": [
    {"name": "Step Name", "status": "done" | "running" | "pending", "summary": "Brief summary"}
  ],
  "chat_response": "string",
  "planDocument": {
    "filename": "improvement_plan.md",
    "content": "markdown_content"
  } | null,
  "intendsToChange": boolean
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
      // Update steps to show we are generating code
      if (proData.steps) {
        proData.steps.push({ name: "Code Synthesis", status: "running", summary: "Generating precise line-by-line diffs..." });
      }

      const flashPrompt = `
You are a fast code rewrite engine. 
Based on this plan: "${proData.planDocument?.content || 'Improve the code'}", generate the exact line-by-line code changes.

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

      // Mark synthesis as done
      if (proData.steps) {
        const synthStep = proData.steps.find((s: any) => s.name === "Code Synthesis");
        if (synthStep) synthStep.status = "done";
      }
    }

    return {
      chat_response: proData.chat_response,
      thoughts: proData.thoughts || [],
      steps: proData.steps || [],
      planDocument: proData.planDocument,
      changes: finalChanges
    };

  } catch (error: any) {
    console.error("Multi-Model Gemini Error:", error);
    return {
      chat_response: "I encountered an error while orchestrating the AI models. Please check your implementation.",
      thoughts: ["Model connection failed"],
      steps: [{ name: "AI Orchestration", status: "pending", summary: "Failed to connect to Gemini API" }],
      changes: []
    };
  }
}
