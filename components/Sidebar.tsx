"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Editor",
      path: "/app",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      )
    },
    {
      name: "History",
      path: "/history",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      )
    },
    {
      name: "Report",
      path: "/report",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      )
    },
  ];

  return (
    <div className="w-20 lg:w-64 flex-shrink-0 bg-black border-r border-white/5 h-screen flex flex-col relative z-20">
      {/* Brand */}
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all">
            <div className="w-full h-full bg-black/40 rounded-xl relative backdrop-blur-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <span className="hidden lg:block font-black text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
            Refine.
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 flex flex-col gap-3 px-4">
        <div className="hidden lg:block text-xs font-bold tracking-widest text-zinc-600 uppercase mb-2 px-4">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          let linkClass = "group relative flex items-center justify-center lg:justify-start gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300";
          if (isActive) {
            linkClass += " bg-white/10 text-white shadow-inner border border-white/10";
          } else {
            linkClass += " text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent";
          }

          return (
            <Link key={item.path} href={item.path} className={linkClass}>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-2xl pointer-events-none" />
              )}

              <div className={isActive ? "text-blue-400 relative z-10" : "relative z-10 group-hover:text-zinc-300 transition-colors"}>
                {item.icon}
              </div>

              <span className="hidden lg:block font-bold text-sm relative z-10">
                {item.name}
              </span>

              {isActive && (
                <div className="absolute -left-4 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile / Settings */}
      <div className="p-4 mt-auto border-t border-white/5">
        <button className="w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden relative">
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Settings</span>
            <span className="text-xs text-zinc-500 font-medium tracking-wide">v1.0.0</span>
          </div>
        </button>
      </div>
    </div>
  );
}
