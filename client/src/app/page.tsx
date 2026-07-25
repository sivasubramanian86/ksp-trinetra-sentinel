"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { GeoMap } from "@/components/map/GeoMap";
import { MindPalaceGraph } from "@/components/graph/MindPalaceGraph";
import { TacticalPanel } from "@/components/advisory/TacticalPanel";
import { NammaRakshaCopilot } from "@/components/chat/NammaRakshaCopilot";
import { ForensicLabModal } from "@/components/forensics/ForensicLabModal";
import { IotSurveillanceGrid } from "@/components/iot/IotSurveillanceGrid";
import { PublicVigilancePortal } from "@/components/public/PublicVigilancePortal";
import { Map, Network, Sliders, MessageSquare, Stethoscope, Radio, Shield } from "lucide-react";

export default function Home() {
  const [language, setLanguage] = useState<"en" | "kn">("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"map" | "graph" | "advisory" | "forensics" | "iot" | "public" | "copilot">("map");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "kn" : "en"));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 font-sans pb-12">
      {/* Top Header Navigation */}
      <Navbar
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeRole="COMMISSIONER / HQ ANALYST"
      />

      {/* Main Command Center Container */}
      <div className="w-full max-w-[1700px] mx-auto px-4 lg:px-8 pt-6 flex-1 flex flex-col space-y-6">
        {/* Module Selector Bar */}
        <div className="glass-card p-3 rounded-2xl border border-slate-200 dark:border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 shadow-lg bg-white/80 dark:bg-slate-900/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                activeTab === "map"
                  ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400/60 shadow-md"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
              }`}
            >
              <Map className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{language === "kn" ? "ಅಪಾಯ ವೆಕ್ಟರ್ ನಕ್ಷೆ (GIS)" : "Threat Vectors Map"}</span>
            </button>

            <button
              onClick={() => setActiveTab("graph")}
              className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                activeTab === "graph"
                  ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400/60 shadow-md"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
              }`}
            >
              <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{language === "kn" ? "ಸ್ಪೆಕ್ಟರ್ ನ್ಯೂರಲ್ ಮ್ಯಾಟ್ರಿಕ್ಸ್" : "Spectre Neural Matrix"}</span>
            </button>

            <button
              onClick={() => setActiveTab("advisory")}
              className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                activeTab === "advisory"
                  ? "bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-400/60 shadow-md"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400"
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{language === "kn" ? "ತಾಂತ್ರಿಕ ಸಲಹೆಗಳು (What-If)" : "What-If Advisories"}</span>
            </button>

            <button
              onClick={() => setActiveTab("forensics")}
              className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                activeTab === "forensics"
                  ? "bg-red-600 text-white dark:bg-red-500/20 dark:text-red-300 dark:border-red-400/60 shadow-md"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-red-400"
              }`}
            >
              <Stethoscope className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>{language === "kn" ? "ಫೋರೆನ್ಸಿಕ್ ಟ್ರಯಾಜ್ ಲ್ಯಾಬ್" : "Forensic Triage Lab"}</span>
            </button>

            <button
              onClick={() => setActiveTab("iot")}
              className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                activeTab === "iot"
                  ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400/60 shadow-md"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
              }`}
            >
              <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{language === "kn" ? "ಐಓಟಿ ಗಸ್ತು ಮತ್ತು ಟ್ರಾಫಿಕ್ ಗ್ರಿಡ್" : "IoT Grid & Traffic"}</span>
            </button>

            <button
              onClick={() => setActiveTab("public")}
              className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                activeTab === "public"
                  ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400/60 shadow-md"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
              }`}
            >
              <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{language === "kn" ? "ಸಾರ್ವಜನಿಕ ಜಾಗೃತಿ ಮತ್ತು FAQ" : "Public Vigilance & FAQ"}</span>
            </button>

            <button
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                activeTab === "copilot"
                  ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-400/60 shadow-md"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{language === "kn" ? "ನಮ್ಮರಕ್ಷಾ ಕಾಪ್-ಪೈಲಟ್" : "NammaRaksha Copilot"}</span>
            </button>
          </div>

          <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 px-3">
            <span>KSP DATATHON 2026 CORE</span>
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
          {/* Main Active Module Display Area */}
          <div className="lg:col-span-3 min-h-[600px] flex flex-col">
            {activeTab === "map" && <GeoMap language={language} />}
            {activeTab === "graph" && <MindPalaceGraph language={language} />}
            {activeTab === "advisory" && <TacticalPanel language={language} />}
            {activeTab === "forensics" && <ForensicLabModal language={language} />}
            {activeTab === "iot" && <IotSurveillanceGrid language={language} />}
            {activeTab === "public" && <PublicVigilancePortal language={language} />}
            {activeTab === "copilot" && <NammaRakshaCopilot language={language} />}
          </div>

          {/* Persistent NammaRaksha Law Enforcement Copilot Sidebar */}
          <div className="lg:col-span-1 min-h-[600px] flex flex-col">
            <NammaRakshaCopilot language={language} />
          </div>
        </div>
      </div>
    </main>
  );
}
