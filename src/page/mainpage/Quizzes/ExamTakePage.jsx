import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Clock, Loader2, Send, X, 
  CheckCircle2, XCircle, Info, Lock, ShieldAlert, FileText, Check, ListOrdered
} from "lucide-react";
import exerciseService from "../../../AdminControl/Service/API/lessonServiceAPI/exercise.service";

export default function ExamTakePage() {
    const { exerciseId } = useParams();
    const navigate = useNavigate();

    // Verification credentials
    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [activationCode, setActivationCode] = useState("");
    
    // Exam states
    const [examData, setExamData] = useState(null);
    const [loadingExam, setLoadingExam] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
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

    const questions = useMemo(() => {
        return examData?.questions || [];
    }, [examData]);

    const currentQuestion = questions[currentQuestionIndex] || null;
    const totalQuestions = questions.length;

    // --- Helper to log actions ---
    const addLog = (action, detail) => {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0]; // "HH:MM:SS"
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
            try {
                setLoadingExam(true);
                const data = await exerciseService.getDetail(parseInt(exerciseId));
                if (data) {
                    setExamData(data);
                } else {
                    alert("Không tìm thấy thông tin đề thi!");
                }
            } catch (err) {
                console.error("Lỗi khi tải thông tin bài thi:", err);
            } finally {
                setLoadingExam(false);
            }
        };
        fetchExamDetail();
    }, [exerciseId]);

    // Handle student info verification
    const handleVerifyAccess = async (e) => {
        e.preventDefault();
        if (!studentName.trim() || !studentEmail.trim() || !activationCode.trim()) {
            alert("Vui lòng nhập đầy đủ thông tin xác thực!");
            return;
        }

        setVerifying(true);
        try {
            const res = await exerciseService.verifyExamCode(
                parseInt(exerciseId),
                studentName.trim(),
                studentEmail.trim(),
                activationCode.trim()
            );
            if (res && res.success) {
                setIsVerified(true);
                addLog("Xác thực thành công", `Học sinh: ${studentName.trim()} (${studentEmail.trim()}) đã xác thực với mã code.`);
            } else {
                alert("❌ Mã xác thực bài thi không hợp lệ hoặc thông tin không trùng khớp!");
            }
        } catch (err) {
            console.error("Xác thực thất bại:", err);
            const errMsg = err.response?.data?.message || err.message || "Lỗi xác thực không rõ";
            alert(`❌ Xác thực thất bại: ${errMsg}`);
        } finally {
            setVerifying(false);
        }
    };

    // Start Exam Setup proctor listeners and timer
    const handleStartExam = () => {
        setIsStarted(true);
        addLog("Bắt đầu làm bài thi", "Bắt đầu làm bài kiểm tra chính thức và kích hoạt giám sát trực tuyến.");
        
        // Lock screen select/copy/paste
        const duration = (examData?.timeLimit || 45) * 60; // default to minutes
        setTimeLeft(duration);
        setTotalInitialTime(duration);
    };

    // --- PROCTORING SYSTEM (Copy block, Context Menu block, Tab focus loss checking) ---
    useEffect(() => {
        if (!isStarted || showScore) return;

        // 1. Block Keyboard operations (Copy/Paste/Cut)
        const handleClipboard = (e) => {
            e.preventDefault();
            addLog("Sao chép/Dán bị chặn", "Người dùng cố gắng copy/cut/paste đề thi hoặc đáp án.");
            alert("⚠️ Cảnh báo bảo mật: Hành động sao chép (Copy) và dán (Paste) bị khóa hoàn toàn trong bài thi!");
        };

        // 2. Block Right click (Context menu)
        const handleContextMenu = (e) => {
            e.preventDefault();
            addLog("Mở Context Menu bị chặn", "Người dùng click chuột phải.");
        };

        window.addEventListener("copy", handleClipboard);
        window.addEventListener("cut", handleClipboard);
        window.addEventListener("paste", handleClipboard);
        window.addEventListener("contextmenu", handleContextMenu);

        // 3. Tab Switching detection (Visibility state + Window focus)
        const handleTabSwitchAway = () => {
            addLog("Rời cửa sổ thi", "Người dùng chuyển tab hoặc mở ứng dụng khác.");

            // Set timeout of 3s to trigger a violation
            blurTimeoutRef.current = setTimeout(() => {
                const nextWarnings = warningsRef.current + 1;
                warningsRef.current = nextWarnings;
                setWarnings(nextWarnings);
                addLog(`Cảnh báo vi phạm lần ${nextWarnings}`, "Học sinh rời tab làm bài quá 3 giây.");

                if (nextWarnings >= 2) {
                    addLog("Kích hoạt tự động nộp bài", "Vi phạm rời tab quá 2 lần. Hệ thống tự động khóa đề và nộp bài.");
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

        // Hook visibility and focus events
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

    // Prevent going back using browser history
    useEffect(() => {
        if (!isStarted || showScore) return;

        const handlePopState = (e) => {
            window.history.pushState(null, "", window.location.pathname);
            alert("⚠️ Bạn đang trong quá trình làm bài thi. Không thể sử dụng phím quay lại!");
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

            // Submit exercise results along with proctoring logs in payload metadata
            const result = await exerciseService.submitExercise({
                exerciseId: parseInt(exerciseId),
                answers: formattedAnswers,
                metadata: {
                    studentName: studentName.trim(),
                    studentEmail: studentEmail.trim(),
                    warningCount: warningsRef.current,
                    proctorLogs: logsRef.current
                }
            });

            setSubmissionResult(result);
            setShowScore(true);
        } catch (error) {
            console.error("Lỗi khi nộp bài thi:", error);
            alert("Nộp bài thi thất bại. Vui lòng liên hệ giám thị hoặc tải lại trang!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptionSelect = (optionId) => {
        if (isSubmitting || showScore) return;
        const currentQId = currentQuestion.id;
        
        // Log choice selection
        addLog("Chọn đáp án", `Câu ${currentQuestionIndex + 1}: Lựa chọn đáp án ID ${optionId}`);
        setAnswersMap(prev => ({ ...prev, [currentQId]: optionId }));

        // Auto transition to next question with a slight delay
        if (currentQuestionIndex < totalQuestions - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 350);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    // Loading State
    if (loadingExam) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
                <Loader2 size={50} className="text-emerald-500 animate-spin mb-4" />
                <p className="font-black text-xs uppercase tracking-widest text-gray-400">Đang tải cấu hình đề thi...</p>
            </div>
        );
    }

    // Step 1: Verification Screen
    if (!isVerified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #091a10 0%, #050d09 100%)" }}>
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-white/10 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 text-emerald-400 animate-pulse">
                        <Lock size={30} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Cổng Xác Thực Bài Thi</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6">Xác nhận thông tin để bắt đầu làm bài</p>

                    <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 text-left text-xs text-emerald-400 font-medium mb-6 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 mb-1"><Info size={14} /> Gợi ý thử nghiệm (Demo Code):</div>
                        <p>• Nhập Mã Xác Thực: <span className="font-black underline">EXAM26</span> hoặc <span className="font-black underline">123456</span></p>
                        <p>• Hệ thống sẽ tự động liên kết tài khoản thi của bạn.</p>
                    </div>

                    <form onSubmit={handleVerifyAccess} className="space-y-4 text-left">
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 px-1">Tên Học Sinh</label>
                            <input
                                type="text"
                                required
                                placeholder="Ví dụ: Nguyễn Văn A"
                                className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 font-bold text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white/10 transition-all"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 px-1">Địa chỉ Email</label>
                            <input
                                type="email"
                                required
                                placeholder="student@example.com"
                                className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 font-bold text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white/10 transition-all"
                                value={studentEmail}
                                onChange={(e) => setStudentEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-400 px-1">Mã xác thực (Được gửi qua Mail)</label>
                            <input
                                type="text"
                                required
                                placeholder="Nhập mã 6 ký tự..."
                                className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 font-mono tracking-wider font-bold text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white/10 transition-all"
                                value={activationCode}
                                onChange={(e) => setActivationCode(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={verifying}
                            className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-950/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {verifying ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Đang xác minh...
                                </>
                            ) : (
                                "Xác thực & Kích hoạt"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Step 2: Proctored Start Confirmation
    if (isVerified && !isStarted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #091a10 0%, #050d09 100%)" }}>
                <div className="max-w-xl w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-white/10 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20 text-amber-400">
                        <ShieldAlert size={30} />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">ĐỀ THI: {examData?.title}</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6">Thời gian làm bài: {examData?.timeLimit || 45} phút | Tổng số câu hỏi: {totalQuestions} câu</p>

                    <div className="bg-rose-500/10 rounded-[1.5rem] p-6 border border-rose-500/20 text-left space-y-3 mb-8">
                        <h4 className="text-sm font-black text-rose-400 uppercase tracking-wide">⚠️ QUY CHẾ THI NGHIÊM NGẶT:</h4>
                        <ul className="text-xs text-gray-300 space-y-2 leading-relaxed">
                            <li className="flex items-start gap-2">
                                <span className="text-rose-400 font-bold">•</span>
                                <span>**Không chuyển Tab/Cửa sổ**: Hệ thống sẽ ghi nhận log nếu bạn rời màn hình. Rời màn hình quá 3 giây sẽ nhận cảnh báo. Vi phạm lần thứ 2, bài thi sẽ **tự động nộp**.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-400 font-bold">•</span>
                                <span>**Không Sao chép/Chuột phải**: Mọi hành vi copy, cut, paste, click chuột phải đều bị chặn nhằm bảo mật đề thi.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-rose-400 font-bold">•</span>
                                <span>**Tự động lưu**: Hệ thống tự động ghi nhận nhật ký làm bài và câu trả lời.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsVerified(false)}
                            className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={handleStartExam}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-950/20 active:scale-95"
                        >
                            Vào làm bài
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 4: Submission screen & Proctor Logs Display
    if (showScore && submissionResult) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 text-center animate-in zoom-in duration-500">
                    <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-5xl font-black text-slate-800 mb-1 tracking-tighter">{submissionResult.score}/10</h2>
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] mb-6">
                        Kết quả bài thi đã được gửi đi
                    </p>

                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-left mb-8 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
                            <ShieldAlert className="text-slate-700" size={18} />
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">NHẬT KÝ GIÁM SÁT (AUDIT PROCTOR LOGS)</h4>
                        </div>
                        
                        <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {logs.map((log, index) => (
                                <div key={index} className="flex items-start gap-3 text-xs leading-relaxed border-b border-slate-100 pb-2 last:border-none">
                                    <span className="font-mono text-slate-400 shrink-0 font-bold">{log.time}</span>
                                    <div className="flex-1">
                                        <span className={`font-black uppercase text-[10px] tracking-tight mr-2 px-1.5 py-0.5 rounded ${
                                            log.action.includes("Cảnh báo") ? "bg-rose-50 text-rose-600" :
                                            log.action.includes("Bắt đầu") ? "bg-green-50 text-green-700" :
                                            log.action.includes("Xác thực") ? "bg-emerald-50 text-emerald-700" :
                                            log.action.includes("chặn") ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"
                                        }`}>
                                            {log.action}
                                        </span>
                                        <span className="text-slate-500 font-medium">{log.detail}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs font-bold text-slate-500">
                            <span>Tổng số lỗi vi phạm chuyển tab:</span>
                            <span className={`font-black text-sm px-3 py-1 rounded-full ${warnings >= 2 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                                {warnings} / 2 lần vi phạm
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsReviewOpen(true)} 
                            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition"
                        >
                            Xem chi tiết đáp án
                        </button>
                        <button 
                            onClick={() => navigate('/courses/general-course')} 
                            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition"
                        >
                            Quay lại khóa học
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

    // Step 3: Immersive proctored exam sheet
    return (
        <div className="min-h-screen bg-slate-955 flex flex-col font-sans text-gray-200 select-none pb-12" style={{ background: "linear-gradient(135deg, #091a10 0%, #050d09 100%)" }}>
            {/* Top Security Banner / Timer */}
            <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-800 z-50">
                <div 
                    className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 60 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-emerald-500'}`} 
                    style={{ width: `${(timeLeft / totalInitialTime) * 100}%` }} 
                />
            </div>

            <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500">
                        <Lock size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                            <span className="w-2 h-2 bg-rose-500 rounded-full"></span> 
                            Màn hình thi giám sát
                        </span>
                        <h1 className="text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-sm">{examData?.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5 bg-white/5 px-5 py-2.5 rounded-xl border border-white/10">
                        <Clock size={16} className={timeLeft <= 60 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'} />
                        <span className={`text-lg font-black tabular-nums ${timeLeft <= 60 ? 'text-rose-500' : 'text-white'}`}>
                            {formatTime(timeLeft || 0)}
                        </span>
                    </div>

                    <button 
                        onClick={() => {
                            if (window.confirm("⚠️ Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?")) {
                                handleFinalSubmit();
                            }
                        }} 
                        className="bg-emerald-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-950/20 flex items-center gap-2"
                    >
                        <Send size={14} /> Nộp Bài Thi
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full px-6 grid grid-cols-12 gap-8 flex-1 mt-8">
                {/* Left side: Questions Panel */}
                <div className="col-span-12 lg:col-span-8 flex flex-col min-w-0">
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 md:p-12 flex-1 flex flex-col min-h-[400px]">
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="px-3 py-1 bg-white/5 text-gray-300 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">
                                    DẠNG: {currentQuestion?.type?.replace('_', ' ')}
                                </span>
                                <span className="text-gray-500 font-black text-[9px] uppercase tracking-widest">Câu hỏi {currentQuestionIndex + 1} / {totalQuestions}</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white leading-snug">
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
                                        className={`group p-5 rounded-2xl font-black text-left transition-all duration-200 flex items-center justify-between border-2
                                            ${isSelected ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-300'}`}
                                    >
                                        <span className="text-sm md:text-base pr-10">{option.optionText}</span>
                                        <div className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center transition-all
                                            ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 text-gray-500'}`}>
                                            <span className="text-xs">{String.fromCharCode(65 + idx)}</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 px-2">
                        <button 
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="p-4 bg-white/5 rounded-2xl text-gray-400 hover:text-white border border-white/5 disabled:opacity-10 transition"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <span className="text-xs font-bold text-gray-500">Mã thí sinh: {studentEmail}</span>
                        <button 
                            disabled={currentQuestionIndex === totalQuestions - 1}
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="p-4 bg-white/5 rounded-2xl text-gray-400 hover:text-white border border-white/5 disabled:opacity-10 transition"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Right side: Questions Index List & Proctor Status */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    {/* Status card */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 flex flex-col text-left">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Trạng thái giám sát</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400">Số lần cảnh báo vi phạm:</span>
                                <span className={`text-xs font-black px-3 py-1 rounded-full ${warnings > 0 ? "bg-rose-500/20 text-rose-400 animate-pulse" : "bg-emerald-500/20 text-emerald-400"}`}>
                                    {warnings} / 2 lần vi phạm
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 p-3.5 rounded-xl border border-white/5 text-[10px] text-gray-400 font-medium leading-relaxed">
                                <Info size={14} className="shrink-0 text-emerald-400" />
                                <span>Chuyển tab quá 3 giây sẽ nhận cảnh báo lần 1. Vi phạm lần 2 sẽ tự động nộp bài.</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress grid */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 sticky top-28">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 text-center">Tiến độ làm bài</h3>
                        <div className="grid grid-cols-5 gap-2.5">
                            {questions.map((q, i) => {
                                const isDone = answersMap[q.id] !== undefined;
                                const isCurrent = currentQuestionIndex === i;
                                
                                let style = "bg-white/5 text-gray-500 border-white/5";
                                if (isDone) style = "bg-emerald-600/20 text-emerald-400 border-emerald-600/30";
                                if (isCurrent) style = isDone ? "bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-500/10 scale-105" : "bg-white/10 text-white border-white/20 ring-4 ring-white/5 scale-105";

                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentQuestionIndex(i)} 
                                        className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all text-xs font-black ${style}`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-gray-400 uppercase tracking-widest">Đã hoàn thành</span>
                                <span className="text-sm font-black text-emerald-400">{Object.keys(answersMap).length}/{totalQuestions} câu</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(Object.keys(answersMap).length / totalQuestions) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Warning Modal (Tab Switch violation alert) */}
            {showWarningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-rose-500/30 max-w-md w-full rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-5 border border-rose-500/20 text-rose-500 animate-bounce">
                            <ShieldAlert size={28} />
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">⚠️ Cảnh báo vi phạm quy chế</h3>
                        <p className="text-rose-400 font-bold text-xs uppercase tracking-wider mb-4">Bạn đã rời màn hình thi quá 3 giây!</p>
                        <p className="text-gray-300 text-xs leading-relaxed mb-6">
                            Bài thi đang được giám sát chặt chẽ. Hệ thống đã ghi nhận log rời tab. **Vi phạm lần thứ 2, bài làm của bạn sẽ tự động được nộp** và điểm số được gửi về hệ thống!
                        </p>
                        <button
                            onClick={() => setShowWarningModal(false)}
                            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-950/20 active:scale-95 transition-all"
                        >
                            Tôi đã hiểu & Tiếp tục thi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// =========================================================
// 3. INTERNAL REVIEW MODAL COMPONENT (LOCAL HELPER)
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Chi tiết đáp án & Kết quả</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-60">Review your exam answers</p>
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
                                <th className="px-6 py-3 text-center">Kết quả</th>
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
                                    <td className="px-6 py-5 bg-white rounded-r-2xl border-y border-r border-slate-100 shadow-sm text-center">
                                        <div className="flex items-center justify-center">
                                            {item.isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
                                        </div>
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
