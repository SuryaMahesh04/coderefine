"use client";

import { Navbar } from "../components/Navbar";
import {
  ArrowRight, ShieldCheck, Desktop, CheckCircle, ChartBar, Robot, FileArchive
} from "@phosphor-icons/react";
import Link from "next/link";
import { motion } from "framer-motion";
import LoomLogo from "../components/LoomLogo";
import { GridScan } from "../components/GridScan";

// ── Mini UI Mockups (pure JSX) ──────────────────────────────

function InlineEditMockup() {
  return (
    <div className="bg-[#000000] rounded-xl overflow-hidden border border-[rgba(0,229,255,0.15)] shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(0,229,255,0.15)] bg-[rgba(10,10,10,0.8)] backdrop-blur-md">
        <div className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#e3b341]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
        <span className="ml-3 text-xs font-mono text-[#86a898]">auth_controller.ts — Loom AI</span>
      </div>
      <div className="grid grid-cols-5 h-[280px]">
        {/* Code panel */}
        <div className="col-span-3 p-5 border-r border-[rgba(0,229,255,0.15)] font-mono text-xs leading-relaxed bg-[#000000]">
          <div className="text-[#4d6b5a]">// Process user authentication</div>
          <div className="text-[#ff7b72]">export async function <span className="text-[#39FF7F]">login</span><span className="text-[#F0FFF4]">(req, res) {'{'}</span></div>
          <div className="ml-4 text-[#F0FFF4]">const userId = req.body.user;</div>

          <div className="mt-2 bg-[rgba(248,81,73,0.05)] border-l-2 border-[#f85149] pl-3 py-1 text-[#F0FFF4] relative group">
            <span className="line-through text-[#86a898] opacity-70">{"const query = `SELECT * FROM users WHERE id=${userId}`;"}</span>
            {/* Agent Float Tooltip */}
            <div className="absolute left-0 top-[120%] bg-[#0a0a0f] border border-[rgba(248,81,73,0.3)] rounded-lg p-2 w-64 shadow-xl z-20">
              <div className="text-[10px] font-bold text-[#f85149] uppercase tracking-wider mb-1">SQL Injection Vulnerability</div>
              <div className="text-[10px] text-[#86a898] leading-snug">Raw user input interpolated into SQL query. Rewriting with parameterized statement...</div>
            </div>
          </div>

          <div className="mt-1 bg-[rgba(0,200,83,0.05)] border-l-2 border-[#00C853] pl-3 py-1 text-[#F0FFF4] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(0,200,83,0.1)] to-transparent w-[200%] animate-scan" />
            <span className="text-[#39FF7F] font-bold">{"const query = `SELECT * FROM users WHERE id=?`;"}</span>
            <br />
            <span className="text-[#39FF7F] font-bold">const user = await db.query(query, [userId]);</span>
          </div>

          <div className="text-[#F0FFF4] mt-2">{'}'}</div>
        </div>
        {/* AI panel */}
        <div className="col-span-2 p-4 flex flex-col gap-3 bg-[rgba(10,10,15,0.4)]">
          <div className="text-[10px] font-display font-bold text-[#86a898] uppercase tracking-wider flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse shadow-[0_0_5px_#00C853]" />
            AI Engineer
          </div>
          <div className="glass-card rounded-lg p-3 text-[11px] text-[#F0FFF4] leading-relaxed relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#39FF7F] to-[#00C853]" />
            "Fixing critical SQL Injection. Using prepared statements to prevent unauthorized data access."
          </div>
          <div className="mt-auto flex justify-end gap-2 text-[10px]">
            <button className="px-3 py-1.5 bg-transparent border border-[rgba(0,229,255,0.2)] text-[#86a898] rounded hover:bg-[rgba(0,229,255,0.05)] hover:text-[#00E5FF] transition-colors font-medium">Reject</button>
            <button className="px-3 py-1.5 bg-gradient-to-r from-[#00C853] to-[#00E5FF] text-[#000000] rounded font-bold hover:brightness-110 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all">Accept Fix</button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F0FFF4] font-sans selection:bg-[#00E5FF] selection:text-[#000000] overflow-x-hidden overflow-y-auto relative">
      <Navbar />

      <main className="relative pt-32 pb-24 z-10 w-full">
        {/* Dynamic Grid Scan Background */}
        <div className="absolute top-0 left-0 w-full h-[1000px] -z-10 opacity-80">
          <GridScan
            gridScale={0.15}
            lineThickness={1.5}
            linesColor="#00E5FF"
            scanColor="#00C853"
            scanOpacity={0.4}
            lineJitter={0.05}
            bloomIntensity={0.6}
            enablePost={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/50 to-[#000000]" />
        </div>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="px-6 max-w-[1200px] mx-auto flex flex-col items-center text-center pt-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center w-full max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 text-[#86a898] text-[11px] font-bold mb-8 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse"></span>
              LOOM AI ENTERPRISE 1.0 IS NOW PUBLIC
            </div>

            <h1 className="text-6xl md:text-[88px] font-display font-black tracking-tighter leading-[0.95] text-white drop-shadow-2xl mb-8">
              Code review,{" "}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00C853] to-[#39FF7F]">
                autonomous.
              </span>
            </h1>

            <p className="text-[19px] md:text-[22px] text-[#86a898] max-w-2xl mx-auto mb-12 leading-relaxed font-medium tracking-tight">
              An enterprise-grade AI engineer that lives in your workspace. It hunts vulnerabilities, rewrites O(N²) loops, and ships pristine code while you sleep.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link href="/app" className="w-full sm:w-auto">
                <button className="w-full h-14 px-8 rounded-2xl text-sm font-black bg-white text-black hover:bg-[#F0FFF4] hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                  Launch Sandbox <ArrowRight size={16} weight="bold" />
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full h-14 px-8 rounded-2xl text-sm font-bold bg-[#FFFFFF]/5 text-white border border-[#FFFFFF]/10 hover:bg-[#FFFFFF]/10 transition-all flex items-center justify-center">
                  Book A Demo
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Inline Hero Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-full max-w-[1000px] mt-20 relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-b from-[rgba(0,229,255,0.2)] to-[rgba(0,200,83,0.05)] rounded-[24px] blur-xl opacity-50" />
            <div className="rounded-[20px] overflow-hidden border border-[#FFFFFF]/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative bg-black/50 backdrop-blur-xl">
              <InlineEditMockup />
            </div>
          </motion.div>
        </section>

        {/* ── METRICS / TRUST BAR ─────────────────────────────────────────── */}
        <div className="mt-32 max-w-[1200px] mx-auto px-6 border-y border-[#FFFFFF]/5 py-8 bg-[#000000]/40 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#FFFFFF]/5">
            {[
              { label: "Lines Analyzed", val: "2500+", color: "text-white" },
              { label: "Vulnerabilities Patched", val: "150", color: "text-[#00E5FF]" },
              { label: "Avg. Review Time", val: "<500ms", color: "text-[#00C853]" },
              { label: "Compliance", val: "SOC2 Type II", color: "text-[#86a898]" },
            ].map((stat, i) => (
              <div key={i} className={`flex flex-col items-center justify-center ${i === 0 ? 'pl-0' : 'pl-8'}`}>
                <div className={`text-3xl md:text-4xl font-display font-black tracking-tighter mb-1 ${stat.color}`}>
                  {stat.val}
                </div>
                <div className="text-[11px] font-bold text-[#86a898] uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BENTO GRID FEATURES ─────────────────────────────────────────── */}
        <section id="features" className="mt-40 px-6 max-w-[1200px] mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white mb-4">
              Built for engineering scale.
            </h2>
            <p className="text-[#86a898] text-lg max-w-xl font-medium">
              Everything you need to secure and optimize your codebase in real-time, packed into a single, cohesive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[340px]">
            {/* Bento Item 1: Large (Span 2) */}
            <div className="md:col-span-2 rounded-[24px] bg-[#050507] border border-[#FFFFFF]/5 overflow-hidden group relative flex flex-col md:flex-row hover:border-[#00E5FF]/20 transition-colors duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,229,255,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-10 flex flex-col justify-center flex-1 relative z-10 w-full md:w-1/2">
                <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6">
                  <Robot size={24} weight="duotone" className="text-[#00E5FF]" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">Multi-Agent Architecture</h3>
                <p className="text-[#86a898] text-sm leading-relaxed font- মাঝারি">
                  Loom AI doesn't just use one LLM. It deploys a swarm of specialized agents—auditors, optimizers, and reviewers—to analyze your code in parallel for unprecedented accuracy.
                </p>
              </div>
              <div className="w-full md:w-1/2 relative bg-[#000000] border-l border-[#FFFFFF]/5 overflow-hidden flex items-center justify-center">
                {/* Visual Representation */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]" />
                <div className="flex gap-4 p-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#000000] border border-[#f85149]/30 flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(248,81,73,0.1)]">
                    <ShieldCheck size={20} className="text-[#f85149]" /> <span className="text-[9px] text-[#f85149] font-bold">SECURITY</span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#000000] border border-[#00C853]/30 flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(0,200,83,0.1)] -translate-y-4">
                    <ChartBar size={20} className="text-[#00C853]" /> <span className="text-[9px] text-[#00C853] font-bold">PERF</span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#000000] border border-[#00E5FF]/30 flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                    <CheckCircle size={20} className="text-[#00E5FF]" /> <span className="text-[9px] text-[#00E5FF] font-bold">QUALITY</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Item 2: Small */}
            <div className="rounded-[24px] bg-[#050507] border border-[#FFFFFF]/5 overflow-hidden group relative flex flex-col hover:border-[#00C853]/20 transition-colors duration-500 p-8">
              <div className="absolute inset-0 bg-gradient-to-bl from-[rgba(0,200,83,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-10 h-10 rounded-lg bg-[#00C853]/10 border border-[#00C853]/20 flex items-center justify-center mb-6 relative z-10">
                <Desktop size={20} weight="duotone" className="text-[#00C853]" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2 relative z-10">Inline Executions</h3>
              <p className="text-[#86a898] text-sm leading-relaxed relative z-10">
                Stop jumping between tabs. Review dynamic diffs and accept code rewrites directly inside the proprietary Loom IDE.
              </p>
              <div className="mt-auto relative z-10 p-3 rounded-lg bg-[#000000] border border-[rgba(0,200,83,0.2)] font-mono text-[10px] text-[#39FF7F]">
                + function _optimized() {'{'} ... {'}'}
              </div>
            </div>

            {/* Bento Item 3: Small */}
            <div className="rounded-[24px] bg-[#050507] border border-[#FFFFFF]/5 overflow-hidden group relative flex flex-col hover:border-[#39FF7F]/20 transition-colors duration-500 p-8">
              <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(57,255,127,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-10 h-10 rounded-lg bg-[#39FF7F]/10 border border-[#39FF7F]/20 flex items-center justify-center mb-6 relative z-10">
                <ShieldCheck size={20} weight="duotone" className="text-[#39FF7F]" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2 relative z-10">OWASP Hardened</h3>
              <p className="text-[#86a898] text-sm leading-relaxed relative z-10">
                Continuous background scanning protects against SQL injections, XSS, and hardcoded secrets as you type.
              </p>
            </div>

            {/* Bento Item 4: Large (Span 2) */}
            <div className="md:col-span-2 rounded-[24px] bg-[#050507] border border-[#FFFFFF]/5 overflow-hidden group relative p-10 flex flex-col hover:border-[#ffffff]/10 transition-colors duration-500">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Exportable Audit Trails</h3>
                  <p className="text-[#86a898] text-sm w-2/3 leading-relaxed">
                    Loom AI automatically generates comprehensive markdown and PDF reports of every codebase scan, ready for SOC2 compliance.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#ffffff]/5 border border-[#ffffff]/10 flex items-center justify-center">
                  <FileArchive size={24} className="text-white" />
                </div>
              </div>
              {/* Visual Mockup of Report */}
              <div className="flex-1 mt-auto bg-[#000000] rounded-xl border border-[#FFFFFF]/10 p-4 relative overflow-hidden flex items-end">
                <div className="absolute top-0 left-0 w-full h-8 bg-[#111] border-b border-[#FFFFFF]/10 flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-yellow-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[9px] font-mono text-zinc-500 ml-2">LOOM_AUDIT_REPORT.pdf</span>
                </div>
                <div className="w-full h-full pt-6 flex gap-4 opacity-70">
                  <div className="w-1/3 bg-zinc-900 rounded border border-zinc-800 h-full p-2 space-y-2">
                    <div className="w-full h-2 bg-zinc-800 rounded"></div>
                    <div className="w-2/3 h-2 bg-zinc-800 rounded"></div>
                  </div>
                  <div className="w-2/3 bg-zinc-900 rounded border border-zinc-800 h-full p-3 flex flex-col gap-3">
                    <div className="w-1/2 h-4 bg-[#00E5FF]/20 rounded"></div>
                    <div className="w-full h-2 bg-zinc-800 rounded"></div>
                    <div className="w-4/5 h-2 bg-zinc-800 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HIGH IMPACT CTA ────────────────────────────────────────────────── */}
        <section className="mt-40 mb-10 px-6 max-w-[1200px] mx-auto">
          <div className="rounded-[32px] py-24 px-8 md:px-16 text-center shadow-[0_20px_80px_rgba(0,229,255,0.1)] border border-[#FFFFFF]/10 relative overflow-hidden bg-[#050507]">
            {/* Mesh gradient backgrounds */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00E5FF] mix-blend-screen filter blur-[150px] opacity-[0.15] translate-x-1/3 -translate-y-1/3 pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00C853] mix-blend-screen filter blur-[150px] opacity-[0.15] -translate-x-1/3 translate-y-1/3 pointer-events-none rounded-full" />

            <div className="w-16 h-16 rounded-2xl bg-[#000000] border border-[#ffffff]/10 mx-auto flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
              <LoomLogo size={32} />
            </div>

            <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter mb-6 relative z-10 leading-[1.1]">
              Ready to eradicate <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00C853]">technical debt?</span>
            </h2>
            <p className="text-[17px] font-medium text-[#86a898] mb-12 max-w-xl mx-auto leading-relaxed relative z-10">
              Start securing and optimizing your enterprise codebase in seconds. Free for individual developers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/app" className="w-full sm:w-auto">
                <button className="w-full h-14 px-10 rounded-2xl text-[15px] font-bold bg-[#FFFFFF] text-[#000000] hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2">
                  Start Coding <ArrowRight size={18} weight="bold" />
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#000000] border-t border-[rgba(0,229,255,0.15)] py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <LoomLogo size={48} showText={true} />
            <span className="text-xs font-medium text-[#4d6b5a] border-l border-[rgba(0,200,83,0.2)] pl-6">
              Built with Loom AI Enterprise
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-bold text-[#86a898]">
            <Link href="#features" className="hover:text-[#00C853] transition-colors">Features</Link>
            <Link href="/app" className="hover:text-[#00C853] transition-colors">Sandbox</Link>
            <Link href="/history" className="hover:text-[#00C853] transition-colors">History Log</Link>
            <Link href="/report" className="hover:text-[#00C853] transition-colors">Enterprise Report</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-[rgba(0,200,83,0.1)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-[#4d6b5a]">
          <p>© {new Date().getFullYear()} Loom AI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-[#86a898] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#86a898] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
