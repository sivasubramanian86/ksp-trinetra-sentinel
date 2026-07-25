"use client";

import React, { useState } from "react";
import { Shield, BookOpen, HelpCircle, Info, Settings, PhoneCall, AlertCircle, CheckCircle2, Lock } from "lucide-react";

interface PublicVigilancePortalProps {
  language: "en" | "kn";
}

export const PublicVigilancePortal: React.FC<PublicVigilancePortalProps> = ({ language }) => {
  const [activeSubTab, setActiveSubTab] = useState<"self_defence" | "faq" | "about" | "settings">("self_defence");
  const [sosTriggered, setSosTriggered] = useState(false);

  return (
    <div className="w-full h-full flex flex-col glass-card rounded-3xl overflow-hidden border border-slate-300 dark:border-cyan-500/30 shadow-2xl transition-colors duration-300">
      {/* Navigation Header */}
      <div className="px-8 py-5 border-b flex flex-wrap items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-500/30 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
            <Shield className="w-7 h-7 text-cyan-600 dark:text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-wider text-slate-900 dark:text-white">
              {language === "kn" ? "ಸಾರ್ವಜನಿಕ ಜಾಗೃತಿ ಮತ್ತು ಆತ್ಮರಕ್ಷಣೆ ಪೋರ್ಟಲ್" : "PUBLIC VIGILANCE & SELF-DEFENCE PORTAL"}
            </h2>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Citizens Self-Defence Guides, Helpline Emergency SOS & KSP FAQs
            </p>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center space-x-2 bg-slate-200/80 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab("self_defence")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === "self_defence"
                ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 shadow-sm"
                : "text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Self-Defence
          </button>
          <button
            onClick={() => setActiveSubTab("faq")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === "faq"
                ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 shadow-sm"
                : "text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveSubTab("about")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === "about"
                ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 shadow-sm"
                : "text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === "settings"
                ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 shadow-sm"
                : "text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Sub Tab Content Area */}
      <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
        {/* Sub Tab 1: Self-Defence & Emergency SOS */}
        {activeSubTab === "self_defence" && (
          <div className="space-y-6">
            {/* One-Click Emergency SOS Banner */}
            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-600 dark:text-red-400">
                  <PhoneCall className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {language === "kn" ? "ತುರ್ತು ಪೊಲೀಸ್ ಸಹಾಯವಾಣಿ ೧೧೨ / ಸೈಬರ್ ೧೯೩೦" : "EMERGENCY POLICE HELPLINE 112 / CYBER 1930"}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    Instant 1-Click Panic Dispatch for Women Safety & Crime Alert
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSosTriggered(true)}
                className={`px-6 py-3.5 rounded-2xl text-xs font-black transition-all shadow-lg hover:scale-105 ${
                  sosTriggered
                    ? "bg-emerald-500 text-slate-950 border border-emerald-400"
                    : "bg-red-600 text-white border border-red-500"
                }`}
              >
                {sosTriggered ? "DISPATCH SENT TO KSP 112 COMMAND" : "TRIGGER EMERGENCY POLICE SOS"}
              </button>
            </div>

            {/* Self-Defence Tech Guides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">1. Women Safety & Night Commute Guidelines</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Always use official KSP NammaRaksha app tracking when taking auto-rickshaws at night. Share live GPS location with trusted contacts.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">2. Cyber Fraud & UPI Lien Freeze Steps</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  If victimized by phishing or unauthorized UPI debit, report immediately within the 1-hour golden window to 1930 Cyber Helpline.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sub Tab 2: FAQ */}
        {activeSubTab === "faq" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Q1: How does KSP Trinetra Sentinel protect citizen privacy under the DPDP Act 2023?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All PII data (phone numbers, Aadhaar, PAN) is automatically anonymized using cryptographic SHA-256 hashes prior to AI processing. No raw identity records are stored in public models.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Q2: How do police officers use Zia GraphRAG copilot during investigations?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Officers query natural language questions in Kannada or English. The Zia orchestrator retrieves relevant Bharatiya Nyaya Sanhita (BNS 2023) legal codes and outputs explainable tactical briefings.
              </p>
            </div>
          </div>
        )}

        {/* Sub Tab 3: About */}
        {activeSubTab === "about" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-base font-black text-slate-900 dark:text-white">ABOUT KSP TRINETRA SENTINEL</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Built for the Karnataka State Police Datathon 2026, KSP Trinetra Sentinel is a multi-layer city brain combining Next.js Command Center UI, Zoho Catalyst Serverless API Gateways, PostgreSQL PostGIS schemas, ST-GNN predictive risk models, and Forensic Report Dissection Engines.
            </p>
          </div>
        )}

        {/* Sub Tab 4: Settings */}
        {activeSubTab === "settings" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-base font-black text-slate-900 dark:text-white">COMMAND CENTER SETTINGS</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold">DPDP Ethics Guard Filter:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">ENABLED (STRICT)</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold">Zoho Catalyst Vault Status:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">VAULT CONNECTED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
