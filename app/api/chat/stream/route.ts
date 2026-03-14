import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

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

                // ── EXECUTE MODE (ANTIGRAVITY UPGRADE) ──────────────────────
                else if (mode === "execute") {
                    sendUpdate("BOUNDARY", "Execution Phase");
                    sendUpdate("THOUGHT", "Entering autonomous execution loop. I will now use my tools to implement the plan step-by-step.");

                    // Define the tools available to the AI
                    const tools: any[] = [
                        {
                            functionDeclarations: [
                                {
                                    name: "readFile",
                                    description: "Read the full content of a file from the workspace.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            path: { type: "STRING", description: "Relative path to the file." }
                                        },
                                        required: ["path"]
                                    }
                                },
                                {
                                    name: "writeFile",
                                    description: "Write the full content to a file (overwrites existing).",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            path: { type: "STRING", description: "Relative path to the file." },
                                            content: { type: "STRING", description: "Full file content." }
                                        },
                                        required: ["path", "content"]
                                    }
                                },
                                {
                                    name: "replaceContent",
                                    description: "Replace a specific block of text in a file with new content. Use this for targeted edits.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            path: { type: "STRING", description: "Relative path to the file." },
                                            target: { type: "STRING", description: "The exact string to replace." },
                                            replacement: { type: "STRING", description: "The new content." }
                                        },
                                        required: ["path", "target", "replacement"]
                                    }
                                },
                                {
                                    name: "runCommand",
                                    description: "Run a shell command in the workspace and see the output.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            command: { type: "STRING", description: "The shell command to run." }
                                        },
                                        required: ["command"]
                                    }
                                },
                                {
                                    name: "finishTask",
                                    description: "Signal that the task is complete and all changes are applied.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            summary: { type: "STRING", description: "Brief summary of what was accomplished." }
                                        },
                                        required: ["summary"]
                                    }
                                }
                            ]
                        }
                    ];

                    const agentModel = genAI.getGenerativeModel({ model: flashModelName, tools });
                    const chat = agentModel.startChat({
                        history: [
                            {
                                role: "user",
                                parts: [{ text: `You are now in AUTONOMOUS EXECUTION MODE.
Your task: Implement the following plan in the codebase.

PLAN:
${context.plan}

RULES:
1. Work step-by-step.
2. Use 'readFile' before editing if you're unsure of the current content.
3. Use 'replaceContent' for targeted fixes when possible.
4. After making changes, use 'runCommand' (like 'npm run build' or 'next lint') to verify your work.
5. If a command fails, READ the error and FIX it immediately.
6. When everything is perfect and verified, call 'finishTask'.

Start by applying the first part of the plan now.` }]
                            }
                        ]
                    });

                    let loopCount = 0;
                    const MAX_LOOPS = 15;

                    while (loopCount < MAX_LOOPS) {
                        loopCount++;
                        const msgResult = await chat.sendMessage("");
                        const call = msgResult.response.candidates?.[0].content.parts.find(p => p.functionCall);

                        if (!call?.functionCall) {
                            // The AI didn't call a tool, maybe it just responded with text. 
                            // We should capture any thoughts and nudge it back to tools.
                            const text = msgResult.response.text();
                            if (text) sendUpdate("THOUGHT", text);
                            // If it's not calling a tool and hasn't finished, we might need to nudge it or break.
                            continue;
                        }

                        const { name, args } = call.functionCall as any;
                        sendUpdate("STEP", { name: `${name}(${args.path || args.command || ''})`, status: "running", summary: `Executing ${name}...` });

                        let toolResult: any;
                        try {
                            switch (name) {
                                case "readFile": {
                                    const fullPath = path.join(process.cwd(), args.path);
                                    const content = await fs.readFile(fullPath, "utf-8");
                                    toolResult = { content };
                                    break;
                                }
                                case "writeFile": {
                                    const fullPath = path.join(process.cwd(), args.path);
                                    await fs.writeFile(fullPath, args.content, "utf-8");
                                    sendUpdate("FINAL", { rewrittenCode: args.content, targetFile: args.path }); // Notify frontend of update
                                    toolResult = { success: true };
                                    break;
                                }
                                case "replaceContent": {
                                    const fullPath = path.join(process.cwd(), args.path);
                                    const content = await fs.readFile(fullPath, "utf-8");
                                    const newContent = content.replace(args.target, args.replacement);
                                    await fs.writeFile(fullPath, newContent, "utf-8");
                                    sendUpdate("FINAL", { rewrittenCode: newContent, targetFile: args.path }); // Notify frontend of update
                                    toolResult = { success: true };
                                    break;
                                }
                                case "runCommand": {
                                    try {
                                        const { stdout, stderr } = await execPromise(args.command, { cwd: process.cwd() });
                                        toolResult = { stdout: stdout.slice(0, 5000), stderr: stderr.slice(0, 5000) };
                                    } catch (cmdErr: any) {
                                        toolResult = { error: cmdErr.message, stdout: cmdErr.stdout, stderr: cmdErr.stderr };
                                    }
                                    break;
                                }
                                case "finishTask": {
                                    sendUpdate("STEP", { name: "finishTask", status: "done", summary: args.summary });
                                    loopCount = MAX_LOOPS; // Break the loop
                                    toolResult = { status: "task_completed" };
                                    break;
                                }
                                default:
                                    toolResult = { error: "Unknown tool name" };
                            }
                        } catch (err: any) {
                            toolResult = { error: err.message };
                        }

                        // Feed the tool result back to the AI
                        const response = await chat.sendMessage([{
                            functionResponse: {
                                name,
                                response: toolResult
                            }
                        }]);

                        sendUpdate("STEP", { name: `${name}`, status: "done", summary: "Operation complete." });
                        
                        if (name === "finishTask") break;
                    }
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
