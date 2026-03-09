"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function HistoryPage() {
  const [history] = useState([
    { id: 1, file: "auth_controller.py", lang: "Python", score: 92, date: "2 mins ago", fixes: 3 },
    { id: 2, file: "utils.js", lang: "Javascript", score: 85, date: "1 hour ago", fixes: 1 },
    { id: 3, file: "payment_gw.go", lang: "Go", score: 60, date: "Yesterday", fixes: 8 },
    { id: 4, file: "main.cpp", lang: "C++", score: 98, date: "2 days ago", fixes: 0 },
  ]);

  return (
    <div className="flex w-full h-screen bg-black text-zinc-300 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-zinc-950">
        <div className="h-24 border-b border-white/5 flex items-end px-8 pb-4 bg-gradient-to-b from-black to-zinc-950">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
            Session History
          </h1>
        </div>

        <div className="p-8 max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center text-gray-400 mb-6 px-4">
            <div className="text-sm font-semibold uppercase tracking-wider">Recent Reviews</div>
            <div className="text-sm">Showing {history.length} sessions</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((session) => (
              <div
                key={session.id}
                className="group relative p-6 bg-black border border-white/5 rounded-2xl hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all cursor-pointer overflow-hidden"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-mono text-white text-lg font-semibold truncate max-w-[200px] mb-1 group-hover:text-blue-400 transition-colors">{session.file}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-400">{session.lang}</span>
                    </div>
                    <div className="text-xs text-gray-500">{session.date}</div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 uppercase font-semibold">Quality Score</span>
                      <span className={`text-2xl font-bold ${session.score > 90 ? 'text-green-500' : session.score > 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {session.score}/100
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 uppercase font-semibold">AI Fixes</span>
                      <span className="text-xl font-medium text-white">{session.fixes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
}
