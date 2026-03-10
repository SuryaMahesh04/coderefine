import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
    const { code, userMessage, context, mode = "plan", selectedModel = "agentic" } = await req.json();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendUpdate = (type: string, data: any) => {
                const chunk = `[${type}]${typeof data === 'string' ? data : JSON.stringify(data)}\n`;
                controller.enqueue(encoder.encode(chunk));
            };

            try {
                const proModelName = selectedModel === "flash" ? "gemini-2.0-flash" : "gemini-3-pro-preview";
                const flashModelName = selectedModel === "pro" ? "gemini-3-pro-preview" : "gemini-2.0-flash";

                const proModel = genAI.getGenerativeModel({ model: proModelName });
                const flashModel = genAI.getGenerativeModel({ model: flashModelName });

                // ── PLAN MODE ─────────────────────────────────────────────
                if (mode === "plan") {
                    sendUpdate("BOUNDARY", "Planning Phase");
                    sendUpdate("STEP", { name: "Analysis", status: "running", summary: "Scanning code for context..." });

                    // Build terminal context summary for the model
                    const terminalSummary = (() => {
                        const parts: string[] = [];
                        if (context?.analysis) {
                            const s = context.analysis.scores;
                            parts.push(`TERMINAL — Code Analysis Results:
- Security: ${s.security}/100, Performance: ${s.performance}/100, Quality: ${s.quality}/100, Overall: ${s.overallRating}/100
- Detected Issues (${context.analysis.bugs.length}):
${context.analysis.bugs.map((b: any) => `  • [${b.severity.toUpperCase()}] ${b.filename} Line ${b.line} — ${b.message}`).join('\n')}`);
                        }
                        if (context?.execution) {
                            parts.push(`TERMINAL — Last Code Execution:
- Exit Code: ${context.execution.exitCode}
- Output: ${context.execution.output || "(no output)"}
${context.execution.error ? `- Error: ${context.execution.error}` : ''}`);
                        }
                        return parts.length > 0 ? `\n\n${parts.join('\n\n')}` : '';
                    })();

                    const proPrompt = `You are Morph, an elite autonomous AI software engineering agent embedded in CodeRefine.
You have access to:
- The user's active code file(s)
- The terminal analysis results (security/performance/quality scores and detected bugs)
- The last code execution output (stdout, stderr, exit code)

═══════════════════════════════
USER REQUEST: "${userMessage}"
═══════════════════════════════

ACTIVE CODE:
${code}${terminalSummary}

═══════════════════════════════
YOUR CAPABILITIES — You can handle ANY of these task types:
═══════════════════════════════
1. **Fix terminal errors** → Read execution output, identify the crash/error, fix exact lines
2. **Fix analysis issues** → Read detected bugs/scores from terminal analysis, fix every flagged issue
3. **Improve scores** → Audit security, performance, quality and fix everything to score 90+
4. **Add new features** → Implement described functionality with production patterns
5. **Refactor / clean** → Restructure code, rename, remove dead code, improve readability
6. **Explain code** → Walk through what the code does, how it works, known risks
7. **Debug** → Trace through logic, identify root cause of described behavior
8. **Optimize** → Improve time/space complexity, reduce API calls, add caching
9. **Add types** → Add TypeScript types, fix any typing
10. **General questions** → Answer any engineering question using code context

═══════════════════════════════
EXECUTION PROTOCOL:
═══════════════════════════════

**Step 1 — UNDERSTAND**: Read the user's request carefully. Cross-reference with the code AND terminal context. If they say "fix terminal errors", look at the execution output. If they say "fix the issues", look at the analysis bugs. If they say "add a feature", understand the codebase first.

**Step 2 — PLAN YOUR REASONING**: Emit THOUGHT: lines as you work through the problem. Be very specific:
- THOUGHT: Reading the execution output — exit code 1, ReferenceError: db is not defined on line 12.
- THOUGHT: This means the db import is missing. Need to add import and check all usages.
- THOUGHT: Also seeing 3 critical security bugs in terminal analysis — SQL injection on line 8, hardcoded API key on line 3.
- THOUGHT: I will fix both the crash and the security issues together.

**Step 3 — SHOW PROGRESS**: Emit STEP: lines for each phase of work:
- STEP: {"name": "Reading context", "status": "running", "summary": "Scanning code and terminal output..."}
- STEP: {"name": "Reading context", "status": "done", "summary": "Found crash on line 12 + 3 security issues."}
- STEP: {"name": "Fixing runtime error", "status": "running", "summary": "Resolving ReferenceError: db is not defined..."}
- STEP: {"name": "Fixing runtime error", "status": "done", "summary": "Added missing import and null guard."}
Use descriptive step names relevant to what you're actually doing.

**Step 4 — RESPOND**: Stream your response via CHUNK: lines with rich Markdown.
- Lead with what you found and what you're going to do
- List each specific fix with the exact line/function affected
- Use code blocks for snippets when helpful
- Be concise but complete

**Step 5 — FLOW ANALYSIS (CRITICAL)**: If the user asks to analyze, audit, review, or fix a "flow", "workspace", "project" or any feature spanning multiple files (e.g. "analyze the auth flow"), you MUST identify the relevant files from the context and emit this signal immediately after your THOUGHT:
- ANALYZE_WORKSPACE: {"files": ["file1.ts", "file2.tsx", "file3.js"]}
Failure to emit this signal when multiple files are relevant is a violation of the protocol.

**Step 6 — PLAN**: If the task involves code changes (set intendsToChange: true), generate a detailed planDocument:
- Cover EVERY fix, change, and improvement needed
- Be specific: "Function X on line Y — change Z to W because..."
- Include ALL issues from terminal analysis if relevant
- Plan must be sufficient for a junior engineer to implement perfectly

═══════════════════════════════
STRICT OUTPUT FORMAT — Every line must start with one of:
═══════════════════════════════
THOUGHT: [one line of internal reasoning]
STEP: {"name": "...", "status": "running|done", "summary": "..."}
CHUNK: [one line of markdown response — use \\n between CHUNK lines for spacing]
ANALYZE_WORKSPACE: {"files": ["file1.ts", "file2.tsx"]}
FINAL: {"planDocument": {"filename": "plan.md", "content": "..."}, "intendsToChange": true|false, "affectedFiles": ["file1.ts", "file2.tsx"]}

Rules:
- NEVER mix content — each line must start with exactly one prefix
- ALWAYS emit a FINAL line at the end
- If NO code changes needed, set intendsToChange: false, omit planDocument, and affectedFiles should be []
- If code changes needed, planDocument content must be a complete Markdown plan
- ONLY list files you intend to modify in affectedFiles. Do not list files you only read.
- Plan filename should describe the task, e.g. "fix_runtime_errors.md", "add_auth_feature.md"
`;


                    const resultStream = await proModel.generateContentStream({
                        contents: [{ role: "user", parts: [{ text: proPrompt }] }],
                    });

                    let buffer = "";
                    let currentSection: "THOUGHT" | "CHUNK" | "STEP" | "FINAL" | "ANALYZE_WORKSPACE" | null = null;
                    let finalAccumulator = ""; // accumulates multi-line FINAL JSON
                    let analyzeAccumulator = ""; // accumulates multi-line ANALYZE_WORKSPACE JSON

                    // Helper to flush analyze workspace
                    const flushAnalyzeWorkspace = () => {
                        if (analyzeAccumulator.trim()) {
                            try {
                                sendUpdate("ANALYZE_WORKSPACE", JSON.parse(analyzeAccumulator));
                            } catch (e) {
                                console.error("Failed to parse multi-line ANALYZE_WORKSPACE JSON:", analyzeAccumulator);
                            }
                            analyzeAccumulator = "";
                        }
                    };

                    for await (const chunk of resultStream.stream) {
                        const chunkText = chunk.text();
                        buffer += chunkText;

                        const lines = buffer.split('\n');
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (line.startsWith("THOUGHT:")) {
                                flushAnalyzeWorkspace();
                                currentSection = "THOUGHT";
                                finalAccumulator = "";
                                sendUpdate("THOUGHT", line.replace("THOUGHT:", "").trim() + "\n");
                            } else if (line.startsWith("STEP:")) {
                                flushAnalyzeWorkspace();
                                currentSection = "STEP";
                                finalAccumulator = "";
                                try {
                                    sendUpdate("STEP", JSON.parse(line.replace("STEP:", "").trim()));
                                } catch (e) { }
                            } else if (line.startsWith("CHUNK:")) {
                                flushAnalyzeWorkspace();
                                currentSection = "CHUNK";
                                finalAccumulator = "";
                                sendUpdate("CHUNK", line.replace("CHUNK:", "").trim() + "\n");
                            } else if (line.startsWith("ANALYZE_WORKSPACE:")) {
                                currentSection = "ANALYZE_WORKSPACE";
                                finalAccumulator = "";
                                analyzeAccumulator = line.replace("ANALYZE_WORKSPACE:", "").trim();
                                // Try inline parse right away just in case it is one line
                                flushAnalyzeWorkspace();
                            } else if (line.startsWith("FINAL:")) {
                                // Start accumulating — the JSON may span multiple lines
                                currentSection = "FINAL";

                                finalAccumulator = line.replace("FINAL:", "").trim();
                            } else if (currentSection === "FINAL") {
                                // Keep accumulating FINAL content
                                finalAccumulator += "\n" + line;
                            } else if (currentSection === "ANALYZE_WORKSPACE") {
                                analyzeAccumulator += "\n" + line;
                                // Attempt to parse aggressively so the terminal pops up ASAP
                                if (analyzeAccumulator.trim().endsWith("}")) {
                                    try {
                                        JSON.parse(analyzeAccumulator); // test parse
                                        flushAnalyzeWorkspace(); // if it works, flush it!
                                    } catch (e) {} 
                                }
                            } else if (currentSection === "CHUNK") {
                                sendUpdate("CHUNK", line.trim() + "\n");
                            } else if (currentSection === "THOUGHT") {
                                sendUpdate("THOUGHT", line.trim() + "\n");
                            }
                        }
                    }

                    // Process remaining buffer
                    if (buffer) {
                        if (buffer.startsWith("THOUGHT:")) sendUpdate("THOUGHT", buffer.replace("THOUGHT:", "").trim() + "\n");
                        else if (buffer.startsWith("CHUNK:")) sendUpdate("CHUNK", buffer.replace("CHUNK:", "").trim() + "\n");
                        else if (buffer.startsWith("STEP:")) {
                            try { sendUpdate("STEP", JSON.parse(buffer.replace("STEP:", "").trim())); } catch (e) { }
                        } else if (buffer.startsWith("ANALYZE_WORKSPACE:")) {
                            try { sendUpdate("ANALYZE_WORKSPACE", JSON.parse(buffer.replace("ANALYZE_WORKSPACE:", "").trim())); } catch (e) { }
                        } else if (buffer.startsWith("FINAL:")) {
                            finalAccumulator = buffer.replace("FINAL:", "").trim();
                        } else if (currentSection === "FINAL") {
                            finalAccumulator += "\n" + buffer;
                        } else if (currentSection === "CHUNK") {
                            sendUpdate("CHUNK", buffer.trim() + "\n");
                        } else if (currentSection === "ANALYZE_WORKSPACE") {
                             try { sendUpdate("ANALYZE_WORKSPACE", JSON.parse(buffer.trim())); } catch (e) { }
                        }
                    }

                    // Parse accumulated FINAL once the stream is complete
                    if (finalAccumulator) {
                        try {
                            const finalData = JSON.parse(finalAccumulator);
                            sendUpdate("FINAL", {
                                chat_response: "",
                                planDocument: finalData.planDocument,
                                intendsToChange: finalData.intendsToChange,
                                affectedFiles: finalData.affectedFiles || [],
                                changes: []
                            });
                        } catch (e) {
                            // JSON parse failed — the model didn't follow the format.
                            // Send a safe FINAL with no plan so the frontend doesn't hang.
                            console.error("Failed to parse FINAL JSON:", e, "\nRaw:", finalAccumulator.substring(0, 200));
                            sendUpdate("FINAL", { chat_response: "", intendsToChange: false, changes: [] });
                        }
                    } else {
                        // No FINAL at all — ensure the frontend still resolves
                        sendUpdate("FINAL", { chat_response: "", intendsToChange: false, changes: [] });
                    }

                }

                // ── EXECUTE MODE ───────────────────────────────────────────
                else if (mode === "execute") {
                    sendUpdate("BOUNDARY", "Execution Phase");
                    sendUpdate("THOUGHT", `Starting execution phase. Rewriting ${context.targetFile} based on the plan.`);

                    const rewritePrompt = `You are a SENIOR SOFTWARE ENGINEER doing a production-grade code review and rewrite. Your goal is to produce the HIGHEST QUALITY version of this code that will score 90+ on Security, Performance, and Code Quality audits.

PLAN TO IMPLEMENT:
${context.plan}

ORIGINAL FILE:
${code}

YOUR JOB (in this exact order):
1. Apply every fix described in the plan.
2. ALSO proactively fix ALL of the following you spot in the code, even if NOT in the plan:
   - **Null/undefined safety**: Add null checks, optional chaining, or guard clauses before accessing nested properties.
   - **Error handling**: Every async function must have try/catch with meaningful error messages.
   - **Security**: Remove hardcoded secrets, prevent injection attacks, validate all inputs.
   - **Memory leaks**: Clear intervals/timeouts, close connections, avoid accumulating state.
   - **Idempotency**: If a function can be retried, ensure it doesn't duplicate side effects.
   - **Dead code**: Remove commented-out blocks and unreachable code.
   - **Type safety**: Replace \`any\` types with proper types where obvious.
   - **Resource cleanup**: Ensure connections, streams, and handles are properly closed.
3. DO NOT remove working business logic — only improve it.
4. The rewritten code must be complete, production-ready, and have zero obvious bugs.

OUTPUT RULES:
- Do NOT output any explanation, markdown fences, or code blocks.
- Start with EXACTLY: REWRITTEN_FILE:
- Then output the entire rewritten file contents and nothing else.

Start now:`;

                    const rewriteStream = await flashModel.generateContentStream({
                        contents: [{ role: "user", parts: [{ text: rewritePrompt }] }],
                    });

                    let fullOutput = "";
                    for await (const chunk of rewriteStream.stream) {
                        fullOutput += chunk.text();
                    }

                    // Extract file content after the REWRITTEN_FILE: marker
                    const marker = "REWRITTEN_FILE:";
                    const markerIdx = fullOutput.indexOf(marker);
                    let rewrittenCode = markerIdx !== -1
                        ? fullOutput.slice(markerIdx + marker.length).trimStart()
                        : fullOutput.trim();

                    // Strip accidental markdown fencing
                    rewrittenCode = rewrittenCode
                        .replace(/^```[\w]*\r?\n?/, "")
                        .replace(/\r?\n?```$/, "")
                        .trim();

                    sendUpdate("FINAL", { rewrittenCode, changes: [] });
                }

                // ── POST-EXECUTION REPORT EXPLANATION ──────────────────────
                else if (mode === "execute_summary") {
                    sendUpdate("BOUNDARY", "Generating Summary");

                    const explainSubject = `REWRITTEN FILES:\n${(context.targetFiles || []).map((f: any) => `<file path="${f.filename}">\n${f.code}\n</file>`).join("\n\n")}`;

                    const explainPrompt = `You are a senior code reviewer. You just applied the following plan to a codebase.

PLAN THAT WAS APPLIED:
${context.plan}

${explainSubject}

Your job: Write a concise, developer-friendly summary of EXACTLY what changed. Format:
- Use a header: "## ✅ Changes Applied"
- List each change as a bullet: what was wrong, what you changed, and why it matters
- Use inline code for identifiers
- End with a one-liner health improvement note

Be specific. Do not say "I applied the plan". Name the actual files, functions, lines, and patterns you changed.`;

                    const explainStream = await proModel.generateContentStream({
                        contents: [{ role: "user", parts: [{ text: explainPrompt }] }],
                    });

                    let explainBuffer = "";
                    for await (const chunk of explainStream.stream) {
                        explainBuffer += chunk.text();
                        // Stream explanation line by line
                        const lines = explainBuffer.split('\n');
                        explainBuffer = lines.pop() || "";
                        for (const line of lines) {
                            sendUpdate("EXPLAIN_CHUNK", line + "\n");
                        }
                    }
                    if (explainBuffer) {
                        sendUpdate("EXPLAIN_CHUNK", explainBuffer + "\n");
                    }

                    sendUpdate("STEP", { name: "Generating change summary", status: "done", summary: "Summary complete." });
                    sendUpdate("EXPLAIN_DONE", "true");
                } // This ends the `else if (mode === "execute") {` block
            } // This ends the master `try {` block
            catch (error: any) {
                console.error("Stream Error:", error);
                sendUpdate("ERROR", error.message || "An error occurred in the agentic loop");
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
