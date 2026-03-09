"use client";

import React from "react";

export type Message = {
    id: string;
    role: "agent" | "user";
    content: string;
};

interface ChatPanelProps {
    messages: Message[];
    input: string;
    setInput: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

export default function ChatPanel({ messages, input, setInput, onSubmit, isLoading }: ChatPanelProps) {
    return (
        <div className="flex flex-col h-full bg-[#0d1117] border-l border-[#30363d]">
            <div className="h-14 border-b border-[#30363d] flex items-center px-4 justify-between bg-[#161b22]">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3fb950] animate-pulse" />
                    <span className="font-semibold text-white tracking-tight">CodeRefine Agent</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-xl p-3 shadow-sm ${msg.role === "user"
                                ? "bg-[#58a6ff] text-[#0d1117] rounded-tr-none font-medium"
                                : "bg-[#161b22] border border-[#30363d] text-[#c9d1d9] rounded-tl-none whitespace-pre-wrap leading-relaxed shadow-lg"
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#161b22] border border-[#30363d] text-[#c9d1d9] rounded-xl rounded-tl-none p-4 shadow-lg flex items-center gap-2">
                            <span className="flex space-x-1">
                                <span className="w-2 h-2 bg-[#58a6ff] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-[#58a6ff] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-[#58a6ff] rounded-full animate-bounce"></span>
                            </span>
                            <span className="text-sm text-gray-400 font-medium ml-2">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-[#161b22] border-t border-[#30363d]">
                <form onSubmit={onSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        placeholder={isLoading ? "Please wait..." : "Ask me to fix or optimize..."}
                        className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all shadow-inner disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-[#58a6ff] text-[#0d1117] px-4 py-2 rounded-lg font-semibold disabled:opacity-50 hover:bg-[#79b8ff] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Send
                    </button>
                </form>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `}</style>
        </div>
    );
}
