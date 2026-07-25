"use client";

import React, { useState } from "react";
import { ShieldCheck, Sliders, ArrowDownRight, Scale } from "lucide-react";

interface TacticalPanelProps {
  language: "en" | "kn";
}

interface AdvisoryCard {
  id: string;
  title: string;
  titleKannada: string;
  beatCode: string;
  originalRisk: number;
  simulatedRisk: number;
  recommendedAction: string;
  recommendedActionKannada: string;
  bnsSection: string;
}

const ADVISORIES: AdvisoryCard[] = [
  {
    id: "ADV-01",
    title: "High Chain Snatching Risk - Corridor B",
    titleKannada: "ಸರಗಳ್ಳತನದ ಹೆಚ್ಚಿನ ಅಪಾಯ - ಕಾರಿಡಾರ್ ಬಿ",
    beatCode: "BNG-INDIRANAGAR-B1",
    originalRisk: 0.78,
    simulatedRisk: 0.28,
    recommendedAction: "Deploy 2 Hoysala patrol cars between 22:00 and 02:00. Enable ANPR camera checkpoint.",
    recommendedActionKannada: "ರಾತ್ರಿ ೨೨:೦೦ ರಿಂದ ೦೨:೦೦ ರ ನಡುವೆ ೨ ಹೊಯ್ಸಳ ಗಸ್ತು ವಾಹನಗಳನ್ನು ನಿಯೋಜಿಸಿ.",
    bnsSection: "BNS Section 304 (Snatching)",
  },
  {
    id: "ADV-02",
    title: "UPI Mule Account Cluster Detected",
    titleKannada: "ಯುಪಿಐ ಮ್ಯೂಲ್ ಖಾತೆಗಳ ಜಾಲ ಪತ್ತೆ",
    beatCode: "CYBER-DIST-04",
    originalRisk: 0.88,
    simulatedRisk: 0.35,
    recommendedAction: "Issue automated lien freeze notice via 1930 Cyber Helpline gateway.",
    recommendedActionKannada: "೧೯೩೦ ಸೈಬರ್ ಹೆಲ್ಪ್‌ಲೈನ್ ಮೂಲಕ ತಕ್ಷಣದ ಖಾತೆ ತಡೆ ನೋಟಿಸ್ ನೀಡಿ.",
    bnsSection: "BNS Section 318 (Cheating)",
  },
];

export const TacticalPanel: React.FC<TacticalPanelProps> = ({ language }) => {
  const [simulationActive, setSimulationActive] = useState<{ [key: string]: boolean }>({
    "ADV-01": false,
    "ADV-02": false,
  });

  const toggleSimulation = (id: string) => {
    setSimulationActive((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full h-full flex flex-col glass-card rounded-3xl overflow-hidden border border-slate-300 dark:border-cyan-500/30 shadow-2xl transition-colors duration-300">
      {/* Header */}
      <div className="px-8 py-5 border-b flex items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-500/30">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30">
            <Sliders className="w-7 h-7 text-amber-600 dark:text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-wider text-slate-900 dark:text-white">
              {language === "kn" ? "ತಾಂತ್ರಿಕ ಸಲಹೆ ಕಾರ್ಡ್‌ಗಳು & 'WHAT-IF' ಸಿಮ್ಯುಲೇಶನ್" : "WHAT-IF TACTICAL ADVISORY PANEL"}
            </h2>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {language === "kn" ? "ಅಪಾಯ ತಗ್ಗಿಸುವಿಕೆ ಮಾದರಿ" : "Counterfactual Risk Reduction Simulation Console"}
            </p>
          </div>
        </div>
        <span className="text-xs px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-mono font-extrabold shadow-sm">
          COUNTERFACTUAL ENGINE
        </span>
      </div>

      {/* Advisory Cards List */}
      <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
        {ADVISORIES.map((card) => {
          const isSimulated = simulationActive[card.id];
          const displayRisk = isSimulated ? card.simulatedRisk : card.originalRisk;

          return (
            <div
              key={card.id}
              className={`p-6 rounded-3xl border transition-all duration-300 ${
                isSimulated
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/60 shadow-xl scale-[1.01]"
                  : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold">
                    {card.id}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/30">
                    {card.beatCode}
                  </span>
                </div>

                <div className="flex items-center space-x-2 bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/30 font-semibold">
                  <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-bold">{card.bnsSection}</span>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                {language === "kn" ? card.titleKannada : card.title}
              </h3>

              <p className="text-sm text-slate-700 dark:text-slate-200 mb-6 leading-relaxed bg-slate-100 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 font-medium">
                {language === "kn" ? card.recommendedActionKannada : card.recommendedAction}
              </p>

              {/* Simulation Controls & Score Display */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-5">
                  <div className="text-left">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase block font-mono">
                      {isSimulated ? "SIMULATED RISK" : "CURRENT RISK"}
                    </span>
                    <span
                      className={`text-3xl font-black font-mono ${
                        isSimulated ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {(displayRisk * 100).toFixed(0)}%
                    </span>
                  </div>

                  {isSimulated && (
                    <div className="flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/40 shadow-sm font-bold">
                      <ArrowDownRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-extrabold tracking-wide">64% RISK REDUCTION</span>
                    </div>
                  )}
                </div>

                {/* Toggle Simulation Switch */}
                <button
                  onClick={() => toggleSimulation(card.id)}
                  className={`flex items-center space-x-2.5 px-6 py-3 rounded-2xl text-xs font-bold transition-all border shadow-lg hover:scale-105 ${
                    isSimulated
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold"
                      : "bg-slate-900 text-white dark:bg-slate-800 dark:text-cyan-300 border-slate-700 dark:border-cyan-500/50"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {isSimulated
                      ? language === "kn"
                        ? "ನಿಯೋಜನೆ ಸಕ್ರಿಯವಾಗಿದೆ"
                        : "SIMULATION ACTIVE"
                      : language === "kn"
                      ? "ನಿಯೋಜನೆ ಸಿಮ್ಯುಲೇಟ್ ಮಾಡಿ"
                      : "SIMULATE INTERVENTION"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
