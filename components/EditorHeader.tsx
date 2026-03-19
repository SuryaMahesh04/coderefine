"use client";

import { useRef, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  Activity, 
  Download, 
  ChevronDown, 
  User, 
  Settings, 
  LayoutDashboard, 
  LogOut,
  Share2,
  FolderArchive,
  Save,
  Upload,
  FileUp,
  ClipboardList
} from "lucide-react";
import EditorBreadcrumbs from "./EditorBreadcrumbs";
import LoomLogo from "./LoomLogo";

interface EditorHeaderProps {
  activeFilename: string | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onDownload: () => void;
  onDownloadAll: () => void;
  onUploadFile: () => void;
  onUploadZip: () => void;
  onShowArtifacts?: () => void;
  artifactCount?: number;
  canAnalyze?: boolean;
}

export default function EditorHeader({
  activeFilename,
  isAnalyzing,
  onRunAnalysis,
  onDownload,
  onDownloadAll,
  onUploadFile,
  onUploadZip,
  onShowArtifacts,
  artifactCount = 0,
  canAnalyze = true
}: EditorHeaderProps) {
  const { data: session } = useSession();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-12 border-b border-border bg-[#050507] flex items-center justify-between px-2 shrink-0 z-50">
      {/* Left: Brand & Breadcrumbs */}
      <div className="flex items-center h-full min-w-0 flex-1 pl-1">
        <div className="mr-3 border-r border-border/50 pr-3 h-7 flex items-center">
          <LoomLogo size={28} />
        </div>
        <EditorBreadcrumbs filename={activeFilename} />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3 px-2 shrink-0 h-full">
        {/* Secondary Actions */}
        <div className="hidden md:flex items-center gap-1.5 border-r border-border/50 pr-3 mr-1">
          <button 
            onClick={onUploadFile}
            title="Upload File"
            className="p-1.5 rounded-md text-text-muted hover:text-[var(--brand)] hover:bg-white/5 transition-all"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button 
            onClick={onUploadZip}
            title="Upload ZIP Workspace"
            className="p-1.5 rounded-md text-text-muted hover:text-[var(--brand)] hover:bg-white/5 transition-all"
          >
            <FileUp className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border/30 mx-1" />
          <button 
            onClick={onDownload}
            title="Download Current File"
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={onDownloadAll}
            title="Download All Files"
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
          >
            <FolderArchive className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-border/30 mx-1" />
          
          {/* Artifacts Trigger */}
          <button
            onClick={onShowArtifacts}
            title="Show Artifacts"
            className={`relative p-1.5 rounded-md transition-all ${artifactCount > 0 ? "bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 shadow-[0_0_10px_rgba(0,229,255,0.2)]" : "text-text-muted hover:text-text-primary hover:bg-white/5"}`}
          >
            <ClipboardList className="w-4 h-4" />
            {artifactCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--brand)] text-[#050507] text-[8px] font-bold flex items-center justify-center">
                {artifactCount}
              </span>
            )}
          </button>
        </div>

        {/* Primary Action: Analyze */}
        <button
          onClick={onRunAnalysis}
          disabled={!canAnalyze || isAnalyzing}
          className={`
            relative flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider transition-all
            ${isAnalyzing 
              ? 'bg-[var(--brand)]/10 text-[var(--brand)] animate-pulse border border-[var(--brand)]/20' 
              : 'bg-[var(--brand)] text-[#050507] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none'
            }
          `}
        >
          {isAnalyzing ? (
            <>
              <div className="w-3 h-3 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Activity className="w-3.5 h-3.5" />
              Run Analysis
            </>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border transition-all hover:bg-white/5 ${
              isProfileMenuOpen ? 'bg-white/5 border-[var(--brand)]/50' : 'border-border bg-surface-muted'
            }`}
          >
            <span className="text-[11px] font-bold text-text-secondary hidden xl:block pl-1">
              {session?.user?.name?.split(" ")[0]}
            </span>
            {session?.user?.image ? (
              <img src={session.user.image} alt="Profile" className="w-7 h-7 rounded-full ring-1 ring-white/10" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--brand)]/10 flex items-center justify-center border border-[var(--brand)]/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]">
                <User className="w-3.5 h-3.5 text-[var(--brand)]" />
              </div>
            )}
            <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-3 border-b border-border/50 mb-1">
                <p className="text-xs font-bold text-white truncate">{session?.user?.name}</p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{session?.user?.email}</p>
              </div>
              
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
                Dashboard Overview
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                Account Settings
              </Link>
              
              <div className="h-px bg-border/50 my-1 mx-2" />
              
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/5 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
