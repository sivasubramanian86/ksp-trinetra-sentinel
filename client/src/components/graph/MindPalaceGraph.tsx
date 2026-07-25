"use client";

import React, { useState } from "react";
import { Network, Search, Car, User, Smartphone, CreditCard, FileText } from "lucide-react";

interface MindPalaceGraphProps {
  language: "en" | "kn";
}

interface NodeItem {
  id: string;
  type: "VEHICLE" | "SUSPECT" | "DEVICE" | "ACCOUNT" | "FIR";
  label: string;
  risk: number;
}

interface EdgeItem {
  source: string;
  target: string;
  relationship: string;
}

const INITIAL_NODES: NodeItem[] = [
  { id: "KA-01-EQ-1234", type: "VEHICLE", label: "Yamaha FZ (KA-01-EQ-1234)", risk: 0.90 },
  { id: "SUSPECT-KMR", type: "SUSPECT", label: "K. M. Raju (Masked)", risk: 0.95 },
  { id: "IMEI-88997766", type: "DEVICE", label: "Device IMEI 889977...", risk: 0.80 },
  { id: "UPI-MULE-BANGALORE", type: "ACCOUNT", label: "UPI Mule ***9012", risk: 0.88 },
  { id: "FIR-2026-IND-089", type: "FIR", label: "FIR #089 Indiranagar", risk: 0.70 },
];

const INITIAL_EDGES: EdgeItem[] = [
  { source: "KA-01-EQ-1234", target: "SUSPECT-KMR", relationship: "DRIVEN_BY" },
  { source: "SUSPECT-KMR", target: "IMEI-88997766", relationship: "LAST_ACTIVE_ON" },
  { source: "IMEI-88997766", target: "UPI-MULE-BANGALORE", relationship: "TRANSFERS_TO" },
  { source: "SUSPECT-KMR", target: "FIR-2026-IND-089", relationship: "LINKED_TO" },
];

export const MindPalaceGraph: React.FC<MindPalaceGraphProps> = ({ language }) => {
  const [searchQuery, setSearchQuery] = useState("KA-01-EQ-1234");
  const [selectedNode, setSelectedNode] = useState<NodeItem>(INITIAL_NODES[0]);

  const getNodeBadge = (type: string) => {
    switch (type) {
      case "VEHICLE":
        return "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/50 shadow-sm";
      case "SUSPECT":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50 shadow-sm";
      case "DEVICE":
        return "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/50 shadow-sm";
      case "ACCOUNT":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50 shadow-sm";
      default:
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/50 shadow-sm";
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "VEHICLE":
        return <Car className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case "SUSPECT":
        return <User className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "DEVICE":
        return <Smartphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case "ACCOUNT":
        return <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col glass-card rounded-3xl overflow-hidden border border-slate-300 dark:border-cyan-500/30 shadow-2xl transition-colors duration-300">
      {/* Header */}
      <div className="px-8 py-5 border-b flex flex-wrap items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-500/30 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
            <Network className="w-7 h-7 text-cyan-600 dark:text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-wider text-slate-900 dark:text-white">
              {language === "kn" ? "ಸ್ಪೆಕ್ಟರ್ ನ್ಯೂರಲ್ ಮ್ಯಾಟ್ರಿಕ್ಸ್ (SYNDICATE GRAPH)" : "SPECTRE NEURAL MATRIX (SYNDICATE GRAPH)"}
            </h2>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {language === "kn" ? "ಅಪರಾಧ ಜಾಲ ಶೋಧಕ" : "NetworkX Crime Syndicate Traversal Engine"}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "kn" ? "ವಾಹನ / IMEI / ಖಾತೆ ಹುಡುಕಿ..." : "Search Vehicle / IMEI / Account..."}
              className="pl-12 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-cyan-500/40 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-80 shadow-inner font-mono font-medium"
            />
          </div>
        </div>
      </div>

      {/* Graph Visual Canvas & Node Details Sidebar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 relative overflow-hidden min-h-[450px]">
        {/* Interactive Graph Canvas */}
        <div className="lg:col-span-2 p-8 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between relative overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#00f2ff_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-10 pointer-events-none"></div>

          {/* Node items layout */}
          <div className="relative z-10 my-auto grid grid-cols-1 md:grid-cols-2 gap-5 p-2">
            {INITIAL_NODES.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const badgeClass = getNodeBadge(node.type);

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-6 rounded-2xl border text-left transition-all duration-300 relative glass-card ${
                    isSelected
                      ? "border-cyan-500 dark:border-cyan-400 shadow-xl bg-cyan-50 dark:bg-slate-900 scale-[1.03]"
                      : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      {getNodeIcon(node.type)}
                      <span className={`text-xs px-3 py-1 rounded-md border font-mono font-bold ${badgeClass}`}>
                        {node.type}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/30">
                      RISK: {(node.risk * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 truncate">{node.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">ID: {node.id}</p>
                </button>
              );
            })}
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-900 pt-4 mt-4 font-mono font-bold">
            <span>MULTIMODAL SYNDICATE ENGINE v1.0</span>
            <span className="text-cyan-600 dark:text-cyan-400">NODES: 5 | EDGES: 4</span>
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div className="p-8 bg-slate-100/90 dark:bg-slate-900/90 border-l border-slate-200 dark:border-cyan-500/20 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-4 mb-6">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wider">
                {language === "kn" ? "ಮಾದರಿ ವಿವರಣೆ Inspector" : "ENTITY INSPECTOR"}
              </h3>
              <span className={`text-xs px-3 py-1 rounded-md border font-bold ${getNodeBadge(selectedNode.type)}`}>
                {selectedNode.type}
              </span>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{language === "kn" ? "ಹೆಸರು" : "LABEL"}</p>
                <p className="text-slate-900 dark:text-white font-black text-lg">{selectedNode.label}</p>
                <p className="text-cyan-600 dark:text-cyan-400 font-mono text-sm font-bold mt-1">{selectedNode.id}</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 shadow-inner">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">SYNDICATE RISK SCORE</p>
                <span className="text-4xl font-black font-mono text-red-600 dark:text-red-400">
                  {(selectedNode.risk * 100).toFixed(0)}%
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">LINKED CONNECTIONS</p>
                <div className="space-y-2.5 font-mono text-xs font-semibold">
                  {INITIAL_EDGES.filter(
                    (e) => e.source === selectedNode.id || e.target === selectedNode.id
                  ).map((edge, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex justify-between items-center shadow-sm">
                      <span className="font-bold">{edge.relationship}</span>
                      <span className="text-cyan-600 dark:text-cyan-300 font-extrabold">{edge.source === selectedNode.id ? edge.target : edge.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-300 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
            NETWORKX GRAPH TRACER
          </div>
        </div>
      </div>
    </div>
  );
};
