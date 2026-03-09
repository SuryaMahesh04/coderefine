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
    <div className="w-14 flex-shrink-0 bg-[#000000] border-r border-[rgba(0,229,255,0.1)] h-screen flex flex-col relative z-20 items-center py-3">
      {/* Brand Icon (Top) */}
      <Link href="/" className="mb-8 group relative w-10 h-10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full gradient-sphere flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all">
          <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]" />
        </div>
      </Link>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col gap-3 w-full items-center">
        {navItems.map((item) => {
          const content = (
            <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 group ${item.isActive ? "text-[#00E5FF]" : "text-[#4d6b5a] hover:text-[#00C853]"}`}>
              {item.isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-[#00E5FF] to-[#00C853] rounded-r-full shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
              )}
              {item.icon}

              {/* Tooltip */}
              <div className="absolute left-14 bg-[#141420] text-[#F0FFF4] text-xs font-medium px-2.5 py-1.5 rounded-md border border-[rgba(0,200,83,0.15)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                {item.name}
              </div>
            </div>
          );

          if (item.onClick) {
            return (
              <button key={item.name} onClick={item.onClick} className="focus:outline-none w-full flex justify-center">
                {content}
              </button>
            );
          }

          return (
            <Link key={item.path} href={item.path} className="w-full flex justify-center">
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Settings Gear & Theme Toggle (Bottom) */}
      <div className="mt-auto w-full flex flex-col items-center gap-3 pb-2">
        {mounted && (
          <button
            onClick={handleThemeToggle}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl text-[#4d6b5a] hover:text-[#00C853] hover:bg-[rgba(0,200,83,0.05)] transition-colors group outline-none"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} className="w-5 h-5" /> : <Moon size={20} className="w-5 h-5" />}
            {/* Tooltip */}
            <div className="absolute left-14 bg-[#141420] text-[#F0FFF4] text-xs font-medium px-2.5 py-1.5 rounded-md border border-[rgba(0,200,83,0.15)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
              Toggle Theme
            </div>
          </button>
        )}

        <button className="relative flex items-center justify-center w-10 h-10 rounded-xl text-[#4d6b5a] hover:text-[#00C853] hover:bg-[rgba(0,200,83,0.05)] transition-colors group">
          <Settings className="w-5 h-5" />
          {/* Tooltip */}
          <div className="absolute left-14 bg-[#141420] text-[#F0FFF4] text-xs font-medium px-2.5 py-1.5 rounded-md border border-[rgba(0,200,83,0.15)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
            Settings
          </div>
        </button>
      </div>
    </div>
  );
}
