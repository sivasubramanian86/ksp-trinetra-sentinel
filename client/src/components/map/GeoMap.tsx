"use client";

import React, { useState } from "react";
import { Clock, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { LeafletHeatMap } from "./LeafletHeatMap";

interface GeoMapProps {
  language: "en" | "kn";
}

interface BeatRisk {
  id: string;
  name: string;
  nameKannada: string;
  lat: number;
  lng: number;
  baseRisk: number;
  riskLayer: "STREET_CRIME" | "WOMEN_SAFETY" | "CYBER";
}

const BEATS_DATA: BeatRisk[] = [
  { id: "BNG-INDIRANAGAR-B1", name: "Indiranagar 10th Main", nameKannada: "ಇಂದಿರಾನಗರ ೧೦ನೇ ಮೈನ್", lat: 12.9784, lng: 77.6408, baseRisk: 0.78, riskLayer: "WOMEN_SAFETY" },
  { id: "BNG-KORAMANGALA-B2", name: "Koramangala 5th Block", nameKannada: "ಕೋರಮಂಗಲ ೫ನೇ ಬ್ಲಾಕ್", lat: 12.9352, lng: 77.6245, baseRisk: 0.65, riskLayer: "STREET_CRIME" },
  { id: "BNG-MG-ROAD-B3", name: "MG Road Metro Grid", nameKannada: "ಎಂಜಿ ರಸ್ತೆ ಮೆಟ್ರೋ ಗ್ರಿಡ್", lat: 12.9756, lng: 77.6066, baseRisk: 0.48, riskLayer: "STREET_CRIME" },
  { id: "BNG-JAYANAGAR-B4", name: "Jayanagar 4th Block", nameKannada: "ಜಯನಗರ ೪ನೇ ಬ್ಲಾಕ್", lat: 12.9250, lng: 77.5938, baseRisk: 0.35, riskLayer: "STREET_CRIME" },
  { id: "BNG-WHITEFIELD-B5", name: "Whitefield Tech Park", nameKannada: "ವೈಟ್‌ಫೀಲ್ಡ್ ಟೆಕ್ ಪಾರ್ಕ್", lat: 12.9698, lng: 77.7500, baseRisk: 0.52, riskLayer: "CYBER" },
];

export const GeoMap: React.FC<GeoMapProps> = ({ language }) => {
  const [timeOffsetHours, setTimeOffsetHours] = useState<number>(0);
  const [selectedBeat, setSelectedBeat] = useState<BeatRisk>(BEATS_DATA[0]);

  const getDynamicRisk = (baseRisk: number) => {
    const factor = 1 + (timeOffsetHours / 72) * 0.35;
    return Math.min(1.0, Number((baseRisk * factor).toFixed(2)));
  };

  const getRiskBadge = (score: number) => {
    if (score >= 0.75) return { bg: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50 shadow-md", label: "HIGH RISK / RED ALERT" };
    if (score >= 0.50) return { bg: "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/50 shadow-md", label: "GUARDED / AMBER" };
    return { bg: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/50 shadow-md", label: "LOW RISK / GREEN" };
  };

  return (
    <div className="w-full h-full flex flex-col glass-card rounded-3xl overflow-hidden border border-slate-300 dark:border-cyan-500/30 shadow-2xl transition-colors duration-300">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-500/30">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
            <Zap className="w-6 h-6 animate-pulse text-cyan-600 dark:text-cyan-300" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-wider text-slate-900 dark:text-white">
              {language === "kn" ? "ಅಪಾಯ ವೆಕ್ಟರ್ ಟೈಮ್ ಮೆಷಿನ್ (GIS MAP)" : "THREAT VECTORS TIME MACHINE (GIS MAP)"}
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {language === "kn" ? "ಬೆಂಗಳೂರು ಸಿಟಿ ಬಿಟ್ ಮುನ್ಸೂಚನೆ ಕಂಟ್ರೋಲ್" : "Bengaluru Metropolitan Police Beat Predictive Console"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-300 font-mono">LAYER:</span>
          <span className="px-3 py-1 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-mono shadow-sm">
            {selectedBeat.riskLayer}
          </span>
        </div>
      </div>

      {/* Main Interactive Grid & Map Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 relative overflow-hidden">
        {/* Visual GIS Heatmap & Satellite Map Canvas */}
        <div className="lg:col-span-2 p-3 bg-slate-950 flex flex-col justify-between relative min-h-[420px]">
          <LeafletHeatMap
            language={language}
            timeOffsetHours={timeOffsetHours}
            selectedBeatId={selectedBeat.id}
            onSelectBeat={(id) => {
              const found = BEATS_DATA.find((b) => b.id === id);
              if (found) setSelectedBeat(found);
            }}
          />

          {/* Time Machine Slider Controls */}
          <div className="mt-3 bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/40 shadow-xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-extrabold">
                <Clock className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span>
                  {language === "kn"
                    ? `ಸಮಯ ಮುನ್ಸೂಚನೆ: +${timeOffsetHours} ಗಂಟೆಗಳು`
                    : `TIME MACHINE FORECAST: +${timeOffsetHours} HOURS`}
                </span>
              </div>
              <span className="text-cyan-300 font-mono font-bold text-xs bg-slate-950 px-3 py-1 rounded-lg border border-cyan-500/30">
                {timeOffsetHours === 0 ? "NOW (LIVE)" : `T + ${timeOffsetHours}h`}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="72"
              step="6"
              value={timeOffsetHours}
              onChange={(e) => setTimeOffsetHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-slate-700"
            />
          </div>
        </div>

        {/* Right Detail Sidebar */}
        <div className="p-6 bg-slate-100/90 dark:bg-slate-900/90 border-l border-slate-200 dark:border-cyan-500/20 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-wider">
                {language === "kn" ? "ಬಿಟ್ ಅಪಾಯ ವಿವರಣೆ" : "BEAT THREAT PROFILE"}
              </h3>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-md border font-bold ${getRiskBadge(getDynamicRisk(selectedBeat.baseRisk)).bg}`}>
                {getRiskBadge(getDynamicRisk(selectedBeat.baseRisk)).label}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{language === "kn" ? "ಸ್ಥಳ ಬಿಟ್" : "BEAT LOCATION"}</p>
                <p className="text-slate-900 dark:text-white font-black text-base">
                  {language === "kn" ? selectedBeat.nameKannada : selectedBeat.name}
                </p>
                <p className="text-cyan-600 dark:text-cyan-400 font-mono text-xs font-bold mt-0.5">{selectedBeat.id}</p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-inner">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase mb-1">{language === "kn" ? "ಮುನ್ಸೂಚನೆಯ ಅಪಾಯ ಅಂಕ" : "PREDICTED RISK SCORE"}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black font-mono text-cyan-600 dark:text-cyan-300">
                    {(getDynamicRisk(selectedBeat.baseRisk) * 100).toFixed(0)}%
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold">
                    (Baseline: {(selectedBeat.baseRisk * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">{language === "kn" ? "ಅಪಾಯಕಾರಿ ಅಂಶಗಳು" : "KEY CONTRIBUTING FACTORS"}</p>
                <div className="space-y-2 text-[11px] font-medium">
                  <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Recent 48h Two-Wheeler Theft Density (800m)</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                    <span>CCTV ANPR Surveillance Coverage: 85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-300 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono font-bold">
            <span>ST-GNN ENGINE v1.0</span>
            <span className="text-emerald-600 dark:text-emerald-400">ACCURACY: 94.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
