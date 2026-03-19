"use client";

import React, { useRef, useState, useEffect } from "react";
import { Send, Sparkles, Plus, ChevronUp, ChevronRight, ChevronDown, Check, CheckCircle, X, FileCode, Search, Pencil, Loader2, ClipboardList, FileText, AlertTriangle, PencilLine, Layers, History, MoreHorizontal, Clock, Trash2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type ChatSession } from "../lib/chatStore";


export type TaskStep = {
    name: string;
    status: "pending" | "running" | "done" | "error";
    summary: string;
    type?: "analyzed" | "edited" | "research" | "audit";
    filename?: string;
    language?: string;
    lineRange?: string;
    diff?: { added: number, removed: number };
    warnings?: number;
    thoughtDuration?: number; // in seconds
    thoughts?: string[];
};

export type Message = {
    id: string;
    role: "agent" | "user";
    content: string;
    thoughts?: string[];
    thoughtDuration?: number;
    steps?: TaskStep[];
    changes?: any[];
    planDocument?: { filename: string, content: string } | null;
    intendsToChange?: boolean;
    isAccepted?: boolean;
    isRejected?: boolean;
    affectedFiles?: string[];
    rewrittenFiles?: { filename: string, id?: string }[];
    findings?: string[];
    images?: { url: string, prompt: string }[];
    browserResults?: { screenshot: string, message: string }[];
    artifacts?: any[];
};

interface ChatPanelProps {
    messages: Message[];
    input: string;
    setInput: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    onAcceptChanges?: (messageId: string, changes: any[]) => void;
    onRejectChanges?: (messageId: string) => void;
    onReviewPlan?: (messageId: string) => void;
    attachedFile: { id: string, name: string } | null;
    onAttachFile: (file: { id: string, name: string }) => void;
    onDetachFile: () => void;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    onFileClick?: (id: string) => void;
    // New Session Props
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSwitchSession: (id: string) => void;
    onDeleteSession: (e: React.MouseEvent, id: string) => void;
}

// ─── Activity Step Component ─────────────────────────────────────────────────
function ActivityStep({ step, index, isLast }: { step: TaskStep; index: number; isLast: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine type and visuals
    const isEdit = step.type === "edited" || step.name.includes("writeFile") || step.name.includes("replaceContent") || step.name.includes("multiReplaceContent");
    const isAnalyze = step.type === "analyzed" || step.name.includes("readFile") || step.name.includes("viewFile");
    const isResearch = step.type === "research" || step.name.includes("grepSearch") || step.name.includes("findByName");
    const isAudit = step.type === "audit" || step.name.includes("auditCode");
    
    const filename = step.filename || step.name.match(/\((.*?)\)/)?.[1] || null;
    let languageCode = step.language || "TXT";
    if (filename && !step.language) {
        const ext = filename.split('.').pop()?.toUpperCase() || "TXT";
        languageCode = ext === "TSX" || ext === "TS" ? "TS" : ext === "JSX" || ext === "JS" ? "JS" : ext;
    }

    return (
        <div className="flex gap-4 items-start relative pb-6 group/step">
            {/* Left Timeline Column */}
            <div className="flex flex-col items-center shrink-0 w-5 h-full relative">
                <span className="text-[12px] font-mono text-text-secondary mt-1 font-bold z-10 bg-[#050507] px-1 leading-none">
                    {index + 1}
                </span>
                {!isLast && (
                    <div className="absolute top-[20px] bottom-[-24px] w-[1px] bg-white/5 group-hover/step:bg-white/10 transition-colors" />
                )}
            </div>

            {/* Right Content Column */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
                {/* Step Headline */}
                <div className="flex items-center gap-2">
                    <span className={`text-[14px] font-bold leading-snug tracking-tight transition-colors ${step.status === "error" ? "text-red-400" : "text-white"}`}>
                        {step.summary || step.name}
                    </span>
                    {step.status === "running" && (
                        <Loader2 className="w-3.5 h-3.5 text-[var(--brand)] animate-spin shrink-0" />
                    )}
                </div>

                {/* Sub-Items (Rich Activity Rows) */}
                <div className="flex flex-col gap-2 pl-1">
                    {/* File Activity Row */}
                    {filename && (
                        <div className="flex items-center gap-2.5 text-[12px]">
                            <div className="flex items-center gap-1.5 opacity-60">
                                {isEdit ? <Pencil className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                <span className="font-medium">{isEdit ? "Edited" : "Analyzed"}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                                <span className={`text-[9px] font-black tracking-tighter ${languageCode === 'TS' ? 'text-blue-400' : 'text-[var(--brand)]'}`}>
                                    {languageCode}
                                </span>
                                <span className="text-white font-mono font-bold truncate max-w-[200px]">{filename}</span>
                                {step.lineRange && (
                                    <span className="text-text-muted opacity-40 font-mono text-[10px]">{step.lineRange}</span>
                                )}
                            </div>

                            {/* Diffs & Warnings */}
                            <div className="flex items-center gap-2 font-mono text-[11px] font-black">
                                {step.diff && (
                                    <>
                                        {step.diff.added > 0 && <span className="text-emerald-400">+{step.diff.added}</span>}
                                        {step.diff.removed > 0 && <span className="text-red-400">-{step.diff.removed}</span>}
                                    </>
                                )}
                                {step.warnings && step.warnings > 0 && (
                                    <span className="flex items-center gap-1 text-amber-400 px-1.5 py-0.5 rounded-md bg-amber-400/10">
                                        <AlertTriangle className="w-3 h-3" />
                                        {step.warnings}
                                    </span>
                                )}
                            </div>
                            
                            {/* Surgical Icon */}
                            {isEdit && <PencilLine className="w-3.5 h-3.5 text-text-muted opacity-20 ml-auto" />}
                        </div>
                    )}

                    {/* Research/Audit Row */}
                    {(isResearch || isAudit) && !filename && (
                        <div className="flex items-center gap-2.5 text-[12px]">
                            <div className="flex items-center gap-1.5 opacity-60">
                                {isResearch ? <Search className="w-3.5 h-3.5" /> : <ClipboardList className="w-3.5 h-3.5" />}
                                <span className="font-medium">{isResearch ? "Researching" : "Auditing"}</span>
                            </div>
                            <span className="text-text-muted italic text-[11px] truncate">{step.summary || ""}</span>
                        </div>
                    )}

                    {/* Thought for Xs Block */}
                    {(step.thoughts || step.thoughtDuration) && (
                        <div className="w-full">
                            <button
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-2 text-[12px] text-text-muted hover:text-white transition-all group/thought"
                            >
                                <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? "rotate-90" : "opacity-40"}`} />
                                <span className="font-medium opacity-60 group-hover/thought:opacity-100 italic">
                                    Thought {step.thoughtDuration ? `for ${step.thoughtDuration}s` : "..."}
                                </span>
                            </button>
                            {isExpanded && step.thoughts && (
                                <div className="ml-2 mt-2 border-l-[1px] border-white/5 pl-4 py-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="space-y-2.5">
                                        {step.thoughts.map((thought, i) => (
                                            <div key={i} className="text-[12px] text-text-secondary leading-relaxed font-medium">
                                                {thought}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Artifact Card Component ────────────────────────────────────────────────
function ArtifactCard({ artifact }: { artifact: any }) {
    const Icon = artifact.type === 'task' ? ClipboardList : 
                 artifact.type === 'plan' ? FileCode : FileText;
    
    return (
        <div className="group relative bg-[#0a0a0c] border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/5 hover:border-[var(--brand)]/30 cursor-pointer shadow-lg active:scale-[0.98]">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)] shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-[#4d6b5a] uppercase tracking-widest mb-0.5">{artifact.type} Artifact</div>
                <div className="text-xs font-bold text-white truncate">{artifact.name}</div>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-[#4d6b5a] group-hover:text-[var(--brand)] group-hover:border-[var(--brand)]/20 transition-all">
                <ChevronRight className="w-4 h-4" />
            </div>
        </div>
    );
}

// ─── Progress Updates (Activity Feed) ────────────────────────────────────────
function ProgressUpdates({ steps }: { steps: TaskStep[] }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const hasRunningStep = steps.some(s => s.status === "running");
    
    // Calculate progress statistics
    const completedCount = steps.filter((s) => s.status === "done").length;

    return (
        <div className="w-full bg-[#050507]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 mb-6 shadow-2xl relative group/progress overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--brand)]/5 blur-[100px] rounded-full pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                        <div className={`absolute inset-0 bg-[var(--brand)]/20 blur-md rounded-full ${hasRunningStep ? 'animate-pulse' : 'hidden'}`} />
                        {hasRunningStep ? (
                            <Loader2 className="w-4 h-4 text-[var(--brand)] relative z-10 animate-spin" />
                        ) : (
                            <div className="w-4 h-4 rounded-full border border-[var(--brand)]/30 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-[var(--brand)]" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white px-1.5 py-0.5 bg-white/5 rounded flex items-center gap-1.5 self-start mb-1 tracking-wider">
                            <Layers className="w-3 h-3 text-[var(--brand)]" />
                            AGENT ACTIVITY
                        </span>
                        <span className="text-[11px] font-bold text-text-muted opacity-60">
                            {hasRunningStep ? "Processing autonomous task..." : "Task sequence completed"}
                        </span>
                    </div>
                </div>
                
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-95"
                >
                    <span className="text-[10px] font-mono text-[var(--brand)] font-bold">
                        {completedCount}/{steps.length} STEPS
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-500 ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>
            </div>

            {/* Steps Container */}
            {!isCollapsed && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="space-y-1">
                        {steps.map((step, idx) => (
                            <ActivityStep 
                                key={idx} 
                                step={step} 
                                index={idx} 
                                isLast={idx === steps.length - 1} 
                            />
                        ))}
                    </div>

                    {hasRunningStep && (
                        <div className="flex items-center gap-2.5 mt-2 ml-1 text-[var(--brand)] text-[10px] font-bold uppercase tracking-widest animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            Synthesizing Output...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Chat Panel ──────────────────────────────────────────────────────────
export default function ChatPanel({
    messages,
    input,
    setInput,
    onSubmit,
    isLoading,
    onAcceptChanges,
    onRejectChanges,
    onReviewPlan,
    attachedFile,
    onAttachFile,
    onDetachFile,
    selectedModel,
    setSelectedModel,
    onFileClick,
    sessions,
    currentSessionId,
    onSwitchSession,
    onDeleteSession
}: ChatPanelProps) {
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const historyRef = useRef<HTMLDivElement>(null);

    // Close history on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
                setIsHistoryOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        if (days < 7) return `${days} days ago`;
        return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };


    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes("application/loom-ai-file")) setIsDraggingOver(true);
    };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        const data = e.dataTransfer.getData("application/loom-ai-file");
        if (data) {
            try { onAttachFile(JSON.parse(data)); } catch { }
        }
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div
            className={`flex flex-col h-full bg-[#000000] border-l border-[rgba(0,229,255,0.1)] transition-colors duration-200 relative ${isDraggingOver ? "bg-[rgba(0,229,255,0.05)]" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            {isDraggingOver && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm pointer-events-none border-2 border-dashed border-[#00E5FF] m-2 rounded-2xl">
                    <div className="flex flex-col items-center gap-4 text-[#00E5FF] animate-pulse">
                        <FileCode className="w-12 h-12" />
                        <span className="font-display font-black uppercase tracking-widest text-lg">Drop to Attach File</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="h-10 border-b border-border/50 flex items-center px-4 justify-between bg-[#0a0a0c] shrink-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-80">Loom AI Agent</span>
                </div>
                
                <div className="flex items-center gap-1.5 relative">
                    <button 
                        onClick={() => (window as any).handleNewChat?.()}
                        className="p-1.5 rounded-md text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                        title="New Chat"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    
                    <button 
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className={`p-1.5 rounded-md transition-colors ${isHistoryOpen ? "text-[var(--brand)] bg-[var(--brand)]/10" : "text-text-muted hover:text-white hover:bg-white/5"}`}
                        title="Chat History"
                    >
                        <History className="w-4 h-4" />
                    </button>
                    
                    <button className="p-1.5 rounded-md text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* History Popover */}
                    {isHistoryOpen && (
                        <div 
                            ref={historyRef}
                            className="absolute top-full right-0 mt-2 w-72 bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[100] p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                            <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                                <div className="px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">Current</div>
                                {sessions.filter(s => s.id === currentSessionId).map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { onSwitchSession(s.id); setIsHistoryOpen(false); }}
                                        className="w-full text-left p-2.5 px-3 rounded-xl bg-[var(--brand)]/10 border border-[var(--brand)]/20 text-white flex flex-col gap-0.5 relative group"
                                    >
                                        <div className="absolute left-1 top-2.5 bottom-2.5 w-0.5 bg-[var(--brand)] rounded-full shadow-[0_0_10px_var(--brand)]" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-[12px] font-bold truncate max-w-[170px]">{s.title || "Untitled Conversation"}</span>
                                            <span className="text-[9px] font-bold text-[var(--brand)] opacity-60 leading-none">{getRelativeTime(s.updatedAt)}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteSession(e, s.id); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </button>
                                ))}

                                <div className="mt-2 px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40 flex items-center justify-between">
                                    Recent in {process.cwd().split(/[\\/]/).pop()}
                                </div>
                                {sessions.filter(s => s.id !== currentSessionId && Date.now() - s.updatedAt < 86400000).map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { onSwitchSession(s.id); setIsHistoryOpen(false); }}
                                        className="w-full text-left p-2.5 px-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-text-muted hover:text-text-primary flex items-center justify-between group transition-all"
                                    >
                                        <span className="text-[12px] font-bold truncate max-w-[180px]">{s.title || "Untitled Conversation"}</span>
                                        <span className="text-[9px] font-bold opacity-40 group-hover:opacity-60">{getRelativeTime(s.updatedAt)}</span>
                                    </button>
                                ))}

                                <div className="mt-2 px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">Other Conversations</div>
                                {sessions.filter(s => s.id !== currentSessionId && Date.now() - s.updatedAt >= 86400000).map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { onSwitchSession(s.id); setIsHistoryOpen(false); }}
                                        className="w-full text-left p-2.5 px-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-text-muted hover:text-text-primary flex items-center justify-between group transition-all"
                                    >
                                        <span className="text-[12px] font-bold truncate max-w-[180px]">{s.title || "Untitled Conversation"}</span>
                                        <span className="text-[9px] font-bold opacity-40 group-hover:opacity-60">{getRelativeTime(s.updatedAt)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar flex flex-col relative">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-full gradient-sphere flex items-center justify-center mb-5 animate-pulse shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                            <Sparkles className="w-8 h-8 text-[#000000]" />
                        </div>
                        <h3 className="text-[#F0FFF4] font-bold font-display mb-2 text-lg">Loom AI Coding Assistant</h3>
                        <p className="text-sm text-[#4d6b5a] leading-relaxed max-w-[240px]">
                            Ask me to analyze, fix, optimize, or plan changes to your code.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-in w-full`}>

                            {/* User bubble */}
                            {msg.role === "user" && (
                                <div className="max-w-[85%] rounded-2xl p-3 px-4 bg-white/5 border border-white/10 text-text-primary text-[13px] leading-relaxed">
                                    {msg.content}
                                </div>
                            )}

                            {/* Agent Message */}
                            {msg.role === "agent" && (
                                <div className="flex flex-col gap-2 w-full max-w-[93%]">

                                    {/* Unassociated thoughts (pre-planning) */}
                                    {msg.thoughts && msg.thoughts.length > 0 && (!msg.steps || msg.steps.length === 0) && (
                                        <div className="w-full mb-2">
                                            <div className="flex items-center gap-2 text-[12px] text-[#86a898] font-medium px-1 py-0.5">
                                                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 rotate-90`} />
                                                <span>Initial Reasoning...</span>
                                            </div>
                                            <div className="ml-2 mt-1 border-l-[1.5px] border-[#22332a] pl-3 py-1">
                                                <div className="space-y-2">
                                                    {msg.thoughts.map((thought, i) => (
                                                        <div key={i} className="text-[12px] text-[#A0AEC0] leading-relaxed">
                                                            {thought}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1.5 ── Research Findings */}
                                    {msg.artifacts && msg.artifacts.length > 0 && (
                                        <div className="w-full mb-4 space-y-2">
                                            {msg.artifacts.map((art, i) => (
                                                <ArtifactCard key={i} artifact={art} />
                                            ))}
                                        </div>
                                    )}

                                    {msg.findings && msg.findings.length > 0 && (
                                        <div className="w-full mb-3 space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-[#00E5FF] uppercase tracking-wider pl-1 mb-2">
                                                <Search className="w-3.5 h-3.5" />
                                                Research Findings
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {msg.findings.map((f, i) => (
                                                    <div key={i} className="bg-[#00E5FF]/5 border border-[#00E5FF]/10 rounded-xl px-4 py-2.5 text-[12px] text-[#E2E8F0] flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-1.5 shrink-0 shadow-[0_0_5px_rgba(0,229,255,0.5)]" />
                                                        {f}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 1.6 ── Visual Media (Images/Browsers) */}
                                    {msg.images && msg.images.length > 0 && (
                                        <div className="grid grid-cols-1 gap-4 mb-4">
                                            {msg.images.map((img, i) => (
                                                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                                                    <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                                        <div className="text-[10px] font-bold text-white uppercase tracking-wider opacity-70 mb-1">Generated Asset</div>
                                                        <div className="text-[11px] text-[#86a898] group-hover:text-[var(--brand)] transition-colors line-clamp-2">{img.prompt}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {msg.browserResults && msg.browserResults.length > 0 && (
                                        <div className="space-y-4 mb-4">
                                            {msg.browserResults.map((res, i) => (
                                                <div key={i} className="rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0c] shadow-xl">
                                                    <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                                                        <div className="flex gap-1.5">
                                                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                                            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                                        </div>
                                                        <div className="mx-auto text-[9px] font-black text-[#4d6b5a] tracking-widest uppercase truncate max-w-[200px]">Browser View</div>
                                                    </div>
                                                    <img src={res.screenshot} alt="Browser screenshot" className="w-full border-b border-white/5" />
                                                    <div className="p-4 bg-[#0a0a0c]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
                                                            <span className="text-[11px] text-[#E2E8F0]">{res.message}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 2 ── Progress Updates (Activity Feed) */}
                                    {msg.steps && msg.steps.length > 0 && (
                                        <ProgressUpdates steps={msg.steps} />
                                    )}

                                    {/* 3 ── Markdown Response */}
                                    {msg.content && (
                                        <div className="bg-white/[0.03] border border-white/10 text-text-primary rounded-2xl p-4 shadow-xl text-[13px] leading-relaxed chat-markdown prose prose-invert prose-emerald max-w-none prose-sm">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="mb-4 list-disc pl-4" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="mb-4 list-decimal pl-4" {...props} />,
                                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                    h1: ({ node, ...props }) => <h1 className="text-base font-bold text-[var(--brand)] mb-3 mt-0" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-emerald-400 mb-2 mt-4 first:mt-0" {...props} />,
                                                    h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-white mb-1 mt-3 first:mt-0" {...props} />,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}

                                    {/* 3.5 ── Rewritten Files */}
                                    {msg.rewrittenFiles && msg.rewrittenFiles.length > 0 && (
                                        <div className="flex flex-col gap-1.5 mt-1">
                                            <span className="text-[10px] text-[#4d6b5a] font-bold uppercase tracking-wider pl-1">Edited Files</span>
                                            <div className="flex flex-wrap gap-2">
                                                {msg.rewrittenFiles.map((file, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => file.id && onFileClick?.(file.id)}
                                                        disabled={!file.id}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                                                            file.id 
                                                                ? "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/40 cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.1)]" 
                                                                : "bg-[rgba(5,5,5,0.5)] text-[#4d6b5a] border-[rgba(0,229,255,0.05)] opacity-60 cursor-not-allowed"
                                                        }`}
                                                    >
                                                        <FileCode className="w-3.5 h-3.5" />
                                                        {file.filename}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}


                                    {/* 4 ── Action buttons */}
                                    {((msg.intendsToChange && !msg.isAccepted && !msg.isRejected) || (msg.changes && msg.changes.length > 0 && !msg.isAccepted && !msg.isRejected)) && (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {msg.isAccepted && (
                                                <span className="text-xs text-[#00C853] font-bold px-3 py-1 bg-[rgba(0,200,83,0.1)] rounded-lg border border-[rgba(0,200,83,0.2)] flex items-center gap-1.5">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Changes Applied
                                                </span>
                                            )}
                                            {msg.isRejected && (
                                                <span className="text-xs text-[#4d6b5a] font-medium px-3 py-1 bg-[rgba(10,10,10,0.6)] rounded-lg border border-[rgba(0,229,255,0.05)]">✗ Rejected</span>
                                            )}
                                            {!msg.isAccepted && !msg.isRejected && (
                                                <>
                                                    {msg.changes && msg.changes.length > 0 ? (
                                                        <button
                                                            onClick={() => onAcceptChanges?.(msg.id, msg.changes || [])}
                                                            className="px-4 py-2 text-xs bg-gradient-to-r from-[#00C853] to-[#00E5FF] text-[#000000] rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all font-black uppercase tracking-tight"
                                                        >
                                                            Apply Edits
                                                        </button>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => onReviewPlan?.(msg.id)}
                                                                className="px-4 py-2 text-xs bg-transparent text-[#00E5FF] border border-[rgba(0,229,255,0.3)] rounded-xl hover:bg-[rgba(0,229,255,0.1)] transition-all font-bold flex items-center gap-1.5"
                                                            >
                                                                <FileCode className="w-3.5 h-3.5" /> Review Plan
                                                            </button>
                                                            <button
                                                                onClick={() => onAcceptChanges?.(msg.id, [])}
                                                                className="px-4 py-2 text-xs bg-gradient-to-r from-[#00C853] to-[#00E5FF] text-[#000000] rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:brightness-110 transition-all font-black uppercase tracking-tight"
                                                            >
                                                                Execute
                                                            </button>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => onRejectChanges?.(msg.id)}
                                                        className="px-4 py-2 text-xs bg-transparent text-[#4d6b5a] border border-[rgba(0,229,255,0.2)] rounded-xl hover:bg-[rgba(0,229,255,0.05)] hover:text-[#00E5FF] transition-all font-bold"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start animate-fade-in mt-4">
                        <div className="glass-card text-[#F0FFF4] rounded-2xl rounded-tl-sm p-3.5 shadow-lg flex items-center gap-3 border-[rgba(0,229,255,0.2)] bg-[rgba(5,5,5,0.4)]">
                            <div className="w-6 h-6 rounded-full gradient-sphere flex items-center justify-center animate-pulse">
                                <div className="w-1.5 h-1.5 bg-[#000000] rounded-full"></div>
                            </div>
                            <span className="flex space-x-1">
                                <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce"></span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[rgba(0,0,0,0.9)] border-t border-[rgba(0,229,255,0.1)] backdrop-blur-xl relative z-10 flex flex-col gap-3">
                {/* Model Selector */}
                <div className="flex items-center gap-4 px-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#888] cursor-pointer hover:text-[#bbb] transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                            className="flex items-center gap-1.5 text-xs font-medium text-[#888] hover:text-[#bbb] transition-colors"
                        >
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Planning</span>
                            <ChevronUp className="w-3.5 h-3.5 ml-1" />
                            <span>
                                {selectedModel === "agentic" ? "Agentic (Pro + Flash)" :
                                    selectedModel === "pro" ? "Gemini 3 Pro Preview" :
                                        "Gemini 2.0 Flash (Fast)"}
                            </span>
                        </button>

                        {isModelDropdownOpen && (
                            <div className="absolute left-0 bottom-full mb-2 w-48 bg-[#111] border border-[#333] rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                                {[
                                    { id: "agentic", label: "Agentic (Pro + Flash)" },
                                    { id: "pro", label: "Gemini 3 Pro Preview" },
                                    { id: "flash", label: "Gemini 2.0 Flash (Fast)" }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => { setSelectedModel(m.id); setIsModelDropdownOpen(false); }}
                                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${selectedModel === m.id ? "bg-[rgba(0,229,255,0.1)] text-[#00E5FF]" : "text-[#aaa] hover:bg-[#222]"}`}
                                    >
                                        <span>{m.label}</span>
                                        {selectedModel === m.id && <Check className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Attached file chip */}
                {attachedFile && (
                    <div className="flex items-center gap-2 mb-1 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.3)] rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                            <FileCode className="w-3.5 h-3.5 text-[#00E5FF]" />
                            <span className="text-xs font-bold text-[#00E5FF] max-w-[150px] truncate">{attachedFile.name}</span>
                            <button
                                onClick={onDetachFile}
                                className="ml-1 p-0.5 hover:bg-[rgba(0,229,255,0.2)] rounded-full transition-colors text-[#4d6b5a] hover:text-[#00E5FF]"
                                title="Remove attachment"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <span className="text-[10px] text-[#4d6b5a] font-medium uppercase tracking-wider">Attached to message</span>
                    </div>
                )}

                {/* Input form */}
                <form onSubmit={onSubmit} className="relative flex items-end gap-2 bg-[#0a0a0c] border border-border/50 rounded-xl p-1.5 focus-within:border-[var(--brand)]/50 focus-within:ring-1 focus-within:ring-[var(--brand)]/20 transition-all shadow-2xl">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                onSubmit(e as any);
                            }
                        }}
                        disabled={isLoading}
                        placeholder={isLoading ? "Agent is processing..." : "Ask me to fix, scan, or optimize code..."}
                        className="flex-1 bg-transparent border-none px-3 py-2.5 text-sm text-[#F0FFF4] placeholder-[#4d6b5a] focus:outline-none resize-none min-h-[48px] max-h-[200px] custom-scrollbar disabled:opacity-50 font-medium"
                        rows={1}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-gradient-to-br from-[#00C853] to-[#00E5FF] text-[#000000] p-3 rounded-xl font-black disabled:opacity-50 disabled:from-[#111111] disabled:to-[#111111] disabled:text-[#4d6b5a] hover:brightness-110 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all mb-0.5 mr-0.5 shrink-0"
                        title="Send message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
