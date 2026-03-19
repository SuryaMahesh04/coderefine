"use client";

import React from "react";
import Editor, { Monaco } from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    language?: string;
    onChange: (value: string | undefined) => void;
    onMount: (editor: any, monaco: Monaco) => void;
    hasPendingChanges?: boolean;
    onAcceptAll?: () => void;
    onRejectAll?: () => void;
}

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function CodeEditor({ 
    code, 
    language = "typescript", 
    onChange, 
    onMount,
    hasPendingChanges,
    onAcceptAll,
    onRejectAll
}: CodeEditorProps) {
    const { theme } = useTheme();
    const [editorInstance, setEditorInstance] = useState<any>(null);
    const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        monaco.editor.defineTheme("coderefine-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#050507",
                "editor.lineHighlightBackground": "#051A1A",
                "editorLineNumber.foreground": "#4d6b5a",
                "editorLineNumber.activeForeground": "#39FF7F",
                "editorIndentGuide.background": "#00E5FF15",
                "editorSuggestWidget.background": "#050505",
                "editorSuggestWidget.border": "#00E5FF30",
                "editorSuggestWidget.selectedBackground": "#00E5FF20",
                "editorWidget.background": "#000000",
                "editorWidget.border": "#00E5FF30",
            },
        });

        // Define a custom light theme
        monaco.editor.defineTheme("coderefine-light", {
            base: "vs",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#ffffff",
                "editor.lineHighlightBackground": "#f1f5f9",
            },
        });

        // Set initial theme
        monaco.editor.setTheme(theme === "light" ? "coderefine-light" : "coderefine-dark");

        setEditorInstance(editor);
        setMonacoInstance(monaco);
        onMount(editor, monaco);
    };

    // Watch for theme changes and update the editor dynamically
    useEffect(() => {
        if (monacoInstance) {
            monacoInstance.editor.setTheme(theme === "light" ? "coderefine-light" : "coderefine-dark");
        }
    }, [theme, monacoInstance]);

    return (
        <div className="w-full h-full relative">
            <Editor
                height="100%"
                language={language}
                value={code}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: {
                        enabled: true,
                        scale: 0.75,
                        renderCharacters: false,
                        showSlider: "mouseover"
                    },
                    fontSize: 14,
                    fontFamily: "var(--font-code)",
                    lineHeight: 24,
                    padding: { top: 24, bottom: 24 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                    renderLineHighlight: "all",
                    scrollbar: {
                        verticalScrollbarSize: 4,
                        horizontalScrollbarSize: 4,
                        useShadows: false
                    }
                }}
            />

            {/* AI Pending Changes Overlay - Antigravity Style */}
            {hasPendingChanges && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-3 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl shadow-brand/20">
                        <div className="flex items-center gap-2 mr-2">
                            <div className="w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_8px_var(--brand)]" />
                            <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">AI Suggestion</span>
                        </div>
                        <div className="h-4 w-[1px] bg-white/10 mx-1" />
                        <button 
                            onClick={onAcceptAll}
                            className="text-[11px] font-bold text-black bg-brand px-4 py-1 rounded-full hover:bg-brand/90 transition-all transform active:scale-95"
                        >
                            Accept
                        </button>
                        <button 
                            onClick={onRejectAll}
                            className="text-[11px] font-bold text-white/70 hover:text-white px-4 py-1 rounded-full hover:bg-white/5 transition-all transform active:scale-95 border border-white/5"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
