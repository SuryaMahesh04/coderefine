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
    <div className="h-screen bg-black text-white font-sans selection:bg-[#00E5FF] selection:text-black pt-20 overflow-hidden flex flex-col">
      <Navbar />

      <main className="relative flex-1 flex items-center justify-center px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 max-w-5xl h-[500px] pointer-events-none mx-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/10 to-transparent blur-[120px] opacity-40" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#00E5FF] text-[11px] font-bold mb-8 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse"></span>
            SUBSCRIPTION GATEWAY
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Plans & Pricing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00C853] to-[#39FF7F]">Coming Soon.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-lg mx-auto mb-12">
            We are fine-tuning our enterprise tier contracts and compliance filters. Launch our free sandbox workspace in the meantime.
          </p>

          <Link href="/app">
            <button className="h-14 px-8 rounded-2xl text-sm font-black bg-white text-black hover:bg-[#F0FFF4] hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 mx-auto">
              Launch Sandbox <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
