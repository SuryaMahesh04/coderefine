"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle, Loader2, Search, Brain, Zap, Wrench, ChevronDown, ChevronUp, Sparkles, ClipboardCheck } from "lucide-react";
import { TaskStep } from "./ChatPanel";

interface TaskProgressProps {
  steps: TaskStep[];
  isVisible: boolean;
}

export default function TaskProgress({ steps, isVisible }: TaskProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isVisible || steps.length === 0) return null;

  const currentStep = steps.find((s) => s.status === "running") || steps[steps.length - 1];
  const completedCount = steps.filter((s) => s.status === "done").length;
  const progressPercent = (completedCount / steps.length) * 100;

  const getStepIcon = (name: string, status: string) => {
    if (status === "done") return <CheckCircle className="w-4 h-4 text-[#00E5FF]" />;
    if (status === "running") return <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" />;
    
    if (name.toLowerCase().includes("research") || name.toLowerCase().includes("scan") || name.toLowerCase().includes("read")) 
        return <Search className="w-4 h-4 text-[#86a898]" />;
    if (name.toLowerCase().includes("plan") || name.toLowerCase().includes("think")) 
        return <Brain className="w-4 h-4 text-[#86a898]" />;
    if (name.toLowerCase().includes("fix") || name.toLowerCase().includes("write") || name.toLowerCase().includes("edit")) 
        return <Zap className="w-4 h-4 text-[#00E5FF]" />;
    if (name.toLowerCase().includes("audit") || name.toLowerCase().includes("verify"))
        return <ClipboardCheck className="w-4 h-4 text-[#00C853]" />;
    
    return <Wrench className="w-4 h-4 text-[#86a898]" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, x: "-50%", opacity: 0 }}
        animate={{ y: 0, x: "-50%", opacity: 1 }}
        exit={{ y: -100, x: "-50%", opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 120 }}
        className="fixed top-6 left-1/2 z-[200] w-[420px] pointer-events-auto"
      >
        {/* Glow Layer */}
        <div className="absolute inset-0 bg-[#00E5FF]/5 blur-3xl rounded-full" />
        
        <div className="relative bg-[#050507]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8),0_0_15px_rgba(0,229,255,0.05)] overflow-hidden">
          
          {/* Scanning Beam (during active work) */}
          {currentStep.status === "running" && (
            <motion.div 
              className="absolute left-[-50%] top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-[#00E5FF]/10 to-transparent skew-x-[-20deg]"
              animate={{ left: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Main Content Area */}
          <div className="p-5">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Activity className="w-4 h-4 text-[#00E5FF]" />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#00E5FF] rounded-full blur-[2px]"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#E2E8F0] uppercase tracking-[0.25em] leading-none">Autonomous Agent</span>
                  <span className="text-[9px] font-bold text-[#4d6b5a] uppercase tracking-widest mt-1">Status: {currentStep.status === "running" ? "Surgical Operations" : "Idle"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full border border-[#00E5FF]/20">
                  {completedCount}/{steps.length}
                </span>
                <button 
                   onClick={() => setIsExpanded(!isExpanded)}
                   className="p-1 rounded-full hover:bg-white/5 text-[#4d6b5a] hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Current Step Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00E5FF]/10 to-[#00C853]/10 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity" />
              <div className="relative bg-white/5 border border-white/5 rounded-2xl p-4 transition-all group-hover:bg-white/10 group-hover:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center shadow-inner">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        {getStepIcon(currentStep.name, currentStep.status)}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white truncate leading-tight mb-1">{currentStep.summary || currentStep.name}</div>
                    <div className="flex items-center gap-2">
                       {currentStep.status === "running" && <Loader2 className="w-2.5 h-2.5 text-[#00E5FF] animate-spin" />}
                       <span className={`text-[10px] font-bold ${currentStep.status === "running" ? "text-[#00E5FF] animate-pulse" : "text-[#00C853]"}`}>
                          {currentStep.status === "running" ? "In Progress..." : "Task Finalized"}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* History Steps (Expanded View) */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4 space-y-2 border-t border-white/5 pt-4"
                >
                  {steps.slice(-4, -1).reverse().map((step, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 opacity-50 hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]/30" />
                      <span className="text-[11px] text-[#86a898] truncate">{step.summary || step.name}</span>
                      <CheckCircle className="w-2.5 h-2.5 text-[#00C853] ml-auto" />
                    </div>
                  ))}
                  {steps.length <= 1 && (
                    <div className="text-[10px] text-[#4d6b5a] text-center italic py-2">No past steps to show</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-[#4d6b5a] uppercase tracking-widest px-1">
                <span>Task Execution</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#00E5FF] via-[#00C853] to-[#00E5FF] bg-[length:200%_100%]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%`, backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{ 
                    width: { duration: 0.8, ease: "easeOut" },
                    backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" }
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Bottom Accent */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

