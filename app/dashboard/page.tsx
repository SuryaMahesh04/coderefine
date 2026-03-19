"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, ArrowRight, Shield, Zap, Star, 
  AlertTriangle, TrendingUp, FileCode, ChevronRight, Activity, FolderGit2
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "../../components/DashboardShell";

interface Report {
  _id: string;
  scores: { security: number; performance: number; quality: number; overallRating: number };
  bugs: any[];
  filesAnalyzed: string[];
  appliedEdits: any[];
  timestamp: string;
}

const StatCard = ({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; }) => (
  <div className={`bg-zinc-950 border border-white/5 rounded-2xl p-5 flex flex-col gap-2 hover:border-white/10 transition-colors`}>
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="text-2xl font-black mt-1">{value}</div>
    <div className="text-xs text-zinc-500 font-medium">{label}</div>
    {sub && <div className="text-xs text-zinc-600 mt-1">{sub}</div>}
  </div>
);

const ScoreBadge = ({ score }: { score: number }) => {
  const color = score >= 80 ? "bg-green-500/10 text-green-400" : score >= 60 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400";
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{score}/100</span>;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [usage, setUsage] = useState<{ limit: number; remaining: number; used: number; plan: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      try {
        const [reportsRes, usageRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/user/usage")
        ]);

        if (reportsRes.ok) {
          const data = await reportsRes.json();
          setReports(data.reports || []);
        }

        if (usageRes.ok) {
          const data = await usageRes.json();
          setUsage(data);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status]);

  if (status === "loading") {
    return <div className="min-h-screen bg-black flex items-center justify-center text-[#00E5FF] font-mono text-sm">Initializing dashboard...</div>;
  }

  if (!session) return null;

  const userPlan = (session?.user as any)?.plan || "free";
  const planLabel = userPlan.charAt(0).toUpperCase() + userPlan.slice(1);

  // Compute stats from reports
  const totalScans = reports.length;
  const avgOverall = totalScans > 0 ? Math.round(reports.reduce((acc, r) => acc + (r.scores?.overallRating || 0), 0) / totalScans) : 0;
  const totalBugsFixed = reports.reduce((acc, r) => acc + (r.appliedEdits?.length || 0), 0);
  const criticalBugs = reports.reduce((acc, r) => acc + (r.bugs?.filter((b: any) => b.severity === "critical").length || 0), 0);

  const recentReports = reports.slice(0, 6);

  return (
    <DashboardShell 
      title={`Welcome back, ${session?.user?.name?.split(" ")[0] || "Developer"} 👋`}
      subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      actions={
        <Link
          href="/app"
          className="flex items-center gap-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black px-4 py-2 rounded-lg font-bold text-sm transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </Link>
      }
    >
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Activity className="w-4 h-4 text-[#00E5FF]" />} label="Total Scans" value={totalScans} color="bg-[#00E5FF]/10" />
          <StatCard icon={<TrendingUp className="w-4 h-4 text-green-400" />} label="Avg. Overall Score" value={totalScans > 0 ? `${avgOverall}` : "—"} sub={totalScans > 0 ? "out of 100" : "Run a scan first"} color="bg-green-500/10" />
          <StatCard icon={<Star className="w-4 h-4 text-amber-400" />} label="AI Remediations" value={totalBugsFixed} color="bg-amber-500/10" />
          <StatCard icon={<AlertTriangle className="w-4 h-4 text-red-400" />} label="Critical Issues Found" value={criticalBugs} color="bg-red-500/10" />
        </div>

        {/* ── Usage Tracking ── */}
        {usage && (
          <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/10 blur-[100px] -mr-32 -mt-32 transition-opacity group-hover:opacity-50" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00E5FF]" />
                  <h3 className="font-bold text-lg">Usage Tracking</h3>
                </div>
                <p className="text-sm text-zinc-500">
                  You are currently on the <span className="text-white font-bold">{usage.plan.toUpperCase()}</span> plan.
                </p>
              </div>

              <div className="flex-1 max-w-md space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">Analyses Used</span>
                  <span className="text-[#00E5FF] font-bold">{usage.used} / {usage.limit}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00E5FF] to-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-zinc-600">Daily limit resets every 24h</p>
                  {usage.used / usage.limit > 0.8 && (
                    <p className="text-[10px] text-amber-500 font-bold animate-pulse">Running low on limit!</p>
                  )}
                </div>
              </div>

              <Link 
                href="/pricing"
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap"
              >
                Get More Limit <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Recent Scans ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Scans</h2>
            {reports.length > 0 && (
              <Link href="/history" className="text-xs text-zinc-500 hover:text-[#00E5FF] transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-52 bg-zinc-950 border border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-zinc-950/50">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                <FolderGit2 className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Scans Yet</h3>
              <p className="text-zinc-500 max-w-sm text-center mb-8">
                Upload your code and run your first AI-powered analysis to see results here.
              </p>
              <Link href="/app" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                Open Sandbox IDE
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentReports.map((report) => (
                <div
                  key={report._id}
                  className="group flex flex-col bg-zinc-950 border border-white/5 rounded-2xl p-5 transition-all hover:border-[#00E5FF]/30 hover:shadow-[0_8px_30px_rgba(0,229,255,0.06)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-[#00E5FF] opacity-0 group-hover:opacity-[0.03] blur-[80px] transition-opacity pointer-events-none" />

                  {/* Title row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        <FileCode className="w-4 h-4 text-zinc-400 group-hover:text-[#00E5FF] transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-tight truncate max-w-[130px]" title={report.filesAnalyzed?.join(", ")}>
                          {report.filesAnalyzed?.[0]?.split(".")[0] || "Analysis"}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {new Date(report.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <ScoreBadge score={report.scores?.overallRating || 0} />
                  </div>

                  {/* Score bars */}
                  <div className="space-y-2 mb-4 flex-1">
                    {[
                      { key: "security", label: "Security", color: "bg-green-500", icon: <Shield className="w-3 h-3" /> },
                      { key: "performance", label: "Speed", color: "bg-[#00E5FF]", icon: <Zap className="w-3 h-3" /> },
                      { key: "quality", label: "Quality", color: "bg-emerald-400", icon: <Star className="w-3 h-3" /> },
                    ].map(({ key, label, color, icon }) => {
                      const score = (report.scores as any)?.[key] || 0;
                      return (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span className="text-zinc-600 w-3">{icon}</span>
                          <span className="text-zinc-500 w-14">{label}</span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-zinc-400 font-mono w-5 text-right">{score}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-zinc-600">{report.bugs?.length || 0} issues · {report.filesAnalyzed?.length || 0} files</span>
                    <Link
                      href="/app"
                      className="flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-[#00E5FF] transition-colors"
                    >
                      Open <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
