import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Settings, 
  Volume2, 
  Layers,
  ArrowLeft
} from "lucide-react";

export default function StudyFlashcard() {
  const { setId } = useParams();
  const navigate = useNavigate();

  // Mock Data: Danh sách từ vựng giả lập
  const flashcards = [
    { id: 1, front: "안녕하세요", back: "Xin chào", example: "안녕하세요, 만나서 반갑습니다." },
    { id: 2, front: "감사합니다", back: "Cảm ơn", example: "도와주셔서 감사합니다." },
    { id: 3, front: "죄송합니다", back: "Xin lỗi", example: "늦어서 죄송합니다." },
    { id: 4, front: "사랑해요", back: "Tôi yêu bạn", example: "" },
    { id: 5, front: "학교", back: "Trường học", example: "학교에 갑니다." },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // --- LOGIC XỬ LÝ ---
  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200); // Tăng delay xíu cho mượt
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
    }
  };

  // Phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") { e.preventDefault(); handleFlip(); }
      if (e.code === "ArrowRight") handleNext();
      if (e.code === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isFlipped]);

  // --- GIAO DIỆN KHI HOÀN THÀNH ---
  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-[#377437] mb-6 shadow-lg shadow-green-100">
           <Layers size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Xuất sắc!</h2>
        <p className="text-gray-500 font-medium mb-10 text-lg">Bạn đã ôn tập xong {flashcards.length} thẻ.</p>
        
        <div className="flex gap-4">
           <button 
             onClick={() => { setIsFinished(false); setCurrentIndex(0); setIsFlipped(false); }}
             className="px-8 py-3 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:border-[#377437] hover:text-[#377437] transition-all"
           >
             Học lại
           </button>
           <button 
             onClick={() => navigate('/user/flashcards')}
             className="px-8 py-3 bg-[#377437] text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all hover:-translate-y-1"
           >
             Về thư viện
           </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        {/* Nút Quay lại */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all font-bold text-sm"
        >
           <ArrowLeft size={20} />
           <span>Quay lại</span>
        </button>

        {/* Bộ đếm số trang */}
        <span className="font-black text-gray-700 text-sm bg-gray-100 px-4 py-1.5 rounded-full">
           {currentIndex + 1} / {flashcards.length}
        </span>

        {/* Nút cài đặt (Placeholder) */}
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
           <Settings size={20} />
        </button>
      </div>

      {/* --- THANH PROGRESS BAR --- */}
      <div className="h-1.5 w-full bg-gray-200">
         <div 
            className="h-full bg-gradient-to-r from-[#377437] to-green-400 transition-all duration-500 ease-out shadow-[0_0_10px_#377437]" 
            style={{ width: `${progress}%` }}
         ></div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* KHUNG THẺ 3D */}
        <div 
          className="relative w-full max-w-2xl aspect-[5/3] cursor-pointer group select-none"
          onClick={handleFlip}
          style={{ perspective: "1000px" }} // Tạo chiều sâu 3D
        >
           <div 
              className="w-full h-full relative transition-all duration-500 ease-in-out"
              style={{ 
                transformStyle: "preserve-3d", 
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
              }}
           >
              
              {/* === MẶT TRƯỚC (FRONT) === */}
              <div 
                className="absolute inset-0 w-full h-full bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white flex flex-col items-center justify-center z-10 overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                 {/* Decor nền nhẹ */}
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#377437] to-transparent opacity-20"></div>
                 
                 <span className="text-4xl md:text-6xl font-black text-gray-800 text-center px-4 tracking-tight">
                    {flashcards[currentIndex].front}
                 </span>
                 
                 <div className="absolute bottom-8 flex flex-col items-center animate-pulse">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Click to Flip</span>
                 </div>
              </div>

              {/* === MẶT SAU (BACK) === */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#377437] to-[#2d662d] rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-white p-8 overflow-hidden"
                style={{ 
                  backfaceVisibility: "hidden", 
                  transform: "rotateY(180deg)"
                }}
              >
                 {/* Nút Loa */}
                 <button 
                    onClick={(e) => { e.stopPropagation(); alert("Đọc mẫu!"); }}
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all active:scale-95"
                 >
                    <Volume2 size={24} />
                 </button>

                 <h2 className="text-3xl md:text-5xl font-black mb-6 text-center drop-shadow-md">
                    {flashcards[currentIndex].back}
                 </h2>
                 
                 {/* Ví dụ */}
                 {flashcards[currentIndex].example && (
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 max-w-[90%]">
                       <p className="text-lg font-medium italic text-green-50 text-center leading-relaxed">
                          "{flashcards[currentIndex].example}"
                       </p>
                    </div>
                 )}
              </div>

           </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="mt-12 flex items-center gap-6 md:gap-10">
           {/* Nút Prev */}
           <button 
             onClick={handlePrev}
             disabled={currentIndex === 0}
             className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#377437] hover:border-[#377437] hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
           >
              <ChevronLeft size={28} strokeWidth={3} />
           </button>

           {/* Nút Lật lớn */}
           <button 
             onClick={handleFlip}
             className="h-16 px-8 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-600 shadow-sm hover:border-[#377437] hover:text-[#377437] hover:shadow-lg transition-all active:scale-95 flex items-center gap-3 min-w-[160px] justify-center"
           >
              <RotateCcw size={20} className={`transition-transform duration-500 ${isFlipped ? '-rotate-180' : ''}`} />
              <span>{isFlipped ? "Quay lại" : "Xem đáp án"}</span>
           </button>

           {/* Nút Next */}
           <button 
             onClick={handleNext}
             className="w-14 h-14 rounded-2xl bg-[#377437] shadow-lg shadow-green-900/20 flex items-center justify-center text-white hover:bg-green-800 hover:-translate-y-1 transition-all active:scale-95"
           >
              <ChevronRight size={28} strokeWidth={3} />
           </button>
        </div>

        <p className="mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest hidden md:block">
           Phím tắt: Space (Lật) • Mũi tên (Di chuyển)
        </p>

      </div>
    </div>
  );
}