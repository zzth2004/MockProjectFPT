import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Bookmark } from "lucide-react";

const StudyPage = () => {
  const { unitId } = useParams(); // Lấy unitId từ URL
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("vocab");

  // Tự động chuyển tab nếu có yêu cầu từ trang khác (ví dụ từ nút "Xem lại sao")
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // --- MOCK DATA ---
  const [vocabList, setVocabList] = useState([
    { id: 1, text: "1. Xin chào - 안녕하세요", saved: false },
    { id: 2, text: "2. Quốc tịch - 국적", saved: false },
    { id: 3, text: "3. Nghề nghiệp - 직업", saved: true }, 
    { id: 4, text: "4. Giáo viên - 선생님", saved: false },
    { id: 5, text: "5. Bạn tên gì? - 이름이 뭐예요?", saved: false },
    { id: 6, text: "6. Người Việt Nam - 베트남 사람", saved: false },
  ]);

  const [grammarList, setGrammarList] = useState([
    { id: 1, text: "...입니다 (imnida) - là ...", saved: false },
    { id: 2, text: "...은/는 (eun/neun) - tiểu từ chủ ngữ", saved: false },
    { id: 3, text: "~이/가 아니다 - không phải là ...", saved: false },
    { id: 4, text: "~도 (cũng)", saved: true },
  ]);

  const [commList, setCommList] = useState([
    { id: 1, text: "Chào hỏi đơn giản", saved: false },
    { id: 2, text: "Giới thiệu", saved: false },
  ]);

  const toggleSave = (id, type) => {
    if (type === 'vocab') {
      setVocabList(prev => prev.map(item => item.id === id ? { ...item, saved: !item.saved } : item));
    } else if (type === 'grammar') {
      setGrammarList(prev => prev.map(item => item.id === id ? { ...item, saved: !item.saved } : item));
    } else if (type === 'comm') {
      setCommList(prev => prev.map(item => item.id === id ? { ...item, saved: !item.saved } : item));
    }
  };

  const formatUnitName = (id) => {
    return id ? id.replace(/-/g, " ").toUpperCase() : "UNIT 1";
  };

  // List Items đã lưu (Starred)
  const starredList = [
    ...vocabList.filter(i => i.saved).map(i => ({...i, type: 'vocab', typeName: 'Từ vựng'})),
    ...grammarList.filter(i => i.saved).map(i => ({...i, type: 'grammar', typeName: 'Ngữ pháp'})),
    ...commList.filter(i => i.saved).map(i => ({...i, type: 'comm', typeName: 'Hội thoại'}))
  ];

  return (
    <div className="w-full min-h-screen font-sans pt-2 pb-8">
      
      {/* --- HEADER --- */}
      <header className="flex items-center gap-2 mb-8 -ml-2">
        <button 
          onClick={() => navigate('/courses/general-learning')} 
          className="p-2 rounded-full bg-white text-gray-500 hover:text-gray-900 hover:shadow-sm transition-all border border-gray-200"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-gray-800 ml-1">
            <span className="opacity-50 hover:opacity-100 cursor-pointer transition" onClick={() => navigate('/courses')}>Course</span>
            <ChevronRight size={18} className="text-gray-400" />
            <span className="opacity-50 hover:opacity-100 cursor-pointer transition" onClick={() => navigate(`/courses/general-learning`)}>General Learning</span>
            <ChevronRight size={18} className="text-gray-400" />
            <span className="uppercase text-[#008236]">{formatUnitName(unitId)}</span>
        </div>
      </header>

      {/* --- TABS --- */}
      <div className="flex items-end pl-4 overflow-x-auto">
        <button onClick={() => setActiveTab("vocab")} className={`px-8 py-3 rounded-t-xl font-bold text-sm tracking-wide transition-all relative top-[2px] z-10 ${activeTab === "vocab" ? "bg-white text-black border-t-2 border-l-2 border-r-2 border-[#5CA370] border-b-white" : "bg-transparent text-gray-500 hover:text-gray-800 border-b-2 border-[#5CA370]"}`}>VOCAB</button>
        <button onClick={() => setActiveTab("grammar")} className={`px-8 py-3 rounded-t-xl font-bold text-sm tracking-wide transition-all relative top-[2px] z-10 ${activeTab === "grammar" ? "bg-white text-black border-t-2 border-l-2 border-r-2 border-[#5CA370] border-b-white" : "bg-transparent text-gray-500 hover:text-gray-800 border-b-2 border-[#5CA370]"}`}>GRAMMAR</button>
        <button onClick={() => setActiveTab("communication")} className={`px-8 py-3 rounded-t-xl font-bold text-sm tracking-wide transition-all relative top-[2px] z-10 ${activeTab === "communication" ? "bg-white text-black border-t-2 border-l-2 border-r-2 border-[#5CA370] border-b-white" : "bg-transparent text-gray-500 hover:text-gray-800 border-b-2 border-[#5CA370]"}`}>COMMUNICATION</button>
        <button onClick={() => setActiveTab("starred")} className={`flex items-center gap-2 px-8 py-3 rounded-t-xl font-bold text-sm tracking-wide transition-all relative top-[2px] z-10 ${activeTab === "starred" ? "bg-yellow-50 text-yellow-700 border-t-2 border-l-2 border-r-2 border-yellow-400 border-b-yellow-50" : "bg-transparent text-gray-400 hover:text-yellow-600 border-b-2 border-[#5CA370]"}`}><Star size={16} className={activeTab === "starred" ? "fill-yellow-500 text-yellow-500" : ""}/> SAVED</button>
      </div>

      {/* --- CONTENT --- */}
      <div className={`bg-white border-2 ${activeTab === 'starred' ? 'border-yellow-400 bg-yellow-50/10' : 'border-[#5CA370]'} rounded-b-2xl rounded-tr-2xl p-6 min-h-[500px] shadow-sm relative z-0`}>
        
        {/* 1. VOCAB */}
        {activeTab === "vocab" && (
          <div className="flex flex-col gap-4">
            {vocabList.map((item) => (
              <div 
                key={item.id} 
                // 👇 SỬA ĐƯỜNG DẪN TẠI ĐÂY
                onClick={() => navigate(`/courses/general-learning/${unitId}/vocabulary`)}
                className="group flex items-center justify-between p-5 rounded-xl border-2 border-[#5CA370] bg-white hover:bg-green-50 transition-colors cursor-pointer"
              >
                <div className="font-bold text-gray-800 text-lg">{item.text}</div>
                <button onClick={(e) => {e.stopPropagation(); toggleSave(item.id, 'vocab');}} className="p-2 transition-transform active:scale-90">
                  <Star size={24} className={item.saved ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"} strokeWidth={2}/>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 2. GRAMMAR */}
        {activeTab === "grammar" && (
           <div className="flex flex-col gap-4">
             {grammarList.map((item) => (
              <div key={item.id} className="group flex items-center justify-between p-5 rounded-xl border-2 border-[#5CA370] bg-white hover:bg-green-50 transition-colors cursor-pointer">
                <div className="font-bold text-gray-800 text-lg">{item.text}</div>
                <button onClick={(e) => {e.stopPropagation(); toggleSave(item.id, 'grammar');}} className="p-2 transition-transform active:scale-90">
                  <Star size={24} className={item.saved ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"} strokeWidth={2}/>
                </button>
              </div>
            ))}
           </div>
        )}

        {/* 3. COMMUNICATION */}
        {activeTab === "communication" && (
           <div className="flex flex-col gap-4">
             {commList.map((item) => (
              <div key={item.id} className="group flex items-center justify-between p-5 rounded-xl border-2 border-[#5CA370] bg-white hover:bg-green-50 transition-colors cursor-pointer">
                <div className="font-bold text-gray-800 text-lg">{item.text}</div>
                <button onClick={(e) => {e.stopPropagation(); toggleSave(item.id, 'comm');}} className="p-2 transition-transform active:scale-90">
                  <Star size={24} className={item.saved ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"} strokeWidth={2}/>
                </button>
              </div>
            ))}
           </div>
        )}

        {/* 4. STARRED */}
        {activeTab === "starred" && (
          <div className="flex flex-col gap-4">
            {starredList.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Bookmark size={48} className="mb-4 opacity-20"/>
                  <p>Bạn chưa lưu mục nào.</p>
               </div>
            ) : (
               starredList.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="group flex items-center justify-between p-5 rounded-xl border-2 border-yellow-300 bg-white hover:bg-yellow-50 transition-colors cursor-pointer shadow-sm">
                    <div>
                        <div className="font-bold text-gray-800 text-lg">{item.text}</div>
                        <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md mt-1 inline-block">{item.typeName}</span>
                    </div>
                    <button onClick={(e) => {e.stopPropagation(); toggleSave(item.id, item.type);}} className="p-2 transition-transform active:scale-90">
                      <Star size={24} className="text-yellow-400 fill-yellow-400" strokeWidth={2}/>
                    </button>
                  </div>
               ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default StudyPage;