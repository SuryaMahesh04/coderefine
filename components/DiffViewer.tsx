"use client";

import React, { useMemo } from 'react';
import * as Diff from 'diff';
import { Check, X } from 'lucide-react';

interface DiffViewerProps {
  originalCode: string;
  newCode: string;
  filename: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function DiffViewer({ originalCode, newCode, filename, onAccept, onReject }: DiffViewerProps) {
  const diffs = useMemo(() => {
    return Diff.diffLines(originalCode, newCode);
  }, [originalCode, newCode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden shadow-[#00E5FF]/5">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white tracking-tight">Review Changes</h2>
            <span className="text-sm font-mono text-zinc-400">{filename}</span>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={onReject}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-sm font-semibold transition-colors"
            >
              <X className="w-4 h-4" />
              Discard
            </button>
            <button
              onClick={onAccept}
              className="flex items-center gap-2 px-4 py-2 bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 rounded-lg text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              <Check className="w-4 h-4" />
              Accept Changes
            </button>
          </div>
        </div>

        {/* Diff View */}
        <div className="flex-1 overflow-auto bg-[#0d0d0d] font-mono text-sm leading-relaxed p-4 custom-scrollbar">
            {diffs.map((part, index) => {
              const bgClass = part.added
                ? 'bg-emerald-900/30 text-emerald-300'
                : part.removed
                ? 'bg-red-900/30 text-red-300 line-through opacity-75'
                : 'text-zinc-300';
                
              const sign = part.added ? '+' : part.removed ? '-' : ' ';

              return (
                <div key={index} className={`${bgClass} whitespace-pre-wrap`}>
                  {part.value.split('\n').map((line: string, i: number, arr: string[]) => {
                     if (i === arr.length - 1 && line === '') return null; // Avoid trailing empty newlines from diff
                     return (
                        <div key={i} className="flex">
                           <span className="select-none w-6 inline-block text-center mr-4 opacity-50 border-r border-white/5">{sign}</span>
                           <span>{line}</span>
                        </div>
                     );
                  })}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
