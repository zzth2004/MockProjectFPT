import { BookOpen, Volume2 } from "lucide-react";

export default function ExplainPanel({ lastAiResponse, speak }) {
  return (
    <div className="p-10 space-y-8 animate-in slide-in-from-bottom-4">
      <div className="max-w-[85%] bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] rounded-tl-none">
        <div className="flex items-center gap-3 text-[#377437] mb-4">
          <BookOpen size={20} />
          <span className="font-black uppercase tracking-widest text-sm">Giải thích chi tiết</span>
        </div>
        {lastAiResponse ? (
          <div className="space-y-4">
            <div className="prose prose-green text-gray-800 font-medium leading-relaxed">
              {lastAiResponse}
            </div>
            <button onClick={() => speak(lastAiResponse)} className="flex items-center gap-2 text-xs font-black text-[#377437] uppercase">
              <Volume2 size={14} /> Nghe giải thích
            </button>
          </div>
        ) : (
          <p className="text-gray-400 italic">Chọn một cấu trúc hoặc từ vựng để AI giải thích...</p>
        )}
      </div>
    </div>
  );
}