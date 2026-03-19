"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, FileCode, ArrowRight, Shield, Zap, Star, Search, Filter } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "../../components/DashboardShell";

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/reports")
        .then(res => res.json())
        .then(data => {
          if (data.reports) setHistory(data.reports);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch reports", err);
          setIsLoading(false);
        });
    }
  }, [status, router]);

  const handleClear = () => {
    alert("History deletion from database is currently disabled for this phase.");
  };

  const formatTimeAgo = (timestamp: any) => {
    const date = new Date(timestamp);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000);
    
    if (Math.abs(diffInSeconds) < 60) return rtf.format(diffInSeconds, 'second');
    if (Math.abs(diffInSeconds) < 3600) return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
    if (Math.abs(diffInSeconds) < 86400) return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
    return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
  };

  return (
    <DashboardShell 
      title="Scan History" 
      subtitle="View and manage your previous AI analyses"
      actions={
        <button
          onClick={handleClear}
          disabled={history.length === 0}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-white/5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all border border-white/5 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      }
    >
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Search/Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-3 rounded-2xl">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="w-full bg-black border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#00E5FF]/30 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-black border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
              <Filter className="w-3.5 h-3.5" />
              Filter By Plan
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-zinc-950 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-3xl bg-zinc-950/50">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
              <FileCode className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Reports Found</h3>
            <p className="text-zinc-500 max-w-sm text-center mb-8">
              Run an analysis in the editor to see your results here.
            </p>
            <Link href="/app" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
              Open Editor
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((report) => (
              <div
                key={report._id}
                className="group relative p-6 bg-zinc-950 border border-white/5 rounded-2xl hover:border-[#00E5FF]/30 hover:shadow-[0_8px_30px_rgba(0,229,255,0.06)] transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF] opacity-0 group-hover:opacity-5 blur-[80px] transition-opacity" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-[#00E5FF]/20 group-hover:text-[#00E5FF] transition-all">
                          <FileCode className="w-5 h-5" />
                       </div>
                       <div>
                          <h3 className="font-bold text-white text-sm truncate max-w-[150px] mb-1" title={report.filesAnalyzed.join(', ')}>
                            {report.filesAnalyzed.length > 0 ? report.filesAnalyzed[0] : "Project"}
                          </h3>
                          <div className="text-[10px] text-zinc-500 font-mono">{formatTimeAgo(report.timestamp)}</div>
                       </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${report.scores.overallRating > 80 ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                       Score: {report.scores.overallRating}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                       <Shield className="w-3.5 h-3.5 text-green-500" />
                       <span className="text-xs font-bold text-zinc-300">{report.scores.security}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
                       <span className="text-xs font-bold text-zinc-300">{report.scores.performance}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Star className="w-3.5 h-3.5 text-amber-400" />
                       <span className="text-xs font-bold text-zinc-300">{report.scores.quality}</span>
                    </div>
                    <div className="ml-auto">
                       <Link href="/app" className="p-2 bg-white/5 rounded-lg hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] transition-all">
                          <ArrowRight className="w-4 h-4" />
                       </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
