import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const TopikIDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Listening"); // Tab mặc định

  // Mock Data: Listening
  const listeningParts = [
    { id: 1, title: "Part 1 - Correct answer", correct: 0, total: 10, ratio: 0 },
    { id: 2, title: "Part 2 - Next sentence", correct: 2, total: 10, ratio: 20 },
    { id: 3, title: "Part 3 - Where is it?", correct: 0, total: 10, ratio: 0 },
    { id: 4, title: "Part 4 - Main idea", correct: 0, total: 10, ratio: 0 },
    { id: 5, title: "Part 5 - Choose picture", correct: 0, total: 10, ratio: 0 },
    { id: 6, title: "Part 6 - Conversation content", correct: 0, total: 10, ratio: 0 },
    { id: 7, title: "Part 7 - Choose thoughts", correct: 0, total: 10, ratio: 0 },
    { id: 8, title: "Part 8 - Short conversation", correct: 0, total: 10, ratio: 0 },
  ];

  // Mock Data: Reading
  const readingParts = [
    { id: 1, title: "Part 1 - Sentence topic", correct: 0, total: 10, ratio: 0 },
    { id: 2, title: "Part 2 - Fill in the blank", correct: 2, total: 10, ratio: 20 },
    { id: 3, title: "Part 3 - Wrong answer", correct: 0, total: 10, ratio: 0 },
    { id: 4, title: "Part 4 - Inference sentence", correct: 0, total: 10, ratio: 0 },
    { id: 5, title: "Part 5 - Short paragraph (Easy)", correct: 0, total: 10, ratio: 0 },
    { id: 6, title: "Part 6 - Arrangement", correct: 0, total: 10, ratio: 0 },
    { id: 7, title: "Part 7 - Short paragraph (Difficult)", correct: 0, total: 10, ratio: 0 },
  ];

  // Chọn data dựa trên tab đang active
  const currentParts = activeTab === "Listening" ? listeningParts : readingParts;

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
        <span>Topik I</span>
      </div>

      {/* --- TABS SWITCHER --- */}
      <div className="flex gap-4 mb-8">
        {["Listening", "Reading"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm
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
            
            // 👇 QUAN TRỌNG: Dòng này giúp chuyển sang trang Ninja
            onClick={() => navigate(`/user/topik/start/${part.id}`)}

            className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          >
            {/* Title */}
            <h3 className="font-bold text-gray-900 text-lg mb-4 group-hover:text-[#377437] transition-colors">
              {part.title}
            </h3>

            {/* Stats */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Correct: <span className="text-gray-600">{part.correct}</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                 <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wide">
                    <span>Correct ratio</span>
                 </div>
                 {/* Progress Bar */}
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

export default TopikIDetail;