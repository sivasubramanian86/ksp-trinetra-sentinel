"use client";

import React, { useState } from "react";
import { Radio, Video, Mic, Compass, ShieldAlert, Cpu, Eye, Activity, CheckCircle2, Zap } from "lucide-react";

interface IotSurveillanceGridProps {
  language: "en" | "kn";
}

interface IotDevice {
  id: string;
  type: "DRONE" | "CCTV" | "ACOUSTIC" | "IMSI";
  name: string;
  nameKannada: string;
  location: string;
  status: "ACTIVE" | "ALERT" | "STANDBY";
  telemetry: string;
  batteryOrSignal: string;
}

const DEVICES: IotDevice[] = [
  {
    id: "DRONE-SKYWATCH-01",
    type: "DRONE",
    name: "SkyWatch FLIR Drone #01",
    nameKannada: "ಸ್ಕೈವಾಚ್ ಡ್ರೋನ್ ೦೧",
    location: "Indiranagar 10th Main (Alt: 120m)",
    status: "ALERT",
    telemetry: "Thermal Infrared Scan Active | Speed: 32 km/h",
    batteryOrSignal: "Battery: 84%",
  },
  {
    id: "CCTV-ANPR-GRID-44",
    type: "CCTV",
    name: "Smart City ANPR Node #44",
    nameKannada: "ಎಎನ್‌ಪಿಆರ್ ಸಿಸಿಟಿವಿ ಕ್ಯಾಮೆರಾ ೪೪",
    location: "MG Road Metro Junction",
    status: "ACTIVE",
    telemetry: "Optical Flow Density: High | Plate Scan: KA-01-EQ-1234",
    batteryOrSignal: "FPS: 60 (4K UHD)",
  },
  {
    id: "ACOUSTIC-SHOTSPOTTER-09",
    type: "ACOUSTIC",
    name: "Acoustic ShotSpotter Sensor #09",
    nameKannada: "ಧ್ವನಿ ತರಂಗ ಸಂವೇದಕ ೦೯",
    location: "Koramangala 5th Block",
    status: "ACTIVE",
    telemetry: "Acoustic Noise Floor: 45dB | Glass Break / Gunshot Monitor",
    batteryOrSignal: "Signal: 98% (5G-NR)",
  },
  {
    id: "IMSI-CATCHER-RF-03",
    type: "IMSI",
    name: "CBI Tactical IMSI Triangulator #03",
    nameKannada: "ಸಿಬಿಐ ಐಎಮ್‌ಎಸ್‌ಐ ಸಿಗ್ನಲ್ ಕ್ಯಾಚರ್ ೦೩",
    location: "Whitefield Tech Park Gate 2",
    status: "ALERT",
    telemetry: "RF Frequency: 1800MHz | Encrypted Handshake Intercept",
    batteryOrSignal: "Range: 1.2 km",
  },
];

export const IotSurveillanceGrid: React.FC<IotSurveillanceGridProps> = ({ language }) => {
  const [selectedDevice, setSelectedDevice] = useState<IotDevice>(DEVICES[0]);
  const [trafficOverride, setTrafficOverride] = useState(false);

  const getStatusBadge = (status: string) => {
    if (status === "ALERT")
      return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50 shadow-sm";
    if (status === "ACTIVE")
      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-sm";
    return "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/50 shadow-sm";
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "DRONE":
        return <Compass className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-spin-slow" />;
      case "CCTV":
        return <Video className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case "ACOUSTIC":
        return <Mic className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      default:
        return <Radio className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col glass-card rounded-3xl overflow-hidden border border-slate-300 dark:border-cyan-500/30 shadow-2xl transition-colors duration-300">
      {/* Header */}
      <div className="px-8 py-5 border-b flex items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-500/30">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
            <Radio className="w-7 h-7 text-cyan-600 dark:text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-wider text-slate-900 dark:text-white">
              {language === "kn" ? "ಐಓಟಿ ಸರ್ವೇಲನ್ಸ್ ಗ್ರಿಡ್ & ಟ್ರಾಫಿಕ್ ಕಂಟ್ರೋಲ್" : "IOT TACTICAL SURVEILLANCE & TRAFFIC GRID"}
            </h2>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Real-time Telemetry: Drones, CCTV ANPR, ShotSpotters & Green Corridor
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold font-mono">
          <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 shadow-sm">
            5G IOT MESH ONLINE
          </span>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 relative overflow-hidden min-h-[450px]">
        {/* Device Cards */}
        <div className="lg:col-span-2 p-8 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DEVICES.map((device) => {
              const isSelected = selectedDevice.id === device.id;
              return (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className={`p-6 rounded-2xl border text-left transition-all duration-300 relative glass-card ${
                    isSelected
                      ? "border-cyan-500 dark:border-cyan-400 shadow-xl bg-cyan-50 dark:bg-slate-900 scale-[1.02]"
                      : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.type)}
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {language === "kn" ? device.nameKannada : device.name}
                      </span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-md border font-mono font-extrabold ${getStatusBadge(device.status)}`}>
                      {device.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold mb-2">{device.location}</p>
                  <p className="text-xs text-cyan-700 dark:text-cyan-300 font-mono font-bold bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {device.telemetry}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Traffic Green Corridor Automation Control */}
          <div className="mt-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-cyan-500/30 flex items-center justify-between shadow-lg">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === "kn" ? "ತುರ್ತು ಹಸಿರು ಕಾರಿಡಾರ್ ಟ್ರಾಫಿಕ್ ಕಂಟ್ರೋಲ್" : "EMERGENCY GREEN CORRIDOR AUTOMATION"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Auto-clears 6 traffic signals for police chase & ambulance convoys
              </p>
            </div>

            <button
              onClick={() => setTrafficOverride(!trafficOverride)}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all border shadow-md ${
                trafficOverride
                  ? "bg-emerald-500 text-slate-950 border-emerald-400"
                  : "bg-slate-900 text-white dark:bg-slate-800 dark:text-cyan-300 border-slate-700 dark:border-cyan-500/50"
              }`}
            >
              {trafficOverride ? "CORRIDOR ACTIVE" : "ENABLE GREEN CORRIDOR"}
            </button>
          </div>
        </div>

        {/* Selected Sensor Telemetry Inspector */}
        <div className="p-8 bg-slate-100/90 dark:bg-slate-900/90 border-l border-slate-200 dark:border-cyan-500/20 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-4 mb-6">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wider">
                IOT TELEMETRY STREAM
              </h3>
              <span className={`text-xs px-3 py-1 rounded-md border font-bold ${getStatusBadge(selectedDevice.status)}`}>
                {selectedDevice.type}
              </span>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">SENSOR NAME</p>
                <p className="text-slate-900 dark:text-white font-black text-lg">{selectedDevice.name}</p>
                <p className="text-cyan-600 dark:text-cyan-400 font-mono text-xs font-bold mt-1">{selectedDevice.id}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-inner">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">LIVE TELEMETRY</p>
                <p className="text-sm font-extrabold font-mono text-cyan-600 dark:text-cyan-300">{selectedDevice.telemetry}</p>
                <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-2">{selectedDevice.batteryOrSignal}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-300 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
            KSP IOT MESH CONNECTOR v1.0
          </div>
        </div>
      </div>
    </div>
  );
};
