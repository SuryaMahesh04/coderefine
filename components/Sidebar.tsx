"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface SidebarProps {
  explorerOpen?: boolean;
  onToggleExplorer?: () => void;
}

export default function Sidebar({ explorerOpen = false, onToggleExplorer }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = theme === "dark";

    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    document.documentElement.style.setProperty("--transition-x", `${x}px`);
    document.documentElement.style.setProperty("--transition-y", `${y}px`);
    document.documentElement.style.setProperty("--transition-radius", `${endRadius}px`);

    document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });
  };

  const navItems = [
    {
      name: "Explorer",
      path: "#explorer",
      onClick: onToggleExplorer,
      isActive: explorerOpen,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
      )
    },
    {
      name: "Editor",
      path: "/app",
      isActive: pathname === "/app" && !explorerOpen,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      )
    },
    {
      name: "History",
      path: "/history",
      isActive: pathname === "/history",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )
    },
    {
      name: "Report",
      path: "/report",
      isActive: pathname === "/report",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      )
    },
  ];

  return (
    <div className="w-14 flex-shrink-0 bg-[#0e0e10] border-r border-white/[0.06] h-screen flex flex-col relative z-20 items-center py-3">
      {/* Brand Icon (Top) */}
      <Link href="/" className="mb-6 group relative w-10 h-10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
          <div className="w-full h-full bg-black/40 rounded-lg relative backdrop-blur-sm flex items-center justify-center">
            <span className="text-[10px] font-black tracking-tighter text-white">CR</span>
          </div>
        </div>
      </Link>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-2 w-full items-center">
        {navItems.map((item) => {
          const content = (
            <div className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group ${item.isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              {item.isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
              )}
              {item.icon}

              {/* Tooltip */}
              <div className="absolute left-14 bg-[#1a1a1e] text-white text-xs font-medium px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            </div>
          );

          if (item.onClick) {
            return (
              <button key={item.name} onClick={item.onClick} className="focus:outline-none">
                {content}
              </button>
            );
          }

          return (
            <Link key={item.path} href={item.path}>
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Settings Gear & Theme Toggle (Bottom) */}
      <div className="mt-auto w-full flex flex-col items-center gap-2 pb-2">
        {mounted && (
          <button
            onClick={handleThemeToggle}
            className="relative flex items-center justify-center w-12 h-12 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors group outline-none"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={24} weight="duotone" /> : <Moon size={24} weight="duotone" />}
            {/* Tooltip */}
            <div className="absolute left-14 bg-[#1a1a1e] text-white text-xs font-medium px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Toggle Theme
            </div>
          </button>
        )}

        <button className="relative flex items-center justify-center w-12 h-12 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors group">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {/* Tooltip */}
          <div className="absolute left-14 bg-[#1a1a1e] text-white text-xs font-medium px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            Settings
          </div>
        </button>
      </div>
    </div>
  );
}
