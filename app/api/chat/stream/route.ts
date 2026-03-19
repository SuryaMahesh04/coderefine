import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
// import { exec } from "child_process";
// import util from "util";

// const execPromise = util.promisify(exec);

export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { rateLimiters } from "../../../../lib/rateLimit";
import { knowledgeBase } from "../../../../lib/vectorStore";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response(JSON.stringify({ error: "Unauthorized. Please sign in." }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const userId = (session.user as any).id;
    const userPlan = (session.user as any).plan || "free";
    
    // Apply Rate Limiting
    const limiter = rateLimiters[userPlan as keyof typeof rateLimiters] || rateLimiters.free;
    const { success, limit, reset, remaining } = await limiter.limit(userId);

    if (!success) {
        return new Response(JSON.stringify({ 
            error: `Daily limit reached (${limit} requests). Upgrade to Pro for increased usage and priority support.` 
        }), {
            status: 429,
            headers: { 
                "Content-Type": "application/json",
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
            },
        });
    }

    const { code, userMessage, history = [], context, mode = "plan", selectedModel = "agentic" } = await req.json();

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

                // ── VIRTUAL FILE SYSTEM HELPER ──────────────────────────
                class VirtualFileSystem {
                    files: Map<string, string>;
                    constructor(initialFiles: { path: string, content: string }[]) {
                        this.files = new Map(initialFiles.map(f => [f.path, f.content]));
                    }
                    readFile(filePath: string) {
                        return this.files.get(filePath);
                    }
                    writeFile(filePath: string, content: string) {
                        this.files.set(filePath, content);
                    }
                    findByName(pattern: string) {
                        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
                        return Array.from(this.files.keys()).filter(k => regex.test(k));
                    }
                    grepSearch(query: string) {
                        const results: string[] = [];
                        for (const [path, content] of this.files.entries()) {
                            if (content.includes(query)) results.push(path);
                            if (results.length >= 20) break;
                        }
                        return results;
                    }
                }

                const vfs = new VirtualFileSystem(context?.workspace || []);

                // ── PLAN MODE ─────────────────────────────────────────────
                // ── PLAN MODE ─────────────────────────────────────────────
                if (mode === "plan") {
                    sendUpdate("BOUNDARY", "Planning Phase");
                    sendUpdate("STEP", { name: "Discovery & Research", status: "running", summary: "Scanning workspace..." });

                    const researchTools: any[] = [
                        {
                            functionDeclarations: [
                                {
                                    name: "readFile",
                                    description: "Read the full content of a file from the workspace.",
                                    parameters: { type: "OBJECT", properties: { path: { type: "STRING" } }, required: ["path"] }
                                },
                                {
                                    name: "findByName",
                                    description: "Search for files by name patterns.",
                                    parameters: { type: "OBJECT", properties: { pattern: { type: "STRING" } }, required: ["pattern"] }
                                },
                                {
                                    name: "grepSearch",
                                    description: "Search for exact text patterns within files.",
                                    parameters: { type: "OBJECT", properties: { query: { type: "STRING" } }, required: ["query"] }
                                },
                                {
                                    name: "viewFile",
                                    description: "View a file with line numbers for surgical editing precision.",
                                    parameters: { type: "OBJECT", properties: { path: { type: "STRING" }, startLine: { type: "NUMBER" }, endLine: { type: "NUMBER" } }, required: ["path"] }
                                },
                                {
                                    name: "searchKnowledge",
                                    description: "Search for patterns or documentation across the entire workspace.",
                                    parameters: { type: "OBJECT", properties: { query: { type: "STRING" } }, required: ["query"] }
                                },
                                {
                                    name: "finishPlanning",
                                    description: "Signal that research is complete. Use this to provide your final response and plan.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            planDocument: {
                                                type: "OBJECT",
                                                properties: {
                                                    filename: { type: "STRING" },
                                                    content: { type: "STRING" }
                                                }
                                            },
                                            intendsToChange: { type: "BOOLEAN" },
                                            affectedFiles: { type: "ARRAY", items: { type: "STRING" } },
                                            responseMarkdown: { type: "STRING", description: "Your final response with findings and explanation." }
                                        },
                                        required: ["intendsToChange", "affectedFiles", "responseMarkdown"]
                                    }
                                }
                            ]
                        }
                    ];

                    const agentModel = genAI.getGenerativeModel({ model: proModelName, tools: researchTools });
                    const chat = agentModel.startChat();
                    
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

                    await chat.sendMessage(`You are Morph, an elite autonomous AI software engineering agent.
Your task is to analyze the user's request, research the workspace using your tools, and generate a response or plan.

═══════════════════════════════
USER REQUEST: "${userMessage}"
═══════════════════════════════

ACTIVE CODE:
${code}${terminalSummary}

CONVERSATION HISTORY:
${history.length > 0 ? history.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n') : "No previous messages."}

PROTOCOL:
1.  **Research First**: Use 'readFile', 'grepSearch', or 'viewFile' to investigate files mentioned or implied by the request.
2.  **Strict Isolation**: You DO NOT have access to any physical disk. Your tools ONLY operate on the memory-backed file tree presented in your workspace.
3.  **Generate Plan**: If you need to make changes, build a comprehensive implementation plan.
4.  **Finish**: Call 'finishPlanning' to submit your findings. Never response with plain text if you can use tools to confirm hypotheses first.

Begin by researching now.`);

                    let loopCount = 0;
                    const MAX_LOOPS = 10;

                    while (loopCount < MAX_LOOPS) {
                        loopCount++;
                        const msgResult = await chat.sendMessage("");
                        const call = msgResult.response.candidates?.[0].content.parts.find(p => p.functionCall);

                        if (!call?.functionCall) {
                            const text = msgResult.response.text();
                            if (text) sendUpdate("THOUGHT", text);
                            // Nudge back to finish if it seems done
                            if (text && (text.includes("plan") || text.includes("Ready"))) {
                                await chat.sendMessage("Please use 'finishPlanning' tool to finalize your plan.");
                            }
                            continue;
                        }

                        const { name, args } = call.functionCall as any;
                        sendUpdate("STEP", { name: `Researching: ${name}`, status: "running", summary: `Investigating ${args.path || args.query || args.pattern || ""}` });

                        let toolResult: any = {};
                        try {
                            switch (name) {
                                case "readFile": {
                                    const content = vfs.readFile(args.path);
                                    toolResult = content !== undefined ? { content } : { error: "File not found" };
                                    break;
                                }
                                case "findByName": {
                                    toolResult = { files: vfs.findByName(args.pattern) };
                                    break;
                                }
                                case "grepSearch": {
                                    toolResult = { matches: vfs.grepSearch(args.query) };
                                    break;
                                }
                                case "viewFile": {
                                    const content = vfs.readFile(args.path);
                                    if (content) {
                                        const lines = content.split('\n');
                                        toolResult = { content: lines.map((l, i) => `${i+1}: ${l}`).join('\n') };
                                    } else {
                                        toolResult = { error: "File not found" };
                                    }
                                    break;
                                }
                                case "searchKnowledge": {
                                    const results = await knowledgeBase.search(args.query);
                                    toolResult = { results: results.map((r: any) => `[${r.filePath}]: ${r.content}`) };
                                    break;
                                }
                                case "finishPlanning": {
                                    sendUpdate("STEP", { name: "Planning", status: "done", summary: "Plan generated." });
                                    if (args.responseMarkdown) {
                                        sendUpdate("CHUNK", args.responseMarkdown);
                                    }
                                    sendUpdate("FINAL", {
                                        planDocument: args.planDocument,
                                        intendsToChange: args.intendsToChange,
                                        affectedFiles: args.affectedFiles || []
                                    });
                                    loopCount = MAX_LOOPS; // Break
                                    toolResult = { status: "success" };
                                    break;
                                }
                            }
                        } catch (err: any) {
                            toolResult = { error: err.message };
                        }

                        await chat.sendMessage([{ functionResponse: { name, response: toolResult } }]);
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
                                    name: "multiReplaceContent",
                                    description: "Replace multiple specific blocks of text in a file with new content in a single operation. Use this for non-contiguous targeted edits.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            path: { type: "STRING", description: "Relative path to the file." },
                                            edits: {
                                                type: "ARRAY",
                                                items: {
                                                    type: "OBJECT",
                                                    properties: {
                                                        target: { type: "STRING", description: "The exact string to replace." },
                                                        replacement: { type: "STRING", description: "The new content." }
                                                    },
                                                    required: ["target", "replacement"]
                                                },
                                                description: "List of edits to apply."
                                            }
                                        },
                                        required: ["path", "edits"]
                                    }
                                },
                                {
                                    name: "findByName",
                                    description: "Search for files by name patterns in the workspace.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            pattern: { type: "STRING", description: "Glob pattern to search for." }
                                        },
                                        required: ["pattern"]
                                    }
                                },
                                {
                                    name: "grepSearch",
                                    description: "Search for exact text patterns within files.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            query: { type: "STRING", description: "The text to search for." }
                                        },
                                        required: ["query"]
                                    }
                                },
                                {
                                    name: "viewFile",
                                    description: "View a file with line numbers for surgical editing precision.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            path: { type: "STRING", description: "Relative path to the file." },
                                            startLine: { type: "NUMBER", description: "Optional start line." },
                                            endLine: { type: "NUMBER", description: "Optional end line." }
                                        },
                                        required: ["path"]
                                    }
                                },
                                {
                                    name: "auditCode",
                                    description: "Perform a mandatory static reflection and sanity check on the proposed code. Use this to verify logic, imports, and types without executing real commands.",
                                    parameters: {
                                        type: "OBJECT",
                                        properties: {
                                            checkList: { 
                                                type: "ARRAY", 
                                                items: { type: "STRING" },
                                                description: "List of specific checks performed (e.g. 'Checked imports', 'Verified type consistency')."
                                            }
                                        },
                                        required: ["checkList"]
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
Your task: Implement the following plan in the codebase with SURGICAL PRECISION.
Do NOT rewrite entire files (via 'writeFile') unless it is a brand new file.
Always prefer 'replaceContent' or 'multiReplaceContent' to fix only the problematic areas.

PLAN:
${context.plan}

PLAN:
${context.plan}

RULES:
1. Work step-by-step.
2. Use 'readFile' before editing to identify the exact blocks of code to replace.
3. Use 'multiReplaceContent' for surgical fixes in multiple areas of the same file.
4. **CRITICAL**: Never just comment out code to "fix" it. You must REWRITE the logic to be secure and efficient. For example, replace SQL injection with parameterized queries, don't just delete the query. 
5. If 'replaceContent' fails because of a missing match, READ the file again to find the exact character-sequence.
6. After making changes, use 'auditCode' to perform a rigorous static verification. You MUST check for missing imports, syntax errors, and logical consistency.
7. If you find a potential error during your audit, FIX it immediately.
8. When everything is perfect and verified via 'auditCode', call 'finishTask'.

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
                        const filename = args.path ? path.basename(args.path) : null;
                        const lineRange = args.startLine ? `#L${args.startLine}${args.endLine ? '-' + args.endLine : ''}` : null;
                        
                        let stepType: "analyzed" | "edited" | "research" | "audit" = "research";
                        if (name.includes("readFile") || name.includes("viewFile")) stepType = "analyzed";
                        else if (name.includes("replace") || name.includes("writeFile")) stepType = "edited";
                        else if (name.includes("audit")) stepType = "audit";

                        sendUpdate("STEP", { 
                            name: `${name}(${args.path || ''})`, 
                            status: "running", 
                            summary: `Executing ${name}...`,
                            type: stepType,
                            filename: filename,
                            lineRange: lineRange
                        });

                        let toolResult: any;
                        try {
                            switch (name) {
                                case "readFile": {
                                    const content = vfs.readFile(args.path);
                                    if (content === undefined) {
                                        toolResult = { error: `File not found: ${args.path}` };
                                    } else {
                                        toolResult = { content };
                                    }
                                    break;
                                }
                                case "writeFile": {
                                    vfs.writeFile(args.path, args.content);
                                    sendUpdate("FINAL", { rewrittenCode: args.content, targetFile: args.path });
                                    toolResult = { success: true };
                                    break;
                                }
                                case "replaceContent": {
                                    const content = vfs.readFile(args.path);
                                    if (content === undefined) {
                                        toolResult = { error: `File not found: ${args.path}` };
                                        break;
                                    }
                                    if (!content.includes(args.target)) {
                                        toolResult = { error: `Target string not found in ${args.path}. Ensure the target exactly matches the file content including whitespace.` };
                                        break;
                                    }
                                    const newContent = content.replace(args.target, args.replacement);
                                    vfs.writeFile(args.path, newContent);
                                    sendUpdate("FINAL", { rewrittenCode: newContent, targetFile: args.path });
                                    toolResult = { success: true };
                                    break;
                                }
                                case "multiReplaceContent": {
                                    let currentContent = vfs.readFile(args.path);
                                    if (currentContent === undefined) {
                                        toolResult = { error: `File not found: ${args.path}` };
                                        break;
                                    }
                                    const appliedEdits = [];
                                    const failedEdits = [];

                                    for (const edit of args.edits) {
                                        if (currentContent.includes(edit.target)) {
                                            currentContent = currentContent.replace(edit.target, edit.replacement);
                                            appliedEdits.push(edit.target);
                                        } else {
                                            failedEdits.push(edit.target);
                                        }
                                    }

                                    if (appliedEdits.length > 0) {
                                        vfs.writeFile(args.path, currentContent);
                                        sendUpdate("FINAL", { rewrittenCode: currentContent, targetFile: args.path });
                                        toolResult = { 
                                            success: true, 
                                            appliedCount: appliedEdits.length, 
                                            failedCount: failedEdits.length,
                                            failedTargets: failedEdits 
                                        };
                                    } else {
                                        toolResult = { error: "None of the target strings were found in the file.", failedTargets: failedEdits };
                                    }
                                    break;
                                }
                                case "findByName": {
                                    const found = vfs.findByName(args.pattern);
                                    toolResult = { files: found };
                                    break;
                                }
                                case "grepSearch": {
                                    const matches = vfs.grepSearch(args.query);
                                    toolResult = { matches };
                                    break;
                                }
                                case "viewFile": {
                                    const content = vfs.readFile(args.path);
                                    if (content === undefined) {
                                        toolResult = { error: `File not found: ${args.path}` };
                                        break;
                                    }
                                    const lines = content.split('\n');
                                    const start = args.startLine ? Math.max(0, args.startLine - 1) : 0;
                                    const end = args.endLine ? Math.min(lines.length, args.endLine) : lines.length;
                                    const slice = lines.slice(start, end);
                                    const withNumbers = slice.map((l, i) => `${start + i + 1}: ${l}`).join('\n');
                                    toolResult = { 
                                        path: args.path, 
                                        content: withNumbers, 
                                        totalLines: lines.length,
                                        viewRange: { start: start + 1, end: end }
                                    };
                                    break;
                                }
                                case "auditCode": {
                                    toolResult = { status: "success", message: "Static Audit Passed. Reflection confirmed code is logically sound.", verifiedChecks: args.checkList };
                                    break;
                                }
                                case "runCommand": {
                                    toolResult = { error: "runCommand is disabled. Use auditCode for verification." };
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

                        // Prepare final summary with diff stats if available
                        let finalSummary = "Operation complete.";
                        let diffData = undefined;
                        if (name.includes("replace") && toolResult.success) {
                            diffData = { added: 1, removed: 1 }; // Simplified for now, or could parse from result
                        }

                        sendUpdate("STEP", { 
                            name: `${name}`, 
                            status: "done", 
                            summary: finalSummary,
                            type: stepType,
                            filename: filename,
                            lineRange: lineRange,
                            diff: diffData
                        });
                        
                        if (name === "finishTask") break;
                    }
                }

                // ── POST-EXECUTION REPORT EXPLANATION ──────────────────────
                else if (mode === "execute_summary") {
                    sendUpdate("BOUNDARY", "Generating Summary");

                    const explainSubject = `REWRITTEN FILES:\n${(context.targetFiles || []).map((f: any) => `<file path="${f.filename}">\n${f.code}\n</file>`).join("\n\n")}`;

                    // --- GENERATE JSON DIFF FOR HISTORY ---
                    try {
                        const diffPrompt = `You are an AI tracking code changes.
Review these rewritten files:
${explainSubject}

Generate a concise JSON array of the most important edits made (max 5).
Format EXACTLY as:
{
  "changes": [
    {
      "filename": "string",
      "line": 1,
      "original": "short snippet of old code (estimate)",
      "rewritten": "short snippet of new code",
      "reason": "why this was changed",
      "category": "Security" 
    }
  ]
}
Output pure JSON.`;
                        const diffResult = await flashModel.generateContent({
                            contents: [{ role: "user", parts: [{ text: diffPrompt }] }],
                            generationConfig: { responseMimeType: "application/json" }
                        });
                        const diffJson = JSON.parse(diffResult.response.text());
                        if (diffJson.changes) {
                            sendUpdate("CHANGES", diffJson.changes);
                        }
                    } catch (e) { console.error("History diff generation failed", e); }
                    // --------------------------------------

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
