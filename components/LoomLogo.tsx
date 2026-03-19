"use client";

import React from "react";

interface LoomLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function LoomLogo({ className = "", size = 32, showText = false }: LoomLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="shrink-0 relative overflow-hidden rounded-lg bg-[#000000]"
        style={{ width: size, height: size }}
      >
        <img
          src="/logo.png"
          alt="Loom AI Logo"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ 
            // Reset transforms as the new logo2.png is expected to be sized correctly
            transform: 'none'
          }}
        />
      </div>
      {showText && (
        <span className="font-display font-black text-white tracking-tighter" style={{ fontSize: size * 0.72 }}>
          Loom<span className="text-[var(--brand)]">AI</span>
        </span>
      )}
    </div>
  );
}
