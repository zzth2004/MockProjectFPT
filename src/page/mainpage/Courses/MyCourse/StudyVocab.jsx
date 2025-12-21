import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, RotateCw } from "lucide-react";

// Import ảnh (Đảm bảo đường dẫn này đúng với máy của bạn)
import fightingGirlImg from "../../../../assets/scheduleAva.png"; 

// Mock Data
const VOCAB_DATA = [
  { id: 1, vn: "Dưa hấu", kr: "수박", image: "🍉", saved: false },
  { id: 2, vn: "Quả táo", kr: "사과", image: "🍎", saved: true },
  { id: 3, vn: "Quả chuối", kr: "바나나", image: "🍌", saved: false },
  { id: 4, vn: "Quả nho", kr: "포도", image: "🍇", saved: false },
];

const StudyVocab = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [vocabList, setVocabList] = useState(VOCAB_DATA);
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = vocabList[currentIndex];
  const totalCards = vocabList.length;

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const toggleSave = (e) => {
    e.stopPropagation();
    const updatedList = [...vocabList];
    updatedList[currentIndex].saved = !updatedList[currentIndex].saved;
    setVocabList(updatedList);
  };

  const handleNavigateToQuiz = () => {
    // 👇 SỬA ĐƯỜNG DẪN QUIZ
    navigate(`/courses/general-learning/${unitId}/quiz`);
  };

  // --- MÀN HÌNH HOÀN THÀNH ---
  if (isFinished) {
    return (
      <div className="w-full min-h-screen bg-[#F5F7FA] font-sans p-6">
        <button 
            onClick={() => setIsFinished(false)}
            className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 transition mb-6"
        >
            <ChevronLeft size={24} /> Back
        </button>

        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-8 w-full max-w-3xl">Unit Vocabulary - Completed</h1>
            <div className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 md:p-16 min-h-[400px] flex flex-col justify-center overflow-hidden">
                <div className="flex flex-col items-start gap-6 relative z-10">
                    <h2 className="text-2xl font-bold text-gray-800">Bạn đã học hết từ vựng!!</h2>
                    <p className="text-gray-600 font-medium -mt-2">Hãy thử các chế độ khác nhé</p>
                    <button onClick={handleNavigateToQuiz} className="bg-[#66A869] hover:bg-[#558f57] text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5">Kiểm tra từ vựng</button>
                    <button 
                        onClick={() => {
                            // 👇 QUAY LẠI TRANG CHI TIẾT VÀ MỞ TAB STARRED
                            navigate(`/courses/general-learning/${unitId}`, { state: { activeTab: 'starred' } });
                        }} 
                        className="bg-[#66A869] hover:bg-[#558f57] text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        Xem lại các từ vựng có sao <Star size={18} className="fill-yellow-400 text-yellow-400"/>
                    </button>
                </div>
                <div className="absolute bottom-0 right-0 pointer-events-none">
                     <img src={fightingGirlImg} alt="Fighting" className="w-48 md:w-64 h-auto object-contain" />
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH FLASHCARD ---
  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] font-sans p-4 md:p-6">
      
      {/* HEADER */}
      <header className="flex items-center gap-3 mb-6">
        <button 
          // 👇 SỬA ĐƯỜNG DẪN NÚT BACK
          onClick={() => navigate(`/courses/general-learning/${unitId}`)} 
          className="p-2 rounded-full bg-white text-gray-500 hover:text-gray-900 hover:shadow-sm transition-all border border-gray-200"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Unit Vocabulary</h1>
      </header>

      {/* FLASHCARD */}
      <div className="flex flex-col items-center mt-2"> 
        <div className="text-xl font-bold text-gray-800 mb-4">{currentIndex + 1}/{totalCards}</div>

        <div onClick={() => setIsFlipped(!isFlipped)} className="relative w-full max-w-lg aspect-[4/3] bg-white rounded-[2rem] shadow-lg border border-gray-100 flex flex-col items-center justify-center p-8 cursor-pointer hover:shadow-xl transition-all duration-300 select-none">
           <button onClick={toggleSave} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-50 transition-colors z-10">
              <Star size={28} className={currentCard.saved ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
           </button>
           <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
              <div className="text-[100px] md:text-[120px] drop-shadow-md leading-none">{currentCard.image}</div>
              <h2 className="text-3xl font-bold text-gray-800 mt-2 text-center">{isFlipped ? currentCard.kr : currentCard.vn}</h2>
              <p className="text-xs text-gray-400 absolute bottom-6 font-medium flex items-center gap-1">{isFlipped ? "(Click to see Vietnamese)" : "(Click to flip)"} <RotateCw size={12}/></p>
           </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-16 mt-8">
           <button onClick={handlePrev} disabled={currentIndex === 0} className={`p-3 rounded-full border-2 transition-all ${currentIndex === 0 ? "border-gray-200 text-gray-300" : "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"}`}><ChevronLeft size={28} /></button>
           <button onClick={handleNext} className="p-3 rounded-full border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition-all">
              {currentIndex === totalCards - 1 ? (
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              ) : (<ChevronRight size={28} />)}
           </button>
        </div>
      </div>
    </div>
  );
};

export default StudyVocab;