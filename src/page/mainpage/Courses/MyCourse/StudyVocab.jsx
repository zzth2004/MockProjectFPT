import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, RotateCw, BookOpen, BrainCircuit, Loader2, Volume2 } from "lucide-react";
import useCallApiHandler from "../../../../hooks/HookHander/useCallApiHandler";
import vocabService from "../../../../AdminControl/Service/API/lessonServiceAPI/vocab.service";
import AiService from "../../../../AdminControl/Service/API/aiAPI/ai.service";
import exerciseService from "../../../../AdminControl/Service/API/lessonServiceAPI/exercise.service";
import fightingGirlImg from "../../../../assets/scheduleAva.png";


const StudyVocab = () => {
  const { lessonId, exerciseId } = useParams();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [direction, setDirection] = useState("next");
  const [dragStart, setDragStart] = useState(null);
  const [existingExercise, setExistingExercise] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // CHÈN VÀO ĐÂY:
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const checkExercise = async () => {
      try {

        const res = await exerciseService.getByLessonAi(lessonId, 1, 10);
        console.log("Existing AI Exercise Check Response:", res.data);
        if (res.data) {
          setExistingExercise(res.data);
        }
      } catch (error) {
        console.log("Chưa có bộ đề nào trước đó");
      } finally {
        setIsChecking(false);
      }
    };
    checkExercise();
  }, [lessonId]);

  const fetchVocabFn = useCallback(
    () => vocabService.getByLesson(lessonId, 1, 100),
    [lessonId]
  );

  const { data: response, loading, call: refreshVocab } = useCallApiHandler(fetchVocabFn);

  useEffect(() => {
    if (lessonId) refreshVocab();
  }, [lessonId, refreshVocab]);

  const vocabList = useMemo(() => {
    let rawItems = response?.data || response || [];
    return rawItems.map((item) => ({
      id: item.id,
      vn: item.meaningVietnamese || "",
      kr: item.wordKorean || "",
      image: item.image || "🇰🇷",
      saved: savedIds.includes(item.id)
    }));
  }, [response, savedIds]);

  const currentCard = vocabList[currentIndex];
  const totalCards = vocabList.length;

  // --- LOGIC PHÁT ÂM (TEXT TO SPEECH) ---
  const speakKorean = useCallback((text) => {
    if (!text) return;
    // Hủy các yêu cầu phát âm đang chờ để tránh bị chồng chéo
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR'; // Thiết lập ngôn ngữ tiếng Hàn
    utterance.rate = 0.8;      // Tốc độ nói hơi chậm một chút để dễ nghe
    window.speechSynthesis.speak(utterance);
  }, []);

  // Tự động phát âm khi chuyển từ mới (Mặt trước là tiếng Hàn)
  useEffect(() => {
    if (currentCard?.kr && !isFinished && !loading) {
      speakKorean(currentCard.kr);
    }
  }, [currentIndex, currentCard, isFinished, loading, speakKorean]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setDirection("next");
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, totalCards]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("prev");
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  // --- LOGIC PHÍM TẮT ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFinished) return;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsFlipped((prev) => !prev);
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "KeyV": // Thêm phím V để nghe lại
          speakKorean(currentCard?.kr);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isFinished, currentCard, speakKorean]);

  const handleStart = (clientX) => setDragStart(clientX);
  const handleEnd = (clientX) => {
    if (dragStart === null) return;
    const distance = dragStart - clientX;
    if (distance > 50) handlePrev();
    else if (distance < -50) handleNext();
    else setIsFlipped(!isFlipped);
    setDragStart(null);
  };

  const toggleSave = (e) => {
    e.stopPropagation();
    if (!currentCard) return;
    const id = currentCard.id;
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };


  const handleStartAiQuiz = async (mode) => {
    if (mode === 1) {
      if (existingExercise && (Array.isArray(existingExercise) ? existingExercise.length > 0 : true)) {
        
        // --- SỬA TẠI ĐÂY: Đảm bảo lấy đúng Object ---
        const exerciseToPlay = Array.isArray(existingExercise) ? existingExercise[0] : existingExercise;

        console.log("Using existing exercise:", exerciseToPlay);
        
        // Điều hướng sử dụng ID chính xác
        navigate(`/courses/learning/${lessonId}/quizzes/${exerciseToPlay.id}`, {
          state: { exerciseData: exerciseToPlay }
        });
      } else {
        alert("Không tìm thấy bộ đề cũ, vui lòng tạo bộ đề mới!");
      }
    }
    if (mode === 2) {
      if (vocabList.length === 0) {
        alert("Danh sách từ vựng trống, không thể tạo bài tập!");
        return;
      }

      setIsAiLoading(true);

      const config = {
        count: vocabList.length,
        exerciseTypes: ["multiple_choice", "fill_blank", "true_false", "grammar"],
        jsonData: {
          vocabularies: vocabList.map((v) => v.kr || v.wordKorean) 
        }
      };

      try {
        const res = await AiService.generateExerciseforLesson(lessonId, config);
        
        // Tùy vào API của bạn trả về mảng hay object, ta xử lý tương tự
        const rawData = res?.data || res;
        const generatedData = Array.isArray(rawData) ? rawData[0] : rawData;

        console.log("AI Generated New Exercise Data:", generatedData);

        // Lưu lại để lần sau mode 1 có thể dùng
        setExistingExercise(generatedData);

        if (generatedData && generatedData.id) {
            navigate(`/courses/learning/${lessonId}/quizzes/${generatedData.id}`, {
              state: { exerciseData: generatedData }
            });
        } else {
            throw new Error("Dữ liệu AI trả về không hợp lệ (thiếu ID)");
        }

      } catch (error) {
        console.error("Lỗi AI:", error);
        alert("Không thể tạo bài tập lúc này, vui lòng thử lại sau!");
      } finally {
        setIsAiLoading(false);
      }
    }
  };






  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F5F7FA]"><Loader2 className="animate-spin text-green-600" size={40} /></div>;

  if (isFinished) {
    return (
      <div className="w-full min-h-screen bg-[#F5F7FA] font-sans p-6 animate-in fade-in duration-500">
        <button onClick={() => setIsFinished(false)} className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 mb-6">
          <ChevronLeft size={24} /> Trở về bài học
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-8 w-full max-w-3xl text-center">Hoàn thành bài học!</h1>
          <div className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 min-h-[400px] flex flex-col justify-center overflow-hidden">
            <div className="flex flex-col items-start gap-6 relative z-10">
              <h2 className="text-3xl font-black text-[#518f53]">CHÚC MỪNG! 🔥</h2>
              <p className="text-gray-600 font-medium -mt-2">Bạn đã học xong {totalCards} từ vựng mới.</p>
              {/* Container bao ngoài sử dụng Grid 12 cột */}
              <div className="grid grid-cols-12 w-full mt-8">

                {/* Div chính chiếm 8 cột, bắt đầu từ cột thứ 3 để căn giữa (3 + 8 + 2 = 12) */}
                <div className="col-span-12 md:col-span-8 flex justify-between gap-4">

                  {existingExercise ? (
                    <>
                      <button
                        onClick={() => handleStartAiQuiz(1)}
                        className="flex-1 bg-[#2D5A3C] text-white font-bold px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#234730] transition-all active:scale-95"
                      >
                        <BookOpen size={20} />
                        <span className="whitespace-nowrap">Học lại bộ cũ</span>
                      </button>

                      <button
                        onClick={() => handleStartAiQuiz(2)}
                        disabled={isAiLoading}
                        className="flex-1 bg-white border-2 border-[#66A869] text-[#2D5A3C] font-bold py-4 px-6 rounded-2xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-green-50 transition-all active:scale-95"
                      >
                        {isAiLoading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <RotateCw size={20} />
                        )}
                        <span className="whitespace-nowrap">Tạo bộ mới</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStartAiQuiz(2)}
                      disabled={isAiLoading}
                      className="w-full bg-[#377437] text-white font-bold py-4 px-8 rounded-2xl shadow-lg flex items-center justify-center gap-3 disabled:bg-gray-400 hover:bg-[#2D5A3C] transition-all"
                    >
                      {isAiLoading ? (
                        <><Loader2 className="animate-spin" size={24} /> Đang thiết kế đề...</>
                      ) : (
                        <><BrainCircuit size={24} /> Bắt đầu học AI Quiz</>
                      )}
                    </button>
                  )}

                </div>
              </div>
              <button
                onClick={() => navigate(`/courses/general-learning/${lessonId}`)}
                className="bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 px-8 rounded-xl"
              >
                Về trang chủ
              </button>
            </div>
            <img src={fightingGirlImg} alt="Success" className="absolute bottom-0 right-0 w-48 md:w-64 opacity-80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] font-sans p-4 md:p-6 select-none overflow-hidden">
      <style>{`
        @keyframes slideInNext { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInPrev { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-next { animation: slideInNext 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .animate-slide-prev { animation: slideInPrev 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      `}</style>

      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/courses/general-learning/${unitId}`)} className="p-2 rounded-full bg-white border border-gray-200"><ChevronLeft size={24} /></button>
        <h1 className="text-xl font-bold text-gray-800">Flashcards</h1>
        <div className="ml-auto flex items-center gap-2 bg-gray-200/50 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500">
          ⌨️ SPACE: FLIP • ARROWS: MOVE • V: LISTEN
        </div>
      </header>

      <div className="flex flex-col items-center mt-2">
        <div className="text-xl font-black text-[#518f53] mb-4 tracking-widest">{currentIndex + 1} / {totalCards}</div>

        <div
          className="relative w-full max-w-lg aspect-[4/3] cursor-grab active:cursor-grabbing"
          style={{ perspective: "1000px" }}
          onDragStart={(e) => e.preventDefault()}
          onTouchStart={(e) => handleStart(e.targetTouches[0].clientX)}
          onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseUp={(e) => handleEnd(e.clientX)}
        >
          <div key={currentIndex} className={`relative w-full h-full ${direction === 'next' ? 'animate-slide-next' : 'animate-slide-prev'}`}>
            <div
              className="relative w-full h-full transition-all duration-700 shadow-2xl rounded-[2.5rem]"
              style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              {/* Nút Star */}
              <button onClick={toggleSave} onMouseDown={(e) => e.stopPropagation()} onMouseUp={(e) => e.stopPropagation()} className="absolute top-8 right-8 p-3 rounded-full z-50 bg-white/50"><Star size={32} className={currentCard?.saved ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} /></button>

              {/* Nút Loa nghe lại (Dành riêng cho tiếng Hàn) */}
              {!isFlipped && (
                <button
                  onClick={(e) => { e.stopPropagation(); speakKorean(currentCard?.kr); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute top-8 left-8 p-3 rounded-full z-50 bg-[#66A869]/10 text-[#2D5A3C] hover:bg-[#66A869]/20 transition-all"
                >
                  <Volume2 size={24} />
                </button>
              )}

              {/* MẶT TRƯỚC: TIẾNG HÀN */}
              <div className="absolute inset-0 w-full h-full bg-[#f0f9f1] rounded-[2.5rem] border-2 border-[#66A869] flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: "hidden" }}>
                <h2 className="text-6xl font-black text-[#2D5A3C] text-center uppercase tracking-tight">{currentCard?.kr}</h2>
                <p className="text-[10px] text-[#66A869] absolute bottom-8 font-black uppercase tracking-[0.2em] flex items-center gap-2">Nhấn hoặc Space để xem nghĩa <RotateCw size={12} /></p>
              </div>

              {/* MẶT SAU: TIẾNG VIỆT */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <div className="text-[80px] mb-2">{currentCard?.image}</div>
                <h2 className="text-4xl font-black text-gray-800 text-center uppercase tracking-tight">{currentCard?.vn}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* NÚT ĐIỀU HƯỚNG */}
        <div className="flex items-center gap-12 mt-10">
          <button onClick={handlePrev} disabled={currentIndex === 0} className={`p-4 rounded-full border-2 shadow-sm transition-all ${currentIndex === 0 ? "border-gray-100 text-gray-100 opacity-20" : "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"}`}><ChevronLeft size={32} /></button>
          <button onClick={handleNext} className="p-4 rounded-full border-2 border-gray-800 bg-gray-800 text-white hover:bg-gray-900 transition-all shadow-lg"><ChevronRight size={32} /></button>
        </div>
      </div>
    </div>
  );
};

export default StudyVocab;