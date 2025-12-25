
import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, BookOpen, BarChart3, Edit3 } from 'lucide-react';

const WritingEvaluationView = ({ result }) => {
  if (!result) return null;

  const {
    overallScore, grade, estimatedLevel, wordCount,
    correctedText, feedback, scores,
    strengths, weaknesses, suggestions
  } = result;

  // Helper để vẽ thanh tiến trình (Progress Bar)
  const StatBar = ({ label, value, colorClass }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1 items-end">
        <span className="text-xs font-black uppercase text-gray-500 tracking-wider">{label}</span>
        <span className={`text-sm font-black ${colorClass}`}>{value}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${colorClass.replace('text-', 'bg-')}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto p-4">

      {/* SECTION 1: HEADER & OVERALL SCORE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase mb-2">Kết quả phân tích</h2>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Level: {estimatedLevel}</span>
              <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{wordCount} Từ</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-6xl font-black text-[#377437] leading-none">{overallScore}</div>
            <div className="text-sm font-bold text-gray-400 uppercase mt-1">Overall Score</div>
          </div>
        </div>

        <div className="bg-[#377437] p-8 rounded-[2.5rem] shadow-lg flex flex-col items-center justify-center text-white">
          <span className="text-sm font-black uppercase tracking-[0.3em] opacity-80">Grade</span>
          <span className="text-7xl font-black">{grade}</span>
        </div>
      </div>

      {/* SECTION 2: CORRECTED TEXT */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-gray-800">
          <Edit3 size={20} />
          <h3 className="text-xl font-black uppercase tracking-tight">Văn bản đã chỉnh sửa</h3>
        </div>
        <div className="p-6 bg-green-50/30 rounded-2xl border border-green-50 text-gray-700 leading-relaxed font-medium italic">
          "{correctedText}"
        </div>
        <p className="mt-6 text-gray-500 text-sm font-medium leading-relaxed">
          <Sparkles size={16} className="inline mr-2 text-orange-400" />
          {feedback}
        </p>
      </div>

      {/* SECTION 3: DETAILED CRITERIA & LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Detailed Scores */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm">
          <div className="flex items-center gap-2 mb-8 text-gray-800">
            <BarChart3 size={20} />
            <h3 className="text-xl font-black uppercase tracking-tight">Tiêu chí chi tiết</h3>
          </div>
          <StatBar label="Ngữ pháp" value={scores.grammar} colorClass="text-blue-500" />
          <StatBar label="Từ vựng" value={scores.vocabulary} colorClass="text-purple-500" />
          <StatBar label="Mạch lạc" value={scores.coherence} colorClass="text-[#377437]" />
          <StatBar label="Kính ngữ" value={scores.honorifics} colorClass="text-orange-500" />
          <StatBar label="Chính tả" value={scores.orthography} colorClass="text-pink-500" />
        </div>

        {/* Strengths & Weaknesses */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <h4 className="flex items-center gap-2 text-[#377437] font-black uppercase text-sm mb-4">
              <CheckCircle2 size={18} /> Điểm mạnh
            </h4>
            <ul className="space-y-3">
              {strengths.map((s, i) => (
                <li key={i} className="text-sm text-gray-600 font-medium flex gap-2">
                  <span className="text-[#377437]">•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <h4 className="flex items-center gap-2 text-red-500 font-black uppercase text-sm mb-4">
              <AlertCircle size={18} /> Điểm cần cải thiện
            </h4>
            <ul className="space-y-3">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-gray-600 font-medium flex gap-2">
                  <span className="text-red-400">•</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 4: SUGGESTIONS */}
      <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white shadow-2xl">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen size={24} className="text-orange-400" />
          <h3 className="text-2xl font-black uppercase tracking-tight">Gợi ý học tập</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((item, i) => (
            <div key={i} className="p-6 bg-white/10 rounded-3xl border border-white/10 hover:bg-white/20 transition-all">
              {/* Hiển thị Category nếu có */}
              <span className="text-[10px] font-black uppercase text-orange-400 tracking-[0.2em]">
                {item.category || `Gợi ý #${i + 1}`}
              </span>

              {/* Render đúng thuộc tính string thay vì cả object item */}
              <p className="mt-2 text-sm font-bold leading-relaxed text-white">
                {item.suggestion || item.message || (typeof item === 'string' ? item : "")}
              </p>

              {/* Hiển thị Ví dụ nếu có */}
              {item.example && (
                <div className="mt-3 p-3 bg-black/20 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Ví dụ:</p>
                  <p className="text-xs italic text-gray-200">{item.example}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WritingEvaluationView;