"use client";

import React, { useState } from "react";
import { Stethoscope, UploadCloud, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Binary, Crosshair } from "lucide-react";
import { SampleEvidenceCanvas } from "./SampleEvidenceCanvas";


interface ForensicLabModalProps {
  language: "en" | "kn";
  onClose?: () => void;
}

export const ForensicLabModal: React.FC<ForensicLabModalProps> = ({ language, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [reportProcessed, setReportProcessed] = useState(true);
  const [expandedSection, setExpandedSection] = useState<"pathology" | "digital" | "trace" | null>("pathology");
  const [exported, setExported] = useState(false);

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setReportProcessed(true);
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col glass-card rounded-3xl overflow-hidden border border-slate-300 dark:border-cyan-500/30 shadow-2xl transition-colors duration-300">
      {/* Header Bar */}
      <div className="px-8 py-5 border-b flex items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-500/30">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30">
            <Stethoscope className="w-7 h-7 text-red-600 dark:text-red-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-wider text-slate-900 dark:text-white">
              {language === "kn" ? "ಫೋರೆನ್ಸಿಕ್ ಟ್ರಯಾಜ್ ಲ್ಯಾಬ್ (FORENSIC LAB)" : "FORENSIC TRIAGE & CONTRADICTION LAB"}
            </h2>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Multi-Agent Report Dissection & Early Lead Synthesizer
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs font-bold">
          <span className="px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30 shadow-sm">
            AUTONOMOUS SUBAGENTS ACTIVE
          </span>
        </div>
      </div>

      {/* Workspace */}
      <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
        {/* Sample Evidence Canvas Gallery */}
        <SampleEvidenceCanvas language={language} />

        {/* Upload Zone */}
        <div className="p-8 rounded-3xl border-2 border-dashed border-cyan-500/40 bg-white/80 dark:bg-slate-900/60 flex flex-col items-center justify-center text-center shadow-md">

          <UploadCloud className="w-10 h-10 text-cyan-600 dark:text-cyan-400 mb-3 animate-bounce" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
            {language === "kn"
              ? "ಫೋರೆನ್ಸಿಕ್ ವರದಿಗಳನ್ನು ಇಲ್ಲಿ ಡ್ರಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಮಾಡಿ (PDF, CDR, PCAP)"
              : "Drag & Drop Forensic Reports (Autopsy PDFs, CDR CSVs, PCAP Logs)"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-4">
            Supports Autopsy PDFs, Toxicology Screens, Ballistic Scans & Tower Dumps
          </p>

          <button
            onClick={handleSimulateUpload}
            disabled={isUploading}
            className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-slate-950 text-xs font-black transition-all hover:scale-105 shadow-lg"
          >
            {isUploading
              ? "Dissecting Evidence via Multi-Agents..."
              : "Process Sample Forensic Case #CASE-2026-IND-88"}
          </button>
        </div>

        {/* Forensic Contradiction & Early Leads Panel */}
        {reportProcessed && (
          <div className="space-y-6">
            {/* Timeline Contradiction Highlights */}
            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/50 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="text-sm font-extrabold tracking-wider uppercase">
                    CRITICAL FORENSIC CONTRADICTION DETECTED
                  </span>
                </div>
                <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-lg bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/40">
                  2.5 HOURS DISCREPANCY
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-red-500/30 text-xs space-y-3 shadow-inner">
                <div className="flex items-start justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-mono font-bold">Suspect Witness Statement:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold text-sm">Victim was on phone call at 23:00 Hours</span>
                </div>
                <div className="flex items-start justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
                  <span className="text-red-600 dark:text-red-400 font-mono font-extrabold">Pathology Rigor Mortis Truth:</span>
                  <span className="text-red-600 dark:text-red-300 font-black text-sm">Estimated Death Window: 19:30 - 21:00 Hours</span>
                </div>
              </div>
            </div>

            {/* Expandable Subagent Findings Cards */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                SPECIALIZED SUBAGENT FINDINGS
              </h3>

              {/* 1. Pathology Subagent Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-md">
                <button
                  onClick={() => setExpandedSection(expandedSection === "pathology" ? null : "pathology")}
                  className="w-full px-6 py-4 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white"
                >
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span>1. Medical Examiner & Pathology Subagent</span>
                  </div>
                  {expandedSection === "pathology" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {expandedSection === "pathology" && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2.5 bg-slate-50 dark:bg-slate-950/60 font-mono font-medium text-slate-800 dark:text-slate-200">
                    <p><span className="text-slate-500 dark:text-slate-400 font-bold">Weapon Inferred:</span> Blunt Force Metallic Object (Heavy Edge)</p>
                    <p><span className="text-slate-500 dark:text-slate-400 font-bold">Toxicology Flags:</span> Diazepam (Sedative), Organophosphate Compound</p>
                    <p><span className="text-slate-500 dark:text-slate-400 font-bold">Confidence Score:</span> 94.0%</p>
                  </div>
                )}
              </div>

              {/* 2. Cyber & Digital Forensics Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-md">
                <button
                  onClick={() => setExpandedSection(expandedSection === "digital" ? null : "digital")}
                  className="w-full px-6 py-4 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white"
                >
                  <div className="flex items-center space-x-3">
                    <Binary className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span>2. Cyber & Digital Forensics Subagent</span>
                  </div>
                  {expandedSection === "digital" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {expandedSection === "digital" && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2.5 bg-slate-50 dark:bg-slate-950/60 font-mono font-medium text-slate-800 dark:text-slate-200">
                    <p><span className="text-slate-500 dark:text-slate-400 font-bold">Suspect IPs:</span> 198.51.100.42, 203.0.113.195 (VPN Hop)</p>
                    <p><span className="text-slate-500 dark:text-slate-400 font-bold">IMEI Triangulation:</span> 889977665544 (Present at ATM & Crime Scene)</p>
                    <p><span className="text-slate-500 dark:text-slate-400 font-bold">Deepfake Probability:</span> 12.0% (Clean authentic audio)</p>
                  </div>
                )}
              </div>

              {/* 3. Ballistics & Trace Evidence Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-md">
                <button
                  onClick={() => setExpandedSection(expandedSection === "trace" ? null : "trace")}
                  className="w-full px-6 py-4 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white"
                >
                  <div className="flex items-center space-x-3">
                    <Crosshair className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span>3. Trace Evidence & Ballistics Subagent</span>
                  </div>
                  {expandedSection === "trace" ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {expandedSection === "trace" && (
                  <div className="p-5 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2.5 bg-slate-50 dark:bg-slate-950/60 font-mono font-medium text-slate-800 dark:text-slate-200">
                    <p><span className="text-slate-500 dark:text-slate-400 font-bold">Striation Signature:</span> SIG-9MM-RIFLING-7L</p>
                    <p><span className="text-slate-500 dark:text-slate-400 font-bold">DNA Locus Profile:</span> D3S1358-15,16; TH01-9,9.3 (99.4% Familial Match)</p>
                    <p><span className="text-slate-500 dark:text-slate-400 font-bold">Blood Spatter Angle:</span> 42.5°</p>
                  </div>
                )}
              </div>
            </div>

            {/* Export One-Click Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                SYNTHESIS COMPLETE: 3 LEADS GENERATED
              </span>

              <button
                onClick={() => setExported(true)}
                className={`flex items-center space-x-2.5 px-6 py-3 rounded-2xl text-xs font-extrabold transition-all shadow-lg hover:scale-105 ${
                  exported
                    ? "bg-emerald-500 text-slate-950 border border-emerald-400"
                    : "bg-cyan-600 text-white dark:bg-cyan-400 dark:text-slate-950 border border-cyan-500"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {exported
                    ? "LEAD EXPORTED TO FIR-2026-IND-089"
                    : "EXPORT FORENSIC LEAD TO FIR CASE FILE"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
