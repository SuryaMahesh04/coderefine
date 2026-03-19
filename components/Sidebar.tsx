"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { FolderTree, Code2, History, BarChart2, Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface SidebarProps {
  explorerOpen?: boolean;
  onToggleExplorer?: () => void;
}

import LoomLogo from "./LoomLogo";

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
      icon: <FolderTree className="w-5 h-5" />
    },
    {
      name: "Editor",
      path: "/app",
      isActive: pathname === "/app" && !explorerOpen,
      icon: <Code2 className="w-5 h-5" />
    },
    {
      name: "History",
      path: "/history",
      isActive: pathname === "/history",
      icon: <History className="w-5 h-5" />
    },
    {
      name: "Report",
      path: "/report",
      isActive: pathname === "/report",
      icon: <BarChart2 className="w-5 h-5" />
    },
  ];

  return (
    <div className="w-[52px] flex-shrink-0 bg-[#050507] border-r border-border/20 h-screen flex flex-col relative z-20 items-center py-4 select-none">
      {/* Brand Icon (Top) */}
      <Link href="/" className="mb-8 group relative w-9 h-9 flex items-center justify-center">
        <LoomLogo size={34} />
      </Link>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-5 w-full items-center">
        {navItems.map((item) => {
          return (
            <div key={item.name} className="w-full flex justify-center group relative">
               {item.onClick ? (
                 <button 
                  onClick={item.onClick}
                  className={`relative flex flex-col items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ${item.isActive ? "text-[var(--brand)] bg-[var(--brand)]/5" : "text-text-muted hover:text-text-primary hover:bg-white/5"}`}
                 >
                   {item.isActive && (
                     <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--brand)] rounded-r-full shadow-[0_0_15px_rgba(0,229,255,0.8)] z-30" />
                   )}
                   {item.icon}
                 </button>
               ) : (
                 <Link 
                  href={item.path}
                  className={`relative flex flex-col items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ${item.isActive ? "text-[var(--brand)] bg-[var(--brand)]/5" : "text-text-muted hover:text-text-primary hover:bg-white/5"}`}
                 >
                   {item.isActive && (
                     <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--brand)] rounded-r-full shadow-[0_0_15px_rgba(0,229,255,0.8)] z-30" />
                   )}
                   {item.icon}
                 </Link>
               )}

              {/* Tooltip */}
              <div className="absolute left-[58px] top-1/2 -translate-y-1/2 bg-[#0a0a0c] text-text-primary text-[11px] font-bold px-3 py-1.5 rounded-md border border-border/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.5)] translate-x-[-4px] group-hover:translate-x-0">
                {item.name}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Buttons */}
      <div className="mt-auto w-full flex flex-col items-center gap-4 pb-4">
        <Link href="/settings" className="relative flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all group">
          <Settings className="w-5 h-5" />
          <div className="absolute left-[58px] top-1/2 -translate-y-1/2 bg-[#0a0a0c] text-text-primary text-[11px] font-bold px-3 py-1.5 rounded-md border border-border/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.5)] translate-x-[-4px] group-hover:translate-x-0">
            Settings
          </div>
        </Link>
      </div>
    </div>
  );
}
