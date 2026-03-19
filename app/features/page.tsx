"use client";

import { Navbar } from "@/components/Navbar";
import { GridScan } from "@/components/GridScan";
import { 
  Robot, ShieldCheck, ChartBar, Code, MagnifyingGlass, Cpu, 
  Lightning, AppWindow, FileZip, ClockCounterClockwise, CreditCard, 
  FileText, Users, ArrowsMerge, Terminal, Fingerprint, 
  Eye, CheckCircle, ArrowRight, Sparkle, BracketsCurly, 
  GitDiff, Monitor, ShieldSlash, Database, Pulse, FlowArrow
} from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const HeroSection = () => {
    return (
        <section className="relative pt-40 pb-32 overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <GridScan 
                    gridScale={0.1}
                    lineThickness={0.8}
                    linesColor="rgba(0, 229, 255, 0.1)"
                    scanColor="#00E5FF"
                    scanOpacity={0.15}
                    bloomIntensity={0.6}
                />
            </div>
            <div className="max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.2em] mb-8 text-[#00E5FF]">
                        <Sparkle weight="fill" /> ALL-IN-ONE AGENTIC PLATFORM
                    </div>
                    <h1 className="text-7xl md:text-[120px] font-display font-black tracking-tighter leading-[0.85] mb-8">
                        The Future <br /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00C853] to-[#39FF7F]">is Autonomous.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-[#86a898] max-w-3xl mx-auto font-medium leading-relaxed mb-12 opacity-80">
                        Stop fighting your codebase. Deploy an agent that reasons, refactors, and secures your code in real-time.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link href="/app">
                            <button className="h-16 px-12 rounded-2xl bg-white text-black text-sm font-black hover:scale-105 transition-all shadow-[0_40px_80px_rgba(255,255,255,0.2)] flex items-center gap-2">
                                Start Building Now <ArrowRight weight="bold" />
                            </button>
                        </Link>
                        <button className="h-16 px-12 rounded-2xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all">
                            View API Documentation
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const BentoCard = ({ title, desc, icon, colSpan = "col-span-1", rowSpan = "row-span-1", glow = "#00E5FF" }: any) => {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={`${colSpan} ${rowSpan} relative p-8 rounded-[40px] border border-white/5 bg-zinc-950/40 backdrop-blur-3xl overflow-hidden group transition-all duration-500 hover:border-white/10`}
        >
            <div 
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" 
            />
            <div className="absolute -right-4 -top-4 w-32 h-32 blur-[60px] rounded-full opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: glow }} />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    {icon}
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-500 transition-all">
                    {title}
                </h3>
                <p className="text-[#86a898] text-sm font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {desc}
                </p>
                <div className="mt-auto pt-8 flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 group-hover:text-white transition-colors uppercase">
                    Learn More <ArrowRight size={10} weight="bold" />
                </div>
            </div>
        </motion.div>
    );
};

const BentoGrid = () => {
    return (
        <section className="py-24 max-w-7xl mx-auto px-6">
             <div className="flex items-center gap-4 mb-16 px-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase italic text-center">The Capabilities</h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[800px]">
                <BentoCard 
                    colSpan="md:col-span-2"
                    rowSpan="md:row-span-2"
                    glow="#00E5FF"
                    icon={<Robot size={32} weight="duotone" className="text-[#00E5FF]" />}
                    title="Autonomous Reasoning Core"
                    desc="Our agent doesn't just predict text. It reasons over Abstract Syntax Trees (ASTs), validates logic in local sandboxes, and self-corrects its own proposals before you ever see them."
                />
                <BentoCard 
                    glow="#00C853"
                    icon={<ShieldCheck size={32} weight="duotone" className="text-[#00C853]" />}
                    title="Live Security Auditor"
                    desc="Built-in OWASP Top 10 detection that scans every edit for SQLi, XSS, and broken access controls."
                />
                <BentoCard 
                    glow="orange"
                    icon={<ChartBar size={32} weight="duotone" className="text-orange-400" />}
                    title="Performance Profiler"
                    desc="Automatically identifies O(N²) complexity and memory leaks in your logic path."
                />
                <BentoCard 
                    colSpan="md:col-span-2"
                    glow="#39FF7F"
                    icon={<Terminal size={32} weight="duotone" className="text-[#39FF7F]" />}
                    title="Deterministic Execution"
                    desc="Deploy your code to an isolated container instantly. Monitor logs, trace execution paths, and verify behavior with high-fidelity terminal outputs."
                />
                <BentoCard 
                    glow="white"
                    icon={<BracketsCurly size={32} weight="duotone" />}
                    title="Multi-File Context"
                    desc="Understand relationships across large-scale repositories with deep symbol indexing."
                />
                <BentoCard 
                    glow="#00E5FF"
                    icon={<GitDiff size={32} weight="duotone" className="text-[#00E5FF]" />}
                    title="Smart Diff Engine"
                    desc="Review agent-led changes with a surgical side-by-side diff view. Accept or revert with one click."
                />
            </div>
        </section>
    );
};

const ShowcaseSection = () => {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

    return (
        <section ref={sectionRef} className="py-40 relative max-w-7xl mx-auto px-6 overflow-hidden">
            <motion.div style={{ scale, opacity }} className="relative bg-zinc-950 border border-white/5 rounded-[60px] p-12 md:p-24 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 via-transparent to-[#00C853]/5 opacity-50" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgc3Ryb2tlLXdpZHRoPSIxIj48cGF0aCBkPSJNMzIgMEwwIDMyIi8+PC9zdmc+')] opacity-20" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 space-y-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-[10px] font-black tracking-widest uppercase">
                            <Pulse weight="bold" /> Real-time Ingestion
                        </div>
                        <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white leading-none">
                            Experience <br /> 
                            <span className="text-zinc-700">Zero Technical Debt.</span>
                        </h2>
                        <p className="text-xl text-[#86a898] font-medium leading-relaxed opacity-80">
                            Our agent actively maintains your project health while you sleep. Automatically refactoring legacy patterns, updating dependencies, and finding hidden bugs before they reach production.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div className="space-y-2">
                                <div className="text-4xl font-display font-black text-[#00E5FF]">380ms</div>
                                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Average Reasoning Latency</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl font-display font-black text-[#00C853]">99.9%</div>
                                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Refactoring Accuracy</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative group w-full lg:w-auto">
                        <div className="absolute inset-0 bg-[#00E5FF]/20 blur-[120px] rounded-full opacity-50 animate-pulse" />
                        <div className="relative aspect-square md:aspect-video rounded-[32px] border border-white/10 bg-black p-4 shadow-2xl overflow-hidden group">
                            {/* IDE Mockup Preview */}
                            <div className="h-full w-full bg-[#0d1117] rounded-2xl flex flex-col border border-white/5 relative overflow-hidden">
                                <div className="h-8 border-b border-white/5 flex items-center px-4 gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                                    <div className="ml-4 h-5 px-3 rounded bg-white/5 text-[9px] font-mono text-zinc-500 flex items-center gap-2">
                                        <Code size={10} /> main_agent.ts
                                    </div>
                                </div>
                                <div className="flex-1 p-6 font-mono text-[10px] md:text-xs leading-relaxed overflow-hidden">
                                    <div className="text-zinc-600 line-through">const calculateRisk = (data) =&#62; &#123;</div>
                                    <div className="text-zinc-600 line-through">  return data.map(i =&#62; i.val * Math.random());</div>
                                    <div className="text-zinc-600 line-through">&#125;;</div>
                                    <div className="mt-4 text-[#00E5FF]">+ const calculateRisk = (data: RiskParams): number =&#62; &#123;</div>
                                    <div className="text-[#00C853]">+   return data.entries.reduce((acc, i) =&#62; acc + i.normalizedVal, 0);</div>
                                    <div className="text-[#39FF7F]">+ &#125;;</div>
                                    <motion.div 
                                        initial={{ width: "0%" }}
                                        whileInView={{ width: "30%" }}
                                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                                        className="mt-6 h-px bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" 
                                    />
                                    <div className="mt-2 text-[9px] text-[#00E5FF] font-bold px-2 py-1 rounded bg-[#00E5FF]/10 inline-block uppercase tracking-widest">
                                        Agent Reasoned: Replaced unstable Math.random() with deterministic normalization map.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

const CTASection = () => {
    return (
        <section className="py-60 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00E5FF]/10 blur-[200px] -z-10 rounded-full animate-pulse" />
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-6xl md:text-9xl font-display font-black tracking-tighter mb-12">
                    Build. <br /> 
                    <span className="text-zinc-800">Unrestrained.</span>
                </h2>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link href="/app">
                        <button className="h-20 px-16 rounded-[24px] bg-white text-black text-lg font-black hover:scale-105 transition-all shadow-[0_40px_80px_rgba(255,255,255,0.3)]">
                            Launch the Platform
                        </button>
                    </Link>
                </div>
                <div className="mt-12 flex justify-center gap-12 text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
                    <span>SOC2 Compliant</span>
                    <span>Air-Gapped Access</span>
                    <span>Self-Correction V4</span>
                </div>
            </div>
        </section>
    );
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F0FFF4] font-sans selection:bg-[#00E5FF] selection:text-black">
        <Navbar />
        <main>
            <HeroSection />
            <BentoGrid />
            <ShowcaseSection />
            
            {/* Horizontal Icon Scroll */}
            <div className="py-20 border-y border-white/5 bg-zinc-950/20 backdrop-blur-xl">
                 <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <Monitor size={48} weight="thin" />
                    <Database size={48} weight="thin" />
                    <Fingerprint size={48} weight="thin" />
                    <ShieldSlash size={48} weight="thin" />
                    <ShareNetwork size={48} weight="thin" />
                    <Selection size={48} weight="thin" />
                    <FlowArrow size={48} weight="thin" />
                 </div>
            </div>

            <CTASection />
        </main>

        <footer className="py-20 border-t border-white/5 text-center">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
                    ENGINEERED FOR THE AUTONOMOUS AGE // LOOM AI V4
                </div>
                <div className="flex gap-8 text-xs font-bold text-zinc-800">
                    <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/ai-engine" className="hover:text-white transition-colors">AI Engine</Link>
                    <Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link>
                    <Link href="/security" className="hover:text-white transition-colors">Security</Link>
                </div>
            </div>
        </footer>
    </div>
  );
}

function Selection(props: any) { return <ArrowsMerge {...props} /> }
function ShareNetwork(props: any) { return <Lightning {...props} /> }
