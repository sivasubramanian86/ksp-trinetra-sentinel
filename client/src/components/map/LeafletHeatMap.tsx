"use client";

import React, { useEffect, useRef, useState } from "react";
import { Compass, Satellite, Layers, ZoomIn, ZoomOut, AlertTriangle, ShieldCheck, Camera } from "lucide-react";

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
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);

  const [mapStyle, setMapStyle] = useState<"dark" | "satellite" | "streets">("dark");
  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    incidents: true,
    patrols: true,
  });

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Initialize Leaflet Map on client mount
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    const container = mapRef.current;

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (leafletMapRef.current) return; // Prevent double init

      // Initialize map instance centered on Bengaluru
      const map = L.map(container, {
        center: [12.9716, 77.5946],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });


      leafletMapRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);

      // Add Zoom Control at top-left
      L.control.zoom({ position: "topleft" }).addTo(map);

      // Set default base tile
      updateTileLayer(L, map, "dark");
      renderMapElements(L);
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Map Tile layer when tile mode changes
  const updateTileLayer = (L: any, map: any, style: "dark" | "satellite" | "streets") => {
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    let subdomains = "abcd";

    if (style === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      subdomains = "abc";
    } else if (style === "streets") {
      url = "https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png";
      subdomains = "abc";
    }

    L.tileLayer(url, {
      subdomains,
      maxZoom: 18,
    }).addTo(map);
  };

  // Switch base tile style
  const handleStyleChange = (style: "dark" | "satellite" | "streets") => {
    setMapStyle(style);
    if (typeof window !== "undefined" && leafletMapRef.current) {
      import("leaflet").then((L) => {
        updateTileLayer(L, leafletMapRef.current, style);
      });
    }
  };

  // Render/Refresh heatmap circles and markers
  const renderMapElements = (L: any) => {
    if (!layersGroupRef.current) return;

    layersGroupRef.current.clearLayers();

    HOTSPOTS.forEach((pt) => {
      const isSelected = pt.id === selectedBeatId;
      const dynamicRisk = Math.min(1.0, pt.risk * (1 + (timeOffsetHours / 72) * 0.35));

      // 1. Draw Heatmap Glowing Density Circles
      if (activeLayers.heatmap) {
        const radiusMeters = 800 + dynamicRisk * 1200;
        const color = dynamicRisk >= 0.75 ? "#ef4444" : dynamicRisk >= 0.5 ? "#f59e0b" : "#10b981";

        const circle = L.circle([pt.lat, pt.lng], {
          radius: radiusMeters,
          color: color,
          weight: 1.5,
          opacity: 0.8,
          fillColor: color,
          fillOpacity: 0.35,
        });

        circle.addTo(layersGroupRef.current);
      }

      // 2. Draw Interactive Hotspot Markers
      if (activeLayers.incidents) {
        const markerBg = isSelected
          ? "#ef4444"
          : dynamicRisk >= 0.75
          ? "#dc2626"
          : dynamicRisk >= 0.5
          ? "#d97706"
          : "#059669";

        const labelText = language === "kn" ? pt.nameKn : pt.name;
        const riskPct = (dynamicRisk * 100).toFixed(0);

        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              background: ${markerBg};
              color: white;
              padding: 4px 8px;
              border-radius: 20px;
              border: 2px solid white;
              font-family: monospace;
              font-weight: 800;
              font-size: 11px;
              box-shadow: 0 0 15px ${markerBg};
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              cursor: pointer;
            ">
              <span>📍 ${labelText}</span>
              <span style="background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 10px;">${riskPct}%</span>
            </div>
          `,
          iconSize: [120, 30],
          iconAnchor: [60, 15],
        });

        const marker = L.marker([pt.lat, pt.lng], { icon: customIcon });

        // Bind popup info
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; color: #0f172a;">
            <h4 style="margin: 0 0 4px 0; font-weight: 800;">${pt.name}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b;">Beat ID: ${pt.id}</p>
            <p style="margin: 0; font-size: 12px; font-weight: 700; color: ${markerBg};">
              Risk: ${riskPct}% (${pt.type})
            </p>
            <hr style="margin: 6px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
            <p style="margin: 0; font-size: 11px;">📹 Active CCTV: ${pt.cctvActive} units</p>
            <p style="margin: 0; font-size: 11px;">🚓 Patrol Unit: ${pt.patrols}</p>
          </div>
        `);

        marker.on("click", () => {
          onSelectBeat(pt.id);
        });

        marker.addTo(layersGroupRef.current);
      }
    });
  };

  // Re-render markers when time offset, selected beat, or layers change
  useEffect(() => {
    if (typeof window !== "undefined" && leafletMapRef.current) {
      import("leaflet").then((L) => {
        renderMapElements(L);
      });
    }
  }, [timeOffsetHours, selectedBeatId, activeLayers, language]);

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 flex flex-col justify-between p-2 font-sans select-none">
      {/* ── TOP FLOATING CONTROL BAR ── */}
      <div className="absolute top-4 right-4 z-[500] flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-cyan-500/30 shadow-2xl text-xs">
        <span className="font-extrabold text-cyan-300 font-mono flex items-center space-x-1">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="hidden sm:inline">LIVE LEAFLET GIS</span>
        </span>

        {/* Tile Style Toggles */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleStyleChange("dark")}
            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
              mapStyle === "dark" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            DARK MAP
          </button>
          <button
            onClick={() => handleStyleChange("satellite")}
            className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center space-x-1 ${
              mapStyle === "satellite" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Satellite className="w-3 h-3" />
            <span>SATELLITE</span>
          </button>
          <button
            onClick={() => handleStyleChange("streets")}
            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
              mapStyle === "streets" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            STREETS
          </button>
        </div>

        {/* Heatmap Layer Toggle */}
        <button
          onClick={() => toggleLayer("heatmap")}
          className={`px-2.5 py-1 rounded-lg font-bold border transition-all text-[10px] ${
            activeLayers.heatmap
              ? "bg-red-500/20 text-red-300 border-red-500/60"
              : "bg-slate-950 text-slate-500 border-slate-800"
          }`}
        >
          🔥 HEATMAP
        </button>
      </div>

      {/* ── REAL LEAFLET MAP DOM CONTAINER ── */}
      <div ref={mapRef} className="w-full h-full min-h-[440px] z-[100] rounded-xl overflow-hidden" />

      {/* ── BOTTOM MAP LEGEND & REGION OVERLAY ── */}
      <div className="absolute bottom-4 left-4 right-4 z-[500] pointer-events-none flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/30 text-xs shadow-xl">
        <div className="flex items-center space-x-3 font-mono font-bold text-slate-300 pointer-events-auto">
          <span className="text-slate-400">REGION:</span>
          <span className="text-cyan-300">BENGALURU CITY POLICE GRID</span>
          <span className="text-slate-500 hidden md:inline">| LAT: 12.9716, LON: 77.5946</span>
        </div>

        <div className="flex items-center space-x-3 text-[10px] font-mono font-bold pointer-events-auto">
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
