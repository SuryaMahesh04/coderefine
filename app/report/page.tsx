"use client";
import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import { getHistory, AnalysisHistoryEntry } from "../../lib/historyStore";
import jsPDF from "jspdf";
import { Download, History, ShieldAlert, Zap, Activity, Code2, AlertTriangle, FileText } from "lucide-react";

export default function ReportPage() {
    const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
    const [latest, setLatest] = useState<AnalysisHistoryEntry | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const data = getHistory();
        setHistory(data);
        if (data.length > 0) {
            setLatest(data[data.length - 1]);
        }
    }, []);

    const handleDownload = async () => {
        if (!reportRef.current || !latest) return;
        
        try {
            // A simple jsPDF implementation for the report
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Branding / Header
            doc.setFillColor(10, 10, 10);
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("Loom AI Enterprise Report", 15, 25);
            
            doc.setFontSize(10);
            doc.setTextColor(200, 200, 200);
            doc.setFont("helvetica", "normal");
            const dateStr = new Date(latest.timestamp).toLocaleString();
            doc.text(`Generated: ${dateStr}`, 15, 33);
            doc.text(`ID: ${latest.id}`, 140, 33);

            // Scores
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Executive Summary", 15, 55);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Security Score: ${latest.scores.security}/100`, 20, 65);
            doc.text(`Performance Score: ${latest.scores.performance}/100`, 20, 72);
            doc.text(`Quality Score: ${latest.scores.quality}/100`, 20, 79);
            doc.text(`Overall Rating: ${latest.scores.overallRating}/100`, 20, 86);
            doc.text(`Files Analyzed: ${latest.filesAnalyzed.length}`, 20, 93);

            // Bugs
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Detected Vulnerabilities & Issues", 15, 110);
            
            let y = 120;
            doc.setFontSize(10);
            if (latest.bugs.length === 0) {
                doc.setFont("helvetica", "italic");
                doc.text("No issues detected in the latest scan.", 20, y);
                y += 10;
            } else {
                latest.bugs.forEach((bug, i) => {
                    if (y > 270) { doc.addPage(); y = 20; }
                    doc.setFont("helvetica", "bold");
                    doc.text(`[${bug.severity.toUpperCase()}] ${bug.filename} (Line ${bug.line})`, 20, y);
                    y += 6;
                    doc.setFont("helvetica", "normal");
                    const lines = doc.splitTextToSize(`${bug.category}: ${bug.message}`, 170);
                    doc.text(lines, 20, y);
                    y += (lines.length * 5) + 5;
                });
            }

            // Applied Edits
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("AI Code Remediations Applied", 15, y);
            y += 10;

            doc.setFontSize(10);
            if (latest.appliedEdits.length === 0) {
                doc.setFont("helvetica", "italic");
                doc.text("No AI edits were applied during this session.", 20, y);
            } else {
                latest.appliedEdits.forEach((edit, i) => {
                    if (y > 270) { doc.addPage(); y = 20; }
                    doc.setFont("helvetica", "bold");
                    doc.text(`File: ${edit.filename} (Line ${edit.line})`, 20, y);
                    y += 6;
                    doc.setFont("helvetica", "normal");
                    
                    const reasonLines = doc.splitTextToSize(`Reason: ${edit.reason}`, 170);
                    doc.text(reasonLines, 20, y);
                    y += (reasonLines.length * 5) + 2;

                    doc.setTextColor(200, 50, 50); // Red original
                    const origLines = doc.splitTextToSize(`- ${edit.original.trim()}`, 170);
                    doc.text(origLines, 20, y);
                    y += (origLines.length * 5) + 2;

                    doc.setTextColor(50, 150, 50); // Green new
                    const newLines = doc.splitTextToSize(`+ ${edit.rewritten.trim()}`, 170);
                    doc.text(newLines, 20, y);
                    y += (newLines.length * 5) + 6;
                    
                    doc.setTextColor(0, 0, 0); // reset
                });
            }

            doc.save(`Loom_AI_Report_${latest.id}.pdf`);
        } catch (error) {
            console.error("PDF generation failed", error);
            alert("Failed to generate PDF. Check console for details.");
        }
    };

    if (!latest) {
        return (
            <div className="flex w-full h-screen bg-black text-zinc-300 overflow-hidden">
                <Sidebar explorerOpen={false} onToggleExplorer={() => {}} />
                <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950">
                    <FileText className="w-16 h-16 text-zinc-800 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No Reports Available</h2>
                    <p className="text-zinc-500 max-w-sm text-center">Run an analysis in the main editor to generate your first security and performance report.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full h-screen bg-black text-zinc-300 overflow-hidden font-sans">
            <Sidebar explorerOpen={false} onToggleExplorer={() => {}} />

            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-zinc-950">
                {/* Header */}
                <div className="h-24 border-b border-white/5 flex items-end justify-between px-8 pb-4 bg-gradient-to-b from-black to-zinc-950 sticky top-0 z-10 w-full shrink-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center tracking-tight mb-1">
                            Security & Performance Report
                        </h1>
                        <div className="text-xs text-zinc-500 font-mono flex items-center gap-4">
                            <span>Scan ID: {latest.id}</span>
                            <span>{new Date(latest.timestamp).toLocaleString()}</span>
                            <span>{latest.filesAnalyzed.length} Files Analyzed</span>
                        </div>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-sm px-6 py-2.5 bg-[#3fb950] border border-[#2ea043] rounded-lg text-white font-bold hover:bg-[#2ea043] shadow-[0_4px_14px_rgba(63,185,80,0.15)] hover:shadow-[0_6px_20px_rgba(63,185,80,0.25)] transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>

                <div className="p-8 max-w-5xl mx-auto w-full space-y-8" ref={reportRef}>
                    {/* Executive Summary Cards */}
                    <div className="bg-black border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#58a6ff] blur-[120px] opacity-10 pointer-events-none" />

                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#58a6ff]" />
                            Executive Summary
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Security", score: latest.scores.security, color: "text-[#3fb950]", icon: ShieldAlert },
                                { label: "Performance", score: latest.scores.performance, color: "text-[#58a6ff]", icon: Zap },
                                { label: "Quality", score: latest.scores.quality, color: "text-[#e3b341]", icon: Code2 },
                                { label: "Overall", score: latest.scores.overallRating, color: "text-white", icon: Activity }
                            ].map((item, idx) => (
                                <div key={idx} className="p-5 bg-zinc-900/50 border border-white/5 rounded-xl flex flex-col justify-center relative overflow-hidden group hover:bg-zinc-900 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`text-5xl font-mono ${item.color} font-black tracking-tighter`}>{item.score}</div>
                                        <item.icon className={`w-5 h-5 ${item.color} opacity-20 group-hover:opacity-50 transition-opacity`} />
                                    </div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">{item.label}</div>
                                    <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                                        <div className="h-full bg-current transition-all duration-1000" style={{ width: `${item.score}%`, color: item.color.replace('text-', '') }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed AI Findings (Bugs) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white px-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-[#e3b341]" />
                            Detected Vulnerabilities & Issues
                            <span className="ml-auto text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400">{latest.bugs.length} found</span>
                        </h3>
                        
                        {latest.bugs.length === 0 ? (
                            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center text-zinc-400 font-medium">
                                No issues detected in this scan! Clean codebase.
                            </div>
                        ) : (
                            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-lg">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#0d1117] text-gray-400 text-xs uppercase tracking-wider border-b border-[#30363d]">
                                            <th className="p-4 font-semibold w-32">Severity</th>
                                            <th className="p-4 font-semibold w-48">Location</th>
                                            <th className="p-4 font-semibold">Issue Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#30363d]">
                                        {latest.bugs.map((bug, idx) => (
                                            <tr key={idx} className="hover:bg-[#1f2937]/30 transition-colors">
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold leading-none ${
                                                        bug.severity === 'critical' ? 'bg-[rgba(248,81,73,0.1)] text-[#f85149] border border-[#f85149]/30' :
                                                        bug.severity === 'medium' ? 'bg-[rgba(227,179,65,0.1)] text-[#e3b341] border border-[#e3b341]/30' :
                                                        'bg-[rgba(139,148,158,0.1)] text-gray-400 border border-gray-600'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            bug.severity === 'critical' ? 'bg-[#f85149]' :
                                                            bug.severity === 'medium' ? 'bg-[#e3b341]' :
                                                            'bg-gray-400'
                                                        }`}></span>
                                                        {bug.severity.charAt(0).toUpperCase() + bug.severity.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-medium text-white truncate max-w-[180px]" title={bug.filename}>{bug.filename}</div>
                                                    <div className="text-xs text-zinc-500 font-mono mt-0.5">Line {bug.line}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-zinc-300 font-semibold mb-1">{bug.category}</div>
                                                    <div className="text-sm text-zinc-400">{bug.message}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Applied AI Edits Log */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white px-2 flex items-center gap-2 pb-2 border-b border-white/5">
                            <History className="w-5 h-5 text-[#3fb950]" />
                            Applied Remediations (History)
                            <span className="ml-auto text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400">{latest.appliedEdits.length} edits</span>
                        </h3>

                        {latest.appliedEdits.length === 0 ? (
                            <div className="bg-[#161b22]/50 border border-dashed border-[#30363d] rounded-2xl p-8 text-center text-zinc-500 text-sm">
                                No AI remediation edits have been applied to this codebase yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {latest.appliedEdits.map((edit, idx) => (
                                    <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 shadow-sm hover:border-[#3fb950]/30 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="text-sm font-bold text-white mb-0.5">{edit.reason}</div>
                                                <div className="text-xs text-zinc-500 font-mono">{edit.filename} : Line {edit.line}</div>
                                            </div>
                                            <span className="px-2 py-1 bg-zinc-800 text-xs font-semibold text-zinc-300 rounded uppercase tracking-wider">{edit.category}</span>
                                        </div>
                                        <div className="font-mono text-[11px] bg-[#0d1117] rounded-lg p-3 border border-white/5 overflow-x-auto space-y-1">
                                            <div className="text-red-400 whitespace-pre flex gap-2">
                                                <span className="select-none opacity-50">-</span>
                                                <span className="line-through opacity-70">{edit.original}</span>
                                            </div>
                                            <div className="text-green-400 whitespace-pre flex gap-2">
                                                <span className="select-none opacity-50">+</span>
                                                <span>{edit.rewritten}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
