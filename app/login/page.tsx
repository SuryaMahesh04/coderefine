"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/app");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00E5FF] selection:text-black">
      <Navbar />

      <main className="relative min-h-[calc(100vh-80px)] mt-20 flex flex-col items-center justify-center p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] pointer-events-none">
          <div className="absolute inset-0 bg-[#00E5FF]/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-10 animate-fade-in-up">
            <h1 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h1>
            <p className="text-zinc-400">Sign in to access your workspaces</p>
          </div>

          <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>

            {/* Google Button */}
            <button
              id="google-signin-btn"
              type="button"
              disabled={isGoogleLoading || isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center gap-3 bg-white hover:bg-zinc-100 text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-70 mb-6"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-950 px-3 text-zinc-500 font-medium">OR SIGN IN WITH EMAIL</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 text-sm font-medium">
                <label className="text-zinc-300 ml-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-sm font-medium">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-zinc-300">Password</label>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                disabled={isLoading || isGoogleLoading}
                type="submit"
                className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-bold py-3.5 rounded-xl transition-all mt-2 flex justify-center items-center gap-2 group disabled:opacity-70 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              >
                {isLoading ? "Signing In..." : "Sign In"}
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-sm text-zinc-500 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white hover:text-[#00E5FF] transition-colors font-medium">
              Create one for free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
