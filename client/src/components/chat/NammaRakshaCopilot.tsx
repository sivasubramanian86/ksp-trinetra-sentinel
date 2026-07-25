"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Image as ImageIcon, Mic, Shield, Paperclip } from "lucide-react";

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
}

export const NammaRakshaCopilot: React.FC<NammaRakshaCopilotProps> = ({ language }) => {
  const [inputQuery, setInputQuery] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState<{ type: "IMAGE" | "AUDIO"; name: string } | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "copilot",
      text:
        language === "kn"
          ? "ನಮಸ್ಕಾರ ಅಧಿಕಾರಿಯವರೇ, ನಾನು ನಮ್ಮರಕ್ಷಾ ಕಾಪ್-ಪೈಲಟ್. ಬಿಎನ್‌ಎಸ್ ೨೦೨೩ ಮತ್ತು ಕೆಎಸ್‌ಪಿ ಎಸ್‌ಒಪಿ ಮಾಹಿತಿ ಪಡೆಯಲು ಪ್ರಶ್ನಿಸಿ."
          : "Greetings Officer. I am NammaRaksha Copilot. Ask me any tactical, legal (BNS 2023), or criminal pattern queries.",
      bnsCitations: ["BNS Section 304", "DPDP Act 2023"],
      dpdpAudit: true,
    },
  ]);

  const handleSend = () => {
    if (!inputQuery.trim() && !uploadedMedia) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: inputQuery || (uploadedMedia ? `[Uploaded ${uploadedMedia.type} Evidence]` : ""),
      mediaType: uploadedMedia?.type,
      mediaPreview: uploadedMedia?.name,
    };

    const copilotReply: Message = {
      id: `c-${Date.now()}`,
      sender: "copilot",
      text:
        language === "kn"
          ? `ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ: "${inputQuery || "ಮಾಧ್ಯಮ ಸಾಕ್ಷ್ಯ"}". ಇಂದಿರಾನಗರ ಬಿಟ್ #1 ಗಸ್ತು ಹೆಚ್ಚಿಸಲು ಮತ್ತು ಬಿಎನ್‌ಎಸ್ ಸೆಕ್ಷನ್ ೩೦೪ ರ ಅಡಿಯಲ್ಲಿ ತನಿಖೆಗೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.`
          : `Tactical Briefing Generated for: "${inputQuery || "Multimodal Evidence"}". Indiranagar Beat #1 requires 2 Hoysala units. Legal SOP under BNS Section 304 applies.`,
      bnsCitations: ["BNS Section 304 (Snatching)", "KSP SOP Guideline #14"],
      dpdpAudit: true,
    };

    setMessages((prev) => [...prev, userMsg, copilotReply]);
    setInputQuery("");
    setUploadedMedia(null);
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
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Zia GraphRAG Orchestrator Engine</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-mono font-bold shadow-sm">
          ZIA RAG
        </span>
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

              <p className="font-semibold text-sm md:text-base">{msg.text}</p>

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
            onClick={() =>
              setUploadedMedia({ type: "AUDIO", name: "Voice_Dispatch_Note_04.wav" })
            }
            title="Record Voice Note"
            className="p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-300 border border-slate-300 dark:border-slate-700 transition-all hover:scale-105 shadow-md"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              language === "kn"
                ? "ನಮ್ಮರಕ್ಷಾ ಕಾಪ್-ಪೈಲಟ್‌ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಕನ್ನಡ / English)..."
                : "Ask NammaRaksha Copilot (Kannada / English)..."
            }
            className="flex-1 px-5 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-cyan-500/40 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
          />

          <button
            onClick={handleSend}
            className="p-3.5 rounded-2xl bg-cyan-600 dark:bg-cyan-400 text-white dark:text-slate-950 font-bold transition-all hover:scale-105 shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
