"use client";

import { Navbar } from "../components/Navbar";
import {
  ArrowRight, Sparkle, Robot, Code, ShieldCheck, BugBeetle,
  CheckCircle, ArrowUpRight, Desktop, Users, ChartBar
} from "@phosphor-icons/react";
import Link from "next/link";
import { motion } from "framer-motion";

// ── Mini UI Mockups (pure JSX) ──────────────────────────────

function InlineEditMockup() {
  return (
    <div className="bg-[#000000] rounded-xl overflow-hidden border border-[rgba(0,229,255,0.15)] shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(0,229,255,0.15)] bg-[rgba(10,10,10,0.8)] backdrop-blur-md">
        <div className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#e3b341]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
        <span className="ml-3 text-xs font-mono text-[#86a898]">auth_controller.ts — CodeRefine</span>
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

function SecurityDashboardMockup() {
  return (
    <div className="bg-[#000000] rounded-xl border border-[rgba(0,229,255,0.15)] shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[280px]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(0,229,255,0.15)] bg-[rgba(10,10,10,0.8)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-sphere flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <ShieldCheck size={16} weight="bold" className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          </div>
          <div>
            <div className="text-xs font-display font-bold text-[#F0FFF4]">Security War-Room</div>
            <div className="text-[10px] text-[#86a898]">Real-time vulnerability metrics</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-[rgba(0,200,83,0.1)] text-[#00C853] border border-[rgba(0,200,83,0.3)] px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,200,83,0.15)]">System Secure</span>
        </div>
      </div>
      <div className="p-5 grid grid-cols-4 gap-4 bg-[rgba(5,5,7,0.5)] flex-1 content-start relative">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#00C853] opacity-[0.03] blur-[40px] pointer-events-none rounded-tl-full" />
        <div className="col-span-4 grid grid-cols-3 gap-3 relative z-10">
          <div className="glass-card p-3 rounded-xl flex flex-col">
            <div className="text-2xl font-mono text-[#39FF7F] font-bold mb-1 tracking-tighter drop-shadow-[0_0_5px_rgba(57,255,127,0.5)]">A+</div>
            <div className="text-[9px] text-[#86a898] uppercase tracking-widest font-bold">Code Rating</div>
          </div>
          <div className="glass-card p-3 rounded-xl">
            <div className="text-xl font-mono text-[#F0FFF4] font-bold mb-1">1,204</div>
            <div className="text-[9px] text-[#86a898] uppercase tracking-widest font-bold">Bugs Fixed</div>
          </div>
          <div className="glass-card p-3 rounded-xl">
            <div className="text-xl font-mono text-[#00C853] font-bold mb-1">12ms</div>
            <div className="text-[9px] text-[#86a898] uppercase tracking-widest font-bold">Response</div>
          </div>
        </div>
        <div className="col-span-4 mt-2 relative z-10">
          <div className="text-[10px] text-[#4d6b5a] mb-2 font-display font-bold uppercase tracking-wider">Recent Enterprise Interventions</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] p-2 bg-[rgba(10,10,15,0.6)] rounded border border-[rgba(0,200,83,0.08)]">
              <span className="font-semibold text-[#F0FFF4] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#f85149] shadow-[0_0_5px_#f85149]"></span>SQL Injection</span>
              <span className="text-[#00C853] font-mono">Auto-Patched</span>
            </div>
            <div className="flex justify-between items-center text-[10px] p-2 bg-[rgba(10,10,15,0.6)] rounded border border-[rgba(0,200,83,0.08)]">
              <span className="font-semibold text-[#F0FFF4] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#e3b341] shadow-[0_0_5px_#e3b341]"></span>O(N²) Loop</span>
              <span className="text-[#39FF7F] font-mono">Optimized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature Showcase Data ──────────────────────────────────────────────────────
const features = [
  {
    id: "copilot",
    badge: "AI-Powered",
    title: "Autonomous AI Copilot — finds bugs before your users do.",
    description:
      "Our dual-model AI agent never just reads your code. It aggressively hunts for vulnerabilities, performance bottlenecks, and logical errors. It then writes the fix directly into your editor, explaining exactly why.",
    bullets: [
      "Inline edits executed directly on your codebase",
      "Explainable AI justifications for every line changed",
      "Seamlessly integrated inside the browser IDE",
    ],
    mockup: <InlineEditMockup />,
    bg: "bg-[#0a0a0f]",
    accent: "text-[#00C853]",
    badgeCls: "bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.3)] shadow-[0_0_10px_rgba(0,200,83,0.2)]",
    reverse: false,
  },
  {
    id: "security",
    badge: "Enterprise Security",
    title: "Security War-Room — OWASP auditing out of the box.",
    description:
      "Engineers don't always have time to run SAST tools. CodeRefine runs enterprise-grade security checks in the background, identifying SQL injections, XSS, and hardcoded secrets live as you type.",
    bullets: [
      "Continuous OWASP Top-10 monitoring",
      "Executive security scoring and reports",
      "Exportable PDF reports for compliance",
    ],
    mockup: <SecurityDashboardMockup />,
    bg: "bg-[#000000]",
    accent: "text-[#00E5FF]",
    badgeCls: "bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border-[rgba(0,229,255,0.3)] shadow-[0_0_10px_rgba(0,229,255,0.2)]",
    reverse: true,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)] text-[var(--text-primary)] font-sans overflow-x-hidden overflow-y-auto">
      <Navbar />

      <main className="pt-28 pb-20">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="px-4 max-w-4xl mx-auto flex flex-col items-center text-center pt-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(0,200,83,0.15)_0%,transparent_70%)] pointer-events-none -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex flex-col items-center w-full relative z-10"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(0,200,83,0.05)] border border-[rgba(0,200,83,0.2)] text-[#F0FFF4] text-xs font-bold mb-8 shadow-[0_0_15px_rgba(0,200,83,0.1)]">
              <Sparkle size={14} weight="fill" className="text-[#00C853]" />
              CodeRefine 1.0 is live
            </div>

            <div className="relative mb-6">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 gradient-sphere opacity-50 blur-[40px] -z-10" />
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[1.05] text-[#F0FFF4] drop-shadow-2xl">
                The AI Review Platform{" "}
                <br className="hidden md:block" />
                <span className="text-gradient-green relative">
                  Your Codebase
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#00C853]/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" /></svg>
                </span>{" "}
                Deserves.
              </h1>
            </div>

            <p className="text-[17px] text-[#86a898] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Stop copying and pasting into ChatGPT. CodeRefine lives inside your editor, autonomously finding bugs, fixing vulnerabilities, and writing O(1) optimizations inline.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link href="/app" className="w-full sm:w-auto">
                <button className="w-full h-12 px-8 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00C853] to-[#00E5FF] text-[#000000] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2">
                  Test the Sandbox <ArrowRight size={16} weight="bold" />
                </button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <button className="w-full h-12 px-8 rounded-xl text-sm font-bold bg-transparent text-[#F0FFF4] border border-[rgba(0,200,83,0.3)] hover:bg-[rgba(0,200,83,0.05)] hover:border-[#00C853] transition-all flex items-center justify-center">
                  View Engine
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
        <div className="mt-28 border-y border-[rgba(0,229,255,0.15)] py-6 bg-[rgba(5,5,5,0.5)] relative overflow-hidden">
          <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-[#000000] to-transparent z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#000000] to-transparent z-10" />
          <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap justify-center gap-x-12 gap-y-6 text-xs font-bold text-[#86a898] relative z-0">
            {[
              { icon: <Code size={18} />, text: "12+ Languages", val: "12+" },
              { icon: <BugBeetle size={18} />, text: "Lines Analyzed", val: "10M+" },
              { icon: <ShieldCheck size={18} />, text: "SOC2 Ready", val: "100%" },
              { icon: <Users size={18} />, text: "Built for Teams", val: "24/7" },
            ].map(({ icon, text, val }) => (
              <div key={text} className="flex items-center gap-3 filter grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all cursor-default group">
                <div className="flex items-center gap-1 text-[#00E5FF] group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
                  {icon}
                  <span className="font-mono text-sm">{val}</span>
                </div>
                <span className="uppercase tracking-widest text-[10px]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK FEATURE OVERVIEW ─────────────────────────────────────────── */}
        <section id="features" className="mt-32 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00E5FF] opacity-[0.03] blur-[50px] rounded-full -z-10" />
            <p className="text-xs font-bold text-[#00E5FF] uppercase tracking-widest mb-4 inline-flex items-center gap-2">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-[#00E5FF]" />
              Core Engine
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-[#00E5FF]" />
            </p>
            <h2 className="text-4xl font-display font-bold tracking-tight text-[#F0FFF4]">
              Everything you need to ship faster.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: Robot,
                color: "text-[#39FF7F]",
                bg: "bg-[rgba(57,255,127,0.1)]",
                num: "01",
                title: "Inline Editing",
                desc: "No more context switching. The agent writes code directly into your active file."
              },
              {
                Icon: ShieldCheck,
                color: "text-[#00C853]",
                bg: "bg-[rgba(0,200,83,0.1)]",
                num: "02",
                title: "OWASP Sec-Scans",
                desc: "Enterprise-grade vulnerability detection built into the core AI analysis pipeline."
              },
              {
                Icon: ChartBar,
                color: "text-[#005C2E]",
                bg: "bg-[rgba(0,92,46,0.2)]",
                num: "03",
                title: "Algorithmic Audits",
                desc: "The agent autonomously detects complex nested loops and rewrites them for O(1) time complexity."
              },
            ].map(({ Icon, color, bg, num, title, desc }) => (
              <div key={title} className="glass-card p-8 rounded-2xl group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,200,83,0.1)] transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[rgba(0,200,83,0.1)] to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#005C2E] via-[#00C853] to-[#39FF7F] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />

                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center border border-[rgba(0,200,83,0.2)]`}>
                    <Icon size={24} weight="duotone" className={`${color}`} />
                  </div>
                  <span className="font-display font-bold text-2xl text-[rgba(255,255,255,0.05)]">{num}</span>
                </div>

                <h3 className="text-xl font-display font-bold text-[#F0FFF4] mb-3 group-hover:text-[#39FF7F] transition-colors">{title}</h3>
                <p className="text-sm font-medium text-[#86a898] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURE DEEP-DIVE (alternating) ──────────────────────────────── */}
        <section className="mt-32 max-w-6xl mx-auto px-4 space-y-32">
          {features.map((f, idx) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${f.reverse ? "lg:flex-row-reverse" : ""}`}
            >
              {/* Text side */}
              <div className={f.reverse ? "lg:order-2" : ""}>
                <span className={`inline-block text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded border ${f.badgeCls} mb-6`}>
                  {f.badge}
                </span>
                <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#F0FFF4] leading-snug mb-5">
                  {f.title}
                </h3>
                <p className="text-base text-[var(--text-secondary)] font-medium leading-relaxed mb-8">
                  {f.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {f.bullets.map(b => (
                    <li key={b} className="flex items-start gap-3 text-sm font-medium text-[var(--text-primary)]">
                      <CheckCircle size={18} weight="fill" className="text-[var(--brand)] mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link href="/app" className={`inline-flex items-center gap-1.5 text-sm font-bold ${f.accent} hover:underline underline-offset-4`}>
                  Try it out in the editor <ArrowUpRight size={14} weight="bold" />
                </Link>
              </div>

              {/* Mockup side */}
              <div className={`${f.reverse ? "lg:order-1" : ""} relative`}>
                <div className="absolute -inset-4 bg-gradient-to-br from-[var(--surface-raised)] to-[var(--background)] rounded-2xl -z-10" />
                {f.mockup}
              </div>
            </motion.div>
          ))}
        </section>

        {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
        <section className="mt-40 mb-20 px-4 max-w-5xl mx-auto">
          <div className="rounded-[2.5rem] py-20 px-8 md:px-16 text-center shadow-[0_20px_60px_rgba(0,200,83,0.15)] border border-[rgba(0,200,83,0.2)] relative overflow-hidden bg-[#0a0a0f]">
            {/* Mesh gradient backgrounds */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C853] mix-blend-screen filter blur-[100px] opacity-20 translate-x-1/3 -translate-y-1/3 pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#39FF7F] mix-blend-screen filter blur-[120px] opacity-10 -translate-x-1/3 translate-y-1/3 pointer-events-none rounded-full" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20" />

            <h2 className="text-4xl md:text-5xl font-display font-black text-[#F0FFF4] tracking-tight mb-6 relative z-10 leading-tight">
              Ready to code with <br className="hidden md:block" />
              <span className="text-gradient-green">zero technical debt?</span>
            </h2>
            <p className="text-lg font-medium text-[#86a898] mb-12 max-w-2xl mx-auto leading-relaxed relative z-10">
              Join leading tech teams standardizing their codebase security and performance with CodeRefine AI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/app" className="w-full sm:w-auto">
                <button className="w-full h-14 px-10 rounded-2xl text-base font-bold bg-gradient-to-r from-[#00C853] to-[#00E5FF] text-[#000000] hover:brightness-110 shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-2">
                  Test the Sandbox <ArrowRight size={18} weight="bold" />
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#000000] border-t border-[rgba(0,229,255,0.15)] py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-xl font-display font-bold tracking-tight text-[#F0FFF4]">
              CodeRefine<span className="text-[#00E5FF]">.</span>
            </span>
            <span className="text-xs font-medium text-[#4d6b5a] border-l border-[rgba(0,200,83,0.2)] pl-4">
              Built during a 48-Hour Hackathon
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
          <p>© {new Date().getFullYear()} CodeRefine. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-[#86a898] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#86a898] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
