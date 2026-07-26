"use client";

import React, { useEffect, useState } from "react";
import { Layers, MapPin, Camera, ShieldAlert, Satellite, Compass } from "lucide-react";

interface LeafletHeatMapProps {
  language: "en" | "kn";
  timeOffsetHours: number;
  selectedBeatId: string;
  onSelectBeat: (id: string) => void;
}

interface HotspotPoint {
  id: string;
  name: string;
  nameKn: string;
  lat: number;
  lng: number;
  risk: number;
  type: "Robbery" | "Assault" | "Burglary" | "Cyber Crime" | "Vehicle Theft";
  cctvActive: number;
  patrols: string;
}

const HOTSPOTS: HotspotPoint[] = [
  { id: "BNG-INDIRANAGAR-B1", name: "Indiranagar 10th Main", nameKn: "ಇಂದಿರಾನಗರ ೧೦ನೇ ಮೈನ್", lat: 12.9784, lng: 77.6408, risk: 0.88, type: "Robbery", cctvActive: 14, patrols: "Hoysala 12" },
  { id: "BNG-KORAMANGALA-B2", name: "Koramangala 5th Block", nameKn: "ಕೋರಮಂಗಲ ೫ನೇ ಬ್ಲಾಕ್", lat: 12.9352, lng: 77.6245, risk: 0.76, type: "Vehicle Theft", cctvActive: 22, patrols: "Hoysala 08" },
  { id: "BNG-MG-ROAD-B3", name: "MG Road Metro Grid", nameKn: "ಎಂಜಿ ರಸ್ತೆ ಮೆಟ್ರೋ ಗ್ರಿಡ್", lat: 12.9756, lng: 77.6066, risk: 0.62, type: "Assault", cctvActive: 30, patrols: "Hoysala 01" },
  { id: "BNG-JAYANAGAR-B4", name: "Jayanagar 4th Block", nameKn: "ಜಯನಗರ ೪ನೇ ಬ್ಲಾಕ್", lat: 12.9250, lng: 77.5938, risk: 0.42, type: "Burglary", cctvActive: 18, patrols: "Hoysala 05" },
  { id: "BNG-WHITEFIELD-B5", name: "Whitefield Tech Park", nameKn: "ವೈಟ್‌ಫೀಲ್ಡ್ ಟೆಕ್ ಪಾರ್ಕ್", lat: 12.9698, lng: 77.7500, risk: 0.58, type: "Cyber Crime", cctvActive: 16, patrols: "Hoysala 19" },
  { id: "BNG-MAJESTIC-B6", name: "Majestic Bus Station Grid", nameKn: "ಮೆಜೆಸ್ಟಿಕ್ ಬಸ್ ತಾಣ", lat: 12.9767, lng: 77.5713, risk: 0.82, type: "Robbery", cctvActive: 25, patrols: "Hoysala 03" },
];

export const LeafletHeatMap: React.FC<LeafletHeatMapProps> = ({
  language,
  timeOffsetHours,
  selectedBeatId,
  onSelectBeat,
}) => {
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite" | "street">("dark");
  const [activeLayers, setActiveLayers] = useState({
    incidents: true,
    patrols: true,
    cctv: true,
    heatmap: true,
  });

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Convert GPS coordinates (Bengaluru bbox approx) to relative canvas coordinates
  // Lat: 12.91 -> 12.99, Lng: 77.56 -> 77.76
  const getRelativePosition = (lat: number, lng: number) => {
    const minLat = 12.9100;
    const maxLat = 12.9900;
    const minLng = 77.5500;
    const maxLng = 77.7700;

    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;

    return {
      top: `${Math.max(10, Math.min(90, y))}%`,
      left: `${Math.max(10, Math.min(90, x))}%`,
    };
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 flex flex-col justify-between p-4 font-sans select-none">
      {/* ── MAP TILE BASE BACKGROUND ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-90">
        {mapStyle === "satellite" ? (
          <div
            className="w-full h-full bg-cover bg-center filter brightness-90 contrast-125"
            style={{
              backgroundImage:
                "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3793/5879')",
            }}
          ></div>
        ) : mapStyle === "street" ? (
          <div className="w-full h-full bg-[#1b2230] bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
        ) : (
          /* Dark Cyber Vector Grid Map */
          <div className="w-full h-full bg-[#070b19] bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px]">
            {/* Simulated Road Lines */}
            <svg className="w-full h-full opacity-30 stroke-cyan-500/40 fill-none stroke-[1.5]">
              <path d="M 50,0 Q 200,200 400,100 T 800,500" />
              <path d="M 0,300 C 300,100 500,400 900,250" />
              <path d="M 200,500 L 600,0" />
              <circle cx="50%" cy="45%" r="180" className="stroke-cyan-400/20 fill-cyan-950/10 stroke-dashed" />
            </svg>
          </div>
        )}
      </div>

      {/* ── TOP MAP CONTROLS & LAYER BAR ── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-cyan-500/30 text-xs shadow-xl">
        <div className="flex items-center space-x-3">
          <span className="font-extrabold text-cyan-300 font-mono flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>GIS THREAT HEATMAP</span>
          </span>

          <div className="hidden sm:flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMapStyle("dark")}
              className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                mapStyle === "dark" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              DARK VECTOR
            </button>
            <button
              onClick={() => setMapStyle("satellite")}
              className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center space-x-1 ${
                mapStyle === "satellite" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Satellite className="w-3 h-3" />
              <span>SATELLITE</span>
            </button>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => toggleLayer("heatmap")}
            className={`px-2.5 py-1 rounded-lg font-bold border transition-all text-[11px] ${
              activeLayers.heatmap
                ? "bg-red-500/20 text-red-300 border-red-500/60"
                : "bg-slate-950 text-slate-500 border-slate-800"
            }`}
          >
            🔥 HEATMAP
          </button>
          <button
            onClick={() => toggleLayer("incidents")}
            className={`px-2.5 py-1 rounded-lg font-bold border transition-all text-[11px] ${
              activeLayers.incidents
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60"
                : "bg-slate-950 text-slate-500 border-slate-800"
            }`}
          >
            🚨 INCIDENTS
          </button>
          <button
            onClick={() => toggleLayer("patrols")}
            className={`px-2.5 py-1 rounded-lg font-bold border transition-all text-[11px] ${
              activeLayers.patrols
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60"
                : "bg-slate-950 text-slate-500 border-slate-800"
            }`}
          >
            🚓 PATROLS
          </button>
        </div>
      </div>

      {/* ── HEATMAP RADIAL OVERLAYS & HOTSPOT MARKERS ── */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-auto">
        {HOTSPOTS.map((pt) => {
          const pos = getRelativePosition(pt.lat, pt.lng);
          const isSelected = selectedBeatId === pt.id;
          const dynamicRisk = Math.min(1.0, pt.risk * (1 + (timeOffsetHours / 72) * 0.35));

          return (
            <React.Fragment key={pt.id}>
              {/* Glowing Heatmap Density Radial Aura (When Heatmap Layer Active) */}
              {activeLayers.heatmap && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-700 filter blur-xl"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width: `${Math.max(100, dynamicRisk * 220)}px`,
                    height: `${Math.max(100, dynamicRisk * 220)}px`,
                    background:
                      dynamicRisk >= 0.75
                        ? "radial-gradient(circle, rgba(239, 68, 68, 0.75) 0%, rgba(245, 158, 11, 0.45) 45%, rgba(0, 0, 0, 0) 75%)"
                        : dynamicRisk >= 0.5
                        ? "radial-gradient(circle, rgba(245, 158, 11, 0.7) 0%, rgba(234, 179, 8, 0.4) 45%, rgba(0, 0, 0, 0) 75%)"
                        : "radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(6, 182, 212, 0.3) 45%, rgba(0, 0, 0, 0) 75%)",
                  }}
                />
              )}

              {/* Interactive Pin Marker */}
              <div
                onClick={() => onSelectBeat(pt.id)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                style={{ top: pos.top, left: pos.left }}
              >
                <div
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border shadow-2xl transition-all ${
                    isSelected
                      ? "bg-red-600 text-white border-white scale-110 ring-4 ring-red-500/50"
                      : dynamicRisk >= 0.75
                      ? "bg-red-950/90 text-red-300 border-red-500/80 hover:scale-105"
                      : "bg-slate-900/90 text-cyan-300 border-cyan-500/60 hover:scale-105"
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${dynamicRisk >= 0.75 ? "text-red-400 animate-bounce" : "text-cyan-400"}`} />
                  <span className="text-[11px] font-black truncate max-w-[120px]">
                    {language === "kn" ? pt.nameKn : pt.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-black/50 px-1.5 py-0.5 rounded">
                    {(dynamicRisk * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Hover Popover Card */}
                <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-xs shadow-2xl z-30 pointer-events-none">
                  <p className="font-extrabold text-white mb-1">{pt.name}</p>
                  <p className="text-[10px] text-cyan-400 font-mono">RISK: {(dynamicRisk * 100).toFixed(1)}% | {pt.type}</p>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                    <span>📹 CCTV: {pt.cctvActive}</span>
                    <span>🚓 {pt.patrols}</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── BOTTOM MAP LEGEND & DATA OVERLAY ── */}
      <div className="relative z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/30 text-[11px] shadow-xl">
        <div className="flex items-center space-x-3 font-mono font-bold text-slate-300">
          <span className="text-slate-400">MAP AREA:</span>
          <span className="text-cyan-300">CENTRAL BENGALURU METRO</span>
        </div>

        <div className="flex items-center space-x-3 text-[10px] font-mono font-bold">
          <span className="flex items-center space-x-1 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>HIGH RISK</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>GUARDED</span>
          </span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>LOW RISK</span>
          </span>
        </div>
      </div>
    </div>
  );
};
