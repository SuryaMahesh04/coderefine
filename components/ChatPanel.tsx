"use client";

import React, { useRef, useState, useEffect } from "react";
import { Send, Sparkles, Plus, ChevronUp, ChevronRight, ChevronDown, Check, CheckCircle, X, FileCode, Search, Pencil, Loader2, ClipboardList } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export type TaskStep = {
    name: string;
    status: "pending" | "running" | "done";
    summary: string;
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
}

// ─── Activity Step Component ─────────────────────────────────────────────────
function ActivityStep({ step, isLast }: { step: TaskStep; isLast: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const StepIcon = () => {
        const s = step.name.toLowerCase();
        const cls = "w-3 h-3";
        if (s.includes("search") || s.includes("find") || s.includes("grep")) return <Search className={cls} />;
        if (s.includes("edit") || s.includes("write") || s.includes("creat") || s.includes("modifi")) return <Pencil className={cls} />;
        if (s.includes("analyz") || s.includes("view") || s.includes("read") || s.includes("inspect")) return <FileCode className={cls} />;
        if (s.includes("plan") || s.includes("design") || s.includes("implement")) return <ClipboardList className={cls} />;
        return <Check className={cls} />;
    };

    const statusColor =
        step.status === "done" ? "text-[#00C853]" :
            step.status === "running" ? "text-[#00E5FF]" :
                "text-[#4d6b5a]";

    return (
        <div className="flex gap-2.5 items-start relative">
            {/* Timeline line */}
            {!isLast && (
                <div className="absolute left-[7px] top-5 bottom-0 w-px bg-[rgba(0,229,255,0.1)]" />
            )}

            {/* Status dot */}
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 z-10 ${step.status === "done"
                    ? "bg-[rgba(0,200,83,0.15)] border-[#00C853] text-[#00C853]"
                    : step.status === "running"
                        ? "border-[#00E5FF] bg-[rgba(0,229,255,0.1)] animate-pulse text-[#00E5FF]"
                        : "border-[rgba(0,229,255,0.2)] bg-transparent text-[#4d6b5a]"
                }`}>
                {step.status === "done" && <Check className="w-2 h-2" />}
                {step.status === "running" && <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />}
                {step.status === "pending" && <div className="w-1.5 h-1.5 rounded-full bg-[rgba(0,229,255,0.2)]" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-3 min-w-0">
                <button
                    className="flex items-center gap-1.5 text-left w-full group"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className={`text-[11px] font-bold ${statusColor} group-hover:brightness-125 transition-all truncate`}>
                        {step.name}
                    </span>
                    {step.summary && (
                        <ChevronRight className={`w-3 h-3 shrink-0 text-[#4d6b5a] transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                    )}
                    {step.status === "running" && (
                        <Loader2 className="w-3 h-3 shrink-0 text-[#00E5FF] animate-spin" />
                    )}
                </button>
                {isExpanded && step.summary && (
                    <div className="mt-1 text-[10px] text-[#86a898] animate-in slide-in-from-top-1 duration-200 leading-relaxed pr-2">
                        {step.summary}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Thought Block Component ─────────────────────────────────────────────────
function ThoughtBlock({ thoughts, duration }: { thoughts: string[]; duration?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 text-[10px] text-[#4d6b5a] hover:text-[#86a898] transition-colors font-semibold pl-1 mb-1"
            >
                <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                <span className="italic">
                    Thought for {duration !== undefined ? `${duration}s` : "..."}
                </span>
            </button>
            {isExpanded && (
                <div className="ml-1 mb-2 border-l-2 border-[rgba(0,229,255,0.15)] pl-3 py-1 animate-in slide-in-from-top-1 duration-200">
                    <div className="space-y-1.5">
                        {thoughts.map((thought, i) => (
                            <div key={i} className="text-[10px] text-[#4d6b5a] leading-relaxed italic">
                                {thought}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Progress Updates (Activity Feed) ────────────────────────────────────────
function ProgressUpdates({ steps }: { steps: TaskStep[] }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const doneCount = steps.filter(s => s.status === "done").length;
    const total = steps.length;
    const isAllDone = doneCount === total && total > 0;

    return (
        <div className="bg-[rgba(5,5,5,0.5)] border border-[rgba(0,229,255,0.08)] rounded-2xl overflow-hidden mb-2">
            {/* Header */}
            <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[rgba(0,229,255,0.03)] transition-colors text-left"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAllDone ? "bg-[#00C853]" : "bg-[#00E5FF] animate-pulse"}`} />
                    <span className="text-[11px] font-bold text-[#F0FFF4] uppercase tracking-widest">
                        Progress Updates
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#4d6b5a] font-mono">{doneCount}/{total}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#4d6b5a] transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                </div>
            </button>

            {/* Steps List */}
            {!isCollapsed && (
                <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-2 duration-200">
                    {steps.map((step, i) => (
                        <ActivityStep key={i} step={step} isLast={i === steps.length - 1} />
                    ))}
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
    onFileClick
}: ChatPanelProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = React.useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes("application/coderefine-file")) setIsDraggingOver(true);
    };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        const data = e.dataTransfer.getData("application/coderefine-file");
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
            <div className="h-14 border-b border-[rgba(0,229,255,0.1)] flex items-center px-4 justify-between bg-[rgba(5,5,5,0.8)] backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full gradient-sphere animate-pulse shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
                    <span className="font-display font-bold text-[#F0FFF4] tracking-tight text-sm">CodeRefine Agent</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar flex flex-col relative">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-full gradient-sphere flex items-center justify-center mb-5 animate-pulse shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                            <Sparkles className="w-8 h-8 text-[#000000]" />
                        </div>
                        <h3 className="text-[#F0FFF4] font-bold font-display mb-2 text-lg">AI Coding Assistant</h3>
                        <p className="text-sm text-[#4d6b5a] leading-relaxed max-w-[240px]">
                            Ask me to analyze, fix, optimize, or plan changes to your code.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-in w-full`}>

                            {/* User bubble */}
                            {msg.role === "user" && (
                                <div className="max-w-[85%] rounded-2xl p-3.5 bg-gradient-to-br from-[#00C853] to-[#00E5FF] text-[#000000] rounded-tr-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.25)] text-sm">
                                    {msg.content}
                                </div>
                            )}

                            {/* Agent Message */}
                            {msg.role === "agent" && (
                                <div className="flex flex-col gap-2 w-full max-w-[93%]">

                                    {/* 1 ── Thought block */}
                                    {msg.thoughts && msg.thoughts.length > 0 && (
                                        <ThoughtBlock thoughts={msg.thoughts} duration={msg.thoughtDuration} />
                                    )}

                                    {/* 2 ── Progress Updates (Activity Feed) */}
                                    {msg.steps && msg.steps.length > 0 && (
                                        <ProgressUpdates steps={msg.steps} />
                                    )}

                                    {/* 3 ── Markdown Response */}
                                    {msg.content && (
                                        <div className="glass-card text-[#F0FFF4] rounded-2xl rounded-tl-sm p-4 shadow-lg text-sm leading-relaxed chat-markdown prose prose-invert prose-emerald max-w-none prose-sm">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="mb-4 list-disc pl-4" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="mb-4 list-decimal pl-4" {...props} />,
                                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                    h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-[#00E5FF] mb-3 mt-0" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-base font-bold text-[#39FF7F] mb-2 mt-4 first:mt-0" {...props} />,
                                                    h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-[#F0FFF4] mb-1 mt-3 first:mt-0" {...props} />,
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
                <form onSubmit={onSubmit} className="relative flex items-end gap-2 bg-[#050505] border border-[rgba(0,229,255,0.2)] rounded-2xl p-2 focus-within:border-[#00E5FF] focus-within:ring-1 focus-within:ring-[#00E5FF]/30 transition-all shadow-inner">
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
