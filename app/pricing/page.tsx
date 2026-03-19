"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Zap, Shield, Code2 } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const userPlan = (session?.user as any)?.plan || "free";

  const handleCheckout = async (plan: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (plan === "free") {
      router.push("/app");
      return;
    }

    // If user is already on a paid plan and clicks Manage
    if (userPlan !== "free") {
      setLoadingPlan("portal");
      try {
        const res = await fetch("/api/stripe/portal", { method: "POST" });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.toLowerCase() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for exploring the power of CodeRefine workflows.",
      features: [
        "10 AI Scans per month",
        "100KB max file size",
        "Agentic standard models",
        "Web IDE access",
        "Community support"
      ],
      planId: "free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For professionals requiring unlimited refinement power.",
      features: [
        "Unlimited AI Scans",
        "5MB ZIP upload limit",
        "Flash & Pro models",
        "PDF Report Exports",
        "Code Diff Viewer",
        "Priority support"
      ],
      planId: "pro",
      highlighted: true,
      badge: "Most Popular"
    },
    {
      name: "Team",
      price: "$49",
      period: "/month/user",
      description: "For engineering teams automating code compliance.",
      features: [
        "Everything in Pro",
        "Shared Team Workspaces",
        "Centralized Billing",
        "Custom Rules (KI Upload)",
        "GitHub API Integration",
        "Dedicated Account Manager"
      ],
      planId: "team",
      highlighted: false,
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00E5FF] selection:text-black mt-20">
      <Navbar />

      <main className="relative py-24 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/20 to-transparent blur-[100px] opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              Invest in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-blue-500">Excellence</span>
            </h1>
            <p className="text-xl text-zinc-400">
              Stop shipping technical debt. Let Loom AI's agentic AI pipeline systematically identify, explain, and resolve your codebase issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-8 flex flex-col h-full animate-fade-in-up transition-transform duration-300 hover:-translate-y-2 ${plan.highlighted
                    ? 'bg-gradient-to-b from-zinc-900 to-black border-2 border-[#00E5FF] shadow-[0_0_40px_rgba(0,229,255,0.15)]'
                    : 'bg-zinc-950 border border-white/10 hover:border-white/20'
                  }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#00E5FF] text-black text-xs font-bold rounded-full uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                    {plan.period && <span className="text-zinc-500 font-medium mb-1">{plan.period}</span>}
                  </div>
                  <p className="text-zinc-400 text-sm">{plan.description}</p>
                </div>

                <button
                  onClick={plan.planId === "team" ? undefined : () => handleCheckout(plan.planId)}
                  disabled={loadingPlan === plan.planId || loadingPlan === "portal"}
                  className={`w-full py-4 rounded-xl text-center font-bold transition-all mb-8 flex justify-center items-center gap-2 ${plan.highlighted
                      ? 'bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                      : 'bg-white/5 text-white hover:bg-white/10'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {plan.planId === "team" ? (
                    <a href="mailto:sales@coderefine.com" className="w-full h-full block">Contact Sales</a>
                  ) : loadingPlan === plan.planId || (loadingPlan === "portal" && userPlan !== "free") ? (
                    "Processing..."
                  ) : userPlan === plan.planId ? (
                    "Current Plan"
                  ) : userPlan !== "free" && plan.planId !== "free" ? (
                    "Manage Subscription"
                  ) : plan.planId === "free" ? (
                    "Get Started"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                  {plan.planId !== "team" && <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="space-y-4 flex-1">
                  <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4">What's included</div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`mt-0.5 shrink-0 rounded-full p-0.5 ${plan.highlighted ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-white/10 text-zinc-300'}`}>
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ or Trust Section */}
          <div className="border-t border-white/5 pt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Enterprise Grade by Default</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-4 text-[#00E5FF]">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold mb-2">Private & Secure</h3>
                <p className="text-sm text-zinc-500">Your code is never used to train our models. All analysis data is ephemeral during standard sessions.</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-4 text-[#00E5FF]">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold mb-2">Lightning Fast</h3>
                <p className="text-sm text-zinc-500">Powered by Gemini 2.0 Flash models for sub-second, multi-file code execution and refactoring.</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-4 text-[#00E5FF]">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold mb-2">No Setup Required</h3>
                <p className="text-sm text-zinc-500">Use the web editor or just drop a ZIP file. We instantly reconstruct your environment.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
