import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, ShieldCheck, BugBeetle, Code, Rocket } from "@phosphor-icons/react";
import LoomLogo from "./LoomLogo";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, LayoutDashboard } from "lucide-react";

export function Navbar() {
    const { data: session, status } = useSession();
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
                            <LoomLogo size={42} showText={true} />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center h-full gap-2">
                            <Link href="/pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--surface-raised)]">
                                Pricing
                            </Link>
                            <Link href="/features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--surface-raised)]">
                                Features
                            </Link>
                            <Link href="/ai-engine" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--surface-raised)]">
                                AI Engine
                            </Link>
                            <Link href="/enterprise" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-md hover:bg-[var(--surface-raised)]">
                                Enterprise
                            </Link>
                        </div>
                    </div>

                    {/* Right side Actions */}
                    <div className="flex items-center gap-3">
                        {status === "loading" ? (
                            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                        ) : status === "authenticated" && session?.user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[#00E5FF] transition-colors">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <Link href="/dashboard" className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-[#00E5FF] transition-colors">
                                    {session.user.image ? (
                                        <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <User className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-2">
                                    Log in
                                </Link>
                                <Link href="/app">
                                    <button className="h-8 px-4 ml-2 rounded-md text-sm font-bold bg-gradient-to-r from-[#00C853] to-[#00E5FF] hover:brightness-110 text-[#000000] transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                                        Try Sandbox
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
