import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    FileText, KeyRound, ArrowRight, Loader2, ShieldCheck,
    AlertCircle, Lock, MonitorCheck, CameraOff,
    FileWarning, ShieldAlert, Laptop, ScrollText, CheckCircle2,
    PenLine
} from "lucide-react";
import exerciseService from "../../../AdminControl/Service/API/lessonServiceAPI/exercise.service";

export default function ExamLandingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [studentName, setStudentName] = useState(searchParams.get("name") || "");
    const [studentEmail, setStudentEmail] = useState(searchParams.get("email") || "");
    const [examCode, setExamCode] = useState("");

    const [isAgreed, setIsAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!isAgreed) {
            setError("Hệ thống từ chối truy cập: Bạn chưa ký xác nhận quy chế phòng thi.");
            return;
        }

        if (!studentName.trim() || !studentEmail.trim() || !examCode.trim()) {
            setError("Vui lòng nhập đầy đủ tất cả thông tin.");
            return;
        }

        setLoading(true);
        try {
            const res = await exerciseService.verifyExamCode(
                studentName.trim(),
                studentEmail.trim(),
                examCode.trim().toUpperCase()
            );

            if (res && res.success) {
                const fetchedExerciseId = res.exerciseId || res.data?.exerciseId;

                if (!fetchedExerciseId) {
                    setError("Lỗi hệ thống: Backend không trả về ID bài thi.");
                    return;
                }

                navigate(`/user/exams/take/${fetchedExerciseId}`, {
                    state: {
                        prefillName: studentName.trim(),
                        prefillEmail: studentEmail.trim(),
                        prefillCode: examCode.trim().toUpperCase(),
                        preVerified: true,
                    }
                });
            } else {
                setError("Mã xác thực không hợp lệ. Vui lòng kiểm tra lại.");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || "Lỗi xác thực";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9] py-8 px-4 lg:py-12 flex items-center justify-center">
            <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">

                {/* ======================================= */}
                {/* TRÁI (6 CỘT) - FORM NHẬP THÔNG TIN      */}
                {/* ======================================= */}
                <div className="lg:col-span-6 w-full flex flex-col justify-between space-y-6">
                    <div>
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/30 mb-4">
                            <FileText size={24} className="text-white" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
                            Hệ Thống Thi Khảo Sát
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-2">
                            Môi trường thi trực tuyến bảo mật cao. Vui lòng điền thông tin để tiếp tục.
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex-1 flex flex-col justify-between">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Lock size={18} className="text-blue-100" />
                                <p className="text-white font-bold text-sm tracking-wide">Xác Thực Thông Tín Thí Sinh</p>
                            </div>

                            {/* BADGE: CHỜ KÝ CAM KẾT ĐƯỢC THIẾT KẾ LẠI BẮT MẮT */}
                            {isAgreed ? (
                                <span className="text-xs font-black bg-emerald-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/40 transition-all">
                                    <CheckCircle2 size={14} strokeWidth={3} /> Đã ký cam kết
                                </span>
                            ) : (
                                <div className="relative flex items-center">
                                    <span className="absolute flex h-3 w-3 -top-1 -right-1 z-10">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-xs font-black bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/40 border border-red-400 animate-pulse">
                                        <PenLine size={14} strokeWidth={3} /> Yêu cầu ký cam kết
                                    </span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5 flex-1 flex flex-col justify-center">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Họ và tên thí sinh</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nguyễn Văn A"
                                        className="w-full px-4 py-3.5 bg-slate-50 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-slate-200 focus:border-blue-500 transition-all"
                                        value={studentName}
                                        onChange={e => setStudentName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email đăng ký hệ thống</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="student@domain.edu.vn"
                                        className="w-full px-4 py-3.5 bg-slate-50 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-slate-200 focus:border-blue-500 transition-all"
                                        value={studentEmail}
                                        onChange={e => setStudentEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mã xác thực bài thi (Passcode)</label>
                                    <div className="relative">
                                        <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            maxLength={8}
                                            placeholder="MÃ NHẬN QUA EMAIL"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl text-base font-black tracking-[0.25em] uppercase text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-slate-200 focus:border-indigo-500 transition-all"
                                            value={examCode}
                                            onChange={e => setExamCode(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mt-2">
                                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 font-bold">{error}</p>
                                </div>
                            )}

                            <div className="mt-4 space-y-2">
                                <button
                                    type="submit"
                                    disabled={loading || !isAgreed}
                                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${isAgreed
                                            ? "bg-slate-800 hover:bg-slate-900 text-white shadow-slate-400/50"
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        }`}
                                >
                                    {loading ? (
                                        <><Loader2 size={18} className="animate-spin" /> Đang chuẩn bị phòng thi...</>
                                    ) : (
                                        <><ShieldCheck size={18} /> Khởi động phòng thi <ArrowRight size={18} /></>
                                    )}
                                </button>
                                {!isAgreed && (
                                    <div className="text-center p-2 rounded-lg bg-red-50 border border-red-100">
                                        <p className="text-xs font-bold text-red-600">
                                            ⚠️ BẮT BUỘC: Hãy đọc và tích chọn cam kết ở văn bản bên phải.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* PHẢI (6 CỘT) - ĐÚNG CHUẨN ĐỒNG BỘ VĂN BẢN QUY CHẾ ĐẸP MẮT */}
                {/* ======================================================== */}
                <div className="lg:col-span-6 flex flex-col justify-between">
                    <div className={`bg-white rounded-[2rem] p-6 lg:p-8 shadow-xl border-2 flex-1 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isAgreed ? 'border-emerald-400 shadow-emerald-100' : 'border-red-300 shadow-red-100'}`}>

                        <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-bl-full pointer-events-none flex items-start justify-end p-4">
                            <ScrollText size={32} className="text-slate-200/70" />
                        </div>

                        <div>
                            <div className="border-b-2 border-dashed border-slate-200 pb-5 mb-5 text-center">
                                <div className="mx-auto w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-2">
                                    <ShieldAlert className="text-red-600" size={20} />
                                </div>
                                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                                    Văn Bản Quy Chế & Điều Khoản
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    Mã hiệu Quy định: EST-2026/SECURE
                                </p>
                            </div>

                            <div className="space-y-5 text-slate-700 text-xs leading-relaxed max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                <p className="font-semibold text-slate-500 italic">
                                    Bằng việc kích hoạt phòng thi, hệ thống sẽ tự động bật các tính năng bảo mật toàn diện. Thí sinh bắt buộc tuân thủ các điều khoản nghiêm ngặt sau:
                                </p>

                                <div className="flex gap-3">
                                    <MonitorCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-0.5">1. Chế độ cố định Toàn màn hình (Fullscreen)</h4>
                                        <p className="text-slate-500">Hệ thống sẽ khóa trình duyệt ở chế độ Toàn màn hình. Hành vi thoát Fullscreen, mở tab mới, chuyển đổi ứng dụng (Alt+Tab) đều kích hoạt cảnh báo vi phạm.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <CameraOff size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-0.5">2. Chặn Chụp ảnh / Quay video / DevTools</h4>
                                        <p className="text-slate-500">Nghiêm cấm các công cụ ghi hình, chia sẻ màn hình. Các phím tắt hệ thống nguy cơ gian lận (F12, Inspect Element), lệnh Click chuột phải, Copy & Paste hoàn toàn bị vô hiệu hóa.</p>
                                    </div>
                                </div>

                                {/* ĐIỀU KHOẢN 3 ĐƯỢC LÀM ĐỎ LÊN VÀ GHI RÕ QUY TẮC 5 GIÂY */}
                                <div className="flex gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                                    <FileWarning size={20} className="text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-red-700 text-sm mb-1 uppercase tracking-wide">3. Khóa bài tự động sau 5 giây vi phạm</h4>
                                        <p className="text-red-600 font-medium leading-relaxed">
                                            Hệ thống ghi log liên tục. Khi thí sinh cố tình rời khỏi tab làm bài, một thông báo cảnh báo sẽ hiển thị lập tức. <b>Nếu việc rời tab kéo dài quá 5 giây, màn hình sẽ bị khóa vĩnh viễn và tự động đẩy kết quả 0 điểm</b> lên hệ thống (exercise-attempt).
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 text-slate-300 rounded-xl p-4 space-y-2 mt-4">
                                    <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
                                        <Laptop size={14} className="text-sky-400" />
                                        <span className="text-[11px] font-bold uppercase text-white tracking-wider">Thông số phần mềm bảo mật</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div>• Trình duyệt: <span className="text-white font-medium">Chrome/Edge (Mới nhất)</span></div>
                                        <div>• Mạng ổn định: <span className="text-white font-medium">&gt; 5 Mbps</span></div>
                                        <div>• Time Limit: <span className="text-red-400 font-medium">Khóa sau 5s gian lận</span></div>
                                        <div>• System Log: <span className="text-emerald-400 font-medium">Ghi đè thời gian thực</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CHECKBOX CHẤP NHẬN ĐIỀU KHOẢN */}
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer select-none transition-all border-2 ${isAgreed
                                    ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm"
                                    : "bg-red-50 border-red-300 text-red-900 hover:bg-red-100 animate-pulse"
                                }`}>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded mt-0.5 border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                                    checked={isAgreed}
                                    onChange={e => setIsAgreed(e.target.checked)}
                                />
                                <div className="text-[11px] lg:text-xs font-bold leading-relaxed">
                                    Tôi xác nhận đã đọc toàn bộ quy chế, hiểu rõ cơ chế "Khóa bài sau 5 giây" và đồng ý nhận điểm 0 nếu vi phạm bất kỳ quy định nào.
                                </div>
                            </label>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}