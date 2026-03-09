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
        <nav className="fixed top-0 w-full z-50 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] transition-colors">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-5 h-5 rounded bg-[var(--brand)] flex items-center justify-center p-[2px] shadow-[0_0_10px_rgba(88,166,255,0.3)]">
                                <div className="w-full h-full bg-[var(--surface)] rounded-[2px] relative flex justify-center items-center">
                                    <div className="w-1.5 h-1.5 bg-[var(--fixed)] rounded-full animate-pulse" />
                                </div>
                            </div>
                            <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
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
                        {mounted && (
                            <button
                                onClick={handleThemeToggle}
                                className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] rounded-full transition-colors flex outline-none"
                                aria-label="Toggle Theme"
                            >
                                {theme === "dark" ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
                            </button>
                        )}

                        <Link href="/login" className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-2">
                            Log in
                        </Link>
                        <Link href="/app">
                            <button className="h-8 px-4 ml-2 rounded-md text-sm font-medium bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--surface)] transition-all shadow-sm">
                                Try Sandbox
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
