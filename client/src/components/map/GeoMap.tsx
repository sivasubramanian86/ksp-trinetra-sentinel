"use client";

import React, { useState } from "react";
import { Clock, AlertTriangle, ShieldCheck, MapPin, Zap } from "lucide-react";

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

  // Compute dynamic risk score based on time slider (+0h to +72h)
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
      <div className="px-8 py-5 border-b flex items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-500/30">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
            <Zap className="w-7 h-7 animate-pulse text-cyan-600 dark:text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-wider text-slate-900 dark:text-white">
              {language === "kn" ? "ಅಪಾಯ ವೆಕ್ಟರ್ ಟೈಮ್ ಮೆಷಿನ್ (GIS MAP)" : "THREAT VECTORS TIME MACHINE (GIS MAP)"}
            </h2>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {language === "kn" ? "ಬೆಂಗಳೂರು ಸಿಟಿ ಬಿಟ್ ಮುನ್ಸೂಚನೆ ಕಂಟ್ರೋಲ್" : "Bengaluru Metropolitan Police Beat Predictive Console"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-sm font-bold">
          <span className="text-slate-600 dark:text-slate-300 font-mono">CRIME LAYER:</span>
          <span className="px-4 py-2 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-mono shadow-sm">
            {selectedBeat.riskLayer}
          </span>
        </div>
      </div>

      {/* Main Interactive Grid & Map Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 relative overflow-hidden">
        {/* Visual Map Canvas / Beat Polygon Grid */}
        <div className="lg:col-span-2 p-8 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between relative min-h-[450px]">
          {/* Background Map Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#00f2ff_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-10 pointer-events-none"></div>

          {/* Map Status Floating Banner */}
          <div className="relative z-10 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-300 dark:border-cyan-500/30 text-sm shadow-md">
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span className="text-slate-900 dark:text-slate-100 font-bold text-base">BENGALURU CITY POLICE BEAT GRID</span>
            </div>
            <span className="text-cyan-700 dark:text-cyan-300 font-mono font-bold text-sm bg-slate-100 dark:bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-300 dark:border-cyan-500/30">
              LAT: 12.9716, LON: 77.5946
            </span>
          </div>

          {/* Interactive Beat Grid Cards */}
          <div className="relative z-10 my-auto grid grid-cols-2 md:grid-cols-3 gap-5 p-2">
            {BEATS_DATA.map((beat) => {
              const currentRisk = getDynamicRisk(beat.baseRisk);
              const badge = getRiskBadge(currentRisk);
              const isSelected = selectedBeat.id === beat.id;

              return (
                <button
                  key={beat.id}
                  onClick={() => setSelectedBeat(beat)}
                  className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                    isSelected
                      ? "bg-cyan-50 dark:bg-cyan-950/90 border-cyan-500 dark:border-cyan-400 shadow-xl scale-[1.03]"
                      : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {language === "kn" ? beat.nameKannada : beat.name}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-md border font-mono font-extrabold ${badge.bg}`}>
                      {(currentRisk * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate font-semibold">{beat.id}</p>

                  {/* Progress Bar Indicator */}
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentRisk >= 0.75
                          ? "bg-gradient-to-r from-amber-500 to-red-500"
                          : currentRisk >= 0.50
                          ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                          : "bg-gradient-to-r from-emerald-400 to-teal-400"
                      }`}
                      style={{ width: `${currentRisk * 100}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time Machine Slider Floating Controls */}
          <div className="relative z-10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-300 dark:border-cyan-500/40 shadow-xl">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center space-x-3 text-cyan-700 dark:text-cyan-300 font-extrabold text-base">
                <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-spin-slow" />
                <span>
                  {language === "kn"
                    ? `ಸಮಯ ಮುನ್ಸೂಚನೆ: +${timeOffsetHours} ಗಂಟೆಗಳು`
                    : `TIME MACHINE FORECAST: +${timeOffsetHours} HOURS`}
                </span>
              </div>
              <span className="text-cyan-800 dark:text-cyan-300 font-mono font-bold text-base bg-slate-100 dark:bg-slate-950 px-4 py-1.5 rounded-xl border border-slate-300 dark:border-cyan-500/30">
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
              className="w-full h-3 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-slate-300 dark:border-slate-700"
            />

            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono font-bold mt-3 px-1">
              <span>+0h (Now)</span>
              <span>+24h</span>
              <span>+48h</span>
              <span>+72h</span>
            </div>
          </div>
        </div>

        {/* Right Detail Sidebar */}
        <div className="p-8 bg-slate-100/90 dark:bg-slate-900/90 border-l border-slate-200 dark:border-cyan-500/20 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-4 mb-6">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wider">
                {language === "kn" ? "ಬಿಟ್ ಅಪಾಯ ವಿವರಣೆ" : "BEAT THREAT PROFILE"}
              </h3>
              <span className={`text-xs px-3 py-1 rounded-md border font-bold ${getRiskBadge(getDynamicRisk(selectedBeat.baseRisk)).bg}`}>
                {getRiskBadge(getDynamicRisk(selectedBeat.baseRisk)).label}
              </span>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{language === "kn" ? "ಸ್ಥಳ ಬಿಟ್" : "BEAT LOCATION"}</p>
                <p className="text-slate-900 dark:text-white font-black text-lg">
                  {language === "kn" ? selectedBeat.nameKannada : selectedBeat.name}
                </p>
                <p className="text-cyan-600 dark:text-cyan-400 font-mono text-sm font-bold mt-1">{selectedBeat.id}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-inner">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{language === "kn" ? "ಮುನ್ಸೂಚನೆಯ ಅಪಾಯ ಅಂಕ" : "PREDICTED RISK SCORE"}</p>
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-black font-mono text-cyan-600 dark:text-cyan-300">
                    {(getDynamicRisk(selectedBeat.baseRisk) * 100).toFixed(0)}%
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-mono font-bold">
                    (Baseline: {(selectedBeat.baseRisk * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{language === "kn" ? "ಅಪಾಯಕಾರಿ ಅಂಶಗಳು" : "KEY CONTRIBUTING FACTORS"}</p>
                <div className="space-y-2.5 text-xs font-medium">
                  <div className="flex items-center space-x-3 bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-sm">Recent 48h Two-Wheeler Theft Density (800m)</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                    <span className="text-sm">CCTV ANPR Surveillance Coverage: 85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-300 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono font-bold">
            <span>ST-GNN ENGINE v1.0</span>
            <span className="text-emerald-600 dark:text-emerald-400">ACCURACY: 94.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
