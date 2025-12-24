import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import VoicePanel from "./components/panels/VoicePanel";
import ExplainPanel from "./components/panels/ExplainPanel";
import CorrectionPanel from "./components/panels/CorrectionPanel";
import ChatPanel from "./components/panels/ChatPanel";

export default function AiSupportConsole() {
  const [activeMode, setActiveMode] = useState("CHAT_VOICE"); // CHAT_VOICE, EXPLAIN, CORRECTION, CHAT_TEXT
  const [selectedLang, setSelectedLang] = useState("Tiếng Việt");

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#F8F9FC] p-4 gap-4 font-sans overflow-hidden">
      {/* CỘT 1: SIDEBAR */}
      <Sidebar activeMode={activeMode} setActiveMode={setActiveMode} />

      {/* CỘT 2: KHUNG HIỂN THỊ CHÍNH */}
      <main className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
        <Header 
          activeMode={activeMode} 
          selectedLang={selectedLang} 
          setSelectedLang={setSelectedLang} 
        />

        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          {activeMode === "CHAT_VOICE" && <VoicePanel selectedLang={selectedLang} />}
          {activeMode === "EXPLAIN" && <ExplainPanel />}
          {activeMode === "CORRECTION" && <CorrectionPanel />}
          {activeMode === "CHAT_TEXT" && <ChatPanel />}
        </div>
      </main>
    </div>
  );
}