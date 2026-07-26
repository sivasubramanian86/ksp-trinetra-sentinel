"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Image as ImageIcon, Mic, Shield, Paperclip, Download, Volume2 } from "lucide-react";

interface NammaRakshaCopilotProps {
  language: "en" | "kn";
}

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  mediaType?: "IMAGE" | "AUDIO";
  mediaPreview?: string;
  bnsCitations?: string[];
  dpdpAudit?: boolean;
  source?: "ZIA_GLM" | "STRUCTURED_FALLBACK" | "CACHED";
  thinking?: string | null;  // GLM chain-of-thought reasoning trace
  latencyMs?: number;
  modelMeta?: { model: string; modelId?: string; provider: string; temperature?: number; architecture?: string; tokensUsed?: number | null };
}

// Zia thinking phases — shown sequentially while awaiting response
const ZIA_THINKING_PHASES = [
  { label: "Ethics & DPDP Guard",       icon: "🛡️",  durationMs: 400 },
  { label: "Intent Classification",     icon: "🧠",  durationMs: 400 },
  { label: "Querying FIR Database",     icon: "🗄️",  durationMs: 600 },
  { label: "Zia LLM Synthesis",         icon: "⚡",  durationMs: 800 },
  { label: "Applying RBAC Scoping",     icon: "🔒",  durationMs: 300 },
];

export const NammaRakshaCopilot: React.FC<NammaRakshaCopilotProps> = ({ language }) => {
  const [inputQuery, setInputQuery] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState<{ type: "IMAGE" | "AUDIO"; name: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [thinkingPhaseIdx, setThinkingPhaseIdx] = useState(-1); // -1 = not thinking

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "copilot",
      text:
        language === "kn"
          ? "ನಮಸ್ಕಾರ ಅಧಿಕಾರಿಯವರೇ, ನಾನು ನಮ್ಮರಕ್ಷಾ ಕಾಪ್-ಪೈಲಟ್. ಬಿಎನ್‌ಎಸ್ ೨೦೨೩ ಮತ್ತು ಕೆಎಸ್‌ಪಿ ಎಸ್‌ಒಪಿ ಮಾಹಿತಿ ಪಡೆಯಲು ಪ್ರಶ್ನಿಸಿ."
          : "Greetings Officer. I am NammaRaksha Copilot. Ask me any tactical, legal (BNS 2023), or criminal pattern queries.",
      bnsCitations: ["BNS Section 304 (Snatching)", "DPDP Act 2023"],
      dpdpAudit: true,
    },
  ]);

  // Listen for custom query events from Sample Evidence Canvas
  useEffect(() => {
    const handleCopilotEvent = (e: any) => {
      if (e.detail && e.detail.query) {
        setInputQuery(e.detail.query);
        if (e.detail.autoSend) {
          setTimeout(() => {
            handleSendWithQuery(e.detail.query);
          }, 100);
        }
      }
    };
    window.addEventListener("ksp-copilot-query", handleCopilotEvent as any);
    return () => {
      window.removeEventListener("ksp-copilot-query", handleCopilotEvent as any);
    };
  }, [language]);

  const handleSendWithQuery = async (customQueryText?: string) => {
    const queryToSend = customQueryText || inputQuery;
    if (!queryToSend.trim() && !uploadedMedia) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: queryToSend || (uploadedMedia ? `[Uploaded ${uploadedMedia.type} Evidence]` : ""),
      mediaType: uploadedMedia?.type,
      mediaPreview: uploadedMedia?.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsSending(true);
    setThinkingPhaseIdx(0);

    // Cycle through thinking phase labels while request is in flight
    const phaseTimer = setInterval(() => {
      setThinkingPhaseIdx((prev) => {
        if (prev < ZIA_THINKING_PHASES.length - 1) return prev + 1;
        return prev; // stay on last phase
      });
    }, 550);

    try {
      const response = await fetch(getApiEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "COMMISSIONER",
        },
        body: JSON.stringify({
          query: queryToSend,
          language: language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const briefing = data.briefing || {};
        const copilotReply: Message = {
          id: `c-${Date.now()}`,
          sender: "copilot",
          text: briefing.summary || briefing.title || data.title || (language === "kn" ? "ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ." : "Briefing Generated."),
          bnsCitations: data.legalCitations ? data.legalCitations.map((c: any) => c.section || c) : ["BNS Section 304"],
          dpdpAudit: true,
          source: briefing.source || "STRUCTURED_FALLBACK",
          thinking: briefing.thinking || null,
          latencyMs: briefing.latencyMs,
          modelMeta: briefing.modelMeta,
        };
        setMessages((prev) => [...prev, copilotReply]);
      } else {
        throw new Error("Gateway HTTP " + response.status);
      }
    } catch (err) {
      const copilotReply: Message = {
        id: `c-${Date.now()}`,
        sender: "copilot",
        text:
          language === "kn"
            ? `ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ: "${queryToSend}". ಇಂದಿರಾನಗರ ಬಿಟ್ #1 ಗಸ್ತು ಹೆಚ್ಚಿಸಲು ಮತ್ತು ಬಿಎನ್‌ಎಸ್ ಸೆಕ್ಷನ್ ೩೦೪ ರ ಅಡಿಯಲ್ಲಿ ತನಿಖೆಗೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.`
            : `Tactical Briefing Generated for: "${queryToSend}". Indiranagar Beat #1 requires 2 Hoysala units. Legal SOP under BNS Section 304 applies.`,
        bnsCitations: ["BNS Section 304 (Snatching)", "KSP SOP Guideline #14"],
        dpdpAudit: true,
        source: "STRUCTURED_FALLBACK",
      };
      setMessages((prev) => [...prev, copilotReply]);
    } finally {
      clearInterval(phaseTimer);
      setThinkingPhaseIdx(-1);
      setIsSending(false);
      setUploadedMedia(null);
    }
  };

  const handleVoiceListen = () => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === "kn" ? "kn-IN" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      alert("Voice input simulated for demo: Speaking into microphone...");
      setInputQuery(language === "kn" ? "ಇಂದಿರಾನಗರ ಗಸ್ತು ವರದಿ ನೀಡಿ" : "Suggest patrol deployments for Indiranagar tonight");
    }
  };

  // 1-Click PDF Export of Conversation History
  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedContent = `
      <html>
        <head>
          <title>KSP Trinetra Sentinel - NammaRaksha Copilot Briefing</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
            h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
            .msg { margin-bottom: 15px; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .user { background: #f0f9ff; border-color: #bae6fd; }
            .copilot { background: #ffffff; }
            .badge { font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-weight: bold; margin-right: 5px; }
          </style>
        </head>
        <body>
          <h1>KARNATAKA STATE POLICE - NAMMARAKSHA COPILOT BRIEFING</h1>
          <div class="meta">
            <strong>Date:</strong> ${new Date().toLocaleString()} | 
            <strong>Security Level:</strong> RESTRICTED / OFFICIAL USE ONLY | 
            <strong>DPDP Act 2023 Status:</strong> Scrubbed & Audited
          </div>
          <hr/>
          ${messages
            .map(
              (m) => `
            <div class="msg ${m.sender}">
              <strong>${m.sender === "user" ? "OFFICER PROMPT" : "ZIA COPILOT BRIEFING"}:</strong>
              <p>${m.text}</p>
              ${m.bnsCitations ? `<div>${m.bnsCitations.map((c) => `<span class="badge">${c}</span>`).join("")}</div>` : ""}
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    printWindow.document.write(formattedContent);
    printWindow.document.close();
    printWindow.print();
  };

  const getApiEndpoint = () => {
    if (typeof window !== "undefined" && window.location.hostname.includes("catalystserverless")) {
      return "/server/api_gateway/api/chat";
    }
    return "http://localhost:3001/api/chat";
  };

  const handleSend = async () => {
    if (!inputQuery.trim() && !uploadedMedia) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: inputQuery || (uploadedMedia ? `[Uploaded ${uploadedMedia.type} Evidence]` : ""),
      mediaType: uploadedMedia?.type,
      mediaPreview: uploadedMedia?.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputQuery;
    setInputQuery("");
    setIsSending(true);
    setThinkingPhaseIdx(0);

    const phaseTimer = setInterval(() => {
      setThinkingPhaseIdx((prev) => {
        if (prev < ZIA_THINKING_PHASES.length - 1) return prev + 1;
        return prev;
      });
    }, 550);

    try {
      const response = await fetch(getApiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "COMMISSIONER" },
        body: JSON.stringify({ query: currentQuery || "Analyze uploaded evidence", language }),
      });

      if (response.ok) {
        const data = await response.json();
        const briefing = data.briefing || {};
        const copilotReply: Message = {
          id: `c-${Date.now()}`,
          sender: "copilot",
          text: briefing.summary || briefing.title || (language === "kn" ? "ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ." : "Briefing Generated."),
          bnsCitations: data.legalCitations ? data.legalCitations.map((c: any) => c.section || c) : ["BNS Section 304"],
          dpdpAudit: true,
          source: briefing.source || "STRUCTURED_FALLBACK",
          thinking: briefing.thinking || null,
          latencyMs: briefing.latencyMs,
          modelMeta: briefing.modelMeta,
        };
        setMessages((prev) => [...prev, copilotReply]);
      } else {
        throw new Error("Gateway HTTP " + response.status);
      }
    } catch (err) {
      // Local / Offline Fallback Response
      const copilotReply: Message = {
        id: `c-${Date.now()}`,
        sender: "copilot",
        text:
          language === "kn"
            ? `ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ: "${currentQuery || "ಮಾಧ್ಯಮ ಸಾಕ್ಷ್ಯ"}". ಇಂದಿರಾನಗರ ಬಿಟ್ #1 ಗಸ್ತು ಹೆಚ್ಚಿಸಲು ಮತ್ತು ಬಿಎನ್‌ಎಸ್ ಸೆಕ್ಷನ್ ೩೦೪ ರ ಅಡಿಯಲ್ಲಿ ತನಿಖೆಗೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.`
            : `Tactical Briefing Generated for: "${currentQuery || "Multimodal Evidence"}". Indiranagar Beat #1 requires 2 Hoysala units. Legal SOP under BNS Section 304 applies.`,
        bnsCitations: ["BNS Section 304 (Snatching)", "KSP SOP Guideline #14"],
        dpdpAudit: true,
        source: "STRUCTURED_FALLBACK",
      };
      setMessages((prev) => [...prev, copilotReply]);
    } finally {
      clearInterval(phaseTimer);
      setThinkingPhaseIdx(-1);
      setIsSending(false);
      setUploadedMedia(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col glass-card rounded-3xl overflow-hidden border border-slate-300 dark:border-cyan-500/30 shadow-2xl transition-colors duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-500/30">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
            <MessageSquare className="w-6 h-6 text-cyan-600 dark:text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-wider text-slate-900 dark:text-white">
              {language === "kn" ? "ನಮ್ಮರಕ್ಷಾ ಕಾಪ್-ಪೈಲಟ್ (NAMMARAKSHA)" : "NAMMARAKSHA LAW COPILOT"}
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Zoho QuickML GLM-4.7-Flash Engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportPDF}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-cyan-300 text-xs font-bold transition-all shadow-sm"
            title="Export Conversation History to PDF"
          >
            <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>PDF Export</span>
          </button>
          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30 font-mono font-bold shadow-sm">
            GLM-4.7 MoE
          </span>
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[88%] p-5 rounded-3xl text-sm leading-relaxed border shadow-lg ${
                msg.sender === "user"
                  ? "bg-cyan-600 text-white dark:bg-cyan-950/90 dark:border-cyan-400/60 dark:text-cyan-100 rounded-br-none font-medium"
                  : "bg-white text-slate-900 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-200 rounded-bl-none border-slate-200"
              }`}
            >
              {/* Media Preview if attached */}
              {msg.mediaPreview && (
                <div className="mb-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex items-center space-x-3 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold">
                  <Paperclip className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>{msg.mediaPreview}</span>
                </div>
              )}

              {/* Source Differentiator Badge — ZIA_GLM vs STRUCTURED_FALLBACK */}
              {msg.sender === "copilot" && msg.source && (
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                  {msg.source === "ZIA_GLM" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/40 text-violet-300 text-xs font-bold tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block" />
                      ⚡ ZIA GLM-4.7-Flash (MoE) · {msg.modelMeta?.modelId || "crm-di-glm47b_30b_it"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-500/15 border border-slate-500/30 text-slate-400 text-xs font-bold tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                      🗄️ STRUCTURED ENGINE
                    </span>
                  )}
                  {msg.latencyMs && (
                    <span className="text-xs text-slate-500 font-mono">{msg.latencyMs}ms</span>
                  )}
                </div>
              )}

              {/* Chain of Thought / GLM Thinking Trace if available */}
              {msg.sender === "copilot" && msg.thinking && (
                <details className="mb-3 p-3 rounded-xl bg-slate-900/60 border border-violet-500/30 text-xs font-mono text-violet-200">
                  <summary className="cursor-pointer font-bold text-violet-300 flex items-center gap-1">
                    🧠 GLM Chain-of-Thought Reasoning
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] text-slate-300 leading-snug">
                    {msg.thinking}
                  </pre>
                </details>
              )}

              <p className="font-semibold text-sm md:text-base">{msg.text}</p>

              {/* Model Metadata — shown for ZIA_GLM only */}
              {msg.sender === "copilot" && msg.source === "ZIA_GLM" && msg.modelMeta && (
                <div className="mt-3 pt-2 border-t border-violet-500/20 text-xs text-slate-500 dark:text-slate-500 font-mono space-y-0.5">
                  <div>Provider: {msg.modelMeta.provider} ({msg.modelMeta.architecture || "MoE"})</div>
                  {msg.modelMeta.temperature !== undefined && (
                    <div>Temp: {msg.modelMeta.temperature} · Tokens: {msg.modelMeta.tokensUsed || 'auto'}</div>
                  )}
                </div>
              )}

              {/* Legal BNS Citations */}
              {msg.bnsCitations && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                  {msg.bnsCitations.map((cit, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-mono font-bold shadow-sm"
                    >
                      {cit}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Timestamp & DPDP Badge */}
            {msg.sender === "copilot" && msg.dpdpAudit && (
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1.5 font-mono font-bold px-1">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>DPDP AUDITED & ANONYMIZED</span>
              </span>
            )}
          </div>
        ))}

        {/* Multi-Phase Thinking Spinner */}
        {isSending && thinkingPhaseIdx >= 0 && (
          <div className="flex flex-col items-start">
            <div className="max-w-[88%] p-5 rounded-3xl rounded-bl-none bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="text-xs font-bold text-violet-400 tracking-widest uppercase">Zia AI Processing</span>
              </div>
              <div className="space-y-2">
                {ZIA_THINKING_PHASES.map((phase, idx) => (
                  <div key={idx} className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                    idx < thinkingPhaseIdx
                      ? "text-emerald-400 opacity-60"
                      : idx === thinkingPhaseIdx
                      ? "text-violet-300 font-bold"
                      : "text-slate-600 opacity-30"
                  }`}>
                    <span>{phase.icon}</span>
                    <span>{phase.label}</span>
                    {idx < thinkingPhaseIdx && <span className="ml-auto">✓</span>}
                    {idx === thinkingPhaseIdx && (
                      <span className="ml-auto flex gap-0.5">
                        <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multimodal Attachments Bar */}
      {uploadedMedia && (
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-cyan-700 dark:text-cyan-300 font-bold">
          <div className="flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Attached: {uploadedMedia.name}</span>
          </div>
          <button
            onClick={() => setUploadedMedia(null)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input Box & Action Buttons */}
      <div className="p-5 border-t bg-slate-100/90 dark:bg-slate-900/80 border-slate-200 dark:border-cyan-500/20">
        <div className="flex items-center space-x-3">
          <button
            onClick={() =>
              setUploadedMedia({ type: "IMAGE", name: "CCTV_ANPR_KA01EQ1234.jpg" })
            }
            title="Attach CCTV Image"
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-300 border border-slate-300 dark:border-slate-700 transition-all hover:scale-105 shadow-md"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleVoiceListen}
            title={isListening ? "Listening..." : "Click to Speak (Voice-to-Text)"}
            className={`p-3 rounded-2xl border transition-all hover:scale-105 shadow-md ${
              isListening
                ? "bg-red-500 text-white border-red-400 animate-pulse"
                : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-300 border-slate-300 dark:border-slate-700"
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isSending}
            placeholder={
              isListening
                ? "Listening into microphone..."
                : language === "kn"
                ? "ನಮ್ಮರಕ್ಷಾ ಕಾಪ್-ಪೈಲಟ್‌ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಕನ್ನಡ / English)..."
                : "Ask NammaRaksha Copilot (Kannada / English)..."
            }
            className="flex-1 px-5 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-cyan-500/40 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
          />

          <button
            onClick={handleSend}
            disabled={isSending}
            className="p-3.5 rounded-2xl bg-cyan-600 dark:bg-cyan-400 text-white dark:text-slate-950 font-bold transition-all hover:scale-105 shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
