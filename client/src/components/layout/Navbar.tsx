"use client";

import React from "react";
import { Shield, Eye, Globe, Cpu, Lock, Sun, Moon } from "lucide-react";

interface NavbarProps {
  language: "en" | "kn";
  onToggleLanguage: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  activeRole: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  activeRole,
}) => {
  return (
    <header className="w-full h-24 glass-card-glow px-8 flex items-center justify-between border-b transition-colors duration-300 sticky top-0 z-50 shadow-xl dark:bg-slate-950/85 dark:border-cyan-500/30 bg-white/85 border-slate-200">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-4">
        <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 shadow-md">
          <Eye className="w-8 h-8 animate-pulse text-cyan-600 dark:text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-wider flex items-center space-x-3 text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 dark:from-white dark:via-cyan-200 dark:to-cyan-400 bg-clip-text text-transparent">
              KSP TRINETRA SENTINEL
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-mono tracking-normal font-bold">
              v1.0.0 PROD
            </span>
          </h1>
          <p className="text-sm font-semibold text-slate-600 dark:text-cyan-200/80 mt-0.5">
            {language === "kn"
              ? "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ - ಬಹುಪದರದ ನಗರ ಮಿದುಳು (Datathon 2026)"
              : "Karnataka State Police - Multi-Layer City Brain (Datathon 2026)"}
          </p>
        </div>
      </div>

      {/* Compliance & Status Badges */}
      <div className="hidden lg:flex items-center space-x-4 text-xs font-bold">
        <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
          <span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping"></span>
          <span className="tracking-wide">STATUS: LIVE CORE</span>
        </div>

        <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 shadow-sm">
          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="tracking-wide">DPDP ACT COMPLIANT</span>
        </div>

        <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-sm">
          <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="tracking-wide">ETHICS GUARD ACTIVE</span>
        </div>
      </div>

      {/* Controls: Theme, Language & Role */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title="Toggle Light / Dark Theme"
          className="p-3 rounded-2xl border transition-all duration-300 shadow-md hover:scale-105 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-amber-500 dark:text-cyan-400"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border transition-all text-xs font-bold shadow-md hover:scale-105 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-cyan-500/40 text-slate-800 dark:text-cyan-300"
        >
          <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-sm font-bold">{language === "en" ? "ಕನ್ನಡ (KN)" : "English (EN)"}</span>
        </button>

        {/* Role Badge */}
        <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold shadow-inner bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200">
          <Shield className="w-4 h-4 text-amber-500" />
          <span>{activeRole}</span>
        </div>
      </div>
    </header>
  );
};
