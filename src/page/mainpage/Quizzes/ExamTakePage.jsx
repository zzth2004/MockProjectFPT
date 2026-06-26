import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ChevronLeft, ChevronRight, Clock, Loader2, Send, X,
    CheckCircle2, XCircle, Info, Lock, ShieldAlert, AlertTriangle, FileText
} from "lucide-react";
import exerciseService from "../../../AdminControl/Service/API/lessonServiceAPI/exercise.service";

export default function ExamTakePage() {
    const { exerciseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Nhận dữ liệu xác thực từ ExamLandingPage
    const { prefillName, prefillEmail, preVerified } = location.state || {};

    // Exam states
    const [examData, setExamData] = useState(null);
    const [loadingExam, setLoadingExam] = useState(true);
    const [isStarted, setIsStarted] = useState(false);

    // Question navigation states
    const [answersMap, setAnswersMap] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [totalInitialTime, setTotalInitialTime] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [showScore, setShowScore] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // Proctoring & Cheat Prevention States
    const [warnings, setWarnings] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [logs, setLogs] = useState([]);
    const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);

    const answersRef = useRef({});
    const logsRef = useRef([]);
    const warningsRef = useRef(0);
    const blurTimeoutRef = useRef(null);

    // Redirect nếu truy cập trực tiếp mà chưa qua bước Landing Page
    useEffect(() => {
        if (!preVerified) {
            alert("Lỗi truy cập: Vui lòng xác thực phòng thi trước!");
            navigate('/user/exams');
        }
    }, [preVerified, navigate]);

    const questions = useMemo(() => {
        return examData?.questions || [];
    }, [examData]);

    const currentQuestion = questions[currentQuestionIndex] || null;
    const totalQuestions = questions.length;

    // --- Helper to log actions ---
    const addLog = (action, detail) => {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        const newLog = { time: timeStr, action, detail };

        setLogs(prev => {
            const updated = [...prev, newLog];
            logsRef.current = updated;
            return updated;
        });
    };

    // Load Exam Data on Mount
    useEffect(() => {
        const fetchExamDetail = async () => {
            if (!preVerified) return;
            try {
                setLoadingExam(true);
                const data = await exerciseService.getTakeDetail(parseInt(exerciseId));
                if (data) {
                    setExamData(data);
                } else {
                    alert("Không tìm thấy thông tin đề thi!");
                    navigate('/user/exams');
                }
            } catch (err) {
                console.error("Lỗi khi tải thông tin bài thi:", err);
                alert("Không thể tải đề thi. Vui lòng thử lại sau.");
            } finally {
                setLoadingExam(false);
            }
        };
        fetchExamDetail();
    }, [exerciseId, preVerified, navigate]);

    // Start Exam
    const handleStartExam = () => {
        setIsStarted(true);
        addLog("Bắt đầu làm bài thi", "Bắt đầu làm bài kiểm tra chính thức và kích hoạt giám sát trực tuyến.");

        const duration = (examData?.timeLimit || 45) * 60;
        setTimeLeft(duration);
        setTotalInitialTime(duration);
    };

    // --- PROCTORING SYSTEM ---
    useEffect(() => {
        if (!isStarted || showScore) return;

        // 1. Chặn copy/paste
        const handleClipboard = (e) => {
            e.preventDefault();
            addLog("Sao chép/Dán bị chặn", "Người dùng cố gắng copy/cut/paste đề thi hoặc đáp án.");
            alert("⚠️ Cảnh báo bảo mật: Không được phép sao chép/dán trong lúc thi!");
        };

        // 2. Chặn chuột phải
        const handleContextMenu = (e) => {
            e.preventDefault();
            addLog("Mở Context Menu bị chặn", "Người dùng click chuột phải.");
        };

        window.addEventListener("copy", handleClipboard);
        window.addEventListener("cut", handleClipboard);
        window.addEventListener("paste", handleClipboard);
        window.addEventListener("contextmenu", handleContextMenu);

        // 3. Giám sát tab
        const handleTabSwitchAway = () => {
            addLog("Rời cửa sổ thi", "Người dùng chuyển tab hoặc mở ứng dụng khác.");

            blurTimeoutRef.current = setTimeout(() => {
                const nextWarnings = warningsRef.current + 1;
                warningsRef.current = nextWarnings;
                setWarnings(nextWarnings);
                addLog(`Cảnh báo vi phạm lần ${nextWarnings}`, "Học sinh rời tab làm bài quá 3 giây.");

                if (nextWarnings >= 2) {
                    addLog("Kích hoạt tự động nộp bài", "Vi phạm rời tab quá 2 lần. Hệ thống khóa đề và nộp bài.");
                    setAutoSubmitTriggered(true);
                } else {
                    setShowWarningModal(true);
                }
            }, 3000);
        };

        const handleTabSwitchBack = () => {
            addLog("Quay lại cửa sổ thi", "Học sinh tập trung lại vào trang bài làm.");
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleTabSwitchAway();
            } else {
                handleTabSwitchBack();
            }
        };

        window.addEventListener("blur", handleTabSwitchAway);
        window.addEventListener("focus", handleTabSwitchBack);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("copy", handleClipboard);
            window.removeEventListener("cut", handleClipboard);
            window.removeEventListener("paste", handleClipboard);
            window.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("blur", handleTabSwitchAway);
            window.removeEventListener("focus", handleTabSwitchBack);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        };
    }, [isStarted, showScore]);

    // Handle Countdown Timer
    useEffect(() => {
        if (!isStarted || showScore || timeLeft === null) return;

        const ticker = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(ticker);
                    addLog("Hết giờ làm bài", "Thời gian làm bài đã kết thúc. Tự động nộp bài.");
                    handleFinalSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(ticker);
    }, [isStarted, showScore, timeLeft]);

    // Triggers auto-submit when violation limit is reached
    useEffect(() => {
        if (autoSubmitTriggered) {
            handleFinalSubmit(true);
        }
    }, [autoSubmitTriggered]);

    // Synchronize answers
    useEffect(() => {
        answersRef.current = answersMap;
    }, [answersMap]);

    // Prevent back navigation
    useEffect(() => {
        if (!isStarted || showScore) return;

        const handlePopState = (e) => {
            window.history.pushState(null, "", window.location.pathname);
            alert("⚠️ Bạn đang làm bài thi. Không thể sử dụng phím quay lại!");
        };
        window.history.pushState(null, "", window.location.pathname);
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isStarted, showScore]);

    // Submit handler
    const handleFinalSubmit = async (isAuto = false) => {
        if (isSubmitting || showScore) return;
        setIsSubmitting(true);
        addLog(isAuto ? "Nộp bài tự động" : "Nộp bài thủ công", "Bài thi đã được lưu và gửi về hệ thống.");

        try {
            const formattedAnswers = Object.entries(answersRef.current).map(([qId, oId]) => ({
                questionId: parseInt(qId),
                selectedOptionId: oId
            }));

            const result = await exerciseService.submitExercise({
                exerciseId: parseInt(exerciseId),
                answers: formattedAnswers,
                metadata: {
                    studentName: prefillName,
                    studentEmail: prefillEmail,
                    warningCount: warningsRef.current,
                    proctorLogs: logsRef.current
                }
            });

            setSubmissionResult(result);
            setShowScore(true);
        } catch (error) {
            console.error("Lỗi khi nộp bài thi:", error);
            alert("Nộp bài thi thất bại. Vui lòng liên hệ giám thị!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptionSelect = (optionId) => {
        if (isSubmitting || showScore) return;
        const currentQId = currentQuestion.id;

        addLog("Chọn đáp án", `Câu ${currentQuestionIndex + 1}: Lựa chọn đáp án ID ${optionId}`);
        setAnswersMap(prev => ({ ...prev, [currentQId]: optionId }));

        if (currentQuestionIndex < totalQuestions - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 350);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    // --- RENDER STATES ---

    if (loadingExam) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
                <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                <p className="font-bold text-sm text-slate-500 uppercase tracking-widest">Đang khởi tạo phòng thi...</p>
            </div>
        );
    }

    // Màn hình chờ bắt đầu (Đã bỏ qua nhập liệu)
    if (!isStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <Lock size={30} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">ĐỀ THI: {examData?.title}</h2>
                    <p className="text-slate-500 text-sm font-medium mb-6">
                        Thí sinh: <b>{prefillName}</b> ({prefillEmail})
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Thời gian</p>
                            <p className="text-lg font-black text-slate-700">{examData?.timeLimit || 45} phút</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Số câu hỏi</p>
                            <p className="text-lg font-black text-slate-700">{totalQuestions} câu</p>
                        </div>
                    </div>

                    <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 text-left mb-8">
                        <div className="flex items-center gap-2 mb-2 text-rose-600">
                            <AlertTriangle size={16} />
                            <h4 className="text-sm font-bold uppercase">Nhắc lại nội quy</h4>
                        </div>
                        <p className="text-xs text-rose-600/80 font-medium leading-relaxed">
                            Màn hình làm bài sẽ được khóa và giám sát tự động. Việc rời khỏi tab hoặc sử dụng tổ hợp phím gian lận sẽ bị cảnh báo và có thể dẫn đến việc tự động nộp bài.
                        </p>
                    </div>

                    <button
                        onClick={handleStartExam}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30"
                    >
                        Bắt đầu làm bài
                    </button>
                </div>
            </div>
        );
    }

    // Màn hình xem điểm
    if (showScore && submissionResult) {
        const isCancelled = submissionResult.metadata?.isCancelled || submissionResult.score === 0 && warningsRef.current >= 2;
        const rawScore = parseFloat(submissionResult.score);
        const score = ((rawScore / totalQuestions) * 10).toFixed(1);

        let colorConfig = {
            text: "text-emerald-500",
            bg: "bg-emerald-50",
            icon: CheckCircle2,
        };

        if (isCancelled) {
             colorConfig = { text: "text-red-600", bg: "bg-red-50", icon: ShieldAlert };
        } else if (score < 4) {
            colorConfig = { text: "text-red-500", bg: "bg-red-50", icon: XCircle };
        } else if (score >= 4 && score <= 7) {
            colorConfig = { text: "text-amber-500", bg: "bg-amber-50", icon: AlertTriangle };
        }

        const ResultIcon = colorConfig.icon;

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 md:p-12 text-center">
                    {/* Icon động */}
                    <div className={`w-20 h-20 mx-auto rounded-full ${colorConfig.bg} flex items-center justify-center mb-6`}>
                        <ResultIcon size={48} className={`${colorConfig.text} animate-bounce`} />
                    </div>

                    {isCancelled ? (
                         <>
                            <h2 className={`text-3xl md:text-4xl font-black ${colorConfig.text} mb-1 tracking-tighter uppercase`}>
                                Kết Quả Bị Hủy
                            </h2>
                            <p className="text-red-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-6">
                                Vi phạm quy chế thi nghiêm trọng
                            </p>
                         </>
                    ) : (
                         <>
                            {/* Điểm số với màu động */}
                            <h2 className={`text-5xl font-black ${colorConfig.text} mb-1 tracking-tighter`}>
                                {score}/10
                            </h2>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-6">
                                Đã nộp bài thành công
                            </p>
                         </>
                    )}

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left mb-8">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                            <ShieldAlert className="text-slate-500" size={18} />
                            <h4 className="text-sm font-bold text-slate-700 uppercase">Nhật ký giám sát</h4>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {logs.length > 0 ? (
                                logs.map((log, index) => {
                                    const isCritical = log.action === "Kích hoạt tự động nộp bài";
                                    return (
                                        <div key={index} className={`flex gap-3 text-sm p-3 rounded-xl border ${isCritical ? 'bg-red-50 border-red-300 text-red-700 font-bold shadow-sm' : 'bg-white border-slate-100 text-slate-600'}`}>
                                            <span className={`font-mono shrink-0 mt-0.5 ${isCritical ? 'text-red-500' : 'text-slate-400'}`}>{log.time}</span>
                                            <div>
                                                <p className={isCritical ? 'font-black uppercase text-red-700' : 'font-bold text-slate-700'}>{log.action}</p>
                                                <p className={isCritical ? 'text-red-600 font-bold' : 'text-slate-500 text-xs mt-1'}>{log.detail}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-slate-500 italic">Không có bất thường nào được ghi nhận.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {!isCancelled && (
                            <button
                                onClick={() => setIsReviewOpen(true)}
                                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition"
                            >
                                Xem chi tiết đáp án
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/courses/general-course')}
                            className={`flex-1 py-4 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg transition ${isCancelled || score < 4 ? "bg-red-600 shadow-red-500/30" :
                                score <= 7 ? "bg-amber-500 shadow-amber-500/30" :
                                    "bg-blue-600 shadow-blue-500/30"
                                }`}
                        >
                            Về trang chủ
                        </button>
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
    }

    // MÀN HÌNH LÀM BÀI CHÍNH (GIAO DIỆN SÁNG, ĐƠN GIẢN)
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 select-none pb-12">
            {/* Thanh thời gian */}
            <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 z-50">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 60 ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ width: `${(timeLeft / totalInitialTime) * 100}%` }}
                />
            </div>

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Phòng thi giám sát
                        </span>
                        <h1 className="text-sm font-black text-slate-800">{examData?.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100">
                        <Clock size={16} className={timeLeft <= 60 ? 'text-rose-500 animate-pulse' : 'text-slate-500'} />
                        <span className={`text-lg font-black tabular-nums ${timeLeft <= 60 ? 'text-rose-500' : 'text-slate-700'}`}>
                            {formatTime(timeLeft || 0)}
                        </span>
                    </div>

                    <button
                        onClick={() => {
                            if (window.confirm("Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?")) {
                                handleFinalSubmit();
                            }
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition shadow-md flex items-center gap-2"
                    >
                        <Send size={14} /> Nộp Bài
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full px-6 grid grid-cols-12 gap-8 flex-1 mt-8">
                {/* Khu vực câu hỏi */}
                <div className="col-span-12 lg:col-span-8 flex flex-col">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10 flex-1 flex flex-col min-h-[400px]">
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
                                    DẠNG: {currentQuestion?.type?.replace('_', ' ')}
                                </span>
                                <span className="text-slate-500 font-bold text-xs uppercase">Câu {currentQuestionIndex + 1} / {totalQuestions}</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                                {currentQuestion?.questionText}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3 mt-auto">
                            {currentQuestion?.options.map((option, idx) => {
                                const isSelected = answersMap[currentQuestion.id] === option.id;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(option.id)}
                                        className={`p-5 rounded-2xl font-semibold text-left transition-all flex items-center justify-between border-2
                                            ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700'}`}
                                    >
                                        <span className="text-sm md:text-base pr-10">{option.optionText}</span>
                                        <div className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-all
                                            ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                                            <span className="text-xs">{String.fromCharCode(65 + idx)}</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="p-4 bg-white rounded-2xl text-slate-500 hover:bg-slate-50 border border-slate-200 disabled:opacity-30 transition shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            disabled={currentQuestionIndex === totalQuestions - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="p-4 bg-white rounded-2xl text-slate-500 hover:bg-slate-50 border border-slate-200 disabled:opacity-30 transition shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Sidebar Trạng thái & Tiến độ */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sticky top-28">
                        <h3 className="text-xs font-bold uppercase text-slate-500 mb-6 text-center">Bảng câu hỏi</h3>
                        <div className="grid grid-cols-5 gap-2.5">
                            {questions.map((q, i) => {
                                const isDone = answersMap[q.id] !== undefined;
                                const isCurrent = currentQuestionIndex === i;

                                let style = "bg-white text-slate-500 border-slate-200";
                                if (isDone) style = "bg-blue-50 text-blue-600 border-blue-200";
                                if (isCurrent) style = isDone ? "bg-blue-600 text-white border-blue-600 ring-2 ring-offset-2 ring-blue-300" : "bg-slate-800 text-white border-slate-800 ring-2 ring-offset-2 ring-slate-300";

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentQuestionIndex(i)}
                                        className={`aspect-square rounded-xl border flex items-center justify-center transition-all text-xs font-bold ${style}`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs font-bold mb-3">
                                <span className="text-slate-500">Tiến độ</span>
                                <span className="text-blue-600">{Object.keys(answersMap).length}/{totalQuestions}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(Object.keys(answersMap).length / totalQuestions) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Cảnh Báo Vi Phạm */}
            {showWarningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-md w-full rounded-3xl p-8 text-center shadow-2xl">
                        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 text-rose-500">
                            <AlertTriangle size={30} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Cảnh báo vi phạm!</h3>
                        <p className="text-rose-600 font-bold text-sm mb-4">Bạn vừa rời khỏi màn hình làm bài</p>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Bài thi đang được giám sát chặt chẽ. Hệ thống đã ghi nhận cảnh báo. Nếu vi phạm lần thứ 2, bài làm sẽ bị hệ thống tự động khóa và nộp điểm.
                        </p>
                        <button
                            onClick={() => setShowWarningModal(false)}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm uppercase transition-all"
                        >
                            Tôi đã hiểu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// =========================================================
// REVIEW MODAL (ĐÃ ĐIỀU CHỈNH LIGHT THEME)
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-800 uppercase">Chi tiết đáp án</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-slate-400 text-xs font-bold uppercase">
                                <th className="px-4 py-3 text-center">Câu</th>
                                <th className="px-6 py-3">Câu hỏi</th>
                                <th className="px-6 py-3">Đáp án đúng</th>
                                <th className="px-6 py-3">Bạn chọn</th>
                                <th className="px-6 py-3 text-center">Kết quả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultData.userAnswer?.map((item, index) => (
                                <tr key={index} className="bg-white shadow-sm rounded-xl">
                                    <td className="px-4 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-700">{item.questionText}</td>
                                    <td className="px-6 py-4 text-emerald-600 font-bold">{getOptionText(item.questionId, item.correctOptionId)}</td>
                                    <td className={`px-6 py-4 font-bold ${item.isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {getOptionText(item.questionId, item.selectedOptionId)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            {item.isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};