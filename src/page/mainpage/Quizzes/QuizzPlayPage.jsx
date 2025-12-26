import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, RotateCcw, CheckCircle,
  Clock, Loader2, Home, ArrowRight, Send, X, CheckCircle2, XCircle, Info
} from "lucide-react";
import exerciseService from "../../../AdminControl/Service/API/lessonServiceAPI/exercise.service";

// =========================================================
// 1. COMPONENT HIỂN THỊ CHI TIẾT KẾT QUẢ (MODAL)
// =========================================================
const ReviewModal = ({ isOpen, onClose, resultData, originalQuestions }) => {
  if (!isOpen || !resultData) return null;

  const getOptionText = (questionId, optionId) => {
    const question = originalQuestions.find(q => q.id === questionId);
    if (!question) return "N/A";
    const option = question.options.find(opt => opt.id === optionId);
    return option ? option.optionText : "Không trả lời";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Chi tiết bài làm</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-60">Review your answers</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-3 text-center">STT</th>
                <th className="px-6 py-3">Câu hỏi</th>
                <th className="px-6 py-3">Đáp án đúng</th>
                <th className="px-6 py-3">Bạn chọn</th>
                <th className="px-6 py-3">Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {resultData.userAnswer?.map((item, index) => (
                <tr key={index} className="group transition-all">
                  <td className="px-4 py-5 bg-white rounded-l-2xl border-y border-l border-slate-100 text-center font-black text-slate-300">
                    {index + 1}
                  </td>
                  <td className="px-6 py-5 bg-white border-y border-slate-100 font-bold text-slate-700">
                    {item.questionText}
                  </td>
                  <td className="px-6 py-5 bg-white border-y border-slate-100">
                    <span className="text-emerald-600 font-bold">{getOptionText(item.questionId, item.correctOptionId)}</span>
                  </td>
                  <td className="px-6 py-5 bg-white border-y border-slate-100">
                    <span className={item.isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                      {getOptionText(item.questionId, item.selectedOptionId)}
                    </span>
                  </td>
                  <td className="px-6 py-5 bg-white rounded-r-2xl border-y border-r border-slate-100 shadow-sm">
                    {item.isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-white border-t border-slate-100 text-center">
          <button onClick={onClose} className="px-10 py-3 bg-slate-800 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition">Đóng</button>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// 2. MAIN PAGE COMPONENT
// =========================================================
const QuizzPlayPage = () => {
  const { lessonId, exerciseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs để tránh closure stale trong setInterval
  const answersRef = useRef({});
  const isSubmittingRef = useRef(false);

  // --- STATES ---
  const [exerciseData] = useState(() => {
    if (location.state?.exerciseData) {
      sessionStorage.setItem(`quiz_persist_${lessonId}`, JSON.stringify(location.state.exerciseData));
      return location.state.exerciseData;
    }
    return JSON.parse(sessionStorage.getItem(`quiz_persist_${lessonId}`));
  });

  const [answersMap, setAnswersMap] = useState(() => {
    const saved = sessionStorage.getItem(`quiz_ans_${exerciseId}`);
    const initial = saved ? JSON.parse(saved) : {};
    answersRef.current = initial;
    return initial;
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(null);
  const [totalInitialTime, setTotalInitialTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const questions = useMemo(() => {
    const data = Array.isArray(exerciseData) ? exerciseData[0] : exerciseData;
    return data?.questions || [];
  }, [exerciseData]);

  const currentQuestion = questions[currentQuestionIndex] || null;
  const totalQuestions = questions.length;

  // --- LOGIC: TIMER BỀN VỮNG (LOCALSTORAGE) ---
  useEffect(() => {
    if (questions.length === 0 || showScore) return;

    const timerKey = `quiz_end_time_${exerciseId}`;
    let endTime = localStorage.getItem(timerKey);
    const duration = questions.length * 45; // 45s mỗi câu
    setTotalInitialTime(duration);

    if (!endTime) {
      endTime = Date.now() + duration * 1000;
      localStorage.setItem(timerKey, endTime);
    }

    const ticker = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((endTime - now) / 1000);

      if (diff <= 0) {
        clearInterval(ticker);
        setGlobalTimeLeft(0);
        if (!isSubmittingRef.current) handleFinalSubmit();
      } else {
        setGlobalTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(ticker);
  }, [questions, exerciseId, showScore]);

  // --- LOGIC: ĐỒNG BỘ ĐÁP ÁN ---
  useEffect(() => {
    sessionStorage.setItem(`quiz_ans_${exerciseId}`, JSON.stringify(answersMap));
    answersRef.current = answersMap;
  }, [answersMap, exerciseId]);

  // --- LOGIC: CHẶN THOÁT TRANG ---
  useEffect(() => {
    const handlePopState = (e) => {
      if (!showScore) {
        const confirmExit = window.confirm("Bài làm sẽ bị hủy nếu bạn thoát. Bạn chắc chắn chứ?");
        if (!confirmExit) {
            window.history.pushState(null, "", window.location.pathname);
        }
      }
    };
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showScore]);

  // --- HANDLERS ---
  const handleOptionSelect = (optionId) => {
    if (isSubmitting || showScore) return;
    setAnswersMap(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 400);
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting || showScore) return;
    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      const id = parseInt(exerciseId || exerciseData?.id || exerciseData[0]?.id);
      const formattedAnswers = Object.entries(answersRef.current).map(([qId, oId]) => ({
        questionId: parseInt(qId),
        selectedOptionId: oId
      }));

      const result = await exerciseService.submitExercise({
        exerciseId: id,
        answers: formattedAnswers
      });

      setSubmissionResult(result);
      setShowScore(true);

      // Dọn dẹp storage
      localStorage.removeItem(`quiz_end_time_${exerciseId}`);
      sessionStorage.removeItem(`quiz_ans_${exerciseId}`);
      sessionStorage.removeItem(`quiz_persist_${lessonId}`);
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Nộp bài thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- RENDER LOGIC ---
  if (isSubmitting) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F6F7FB]">
      <Loader2 size={50} className="text-indigo-600 animate-spin mb-4" />
      <p className="font-black text-slate-700 uppercase tracking-widest text-xs">Processing your results...</p>
    </div>
  );

  if (showScore && submissionResult) return (
    <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-[3rem] shadow-2xl p-12 text-center border border-white animate-in zoom-in duration-500">
        <CheckCircle size={64} className={`mx-auto mb-6 ${submissionResult.isCorrect ? 'text-emerald-500' : 'text-orange-500'}`} />
        <h2 className="text-5xl font-black text-slate-800 mb-2 tracking-tighter">{submissionResult.score}/10</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-10">
          {submissionResult.isCorrect ? "Bạn đã vượt qua bài kiểm tra!" : "Bạn cần cố gắng thêm một chút nữa!"}
        </p>
        
        <div className="flex flex-col gap-3">
          <button onClick={() => setIsReviewOpen(true)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition">Xem chi tiết đáp án</button>
          <button onClick={() => navigate('/courses/general-course')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">Quay lại bài học</button>
        </div>

        <ReviewModal 
          isOpen={isReviewOpen} 
          onClose={() => setIsReviewOpen(false)} 
          resultData={submissionResult} 
          originalQuestions={questions} 
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col font-sans text-slate-800 select-none">
      {/* ProgressBar Timer */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 z-50">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${globalTimeLeft <= 20 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-indigo-500'}`} 
          style={{ width: `${(globalTimeLeft / totalInitialTime) * 100}%` }} 
        />
      </div>

      <header className="max-w-6xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-slate-400 font-black hover:text-indigo-600 transition">
           <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 group-hover:border-indigo-100"><ChevronLeft size={20} /></div>
           <span className="uppercase text-[10px] tracking-widest">Quit Quiz</span>
        </button>

        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
            <Clock size={20} className={globalTimeLeft <= 20 ? 'text-rose-500 animate-pulse' : 'text-indigo-500'} />
            <span className={`text-xl font-black tabular-nums ${globalTimeLeft <= 20 ? 'text-rose-500' : 'text-slate-700'}`}>
                {formatTime(globalTimeLeft || 0)}
            </span>
        </div>

        <button onClick={handleFinalSubmit} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center gap-2">
            <Send size={16} /> Submit Now
        </button>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 grid grid-cols-12 gap-8 flex-1 pb-12">
        {/* Left: Question Area */}
        <div className="col-span-12 lg:col-span-8 flex flex-col">
            <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white p-10 md:p-16 flex-1 flex flex-col relative transition-all duration-500">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                            {currentQuestion?.type?.replace('_', ' ')}
                        </span>
                        <div className="h-px flex-1 bg-slate-50"></div>
                        <span className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">Question {currentQuestionIndex + 1}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
                        {currentQuestion?.questionText}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-auto">
                    {currentQuestion?.options.map((option, idx) => {
                        const isSelected = answersMap[currentQuestion.id] === option.id;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(option.id)}
                                className={`group p-6 rounded-[1.5rem] font-black text-left transition-all duration-200 flex items-center justify-between border-2
                                    ${isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-lg shadow-indigo-50' : 'bg-white border-slate-50 hover:border-slate-200 text-slate-600'}`}
                            >
                                <span className="text-xl md:text-2xl leading-tight pr-10">{option.optionText}</span>
                                <div className={`w-10 h-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all
                                    ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-100 text-slate-200'}`}>
                                    <span className="text-xs">{String.fromCharCode(65 + idx)}</span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex justify-between items-center mt-6 px-4">
                <button 
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="p-5 bg-white rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition shadow-sm border border-white"
                >
                  <ChevronLeft size={28} />
                </button>
                <button 
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="p-5 bg-white rounded-2xl text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition shadow-sm border border-white"
                >
                  <ChevronRight size={28} />
                </button>
            </div>
        </div>

        {/* Right: Sidebar */}
        <div className="hidden lg:col-span-4 lg:flex flex-col">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white p-8 sticky top-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 text-center">Quiz Progress</h3>
                <div className="grid grid-cols-5 gap-3">
                    {questions.map((q, i) => {
                        const isDone = answersMap[q.id] !== undefined;
                        const isCurrent = currentQuestionIndex === i;
                        
                        let style = "bg-slate-50 text-slate-300 border-slate-50";
                        if (isDone) style = "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100";
                        if (isCurrent) style = isDone ? "bg-indigo-600 text-white border-indigo-300 ring-4 ring-indigo-50 scale-110" : "bg-white text-indigo-600 border-indigo-500 ring-4 ring-indigo-50 scale-110";

                        return (
                            <button key={i} onClick={() => setCurrentQuestionIndex(i)} className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all text-xs font-black ${style}`}>
                                {i + 1}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                        <span className="text-xl font-black text-indigo-600">{Object.keys(answersMap).length}/{totalQuestions}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(Object.keys(answersMap).length / totalQuestions) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default QuizzPlayPage;