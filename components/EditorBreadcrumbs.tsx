"use client";

import { ChevronRight, FileCode, Folder } from "lucide-react";

interface EditorBreadcrumbsProps {
  filename: string | null;
  workspaceName?: string;
}

export default function EditorBreadcrumbs({ filename, workspaceName = "styling-ai" }: EditorBreadcrumbsProps) {
  if (!filename) return null;

  // For now, we simulate path parts. In a real app, this would come from the file tree structure.
  const pathParts = filename.split('/').filter(Boolean);
  
  return (
    <div className="flex items-center gap-1.5 px-4 h-full text-[11px] font-medium text-text-muted select-none overflow-hidden">
      <div className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer shrink-0">
        <Folder className="w-3.5 h-3.5" />
        <span className="truncate max-w-[100px]">{workspaceName}</span>
      </div>
      
      {pathParts.map((part, index) => (
        <div key={index} className="flex items-center gap-1.5 shrink-0">
          <ChevronRight className="w-3 h-3 opacity-30" />
          <div className={`flex items-center gap-1 ${index === pathParts.length - 1 ? 'text-text-primary' : 'hover:text-text-primary transition-colors cursor-pointer'}`}>
            {index === pathParts.length - 1 && <FileCode className="w-3.5 h-3.5 text-[var(--brand)]" />}
            <span className="truncate max-w-[150px]">{part}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
