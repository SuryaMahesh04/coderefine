"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export function Navbar() {
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

    return (
        <nav className="fixed top-0 w-full z-50 bg-[rgba(0,0,0,0.8)] backdrop-blur-xl border-b border-[rgba(0,229,255,0.15)] transition-colors">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-6 h-6 rounded-full gradient-sphere flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] transition-all">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_5px_white]" />
                            </div>
                            <span className="text-lg font-display font-bold tracking-tight text-[var(--text-primary)]">
                                CodeRefine<span className="text-[var(--brand)]">.</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center h-full gap-2">
                            <Link href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--surface-raised)]">
                                Features
                            </Link>
                            <Link href="#engine" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--surface-raised)]">
                                AI Engine
                            </Link>
                            <Link href="#enterprise" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--surface-raised)]">
                                Enterprise
                            </Link>
                        </div>
                    </div>

                    {/* Right side Actions */}
                    <div className="flex items-center gap-3">


                        <Link href="/login" className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-2">
                            Log in
                        </Link>
                        <Link href="/app">
                            <button className="h-8 px-4 ml-2 rounded-md text-sm font-bold bg-gradient-to-r from-[#00C853] to-[#00E5FF] hover:brightness-110 text-[#000000] transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                                Try Sandbox
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
