import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Zap, Brain, Search, ArrowLeft, Trophy, Star,
  RotateCcw, Clock, Play, Gamepad2,
  ChevronRight, Layers, Folder, Check, BookOpen,
  Shuffle, X,
} from "lucide-react";

// ─── Mock Flashcard Decks (cùng data với FlashcardLibrary) ─────────────────────
const MOCK_DECKS = [
  {
    id: 101,
    title: "Từ vựng Bài 1: Chào hỏi",
    folder: "Tiếng Hàn Sơ Cấp 1",
    color: "linear-gradient(135deg, #3b82f6, #6366f1)",
    colorLight: "rgba(59,130,246,0.08)",
    terms: [
      { id: 1, front: "안녕하세요", back: "Xin chào" },
      { id: 2, front: "감사합니다", back: "Cảm ơn" },
      { id: 3, front: "죄송합니다", back: "Xin lỗi" },
      { id: 4, front: "사랑해요", back: "Tôi yêu bạn" },
      { id: 5, front: "만나서 반갑습니다", back: "Rất vui được gặp bạn" },
      { id: 6, front: "잘 지내세요?", back: "Bạn có khỏe không?" },
      { id: 7, front: "이름이 뭐예요?", back: "Bạn tên là gì?" },
      { id: 8, front: "어디서 왔어요?", back: "Bạn đến từ đâu?" },
    ],
  },
  {
    id: 102,
    title: "Động từ bất quy tắc",
    folder: "Tiếng Hàn Sơ Cấp 1",
    color: "linear-gradient(135deg, #f97316, #ef4444)",
    colorLight: "rgba(249,115,22,0.08)",
    terms: [
      { id: 1, front: "먹다", back: "Ăn" },
      { id: 2, front: "마시다", back: "Uống" },
      { id: 3, front: "가다", back: "Đi" },
      { id: 4, front: "오다", back: "Đến" },
      { id: 5, front: "보다", back: "Nhìn / Xem" },
      { id: 6, front: "듣다", back: "Nghe" },
      { id: 7, front: "읽다", back: "Đọc" },
      { id: 8, front: "쓰다", back: "Viết" },
    ],
  },
  {
    id: 103,
    title: "Tính từ chỉ cảm xúc",
    folder: "Luyện thi Topik I",
    color: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    colorLight: "rgba(139,92,246,0.08)",
    terms: [
      { id: 1, front: "기쁘다", back: "Vui mừng" },
      { id: 2, front: "슬프다", back: "Buồn" },
      { id: 3, front: "화나다", back: "Tức giận" },
      { id: 4, front: "무섭다", back: "Sợ hãi" },
      { id: 5, front: "행복하다", back: "Hạnh phúc" },
      { id: 6, front: "피곤하다", back: "Mệt mỏi" },
      { id: 7, front: "배고프다", back: "Đói bụng" },
      { id: 8, front: "졸리다", back: "Buồn ngủ" },
    ],
  },
  {
    id: 104,
    title: "Số đếm & Thời gian",
    folder: "Tiếng Hàn Sơ Cấp 1",
    color: "linear-gradient(135deg, #10b981, #0d9488)",
    colorLight: "rgba(16,185,129,0.08)",
    terms: [
      { id: 1, front: "하나", back: "Một (thuần Hàn)" },
      { id: 2, front: "둘", back: "Hai (thuần Hàn)" },
      { id: 3, front: "시간", back: "Giờ / Thời gian" },
      { id: 4, front: "오늘", back: "Hôm nay" },
      { id: 5, front: "내일", back: "Ngày mai" },
      { id: 6, front: "어제", back: "Hôm qua" },
      { id: 7, front: "지금", back: "Bây giờ" },
      { id: 8, front: "아침", back: "Buổi sáng" },
    ],
  },
  {
    id: 105,
    title: "Từ vựng TOPIK II",
    folder: "Luyện thi Topik II",
    color: "linear-gradient(135deg, #ec4899, #f43f5e)",
    colorLight: "rgba(236,72,153,0.08)",
    terms: [
      { id: 1, front: "경제", back: "Kinh tế" },
      { id: 2, front: "사회", back: "Xã hội" },
      { id: 3, front: "문화", back: "Văn hóa" },
      { id: 4, front: "환경", back: "Môi trường" },
      { id: 5, front: "기술", back: "Kỹ thuật / Công nghệ" },
      { id: 6, front: "교육", back: "Giáo dục" },
      { id: 7, front: "의사소통", back: "Giao tiếp" },
      { id: 8, front: "발전하다", back: "Phát triển" },
    ],
  },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ══════════════════════════════════════════════════════════════════
// STEP 1: DECK SELECTOR — Chọn bộ flashcard
// ══════════════════════════════════════════════════════════════════
function DeckSelector({ game, onSelect, onBack }) {
  const [selected, setSelected] = useState(null);

  // Group decks by folder
  const folders = [...new Set(MOCK_DECKS.map(d => d.folder))];

  return (
    <div className="w-full pb-8 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: game.gradient }}>
            <game.icon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-gray-900 text-lg leading-none">{game.title}</h1>
            <p className="text-xs text-gray-400 font-medium">Chọn bộ từ vựng để chơi</p>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="mb-6 px-5 py-4 rounded-2xl flex items-center gap-3"
        style={{ background: "rgba(26,122,60,0.05)", border: "1px solid rgba(26,122,60,0.12)" }}>
        <Layers size={18} style={{ color: "#1a7a3c", flexShrink: 0 }} />
        <p className="text-sm font-medium text-gray-600">
          Chọn một bộ flashcard bên dưới — từ vựng trong bộ đó sẽ được dùng trong game.
        </p>
      </div>

      {/* Deck list grouped by folder */}
      <div className="space-y-6">
        {folders.map(folder => {
          const decksInFolder = MOCK_DECKS.filter(d => d.folder === folder);
          return (
            <div key={folder}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Folder size={14} className="text-gray-400" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{folder}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {decksInFolder.map(deck => {
                  const isSelected = selected?.id === deck.id;
                  return (
                    <button
                      key={deck.id}
                      onClick={() => setSelected(deck)}
                      className="text-left rounded-2xl p-4 transition-all duration-200 flex items-center gap-4"
                      style={{
                        background: isSelected ? deck.colorLight : "white",
                        border: isSelected ? `2px solid rgba(26,122,60,0.4)` : "1.5px solid rgba(0,0,0,0.07)",
                        boxShadow: isSelected ? "0 4px 20px rgba(26,122,60,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
                        transform: isSelected ? "scale(1.01)" : "scale(1)",
                      }}
                    >
                      {/* Color strip */}
                      <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: deck.color }}>
                        <BookOpen size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{deck.title}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{deck.terms.length} từ vựng</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "#1a7a3c" }}>
                          <Check size={13} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-sm transition-all duration-200"
          style={{
            background: selected ? game.gradient : "#e5e7eb",
            color: selected ? "white" : "#9ca3af",
            boxShadow: selected ? `0 8px 24px ${game.glow}` : "none",
            cursor: selected ? "pointer" : "not-allowed",
          }}
        >
          <Play size={16} fill="white" />
          Bắt đầu chơi với &ldquo;{selected?.title ?? "..."}&rdquo;
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// GAME 1: FAST MATCH
// ══════════════════════════════════════════════════════════════════
function FastMatchGame({ vocab, onComplete }) {
  const vocabList = shuffle(vocab).slice(0, Math.min(9, vocab.length));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [gridWords, setGridWords] = useState([]);
  const [selectedWrong, setSelectedWrong] = useState([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  const current = vocabList[currentIdx];

  const buildGrid = useCallback((idx) => {
    const correct = vocabList[idx];
    const others = shuffle(vocab.filter(v => v.front !== correct.front)).slice(0, 8);
    return shuffle([correct.back, ...others.map(v => v.back)]).slice(0, 9);
  }, [vocab, vocabList]);

  useEffect(() => {
    if (!current) return;
    setGridWords(buildGrid(currentIdx));
    setSelectedWrong([]);
    setShowCorrect(false);
    setIsAnswered(false);
    setTimeLeft(5);
  }, [currentIdx]);

  useEffect(() => {
    if (isAnswered || isFinished || !current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setShowCorrect(true);
          setIsAnswered(true);
          setMistakes(m => m + 1);
          setTimeout(() => goNext(), 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIdx, isAnswered, isFinished]);

  const goNext = () => {
    if (currentIdx < vocabList.length - 1) setCurrentIdx(i => i + 1);
    else setIsFinished(true);
  };

  const handleSelect = (word) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);
    if (word === current.back) {
      setScore(s => s + 10);
      setShowCorrect(true);
      setIsAnswered(true);
      setTimeout(() => goNext(), 800);
    } else {
      setSelectedWrong(prev => [...prev, word]);
      setMistakes(m => m + 1);
    }
  };

  if (isFinished) {
    return <ResultScreen score={score} correct={vocabList.length - mistakes} total={vocabList.length} onExit={onComplete} />;
  }

  const timerColor = timeLeft <= 2 ? "#ef4444" : timeLeft <= 3 ? "#f97316" : "#22c55e";

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-bold text-gray-500">{currentIdx + 1}/{vocabList.length}</span>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-lg"
          style={{ background: `${timerColor}15`, color: timerColor, border: `2px solid ${timerColor}30` }}>
          <Clock size={16} /> {timeLeft}s
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black"
          style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
          <Star size={12} fill="#16a34a" /> {score}
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${((currentIdx) / vocabList.length) * 100}%`, background: "linear-gradient(90deg,#1a7a3c,#4ade80)" }} />
      </div>
      <div className="flex-shrink-0 py-5 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Nghĩa của từ này là?</p>
        <p className="text-4xl font-extrabold text-blue-600">{current?.front}</p>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-3" style={{ minHeight: 0 }}>
        {gridWords.map((word, i) => {
          const isWrong = selectedWrong.includes(word);
          const isCorrectShow = showCorrect && word === current?.back;
          return (
            <button key={i} onClick={() => handleSelect(word)} disabled={isAnswered || isWrong}
              className="rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center p-3 text-center"
              style={{
                background: isCorrectShow ? "linear-gradient(135deg,#22c55e,#16a34a)" : isWrong ? "linear-gradient(135deg,#ef4444,#dc2626)" : "white",
                color: isCorrectShow || isWrong ? "white" : "#374151",
                border: isCorrectShow ? "2px solid #86efac" : isWrong ? "2px solid #fca5a5" : "2px solid #e5e7eb",
                boxShadow: isCorrectShow ? "0 8px 24px rgba(34,197,94,0.4)" : isWrong ? "0 4px 12px rgba(239,68,68,0.2)" : "0 2px 8px rgba(0,0,0,0.04)",
                transform: isCorrectShow ? "scale(1.04)" : "scale(1)",
              }}>
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// GAME 2: WORD MATCH
// ══════════════════════════════════════════════════════════════════
function WordMatchGame({ vocab, onComplete }) {
  const pairs = shuffle(vocab).slice(0, 6);
  const [leftItems] = useState(() => shuffle(pairs.map(p => ({ id: p.front, text: p.front }))));
  const [rightItems] = useState(() => shuffle(pairs.map(p => ({ id: p.front, text: p.back }))));
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [failed, setFailed] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;
    if (selectedLeft === selectedRight) {
      setScore(s => s + 15);
      const newMatched = new Set([...matched, selectedLeft]);
      setMatched(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (newMatched.size >= pairs.length) setTimeout(() => setIsFinished(true), 500);
    } else {
      setMistakes(m => m + 1);
      setFailed(new Set([selectedLeft, selectedRight]));
      setIsLocked(true);
      setTimeout(() => { setFailed(new Set()); setSelectedLeft(null); setSelectedRight(null); setIsLocked(false); }, 900);
    }
  }, [selectedLeft, selectedRight]);

  if (isFinished) return <ResultScreen score={score} correct={pairs.length} total={pairs.length} onExit={onComplete} />;

  const CardItem = ({ item, isLeft, selected, isMatched, isFailed }) => (
    <button onClick={() => { if (isLocked || isMatched) return; if (isLeft) setSelectedLeft(item.id); else setSelectedRight(item.id); }}
      disabled={isMatched || isLocked}
      className="w-full py-3 px-4 rounded-xl text-xs font-bold text-center transition-all duration-300"
      style={{
        background: isMatched ? "rgba(34,197,94,0.1)" : isFailed ? "rgba(239,68,68,0.1)" : selected ? "rgba(59,130,246,0.1)" : "white",
        border: isMatched ? "2px solid #22c55e" : isFailed ? "2px solid #ef4444" : selected ? "2.5px solid #3b82f6" : "1.5px solid #e5e7eb",
        color: isMatched ? "#16a34a" : isFailed ? "#ef4444" : selected ? "#2563eb" : "#374151",
        transform: selected ? "scale(1.03)" : "scale(1)",
        opacity: isMatched ? 0.6 : 1,
      }}>
      {item.text}
    </button>
  );

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <p className="text-sm font-bold text-gray-500">Đã nối: {matched.size}/{pairs.length}</p>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
          <Star size={12} fill="#16a34a" /> {score}
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full transition-all" style={{ width: `${(matched.size / pairs.length) * 100}%`, background: "linear-gradient(90deg,#1a7a3c,#4ade80)" }} />
      </div>
      <p className="text-xs font-bold text-gray-400 text-center uppercase tracking-widest flex-shrink-0">Chọn trái → phải để nối cặp</p>
      <div className="flex-1 flex gap-4" style={{ minHeight: 0 }}>
        <div className="flex-1 flex flex-col gap-2.5">
          {leftItems.map(item => <CardItem key={item.id} item={item} isLeft selected={selectedLeft === item.id} isMatched={matched.has(item.id)} isFailed={failed.has(item.id)} />)}
        </div>
        <div className="flex flex-col items-center justify-around py-2">
          {pairs.map((_, i) => <ChevronRight key={i} size={14} className="text-gray-200" />)}
        </div>
        <div className="flex-1 flex flex-col gap-2.5">
          {rightItems.map(item => <CardItem key={item.id} item={item} isLeft={false} selected={selectedRight === item.id} isMatched={matched.has(item.id)} isFailed={failed.has(item.id)} />)}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// GAME 3: MEMORY CARD
// ══════════════════════════════════════════════════════════════════
function MemoryCardGame({ vocab, onComplete }) {
  const numPairs = Math.min(6, vocab.length);
  const pairs = shuffle(vocab).slice(0, numPairs);
  const [cards] = useState(() => {
    const built = [];
    pairs.forEach((p, i) => {
      built.push({ uid: `${i}-k`, pairId: i, text: p.front });
      built.push({ uid: `${i}-v`, pairId: i, text: p.back });
    });
    return shuffle(built);
  });
  const [phase, setPhase] = useState("memorizing");
  const [countdown, setCountdown] = useState(5);
  const [flipped, setFlipped] = useState(() => new Set(cards.map(c => c.uid)));
  const [matched, setMatched] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [failedPair, setFailedPair] = useState([]);
  const [score, setScore] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (phase !== "memorizing") return;
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); setFlipped(new Set()); setPhase("playing"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const handleCardClick = (card) => {
    if (phase !== "playing" || isLocked || flipped.has(card.uid) || matched.has(card.uid)) return;
    const newFlipped = new Set([...flipped, card.uid]);
    setFlipped(newFlipped);
    const newSel = [...selected, card];
    if (newSel.length === 2) {
      setIsLocked(true);
      if (newSel[0].pairId === newSel[1].pairId) {
        setScore(s => s + 20);
        const nm = new Set([...matched, newSel[0].uid, newSel[1].uid]);
        setMatched(nm);
        setSelected([]);
        setIsLocked(false);
        if (nm.size >= cards.length) setTimeout(() => setIsFinished(true), 500);
      } else {
        setFailedPair([newSel[0].uid, newSel[1].uid]);
        setTimeout(() => {
          setFlipped(prev => { const n = new Set(prev); n.delete(newSel[0].uid); n.delete(newSel[1].uid); return n; });
          setFailedPair([]); setSelected([]); setIsLocked(false);
        }, 900);
      }
    } else { setSelected(newSel); }
  };

  if (isFinished) return <ResultScreen score={score} correct={numPairs} total={numPairs} onExit={onComplete} />;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        {phase === "memorizing"
          ? <div className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm" style={{ background: "rgba(59,130,246,0.1)", color: "#2563eb", border: "2px solid rgba(59,130,246,0.2)" }}>👁️ Ghi nhớ: {countdown}s</div>
          : <p className="text-sm font-bold text-gray-500">Đã ghép: {matched.size / 2}/{numPairs}</p>}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
          <Star size={12} fill="#16a34a" /> {score}
        </div>
      </div>
      {phase === "memorizing" && <p className="text-xs text-center text-blue-500 font-bold flex-shrink-0">Thẻ sẽ ẩn sau {countdown}s — hãy ghi nhớ vị trí!</p>}
      <div className="flex-1 grid gap-2.5" style={{ gridTemplateColumns: "repeat(4, 1fr)", minHeight: 0 }}>
        {cards.map(card => {
          const isFlip = flipped.has(card.uid);
          const isMatch = matched.has(card.uid);
          const isFail = failedPair.includes(card.uid);
          return (
            <button key={card.uid} onClick={() => handleCardClick(card)}
              className="rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center p-2 text-center"
              style={{
                background: isMatch ? "linear-gradient(135deg,#22c55e,#16a34a)" : isFail ? "linear-gradient(135deg,#ef4444,#dc2626)" : isFlip ? "white" : "linear-gradient(135deg,#1e293b,#0f172a)",
                color: isMatch || isFail ? "white" : isFlip ? "#374151" : "rgba(255,255,255,0.8)",
                border: isMatch ? "2px solid #86efac" : isFail ? "2px solid #fca5a5" : isFlip ? "1.5px solid #e5e7eb" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: isMatch ? "0 4px 16px rgba(34,197,94,0.3)" : isFail ? "0 4px 16px rgba(239,68,68,0.3)" : "none",
                minHeight: "60px",
              }}>
              {isFlip || isMatch ? card.text : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// GAME 4: WORD SEARCH
// ══════════════════════════════════════════════════════════════════
const GRID_SIZE = 8;
const KR_LETTERS = "가나다라마바사아자차카타파하겨녀더러머버서어저처커터퍼허".split("");

function generateGrid(words) {
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => KR_LETTERS[Math.floor(Math.random() * KR_LETTERS.length)])
  );
  const placements = [];
  const directions = [[0, 1], [1, 0]];
  words.forEach(word => {
    const chars = word.split("").slice(0, 4);
    for (let attempt = 0; attempt < 40; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const maxRow = dir[0] === 0 ? GRID_SIZE - 1 : GRID_SIZE - chars.length;
      const maxCol = dir[1] === 0 ? GRID_SIZE - 1 : GRID_SIZE - chars.length;
      if (maxRow < 0 || maxCol < 0) break;
      const row = Math.floor(Math.random() * (maxRow + 1));
      const col = Math.floor(Math.random() * (maxCol + 1));
      const cells = chars.map((_, i) => [row + dir[0] * i, col + dir[1] * i]);
      cells.forEach(([r, c], i) => { grid[r][c] = chars[i]; });
      placements.push({ word, chars, cells });
      break;
    }
  });
  return { grid, placements };
}

function WordSearchGame({ vocab, onComplete }) {
  const targetVocabs = shuffle(vocab).slice(0, 5);
  const targetWords = targetVocabs.map(v => v.front.replace(/\s+/g, "").slice(0, 4));
  const [{ grid, placements }] = useState(() => generateGrid(targetWords));
  const [found, setFound] = useState(new Set());
  const [selecting, setSelecting] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [flashWrong, setFlashWrong] = useState(false);

  const handleCellStart = (r, c) => { setIsDragging(true); setSelecting([[r, c]]); };
  const handleCellEnter = (r, c) => {
    if (!isDragging) return;
    setSelecting(prev => {
      const exists = prev.some(([pr, pc]) => pr === r && pc === c);
      return exists ? prev : [...prev, [r, c]];
    });
  };
  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const sel = selecting;
    if (sel.length < 2) { setSelecting([]); return; }
    const selectedStr = sel.map(([r, c]) => grid[r][c]).join("");
    const match = placements.find(p => p.chars.join("") === selectedStr && !found.has(p.word));
    if (match) {
      setScore(s => s + 20);
      const nf = new Set([...found, match.word]);
      setFound(nf);
      if (nf.size >= targetWords.length) setTimeout(() => setIsFinished(true), 600);
    } else {
      setFlashWrong(true);
      setTimeout(() => setFlashWrong(false), 400);
    }
    setSelecting([]);
  };

  if (isFinished) return <ResultScreen score={score} correct={found.size} total={targetWords.length} onExit={onComplete} />;

  const isInPath = (r, c, path) => path.some(([pr, pc]) => pr === r && pc === c);
  const isFoundCell = (r, c) => placements.some(p => p.cells.some(([pr, pc]) => pr === r && pc === c) && found.has(p.word));

  return (
    <div className="flex flex-col h-full gap-3 select-none" style={{ userSelect: "none" }}>
      <div className="flex items-center justify-between flex-shrink-0">
        <p className="text-sm font-bold text-gray-500">Tìm {found.size}/{targetWords.length} từ</p>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
          <Star size={12} fill="#16a34a" /> {score}
        </div>
      </div>
      {/* Target words chips */}
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        {targetWords.map((w, i) => (
          <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: found.has(w) ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(59,130,246,0.1)",
              color: found.has(w) ? "white" : "#2563eb",
              textDecoration: found.has(w) ? "line-through" : "none",
            }}>
            {found.has(w) ? "✓ " : ""}{w}
            {!found.has(w) && <span className="ml-2 opacity-50 text-[10px]">({targetVocabs[i]?.back})</span>}
          </span>
        ))}
      </div>
      {/* Grid */}
      <div className="flex-1 p-3 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#1e293b,#0f172a)", minHeight: 0 }}
        onMouseLeave={handleEnd} onMouseUp={handleEnd}>
        <div className="h-full grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`, gap: "3px" }}>
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const inSel = isInPath(r, c, selecting);
              const inFound = isFoundCell(r, c);
              return (
                <div key={`${r}-${c}`}
                  onMouseDown={() => handleCellStart(r, c)}
                  onMouseEnter={() => handleCellEnter(r, c)}
                  className="rounded-md flex items-center justify-center cursor-pointer font-black text-xs transition-all duration-100"
                  style={{
                    background: inFound ? "linear-gradient(135deg,#22c55e,#16a34a)" : inSel ? (flashWrong ? "rgba(239,68,68,0.6)" : "linear-gradient(135deg,#3b82f6,#2563eb)") : "rgba(255,255,255,0.06)",
                    color: inFound || inSel ? "white" : "rgba(255,255,255,0.7)",
                    transform: inSel ? "scale(1.08)" : "scale(1)",
                    border: inFound ? "1px solid #86efac" : inSel ? "1px solid #93c5fd" : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: inFound ? "0 0 8px rgba(34,197,94,0.5)" : inSel ? "0 0 8px rgba(59,130,246,0.5)" : "none",
                  }}>
                  {cell}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// RESULT SCREEN
// ══════════════════════════════════════════════════════════════════
function ResultScreen({ score, correct, total, onExit }) {
  const pct = Math.round((correct / total) * 100);
  const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🎉" : pct >= 40 ? "💪" : "😅";
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-6">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#1a7a3c,#22c55e)", boxShadow: "0 16px 48px rgba(26,122,60,0.35)" }}>
        <Trophy size={40} className="text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Hoàn thành! {emoji}</h2>
        <p className="text-gray-500 font-medium">{correct}/{total} câu đúng — {pct}%</p>
      </div>
      <div className="text-4xl font-extrabold" style={{ color: "#1a7a3c" }}>{score} điểm</div>
      <button onClick={onExit}
        className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white text-sm transition-all"
        style={{ background: "linear-gradient(135deg,#1a7a3c,#22c55e)", boxShadow: "0 8px 24px rgba(26,122,60,0.3)" }}>
        <ArrowLeft size={16} /> Chơi game khác
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// GAME DEFINITIONS
// ══════════════════════════════════════════════════════════════════
const GAMES = [
  { id: "fast-match", title: "Fast Match", subtitle: "Chọn nghĩa đúng trước khi hết giờ", icon: Zap, color: "#f97316", gradient: "linear-gradient(135deg,#f97316,#fb923c)", bg: "linear-gradient(135deg,#fff7ed,#ffedd5)", glow: "rgba(249,115,22,0.25)", difficulty: "Dễ", diffColor: "#22c55e", component: FastMatchGame },
  { id: "word-match", title: "Word Match", subtitle: "Nối từ Hàn với nghĩa tương ứng", icon: ChevronRight, color: "#3b82f6", gradient: "linear-gradient(135deg,#3b82f6,#6366f1)", bg: "linear-gradient(135deg,#eff6ff,#eef2ff)", glow: "rgba(59,130,246,0.25)", difficulty: "Trung bình", diffColor: "#f97316", component: WordMatchGame },
  { id: "memory-card", title: "Memory Card", subtitle: "Ghi nhớ vị trí thẻ rồi ghép cặp", icon: Brain, color: "#8b5cf6", gradient: "linear-gradient(135deg,#8b5cf6,#a78bfa)", bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)", glow: "rgba(139,92,246,0.25)", difficulty: "Khó", diffColor: "#ef4444", component: MemoryCardGame },
  { id: "word-search", title: "Word Search", subtitle: "Tìm từ tiếng Hàn trong bảng chữ", icon: Search, color: "#0e7490", gradient: "linear-gradient(135deg,#0e7490,#0891b2)", bg: "linear-gradient(135deg,#ecfeff,#cffafe)", glow: "rgba(14,116,144,0.25)", difficulty: "Trung bình", diffColor: "#f97316", component: WordSearchGame },
];

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE — 3 phases: lobby → deck-select → playing
// ══════════════════════════════════════════════════════════════════
export default function GamesPage() {
  const [phase, setPhase] = useState("lobby");   // lobby | selecting | playing
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [gameKey, setGameKey] = useState(0);

  const handlePickGame = (game) => {
    setSelectedGame(game);
    setPhase("selecting");
  };

  const handlePickDeck = (deck) => {
    setSelectedDeck(deck);
    setGameKey(k => k + 1);
    setPhase("playing");
  };

  const handleExitGame = () => {
    setPhase("lobby");
    setSelectedGame(null);
    setSelectedDeck(null);
  };

  // ── PLAYING ──────────────────────────────────────────────────────
  if (phase === "playing" && selectedGame && selectedDeck) {
    const GameComponent = selectedGame.component;
    const vocabForGame = selectedDeck.terms.map(t => ({ front: t.front, back: t.back }));
    return (
      <div className="w-full font-sans flex flex-col gap-4" style={{ height: "calc(100vh - 180px)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setPhase("selecting")} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selectedGame.gradient }}>
              <selectedGame.icon size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 text-lg leading-none">{selectedGame.title}</h1>
              <p className="text-xs text-gray-400 font-medium">📚 {selectedDeck.title}</p>
            </div>
          </div>
          <span className="ml-auto text-[11px] font-black px-3 py-1 rounded-full"
            style={{ background: selectedGame.diffColor + "15", color: selectedGame.diffColor, border: `1px solid ${selectedGame.diffColor}30` }}>
            {selectedGame.difficulty}
          </span>
        </div>
        {/* Game canvas */}
        <div className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 overflow-hidden" style={{ minHeight: 0 }}>
          <GameComponent key={gameKey} vocab={vocabForGame} onComplete={handleExitGame} />
        </div>
      </div>
    );
  }

  // ── DECK SELECTOR ────────────────────────────────────────────────
  if (phase === "selecting" && selectedGame) {
    return <DeckSelector game={selectedGame} onSelect={handlePickDeck} onBack={() => setPhase("lobby")} />;
  }

  // ── LOBBY ─────────────────────────────────────────────────────────
  return (
    <div className="w-full pb-8 font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1a7a3c,#22c55e)" }}>
            <Gamepad2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">🎮 Mini Games</h1>
            <p className="text-sm text-gray-500 font-medium">Chọn game → chọn bộ flashcard → chơi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <div key={game.id} onClick={() => handlePickGame(game)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 20px 48px ${game.glow}, 0 4px 12px rgba(0,0,0,0.07)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)"; }}>
              <div className="h-1 w-full" style={{ background: game.gradient }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: game.bg }}>
                    <Icon size={28} style={{ color: game.color }} />
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                    style={{ background: game.diffColor + "15", color: game.diffColor, border: `1px solid ${game.diffColor}25` }}>
                    {game.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">{game.title}</h3>
                <p className="text-sm text-gray-500 font-medium mb-5">{game.subtitle}</p>
                {/* Deck count hint */}
                <div className="flex items-center gap-2 mb-4 text-xs font-medium text-gray-400">
                  <Layers size={13} />
                  <span>{MOCK_DECKS.length} bộ từ vựng có thể chọn</span>
                </div>
                <button className="w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: game.gradient, boxShadow: `0 4px 16px ${game.glow}` }}>
                  <Play size={16} fill="white" /> Chọn bộ từ & chơi
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
