"use client";

import { Navbar } from "@/components/Navbar";
import { ShieldCheck, Lock, Globe, Users, Headphones, FileArchive, Handshake, BookmarkSimple } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Link from "next/link";
import LoomLogo from "@/components/LoomLogo";

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#00E5FF] selection:text-black">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero / Header */}
          <div className="text-center mb-32 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#00E5FF]/5 blur-[120px] -z-10" />
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter mb-8 leading-tight">
                Enterprise-Grade <br /> 
                <span className="text-[#00C853]">Security.</span>
              </h1>
              <p className="text-[#86a898] text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                 Scale Loom AI across your entire organization with dedicated hardware, air-gapped security, and SOC2 compliance.
              </p>
            </motion.div>
          </div>

          {/* Key Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-40">
            <section className="p-10 rounded-[40px] border border-white/5 bg-zinc-950/40 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-32 h-32 bg-[#00C853]/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
               <ShieldCheck size={48} weight="duotone" className="text-[#00C853] mb-8" />
               <h2 className="text-3xl font-display font-bold mb-4">Uncompromising Compliance</h2>
               <p className="text-[#86a898] text-lg font-medium leading-relaxed mb-8">
                  We understand the stakes for global enterprise. Loom AI is built with SOC2 Type II, GDPR, and HIPAA compliance in its DNA.
               </p>
               <ul className="space-y-4">
                  {[
                    "Isolated VPC Deployments",
                    "Single Sign-On (OIDC, SAML)",
                    "Audit Logs & Access History",
                    "RBAC Team Management"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                      {item}
                    </li>
                  ))}
               </ul>
            </section>

            <section className="p-10 rounded-[40px] border border-white/5 bg-zinc-950/40 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-32 h-32 bg-[#00E5FF]/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
               <Lock size={48} weight="duotone" className="text-[#00E5FF] mb-8" />
               <h2 className="text-3xl font-display font-bold mb-4">Privacy-First AI</h2>
               <p className="text-[#86a898] text-lg font-medium leading-relaxed mb-8">
                   Your code never leaves your perimeter. With Loom Enterprise, you can deploy your own private model instances.
               </p>
               <ul className="space-y-4">
                  {[
                    "No Data Retraining",
                    "Custom Encryption Keys (BYOK)",
                    "Data Residency Options",
                    "On-Premise Hybrid Support"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                      {item}
                    </li>
                  ))}
               </ul>
            </section>
          </div>

          {/* Support / Service section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
             {[
               { icon: <Headphones />, title: "White-Glove Support", desc: "Dedicated Solutions Engineers available 24/7/365 via Slack and video." },
               { icon: <Handshake />, title: "Uptime SLA", desc: "99.99% uptime guarantee backed by financial credits for enterprise clients." },
               { icon: <Globe />, title: "Global Scale", desc: "Infrastructure deployed across multiple regions for minimum latency." }
             ].map((item, i) => (
                <div key={i} className="text-center p-8">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-[#86a898]">
                      {item.icon}
                   </div>
                   <h3 className="text-xl font-display font-bold mb-3">{item.title}</h3>
                   <p className="text-sm text-[#4d6b5a] font-bold leading-relaxed">{item.desc}</p>
                </div>
             ))}
          </div>

          {/* Trust Banner */}
          <section className="bg-zinc-950 border border-white/5 rounded-[40px] p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMiIgc3Ryb2tlLXdpZHRoPSIxIj48cGF0aCBkPSJNMzIgMEwwIDMyIi8+PC9zdmc+')] -z-10" />
             <div className="flex-1 space-y-8">
                <h2 className="text-4xl md:text-5xl font-display font-black leading-tight">
                  Ready to secure <br /> your organization?
                </h2>
                <p className="text-[#86a898] font-medium text-lg">
                   Join the world's most innovative engineering teams. Schedule a technical deep-dive with our solutions architects today.
                </p>
                <div className="flex gap-4">
                   <button className="h-14 px-10 rounded-2xl bg-white text-black text-sm font-black hover:scale-105 transition-all">
                      Schedule Demo
                   </button>
                   <button className="h-14 px-10 rounded-2xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all">
                      View Compliance Docs
                   </button>
                </div>
             </div>
             <div className="flex-none w-64 h-64 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[#00E5FF]/20 blur-[60px] rounded-full animate-pulse" />
                <LoomLogo size={120} className="relative z-10" />
             </div>
          </section>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
           <LoomLogo size={42} showText={true} />
           <div className="flex gap-8 text-xs font-black text-zinc-600 uppercase tracking-widest">
              <span>Security</span>
              <span>Privacy</span>
              <span>Uptime</span>
              <span>Compliance</span>
           </div>
           <p className="text-zinc-600 text-xs font-medium">© 2026 Loom AI Enterprise Inc.</p>
        </div>
      </footer>
    </div>
  );
}
