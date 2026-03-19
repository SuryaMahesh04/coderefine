"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FolderGit2, Clock, Settings, CreditCard, LogOut, 
  ChevronRight, User as UserIcon, Code2, Home, BarChart3
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

import LoomLogo from "./LoomLogo";

export function DashboardShell({ children, title, subtitle, actions }: DashboardShellProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", icon: <Home className="w-4 h-4" />, label: "Overview" },
    { href: "/history", icon: <Clock className="w-4 h-4" />, label: "Scan History" },
    { href: "/app", icon: <Code2 className="w-4 h-4" />, label: "Sandbox IDE" },
    { href: "/pricing", icon: <CreditCard className="w-4 h-4" />, label: "Plan & Billing" },
  ];

  const userPlan = (session?.user as any)?.plan || "free";
  const planLabel = userPlan.charAt(0).toUpperCase() + userPlan.slice(1);

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-[#00E5FF] selection:text-black">
      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <LoomLogo size={36} showText={true} />
          </Link>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-1">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] pl-3 mb-4">Main Menu</div>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold group ${
                  isActive 
                    ? "bg-[#00E5FF]/10 text-white border border-[#00E5FF]/20" 
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`transition-colors ${isActive ? "text-[#00E5FF]" : "group-hover:text-[#00E5FF]"}`}>
                  {link.icon}
                </span>
                {link.label}
                {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />}
              </Link>
            );
          })}

          <div className="pt-8 mb-4 flex flex-col gap-3">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] pl-3">Account</div>
            <div className="mx-2 p-3 bg-zinc-900/50 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full ring-2 ring-[#00E5FF]/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                      <UserIcon className="w-4 h-4 text-zinc-500" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{session?.user?.name || "Developer"}</span>
                    <span className="text-[10px] text-zinc-500 truncate">{session?.user?.email}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                   <span className="text-zinc-500 uppercase tracking-tighter">Plan</span>
                   <span className="px-1.5 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 uppercase">{planLabel}</span>
                </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:bg-white/5 hover:text-white rounded-xl transition-colors text-sm font-semibold">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 cursor-pointer rounded-xl transition-all text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-black/80 backdrop-blur-xl z-10">
          <div className="flex flex-col">
            {title && <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              {title}
            </h1>}
            {subtitle && <p className="text-xs text-zinc-500 font-medium">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            {actions}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black relative">
          {/* Subtle Background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
