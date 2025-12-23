import React from "react";
import { Sparkles } from "lucide-react";

// Nhận vào activeMode (VD: "CHAT") và label (VD: "Nói chuyện với AI")
export const ModeHeader = ({ activeMode, label }) => {
  return (
    <div className="px-10 py-6 border-b border-gray-50 flex items-center gap-4 bg-white/50 backdrop-blur-sm z-10 sticky top-0">
      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shadow-sm animate-pulse-slow">
         <Sparkles className="text-[#377437]" size={24} />
      </div>
      <div>
        <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight animate-in fade-in slide-in-from-left-2">
          {label}
        </h3>
        <p className="text-xs font-bold text-green-600 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
          AI Mode: {activeMode}
        </p>
      </div>
    </div>
  );
};