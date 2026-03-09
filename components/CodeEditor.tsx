"use client";

import React from "react";
import Editor, { Monaco } from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    language?: string;
    onChange: (value: string | undefined) => void;
    onMount: (editor: any, monaco: Monaco) => void;
}

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function CodeEditor({ code, language = "typescript", onChange, onMount }: CodeEditorProps) {
    const { theme } = useTheme();
    const [editorInstance, setEditorInstance] = useState<any>(null);
    const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        monaco.editor.defineTheme("coderefine-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#0d1117",
                "editor.lineHighlightBackground": "#161b22",
                "editorLineNumber.foreground": "#484f58",
                "editorIndentGuide.background": "#21262d",
                "editorSuggestWidget.background": "#161b22",
                "editorSuggestWidget.border": "#30363d",
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
        </div>
    );
}
