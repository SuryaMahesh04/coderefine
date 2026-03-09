"use client";

import { useState, useRef } from "react";
import CodeEditor from "../../components/CodeEditor";
import ChatPanel, { type Message } from "../../components/ChatPanel";
import Sidebar from "../../components/Sidebar";
import { analyzeCode } from "../actions/chat";
import { executeCode } from "../actions/execute";
import { analyzeCodebase } from "../actions/analyze";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const EXTENSION_MAP: Record<string, string> = {
  "ts": "typescript", "tsx": "typescript", "js": "javascript", "jsx": "javascript",
  "py": "python", "cpp": "cpp", "c": "c", "java": "java", "go": "go", "rs": "rust"
};

const LANGUAGE_TEMPLATES: Record<string, string> = {
  javascript: `// Welcome to CodeRefine Sandbox!
// JavaScript Template

function calculateSum(arr) {
  let sum = 0;
  for(let i=0; i < arr.length; i++){
    sum += arr[i];
  }
  return sum;
}

console.log(calculateSum([1, 2, 3]));
`,
  typescript: `// Welcome to CodeRefine Sandbox!
// TypeScript Template

function calculateSum(arr: number[]): number {
  let sum = 0;
  for(let i=0; i < arr.length; i++){
    sum += arr[i];
  }
  return sum;
}

function getUser(id: string) {
  // Hardcoded API key and SQL Injection vulnerabilities
  const apiKey = "SK-1234567890-SECRET-KEY";
  const query = \`SELECT * FROM users WHERE id=\${id}\`;
  
  return db.execute(query);
}
`,
  python: `# Welcome to CodeRefine Sandbox!
# Python Template

def calculate_sum(arr):
    return sum(arr)

print(calculate_sum([1, 2, 3]))
`,
  cpp: `// Welcome to CodeRefine Sandbox!
// C++ Template

#include <iostream>
#include <vector>

int calculateSum(const std::vector<int>& arr) {
    int sum = 0;
    for(int num : arr) {
        sum += num;
    }
    return sum;
}

int main() {
    std::vector<int> numbers = {1, 2, 3};
    std::cout << calculateSum(numbers) << std::endl;
    return 0;
}
`,
  go: `// Welcome to CodeRefine Sandbox!
// Go Template

package main

import "fmt"

func calculateSum(arr []int) int {
    sum := 0
    for _, num := range arr {
        sum += num
    }
    return sum
}

func main() {
    fmt.Println(calculateSum([]int{1, 2, 3}))
}
`,
  java: `// Welcome to CodeRefine Sandbox!
// Java Template

public class Main {
    public static int calculateSum(int[] arr) {
        int sum = 0;
        for (int num : arr) {
            sum += num;
        }
        return sum;
    }

    public static void main(String[] args) {
        System.out.println(calculateSum(new int[]{1, 2, 3}));
    }
}
`,
  rust: `// Welcome to CodeRefine Sandbox!
// Rust Template

fn calculate_sum(arr: &[i32]) -> i32 {
    arr.iter().sum()
}

fn main() {
    let numbers = [1, 2, 3];
    println!("{}", calculate_sum(&numbers));
}
`
};

export default function AppLayout() {
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState(LANGUAGE_TEMPLATES["typescript"]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1", role: "agent", content: "Hi! I'm your AI Engineer. Try command: 'fix the bugs' or 'run the code'.",
    }
  ]);

  const [pendingEdits, setPendingEdits] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [lastExecution, setLastExecution] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const clearDecorations = () => {
    if (editorRef.current && monacoRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop() || "";
    if (EXTENSION_MAP[ext]) {
      setLanguage(EXTENSION_MAP[ext]);
    }

    const reader = new FileReader();
    reader.onload = (evt) => setCode(evt.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';

    // reset UI
    setAnalysis(null);
    clearDecorations();
    setPendingEdits([]);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ext = Object.keys(EXTENSION_MAP).find(k => EXTENSION_MAP[k] === language) || "txt";
    a.download = `code.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    const result = await analyzeCodebase(code);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userMessage }]);
    setIsLoading(true);

    if (userMessage.toLowerCase().includes("run") || userMessage.toLowerCase().includes("execute")) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "agent", content: "Compiling..." }]);
      const res = await executeCode(code, language);
      setLastExecution(res);
      setMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = {
          id: (Date.now() + 2).toString(), role: "agent", content: `Execution Finished (Exit ${res.exitCode}):\n\n${res.output}`
        };
        return newArr;
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await analyzeCode(code, userMessage, { analysis, execution: lastExecution });
      if (result.chat_response) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: "agent", content: result.chat_response }]);
      }
      if (result.changes && result.changes.length > 0) {
        applyInlineRedGreenDiff(result.changes);
      }
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "agent", content: "Error connecting to AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyInlineRedGreenDiff = (changes: any[]) => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    let newDecorations: any[] = [];
    const editsToTrack: any[] = [];

    // Apply edits top-down (naive approach requires reversing or handling offsets)
    // To keep it simple, we replace the line with "Original\nRewritten"
    // and highlight Original as Red/Strikethrough, Rewritten as Green
    let offset = 0;

    // Sort changes by line so offsets work predictably
    const sortedChanges = [...changes].sort((a, b) => a.line - b.line);

    editor.executeEdits('ai-agent', sortedChanges.map(change => {
      const lineContent = editor.getModel().getLineContent(change.line);
      return {
        range: new monaco.Range(change.line, 1, change.line, lineContent.length + 1),
        text: `${lineContent}\n${change.rewritten}`,
        forceMoveMarkers: true
      };
    }));

    sortedChanges.forEach((change) => {
      const actualLine = change.line + offset;
      editsToTrack.push({ originalLine: actualLine, newLine: actualLine + 1 });

      // Red - Old original line
      newDecorations.push({
        range: new monaco.Range(actualLine, 1, actualLine, 1),
        options: {
          isWholeLine: true, className: "bg-red-500/20 border-l-2 border-red-500 line-through text-red-300 opacity-60",
          hoverMessage: { value: "**Removed by AI**" }
        }
      });

      // Green - New rewritten line
      newDecorations.push({
        range: new monaco.Range(actualLine + 1, 1, actualLine + 1, 1),
        options: {
          isWholeLine: true, className: "bg-green-500/20 border-l-2 border-green-500",
          hoverMessage: { value: `**AI Fix (${change.category}):** ${change.reason}` }
        }
      });

      offset += 1; // Since we inserted a newline
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    setPendingEdits(editsToTrack);
  };

  const acceptAllEdits = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;

    // We must delete the originalLine (the red ones).
    // Because removing lines shifts up the ones below it, we must do it strictly from bottom to top!
    const editsToRun = [...pendingEdits].sort((a, b) => b.originalLine - a.originalLine);

    editor.executeEdits('ai-accept', editsToRun.map(edit => {
      return {
        range: new monacoRef.current.Range(edit.originalLine, 1, edit.originalLine + 1, 1),
        text: "", // Remove the red line and the newline connecting it to the green line
        forceMoveMarkers: true
      };
    }));

    clearDecorations();
    setPendingEdits([]);
  };

  const rejectAllEdits = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;

    // We must delete the newLine (the green ones). Bottom to top.
    const editsToRun = [...pendingEdits].sort((a, b) => b.newLine - a.newLine);

    editor.executeEdits('ai-reject', editsToRun.map(edit => {
      return {
        // Plus one to delete the preceding newline
        range: new monacoRef.current.Range(edit.newLine - 1, 9999, edit.newLine, editor.getModel().getLineContent(edit.newLine).length + 1),
        text: "",
        forceMoveMarkers: true
      };
    }));

    clearDecorations();
    setPendingEdits([]);
  };

  return (
    <div className="flex w-full h-screen bg-black text-zinc-300 overflow-hidden font-sans">
      <Sidebar />
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      <PanelGroup direction="horizontal">
        <Panel defaultSize={70} minSize={40}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={30}>
              {/* LEFT SECTION: Editor (Top) */}
              <div className="flex flex-col h-full bg-zinc-950 relative min-w-0">
                <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between bg-black/40 backdrop-blur-md shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white tracking-tight">Editor</span>
                    <select
                      className="bg-black border border-white/10 text-zinc-400 font-mono text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 hover:text-white transition-colors"
                      value={language}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setLanguage(newLang);
                        setCode(LANGUAGE_TEMPLATES[newLang] || "");
                      }}
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="go">Go</option>
                      <option value="java">Java</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {pendingEdits.length > 0 && (
                      <div className="flex gap-2 animate-pulse mr-2">
                        <button onClick={rejectAllEdits} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-500 border border-red-500/30 rounded shadow-sm hover:bg-red-500 hover:text-white transition-all">Reject</button>
                        <button onClick={acceptAllEdits} className="px-3 py-1.5 text-xs bg-green-500/10 text-green-500 border border-green-500/30 rounded shadow-sm hover:bg-green-500 hover:text-white transition-all font-bold">Accept Fixes</button>
                      </div>
                    )}
                    <button onClick={handleDownload} className="text-xs px-3 py-1.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-md transition-colors font-medium">Download</button>
                    <button onClick={() => fileInputRef.current?.click()} className="text-xs px-3 py-1.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-md transition-colors font-medium">Upload</button>
                    <button onClick={runAnalysis} className="text-xs px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] rounded-md font-bold transition-all ml-1">Analyze System</button>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <CodeEditor code={code} language={language} onChange={(v) => setCode(v || "")} onMount={handleEditorMount} />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="h-1 bg-transparent hover:bg-blue-500/50 transition-colors cursor-row-resize flex items-center justify-center border-y border-white/5 relative z-20 group">
              <div className="w-8 h-[2px] bg-white/20 rounded-full group-hover:bg-blue-400" />
            </PanelResizeHandle>

            <Panel defaultSize={40} minSize={15}>
              {/* BOTTOM PANEL: Scoring System */}
              <div className="h-full bg-black flex flex-col overflow-hidden">
                <div className="h-10 border-b border-white/5 flex items-center px-4 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                  <span className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Code Analytics Output
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0d1117]">
                  {!isAnalyzing && !analysis && (
                    <div className="text-sm text-zinc-500 flex items-center justify-center h-full">Click "Analyze System" to generate a comprehensive enterprise report.</div>
                  )}
                  {isAnalyzing && (
                    <div className="text-sm text-blue-400 font-mono flex items-center justify-center h-full animate-pulse">Running OWASP and O(N) constraints...</div>
                  )}
                  {analysis && !isAnalyzing && (
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Score Ring Grid */}
                      <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
                        <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="text-3xl font-black text-green-500 font-mono mb-1">{analysis.security}</div>
                          <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Security</div>
                          <div className="absolute bottom-0 w-full h-1 bg-white/5"><div className="h-full bg-green-500 animate-pulse" style={{ width: `${analysis.security}%` }}></div></div>
                        </div>
                        <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="text-3xl font-black text-blue-500 font-mono mb-1">{analysis.performance}</div>
                          <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Performance</div>
                          <div className="absolute bottom-0 w-full h-1 bg-white/5"><div className="h-full bg-blue-500 animate-pulse" style={{ width: `${analysis.performance}%` }}></div></div>
                        </div>
                        <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="text-3xl font-black text-amber-400 font-mono mb-1">{analysis.quality}</div>
                          <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Code Quality</div>
                          <div className="absolute bottom-0 w-full h-1 bg-white/5"><div className="h-full bg-amber-400 animate-pulse" style={{ width: `${analysis.quality}%` }}></div></div>
                        </div>
                      </div>

                      {/* Bug List */}
                      <div className="col-span-1 md:col-span-3">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                          <span>Detected Vulnerabilities ({analysis.bugs?.length || 0})</span>
                          {analysis.bugs?.length > 0 && <span className="text-red-500">Action Required</span>}
                        </h3>
                        {analysis.bugs?.length === 0 ? (
                          <div className="text-xs text-green-500 font-mono bg-green-500/10 border border-green-500/20 p-4 rounded-lg">✓ Perfect codebase. 0 vulnerabilities or bottlenecks detected.</div>
                        ) : (
                          <div className="space-y-2 pr-2">
                            {analysis.bugs?.map((bug: any, i: number) => (
                              <div key={i} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors border-l-2 rounded-r-lg p-3 text-xs flex gap-4" style={{ borderLeftColor: bug.severity === 'critical' ? '#ef4444' : bug.severity === 'medium' ? '#fbbf24' : '#9ca3af' }}>
                                <div className="w-16 shrink-0 pt-0.5">
                                  <span className={`font-mono font-bold ${bug.severity === 'critical' ? 'text-red-500' : 'text-amber-400'}`}>Line {bug.line}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-0.5">{bug.category} <span className="text-zinc-500 font-normal ml-2">({bug.severity})</span></div>
                                  <div className="text-zinc-400 leading-snug">{bug.message}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-1 bg-transparent hover:bg-blue-500/50 transition-colors cursor-col-resize flex flex-col items-center justify-center border-x border-white/5 relative z-20 group">
          <div className="w-[2px] h-8 bg-white/20 rounded-full group-hover:bg-blue-400" />
        </PanelResizeHandle>

        <Panel defaultSize={30} minSize={20} maxSize={50}>
          {/* RIGHT SECTION: Chatbot */}
          <div className="h-full flex flex-col">
            <ChatPanel messages={messages} input={input} setInput={setInput} onSubmit={handleChatSubmit} isLoading={isLoading} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
