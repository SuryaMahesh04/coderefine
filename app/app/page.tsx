"use client";

import { useState, useRef, useEffect } from "react";
import CodeEditor from "../../components/CodeEditor";
import ChatPanel, { type Message } from "../../components/ChatPanel";
import Sidebar from "../../components/Sidebar";
import FileExplorer, { type FileNode, type FileNodeType } from "../../components/FileExplorer";
import { analyzeCode } from "../actions/chat";
import { executeCode } from "../actions/execute";
import { analyzeCodebase } from "../actions/analyze";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import JSZip from "jszip";

const EXTENSION_MAP: Record<string, string> = {
  "ts": "typescript", "tsx": "typescript", "js": "javascript", "jsx": "javascript",
  "py": "python", "cpp": "cpp", "c": "c", "java": "java", "go": "go", "rs": "rust"
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

  const activeTab = tabs.find(t => t.id === activeTabId) || null;

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


  const handleFileSelect = (id: string) => {
    const node = findNodeById(files, id);
    if (!node || node.type !== "file") return;

    // If not already a tab, create a new tab for it
    if (!tabs.find(t => t.id === id)) {
      const newTab: Tab = {
        id: node.id,
        filename: node.name,
        language: node.language || "typescript",
        code: node.content !== undefined ? node.content : "// New empty file"
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
    setAnalysis(null);
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
  const extractAllFiles = (nodes: FileNode[]): { filename: string, code: string }[] => {
    let result: { filename: string, code: string }[] = [];
    for (const node of nodes) {
      if (node.type === "file") {
        // If the file is open in a tab, use the tab's code, otherwise use node.content
        const openTab = tabs.find(t => t.id === node.id);
        result.push({
          filename: node.name,
          code: openTab ? openTab.code : (node.content || "")
        });
      } else if (node.children) {
        result.push(...extractAllFiles(node.children));
      }
    }
    return result;
  };

  const runAnalysis = async () => {
    if (!activeTab && files.length === 0) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    // Gather all files for analysis
    const allFiles = extractAllFiles(files);

    // If we only have one file and it's empty, prevent analysis (or just send it)
    if (allFiles.length === 0 && activeTab) {
      allFiles.push({ filename: activeTab.filename, code: activeTab.code });
    }

    const result = await analyzeCodebase(allFiles);
    setAnalysis(result);
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
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "agent", content: "Please open a specific file to execute." }]);
        setIsLoading(false);
        return;
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "agent", content: "Compiling..." }]);
      const res = await executeCode(activeTab.code, activeTab.language);
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
      let codeContext = "";
      if (activeTab) {
        codeContext = activeTab.code;
      } else {
        const allFiles = extractAllFiles(files);
        codeContext = allFiles.map(f => `File: ${f.filename}\n---\n${f.code}\n---`).join('\n\n');
      }

      const result = await analyzeCode(codeContext, userMessage, { analysis, execution: lastExecution });
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

    let offset = 0;

    // Filter changes to only those belonging to the currently active tab
    // We assume the activeTab filename matches the change.filename. If filename is missing, we assume it belongs to the current file (backwards compatibility).
    const activeFileChanges = changes.filter(c => !c.filename || c.filename === activeTab?.filename);
    const sortedChanges = [...activeFileChanges].sort((a, b) => a.line - b.line);

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
        options: {
          isWholeLine: true, className: "bg-red-500/20 border-l-2 border-red-500 line-through text-red-300 opacity-60",
          hoverMessage: { value: "**Removed by AI**" }
        }
      });

      newDecorations.push({
        range: new monaco.Range(actualLine + 1, 1, actualLine + 1, 1),
        options: {
          isWholeLine: true, className: "bg-green-500/20 border-l-2 border-green-500",
          hoverMessage: { value: `**AI Fix (${change.category}):** ${change.reason}` }
        }
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

    editor.executeEdits('ai-accept', editsToRun.map(edit => {
      return {
        range: new monacoRef.current.Range(edit.originalLine, 1, edit.originalLine + 1, 1),
        text: "",
        forceMoveMarkers: true
      };
    }));

    clearDecorations();
    setPendingEdits([]);
  };

  const rejectAllEdits = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const editsToRun = [...pendingEdits].sort((a, b) => b.newLine - a.newLine);

    editor.executeEdits('ai-reject', editsToRun.map(edit => {
      return {
        range: new monacoRef.current.Range(edit.newLine - 1, 9999, edit.newLine, editor.getModel().getLineContent(edit.newLine).length + 1),
        text: "",
        forceMoveMarkers: true
      };
    }));

    clearDecorations();
    setPendingEdits([]);
  };

  return (
    <div className="flex w-full h-screen bg-[#0e0e10] text-zinc-300 overflow-hidden font-sans">
      <Sidebar explorerOpen={explorerOpen} onToggleExplorer={() => setExplorerOpen(!explorerOpen)} />

      <FileExplorer
        files={files}
        activeFileId={activeTabId}
        selectedContextId={selectedContextId}
        onFileSelect={handleFileSelect}
        onContextSelect={setSelectedContextId}
        onToggleFolder={handleToggleFolder}
        onNewItem={handleNewItem}
        isOpen={isSidebarOpen}
      />

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadCode} />
      <input type="file" ref={zipInputRef} className="hidden" accept=".zip" onChange={handleUploadZip} />

      <PanelGroup direction="horizontal">
        <Panel defaultSize={70} minSize={40}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={60} minSize={30}>
              {/* LEFT SECTION: Editor Layout */}
              <div className="flex flex-col h-full bg-[#0e0e10] relative min-w-0">
                {/* Editor Tab Bar */}
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#141416] shrink-0 sticky top-0 z-10 w-full pr-4">
                  <div className="flex h-10 shrink-0 overflow-x-auto custom-scrollbar flex-1 min-w-0">
                    {tabs.map((tab) => (
                      <div
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`flex items-center gap-2 px-4 border-r border-white/[0.06] min-w-[120px] max-w-[200px] cursor-pointer group transition-colors relative ${activeTabId === tab.id
                          ? 'bg-[#1e1e24] text-white'
                          : 'text-zinc-500 hover:bg-[#1a1a1e] hover:text-zinc-300'
                          }`}
                      >
                        {tab.id === activeTabId && <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />}
                        <div className={`w-2 h-2 rounded-full ${LANGUAGE_COLORS[tab.language] || "bg-zinc-500"}`} />
                        <span>{tab.filename}</span>
                        <button
                          onClick={(e) => handleCloseTab(e, tab.id)}
                          className={`ml-1 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-white/10 p-0.5 transition-opacity ${tab.id === activeTabId ? 'opacity-100' : ''}`}
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
                        <button onClick={acceptAllEdits} className="px-3 py-1 text-xs bg-green-500/10 text-green-500 border border-green-500/30 rounded shadow-sm hover:bg-green-500 hover:text-white transition-all font-bold">Accept Fixes</button>
                      </div>
                    )}
                    <button onClick={handleDownload} title="Download File" className="p-1.5 text-zinc-400 hover:bg-white/10 rounded transition-colors" disabled={!activeTab}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <div className="relative" ref={uploadMenuRef}>
                      <button
                        onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
                        title="Upload Local File"
                        className={`p-1.5 rounded transition-colors hidden lg:block ${isUploadMenuOpen ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/10'}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      </button>

                      {isUploadMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e1e24] border border-white/10 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in duration-100">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-blue-500 hover:text-white transition-colors flex items-center gap-2"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Single File
                          </button>
                          <button
                            onClick={() => zipInputRef.current?.click()}
                            className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-blue-500 hover:text-white transition-colors flex flex-col items-start justify-center group"
                          >
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                              Zip Folder
                            </div>
                            <span className="text-[9px] text-zinc-500 group-hover:text-white/70 ml-5.5 pl-1.5 -mt-0.5">Max 10MB Limit</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <button onClick={runAnalysis} disabled={(!activeTab && files.length === 0) || isAnalyzing} className="ml-2 text-xs px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 rounded font-medium transition-all disabled:opacity-50 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      Analyze
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative bg-[#0e0e10]">
                  {!activeTab ? (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-medium">
                      Select or create a file in the Explorer.
                    </div>
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

            <PanelResizeHandle className="h-1 bg-transparent hover:bg-blue-500/50 transition-colors cursor-row-resize flex items-center justify-center border-y border-white/[0.06] relative z-20 group">
              <div className="w-8 h-[2px] bg-white/10 rounded-full group-hover:bg-blue-400" />
            </PanelResizeHandle>

            <Panel defaultSize={40} minSize={15}>
              {/* BOTTOM PANEL: Code Analytics Output */}
              <div className="h-full bg-[#0e0e10] flex flex-col overflow-hidden">
                <div className="h-10 border-b border-white/[0.06] flex items-center px-4 bg-[#141416] sticky top-0 z-10 shrink-0">
                  <span className="text-xs font-semibold text-zinc-300 tracking-wider uppercase flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Terminal
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0e0e10]">
                  {!isAnalyzing && !analysis && (
                    <div className="text-sm text-zinc-600 flex items-center justify-center h-full">Click "Analyze" to generate a security & performance scan report.</div>
                  )}
                  {isAnalyzing && (
                    <div className="text-sm text-blue-500 font-mono flex items-center justify-center h-full animate-pulse">Running advanced SAST scan constraints...</div>
                  )}
                  {analysis && !isAnalyzing && (
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Score Ring Grid */}
                      {/* Score Ring Grid */}
                      <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
                        <div className="bg-[#1a1a1e] border border-white/[0.06] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="text-3xl font-black text-green-500 font-mono mb-1">{analysis.security}</div>
                          <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Security</div>
                          <div className="absolute bottom-0 w-full h-1 bg-white/5"><div className="h-full bg-green-500 animate-pulse" style={{ width: `${analysis.security}%` }}></div></div>
                        </div>
                        <div className="bg-[#1a1a1e] border border-white/[0.06] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="text-3xl font-black text-blue-500 font-mono mb-1">{analysis.performance}</div>
                          <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Performance</div>
                          <div className="absolute bottom-0 w-full h-1 bg-white/5"><div className="h-full bg-blue-500 animate-pulse" style={{ width: `${analysis.performance}%` }}></div></div>
                        </div>
                        <div className="bg-[#1a1a1e] border border-white/[0.06] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="text-3xl font-black text-amber-400 font-mono mb-1">{analysis.quality}</div>
                          <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Code Quality</div>
                          <div className="absolute bottom-0 w-full h-1 bg-white/5"><div className="h-full bg-amber-400 animate-pulse" style={{ width: `${analysis.quality}%` }}></div></div>
                        </div>
                        <div className="bg-[#1a1a1e] border border-white/[0.06] rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="text-3xl font-black text-purple-500 font-mono mb-1">{analysis.overallRating}</div>
                          <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Overall Rating</div>
                          <div className="absolute bottom-0 w-full h-1 bg-white/5"><div className="h-full bg-purple-500 animate-pulse" style={{ width: `${analysis.overallRating}%` }}></div></div>
                        </div>
                      </div>

                      {/* Bug List */}
                      <div className="col-span-1 md:col-span-3">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2">
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
                                  {bug.filename && <div className="text-[9px] text-zinc-500 mb-0.5 truncate max-w-full" title={bug.filename}>{bug.filename}</div>}
                                  <span className={`font-mono font-bold ${bug.severity === 'critical' ? 'text-red-500' : 'text-amber-400'}`}>Line {bug.line}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-zinc-200 mb-0.5">{bug.category} <span className="text-zinc-500 font-normal ml-2">({bug.severity})</span></div>
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

        <PanelResizeHandle className="w-1 bg-transparent hover:bg-blue-500/50 transition-colors cursor-col-resize flex flex-col items-center justify-center border-x border-white/[0.06] relative z-20 group">
          <div className="w-[2px] h-8 bg-white/10 rounded-full group-hover:bg-blue-400" />
        </PanelResizeHandle>

        <Panel defaultSize={30} minSize={20} maxSize={50}>
          {/* RIGHT SECTION: Chatbot (CodeRefine Agent) */}
          <div className="h-full flex flex-col bg-[#0e0e10]">
            <ChatPanel messages={messages} input={input} setInput={setInput} onSubmit={handleChatSubmit} isLoading={isLoading} />
          </div>
        </Panel>
      </PanelGroup >
    </div >
  );
}
