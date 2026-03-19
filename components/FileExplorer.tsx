"use client";

import { useState } from "react";
import { ChevronRight, Folder, FileCode, FilePlus, FolderPlus } from "lucide-react";


export type FileNodeType = "file" | "folder";

export type FileNode = {
    id: string;
    name: string;
    type: FileNodeType;
    language?: string;
    children?: FileNode[];
    isOpen?: boolean;
    content?: string;
    isPlan?: boolean;
};

interface FileExplorerProps {
    files: FileNode[];
    activeFileId: string;
    selectedContextId: string | null;
    onFileSelect: (id: string) => void;
    onContextSelect: (id: string | null) => void;
    onToggleFolder: (id: string, isOpen: boolean) => void;
    onNewItem: (name: string, type: FileNodeType, parentId: string | null) => void;
    onRenameItem: (id: string, newName: string) => void;
    onDeleteItem: (id: string) => void;
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
    onRenameItem,
    onDeleteItem,
    isOpen
}: FileExplorerProps) {
    const [creatingType, setCreatingType] = useState<FileNodeType | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");

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
                className="w-full bg-[#111111] border border-[rgba(0,229,255,0.3)] rounded px-2 py-0.5 text-xs text-[#F0FFF4] focus:outline-none focus:border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.1)]"
            />
        </form>
    );

    const handleRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (!renameValue.trim() || !renamingId) return;
        onRenameItem(renamingId, renameValue);
        setRenamingId(null);
        setRenameValue("");
    };

    const RenameInput = ({ depth = 0 }: { depth?: number }) => (
        <form onSubmit={handleRename} className="my-0.5" style={{ paddingLeft: `${depth * 12 + 8}px` }}>
            <input
                type="text"
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => setRenamingId(null)}
                onKeyDown={(e) => e.key === 'Escape' && setRenamingId(null)}
                className="w-full bg-[#111111] border border-[rgba(0,229,255,0.3)] rounded px-2 py-0.5 text-xs text-[#F0FFF4] focus:outline-none focus:border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.1)]"
            />
        </form>
    );

    const FileTree = ({ nodes, depth = 0 }: { nodes: FileNode[], depth?: number }) => {
        const sortedNodes = [...nodes].sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

        return (
            <div className="w-full">
                {sortedNodes.map(node => {
                    const isSelected = node.id === selectedContextId;
                    const isActiveFile = node.id === activeFileId;

                    return (
                        <div key={node.id}>
                            <div
                                draggable={node.type === "file"}
                                onDragStart={(e) => {
                                    if (node.type === "file") {
                                        e.dataTransfer.setData("application/coderefine-file", JSON.stringify({
                                            id: node.id,
                                            name: node.name
                                        }));
                                        e.dataTransfer.effectAllowed = "copy";
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onContextSelect(node.id);
                                    if (node.type === "file") onFileSelect(node.id);
                                    if (node.type === "folder") onToggleFolder(node.id, !node.isOpen);
                                }}
                                className={`flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer text-[12px] transition-all group/item relative ${isActiveFile 
                                    ? "bg-[var(--brand)]/10 text-[var(--brand)] font-semibold" 
                                    : isSelected 
                                        ? "bg-white/5 text-text-primary" 
                                        : "text-text-muted hover:bg-white/[0.03] hover:text-text-secondary"
                                    }`}
                                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                            >
                                {node.type === "folder" ? (
                                    <>
                                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${node.isOpen ? "rotate-90 opacity-100" : "opacity-40"}`} />
                                        <Folder className={`w-4 h-4 transition-colors ${node.isOpen ? "text-[var(--brand)] fill-[var(--brand)]/10" : "text-text-muted opacity-60"}`} />
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3.5 h-3.5 shrink-0" /> {/* Spacer for alignment with folder chevron */}
                                        {(() => {
                                            const name = node.name.toLowerCase();
                                            if (node.isPlan) {
                                                return <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>;
                                            }
                                            if (name.endsWith('.tsx') || name.endsWith('.jsx')) {
                                                return <svg className="w-4 h-4 text-[#61dafb] shrink-0" viewBox="0 0 114 114" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M57 91.9C37.07 91.9 20 84.15 20 74.45C20 64.75 37.07 57 57 57C76.93 57 94 64.75 94 74.45C94 84.15 76.93 91.9 57 91.9ZM57 61.2C40.4 61.2 26.6 67.2 26.6 74.45C26.6 81.7 40.4 87.7 57 87.7C73.6 87.7 87.4 81.7 87.4 74.45C87.4 67.2 73.6 61.2 57 61.2Z" fill="currentColor" /><path d="M39.55 101.9C29.6 84.6 33.7 65.4 48.7 56.65C63.7 47.9 83.95 52.8 93.9 70.1C103.85 87.4 99.75 106.6 84.75 115.35C69.75 124.1 49.5 119.2 39.55 101.9ZM87.85 73.65C79.8 60 63.6 56.1 52.1 62.8C40.6 69.5 37.3 84.2 45.35 97.85C53.4 111.5 69.6 115.4 81.1 108.7C92.6 102 95.9 87.3 87.85 73.65Z" fill="currentColor" /><path d="M74.45 101.9C84.4 84.6 80.3 65.4 65.3 56.65C50.3 47.9 30.05 52.8 20.1 70.1C10.15 87.4 14.25 106.6 29.25 115.35C44.25 124.1 64.5 119.2 74.45 101.9ZM26.15 73.65C34.2 60 50.4 56.1 61.9 62.8C73.4 69.5 76.7 84.2 68.65 97.85C60.6 111.5 44.4 115.4 32.9 108.7C21.4 102 18.1 87.3 26.15 73.65Z" fill="currentColor" /><circle cx="57" cy="74.45" r="7.4" fill="currentColor" /></svg>;
                                            } else if (name.endsWith('.ts')) {
                                                return <svg className="w-4 h-4 text-[#3178c6] shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="currentColor" /><path d="M12.9231 15.6562H9V27H12.9231V18.7344H14.8906V15.6562H12.9231ZM27 21.0938C27 18.4688 24.2769 17.5 22.1846 16.9219C20.6462 16.5156 19.8923 16.2031 19.8923 15.4688C19.8923 14.8125 20.3692 14.4062 21.3692 14.4062C22.2154 14.4062 23.3385 14.8125 23.8308 15.9062L26.4769 14.3438C25.4308 12.0625 23.5077 11.25 21.4308 11.25C18.6769 11.25 16.1231 12.8125 16.1231 15.75C16.1231 18.7188 19.1692 19.5 21.1692 20.0625C22.6923 20.4844 23.2308 20.9375 23.2308 21.75C23.2308 22.4063 22.6154 22.9531 21.4154 22.9531C20.4923 22.9531 19.1692 22.2969 18.5385 20.9219L15.6308 22.5625C16.6308 24.9688 19.0615 26.25 21.5077 26.25C24.3692 26.25 27 24.5781 27 21.0938Z" fill="white" /></svg>;
                                            } else if (name.endsWith('.js') || name.endsWith('.mjs')) {
                                                return <svg className="w-4 h-4 text-[#f7df1e] shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="currentColor" /><path d="M12.9231 15.6562H9V23.75C9 25.1094 9.93846 26.25 11.4462 26.25C12.8308 26.25 13.9846 25.1719 14.1231 23.8281L11.3385 23.4688C11.2615 24 10.9538 24.25 10.4923 24.25C10.0154 24.25 9.8 24 9.8 23.25V15.6562H12.9231ZM27 21.0938C27 18.4688 24.2769 17.5 22.1846 16.9219C20.6462 16.5156 19.8923 16.2031 19.8923 15.4688C19.8923 14.8125 20.3692 14.4062 21.3692 14.4062C22.2154 14.4062 23.3385 14.8125 23.8308 15.9062L26.4769 14.3438C25.4308 12.0625 23.5077 11.25 21.4308 11.25C18.6769 11.25 16.1231 12.8125 16.1231 15.75C16.1231 18.7188 19.1692 19.5 21.1692 20.0625C22.6923 20.4844 23.2308 20.9375 23.2308 21.75C23.2308 22.4063 22.6154 22.9531 21.4154 22.9531C20.4923 22.9531 19.1692 22.2969 18.5385 20.9219L15.6308 22.5625C16.6308 24.9688 19.0615 26.25 21.5077 26.25C24.3692 26.25 27 24.5781 27 21.0938Z" fill="black" /></svg>;
                                            } else if (name.endsWith('.json')) {
                                                return <svg className="w-4 h-4 text-[#cbcb41]" fill="currentColor" viewBox="0 0 24 24"><path d="M5.5 12c0-1.5-1-2-2-2H3v-2h.5c1 0 2-.5 2-2V4h2v2c0 2 1.5 2.5 2.5 2.5H11v2h-1c-1 0-2.5.5-2.5 2.5s1.5 2.5 2.5 2.5h1v2h-1c-1 0-2.5.5-2.5 2.5V20h-2v-2c0-1.5-1-2-2-2H3v-2h.5c1 0 2-.5 2-2zm13 0c0-1.5 1-2 2-2h.5v-2H21c-1 0-2-.5-2-2V4h-2v2c0 2-1.5 2.5-2.5 2.5H13v2h1c1 0 2.5.5 2.5 2.5s-1.5 2.5-2.5 2.5h-1v2h1c1 0 2.5.5 2.5 2.5V20h2v-2c0-1.5 1-2 2-2h.5v-2H21c-1 0-2-.5-2-2z" /></svg>;
                                            } else if (name.endsWith('.cpp') || name.endsWith('.c') || name.endsWith('.h')) {
                                                return <svg className="w-4 h-4 text-[#00599c] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m4.5 12h-2v1.5c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2v-3c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2H16.5c0-1.93-1.57-3.5-3.5-3.5h-2c-1.93 0-3.5 1.57-3.5 3.5v5c0 1.93 1.57 3.5 3.5 3.5h2c1.93 0 3.5-1.57 3.5-3.5V14z" /></svg>;
                                            } else if (name.endsWith('.py')) {
                                                return <svg className="w-4 h-4 text-[#3776ab] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m-2.5 3h1.34c3.08 0 3.08 1.93 3.08 1.93l.03 2.14H10.1c-2.4 0-2.4 1.76-2.4 1.76v3.35h-3.3c-1.8 0-1.8-2.6-1.8-2.6l.03-3.23c0-3.35 6.87-3.35 6.87-3.35M14.5 19h-1.34c-3.08 0-3.08-1.93-3.08-1.93l-.03-2.14h3.83c2.4 0 2.4-1.76 2.4-1.76v-3.35h3.3c1.8 0 1.8 2.6 1.8 2.6l-.03 3.23c0 3.35-6.87 3.35-6.87 3.35z" /></svg>;
                                            } else if (name.endsWith('.go')) {
                                                return <svg className="w-4 h-4 text-[#00add8] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M.787 5.867C1.52 4.414 3.493 3.3 6.067 3.3c2.42 0 4.14 1.113 4.14 2.893 0 1.254-.86 2.18-2.16 2.76.627.354 1.2.787 1.633 1.3.627-.634 1.34-.94 2.134-.94 1.633 0 2.82 1.054 2.82 2.634 0 2-.9 2.507-2.733 3.067-.9-.12-1.787-.247-2.66-.4 1.22.6 1.84 1.134 1.84 2.067 0 1.28-1.073 2.16-2.5 2.16-1.633 0-2.613-1-2.613-2.313 0-.667.247-1.314.713-1.84a6.622 6.622 0 00-1.253-.187c-.66.86-.54 2.053-.54 3.12 0 1.36-.627 2.147-1.953 2.147-1.2 0-1.84-.713-1.84-1.733 0-1.46.727-2.38 2.04-2.82-.44-.213-.813-.493-1.12-.86a2.23 2.23 0 01-.6-.627 3.41 3.41 0 01-.393-.847c-.247-.1-.474-.213-.674-.34-.786-.487-1.26-1.167-1.26-2.147.001-.84.288-1.507.828-2.02zm16.733 1.487c.787.247 1.253.793 1.253 1.5.001 1.053-.946 1.606-2.613 1.606-1.447 0-2.453-.453-2.453-1.433 0-1.133 1.586-1.487 3.813-1.673z" /></svg>;
                                            } else if (name.endsWith('.rs')) {
                                                return <svg className="w-4 h-4 text-[#dea584] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm0 3.3c-1.32 0-2.4.45-3.07 1.2L8.2 3.82l-.93.65.65.93-.72.68c-.68.64-1.2 1.57-1.2 2.92v2h2V7c0-.66.27-1.14.77-1.14.76 0 .76.85.76 1.14v4h2V7c0-.29 0-1.14.77-1.14.5 0 .77.48.77 1.14v4h2V7c0-1.35-.52-2.28-1.2-2.92l-.71-.68.65-.93-.93-.65-.73.68c-.68-.75-1.76-1.2-3.08-1.2zm-.3 11.4h.6v.6h-.6v-.6zm2.4 0h.6v.6h-.6v-.6zm-4.8 0h.6v.6h-.6v-.6zm1.2 1.8h2.4v.6h-2.4v-.6z" /></svg>;
                                            } else if (name.endsWith('.java')) {
                                                return <svg className="w-4 h-4 text-[#5382a1] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2c2 1 3 3 3 5 0 3-2 4-4 4-2 0-3-1-3-3s1-2 2-2c1 0 2 1 2 2M18 6c2-1 3-3 3-5 0 3-2 4-4 4-2 0-3-1-3-3s1-2 2-2c1 0 2 1 2 2m-6 4c2-1 3-3 3-5 0 3-2 4-4 4-2 0-3-1-3-3s1-2 2-2c1 0 2 1 2 2" /></svg>;
                                            } else if (name.endsWith('.css')) {
                                                return <svg className="w-4 h-4 text-[#264de4]" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.16l-.24-2.65H3.64l.87 9.87h12.5l-.54 5.99-4.5.11-4.52-1.22-.3-3.34H4.37l.45 5.56L11.97 20l7.15-1.95.84-9.35H7.13l-.2-2.18h11.66v-2.36z" /></svg>;
                                            } else if (name.endsWith('.ico') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) {
                                                return <svg className="w-4 h-4 text-[#a074c4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
                                            } else if (name.endsWith('.html')) {
                                                return <svg className="w-4 h-4 text-[#e34f26]" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.16l-.24-2.65H3.64l.87 9.87h12.5l-.54 5.99-4.5.11-4.52-1.22-.3-3.34H4.37l.45 5.56L11.97 20l7.15-1.95.84-9.35H7.13l-.2-2.18h11.66v-2.36z" /></svg>;
                                            } else if (name.includes('.config') || name.endsWith('.mjs') || name.endsWith('.cjs') || name.startsWith('.env') || name === '.gitignore' || name === 'package.json') {
                                                return <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
                                            }

                                            // Generic File
                                            return <FileCode className="w-4 h-4 text-text-secondary shrink-0" />;
                                        })()}
                                    </>
                                )}
                                {renamingId === node.id ? (
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={renameValue}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onBlur={handleRename}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename(e);
                                                if (e.key === 'Escape') setRenamingId(null);
                                            }}
                                            className="w-full bg-[#111111] border border-[rgba(0,229,255,0.3)] rounded px-1 py-0 text-xs text-[#F0FFF4] focus:outline-none focus:border-[#00E5FF]"
                                        />
                                    </div>
                                ) : (
                                    <span className="truncate SelectNone">{node.name}</span>
                                )}

                                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRenamingId(node.id);
                                            setRenameValue(node.name);
                                        }}
                                        className="p-1 text-[#4d6b5a] hover:text-[#00E5FF] hover:bg-[rgba(0,229,255,0.15)] rounded transition-colors"
                                        title="Rename"
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Are you sure you want to delete ${node.name}?`)) {
                                                onDeleteItem(node.id);
                                            }
                                        }}
                                        className="p-1 text-[#4d6b5a] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    </button>
                                </div>
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
            className="w-full h-full bg-[#050507] flex flex-col relative z-10 select-none border-r border-border/20"
            onClick={() => onContextSelect(null)}
        >
            <div className="h-10 flex items-center px-4 justify-between border-b border-border/50 bg-[#0a0a0c] shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-80">Explorer</span>
                </div>
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); setCreatingType("file"); }}
                        className="p-1.5 text-text-muted hover:text-[var(--brand)] hover:bg-white/5 rounded-md transition-all active:scale-95"
                        title="New File"
                    >
                        <FilePlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCreatingType("folder"); }}
                        className="p-1.5 text-text-muted hover:text-[var(--brand)] hover:bg-white/5 rounded-md transition-all active:scale-95"
                        title="New Folder"
                    >
                        <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                {/* Render creation input at root */}
                {!selectedContextId && creatingType && (
                    <CreationInput depth={0} />
                )}

                <FileTree nodes={files} />
            </div>
        </div>
    );
}
