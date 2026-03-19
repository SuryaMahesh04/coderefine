"use client";

import { Navbar } from "@/components/Navbar";
import { GridScan } from "@/components/GridScan";
import { 
  Cpu, Lightning, ShieldCheck, Database, MagnifyingGlass, 
  FlowArrow, ShareNetwork, TreeStructure, Brain, Eye, 
  Wrench, Pulse, CheckCircle, Code, ArrowRight
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

const layers = [
  {
    id: "layer-1",
    title: "Layer 01: Perception & Context",
    icon: <Eye size={24} weight="duotone" className="text-[#00E5FF]" />,
    desc: "The agent begins by ingesting the entire workspace context. It doesn't just read text; it builds a live map of your project's architecture, dependencies, and type definitions.",
    tags: ["AST Parsing", "LSP Integration", "Dependency Mapping"]
  },
  {
    id: "layer-2",
    title: "Layer 02: Cognitive Reasoning",
    icon: <Brain size={24} weight="duotone" className="text-[#00C853]" />,
    desc: "A dual-model swarm executes in parallel. Gemini 2.0 Flash generates rapid speculative drafts, while Gemini 1.5 Pro performs deep structural validation of the proposed logic.",
    tags: ["Dual-Model Swarm", "Formal Verification", "Chain-of-Thought"]
  },
  {
    id: "layer-3",
    title: "Layer 03: Autonomous Auditing",
    icon: <ShieldCheck size={24} weight="duotone" className="text-[#39FF7F]" />,
    desc: "Before any code is proposed, it must pass a rigorous audit. Our security engine checks for OWASP vulnerabilities and performance bottlenecks (O(N²) detection) in real-time.",
    tags: ["OWASP Scanning", "Big O Analysis", "Static Security"]
  },
  {
    id: "layer-4",
    title: "Layer 04: Execution & Feedback",
    icon: <Wrench size={24} weight="duotone" className="text-[#FFFFFF]" />,
    desc: "The agent executes the code in an isolated sandbox. It monitors compiler output and runtime errors, self-correcting its own proposals until the solution is perfect.",
    tags: ["Sandbox Execution", "Self-Correction Loop", "CI/CD Integration"]
  }
];

const lifecycleSteps = [
  { title: "Trigger", desc: "User request or autonomous background scan detected." },
  { title: "Context", desc: "Retrieving relevant file fragments and type definitions." },
  { title: "Reasoning", desc: "Multi-agent swarm brainstorming the optimal solution." },
  { title: "Audit", desc: "Formal security and performance verification passes." },
  { title: "Propose", desc: "Deterministic diff generation and human-in-the-loop review." }
];

export default function AIEnginePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F0FFF4] font-sans selection:bg-[#00E5FF] selection:text-black">
      <Navbar />

      <main className="pt-32 pb-24 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
          <GridScan
            gridScale={0.15}
            lineThickness={1.2}
            linesColor="#00E5FF"
            scanColor="#00C853"
            scanOpacity={0.25}
            bloomIntensity={0.8}
            enablePost={true}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-40"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-black tracking-[0.3em] mb-8 shadow-2xl">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_15px_#00E5FF] animate-pulse" />
              SYSTEM ARCHITECTURE OVERVIEW
            </div>
            <h1 className="text-6xl md:text-[110px] font-display font-black tracking-tighter mb-8 leading-[0.8]">
              The Anatomy <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00C853] to-[#39FF7F]">of an Autonomous Agent.</span>
            </h1>
            <p className="text-[#86a898] text-2xl max-w-3xl mx-auto font-medium leading-relaxed opacity-80">
               Loom AI is not a chatbot. It is a multi-layered reasoning system designed to replace manual code review with deterministic intelligence.
            </p>
          </motion.div>

          {/* Layered Architecture Section */}
          <section className="mb-60">
            <div className="flex items-center gap-4 mb-16 border-b border-white/10 pb-6">
               <TreeStructure size={32} className="text-[#00E5FF]" />
               <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic">The Reasoning Core</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {layers.map((layer, i) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="p-10 rounded-[40px] border border-white/5 bg-zinc-950/40 backdrop-blur-3xl group hover:border-[#00E5FF]/30 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                  
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
                    {layer.icon}
                  </div>

                  <h3 className="text-2xl font-display font-bold mb-4 text-white uppercase tracking-tight">{layer.title}</h3>
                  <p className="text-[#86a898] text-base font-medium leading-relaxed mb-8">
                    {layer.desc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {layer.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-500 uppercase tracking-widest transition-colors group-hover:text-[#00E5FF] group-hover:border-[#00E5FF]/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Lifecycle Visualization */}
          <section className="mb-60 py-24 px-10 rounded-[50px] bg-gradient-to-b from-zinc-950 to-black border border-white/5 relative overflow-hidden text-center">
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgc3Ryb2tlLXdpZHRoPSIxIj48cGF0aCBkPSJNMCAzMkwzMiAwTTMyIDMyTDAgMCIvPjwvc3ZnPg==')] opacity-20" />
             
             <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-4 text-white uppercase italic">Life of an Autonomous Edit</h2>
             <p className="text-[#86a898] mb-20 font-medium uppercase tracking-[0.2em] text-xs">A deterministic cycle from ingestion to deployment</p>

             <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 max-w-5xl mx-auto">
               {lifecycleSteps.map((step, i) => (
                 <div key={i} className="flex flex-col items-center flex-1 relative group">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-display font-bold text-lg mb-6 shadow-2xl relative z-10 group-hover:border-[#00E5FF] group-hover:text-[#00E5FF] transition-all">
                      {i + 1}
                    </div>
                    {i < lifecycleSteps.length - 1 && (
                      <div className="hidden md:block absolute top-[23px] left-[60%] w-[80%] h-px bg-gradient-to-r from-white/10 via-white/20 to-transparent -z-0" />
                    )}
                    <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-widest">{step.title}</h4>
                    <p className="text-[11px] text-[#4d6b5a] font-bold leading-relaxed px-4">{step.desc}</p>
                 </div>
               ))}
             </div>
          </section>

          {/* Tech Spec section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
            <div className="order-2 lg:order-1">
               <h2 className="text-4xl font-display font-black mb-8 text-white tracking-tighter uppercase italic">Built for Reliability.</h2>
               <div className="space-y-6">
                  {[
                    { title: "Verifiable Proposals", desc: "Every line of code changed by the agent is backed by a formal reasoning trace you can inspect." },
                    { title: "Zero Latency Indexing", desc: "Our background indexing engine keeps your workspace context hot for instant triggering." },
                    { title: "Privacy-Locked", desc: "We use enterprise-grade isolation. Your intellectual property never leaves our secure perimeter." }
                  ].map(spec => (
                    <div key={spec.title} className="p-6 rounded-3xl border border-white/5 bg-zinc-950/20">
                       <h4 className="text-[#00E5FF] font-black uppercase text-xs tracking-widest mb-2">{spec.title}</h4>
                       <p className="text-[#86a898] text-sm font-medium">{spec.desc}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="order-1 lg:order-2">
               <div className="relative aspect-video rounded-[32px] border border-white/10 bg-black overflow-hidden shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/20 to-[#00C853]/10 opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="w-full h-full flex items-center justify-center relative">
                     <Pulse size={100} weight="thin" className="text-white transform rotate-45 group-hover:scale-110 transition-transform duration-700" />
                     <div className="absolute top-6 left-6 flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-white tracking-tighter uppercase font-black">CORE_DAEMON_RUNNING</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <section className="text-center py-40 border-t border-white/5 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF]/5 blur-[150px] -z-10" />
            <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter mb-12">
              The Codebase is <br /> <span className="text-[#111]">the new computer.</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <button className="h-16 px-12 rounded-3xl bg-white text-black text-sm font-black hover:scale-105 transition-all shadow-[0_40px_80px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3">
                 <Cpu size={20} /> Deploy AI Engineer
               </button>
               <button className="h-16 px-12 rounded-3xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                  Read Technical Docs <ArrowRight size={20} />
               </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
