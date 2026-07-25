"use client";

import React, { useState } from "react";
import { Camera, FileText, Barcode, ShieldAlert, Sparkles, Send, CheckCircle2, Eye, Cpu, Zap, Car, Landmark } from "lucide-react";
import { SAMPLE_IMAGES_DATA } from "./sampleImagesData";

interface SampleEvidenceCanvasProps {
  language: "en" | "kn";
}

interface EvidenceItem {
  id: string;
  filename: string;
  title: string;
  titleKn: string;
  category: string;
  ziaService: string;
  imageSrc: string;
  stratusBucketUrl: string;
  extractedMeta: {
    ocrText?: string;
    barcodeValue?: string;
    confidence: string;
    moderationStatus: string;
    bnsSections: string[];
  };
  sampleCopilotQuery: string;
  sampleCopilotQueryKn: string;
}

export const SampleEvidenceCanvas: React.FC<SampleEvidenceCanvasProps> = ({ language }) => {
  const samples: EvidenceItem[] = [
    {
      id: "ev-1",
      filename: "ocr_test_plate.png",
      title: "CCTV License Plate ANPR",
      titleKn: "ಸಿಎಸಿಟಿವಿ ವಾಹನ ನಂಬರ್ ಪ್ಲೇಟ್ ಒಸಿಆರ್",
      category: "Traffic & Highway Surveillance",
      ziaService: "Zia OCR + Image Object Detection",
      imageSrc: "./sample_images/ocr_test_plate.png",
      stratusBucketUrl: "https://ksp-forensic-evidence-development.zohostratus.in/ocr_test_plate.png",
      extractedMeta: {
        ocrText: "KA-01-EQ-1234",
        confidence: "98.4%",
        moderationStatus: "PASSED (No Policy Violation)",
        bnsSections: ["BNS Section 303 (Theft)", "KSP SOP #14"],
      },
      sampleCopilotQuery: "Trace syndicate network links for vehicle KA-01-EQ-1234 detected in Indiranagar ANPR feed",
      sampleCopilotQueryKn: "ಇಂದಿರಾನಗರದ ಸಿಎಸಿಟಿವಿಯಲ್ಲಿ ಪತ್ತೆಯಾದ KA-01-EQ-1234 ವಾಹನದ ಲಿಂಕ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    },
    {
      id: "ev-2",
      filename: "document_test.png",
      title: "FIR Crime Report Document",
      titleKn: "ಎಫ್‌ಐಆರ್ ಕಾನೂನು ದಾಖಲೆ ಒಸಿಆರ್",
      category: "Legal & Police Station Record",
      ziaService: "Zia Optical Character Recognition (OCR)",
      imageSrc: "./sample_images/document_test.png",
      stratusBucketUrl: "https://ksp-forensic-evidence-development.zohostratus.in/document_test.png",
      extractedMeta: {
        ocrText: "KARNATAKA STATE POLICE - INDIRANAGAR PS - FIR NO 1044/2026 - OFFENCE UNDER BNS SECTION 303",
        confidence: "99.1%",
        moderationStatus: "PASSED (Official Document)",
        bnsSections: ["BNS Section 303 (Snatching / Theft)", "BNS Section 304"],
      },
      sampleCopilotQuery: "Summarize FIR 1044/2026 for Indiranagar PS and outline mandatory BNS legal charge sheet requirements",
      sampleCopilotQueryKn: "ಇಂದಿರಾನಗರ ಎಫ್‌ಐಆರ್ 1044/2026 ಸಾರಾಂಶ ನೀಡ ಸೂಕ್ತ ಬಿಎನ್‌ಎಸ್ ವಿಭಾಗಗಳನ್ನು ಸೂಚಿಸಿ",
    },
    {
      id: "ev-3",
      filename: "barcode_test.png",
      title: "Seized Property Barcode Tag",
      titleKn: "ವಶಪಡಿಸಿಕೊಂಡ ವಸ್ತು ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನರ್",
      category: "Forensic Chain-of-Custody",
      ziaService: "Zia Barcode Scanner (CODE-128)",
      imageSrc: "./sample_images/barcode_test.png",
      stratusBucketUrl: "https://ksp-forensic-evidence-development.zohostratus.in/barcode_test.png",
      extractedMeta: {
        barcodeValue: "8901234567890 (Evidence Locker #4)",
        confidence: "100%",
        moderationStatus: "VERIFIED",
        bnsSections: ["Evidence Act Sec 45", "DPDP Audit #9102"],
      },
      sampleCopilotQuery: "Verify chain-of-custody for seized evidence item 8901234567890 in forensic database",
      sampleCopilotQueryKn: "ಸಾಕ್ಷ್ಯ ಬಾರ್‌ಕೋಡ್ 8901234567890 ವಸ್ತುವಿನ ಫೋರೆನ್ಸಿಕ್ ಹಂತಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    },
    {
      id: "ev-4",
      filename: "crime_scene_test.png",
      title: "Forensic Crime Scene & Ballistics",
      titleKn: "ಅಪರಾಧ ಸ್ಥಳ ಬ್ಯಾಲಿಸ್ಟಿಕ್ಸ್ ಫೋರೆನ್ಸಿಕ್",
      category: "Ballistic Shell Casing & Crime Scene Marker",
      ziaService: "Zia Multimodal & Striation Matcher",
      imageSrc: "./sample_images/crime_scene_test.png",
      stratusBucketUrl: "https://ksp-forensic-evidence-development.zohostratus.in/crime_scene_test.png",
      extractedMeta: {
        ocrText: "EVIDENCE MARKER #7 - 9mm Brass Casing - Striation Match 94.2%",
        confidence: "94.2%",
        moderationStatus: "AUDITED (GSR Spectrum Checked)",
        bnsSections: ["Arms Act Sec 25", "BNS Section 103 (Homicide)"],
      },
      sampleCopilotQuery: "Run forensic dissection on Evidence Marker #7 shell casing for Indiranagar 100ft crime scene",
      sampleCopilotQueryKn: "ಇಂದಿರಾನಗರ ಅಪರಾಧ ಸ್ಥಳದ ಸಾಕ್ಷ್ಯ #7 ಗುಂಡಿನ ಕವಚದ ಫೋರೆನ್ಸಿಕ್ ವಿಶ್ಲೇಷಣೆ ನಡೆಸಿ",
    },
    {
      id: "ev-5",
      filename: "traffic_jump_test.png",
      title: "Traffic Signal Jump Violation",
      titleKn: "ಟ್ರಾಫಿಕ್ ಸಿಗ್ನಲ್ ಉಲ್ಲಂಘನೆ ಮತ್ತು ವೇಗ ಉಲ್ಲಂಘನೆ",
      category: "Reckless Driving & ANPR Bounding Box",
      ziaService: "Zia Object Detector & Speed Estimator",
      imageSrc: "./sample_images/traffic_jump_test.png",
      stratusBucketUrl: "https://ksp-forensic-evidence-development.zohostratus.in/traffic_jump_test.png",
      extractedMeta: {
        ocrText: "Vehicle KA-05-MB-8899 | Speed: 68 km/h | Red Light Jump Violation",
        confidence: "97.8%",
        moderationStatus: "VERIFIED (MG Road CCTV)",
        bnsSections: ["BNS Section 281 (Rash Driving)", "MV Act Sec 184"],
      },
      sampleCopilotQuery: "Issue e-Challan and review repeat traffic violation history for vehicle KA-05-MB-8899",
      sampleCopilotQueryKn: "KA-05-MB-8899 ವಾಹನದ ಟ್ರಾಫಿಕ್ ಸಿಗ್ನಲ್ ಉಲ್ಲಂಘನೆ ಚಲನ್ ಪರಿಶೀಲಿಸಿ",
    },
    {
      id: "ev-6",
      filename: "civil_crime_test.png",
      title: "Civil Crime & Forged Land Deed",
      titleKn: "ಸಿವಿಲ್ ಅಪರಾಧ ಮತ್ತು ನಕಲಿ ಭೂ ದಾಖಲೆ ಜಿಯಾ ಒಸಿಆರ್",
      category: "Property Encroachment & Signature Audit",
      ziaService: "Zia Document Audit & Forgery Analyzer",
      imageSrc: "./sample_images/civil_crime_test.png",
      stratusBucketUrl: "https://ksp-forensic-evidence-development.zohostratus.in/civil_crime_test.png",
      extractedMeta: {
        ocrText: "SURVEY NO 42/1 INDIRANAGAR - Forged Stamp Signature Match 42%",
        confidence: "91.5%",
        moderationStatus: "ALERT (Forgery Detected)",
        bnsSections: ["BNS Section 318 (Cheating)", "BNS Section 336 (Forgery)"],
      },
      sampleCopilotQuery: "Analyze survey 42/1 land document forgery report and outline injunction procedures under BNS Section 318",
      sampleCopilotQueryKn: "ಸರ್ವೇ 42/1 ನಕಲಿ ಭೂ ದಾಖಲೆ ವರದಿ ಪರಿಶೀಲಿಸಿ ಬಿಎನ್‌ಎಸ್ ೩೧೮ ಅಡಿಯಲ್ಲಿ ಕ್ರಮ ಸೂಚಿಸಿ",
    },
  ];

  const [selectedSample, setSelectedSample] = useState<EvidenceItem>(samples[0]);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleAskCopilot = (query: string) => {
    window.dispatchEvent(
      new CustomEvent("ksp-copilot-query", {
        detail: { query, autoSend: true },
      })
    );
  };

  const handleCopyStratusUrl = () => {
    navigator.clipboard.writeText(selectedSample.stratusBucketUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Get image src with base64 data fallback to prevent any 404
  const displayImageSrc = SAMPLE_IMAGES_DATA[selectedSample.filename] || selectedSample.imageSrc;

  return (
    <div className="w-full glass-card rounded-3xl p-6 border border-slate-300 dark:border-cyan-500/30 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-6 h-6 text-cyan-600 dark:text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-wide">
              {language === "kn" ? "ಝಿಯಾ ಎಐ ಮಲ್ಟಿಮೊಡಲ್ ಸಾಕ್ಷ್ಯ ಕ್ಯಾನ್ವಾಸ್" : "ZIA AI MULTIMODAL EVIDENCE CANVAS"}
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Interactive Demo Evidence Staged in Zoho Catalyst Stratus FileStore (6 Crime Categories)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-mono font-bold">
            ZOHO STRATUS: ksp-forensic-evidence
          </span>
        </div>
      </div>

      {/* Grid: Left Sample Selector, Right Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Sample Cards */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-2">
            {language === "kn" ? "ಸಾಕ್ಷ್ಯ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ (೬ ಮಾದರಿಗಳು)" : "Select Evidence Sample (6 Categories)"}
          </h3>

          {samples.map((item) => {
            const isSelected = selectedSample.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedSample(item)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start space-x-3 shadow-sm ${
                  isSelected
                    ? "bg-cyan-600 text-white dark:bg-cyan-950/90 dark:border-cyan-400/80 dark:text-cyan-100 ring-2 ring-cyan-500"
                    : "bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-cyan-400"
                }`}
              >
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shrink-0">
                  {item.id === "ev-1" && <Camera className="w-4 h-4" />}
                  {item.id === "ev-2" && <FileText className="w-4 h-4" />}
                  {item.id === "ev-3" && <Barcode className="w-4 h-4" />}
                  {item.id === "ev-4" && <ShieldAlert className="w-4 h-4 text-red-500" />}
                  {item.id === "ev-5" && <Car className="w-4 h-4 text-amber-500" />}
                  {item.id === "ev-6" && <Landmark className="w-4 h-4 text-blue-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-cyan-300">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">
                      {item.ziaService.split(" ")[0]}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold mt-1 truncate">
                    {language === "kn" ? item.titleKn : item.title}
                  </h4>
                  <p className="text-[11px] opacity-80 truncate mt-0.5">{item.category}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Canvas Viewer & Zia Telemetry */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Main Visual Canvas Area */}
          <div className="relative w-full h-[280px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner group">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

            {/* Display Sample Image (with base64 fallback) */}
            <img
              src={displayImageSrc}
              alt={selectedSample.title}
              className="max-h-[230px] max-w-[90%] object-contain rounded-xl border border-cyan-500/40 shadow-2xl relative z-10 transition-transform duration-300 group-hover:scale-105"
            />

            {/* Bounding Box Annotation Overlay */}
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 flex items-center space-x-2">
              <Eye className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                Zia Vision Overlay Active
              </span>
            </div>

            <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/40 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-300">
                Confidence: {selectedSample.extractedMeta.confidence}
              </span>
            </div>
          </div>

          {/* Zia Extraction Telemetry & Stratus Link */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                <Cpu className="w-4 h-4" />
                <span>ZIA SERVICE: {selectedSample.ziaService}</span>
              </div>
              <button
                onClick={handleCopyStratusUrl}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold transition-all"
              >
                {copiedUrl ? "✓ Stratus URL Copied" : "Copy Stratus Bucket URL"}
              </button>
            </div>

            {/* Extracted Content Display */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block mb-1">
                Zia Extracted Telemetry / OCR Result:
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-cyan-200 break-words">
                {selectedSample.extractedMeta.ocrText || selectedSample.extractedMeta.barcodeValue}
              </p>
            </div>

            {/* BNS Citations */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Legal Citations:</span>
              {selectedSample.extractedMeta.bnsSections.map((sec, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-mono font-bold"
                >
                  {sec}
                </span>
              ))}
            </div>

            {/* Ask Copilot One-Click Button */}
            <div className="pt-2">
              <button
                onClick={() =>
                  handleAskCopilot(
                    language === "kn"
                      ? selectedSample.sampleCopilotQueryKn
                      : selectedSample.sampleCopilotQuery
                  )
                }
                className="w-full py-3 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center space-x-2 shadow-lg hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {language === "kn"
                    ? "ನಮ್ಮರಕ್ಷಾ ಕಾಪ್-ಪೈಲಟ್‌ಗೆ ಈ ಸಾಕ್ಷ್ಯ ರವಾನಿಸಿ"
                    : "Ask NammaRaksha Copilot About This Evidence"}
                </span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
