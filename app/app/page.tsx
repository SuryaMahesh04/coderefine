"use client";

import { useState, useRef, useEffect } from "react";
import CodeEditor from "../../components/CodeEditor";
import PlanViewer from "../../components/PlanViewer";
import ChatPanel, { type Message } from "../../components/ChatPanel";
import Sidebar from "../../components/Sidebar";
import FileExplorer, { type FileNode, type FileNodeType } from "../../components/FileExplorer";
import { analyzeCode } from "../actions/chat";
import { executeCode } from "../actions/execute";
import { analyzeCodebase } from "../actions/analyze";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import JSZip from "jszip";
import { Download, Upload, FileUp, FolderArchive, Activity, Terminal } from "lucide-react";

const EXTENSION_MAP: Record<string, string> = {
  "ts": "typescript", "tsx": "typescript", "js": "javascript", "jsx": "javascript",
  "py": "python", "cpp": "cpp", "c": "c", "java": "java", "go": "go", "rs": "rust",
  "cs": "csharp", "php": "php", "rb": "ruby", "swift": "swift", "kt": "kotlin",
  "html": "html", "css": "css", "sql": "sql", "md": "markdown"
};

const LANGUAGE_TEMPLATES: Record<string, string> = {
  javascript: `// Welcome to CodeRefine Sandbox!\n// JavaScript Template\n\nfunction calculateSum(arr) {\n  let sum = 0;\n  for(let i=0; i < arr.length; i++){\n    sum += arr[i];\n  }\n  return sum;\n}\n\nconsole.log(calculateSum([1, 2, 3]));\n`,
  typescript: `// Welcome to CodeRefine Sandbox!\n// TypeScript Template\n\nfunction calculateSum(arr: number[]): number {\n  let sum = 0;\n  for(let i=0; i < arr.length; i++){\n    sum += arr[i];\n  }\n  return sum;\n}\n\nfunction getUser(id: string) {\n  // Hardcoded API key and SQL Injection vulnerabilities\n  const apiKey = "SK-1234567890-SECRET-KEY";\n  const query = \`SELECT * FROM users WHERE id=\${id}\`;\n  \n  return db.execute(query);\n}\n`,
  python: `# Welcome to CodeRefine Sandbox!\n# Python Template\n\ndef calculate_sum(arr):\n    return sum(arr)\n\nprint(calculate_sum([1, 2, 3]))\n`,
  cpp: `// Welcome to CodeRefine Sandbox!\n// C++ Template\n\n#include <iostream>\n#include <vector>\n\nint calculateSum(const std::vector<int>& arr) {\n    int sum = 0;\n    for(int num : arr) {\n        sum += num;\n    }\n    return sum;\n}\n\nint main() {\n    std::vector<int> numbers = {1, 2, 3};\n    std::cout << calculateSum(numbers) << std::endl;\n    return 0;\n}\n`,
  go: `// Welcome to CodeRefine Sandbox!\n// Go Template\n\npackage main\n\nimport "fmt"\n\nfunc calculateSum(arr []int) int {\n    sum := 0\n    for _, num := range arr {\n        sum += num\n    }\n    return sum\n}\n\nfunc main() {\n    fmt.Println(calculateSum([]int{1, 2, 3}))\n}\n`,
  java: `// Welcome to CodeRefine Sandbox!\n// Java Template\n\npublic class Main {\n    public static int calculateSum(int[] arr) {\n        int sum = 0;\n        for (int num : arr) {\n            sum += num;\n        }\n        return sum;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(calculateSum(new int[]{1, 2, 3}));\n    }\n}\n`,
  rust: `// Welcome to CodeRefine Sandbox!\n// Rust Template\n\nfn calculate_sum(arr: &[i32]) -> i32 {\n    arr.iter().sum()\n}\n\nfn main() {\n    let numbers = [1, 2, 3];\n    println!("{}", calculate_sum(&numbers));\n}\n`
};

const LANGUAGE_COLORS: Record<string, string> = {
  typescript: "bg-blue-500",
  javascript: "bg-yellow-400",
  python: "bg-green-500",
  cpp: "bg-purple-500",
  go: "bg-cyan-400",
  java: "bg-red-500",
  rust: "bg-orange-500",
};

type Tab = {
  id: string;
  filename: string;
  language: string;
  code: string;
  type?: 'file' | 'plan';
};

export default function AppLayout() {
  const [explorerOpen, setExplorerOpen] = useState(true);

  // File System & Tabs State
  const [files, setFiles] = useState<FileNode[]>([
    { id: "root-file-1", name: "main.ts", type: "file", language: "typescript" },
  ]);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "root-file-1", filename: "main.ts", language: "typescript", code: "// Welcome to CodeRefine\n// Start coding here..." }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("root-file-1");
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("agentic");

  const activeTab = tabs.find(t => t.id === activeTabId) || null;

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachedFile, setAttachedFile] = useState<{ id: string, name: string } | null>(null);

  const [pendingEdits, setPendingEdits] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [previousAnalysis, setPreviousAnalysis] = useState<any>(null);
  const [lastExecution, setLastExecution] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<any[]>([]);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  // Close upload menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target as Node)) {
        setIsUploadMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update a tab's code
  const handleCodeChange = (newCode: string | undefined) => {
    if (!activeTabId) return;
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, code: newCode || "" } : t));
  };

  // --- Actions ---

  // Recursive helper to find a node by id
  const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Recursive helper to add a node to a specific parent (or root if parentId is null)
  const addNodeToTree = (nodes: FileNode[], parentId: string | null, newNode: FileNode): FileNode[] => {
    if (!parentId) return [...nodes, newNode]; // Add to root

    return nodes.map(node => {
      if (node.id === parentId) {
        // If it's a file, we can't add children. Default to adding to root if this happens.
        if (node.type === "file") return node;
        return { ...node, isOpen: true, children: [...(node.children || []), newNode] };
      }
      if (node.children) {
        return { ...node, children: addNodeToTree(node.children, parentId, newNode) };
      }
      return node;
    });
  };

  const toggleFolderFolder = (nodes: FileNode[], id: string, isOpen: boolean): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) return { ...node, isOpen };
      if (node.children) return { ...node, children: toggleFolderFolder(node.children, id, isOpen) };
      return node;
    });
  };

  const renameNodeInTree = (nodes: FileNode[], id: string, newName: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        let language = node.language;
        if (node.type === "file") {
          const ext = newName.split('.').pop() || "";
          language = EXTENSION_MAP[ext] || "typescript";
        }
        return { ...node, name: newName, language };
      }
      if (node.children) {
        return { ...node, children: renameNodeInTree(node.children, id, newName) };
      }
      return node;
    });
  };

  const deleteNodeFromTree = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes
      .filter(node => node.id !== id)
      .map(node => {
        if (node.children) {
          return { ...node, children: deleteNodeFromTree(node.children, id) };
        }
        return node;
      });
  };


  const handleFileSelect = (id: string) => {
    const node = findNodeById(files, id);
    if (!node || node.type !== "file") return;

    // If not already a tab, create a new tab for it
    if (!tabs.find(t => t.id === id)) {
      const newTab: Tab = {
        id: node.id,
        filename: node.name,
        language: node.language || "typescript",
        code: node.content !== undefined ? node.content : "// New empty file",
        type: node.isPlan ? 'plan' : 'file'
      };
      setTabs([...tabs, newTab]);
    }
    setActiveTabId(id);
  };

  const handleNewItem = (name: string, type: FileNodeType, parentId: string | null) => {
    const newId = Date.now().toString();

    let language;
    if (type === "file") {
      const ext = name.split('.').pop() || "";
      const extMap: Record<string, string> = {
        "ts": "typescript", "tsx": "typescript", "js": "javascript", "jsx": "javascript",
        "py": "python", "cpp": "cpp", "c": "c", "java": "java", "go": "go", "rs": "rust"
      };
      language = extMap[ext] || "typescript";
    }

    const newNode: FileNode = {
      id: newId,
      name,
      type,
      ...(type === "file" ? { language } : { children: [], isOpen: true })
    };

    // If parentId points to a file, add to root instead
    const parentNode = parentId ? findNodeById(files, parentId) : null;
    let actualParentId = parentId;
    if (parentNode && parentNode.type === "file") {
      actualParentId = null;
    }

    const updatedFiles = addNodeToTree(files, actualParentId, newNode);
    setFiles(updatedFiles);

    if (type === "file") {
      handleFileSelect(newId);
    }
    setSelectedContextId(newId);
  };

  const handleToggleFolder = (id: string, isOpen: boolean) => {
    setFiles(toggleFolderFolder(files, id, isOpen));
  };

  const handleRenameItem = (id: string, newName: string) => {
    setFiles(prev => renameNodeInTree(prev, id, newName));

    // Also update tabs if renamed file is open
    setTabs(prev => prev.map(tab => {
      if (tab.id === id) {
        const ext = newName.split('.').pop() || "";
        const lang = EXTENSION_MAP[ext] || "typescript";
        return { ...tab, filename: newName, language: lang };
      }
      return tab;
    }));
  };

  const handleDeleteItem = (id: string) => {
    setFiles(prev => deleteNodeFromTree(prev, id));

    // Close tab if open
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTabId === id) {
        if (newTabs.length > 0) {
          setActiveTabId(newTabs[newTabs.length - 1].id);
        } else {
          setActiveTabId("");
        }
      }
      return newTabs;
    });

    if (selectedContextId === id) {
      setSelectedContextId(null);
    }
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTabId === id && newTabs.length > 0) {
        // If we close the active tab, switch to the last one
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTabId("");
      }
      return newTabs;
    });
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const clearDecorations = () => {
    if (editorRef.current && monacoRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  };

  // Clear decorations when switching tabs
  useEffect(() => {
    clearDecorations();
    setPendingEdits([]);
    
    // Don't clear terminal analysis if just looking at a plan
    const newTab = tabs.find(t => t.id === activeTabId);
    if (newTab?.type !== 'plan') {
      setAnalysis(null);
    }
  }, [activeTabId]);

  const handleUploadCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop() || "";
    const lang = EXTENSION_MAP[ext] || "typescript";

    const reader = new FileReader();
    reader.onload = (evt) => {
      const code = evt.target?.result as string;
      const id = Date.now().toString();

      // Add to virtual file system
      setFiles(prev => [...prev, { id, name: file.name, type: "file", language: lang }]);
      // Open in a new tab
      setTabs(prev => [...prev, { id, filename: file.name, language: lang, code }]);
      setActiveTabId(id);

      // reset UI for the new tab
      setAnalysis(null);
      clearDecorations();
      setPendingEdits([]);
    };
    reader.readAsText(file);
    e.target.value = '';
    setIsUploadMenuOpen(false);
  };

  const handleUploadZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("Zip file is too large. Please upload files under 10MB.");
      return;
    }

    try {
      const zip = await JSZip.loadAsync(file);

      const newFiles: FileNode[] = [];

      // Helper to add nodes by path
      const addNodeByPath = (pathParts: string[], content: string | undefined, currentLevel: FileNode[]) => {
        if (pathParts.length === 0) return;

        const part = pathParts[0];
        const isFile = pathParts.length === 1;

        let existingNode = currentLevel.find(n => n.name === part);

        if (!existingNode) {
          existingNode = {
            id: Date.now().toString() + Math.random().toString(),
            name: part,
            type: isFile ? "file" : "folder",
            ...(isFile ? {
              language: EXTENSION_MAP[part.split('.').pop() || ""] || "typescript",
              content
            } : {
              children: [],
              isOpen: false
            })
          };
          currentLevel.push(existingNode);
        }

        if (!isFile && existingNode.children) {
          addNodeByPath(pathParts.slice(1), content, existingNode.children);
        }
      };

      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        // Ignore MacOS junk or directories (which we create implicitly)
        if (zipEntry.dir || relativePath.includes('__MACOSX') || relativePath.includes('.DS_Store')) {
          continue;
        }

        const content = await zipEntry.async('text');
        const pathParts = relativePath.split('/').filter(p => p.length > 0);

        addNodeByPath(pathParts, content, newFiles);
      }

      // Open root level folders by default
      newFiles.forEach(f => {
        if (f.type === "folder") f.isOpen = true;
      });

      // Completely replace the file tree
      setFiles(newFiles);
      setIsUploadMenuOpen(false);
      setTabs([]); // clear old tabs since file references are dead
      setActiveTabId("");

    } catch (err) {
      console.error("Error parsing ZIP:", err);
      alert("Failed to parse the ZIP file.");
    }

    e.target.value = '';
  };

  const handleDownload = () => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Recursively extract all files
  const extractAllFiles = (nodes: FileNode[]): { id: string, filename: string, code: string }[] => {
    let result: { id: string, filename: string, code: string }[] = [];
    for (const node of nodes) {
      if (node.type === "file") {
        // If the file is open in a tab, use the tab's code, otherwise use node.content
        const openTab = tabs.find(t => t.id === node.id);
        result.push({
          id: node.id,
          filename: node.name,
          code: openTab ? openTab.code : (node.content || "")
        });
      } else if (node.children) {
        result.push(...extractAllFiles(node.children));
      }
    }
    return result;
  };

  const runAnalysis = async (overrideFiles?: { filename: string; code: string }[]) => {
    if (!activeTab && files.length === 0) return;
    setIsAnalyzing(true);
    setAnalyzingFile(null);
    setAnalysis(null);

    // Use override if provided (e.g. after a rewrite), otherwise read from current tabs
    let filesToAnalyze = overrideFiles;
    if (!filesToAnalyze) {
      // Read from tabs (the live editor state) not from the file tree
      filesToAnalyze = tabs
        .filter(t => t.type !== 'plan' && t.code?.trim())
        .map(t => ({ filename: t.filename, code: t.code }));
    }
    if (filesToAnalyze.length === 0 && activeTab) {
      filesToAnalyze = [{ filename: activeTab.filename, code: activeTab.code }];
    }

    // Check if file extension is a valid programming language based on the filename
    const hasValidExtension = (filename: string) => {
      const parts = filename.split('.');
      if (parts.length < 2) return false;
      const ext = parts.pop()?.toLowerCase();
      return ext ? (ext in EXTENSION_MAP) : false;
    };

    // Gate: Check if the text actually resembles multi-statement code before hitting the API
    const isCodeLike = (text: string) => {
      if (!text || text.trim().length < 5) return false;

      // Extract alphanumeric "words" to avoid validating pure symbol spam
      const wordCount = (text.match(/[a-zA-Z0-9_]+/g) || []).length;
      if (wordCount < 2) return false; 

      const patterns = [
        /[{}\[\]()]/, // Block delimiters
        /=|=>|\+=|::|:=/, // Operators
        /\b(if|for|while|return|def|fn|class|func|import|export|const|let|var|case|switch|try|catch|match|async|await|print|console|log|echo)\b/, // Keywords
        /;\s*$|:\s*$/, // Statement/Block terminators
        /<|>|@|:\s*[A-Z][a-zA-Z]+/ // Types / Decorators
      ];
      
      const matchCount = patterns.filter(p => p.test(text)).length;
      return matchCount >= 2; // Needs at least 2 strong code signals to avoid single expressions
    };

    // Require both a valid script extension AND sufficient structural density
    const hasCode = filesToAnalyze.some(f => hasValidExtension(f.filename) && isCodeLike(f.code));
    
    let result;
    if (!hasCode) {
      // Fast fail: Return a "no code" state mock without an API call
      result = {
        codeDetected: false,
        security: 0,
        performance: 0,
        quality: 0,
        overallRating: 0,
        bugs: []
      };
    } else {
      // Stream progress in the UI
      for (const file of filesToAnalyze) {
        setAnalyzingFile(file.filename);
        // Artificial delay for Antigravity-style "scanning" visual effect
        await new Promise(r => setTimeout(r, 600)); 
      }
      result = await analyzeCodebase(filesToAnalyze);
    }

    setAnalysis(result);
    setAnalyzingFile(null);
    setIsAnalyzing(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || (!activeTab && files.length === 0)) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userMessage }]);
    setIsLoading(true);

    if (userMessage.toLowerCase().includes("run") || userMessage.toLowerCase().includes("execute")) {
      if (!activeTab) {
        setMessages(prev => [...prev, { id: "agent-" + Date.now(), role: "agent", content: "Please open a specific file to execute." }]);
        setIsLoading(false);
        return;
      }
      setMessages(prev => [...prev, { id: "agent-" + Date.now(), role: "agent", content: "Compiling..." }]);
      const res = await executeCode(activeTab.code, activeTab.language);
      setLastExecution(res);
      setMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = {
          id: "agent-" + Date.now(), role: "agent", content: `Execution Finished (Exit ${res.exitCode}):\n\n${res.output}`
        };
        return newArr;
      });
      setIsLoading(false);
      return;
    }

    try {
      const allFiles = extractAllFiles(files);
      const workspaceMap = allFiles.map(f => f.filename).join(', ');
      
      let codeContext = `WORKSPACE_FILES: [${workspaceMap}]\n\n`;
      if (attachedFile) {
        const node = findNodeById(files, attachedFile.id);
        const attachedCode = tabs.find(t => t.id === attachedFile.id)?.code || node?.content || "";
        codeContext += `ATTACHED FILE: ${attachedFile.name}\n---\n${attachedCode}\n---`;
        setAttachedFile(null);
      } else if (activeTab) {
        codeContext += `ACTIVE FILE: ${activeTab.filename}\n---\n${activeTab.code}\n---`;
      } else {
        codeContext += allFiles.map(f => `File: ${f.filename}\n---\n${f.code}\n---`).join('\n\n');
      }

      // Add actual agent message placeholder - use a prefix to prevent ID collision with user message
      const agentMsgId = "agent-" + Date.now();
      const thoughtStartTime = Date.now();
      setMessages(prev => [...prev, {
        id: agentMsgId,
        role: "agent",
        content: "",
        thoughts: [],
        steps: [],
        thoughtDuration: undefined
      }]);

      const terminalContext = {
        analysis: analysis ? {
          scores: {
            security: analysis.security,
            performance: analysis.performance,
            quality: analysis.quality,
            overallRating: analysis.overallRating
          },
          bugs: analysis.bugs || []
        } : null,
        execution: lastExecution ? {
          exitCode: lastExecution.exitCode,
          output: lastExecution.output,
          error: lastExecution.error
        } : null
      };

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeContext,
          userMessage: userMessage,
          context: terminalContext,
          selectedModel: selectedModel
        })
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          const typeMatch = line.match(/^\[(.*?)\]\s?(.*)/);
          if (!typeMatch) continue;

          const [, type, content] = typeMatch;

          setMessages(prev => prev.map(msg => {
            if (msg.id !== agentMsgId) return msg;

            if (type === "THOUGHT") {
              return { ...msg, thoughts: [...(msg.thoughts || []), content] };
            }
            if (type === "CHUNK") {
              // First chunk signals end of thinking phase — record duration
              const duration = msg.thoughtDuration !== undefined
                ? msg.thoughtDuration
                : Math.round((Date.now() - thoughtStartTime) / 1000);
              // Append chunk + newline so markdown headers/lists render correctly
              return { ...msg, content: (msg.content || "") + content + "\n", thoughtDuration: duration };
            }
            if (type === "STEP") {
              try {
                const step = JSON.parse(content);
                const existingStepIdx = msg.steps?.findIndex(s => s.name === step.name);
                let newSteps = [...(msg.steps || [])];
                if (existingStepIdx !== undefined && existingStepIdx !== -1) {
                  newSteps[existingStepIdx] = step;
                } else {
                  newSteps.push(step);
                }
                return { ...msg, steps: newSteps };
              } catch { return msg; }
            }
            if (type === "ANALYZE_WORKSPACE") {
              try {
                console.log("RECEIVED ANALYZE_WORKSPACE payload:", content);
                const req = JSON.parse(content);
                if (req.files && Array.isArray(req.files)) {
                  const allFiles = extractAllFiles(files);
                  console.log("Available files:", allFiles.map(f => f.filename));
                  const filesToAnalyze: { id: string, filename: string, code: string }[] = req.files
                    .map((filename: string) => {
                      const fileNode = allFiles.find(f => f.filename === filename);
                      if (!fileNode) {
                        console.log("Could not find file in tree:", filename);
                        return null;
                      }
                      // Prioritize tab code if open, else fallback to node content
                      const tab = tabs.find(t => t.id === fileNode.id);
                      return { id: fileNode.id, filename: fileNode.filename, code: tab ? tab.code : fileNode.code };
                    })
                    .filter((f: any) => f !== null) as { id: string, filename: string, code: string }[];

                  console.log("Final files to analyze:", filesToAnalyze);
                  if (filesToAnalyze.length > 0) {
                    setIsAnalyzing(true);
                    runAnalysis(filesToAnalyze);
                  } else {
                    console.warn("filesToAnalyze is empty! Terminal will not trigger.");
                  }
                }
              } catch (e) { console.error("Failed to parse ANALYZE_WORKSPACE content:", e, content); }
              return msg;
            }
            if (type === "FINAL") {
              try {
                const final = JSON.parse(content);
                const updatedMsg = {
                  ...msg,
                  planDocument: final.planDocument,
                  intendsToChange: final.intendsToChange,
                  affectedFiles: final.affectedFiles || [],
                  changes: final.changes || []
                };
                return updatedMsg;
              } catch (e) {
                console.error("Failed to parse FINAL content:", content, e);
                return msg;
              }
            }
            return msg;
          }));
        }
      }
    } catch (err: any) {
      console.error("Streaming Chat Error:", err);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "agent", content: "Error connecting to AI stream." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptChanges = async (messageId: string, changes: any[]) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    const isMultiFile = msg.affectedFiles && msg.affectedFiles.length > 1;
    const targetTab = tabs.find(t => t.id === activeTabId);

    // If it's a single file operation, we MUST have a target tab to edit
    if (!isMultiFile && !targetTab) { 
        console.error("No active tab to rewrite for single file operation."); 
        return; 
    }

    setIsLoading(true);

    // Create a new agent message for the explanation stream
    const explainMsgId = "agent-explain-" + Date.now();
    setMessages(prev => [...prev, {
      id: explainMsgId,
      role: "agent",
      content: "",
      thoughts: [],
      steps: [],
      thoughtDuration: undefined
    }]);


    let targetFiles: { filename: string, code: string, id?: string }[] = [];
    if (isMultiFile) {
      const allFiles = extractAllFiles(files);
      targetFiles = allFiles.filter(f => (msg.affectedFiles || []).includes(f.filename));
    } else {
      targetFiles = [{ filename: targetTab!.filename, code: targetTab!.code, id: targetTab!.id }];
    }

    try {
      let analyzeFilesPayload: { filename: string, code: string }[] = [];
      const rewrittenFilesDisplay: { filename: string, id?: string }[] = [];

      // ── SEQUENTIAL AGENTIC EXECUTION LOOP ──
      for (const target of targetFiles) {
        
        // Add a step indicator for this specific file
        setMessages(prev => prev.map(m => {
          if (m.id !== explainMsgId) return m;
          const newSteps = [...(m.steps || [])];
          newSteps.push({ name: `Rewriting ${target.filename}`, status: "running", summary: "Applying plan to file..." });
          return { ...m, steps: newSteps };
        }));

        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "execute",
            code: target.code, // sending ONLY this single file's code
            context: { plan: msg.content, isMultiFile: false, targetFile: target.filename }, // Force single-file mode on backend
            selectedModel: selectedModel
          })
        });

        if (!response.body) throw new Error("No response body");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(Boolean);

          for (const line of lines) {
            const typeMatch = line.match(/^\[([A-Z_]+)\](.*)/);
            if (!typeMatch) continue;
            const [, type, content] = typeMatch;

            // ── THOUGHT lines go into the explanation message ──
            if (type === "THOUGHT") {
              setMessages(prev => prev.map(m =>
                m.id === explainMsgId ? { ...m, thoughts: [...(m.thoughts || []), content] } : m
              ));
            }

            // ── FINAL: apply the rewritten code immediately ──
            if (type === "FINAL") {
              try {
                const final = JSON.parse(content);
                
                if (final.rewrittenCode) {
                  analyzeFilesPayload.push({ filename: target.filename, code: final.rewrittenCode });
                  
                  // Add to the visual display pill list
                  let foundId = target.id;
                  if (!foundId) {
                     const foundNode = extractAllFiles(files).find(n => n.filename === target.filename);
                     foundId = foundNode?.id;
                  }
                  rewrittenFilesDisplay.push({ filename: target.filename, id: foundId });

                  // Apply to tab state
                  setTabs(prev => prev.map(t =>
                    t.filename === target.filename ? { ...t, code: final.rewrittenCode } : t
                  ));

                  // Apply to Virtual File Tree
                  setFiles(prev => {
                    const updateNode = (nodes: FileNode[]): FileNode[] => {
                      return nodes.map(node => {
                        if (node.type === "file" && node.name === target.filename) {
                          return { ...node, content: final.rewrittenCode };
                        }
                        if (node.children) return { ...node, children: updateNode(node.children) };
                        return node;
                      });
                    };
                    return updateNode(prev);
                  });

                  // Apply to Monaco editor instantly if it's the active tab
                  if (activeTabId && editorRef.current) {
                      const activeTabNow = tabs.find(t => t.id === activeTabId);
                      if (activeTabNow && activeTabNow.filename === target.filename) {
                          editorRef.current.setValue(final.rewrittenCode);
                      }
                  }

                }
              } catch (e) { console.error("Failed to parse execute FINAL:", e); }
            }
          }
        } // end stream inner loop

        // Mark this file's step as done
        setMessages(prev => prev.map(m => {
          if (m.id !== explainMsgId) return m;
          const newSteps = [...(m.steps || [])];
          const stepIdx = newSteps.findIndex(s => s.name === `Rewriting ${target.filename}`);
          if (stepIdx !== -1) {
             newSteps[stepIdx].status = "done";
             newSteps[stepIdx].summary = "Done";
          }
          return { ...m, steps: newSteps };
        }));

      } // end targetFiles loop

      // ── MARK MESSAGE ACCEPTED AND SHOW FILES ──
      setMessages(prev => prev.map(m => {
        if (m.id === explainMsgId) {
          return { ...m, rewrittenFiles: rewrittenFilesDisplay };
        }
        if (m.id === messageId) {
          return { ...m, isAccepted: true };
        }
        return m;
      }));

      // ── POST-EXECUTE GENERATE SUMMARY EXPLANATION ──
      setMessages(prev => prev.map(m => {
        if (m.id !== explainMsgId) return m;
        const newSteps = [...(m.steps || [])];
        newSteps.push({ name: "Generating change summary", status: "running", summary: "Summarizing all changes made..." });
        return { ...m, steps: newSteps, thoughts: [...(m.thoughts || []), "Now I will summarize exactly what I changed across all the files."] };
      }));

      const summaryResponse = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "execute_summary", // We'll add this mode to route.ts
          context: { plan: msg.content, targetFiles: analyzeFilesPayload },
          selectedModel: selectedModel
        })
      });

      if (summaryResponse.body) {
        const sumReader = summaryResponse.body.getReader();
        const sumDecoder = new TextDecoder();
        while (true) {
          const { done, value } = await sumReader.read();
          if (done) break;
          const chunk = sumDecoder.decode(value);
          const lines = chunk.split('\n').filter(Boolean);
          for (const line of lines) {
             if (line.match(/^\[EXPLAIN_CHUNK\](.*)/)) {
                 const content = line.substring(15);
                 setMessages(prev => prev.map(m =>
                  m.id === explainMsgId ? { ...m, content: (m.content || "") + content + "\n" } : m
                 ));
             }
             if (line.match(/^\[EXPLAIN_DONE\]/)) {
                 setMessages(prev => prev.map(m => {
                    if (m.id !== explainMsgId) return m;
                    const newSteps = [...(m.steps || [])];
                    const stepIdx = newSteps.findIndex(s => s.name === "Generating change summary");
                    if (stepIdx !== -1) {
                       newSteps[stepIdx].status = "done";
                       newSteps[stepIdx].summary = "Finished.";
                    }
                    return { ...m, steps: newSteps };
                  }));
             }
        }
      }

      // ── TRIGGER RE-ANALYSIS USING REWRITTEN CODE ──
      if (analyzeFilesPayload.length > 0) {
        if (analysis) setPreviousAnalysis(analysis);
        setTimeout(() => {
          runAnalysis(analyzeFilesPayload);
        }, 300);
      }
      }
    } catch (err) {
      console.error("Execution phase failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewPlan = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg || !msg.planDocument) return;

    const planNode: FileNode = {
      id: "plan-" + messageId,
      name: msg.planDocument.filename || "improvement_plan.md",
      type: "file",
      language: "markdown",
      content: msg.planDocument.content,
      isPlan: true
    };

    // Add to tree if not exists
    setFiles(prev => {
      if (findNodeById(prev, planNode.id)) return prev;
      return addNodeToTree(prev, null, planNode);
    });

    // Add to tabs if not exists
    setTabs(prev => {
      if (prev.find(t => t.id === planNode.id)) return prev;
      return [...prev, { id: planNode.id, filename: planNode.name, language: "markdown", code: planNode.content!, type: 'plan' }];
    });

    setActiveTabId(planNode.id);
  };

  const handleRejectChanges = (messageId: string) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isRejected: true } : msg));
  };

  const applyInlineRedGreenDiff = (changes: any[]) => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    let newDecorations: any[] = [];
    const editsToTrack: any[] = [];
    let offset = 0;

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
      newDecorations.push({
        range: new monaco.Range(actualLine, 1, actualLine, 1),
        options: { isWholeLine: true, className: "bg-red-500/20 border-l-2 border-red-500 line-through text-red-300 opacity-60" }
      });
      newDecorations.push({
        range: new monaco.Range(actualLine + 1, 1, actualLine + 1, 1),
        options: { isWholeLine: true, className: "bg-green-500/20 border-l-2 border-green-500" }
      });
      offset += 1;
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    setPendingEdits(editsToTrack);
  };

  const acceptAllEdits = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const editsToRun = [...pendingEdits].sort((a, b) => b.originalLine - a.originalLine);

    editor.executeEdits('ai-accept', editsToRun.map(edit => ({
      range: new monacoRef.current.Range(edit.originalLine, 1, edit.originalLine + 1, 1),
      text: "",
      forceMoveMarkers: true
    })));

    clearDecorations();
    setPendingEdits([]);
  };

  const rejectAllEdits = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const editsToRun = [...pendingEdits].sort((a, b) => b.newLine - a.newLine);

    editor.executeEdits('ai-reject', editsToRun.map(edit => ({
      range: new monacoRef.current.Range(edit.newLine - 1, 9999, edit.newLine, editor.getModel().getLineContent(edit.newLine).length + 1),
      text: "",
      forceMoveMarkers: true
    })));

    clearDecorations();
    setPendingEdits([]);
  };

  return (
    <div className="flex w-full h-screen bg-background text-text-primary overflow-hidden font-sans">
      <Sidebar explorerOpen={explorerOpen} onToggleExplorer={() => setExplorerOpen(!explorerOpen)} />

      <FileExplorer
        files={files}
        activeFileId={activeTabId}
        selectedContextId={selectedContextId}
        onFileSelect={handleFileSelect}
        onContextSelect={setSelectedContextId}
        onToggleFolder={handleToggleFolder}
        onNewItem={handleNewItem}
        onRenameItem={handleRenameItem}
        onDeleteItem={handleDeleteItem}
        isOpen={isSidebarOpen}
      />

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadCode} />
      <input type="file" ref={zipInputRef} className="hidden" accept=".zip" onChange={handleUploadZip} />

      <PanelGroup direction="horizontal">
        <Panel defaultSize={70} minSize={40}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={30}>
              {/* LEFT SECTION: Editor Layout */}
              <div className="flex flex-col h-full bg-background relative min-w-0">
                {/* Editor Tab Bar */}
                <div className="flex items-center justify-between border-b border-border bg-surface-muted shrink-0 sticky top-0 z-10 w-full pr-4 h-12">
                  <div className="flex shrink-0 overflow-x-auto text-sm custom-scrollbar h-full flex-1 min-w-0">
                    {tabs.map((tab) => (
                      <div
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`flex items-center gap-2 px-4 h-full border-r border-border min-w-[140px] max-w-[220px] cursor-pointer group transition-colors relative ${activeTabId === tab.id
                          ? 'bg-[var(--surface)] text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]'
                          }`}
                      >
                        {tab.id === activeTabId && <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--brand)]" />}
                        <div className="flex items-center gap-2 w-full overflow-hidden">
                          {(() => {
                            const name = tab.filename.toLowerCase();
                            if (name.endsWith('.tsx') || name.endsWith('.jsx')) {
                              return <svg className="w-4 h-4 text-[#61dafb] shrink-0" viewBox="0 0 114 114" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M57 91.9C37.07 91.9 20 84.15 20 74.45C20 64.75 37.07 57 57 57C76.93 57 94 64.75 94 74.45C94 84.15 76.93 91.9 57 91.9ZM57 61.2C40.4 61.2 26.6 67.2 26.6 74.45C26.6 81.7 40.4 87.7 57 87.7C73.6 87.7 87.4 81.7 87.4 74.45C87.4 67.2 73.6 61.2 57 61.2Z" fill="currentColor" /><path d="M39.55 101.9C29.6 84.6 33.7 65.4 48.7 56.65C63.7 47.9 83.95 52.8 93.9 70.1C103.85 87.4 99.75 106.6 84.75 115.35C69.75 124.1 49.5 119.2 39.55 101.9ZM87.85 73.65C79.8 60 63.6 56.1 52.1 62.8C40.6 69.5 37.3 84.2 45.35 97.85C53.4 111.5 69.6 115.4 81.1 108.7C92.6 102 95.9 87.3 87.85 73.65Z" fill="currentColor" /><path d="M74.45 101.9C84.4 84.6 80.3 65.4 65.3 56.65C50.3 47.9 30.05 52.8 20.1 70.1C10.15 87.4 14.25 106.6 29.25 115.35C44.25 124.1 64.5 119.2 74.45 101.9ZM26.15 73.65C34.2 60 50.4 56.1 61.9 62.8C73.4 69.5 76.7 84.2 68.65 97.85C60.6 111.5 44.4 115.4 32.9 108.7C21.4 102 18.1 87.3 26.15 73.65Z" fill="currentColor" /><circle cx="57" cy="74.45" r="7.4" fill="currentColor" /></svg>;
                            } else if (name.endsWith('.ts')) {
                              return <svg className="w-4 h-4 text-[#3178c6] shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="currentColor" /><path d="M12.9231 15.6562H9V27H12.9231V18.7344H14.8906V15.6562H12.9231ZM27 21.0938C27 18.4688 24.2769 17.5 22.1846 16.9219C20.6462 16.5156 19.8923 16.2031 19.8923 15.4688C19.8923 14.8125 20.3692 14.4062 21.3692 14.4062C22.2154 14.4062 23.3385 14.8125 23.8308 15.9062L26.4769 14.3438C25.4308 12.0625 23.5077 11.25 21.4308 11.25C18.6769 11.25 16.1231 12.8125 16.1231 15.75C16.1231 18.7188 19.1692 19.5 21.1692 20.0625C22.6923 20.4844 23.2308 20.9375 23.2308 21.75C23.2308 22.4063 22.6154 22.9531 21.4154 22.9531C20.4923 22.9531 19.1692 22.2969 18.5385 20.9219L15.6308 22.5625C16.6308 24.9688 19.0615 26.25 21.5077 26.25C24.3692 26.25 27 24.5781 27 21.0938Z" fill="white" /></svg>;
                            } else if (name.endsWith('.js') || name.endsWith('.mjs')) {
                              return <svg className="w-4 h-4 text-[#f7df1e] shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="currentColor" /><path d="M12.9231 15.6562H9V23.75C9 25.1094 9.93846 26.25 11.4462 26.25C12.8308 26.25 13.9846 25.1719 14.1231 23.8281L11.3385 23.4688C11.2615 24 10.9538 24.25 10.4923 24.25C10.0154 24.25 9.8 24 9.8 23.25V15.6562H12.9231ZM27 21.0938C27 18.4688 24.2769 17.5 22.1846 16.9219C20.6462 16.5156 19.8923 16.2031 19.8923 15.4688C19.8923 14.8125 20.3692 14.4062 21.3692 14.4062C22.2154 14.4062 23.3385 14.8125 23.8308 15.9062L26.4769 14.3438C25.4308 12.0625 23.5077 11.25 21.4308 11.25C18.6769 11.25 16.1231 12.8125 16.1231 15.75C16.1231 18.7188 19.1692 19.5 21.1692 20.0625C22.6923 20.4844 23.2308 20.9375 23.2308 21.75C23.2308 22.4063 22.6154 22.9531 21.4154 22.9531C20.4923 22.9531 19.1692 22.2969 18.5385 20.9219L15.6308 22.5625C16.6308 24.9688 19.0615 26.25 21.5077 26.25C24.3692 26.25 27 24.5781 27 21.0938Z" fill="black" /></svg>;
                            } else if (name.endsWith('.json')) {
                              return <svg className="w-4 h-4 text-[#cbcb41]" fill="currentColor" viewBox="0 0 24 24"><path d="M5.5 12c0-1.5-1-2-2-2H3v-2h.5c1 0 2-.5 2-2V4h2v2c0 2 1.5 2.5 2.5 2.5H11v2h-1c-1 0-2.5.5-2.5 2.5s1.5 2.5 2.5 2.5h1v2h-1c-1 0-2.5.5-2.5 2.5V20h-2v-2c0-1.5-1-2-2-2H3v-2h.5c1 0 2-.5 2-2zm13 0c0-1.5 1-2 2-2h.5v-2H21c-1 0-2-.5-2-2V4h-2v2c0 2-1.5 2.5-2.5 2.5H13v2h1c1 0 2.5.5 2.5 2.5s-1.5 2.5-2.5 2.5h-1v2h1c1 0 2.5.5 2.5 2.5V20h2v-2c0-1.5 1-2 2-2h.5v-2H21c-1 0-2-.5-2-2z" /></svg>;
                            } else if (name.endsWith('.css')) {
                              return <svg className="w-4 h-4 text-[#264de4]" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.16l-.24-2.65H3.64l.87 9.87h12.5l-.54 5.99-4.5.11-4.52-1.22-.3-3.34H4.37l.45 5.56L11.97 20l7.15-1.95.84-9.35H7.13l-.2-2.18h11.66v-2.36z" /></svg>;
                            } else if (name.endsWith('.ico') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) {
                              return <svg className="w-4 h-4 text-[#a074c4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
                            } else if (name.endsWith('.html')) {
                              return <svg className="w-4 h-4 text-[#e34f26]" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.16l-.24-2.65H3.64l.87 9.87h12.5l-.54 5.99-4.5.11-4.52-1.22-.3-3.34H4.37l.45 5.56L11.97 20l7.15-1.95.84-9.35H7.13l-.2-2.18h11.66v-2.36z" /></svg>;
                            } else if (name.includes('.config') || name.endsWith('.mjs') || name.endsWith('.cjs') || name.startsWith('.env') || name === '.gitignore' || name === 'package.json') {
                              return <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
                            }
                            // Generic File
                            return <svg className="w-4 h-4 text-text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
                          })()}
                          <span className="truncate SelectNone text-[13px] pt-px">{tab.filename}</span>
                        </div>
                        <button
                          onClick={(e) => handleCloseTab(e, tab.id)}
                          className={`ml-auto shrink-0 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-foreground/10 p-1 transition-opacity ${tab.id === activeTabId ? 'opacity-100' : ''}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Toolbar Actions (Right side of tab bar) */}
                  <div className="flex items-center gap-2 pr-2 shrink-0">
                    {pendingEdits.length > 0 && (
                      <div className="flex gap-2 animate-pulse mr-2">
                        <button onClick={rejectAllEdits} className="px-3 py-1 text-xs bg-red-500/10 text-red-500 border border-red-500/30 rounded shadow-sm hover:bg-red-500 hover:text-white transition-all">Reject</button>
                        <button onClick={acceptAllEdits} className="px-3 py-1 text-xs bg-[var(--brand)]/20 text-[var(--brand)] border border-[var(--brand)]/40 rounded shadow-sm hover:bg-[var(--brand)] hover:text-[#050507] transition-all font-bold">Accept Fixes</button>
                      </div>
                    )}

                    <button onClick={() => {
                      if (!activeTab) return;
                      // Update virtual file system
                      setFiles(prev => {
                        const updateNode = (nodes: FileNode[]): FileNode[] => {
                          return nodes.map(node => {
                            if (node.id === activeTab.id) return { ...node, content: activeTab.code };
                            if (node.children) return { ...node, children: updateNode(node.children) };
                            return node;
                          });
                        };
                        return updateNode(prev);
                      });
                      // Trigger download
                      handleDownload();
                    }} disabled={!activeTab} className="px-3 py-1 text-xs bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--border)] rounded shadow-sm hover:bg-[var(--surface)] hover:text-[var(--text-primary)] hover:border-[var(--brand)]/30 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--brand)]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      Save & Download
                    </button>

                    <div className="relative" ref={uploadMenuRef}>
                      <button
                        onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
                        title="Upload Local File"
                        className={`p-1.5 rounded transition-colors hidden lg:block ${isUploadMenuOpen ? 'bg-foreground/10 text-white' : 'text-text-secondary hover:bg-foreground/10'}`}
                      >
                        <Upload className="w-4 h-4" />
                      </button>

                      {isUploadMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in duration-100">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full text-left px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--brand)] hover:text-[#050507] transition-colors flex items-center gap-2"
                          >
                            <FileUp className="w-3.5 h-3.5" />
                            Single File
                          </button>
                          <button
                            onClick={() => zipInputRef.current?.click()}
                            className="w-full text-left px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--brand)] hover:text-[#050507] transition-colors flex flex-col items-start justify-center group"
                          >
                            <div className="flex items-center gap-2">
                              <FolderArchive className="w-3.5 h-3.5" />
                              Zip Folder
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)] group-hover:text-[#050507]/70 ml-5.5 pl-1.5 -mt-0.5">Max 10MB Limit</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => runAnalysis()} disabled={(!activeTab && files.length === 0) || isAnalyzing} className="ml-2 text-xs px-3 py-1.5 bg-[var(--brand-light)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-[#050507] border border-[var(--brand)]/30 rounded font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 focus:ring-offset-1 focus:ring-offset-[var(--surface-muted)]">
                      <Activity className="w-3.5 h-3.5" />
                      Analyze
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative bg-background overflow-hidden">
                  {!activeTab ? (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted font-medium">
                      Select or create a file in the Explorer.
                    </div>
                  ) : activeTab.type === 'plan' ? (
                    <PlanViewer
                      filename={activeTab.filename}
                      content={activeTab.code}
                    />
                  ) : (
                    <CodeEditor
                      code={activeTab.code}
                      language={activeTab.language}
                      onChange={handleCodeChange}
                      onMount={handleEditorMount}
                    />
                  )}
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="h-1 bg-transparent hover:bg-[var(--brand)]/50 transition-colors cursor-row-resize flex items-center justify-center border-y border-[var(--border)] relative z-20 group">
              <div className="w-8 h-[2px] bg-[var(--border-strong)] rounded-full group-hover:bg-[var(--brand)]" />
            </PanelResizeHandle>

            <Panel defaultSize={40} minSize={15}>
              {/* BOTTOM PANEL: Code Analytics Output */}
              <div className="h-full bg-background flex flex-col overflow-hidden">
                <div className="h-10 border-b border-[var(--border)] flex items-center px-4 bg-[var(--surface-raised)] sticky top-0 z-10 shrink-0">
                  <span className="text-xs font-display font-bold text-[var(--text-primary)] tracking-wider uppercase flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[var(--text-secondary)]" />
                    Terminal
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[var(--surface)]">
                  {!isAnalyzing && !analysis && (
                    <div className="text-sm font-medium text-[var(--text-muted)] flex items-center justify-center h-full">Click "Analyze" to generate a security & performance scan report.</div>
                  )}
                  {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 animate-pulse">
                      <div className="text-sm text-[var(--brand)] font-mono font-medium">
                        Running advanced SAST scan constraints...
                      </div>
                      {analyzingFile && (
                        <div className="text-xs text-[var(--text-secondary)] font-mono">
                          <span className="opacity-50">&gt; Analyzing </span>
                          <span className="text-[var(--text-primary)] font-bold">{analyzingFile}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {analysis && !isAnalyzing && analysis.codeDetected === false && (
                    <div className="animate-fade-in flex flex-col items-center justify-center h-full text-center space-y-3 opacity-70">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">No Code Detected</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[250px] mx-auto">The active file does not contain enough recognizable programming syntax to analyze.</p>
                      </div>
                    </div>
                  )}
                  {analysis && !isAnalyzing && analysis.codeDetected !== false && (
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Score Ring Grid */}
                      <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
                        {[
                          { key: "security", label: "Security", color: "text-green-500", bar: "bg-green-500" },
                          { key: "performance", label: "Performance", color: "text-[var(--brand)]", bar: "bg-[var(--brand)]" },
                          { key: "quality", label: "Code Quality", color: "text-emerald-400", bar: "bg-emerald-400" },
                          { key: "overallRating", label: "Overall Rating", color: "text-[var(--text-primary)]", bar: "bg-[var(--text-primary)]" },
                        ].map(({ key, label, color, bar }) => {
                          const current = analysis[key] as number;
                          const prev = previousAnalysis?.[key] as number | undefined;
                          const delta = prev !== undefined ? current - prev : null;
                          return (
                            <div key={key} className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                              <div className={`text-3xl font-display font-black ${color} mb-0.5`}>{current}</div>
                              {delta !== null && (
                                <div className={`flex items-center gap-0.5 text-[10px] font-bold mb-0.5 ${delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-gray-500"
                                  }`}>
                                  {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}
                                  <span>{delta > 0 ? "+" : ""}{delta}</span>
                                  <span className="text-[9px] font-normal text-gray-500 ml-0.5">from {prev}</span>
                                </div>
                              )}
                              <div className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">{label}</div>
                              <div className="absolute bottom-0 w-full h-1 bg-[var(--border)]">
                                <div className={`h-full ${bar} transition-all duration-700`} style={{ width: `${current}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bug List */}
                      <div className="col-span-1 md:col-span-3">
                        <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center justify-between border-b border-border pb-2">
                          <span>Detected Vulnerabilities ({analysis.bugs?.length || 0})</span>
                          {analysis.bugs?.length > 0 && <span className="text-red-500">Action Required</span>}
                        </h3>
                        {analysis.bugs?.length === 0 ? (
                          <div className="text-xs text-green-500 font-mono bg-green-500/10 border border-green-500/20 p-4 rounded-lg">✓ Perfect codebase. 0 vulnerabilities or bottlenecks detected.</div>
                        ) : (
                          <div className="space-y-2 pr-2">
                            {analysis.bugs?.map((bug: any, i: number) => (
                              <div key={i} className="bg-foreground/5 hover:bg-foreground/10 transition-colors border-l-2 rounded-r-lg p-3 text-xs flex gap-4" style={{ borderLeftColor: bug.severity === 'critical' ? '#ef4444' : bug.severity === 'medium' ? '#fbbf24' : '#9ca3af' }}>
                                <div className="w-16 shrink-0 pt-0.5">
                                  {bug.filename && <div className="text-[9px] text-text-secondary mb-0.5 truncate max-w-full" title={bug.filename}>{bug.filename}</div>}
                                  <span className={`font-mono font-bold ${bug.severity === 'critical' ? 'text-red-500' : 'text-amber-400'}`}>Line {bug.line}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-zinc-200 mb-0.5">{bug.category} <span className="text-text-secondary font-normal ml-2">({bug.severity})</span></div>
                                  <div className="text-text-secondary leading-snug">{bug.message}</div>
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

        <PanelResizeHandle className="w-1 bg-transparent hover:bg-[var(--brand)]/50 transition-colors cursor-col-resize flex flex-col items-center justify-center border-x border-[var(--border)] relative z-20 group">
          <div className="w-[2px] h-8 bg-[var(--border-strong)] rounded-full group-hover:bg-[var(--brand)]" />
        </PanelResizeHandle>

        <Panel defaultSize={30} minSize={20} maxSize={50}>
          {/* RIGHT SECTION: Chatbot (CodeRefine Agent) */}
          <div className="h-full flex flex-col bg-background">
            <ChatPanel
              messages={messages}
              input={input}
              setInput={setInput}
              onSubmit={handleChatSubmit}
              isLoading={isLoading}
              onAcceptChanges={handleAcceptChanges}
              onRejectChanges={handleRejectChanges}
              onReviewPlan={handleReviewPlan}
              attachedFile={attachedFile}
              onAttachFile={setAttachedFile}
              onDetachFile={() => setAttachedFile(null)}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              onFileClick={handleFileSelect}
            />
          </div>
        </Panel>
      </PanelGroup >
    </div >
  );
}
