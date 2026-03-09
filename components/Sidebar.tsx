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
          <Settings className="w-5 h-5" />
          {/* Tooltip */}
          <div className="absolute left-14 bg-[#1a1a1e] text-white text-xs font-medium px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            Settings
          </div>
        </button>
      </div>
    </div>
  );
}
