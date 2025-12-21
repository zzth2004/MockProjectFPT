import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const TopikIIDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Listening");

  // Mock Data cho TOPIK II (Gồm 3 phần)
  const data = {
    Listening: [
      { id: 201, title: "Part 1 - Choose picture", correct: 0, total: 10, ratio: 0 },
      { id: 202, title: "Part 2 - Conversation content", correct: 0, total: 10, ratio: 0 },
      { id: 203, title: "Part 3 - Main thoughts", correct: 0, total: 10, ratio: 0 },
    ],
    Reading: [
      { id: 210, title: "Part 1 - Grammar & Vocabulary", correct: 0, total: 10, ratio: 0 },
      { id: 211, title: "Part 2 - Fill in the blank", correct: 0, total: 10, ratio: 0 },
    ],
    Writting: [ // Tab Writting như trong ảnh {A14D8ADB...png}
      { id: 220, title: "Express personal opinion", correct: 0, total: 1, ratio: 0 },
      { id: 221, title: "Sentence completion", correct: 0, total: 2, ratio: 0 },
    ]
  };

  const currentParts = data[activeTab] || [];

  return (
    <div className="w-full min-h-screen font-sans pt-4 pb-8 bg-[#F5F7FA] px-4 md:px-0">
      
      {/* --- BREADCRUMB --- */}
      <div className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-6">
        <span 
          onClick={() => navigate('/user/topik')} 
          className="cursor-pointer hover:text-[#377437] transition-colors"
        >
          Topik Practise
        </span>
        <ChevronRight size={20} className="text-gray-400" />
        <span>Topik II</span>
      </div>

      {/* --- TABS SWITCHER (3 TABS) --- */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {["Listening", "Reading", "Writting"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm whitespace-nowrap
              ${activeTab === tab 
                ? "bg-[#377437] text-white shadow-green-900/20" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- PARTS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentParts.map((part) => (
          <div 
            key={part.id}
            onClick={() => navigate(`/user/topik/start/${part.id}`)}
            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          >
            <h3 className="font-bold text-gray-900 text-lg mb-4 group-hover:text-[#377437] transition-colors">
              {part.title}
            </h3>

            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Correct: <span className="text-gray-600">{part.correct}</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                 <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wide">
                    <span>Correct ratio</span>
                 </div>
                 <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#377437] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${part.ratio}%` }}
                    />
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default TopikIIDetail;