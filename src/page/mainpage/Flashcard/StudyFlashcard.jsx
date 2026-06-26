import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, Volume2, RotateCcw,
  ChevronLeft, ChevronRight, CheckCircle2,
  BookOpen, ArrowRight, Loader2, Frown, Smile, ThumbsUp
} from "lucide-react";
import flashcardService from "../../../AdminControl/Service/API/lessonServiceAPI/flashcard.service";

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

const getGlobalStarredCards = () => {
  try {
    const saved = localStorage.getItem("starred_flashcards_data");
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Lỗi đọc global starred cards:", err);
    return [];
  }
};

const saveGlobalStarredCards = (cards) => {
  try {
    localStorage.setItem("starred_flashcards_data", JSON.stringify(cards));
  } catch (err) {
    console.error("Lỗi lưu global starred cards:", err);
  }
};

export default function StudyFlashcard() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [starredIds, setStarredIds] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    fetchDueCards();
  }, [setId]);

  const fetchDueCards = async () => {
    setIsLoading(true);
    try {
      let data = [];
      if (setId === "starred") {
        data = getGlobalStarredCards();
      } else {
        data = await flashcardService.getDueCards(setId);
      }
      setFlashcards(data || []);
      if (!data || data.length === 0) {
        setIsFinished(true);
      }

      // Fetch starred cards from LocalStorage (FE-only flow)
      try {
        if (setId === "starred") {
          const ids = (data || []).map(c => c.id);
          setStarredIds(new Set(ids));
        } else {
          const savedStarred = localStorage.getItem(`starred_flashcards_set_${setId}`);
          if (savedStarred) {
            const starredArr = JSON.parse(savedStarred);
            if (Array.isArray(starredArr)) {
              setStarredIds(new Set(starredArr));
            }
          } else {
            setStarredIds(new Set());
          }
        }
      } catch (err) {
        console.error("Không thể tải danh sách thẻ đã gắn sao từ LocalStorage:", err);
      }
    } catch (err) {
      console.error("Lỗi khi tải flashcard:", err);
      setError("Không thể tải bộ thẻ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };



  const card = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const isStarred = starredIds.has(card?.id);

  // ── Toggle star (FE-only flow) ──
  const toggleStar = (e) => {
    e.stopPropagation();
    if (!card) return;

    setStarredIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyStarred = next.has(card.id);

      if (isCurrentlyStarred) {
        next.delete(card.id);
        const currentStarred = getGlobalStarredCards();
        const updatedStarred = currentStarred.filter(c => c.id !== card.id);
        saveGlobalStarredCards(updatedStarred);
      } else {
        next.add(card.id);
        const currentStarred = getGlobalStarredCards();
        if (!currentStarred.some(c => c.id === card.id)) {
          currentStarred.push({ ...card, progress: card.progress || 0 });
          saveGlobalStarredCards(currentStarred);
        }
      }

      // Persist to LocalStorage for current deck
      try {
        localStorage.setItem(`starred_flashcards_set_${setId}`, JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error("Không thể lưu trạng thái gắn sao vào LocalStorage:", err);
      }

      return next;
    });
  };

  // ── Flip card ──
  const handleFlip = useCallback(() => {
    if (isTransitioning) return;
    setIsFlipped((prev) => !prev);
  }, [isTransitioning]);


  // ── Manual Navigation (Next / Prev) ──
  const handleManualNext = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (card) {
      if (setId === "starred") {
        try {
          const currentStarred = getGlobalStarredCards();
          const updatedStarred = currentStarred.map((c) => {
            if (c.id === card.id) {
              return { ...c, progress: Math.min((c.progress || 0) + 25, 100) };
            }
            return c;
          });
          saveGlobalStarredCards(updatedStarred);
        } catch (err) {
          console.error("Lỗi cập nhật tiến độ local:", err);
        }
      } else {
        try {
          await flashcardService.submitReview(card.id, 4); // Default to 'Good'
        } catch (err) {
          console.error("Lỗi cập nhật tiến độ:", err);
        }
      }
    }

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
  }, [currentIndex, flashcards.length, isTransitioning, card, setId]);

  const handleManualPrev = useCallback(() => {
    if (isTransitioning || currentIndex === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setIsTransitioning(false);
      }, 200);
    }, 150);
  }, [currentIndex, isTransitioning]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); handleFlip(); }
      if (e.key === "ArrowRight") {
        handleManualNext();
      }
      if (e.key === "ArrowLeft") {
        handleManualPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleFlip, handleManualNext, handleManualPrev]);

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
            {flashcards.length === 0 ? "Tuyệt vời, bạn không còn thẻ nào cần ôn hôm nay!" : `${flashcards.length} thẻ · ${starredIds.size} từ đã gắn ⭐`}
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
                fetchDueCards(); // Fetch again to see if any missed
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans relative" style={{ background: "linear-gradient(180deg, #f8faff 0%, #f0f4f8 100%)" }}>
        <Loader2 size={40} className="animate-spin text-[#1a7a3c] mb-4" />
        <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">Đang tải thẻ học...</p>
      </div>
    );
  }

  if (!card && !isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans relative" style={{ background: "linear-gradient(180deg, #f8faff 0%, #f0f4f8 100%)" }}>
        <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">Không tìm thấy thẻ học hợp lệ.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans overflow-hidden relative"
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
          className="flashcard-scene w-full max-w-[360px] mb-8"
          style={{ height: "clamp(460px, 65vh, 540px)" }}
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
                  className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center leading-none mb-3 tracking-tight"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {card?.frontText || card?.front || ""}
                </p>
                {card?.romanization && (
                  <p className="text-sm text-gray-400 font-medium italic">
                    {card?.romanization}
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

              {/* Speaker button */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="absolute top-5 left-5 p-2.5 rounded-xl transition-all z-20"
                style={{ background: "rgba(0,0,0,0.04)", color: "#9ca3af" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.08)"; e.currentTarget.style.color = "#4b5563"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#9ca3af"; }}
              >
                <Volume2 size={18} />
              </button>

              {/* Meaning */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 gap-4 z-10">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center leading-none tracking-tight">
                  {card?.backText || card?.back || ""}
                </p>

                {/* Example sentence */}
                {card?.example && (
                  <div
                    className="mt-4 px-4 py-3 rounded-2xl max-w-[90%] text-center"
                    style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}
                  >
                    <p className="text-xs sm:text-sm font-medium text-gray-700 italic mb-1">
                      "{card?.example}"
                    </p>
                    {card?.exampleTrans && (
                      <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                        {card?.exampleTrans}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>



        {/* ── MANUAL NAVIGATION BAR ── */}
        <div className="w-full max-w-[360px] flex justify-between items-center mt-6 gap-4 px-2">
          <button
            onClick={handleManualPrev}
            disabled={currentIndex === 0 || isTransitioning}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Trước
          </button>

          <button
            onClick={handleManualNext}
            disabled={isTransitioning}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentIndex < flashcards.length - 1 ? "Tiếp" : "Hoàn thành"}
            <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}