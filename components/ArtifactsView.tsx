"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, ChevronRight, FileCode, CheckSquare, Clipboard, Copy, Download, Check } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type Artifact = {
    id: string;
    name: string;
    content: string;
    type: 'task' | 'plan' | 'implementation' | 'other';
};

interface ArtifactsViewProps {
    artifacts: Artifact[];
    onClose: () => void;
    isOpen: boolean;
}

export default function ArtifactsView({ artifacts, onClose, isOpen }: ArtifactsViewProps) {
    const [selectedId, setSelectedId] = useState<string | null>(artifacts[0]?.id || null);
    const [isCopied, setIsCopied] = useState(false);
    const activeArtifact = artifacts.find(a => a.id === selectedId) || artifacts[0];

    const copyToClipboard = () => {
        if (!activeArtifact) return;
        navigator.clipboard.writeText(activeArtifact.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const downloadArtifact = () => {
        if (!activeArtifact) return;
        const blob = new Blob([activeArtifact.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = activeArtifact.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Ensure state updates if artifacts change
    React.useEffect(() => {
        if (!selectedId && artifacts.length > 0) {
            setSelectedId(artifacts[0].id);
        }
    }, [artifacts]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-[450px] bg-[#050507] border-l border-border/50 z-[110] shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-[#0a0a0c]">
                        <div className="flex items-center gap-3">
                            <Clipboard className="w-5 h-5 text-[var(--brand)]" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#E2E8F0]">Loom Artifacts</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#4d6b5a] hover:text-[#E2E8F0]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-20 border-r border-border/30 bg-[#050507] flex flex-col items-center py-6 gap-6">
                            {artifacts.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setSelectedId(a.id)}
                                    className={`relative group flex flex-col items-center gap-1.5 transition-all ${selectedId === a.id ? "text-[var(--brand)]" : "text-[#4d6b5a] hover:text-[#86a898]"}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${selectedId === a.id ? "bg-[var(--brand)]/10 border-[var(--brand)]/30" : "bg-white/5 border-transparent group-hover:bg-white/10"}`}>
                                        {a.type === 'task' ? <CheckSquare className="w-5 h-5" /> : 
                                         a.type === 'plan' ? <FileCode className="w-5 h-5" /> : 
                                         <FileText className="w-5 h-5" />}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase truncate w-14 text-center">{a.name.split('.')[0]}</span>
                                    {selectedId === a.id && (
                                        <motion.div layoutId="active-indicator" className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--brand)] rounded-r-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#050507]">
                            {!activeArtifact ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <Clipboard className="w-12 h-12 text-[#222] mb-4" />
                                    <p className="text-text-muted text-xs">No active artifacts.</p>
                                </div>
                            ) : (
                                <motion.div
                                    key={activeArtifact.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="animate-fade-in"
                                >
                                    <div className="mb-6 flex items-start justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-[0.2em] mb-2 block">
                                                {activeArtifact.type} artifact
                                            </span>
                                            <h1 className="text-xl font-black text-white">{activeArtifact.name}</h1>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={copyToClipboard}
                                                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[#86a898] hover:text-[var(--brand)] transition-all"
                                                title="Copy to clipboard"
                                            >
                                                {isCopied ? <Check className="w-4 h-4 text-[#00C853]" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                            <button 
                                                onClick={downloadArtifact}
                                                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[#86a898] hover:text-[var(--brand)] transition-all"
                                                title="Download as file"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="prose prose-invert prose-emerald max-w-none text-[13px] leading-relaxed chat-markdown">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {activeArtifact.content}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
