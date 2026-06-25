import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, Volume2, RotateCcw,
  ChevronLeft, ChevronRight, CheckCircle2,
  BookOpen, ArrowRight,
} from "lucide-react";

// ─── Mock data ───
const MOCK_FLASHCARDS = [
  { id: 1, front: "안녕하세요", back: "Xin chào", romanization: "Annyeonghaseyo", example: "안녕하세요, 만나서 반갑습니다.", exampleTrans: "Xin chào, rất vui được gặp bạn." },
  { id: 2, front: "감사합니다", back: "Cảm ơn", romanization: "Gamsahamnida", example: "도와주셔서 감사합니다.", exampleTrans: "Cảm ơn vì đã giúp đỡ tôi." },
  { id: 3, front: "죄송합니다", back: "Xin lỗi", romanization: "Joesonghamnida", example: "늦어서 죄송합니다.", exampleTrans: "Xin lỗi vì đến muộn." },
  { id: 4, front: "사랑해요", back: "Tôi yêu bạn", romanization: "Saranghaeyo", example: "당신을 사랑해요.", exampleTrans: "Tôi yêu bạn." },
  { id: 5, front: "학교", back: "Trường học", romanization: "Hakgyo", example: "학교에 갑니다.", exampleTrans: "Tôi đi học." },
  { id: 6, front: "선생님", back: "Giáo viên", romanization: "Seonsaengnim", example: "선생님은 친절합니다.", exampleTrans: "Giáo viên rất tử tế." },
  { id: 7, front: "친구", back: "Bạn bè", romanization: "Chingu", example: "친구와 함께 갑니다.", exampleTrans: "Tôi đi cùng bạn bè." },
];

// ─── Confetti Component ───
function ConfettiPiece({ delay, left, color, duration }) {
  return (
    <div
      className="confetti-piece"
      style={{
        left: `${left}%`,
        background: color,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        width: Math.random() * 8 + 6 + "px",
        height: Math.random() * 8 + 6 + "px",
      }}
    />
  );
}

const CONFETTI_COLORS = ["#4ade80", "#f59e0b", "#6366f1", "#ec4899", "#22d3ee", "#f97316"];

function ConfettiAnimation() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </div>
  );
}

export default function StudyFlashcard() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const flashcards = MOCK_FLASHCARDS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [starredIds, setStarredIds] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const card = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const isStarred = starredIds.has(card?.id);

  // ── Toggle star ──
  const toggleStar = (e) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  };

  // ── Flip card ──
  const handleFlip = useCallback(() => {
    if (isTransitioning) return;
    setIsFlipped((prev) => !prev);
  }, [isTransitioning]);

  // ── Go to next card ──
  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIsFlipped(false);
      setTimeout(() => {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsFinished(true);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3500);
        }
        setIsTransitioning(false);
      }, 200);
    }, 150);
  }, [currentIndex, flashcards.length, isTransitioning]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space") { e.preventDefault(); handleFlip(); }
      if (isFlipped && (e.key === "Enter" || e.key === "ArrowRight")) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleFlip, handleNext, isFlipped]);

  // ─────────────────────────────────────────────────────────────────
  // COMPLETION SCREEN
  // ─────────────────────────────────────────────────────────────────
  if (isFinished) {
    return (
      <>
        {showConfetti && <ConfettiAnimation />}

        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans"
          style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f8faff 100%)" }}
        >
          {/* Success icon */}
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center mb-8 mx-auto"
            style={{
              background: "linear-gradient(135deg, #1a7a3c 0%, #22c55e 100%)",
              boxShadow: "0 16px 48px rgba(26,122,60,0.35)",
            }}
          >
            <CheckCircle2 size={52} className="text-white" strokeWidth={2} />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Xuất sắc! 🎉
          </h2>
          <p className="text-gray-500 font-medium mb-2 text-lg">
            Bạn đã hoàn thành bộ thẻ hôm nay
          </p>
          <p className="text-sm text-gray-400 mb-10">
            {flashcards.length} thẻ · {starredIds.size} từ đã gắn ⭐
          </p>

          {/* Starred summary */}
          {starredIds.size > 0 && (
            <div
              className="mb-8 px-6 py-4 rounded-2xl text-center"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <p className="text-sm font-bold text-amber-600 mb-1">
                ⭐ {starredIds.size} từ đã đánh dấu
              </p>
              <p className="text-xs text-gray-400">Ôn lại từ đã ⭐ trong Starred Vocabulary</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={() => {
                setIsFinished(false);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-400 transition-all text-sm flex items-center justify-center gap-2"
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
            >
              <RotateCcw size={16} />
              Study Again
            </button>
            <button
              onClick={() => navigate("/user/flashcards")}
              className="flex-1 py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(135deg, #1a7a3c, #22c55e)",
                boxShadow: "0 8px 24px rgba(26,122,60,0.3)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,122,60,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,122,60,0.3)"; }}
            >
              <BookOpen size={16} />
              Back to Library
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // MAIN STUDY SCREEN
  // ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col font-sans overflow-hidden"
      style={{ background: "linear-gradient(180deg, #f8faff 0%, #f0f4f8 100%)" }}
    >
      {/* ── TOP BAR ── */}
      <div
        className="flex-shrink-0 h-[60px] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 font-bold text-sm transition-all"
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        {/* Counter */}
        <div className="flex items-center gap-3">
          <span
            className="font-extrabold text-sm px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.05)", color: "#374151" }}
          >
            {currentIndex + 1} / {flashcards.length}
          </span>
          {starredIds.size > 0 && (
            <span
              className="font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}
            >
              <Star size={11} fill="#f59e0b" /> {starredIds.size}
            </span>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-xl text-gray-400 transition-all"
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; e.currentTarget.style.color = "#6b7280"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9ca3af"; }}
          >
            <ChevronLeft size={18} onClick={() => { if (currentIndex > 0) { setIsFlipped(false); setTimeout(() => setCurrentIndex((p) => p - 1), 150); } }} />
          </button>
          <button
            className="p-2 rounded-xl text-gray-400 transition-all"
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; e.currentTarget.style.color = "#6b7280"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9ca3af"; }}
          >
            <ChevronRight size={18} onClick={() => { if (currentIndex < flashcards.length - 1) { setIsFlipped(false); setTimeout(() => setCurrentIndex((p) => p + 1), 150); } }} />
          </button>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div
        className="h-1.5 w-full flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.06)" }}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #1a7a3c, #4ade80)",
            boxShadow: "0 0 12px rgba(74,222,128,0.5)",
          }}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* CARD */}
        <div
          className="flashcard-scene w-full max-w-2xl mb-8"
          style={{ height: "clamp(280px, 40vh, 360px)" }}
        >
          <div
            className={`flashcard-inner ${isFlipped ? "is-flipped" : ""}`}
            style={{ cursor: isTransitioning ? "default" : "pointer" }}
            onClick={handleFlip}
          >

            {/* ── FRONT FACE ── */}
            <div
              className="flashcard-face"
              style={{ background: "white", boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.07)" }}
            >
              {/* Top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: "linear-gradient(90deg, transparent, #1a7a3c, #4ade80, #1a7a3c, transparent)" }}
              />

              {/* Star button */}
              <button
                onClick={toggleStar}
                className={`absolute top-5 right-5 p-2 rounded-xl transition-all z-20 ${isStarred ? "star-pop" : ""}`}
                style={{
                  background: isStarred ? "rgba(245,158,11,0.12)" : "rgba(0,0,0,0.04)",
                  color: isStarred ? "#f59e0b" : "#d1d5db",
                }}
                onMouseEnter={(e) => { if (!isStarred) { e.currentTarget.style.background = "rgba(245,158,11,0.08)"; e.currentTarget.style.color = "#f59e0b"; } }}
                onMouseLeave={(e) => { if (!isStarred) { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#d1d5db"; } }}
              >
                <Star size={18} fill={isStarred ? "#f59e0b" : "none"} />
              </button>

              {/* Korean word */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
                <p
                  className="text-5xl sm:text-6xl font-extrabold text-gray-900 text-center leading-none mb-4 tracking-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {card.front}
                </p>
                {card.romanization && (
                  <p className="text-base text-gray-400 font-medium italic">
                    {card.romanization}
                  </p>
                )}
              </div>

              {/* Click hint */}
              <div className="absolute bottom-6 inset-x-0 flex justify-center">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-[0.2em] animate-pulse"
                  style={{ color: "#d1d5db" }}
                >
                  Nhấn để lật thẻ
                </span>
              </div>
            </div>

            {/* ── BACK FACE ── */}
            <div
              className="flashcard-face flashcard-face--back"
              style={{
                background: "linear-gradient(135deg, #0f5a2a 0%, #1a7a3c 50%, #16a34a 100%)",
                boxShadow: "0 24px 64px rgba(26,122,60,0.35), 0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              {/* Decorative blobs */}
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #4ade80, transparent)" }} />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #86efac, transparent)" }} />

              {/* Speaker button */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="absolute top-5 right-5 p-2.5 rounded-xl transition-all z-20"
                style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              >
                <Volume2 size={18} />
              </button>

              {/* Meaning */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 gap-4 z-10">
                <p className="text-4xl sm:text-5xl font-extrabold text-white text-center leading-none drop-shadow-lg">
                  {card.back}
                </p>

                {/* Example sentence */}
                {card.example && (
                  <div
                    className="mt-2 px-5 py-3.5 rounded-2xl max-w-[90%] text-center"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <p className="text-sm font-medium text-white/80 italic mb-1">
                      "{card.example}"
                    </p>
                    {card.exampleTrans && (
                      <p className="text-xs text-white/50 font-medium">
                        {card.exampleTrans}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── NEXT BUTTON (appear after flip) ── */}
        {isFlipped && !isTransitioning ? (
          <div className="w-full max-w-2xl flex flex-col items-center gap-3">
            <button
              onClick={handleNext}
              className="flex items-center gap-3 px-10 py-3.5 rounded-2xl font-bold text-white text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #1a7a3c, #22c55e)",
                boxShadow: "0 8px 24px rgba(26,122,60,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,122,60,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,122,60,0.3)";
              }}
            >
              {currentIndex < flashcards.length - 1 ? (
                <>Tiếp theo <ArrowRight size={16} /></>
              ) : (
                <>Hoàn thành <CheckCircle2 size={16} /></>
              )}
            </button>
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              Hoặc nhấn <kbd className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono text-[9px]">Enter</kbd>
            </p>
          </div>
        ) : (
          /* Flip button when card not yet flipped */
          !isTransitioning && (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleFlip}
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-gray-600 transition-all text-sm"
                style={{
                  background: "white",
                  border: "2px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(26,122,60,0.3)";
                  e.currentTarget.style.color = "#1a7a3c";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,122,60,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)";
                  e.currentTarget.style.color = "#4b5563";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                }}
              >
                <RotateCcw size={18} />
                Xem đáp án
              </button>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                Hoặc nhấn <kbd className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono text-[9px]">Space</kbd>
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
}