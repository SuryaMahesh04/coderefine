"use client";

import React, { useEffect, useRef } from "react";
import { Send } from "lucide-react";


export type Message = {
    id: string;
    role: "agent" | "user";
    content: string;
    changes?: any[];
    isAccepted?: boolean;
    isRejected?: boolean;
};

interface ChatPanelProps {
    messages: Message[];
    input: string;
    setInput: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    onAcceptChanges?: (messageId: string, changes: any[]) => void;
    onRejectChanges?: (messageId: string) => void;
}

export default function ChatPanel({ messages, input, setInput, onSubmit, isLoading, onAcceptChanges, onRejectChanges }: ChatPanelProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full bg-background border-l border-border">
            {/* Header */}
            <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-surface-muted shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" />
                    <span className="font-semibold text-text-primary tracking-tight text-sm">CodeRefine Agent</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-background flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                            <Send className="w-6 h-6 text-blue-500 opacity-50" />
                        </div>
                        <h3 className="text-text-primary font-semibold mb-2">AI Coding Assistant</h3>
                        <p className="text-sm text-text-muted leading-relaxed max-w-[240px]">
                            You can use the agent to get recommendations, architectural insights, and automatic fixes for your code.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"} animate-fade-in`}>
                            <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm ${msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-sm font-medium"
                                : "bg-surface-raised border border-border text-text-primary whitespace-pre-wrap leading-relaxed shadow-lg"
                                }`}>
                                {msg.content}
                            </div>
                            {msg.role === "agent" && msg.changes && msg.changes.length > 0 && (
                                <div className="ml-1 flex gap-2">
                                    {msg.isAccepted && (
                                        <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-500/10 rounded border border-green-500/20">✓ Changes Accepted</span>
                                    )}
                                    {msg.isRejected && (
                                        <span className="text-xs text-zinc-500 font-medium px-2 py-1 bg-white/5 rounded border border-white/10">✗ Changes Rejected</span>
                                    )}
                                    {!msg.isAccepted && !msg.isRejected && (
                                        <>
                                            <button
                                                onClick={() => onAcceptChanges?.(msg.id, msg.changes!)}
                                                className="px-3 py-1.5 text-xs bg-green-500/10 text-green-500 border border-green-500/30 rounded shadow-sm hover:bg-green-500 hover:text-white transition-all font-semibold"
                                            >
                                                Accept Plan & Edit Code
                                            </button>
                                            <button
                                                onClick={() => onRejectChanges?.(msg.id)}
                                                className="px-3 py-1.5 text-xs bg-white/5 text-zinc-400 border border-white/10 rounded shadow-sm hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-surface-raised border border-border text-text-primary rounded-2xl rounded-tl-sm p-3.5 shadow-lg flex items-center gap-2">
                            <span className="flex space-x-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                            </span>
                            <span className="text-xs text-text-muted font-medium ml-2 uppercase tracking-widest">Thinking</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
                <form onSubmit={onSubmit} className="relative flex items-end gap-2 bg-surface-raised border border-border rounded-xl p-1.5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-inner">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSubmit(e);
                            }
                        }}
                        disabled={isLoading}
                        placeholder={isLoading ? "Agent is working..." : "Ask me to fix or optimize..."}
                        className="flex-1 bg-transparent border-none px-3 py-2.5 text-sm text-text-primary placeholder-zinc-600 focus:outline-none resize-none min-h-[44px] max-h-[120px] custom-scrollbar disabled:opacity-50"
                        rows={1}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-600 text-white p-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:bg-zinc-800 disabled:text-text-muted hover:bg-blue-500 transition-all mb-0.5 mr-0.5 shrink-0"
                        title="Send message"
                    >
                        <Send className="w-5 h-5 -ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
