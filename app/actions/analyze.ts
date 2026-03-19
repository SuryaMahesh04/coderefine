"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeBase } from "../../lib/vectorStore";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeCodebase(files: { filename: string, code: string }[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const formattedCode = files.map(f => `File: ${f.filename}\n---\n${f.code}\n---`).join('\n\n');

    // Agent 1: Security Auditor
    const securityPrompt = `
You are an expert Security Auditor. Analyze this code exclusively for security vulnerabilities.
Look for: Hardcoded secrets, injection flaws (SQL, command, XSS), insecure auth, data exposure, insecure references, etc.
Output strict JSON matching:
{
  "securityScore": number (0-100),
  "bugs": [
    { "severity": "critical" | "medium" | "low", "filename": "...", "line": number, "message": "...", "category": "Security" }
  ]
}
If no code detected, return { "securityScore": 0, "bugs": [] }.
CODE:
${formattedCode}
`;

    // Agent 2: Performance Optimizer
    const performancePrompt = `
You are an expert Performance Optimizer. Analyze this code exclusively for performance and efficiency.
Look for: O(N^2) loops, redundant renders, memory leaks, unoptimized queries, missing caching, heavy synchronous ops.
Output strict JSON matching:
{
  "performanceScore": number (0-100),
  "bugs": [
    { "severity": "critical" | "medium" | "low", "filename": "...", "line": number, "message": "...", "category": "Performance" }
  ]
}
If no code detected, return { "performanceScore": 0, "bugs": [] }.
CODE:
${formattedCode}
`;

    // Agent 3: Quality Reviewer
    const qualityPrompt = `
You are an expert Code Quality Reviewer. Analyze this code exclusively for readability, structure, and best practices.
Look for: Spaghetti code, lack of types, unused variables, magical numbers, lack of error handling, poor naming conventions.
Output strict JSON matching:
{
  "qualityScore": number (0-100),
  "bugs": [
    { "severity": "critical" | "medium" | "low", "filename": "...", "line": number, "message": "...", "category": "Quality" }
  ]
}
If no code detected, return { "qualityScore": 0, "bugs": [] }.
CODE:
${formattedCode}
`;

    // Run specialized agents in parallel
    const [secResult, perfResult, qualResult] = await Promise.all([
      model.generateContent({ contents: [{ role: "user", parts: [{ text: securityPrompt }] }], generationConfig: { responseMimeType: "application/json" } }),
      model.generateContent({ contents: [{ role: "user", parts: [{ text: performancePrompt }] }], generationConfig: { responseMimeType: "application/json" } }),
      model.generateContent({ contents: [{ role: "user", parts: [{ text: qualityPrompt }] }], generationConfig: { responseMimeType: "application/json" } })
    ]);

    let secData, perfData, qualData;
    try { secData = JSON.parse(secResult.response.text()); } catch(e) { secData = { securityScore: 50, bugs: []}; }
    try { perfData = JSON.parse(perfResult.response.text()); } catch(e) { perfData = { performanceScore: 50, bugs: []}; }
    try { qualData = JSON.parse(qualResult.response.text()); } catch(e) { qualData = { qualityScore: 50, bugs: []}; }

    // Combine bugs, capping total to prevent overwhelming the UI
    const combinedBugs = [...secData.bugs, ...perfData.bugs, ...qualData.bugs].slice(0, 15);

    // Agent 4: Synthesizer
    const synthesisPrompt = `
You are the Synthesizer. You take the outputs of three expert agents and format the final codebase report.

Inputs:
Security Score: ${secData.securityScore}
Performance Score: ${perfData.performanceScore}
Quality Score: ${qualData.qualityScore}

Combined Bugs Detected:
${JSON.stringify(combinedBugs, null, 2)}

INSTRUCTIONS:
Determine an "overallRating" (0-100) based on the inputs.
Determine "codeDetected" (boolean) - if the provided code snippet is just generic non-code text, return false. Otherwise true.
Return a valid JSON object matching this schema EXACTLY:
{
  "codeDetected": boolean,
  "security": number,
  "performance": number,
  "quality": number,
  "overallRating": number,
  "bugs": [
    {
      "severity": "critical" | "medium" | "low",
      "filename": "string",
      "line": number,
      "message": "string",
      "category": "Security" | "Performance" | "Quality"
    }
  ]
}

CODE TO DETERMINE IF IT IS REAL CODE:
${formattedCode}
`;

    const finalResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: synthesisPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    // Index code snippets into the Knowledge Base for later retrieval
    files.forEach(f => {
      knowledgeBase.add({
        id: `kb-${f.filename}`,
        content: f.code.slice(0, 1000), // Index first 1000 chars
        filePath: f.filename,
        metadata: { indexedAt: Date.now() }
      });
    });

    return JSON.parse(finalResult.response.text());
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
