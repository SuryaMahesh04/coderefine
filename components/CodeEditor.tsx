"use client";

import React from "react";
import Editor, { Monaco } from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    language?: string;
    onChange: (value: string | undefined) => void;
    onMount: (editor: any, monaco: Monaco) => void;
}

export default function CodeEditor({ code, language = "typescript", onChange, onMount }: CodeEditorProps) {
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
        monaco.editor.setTheme("coderefine-dark");
        onMount(editor, monaco);
    };

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
