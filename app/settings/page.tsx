"use client";

import React from "react";
import { DashboardShell } from "../../components/DashboardShell";
import { useSession } from "next-auth/react";
import { User, Shield, Bell, Key, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <DashboardShell 
      title="Settings" 
      subtitle="Manage your profile, security, and preferences"
    >
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        
        {/* Profile Section */}
        <section className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00E5FF]/10 rounded-xl flex items-center justify-center border border-[#00E5FF]/20">
              <User className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Profile Information</h2>
              <p className="text-xs text-zinc-500">Update your personal details and how others see you</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                <div className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
                  {session?.user?.name || "N/A"}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase">Email Address</label>
                <div className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white">
                   {session?.user?.email || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Shield className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Security</h2>
              <p className="text-xs text-zinc-500">Manage your password and authentication methods</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <div className="text-sm font-bold">Two-Factor Authentication</div>
                <div className="text-xs text-zinc-500">Add an extra layer of security to your account</div>
              </div>
              <button className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-bold">Password</div>
                <div className="text-xs text-zinc-500">Last changed 3 months ago</div>
              </div>
              <button className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                Change
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/10 rounded-2xl overflow-hidden">
          <div className="p-6">
             <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
             <p className="text-xs text-zinc-500 mb-6">Permanently delete your account and all associated data</p>
             <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all">
               Delete Account
             </button>
          </div>
        </section>

      </div>
    </DashboardShell>
  );
}
