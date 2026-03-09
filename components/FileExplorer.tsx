"use client";

import { useState } from "react";

export type FileNodeType = "file" | "folder";

export type FileNode = {
    id: string;
    name: string;
    type: FileNodeType;
    language?: string;
    children?: FileNode[];
    isOpen?: boolean;
    content?: string;
};

interface FileExplorerProps {
    files: FileNode[];
    activeFileId: string;
    selectedContextId: string | null;
    onFileSelect: (id: string) => void;
    onContextSelect: (id: string | null) => void;
    onToggleFolder: (id: string, isOpen: boolean) => void;
    onNewItem: (name: string, type: FileNodeType, parentId: string | null) => void;
    isOpen: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
    typescript: "bg-blue-500",
    javascript: "bg-yellow-400",
    python: "bg-green-500",
    cpp: "bg-purple-500",
    go: "bg-cyan-400",
    java: "bg-red-500",
    rust: "bg-orange-500",
};

export default function FileExplorer({
    files,
    activeFileId,
    selectedContextId,
    onFileSelect,
    onContextSelect,
    onToggleFolder,
    onNewItem,
    isOpen
}: FileExplorerProps) {
    const [creatingType, setCreatingType] = useState<FileNodeType | null>(null);
    const [newItemName, setNewItemName] = useState("");

    if (!isOpen) return null;

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || !creatingType) return;

        onNewItem(newItemName, creatingType, selectedContextId);
        setNewItemName("");
        setCreatingType(null);
    };

    const CreationInput = ({ depth = 0 }: { depth?: number }) => (
        <form onSubmit={handleCreate} className="my-0.5" style={{ paddingLeft: `${depth * 12 + 8}px` }}>
            <input
                type="text"
                autoFocus
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onBlur={() => setCreatingType(null)}
                onKeyDown={(e) => e.key === 'Escape' && setCreatingType(null)}
                placeholder={creatingType === "file" ? "filename.ext" : "folder name"}
                className="w-full bg-[#1a1a1e] border border-blue-500/50 rounded px-2 py-0.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
            />
        </form>
    );

    const FileTree = ({ nodes, depth = 0 }: { nodes: FileNode[], depth?: number }) => {
        return (
            <div className="w-full">
                {nodes.map(node => {
                    const isSelected = node.id === selectedContextId;
                    const isActiveFile = node.id === activeFileId;

                    return (
                        <div key={node.id}>
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onContextSelect(node.id);
                                    if (node.type === "file") onFileSelect(node.id);
                                    if (node.type === "folder") onToggleFolder(node.id, !node.isOpen);
                                }}
                                className={`flex items-center gap-2 py-1.5 px-2 rounded-sm cursor-pointer text-sm transition-colors ${isActiveFile ? "bg-blue-500/10 text-blue-400 font-medium" :
                                    isSelected ? "bg-white/10 text-zinc-200" :
                                        "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                    }`}
                                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                            >
                                {node.type === "folder" ? (
                                    <>
                                        <svg className={`w-3.5 h-3.5 transition-transform ${node.isOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                        <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3.5 h-3.5 shrink-0" /> {/* Spacer for alignment with folder chevron */}
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${node.language ? LANGUAGE_COLORS[node.language] || "bg-zinc-500" : "bg-zinc-500"}`} />
                                    </>
                                )}
                                <span className="truncate SelectNone">{node.name}</span>
                            </div>

                            {/* Render children if expanded folder */}
                            {node.type === "folder" && node.isOpen && node.children && (
                                <FileTree nodes={node.children} depth={depth + 1} />
                            )}

                            {/* Render creation input right below the selected folder if it's open */}
                            {node.type === "folder" && node.isOpen && isSelected && creatingType && (
                                <CreationInput depth={depth + 1} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div
            className="w-64 bg-[#141416] border-r border-white/[0.06] h-full flex flex-col shrink-0 flex-shrink-0 animate-fade-in relative z-10"
            onClick={() => onContextSelect(null)} // Click empty space to deselect
        >
            <div className="h-14 flex items-center px-4 justify-between border-b border-white/[0.06] shrink-0">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Explorer</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setCreatingType("file"); }}
                        className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/10 transition-colors"
                        title="New File"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCreatingType("folder"); }}
                        className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/10 transition-colors"
                        title="New Folder"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                {/* Render creation input at root if no folder is selected (or root is selected) */}
                {!selectedContextId && creatingType && (
                    <CreationInput depth={0} />
                )}

                <FileTree nodes={files} />
            </div>
        </div>
    );
}
