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
import { Download, Upload, FileUp, FolderArchive, Activity, Terminal, User, LogOut, LayoutDashboard, Settings, ChevronDown, Plus, MessageSquare, Trash2, History, Clock } from "lucide-react";
import DiffViewer from "../../components/DiffViewer";
import EditorHeader from "../../components/EditorHeader";
import ArtifactsView, { Artifact } from "../../components/ArtifactsView";
import { saveHistoryEntry, appendEditsToLatestHistory } from "../../lib/historyStore";
import { getSessions, saveSession, deleteSession, getCurrentSessionId, setCurrentSessionId, type ChatSession } from "../../lib/chatStore";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";


const EXTENSION_MAP: Record<string, string> = {
  "ts": "typescript", "tsx": "typescript", "js": "javascript", "jsx": "javascript",
  "py": "python", "cpp": "cpp", "c": "c", "java": "java", "go": "go", "rs": "rust",
  "cs": "csharp", "php": "php", "rb": "ruby", "swift": "swift", "kt": "kotlin",
  "html": "html", "css": "css", "sql": "sql", "md": "markdown"
};

const LANGUAGE_TEMPLATES: Record<string, string> = {
  javascript: `// Welcome to Loom AI Sandbox!\n// JavaScript Template\n\nfunction calculateSum(arr) {\n  let sum = 0;\n  for(let i=0; i < arr.length; i++){\n    sum += arr[i];\n  }\n  return sum;\n}\n\nconsole.log(calculateSum([1, 2, 3]));\n`,
  typescript: `// Welcome to Loom AI Sandbox!\n// TypeScript Template\n\nfunction calculateSum(arr: number[]): number {\n  let sum = 0;\n  for(let i=0; i < arr.length; i++){\n    sum += arr[i];\n  }\n  return sum;\n}\n\nfunction getUser(id: string) {\n  // Hardcoded API key and SQL Injection vulnerabilities\n  const apiKey = "SK-1234567890-SECRET-KEY";\n  const query = \`SELECT * FROM users WHERE id=\${id}\`;\n  \n  return db.execute(query);\n}\n`,
  python: `# Welcome to Loom AI Sandbox!\n# Python Template\n\ndef calculate_sum(arr):\n    return sum(arr)\n\nprint(calculate_sum([1, 2, 3]))\n`,
  cpp: `// Welcome to Loom AI Sandbox!\n// C++ Template\n\n#include <iostream>\n#include <vector>\n\nint calculateSum(const std::vector<int>& arr) {\n    int sum = 0;\n    for(int num : arr) {\n        sum += num;\n    }\n    return sum;\n}\n\nint main() {\n    std::vector<int> numbers = {1, 2, 3};\n    std::cout << calculateSum(numbers) << std::endl;\n    return 0;\n}\n`,
  go: `// Welcome to Loom AI Sandbox!\n// Go Template\n\npackage main\n\nimport "fmt"\n\nfunc calculateSum(arr []int) int {\n    sum := 0\n    for _, num := range arr {\n        sum += num\n    }\n    return sum\n}\n\nfunc main() {\n    fmt.Println(calculateSum([]int{1, 2, 3}))\n}\n`,
  java: `// Welcome to Loom AI Sandbox!\n// Java Template\n\npublic class Main {\n    public static int calculateSum(int[] arr) {\n        int sum = 0;\n        for (int num : arr) {\n            sum += num;\n        }\n        return sum;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(calculateSum(new int[]{1, 2, 3}));\n    }\n}\n`,
  rust: `// Welcome to Loom AI Sandbox!\n// Rust Template\n\nfn calculate_sum(arr: &[i32]) -> i32 {\n    arr.iter().sum()\n}\n\nfn main() {\n    let numbers = [1, 2, 3];\n    println!("{}", calculate_sum(&numbers));\n}\n`
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
  const { data: session, status } = useSession();
  const router = useRouter();

  const [explorerOpen, setExplorerOpen] = useState(true);

  // File System & Tabs State
  const [files, setFiles] = useState<FileNode[]>([
    { id: "root-file-1", name: "main.ts", type: "file", language: "typescript" },
  ]);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "root-file-1", filename: "main.ts", language: "typescript", code: "// Welcome to Loom AI\n// Start coding here..." }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("root-file-1");
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isExplorerVisible, setIsExplorerVisible] = useState(true);
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
  const [lastReportId, setLastReportId] = useState<string | null>(null);
  
  // Multi-session State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(null);

  // Diff State
  const [originalCodes, setOriginalCodes] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);

  // Artifacts State
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load chat sessions on mount
  useEffect(() => {
    const loadedSessions = getSessions();
    setSessions(loadedSessions);

    const savedId = getCurrentSessionId();
    const targetSession = savedId 
      ? loadedSessions.find(s => s.id === savedId) 
      : loadedSessions[0];

    if (targetSession) {
      // Directly load the session data without calling helper (avoids stale closure)
      setCurrentSessionIdState(targetSession.id);
      setCurrentSessionId(targetSession.id);
      setMessages(targetSession.messages || []);
    } else {
      // No sessions exist — create a new one
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId, title: "New Chat",
        createdAt: Date.now(), updatedAt: Date.now(), messages: []
      };
      setSessions([newSession]);
      setCurrentSessionIdState(newId);
      setCurrentSessionId(newId);
      saveSession(newSession);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionIdState(newId);
    setCurrentSessionId(newId);
    setMessages([]);
    saveSession(newSession);
  };

  const handleSwitchSession = (id: string) => {
    console.log("Switching to session:", id);
    const session = getSessions().find(s => s.id === id);
    if (session) {
      setCurrentSessionIdState(id);
      setCurrentSessionId(id);
      setMessages(session.messages || []);
    }
  };

  // Helper for relative time
  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return "Just now";
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / 86400000);
    if (days === 1) return "Yesterday";
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      const remaining = getSessions();
      if (remaining.length > 0) {
        handleSwitchSession(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Expose global handlers for components
  useEffect(() => {
    (window as any).handleNewChat = handleNewChat;
  }, [handleNewChat]);

  if (status === "loading" || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-t-[#00E5FF] border-white/20 rounded-full animate-spin" />
    </div>;
  }

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
    if (newTab?.type === 'plan') {
      // maybe do something else, but don't clear analysis
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

  const handleDownloadAll = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();
    
    // Helper to recursively add files to zip
    const addToZip = (nodes: FileNode[], currentPath: string) => {
      for (const node of nodes) {
        const path = currentPath ? `${currentPath}/${node.name}` : node.name;
        if (node.type === "file") {
          // Use tab content if open, else node content
          const openTab = tabs.find(t => t.id === node.id);
          const content = openTab ? openTab.code : (node.content || "");
          zip.file(path, content);
        } else if (node.children) {
          addToZip(node.children, path);
        }
      }
    };

    addToZip(files, "");
    
    // Generate Refinement Summary if analysis exists
    if (analysis && analysis.codeDetected !== false) {
      const summaryContent = `# Loom AI Session Summary
Generated: ${new Date().toLocaleString()}

## Final Analysis Scores
- Security: ${analysis.security}/100
- Performance: ${analysis.performance}/100
- Quality: ${analysis.quality}/100
- Overall Rating: ${analysis.overallRating}/100

## Detected Vulnerabilities & Issues
${analysis.bugs?.length === 0 ? "No issues detected. Perfect codebase!" : analysis.bugs?.map((bug: any) => 
`- [${bug.severity.toUpperCase()}] ${bug.category} in ${bug.filename} (Line ${bug.line}): ${bug.message}`
).join('\n')}

---
*Generated by Loom AI Enterprise Pipeline*
`;
      zip.file("REFINEMENT_SUMMARY.md", summaryContent);
    }
    
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loom-ai-workspace.zip";
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
    if (analysis) {
      setPreviousAnalysis(analysis);
    }
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
    setPreviousAnalysis(analysis);

    // Save to database
    if (session && status === "authenticated") {
      try {
        const reportRes = await fetch("/api/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scores: {
              security: result?.security || 0,
              performance: result?.performance || 0,
              quality: result?.quality || 0,
              overallRating: result?.overallRating || 0
            },
            bugs: result?.bugs || [],
            filesAnalyzed: filesToAnalyze.map(f => f.filename),
            appliedEdits: []
          }),
        });
        if (reportRes.ok) {
          const data = await reportRes.json();
          if (data.report?._id) {
            setLastReportId(data.report._id);
          }
        }
      } catch (e) {
        console.error("Failed to save analysis to DB:", e);
      }
    }

    setAnalyzingFile(null);
    setIsAnalyzing(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || (!activeTab && files.length === 0)) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    // Save to session immediately
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        const updatedSession = { ...session, messages: newMessages, updatedAt: Date.now() };
        if (session.messages.length === 0) updatedSession.title = userMessage.slice(0, 30) + (userMessage.length > 30 ? "..." : "");
        saveSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === currentSessionId ? updatedSession : s));
      }
    }

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
      // Always pass the full workspace for tool access in route.ts
      const workspaceFiles = allFiles.map(f => ({ path: f.filename, content: f.code }));
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
          history: messages,
          context: {
            ...terminalContext,
            workspace: workspaceFiles
          },
          selectedModel: selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Request failed with status ${response.status}`;
        
        setMessages(prev => prev.map(msg => {
          if (msg.id !== agentMsgId) return msg;
          return { ...msg, content: errorMessage, thoughts: ["API Error"] };
        }));
        setIsLoading(false);
        return;
      }

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
              // Append to the LATEST step if one exists and is running, else to message level
              const lastStepIdx = (msg.steps?.length || 0) - 1;
              if (lastStepIdx >= 0 && msg.steps![lastStepIdx].status === "running") {
                const newSteps = [...(msg.steps || [])];
                newSteps[lastStepIdx] = { 
                  ...newSteps[lastStepIdx], 
                  thoughts: [...(newSteps[lastStepIdx].thoughts || []), content] 
                };
                return { ...msg, steps: newSteps };
              }
              return { ...msg, thoughts: [...(msg.thoughts || []), content] };
            }
            if (type === "RESEARCH") {
              return { ...msg, findings: [...(msg.findings || []), content] };
            }
            if (type === "IMAGE") {
              try {
                const img = JSON.parse(content);
                return { ...msg, images: [...(msg.images || []), img] };
              } catch (e) { return msg; }
            }
            if (type === "BROWSER") {
              try {
                const res = JSON.parse(content);
                return { ...msg, browserResults: [...(msg.browserResults || []), res] };
              } catch (e) { return msg; }
            }
            if (type === "ARTIFACT") {
              try {
                const art = JSON.parse(content);
                setArtifacts(prev => {
                  const existingIdx = prev.findIndex(a => a.id === art.id || a.name === art.name);
                  if (existingIdx !== -1) {
                    const next = [...prev];
                    next[existingIdx] = { ...next[existingIdx], ...art };
                    return next;
                  }
                  return [...prev, art];
                });
                setIsArtifactsOpen(true);
                
                // Also attach to the message for stream rendering
                return { ...msg, artifacts: [...(msg.artifacts || []), art] };
              } catch (e) { console.error("Failed to parse artifact:", content); return msg; }
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
                const stepData = JSON.parse(content);
                const existingStepIdx = msg.steps?.findIndex(s => s.name === stepData.name);
                let newSteps = [...(msg.steps || [])];
                
                if (existingStepIdx !== undefined && existingStepIdx !== -1) {
                  const existingStep = newSteps[existingStepIdx];
                  // If status is changing to 'done', calculate duration
                  let duration = existingStep.thoughtDuration;
                  if (stepData.status === "done" && existingStep.status === "running") {
                    duration = Math.round((Date.now() - (existingStep as any)._startTime || Date.now()) / 1000);
                  }
                  
                  newSteps[existingStepIdx] = { ...existingStep, ...stepData, thoughtDuration: duration };
                } else {
                  // New step — start timer
                  newSteps.push({ ...stepData, _startTime: Date.now() });
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

      // Ensure all steps are marked as done after stream ends
      setMessages(prev => prev.map(msg => {
        if (msg.id !== agentMsgId) return msg;
        const newSteps = (msg.steps || []).map(s => 
          s.status === "running" ? { ...s, status: "done" as const } : s
        );
        return { ...msg, steps: newSteps };
      }));

      // Final save to session after stream ends
      if (currentSessionId) {
        const session = getSessions().find(s => s.id === currentSessionId);
        if (session) {
          saveSession({ ...session, messages: messages, updatedAt: Date.now() });
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

      // ── SINGLE AUTONOMOUS EXECUTION STREAM ──
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "execute",
          code: targetTab?.code || "", // Initial context
          context: {
            plan: msg.content,
            isMultiFile: true,
            targetFile: targetTab?.filename || "",
            analysis: analysis ? {
              scores: {
                security: analysis.security,
                performance: analysis.performance,
                quality: analysis.quality,
                overallRating: analysis.overallRating
              },
              scoresHistory: {
                security: analysis.security,
                performance: analysis.performance,
                quality: analysis.quality,
                overallRating: analysis.overallRating
              },
              bugs: analysis.bugs || []
            } : null,
            workspace: extractAllFiles(files).map(f => ({ path: f.filename, content: f.code }))
          },
          selectedModel: selectedModel
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Execution failed with status ${response.status}`;
        
        setMessages(prev => prev.map(m => {
          if (m.id !== explainMsgId) return m;
          return { ...m, content: errorMessage, steps: [{ name: "Execution", status: "pending", summary: "API Error" }] };
        }));
        return;
      }

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

          // ── THOUGHT lines ──
          if (type === "THOUGHT") {
            setMessages(prev => prev.map(m => {
              if (m.id !== explainMsgId) return m;
              const newSteps = [...(m.steps || [])];
              if (newSteps.length > 0) {
                const lastStepIdx = newSteps.length - 1;
                newSteps[lastStepIdx] = {
                  ...newSteps[lastStepIdx],
                  thoughts: [...(newSteps[lastStepIdx].thoughts || []), content]
                };
                return { ...m, steps: newSteps };
              } else {
                return { ...m, thoughts: [...(m.thoughts || []), content] };
              }
            }));
          }

          // ── STEP lines (Tool Calls) ──
          if (type === "STEP") {
            try {
              const step = JSON.parse(content);
              setMessages(prev => prev.map(m => {
                if (m.id !== explainMsgId) return m;
                const newSteps = [...(m.steps || [])];
                const existingIdx = newSteps.findIndex(s => s.name === step.name);
                if (existingIdx !== -1) {
                  newSteps[existingIdx] = step;
                } else {
                  newSteps.push(step);
                }
                return { ...m, steps: newSteps };
              }));
            } catch (e) { }
          }

          // ── FINAL: apply the rewritten code immediately when a file is updated ──
          if (type === "FINAL") {
            try {
              const final = JSON.parse(content);

              if (final.rewrittenCode && final.targetFile) {
                const fileName = final.targetFile;

                // ── INLINE APPLY (ANTIGRAVITY STYLE) ──
                // Store original code for REJECT capability if not already present
                setOriginalCodes(prev => {
                  const currentTab = tabs.find(t => t.filename === fileName);
                  if (prev[fileName]) return prev;
                  return { ...prev, [fileName]: currentTab?.code || "" };
                });

                // Add to pending files list
                setPendingFiles(prev => prev.includes(fileName) ? prev : [...prev, fileName]);

                // Add to payload for re-analysis
                analyzeFilesPayload = analyzeFilesPayload.filter(p => p.filename !== fileName);
                analyzeFilesPayload.push({ filename: fileName, code: final.rewrittenCode });

                // Apply to tab state immediately (This updates the editor because value prop is bound)
                setTabs(prev => prev.map(t =>
                  t.filename === fileName ? { ...t, code: final.rewrittenCode } : t
                ));

                // Apply to Virtual File Tree immediately
                setFiles(prevFiles => {
                  const updateNode = (nodes: FileNode[]): FileNode[] => {
                    return nodes.map(node => {
                      if (node.type === "file" && node.name === fileName) {
                        return { ...node, content: final.rewrittenCode };
                      }
                      if (node.children) return { ...node, children: updateNode(node.children) };
                      return node;
                    });
                  };
                  return updateNode(prevFiles);
                });

                // ── COLLECT FOR DISPLAY ──
                if (!rewrittenFilesDisplay.some(f => f.filename === fileName)) {
                  const allFiles = extractAllFiles(files);
                  const foundNode = allFiles.find(n => n.filename === fileName);
                  rewrittenFilesDisplay.push({ filename: fileName, id: foundNode?.id });
                }

                // Update messages for persistent record
                const newFilePill = { filename: fileName, id: rewrittenFilesDisplay.find(f => f.filename === fileName)?.id };
                setMessages(prev => {
                  const next = prev.map(m => {
                    if (m.id === explainMsgId) {
                      const existingFiles = m.rewrittenFiles || [];
                      if (!existingFiles.some(f => f.filename === fileName)) {
                        return { ...m, rewrittenFiles: [...existingFiles, newFilePill] };
                      }
                    }
                    return m;
                  });
                  return next;
                });
              }
            } catch (e) { console.error("Failed to parse execute FINAL chunk:", e); }
          }
        }
      } // end stream loop

      // Final persistence for Accepted status
      setMessages(prev => {
        const next = prev.map(m => {
          if (m.id === messageId) return { ...m, isAccepted: true };
          return m;
        });
        
        if (currentSessionId) {
          const session = getSessions().find(s => s.id === currentSessionId);
          if (session) {
            saveSession({ ...session, messages: next, updatedAt: Date.now() });
          }
        }
        return next;
      });

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

        // ── TRIGGER FULL RE-ANALYSIS (PROJECT HEALTH) ──
        if (analyzeFilesPayload.length > 0) {
          if (analysis) setPreviousAnalysis(analysis);
          
          // Get the most up-to-date state of all files to ensure the score reflects the fixes
          const finalWorkspace = extractAllFiles(files).map(f => {
            const updated = analyzeFilesPayload.find(p => p.filename === f.filename);
            return updated ? { filename: updated.filename, code: updated.code } : { filename: f.filename, code: f.code };
          });

          setTimeout(() => {
            runAnalysis(finalWorkspace); 
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
    if (!activeTab) return;
    const fileName = activeTab.filename;
    setPendingFiles(prev => prev.filter(f => f !== fileName));
    setOriginalCodes(prev => {
      const next = { ...prev };
      delete next[fileName];
      return next;
    });
    // Trigger re-analysis to confirm improvements
    runAnalysis();
  };

  const rejectAllEdits = () => {
    if (!activeTab) return;
    const fileName = activeTab.filename;
    const original = originalCodes[fileName];
    if (original !== undefined) {
      handleCodeChange(original);
      // Synchronize with File Tree
      setFiles(prevFiles => {
        const updateNode = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.type === "file" && node.name === fileName) {
              return { ...node, content: original };
            }
            if (node.children) return { ...node, children: updateNode(node.children) };
            return node;
          });
        };
        return updateNode(prevFiles);
      });
    }
    setPendingFiles(prev => prev.filter(f => f !== fileName));
    setOriginalCodes(prev => {
      const next = { ...prev };
      delete next[fileName];
      return next;
    });
  };

   return (
    <div className="flex w-full h-screen bg-[#050507] text-text-primary overflow-hidden font-sans">
      <Sidebar explorerOpen={isExplorerVisible} onToggleExplorer={() => setIsExplorerVisible(!isExplorerVisible)} />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <EditorHeader
          activeFilename={activeTab?.filename || null}
          isAnalyzing={isAnalyzing}
          onRunAnalysis={() => runAnalysis()}
          onDownload={handleDownload}
          onDownloadAll={handleDownloadAll}
          onUploadFile={() => fileInputRef.current?.click()}
          onUploadZip={() => zipInputRef.current?.click()}
          onShowArtifacts={() => setIsArtifactsOpen(true)}
          artifactCount={artifacts.length}
          canAnalyze={!!activeTab || files.length > 0}
        />

        <div className="flex-1 flex min-h-0 relative overflow-hidden">
          <PanelGroup direction="horizontal">
            {/* File Explorer Panel */}
            {isExplorerVisible && (
              <>
                <Panel defaultSize={20} minSize={10} maxSize={40}>
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-hidden h-1/2 min-h-[30%]">
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
                        isOpen={true} // Always open within its panel
                      />
                    </div>
                    <div className="flex-1 overflow-hidden min-h-[30%] flex flex-col bg-[#050507]">
                      <div className="h-full flex items-center justify-center p-8 text-center text-[11px] text-text-muted opacity-40 italic">
                        Select a file to begin editing.
                      </div>
                    </div>
                  </div>
                </Panel>
                <PanelResizeHandle className="w-1 bg-transparent hover:bg-[var(--brand)]/50 transition-colors cursor-col-resize flex flex-col items-center justify-center border-x border-border/10 relative z-20 group">
                  <div className="w-[1px] h-8 bg-border/20 rounded-full group-hover:bg-[var(--brand)]" />
                </PanelResizeHandle>
              </>
            )}

            {/* Main Editor & Terminal Area */}
            <Panel defaultSize={55} minSize={30}>
              <PanelGroup direction="vertical">
                {/* Editor Area */}
                <Panel defaultSize={65} minSize={30}>
                  <div className="flex flex-col h-full bg-[#050507] relative min-w-0 border-r border-border/30">
                    <div className="flex items-center justify-between border-b border-border/50 bg-[#0a0a0c] shrink-0 sticky top-0 z-10 w-full pr-4 h-10">
                      <div className="flex shrink-0 overflow-x-auto text-xs custom-scrollbar h-full flex-1 min-w-0">
                        {tabs.map((tab) => (
                          <div
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`flex items-center gap-2 px-3 h-full border-r border-border/50 min-w-[120px] max-w-[200px] cursor-pointer group transition-colors relative ${activeTabId === tab.id
                              ? 'bg-[#050507] text-[var(--text-primary)]'
                              : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                              }`}
                          >
                            {tab.id === activeTabId && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--brand)] shadow-[0_0_10px_rgba(0,229,255,0.5)]" />}
                            <div className="flex items-center gap-2 w-full overflow-hidden">
                              <span className="truncate SelectNone text-[12px]">{tab.filename}</span>
                            </div>
                            <button
                              onClick={(e) => handleCloseTab(e, tab.id)}
                              className={`ml-auto shrink-0 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-white/10 p-0.5 transition-opacity ${tab.id === activeTabId ? 'opacity-100' : ''}`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Pending Edits Control */}
                      <div className="flex items-center gap-2 shrink-0">
                        {pendingEdits.length > 0 && (
                          <div className="flex gap-2">
                            <button onClick={rejectAllEdits} className="px-2 py-0.5 text-[10px] bg-red-500/10 text-red-500 border border-red-500/30 rounded hover:bg-red-500 hover:text-white transition-all">Reject</button>
                            <button onClick={acceptAllEdits} className="px-2 py-0.5 text-[10px] bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/30 rounded hover:bg-[var(--brand)] hover:text-[#050507] transition-all font-bold">Accept Fixes</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 relative bg-[#050507] overflow-hidden">
                      {!activeTab ? (
                        <div className="absolute inset-0 flex items-center justify-center text-text-muted font-medium text-xs opacity-50">
                          Select or create a file in the Explorer.
                        </div>
                      ) : activeTab.type === 'plan' ? (
                        <PlanViewer filename={activeTab.filename} content={activeTab.code} />
                      ) : (
                         <CodeEditor
                          code={activeTab.code}
                          language={activeTab.language}
                          onChange={handleCodeChange}
                          onMount={handleEditorMount}
                          hasPendingChanges={pendingFiles.includes(activeTab.filename)}
                          onAcceptAll={acceptAllEdits}
                          onRejectAll={rejectAllEdits}
                        />
                      )}
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="h-1 bg-transparent hover:bg-[var(--brand)]/50 transition-colors cursor-row-resize flex items-center justify-center border-y border-border/10 relative z-20 group">
                  <div className="w-8 h-[1px] bg-border/20 rounded-full group-hover:bg-[var(--brand)]" />
                </PanelResizeHandle>

                {/* Terminal/Analytics Panel */}
                <Panel defaultSize={35} minSize={10}>
                  <div className="h-full bg-[#050507] flex flex-col overflow-hidden border-r border-border/30">
                    <div className="h-8 border-b border-border/50 flex items-center px-4 bg-[#0a0a0c] shrink-0">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider uppercase flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 opacity-50" />
                        Analysis Results
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[#050507]">
                      {!isAnalyzing && !analysis && (
                        <div className="text-xs text-[var(--text-muted)] flex items-center justify-center h-full opacity-50">Click "Run Analysis" to scan your code for security & performance.</div>
                      )}
                      
                      {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                          <div className="w-10 h-10 border-2 border-[var(--brand)]/20 border-t-[var(--brand)] rounded-full animate-spin" />
                          <div className="text-[11px] text-[var(--brand)] font-mono animate-pulse">Running advanced SAST scan...</div>
                        </div>
                      )}

                      {analysis && !isAnalyzing && (
                        <div className="animate-fade-in space-y-6">
                           {/* Metrics Grid */}
                           <div className="grid grid-cols-4 gap-3">
                            {[
                              { key: "security", label: "Security", color: "text-red-500" },
                              { key: "performance", label: "Performance", color: "text-[var(--brand)]" },
                              { key: "quality", label: "Quality", color: "text-emerald-400" },
                              { key: "overallRating", label: "Overall", color: "text-white" },
                            ].map(({ key, label, color }) => (
                              <div key={key} className="bg-white/5 border border-white/5 rounded-lg p-3 text-center">
                                <div className={`text-xl font-black ${color}`}>{analysis[key]}</div>
                                <div className="text-[9px] uppercase tracking-widest text-text-muted font-bold mt-1">{label}</div>
                              </div>
                            ))}
                           </div>

                           {/* Vulnerabilities */}
                           <div className="space-y-3">
                              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2 px-1">
                                <Activity className="w-3 h-3" />
                                Detected Issues ({analysis.bugs?.length || 0})
                              </h3>
                              <div className="space-y-2">
                                {analysis.bugs?.map((bug: any, i: number) => (
                                  <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-3 text-[11px] flex gap-3 transition-hover hover:bg-white/[0.08]" style={{ borderLeft: `3px solid ${bug.severity === 'critical' ? '#ef4444' : '#fbbf24'}` }}>
                                    <div className="flex-1">
                                      <div className="font-bold text-white flex gap-2 items-center mb-1">
                                         {bug.category}
                                         <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/10 uppercase">{bug.severity}</span>
                                      </div>
                                      <div className="text-text-muted leading-relaxed">{bug.message}</div>
                                      <div className="mt-2 text-[10px] font-mono text-[var(--brand)]">Line {bug.line} • {bug.filename}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle className="w-1 bg-transparent hover:bg-[var(--brand)]/50 transition-colors cursor-col-resize flex flex-col items-center justify-center border-x border-border/10 relative z-20 group">
              <div className="w-[1px] h-8 bg-border/20 rounded-full group-hover:bg-[var(--brand)]" />
            </PanelResizeHandle>

            {/* AI Assistant Panel */}
            <Panel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full flex flex-col bg-[#050507]">
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
                  sessions={sessions}
                  currentSessionId={currentSessionId}
                  onSwitchSession={handleSwitchSession}
                  onDeleteSession={handleDeleteSession}
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadCode} />
      <input type="file" ref={zipInputRef} className="hidden" accept=".zip" onChange={handleUploadZip} />

      <ArtifactsView artifacts={artifacts} isOpen={isArtifactsOpen} onClose={() => setIsArtifactsOpen(false)} />

    </div>
  );
}

