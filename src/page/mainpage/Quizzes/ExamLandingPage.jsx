import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText, KeyRound, ArrowRight, Loader2, ShieldCheck,
    Clock, ListOrdered, AlertCircle, BookOpen, Lock
} from "lucide-react";
import exerciseService from "../../../AdminControl/Service/API/lessonServiceAPI/exercise.service";

export default function ExamLandingPage() {
    const navigate = useNavigate();

    const [exerciseId, setExerciseId]       = useState("");
    const [studentName, setStudentName]     = useState("");
    const [studentEmail, setStudentEmail]   = useState("");
    const [examCode, setExamCode]           = useState("");

    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!exerciseId || !studentName.trim() || !studentEmail.trim() || !examCode.trim()) {
            setError("Vui lòng nhập đầy đủ tất cả thông tin.");
            return;
        }

        setLoading(true);
        try {
            const res = await exerciseService.verifyExamCode(
                parseInt(exerciseId),
                studentName.trim(),
                studentEmail.trim(),
                examCode.trim().toUpperCase()
            );

            if (res && res.success) {
                navigate(`/user/exams/take/${exerciseId}`, {
                    state: {
                        prefillName: studentName.trim(),
                        prefillEmail: studentEmail.trim(),
                        prefillCode: examCode.trim().toUpperCase(),
                        preVerified: true,
                    }
                });
            } else {
                setError("Mã xác thực không hợp lệ hoặc thông tin không trùng khớp. Vui lòng kiểm tra lại.");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || "Lỗi xác thực";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-emerald-50/20 py-12 px-4">
            {/* Page Header */}
            <div className="max-w-xl mx-auto mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-xl shadow-sky-100 mb-5">
                    <FileText size={28} className="text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight italic">
                    Phòng Thi
                </h1>
                <p className="text-slate-400 text-sm font-medium mt-2">
                    Nhập thông tin xác thực để vào làm bài kiểm tra
                </p>
            </div>

            {/* Card */}
            <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 overflow-hidden">
                {/* Top banner */}
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                        <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-black text-sm uppercase tracking-widest">Xác thực bài thi</p>
                        <p className="text-sky-100 text-[11px] font-medium">Bài thi có giám sát — không được rời khỏi trang</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
                    {/* Exam ID */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                            Mã bài thi (ID)
                        </label>
                        <div className="relative">
                            <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                            <input
                                type="number"
                                required
                                placeholder="Ví dụ: 12"
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sky-500/20 transition-all border border-transparent focus:border-sky-200"
                                value={exerciseId}
                                onChange={e => setExerciseId(e.target.value)}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 px-1">ID bài thi được cung cấp bởi giáo viên cùng với mã xác thực</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Student Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Nguyễn Văn A"
                                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sky-500/20 transition-all border border-transparent focus:border-sky-200"
                                value={studentName}
                                onChange={e => setStudentName(e.target.value)}
                            />
                        </div>
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="student@email.com"
                                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sky-500/20 transition-all border border-transparent focus:border-sky-200"
                                value={studentEmail}
                                onChange={e => setStudentEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Exam Code */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                            Mã xác thực (nhận qua email)
                        </label>
                        <div className="relative">
                            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                            <input
                                type="text"
                                required
                                maxLength={8}
                                placeholder="ABC123"
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-black tracking-[0.3em] uppercase text-gray-700 outline-none focus:ring-2 focus:ring-sky-500/20 transition-all border border-transparent focus:border-sky-200"
                                value={examCode}
                                onChange={e => setExamCode(e.target.value.toUpperCase())}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Rules notice */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <Lock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                            Sau khi vào phòng thi, hệ thống sẽ giám sát hành động của bạn.
                            Rời khỏi tab &gt; 3 giây sẽ bị cảnh báo. Vi phạm 2 lần sẽ nộp bài tự động.
                            Sao chép, dán và click chuột phải bị vô hiệu hóa.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-sky-100 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <><Loader2 size={16} className="animate-spin" /> Đang xác thực...</>
                        ) : (
                            <><ShieldCheck size={16} /> Vào Phòng Thi <ArrowRight size={16} /></>
                        )}
                    </button>
                </form>

                {/* Footer note */}
                <div className="px-8 pb-7">
                    <p className="text-center text-[10px] text-gray-300 font-medium uppercase tracking-widest">
                        Liên hệ giáo viên nếu chưa nhận được mã thi qua email
                    </p>
                </div>
            </div>

            {/* Info cards */}
            <div className="max-w-xl mx-auto mt-8 grid grid-cols-3 gap-4">
                {[
                    { icon: ShieldCheck, title: "Bảo mật",       desc: "Mã dùng một lần, hết hiệu lực sau khi nộp bài" },
                    { icon: Clock,       title: "Giới hạn giờ",   desc: "Đồng hồ đếm ngược từ khi bắt đầu làm bài" },
                    { icon: ListOrdered, title: "Nhật ký",        desc: "Hành động trong phòng thi được ghi lại đầy đủ" },
                ].map(({ icon: Icon, title, desc }, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 text-center">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center mx-auto mb-3">
                            <Icon size={16} className="text-sky-500" />
                        </div>
                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-wide mb-1">{title}</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
