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
    <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-[#30363d] shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#e3b341]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
        <span className="ml-3 text-xs font-mono text-[#8b949e]">auth_controller.ts — CodeRefine</span>
      </div>
      <div className="grid grid-cols-5 h-[280px]">
        {/* Code panel */}
        <div className="col-span-3 p-5 border-r border-[#30363d] font-mono text-xs leading-relaxed bg-[#0d1117]">
          <div className="text-[#8b949e]">// Process user authentication</div>
          <div className="text-[#ff7b72]">export async function <span className="text-[#d2a8ff]">login</span><span className="text-[#c9d1d9]">(req, res) {'{'}</span></div>
          <div className="ml-4 text-[#c9d1d9]">const userId = req.body.user;</div>

          <div className="mt-2 bg-[rgba(248,81,73,0.1)] border-l-2 border-[#f85149] pl-3 py-1 text-[#c9d1d9] relative group">
            <span className="line-through text-[#8b949e] opacity-70">{"const query = `SELECT * FROM users WHERE id=${userId}`;"}</span>
            {/* Agent Float Tooltip */}
            <div className="absolute left-0 top-[120%] bg-[#161b22] border border-[#f85149]/30 rounded-lg p-2 w-64 shadow-xl z-20">
              <div className="text-[10px] font-bold text-[#f85149] uppercase tracking-wider mb-1">SQL Injection Vulnerability</div>
              <div className="text-[10px] text-[#8b949e] leading-snug">Raw user input interpolated into SQL query. Rewriting with parameterized statement...</div>
            </div>
          </div>

          <div className="mt-1 bg-[rgba(63,185,80,0.1)] border-l-2 border-[#3fb950] pl-3 py-1 text-[#c9d1d9] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(63,185,80,0.1)] to-transparent w-[200%] animate-scan" />
            <span className="text-[#3fb950] font-bold">{"const query = `SELECT * FROM users WHERE id=?`;"}</span>
            <br />
            <span className="text-[#3fb950] font-bold">const user = await db.query(query, [userId]);</span>
          </div>

          <div className="text-[#c9d1d9] mt-2">{'}'}</div>
        </div>
        {/* AI panel */}
        <div className="col-span-2 p-4 flex flex-col gap-3 bg-[#161b22]">
          <div className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
            AI Engineer
          </div>
          <div className="bg-[#0d1117] rounded-lg p-3 text-[11px] text-[#c9d1d9] leading-relaxed border border-[#30363d]">
            "Fixing critical SQL Injection. Using prepared statements to prevent unauthorized data access."
          </div>
          <div className="mt-auto flex justify-end gap-2 text-[10px]">
            <button className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] text-white rounded hover:bg-[#30363d] transition-colors">Reject</button>
            <button className="px-3 py-1.5 bg-[#3fb950]/20 border border-[#3fb950]/40 text-[#3fb950] rounded font-bold hover:bg-[#3fb950] hover:text-[#0d1117] transition-all">Accept Fix</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityDashboardMockup() {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xl overflow-hidden flex flex-col h-[280px]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--surface-raised)]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[var(--brand)] flex items-center justify-center">
            <ShieldCheck size={14} weight="bold" className="text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">Security War-Room</div>
            <div className="text-[10px] text-[var(--text-muted)]">Real-time vulnerability metrics</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium bg-green-500/10 text-green-600 border border-green-500/20 px-2 py-0.5 rounded">System Secure</span>
        </div>
      </div>
      <div className="p-5 grid grid-cols-4 gap-4 bg-[var(--surface)] flex-1 content-start">
        <div className="col-span-4 grid grid-cols-3 gap-3">
          <div className="p-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl flex flex-col">
            <div className="text-2xl font-mono text-green-500 font-bold mb-1 tracking-tighter">A+</div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Code Rating</div>
          </div>
          <div className="p-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl">
            <div className="text-xl font-mono text-[var(--text-primary)] font-bold mb-1">1,204</div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Bugs Fixed</div>
          </div>
          <div className="p-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl">
            <div className="text-xl font-mono text-[var(--brand)] font-bold mb-1">12ms</div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Response</div>
          </div>
        </div>
        <div className="col-span-4 mt-2">
          <div className="text-[10px] text-[var(--text-muted)] mb-2 font-bold uppercase tracking-wider">Recent Enterprise Interventions</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] p-2 bg-[var(--surface-raised)] rounded border border-[var(--border)]">
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>SQL Injection</span>
              <span className="text-green-500 font-mono">Auto-Patched</span>
            </div>
            <div className="flex justify-between items-center text-[10px] p-2 bg-[var(--surface-raised)] rounded border border-[var(--border)]">
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>O(N²) Loop</span>
              <span className="text-blue-500 font-mono">Optimized</span>
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
    bg: "bg-[var(--surface)]",
    accent: "text-[var(--brand)]",
    badgeCls: "bg-[var(--brand-light)] text-[var(--brand)] border-[var(--border-strong)]",
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
    bg: "bg-[var(--surface-muted)]",
    accent: "text-emerald-600",
    badgeCls: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30",
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
        <section className="px-4 max-w-4xl mx-auto flex flex-col items-center text-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[var(--text-secondary)] text-xs font-medium mb-5">
              <Sparkle size={12} weight="fill" className="text-[var(--brand)]" />
              CodeRefine 1.0 is live
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.12] mb-5 text-[var(--text-primary)] drop-shadow-sm">
              The AI Review Platform{" "}
              <span className="text-[var(--brand)]">Your Codebase</span>{" "}
              Deserves.
            </h1>

            <p className="text-[16px] text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
              Stop copying and pasting into ChatGPT. CodeRefine lives inside your editor, autonomously finding bugs, fixing vulnerabilities, and writing O(1) optimizations inline.
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link href="/app">
                <button className="h-10 px-6 rounded-lg text-sm font-bold bg-[var(--text-primary)] text-[var(--surface)] hover:scale-105 transition-all shadow-xl flex items-center gap-1.5">
                  Test the Sandbox <ArrowRight size={14} weight="bold" />
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
        <div className="mt-20 border-y border-[var(--border)] py-5 bg-[var(--surface)]">
          <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap justify-center gap-x-10 gap-y-4 text-xs font-semibold text-[var(--text-secondary)]">
            {[
              { icon: <Code size={16} />, text: "12+ Languages" },
              { icon: <BugBeetle size={16} />, text: "10M+ Lines Analyzed" },
              { icon: <ShieldCheck size={16} />, text: "Enterprise SOC2 Ready" },
              { icon: <Users size={16} />, text: "Built for Teams" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                {icon}
                <span className="uppercase tracking-widest">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK FEATURE OVERVIEW ─────────────────────────────────────────── */}
        <section id="features" className="mt-24 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Core Engine</p>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Everything you need to ship faster.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg">
            {[
              { Icon: Robot, color: "text-[var(--brand)]", title: "Inline Editing", desc: "No more context switching. The agent writes code directly into your active file." },
              { Icon: ShieldCheck, color: "text-green-500", title: "OWASP Sec-Scans", desc: "Enterprise-grade vulnerability detection built into the core AI analysis pipeline." },
              { Icon: ChartBar, color: "text-purple-500", title: "Algorithmic Audits", desc: "The agent autonomously detects complex nested loops and rewrites them for O(1) time complexity." },
            ].map(({ Icon, color, title, desc }) => (
              <div key={title} className="bg-[var(--surface)] p-8 hover:bg-[var(--surface-raised)] transition-colors">
                <Icon size={24} weight="duotone" className={`${color} mb-4`} />
                <div className="text-base font-bold text-[var(--text-primary)] mb-2">{title}</div>
                <div className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">{desc}</div>
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
                <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${f.badgeCls} mb-5`}>
                  {f.badge}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-snug mb-5">
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
        <section className="mt-32 mb-10 px-4 max-w-5xl mx-auto">
          <div className="bg-[var(--surface-raised)] rounded-3xl py-16 px-8 md:px-12 text-center shadow-lg border border-[var(--border)] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--brand)] blur-[150px] opacity-5 pointer-events-none" />
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-5 relative z-10">
              Ready to code with zero technical debt?
            </h2>
            <p className="text-base font-medium text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed relative z-10">
              Join leading tech teams standardizing their codebase security and performance with CodeRefine AI.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/app">
                <button className="h-12 px-8 rounded-xl text-base font-bold bg-[var(--brand)] hover:brightness-110 text-white shadow-xl shadow-[var(--brand-light)] transition-all">
                  Test the Sandbox
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              CodeRefine<span className="text-[var(--brand)]">.</span>
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)] border-l border-[var(--border-strong)] pl-4">
              Built during a 48-Hour Hackathon
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-[var(--text-secondary)]">
            <Link href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</Link>
            <Link href="/app" className="hover:text-[var(--text-primary)] transition-colors">Sandbox</Link>
            <Link href="/history" className="hover:text-[var(--text-primary)] transition-colors">History Log</Link>
            <Link href="/report" className="hover:text-[var(--text-primary)] transition-colors">Enterprise Report</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} CodeRefine. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
