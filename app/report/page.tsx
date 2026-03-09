"use client";
import React from "react";
import Sidebar from "../../components/Sidebar";

export default function ReportPage() {
    const handleDownload = () => {
        alert("In a real app, this triggers jsPDF to render a branded report.");
    };

    return (
        <div className="flex w-full h-screen bg-black text-zinc-300 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-zinc-950">
                <div className="h-24 border-b border-white/5 flex items-end justify-between px-8 pb-4 bg-gradient-to-b from-black to-zinc-950 sticky top-0 z-10 w-full">
                    <h1 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
                        Security & Performance Report
                    </h1>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-sm px-6 py-2.5 bg-[#3fb950] border border-[#2ea043] rounded-lg text-white font-bold hover:bg-[#2ea043] hover:shadow-[0_0_15px_rgba(63,185,80,0.3)] transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export PDF
                    </button>
                </div>

                <div className="p-8 max-w-5xl mx-auto w-full">
                    {/* Executive Summary */}
                    <div className="bg-black border border-white/5 rounded-2xl p-8 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#58a6ff] blur-[120px] opacity-10 pointer-events-none" />

                        <h2 className="text-xl font-bold text-white mb-6">Executive Summary</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-5 bg-zinc-900 border border-white/5 rounded-xl flex flex-col justify-center">
                                <div className="text-5xl font-mono text-[#3fb950] mb-3 font-semibold tracking-tighter">A+</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Security Rating</div>
                            </div>
                            <div className="p-5 bg-zinc-900 border border-white/5 rounded-xl">
                                <div className="text-4xl font-mono text-white mb-3">2</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Bugs Prevented</div>
                            </div>
                            <div className="p-5 bg-zinc-900 border border-white/5 rounded-xl">
                                <div className="text-4xl font-mono text-[#e3b341] mb-3">1</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Perf Warnings</div>
                            </div>
                            <div className="p-5 bg-zinc-900 border border-white/5 rounded-xl">
                                <div className="text-4xl font-mono text-[#58a6ff] mb-3">120ms</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Execution Time</div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Findings Table */}
                    <h3 className="text-lg font-bold text-white mb-4 px-2">Detailed AI Findings</h3>
                    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-lg">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0d1117] text-gray-400 text-xs uppercase tracking-wider border-b border-[#30363d]">
                                    <th className="p-4 font-semibold">Severity</th>
                                    <th className="p-4 font-semibold">Category</th>
                                    <th className="p-4 font-semibold">Issue Details</th>
                                    <th className="p-4 font-semibold">AI Action Taken</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#30363d]">
                                <tr className="hover:bg-[#1f2937]/50 transition-colors">
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold leading-none bg-[rgba(248,81,73,0.1)] text-[#f85149] border border-[#f85149]/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#f85149]"></span>
                                            Critical
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-white">Security (OWASP)</td>
                                    <td className="p-4 text-sm text-gray-300">Detected raw SQL string interpolation capable of injection attacks.</td>
                                    <td className="p-4 text-sm text-[#3fb950] font-mono">Rewrote to parameterized queries.</td>
                                </tr>
                                <tr className="hover:bg-[#1f2937]/50 transition-colors">
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold leading-none bg-[rgba(227,179,65,0.1)] text-[#e3b341] border border-[#e3b341]/30">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#e3b341]"></span>
                                            Medium
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-white">Performance / O(n)</td>
                                    <td className="p-4 text-sm text-gray-300">Nested array iteration resulting in O(n²) time complexity.</td>
                                    <td className="p-4 text-sm text-[#58a6ff] font-mono">Flattened into a Map lookup (O(1)).</td>
                                </tr>
                                <tr className="hover:bg-[#1f2937]/50 transition-colors">
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold leading-none bg-[rgba(139,148,158,0.1)] text-gray-400 border border-gray-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                            Low
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-white">Best Practices</td>
                                    <td className="p-4 text-sm text-gray-300">Hardcoded configuration string inside logic file.</td>
                                    <td className="p-4 text-sm text-[#58a6ff] font-mono">Moved logic to environment variables.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
