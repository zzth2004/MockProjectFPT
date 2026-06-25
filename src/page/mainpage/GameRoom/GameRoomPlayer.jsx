import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../../context/authContext";


const SOCKET_URL = "http://localhost:3000/game-room";
const OPTION_COLORS = [
  { bg: "#ef4444", glow: "rgba(239,68,68,0.35)", light: "#fca5a5" },
  { bg: "#3b82f6", glow: "rgba(59,130,246,0.35)", light: "#93c5fd" },
  { bg: "#f59e0b", glow: "rgba(245,158,11,0.35)", light: "#fcd34d" },
  { bg: "#10b981", glow: "rgba(16,185,129,0.35)", light: "#6ee7b7" },
  { bg: "#8b5cf6", glow: "rgba(139,92,246,0.35)", light: "#c4b5fd" },
  { bg: "#ec4899", glow: "rgba(236,72,153,0.35)", light: "#f9a8d4" },
];
const LETTER_LABELS = ["A", "B", "C", "D", "E", "F"];
const MEDAL_DATA = [
  { emoji: "👑", color: "#fbbf24", label: "1st", height: 140, bg: "linear-gradient(180deg,#fbbf2433 0%,#fbbf2408 100%)" },
  { emoji: "🥈", color: "#94a3b8", label: "2nd", height: 100, bg: "linear-gradient(180deg,#94a3b833 0%,#94a3b808 100%)" },
  { emoji: "🥉", color: "#cd7f32", label: "3rd", height: 75, bg: "linear-gradient(180deg,#cd7f3233 0%,#cd7f3208 100%)" },
];

const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=fff&bold=true&size=64`;

// ════════════════════════════════════════════════════════════════════════════
export default function GameRoomPlayer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const socketRef = useRef(null);
  const [pin, setPin] = useState(searchParams.get("pin") || "");
  const [nickname, setNickname] = useState(user?.fullName || "");
  const [screen, setScreen] = useState("JOIN");
  const [errorMsg, setErrorMsg] = useState("");
  const [room, setRoom] = useState(null);
  const [mySocketId, setMySocketId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const timerRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  // ── Join handler ──────────────────────────────────────────────────────
  const handleJoin = (e) => {
    e?.preventDefault();
    if (!pin || pin.length !== 6) { alert("Mã PIN phải gồm 6 chữ số!"); return; }
    if (!nickname.trim()) { alert("Nhập tên của bạn!"); return; }

    const sock = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = sock;

    sock.on("connect", () => {
      setMySocketId(sock.id);
      sock.emit("joinRoom", {
        pin,
        fullName: nickname.trim(),
        avatar: user?.avatar || avatarUrl(nickname),
        userId: user?.id,
      });
    });

    sock.on("joinSuccess", (data) => {
      setRoom(data.room);
      setPlayers(Object.values(data.room?.players || {}));
      setScreen("LOBBY");
    });

    sock.on("joinFailed", (err) => {
      setErrorMsg(err.message || "Mã PIN không đúng hoặc phòng đã chơi rồi.");
      setScreen("ERROR");
      sock.disconnect();
    });

    sock.on("playerJoined", (data) => setPlayers(data.leaderboard || []));
    sock.on("playerLeft", (data) => setPlayers(data.leaderboard || []));

    sock.on("gameStarted", (data) => {
      setQuestions(data.questions || []);
      setQIdx(0);
      setScore(0);
      setIsAnswered(false);
      setSelected(null);
      setScreen("PLAYING");
    });

    sock.on("updateLeaderboard", (data) => setPlayers(data.leaderboard || []));

    sock.on("gameEnded", (data) => {
      stopTimer();
      setPlayers(data.leaderboard || []);
      setScreen("ENDED");
    });

    sock.on("roomDeactivated", () => {
      stopTimer();
      setScreen("ERROR");
      setErrorMsg("Giáo viên đã đóng phòng chơi này.");
    });

    sock.on("error", (err) => {
      setErrorMsg(err.message || "Lỗi kết nối server.");
    });

    sock.on("disconnect", () => { /* handled by roomDeactivated or intentional exit */ });
  };

  // ── Timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "PLAYING" || isAnswered || questions.length === 0) return;
    const q = questions[qIdx];
    const limit = q?.timeLimit || 30;
    setTimeLeft(limit);
    stopTimer();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { stopTimer(); submitAnswer(null, true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return stopTimer;
  }, [screen, qIdx, questions, isAnswered]);

  // ── Answer submission ────────────────────────────────────────────────
  const submitAnswer = useCallback((option, isTimeout = false) => {
    if (isAnswered) return;
    stopTimer();
    setIsAnswered(true);
    setSelected(option);

    const q = questions[qIdx];
    const basePoints = q?.points || 10;
    const limit = q?.timeLimit || 30;
    const isCorrect = !isTimeout && option?.isCorrect === true;

    // Điểm chính: chỉ cộng khi đúng
    const earnedBase = isCorrect ? basePoints : 0;

    // Điểm tốc độ: 1/5 điểm chính, giảm dần theo thời gian còn lại
    // speedBonus = (basePoints / 5) * (timeLeft / limit)
    const speedBonus = isCorrect
      ? Math.round((basePoints / 5) * (timeLeft / limit))
      : 0;

    const addedScore = earnedBase + speedBonus;
    const newScore = score + addedScore;
    setScore(newScore);
    setFeedbackData({ isTimeout, isCorrect, earnedBase, speedBonus, addedScore });

    socketRef.current?.emit("submitProgress", {
      pin,
      progress: qIdx + 1,
      score: newScore,
    });

    setTimeout(() => {
      if (qIdx + 1 < questions.length) {
        setQIdx((i) => i + 1);
        setSelected(null);
        setIsAnswered(false);
        setFeedbackData(null);
        setScreen("PLAYING");
      } else {
        setScreen("WAITING_END");
      }
    }, 2500);
    setScreen("FEEDBACK");
  }, [isAnswered, timeLeft, score, qIdx, questions, pin]);

  const handleExit = () => {
    stopTimer();
    socketRef.current?.disconnect();
    navigate("/user/game-room/play");
    window.location.reload();
  };

  const myRank = players.findIndex(p => p.socketId === mySocketId) + 1 || "?";

  // ════════════════════════════════════════════════════════════════════════
  // ── SCREEN: JOIN ──────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "JOIN") return (
    <div style={S.page}>
      <div style={S.particles} />
      <div style={{ width: "100%", maxWidth: 440, padding: "0 16px", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 28,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 0 60px rgba(139,92,246,0.5), 0 20px 40px rgba(0,0,0,0.3)",
            animation: "floatLogo 3s ease-in-out infinite",
          }}>
            <span style={{ fontSize: 40 }}>🎮</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, color: "#f8fafc", letterSpacing: -1.5 }}>
            Live <span style={{ background: "linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Quiz</span>
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748b", fontWeight: 500 }}>Tham gia phòng đấu trí cùng lớp</p>
        </div>

        {/* Card */}
        <div style={S.glass}>
          <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={S.label}>Mã PIN phòng chơi</label>
              <input
                type="text" maxLength={6} inputMode="numeric"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                style={{ ...S.input, textAlign: "center", fontSize: 32, letterSpacing: 14, fontWeight: 900, color: "#fbbf24" }}
                required
              />
            </div>
            <div>
              <label style={S.label}>Tên hiển thị</label>
              <input
                type="text" maxLength={20}
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Nhập tên hoặc biệt danh..."
                style={S.input}
                required
              />
            </div>
            <button type="submit" style={S.primaryBtn}>
              <span style={{ fontSize: 18 }}>🚀</span> Gia nhập phòng chơi
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#475569" }}>
          Giáo viên sẽ cung cấp mã PIN cho bạn
        </p>
      </div>
      <GlobalCSS />
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // ── SCREEN: ERROR ─────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "ERROR") return (
    <div style={S.page}>
      <div style={S.particles} />
      <div style={{ ...S.glass, maxWidth: 400, width: "100%", textAlign: "center", padding: 48, zIndex: 1 }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: "shake 0.5s ease" }}>😕</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#f8fafc" }}>Không thể tham gia</h2>
        <p style={{ margin: "0 0 28px", color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>{errorMsg}</p>
        <button onClick={() => { setScreen("JOIN"); setErrorMsg(""); }} style={{ ...S.primaryBtn, background: "#334155" }}>
          ← Thử lại
        </button>
      </div>
      <GlobalCSS />
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // ── SCREEN: LOBBY ─────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "LOBBY") return (
    <div style={S.page}>
      <div style={S.particles} />
      <div style={{ width: "100%", maxWidth: 620, padding: "0 16px", zIndex: 1 }}>

        {/* PIN display */}
        <div style={{ ...S.glass, textAlign: "center", padding: "32px 24px", marginBottom: 20, border: "1px solid rgba(99,102,241,0.4)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, position: "relative" }}>Mã PIN phòng</p>
          <div style={{
            fontSize: 56, fontWeight: 900, letterSpacing: 16, color: "#fbbf24",
            textShadow: "0 0 40px rgba(251,191,36,0.5), 0 0 80px rgba(251,191,36,0.2)",
            position: "relative",
          }}>{pin}</div>
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, position: "relative" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 12px #10b981", animation: "blink 1.5s ease-in-out infinite" }} />
            <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>
              Chào <strong style={{ color: "#e2e8f0" }}>{nickname}</strong>! Đang chờ giáo viên bắt đầu...
            </span>
          </div>
        </div>

        {/* Players list */}
        <div style={S.glass}>
          <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
            👥 Người chơi đã vào ({players.length})
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {players.map((p, i) => (
              <div key={p.socketId} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 12,
                background: p.socketId === mySocketId ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${p.socketId === mySocketId ? "rgba(99,102,241,0.5)" : "#1e293b"}`,
                animation: `fadeSlideUp 0.3s ease ${i * 0.05}s both`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: `linear-gradient(135deg, ${OPTION_COLORS[i % OPTION_COLORS.length].bg}, ${OPTION_COLORS[i % OPTION_COLORS.length].bg}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0,
                }}>
                  {p.fullName?.[0]?.toUpperCase() || "?"}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: p.socketId === mySocketId ? "#a5b4fc" : "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.fullName} {p.socketId === mySocketId && <span style={{ color: "#818cf8", fontSize: 10 }}>(Bạn)</span>}
                </span>
              </div>
            ))}
            {players.length === 0 && <p style={{ color: "#475569", fontSize: 13, gridColumn: "1/-1" }}>Chưa có ai...</p>}
          </div>
        </div>
      </div>
      <GlobalCSS />
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // ── SCREEN: PLAYING ───────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "PLAYING" && questions.length > 0) {
    const q = questions[qIdx];
    const limit = q?.timeLimit || 30;
    const timerPct = (timeLeft / limit) * 100;
    const isUrgent = timeLeft <= 5;

    return (
      <div style={{ ...S.page, justifyContent: "flex-start", padding: 0, background: "#0a0e1a" }}>
        <div style={S.particles} />

        {/* TOP BAR */}
        <div style={{
          width: "100%", padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(10,14,26,0.95)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1e293b", position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>Câu hỏi</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#f8fafc" }}>
                {qIdx + 1}<span style={{ color: "#334155", fontSize: 13, fontWeight: 600 }}>/{questions.length}</span>
              </div>
            </div>
            <div style={{ width: 1, height: 32, background: "#1e293b" }} />
            <div>
              <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>Điểm</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>⭐ {score}</div>
            </div>
          </div>

          {/* Timer Circle */}
          <div style={{ position: "relative", width: 56, height: 56 }}>
            <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="28" cy="28" r="24" fill="none" stroke="#1e293b" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" fill="none"
                stroke={isUrgent ? "#ef4444" : timerPct > 50 ? "#10b981" : "#fbbf24"}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - timerPct / 100)}`}
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 900,
              color: isUrgent ? "#ef4444" : "#f8fafc",
              animation: isUrgent ? "urgentPulse 0.5s ease-in-out infinite" : "none",
            }}>{timeLeft}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", height: 3, background: "#0f172a" }}>
          <div style={{
            height: "100%", transition: "width 0.4s ease",
            width: `${((qIdx) / questions.length) * 100}%`,
            background: "linear-gradient(90deg, #6366f1, #a855f7)",
          }} />
        </div>

        {/* QUESTION AREA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 20px", maxWidth: 760, width: "100%", margin: "0 auto", zIndex: 1 }}>

          {/* Question Card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))",
            border: "1px solid #1e293b",
            borderRadius: 24, padding: "32px 28px", marginBottom: 28,
            textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)" }} />
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 9999,
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: 1 }}>
                {q?.type?.replace("_", " ") || "Câu hỏi"} • {q?.points || 10} điểm
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.5 }}>
              {q?.questionText}
            </h2>
          </div>

          {/* OPTIONS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: (q?.options || []).length <= 2 ? "1fr" : "1fr 1fr", gap: 14 }}>
            {(q?.options || []).map((opt, i) => {
              const c = OPTION_COLORS[i % OPTION_COLORS.length];
              const isSelected = selected?.optionText === opt.optionText;
              const isHover = hovered === i && !isAnswered;

              return (
                <button
                  key={i}
                  onClick={() => !isAnswered && submitAnswer(opt)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  disabled={isAnswered}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${c.bg}44, ${c.bg}22)`
                      : isHover
                        ? `linear-gradient(135deg, ${c.bg}28, ${c.bg}14)`
                        : `linear-gradient(135deg, ${c.bg}15, ${c.bg}08)`,
                    border: `2px solid ${isSelected ? c.bg : isHover ? `${c.bg}88` : `${c.bg}33`}`,
                    borderRadius: 18,
                    padding: "22px 20px",
                    color: "#f1f5f9",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: isAnswered ? "default" : "pointer",
                    textAlign: "left",
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                    transform: isSelected ? "scale(1.03)" : isHover ? "scale(1.02) translateY(-2px)" : "scale(1)",
                    boxShadow: isSelected
                      ? `0 0 30px ${c.glow}, 0 8px 20px rgba(0,0,0,0.3)`
                      : isHover
                        ? `0 0 20px ${c.glow}, 0 4px 12px rgba(0,0,0,0.2)`
                        : "0 2px 8px rgba(0,0,0,0.15)",
                    animation: `fadeSlideUp 0.3s ease ${i * 0.08}s both`,
                  }}
                >
                  <span style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: isSelected ? c.bg : `${c.bg}55`,
                    color: "#fff", fontWeight: 900, fontSize: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: isSelected ? `0 0 16px ${c.glow}` : "none",
                    transition: "all 0.2s",
                  }}>
                    {LETTER_LABELS[i]}
                  </span>
                  <span style={{ lineHeight: 1.4 }}>{opt.optionText}</span>
                </button>
              );
            })}
          </div>
        </div>

        <GlobalCSS />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // ── SCREEN: FEEDBACK ──────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "FEEDBACK") {
    const isTimeout = feedbackData?.isTimeout;
    const isCorrect = feedbackData?.isCorrect;
    return (
      <div style={S.page}>
        <div style={S.particles} />
        <div style={{ ...S.glass, maxWidth: 440, width: "100%", textAlign: "center", padding: "48px 36px", zIndex: 1, position: "relative", overflow: "hidden" }}>
          {/* Top accent bar */}
          {isCorrect && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #10b981, #34d399)" }} />
          )}
          {!isTimeout && !isCorrect && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #ef4444, #f87171)" }} />
          )}

          <div style={{ fontSize: 80, marginBottom: 20, animation: "bounceIn 0.5s ease" }}>
            {isTimeout ? "⏰" : isCorrect ? "✅" : "❌"}
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 900, color: "#f8fafc" }}>
            {isTimeout ? "Hết giờ!" : isCorrect ? "Chính xác!" : "Sai rồi!"}
          </h2>
          <p style={{ margin: "0 0 24px", color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>
            {isTimeout
              ? "Bạn không kịp chọn đáp án."
              : `Bạn đã chọn: "${selected?.optionText}"`}
          </p>

          {/* Score breakdown — chỉ hiện khi đúng */}
          {isCorrect && (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24, animation: "scaleUp 0.4s ease 0.2s both" }}>
              <div style={{
                padding: "12px 20px", borderRadius: 14,
                background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#10b981" }}>+{feedbackData.earnedBase}</div>
                <div style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 600 }}>điểm chính</div>
              </div>
              {feedbackData.speedBonus > 0 && (
                <div style={{
                  padding: "12px 20px", borderRadius: 14,
                  background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#fbbf24" }}>+{feedbackData.speedBonus}</div>
                  <div style={{ fontSize: 11, color: "#fcd34d", fontWeight: 600 }}>tốc độ</div>
                </div>
              )}
            </div>
          )}

          {/* Sai thì hiện 0 điểm */}
          {!isTimeout && !isCorrect && (
            <div style={{
              display: "inline-flex", alignItems: "baseline", gap: 8,
              padding: "14px 28px", borderRadius: 16,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#ef4444" }}>+0</span>
              <span style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600 }}>không có điểm</span>
            </div>
          )}

          <div style={{
            padding: "16px 24px", borderRadius: 16,
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))",
            border: "1px solid rgba(99,102,241,0.25)",
          }}>
            <span style={{ fontSize: 12, color: "#818cf8", fontWeight: 700 }}>Tổng điểm: </span>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>⭐ {score}</span>
          </div>

          <p style={{ margin: "20px 0 0", fontSize: 12, color: "#475569" }}>
            {qIdx + 1 < questions.length ? "Câu tiếp theo trong giây lát..." : "Chờ giáo viên kết thúc game..."}
          </p>
        </div>
        <GlobalCSS />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // ── SCREEN: WAITING END ───────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "WAITING_END") return (
    <div style={S.page}>
      <div style={S.particles} />
      <div style={{ ...S.glass, maxWidth: 400, width: "100%", textAlign: "center", padding: 48, zIndex: 1 }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: "floatLogo 2s ease-in-out infinite" }}>🎯</div>
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 22, color: "#f8fafc" }}>Đã hoàn thành!</h2>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>Chờ giáo viên kết thúc để xem kết quả cuối...</p>
        <div style={{
          padding: "18px 28px", borderRadius: 16,
          background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08))",
          border: "1px solid rgba(251,191,36,0.3)",
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#fbbf24" }}>⭐ {score} điểm</span>
        </div>
      </div>
      <GlobalCSS />
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // ── SCREEN: ENDED ─────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "ENDED") {
    const top3 = players.slice(0, 3);
    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
    const myEntry = players.find(p => p.socketId === mySocketId);

    return (
      <div style={{ ...S.page, justifyContent: "flex-start", padding: "32px 16px", overflowY: "auto" }}>
        <div style={S.particles} />
        {/* Confetti layer */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: Math.random() * 10 + 4,
              height: Math.random() * 10 + 4,
              borderRadius: Math.random() > 0.5 ? "50%" : 2,
              background: OPTION_COLORS[i % OPTION_COLORS.length].bg,
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20 + 5}%`,
              animation: `confettiFall ${Math.random() * 3 + 3}s linear ${Math.random() * 2}s infinite`,
              opacity: 0.7,
            }} />
          ))}
        </div>

        <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 20, zIndex: 1 }}>

          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 12, animation: "bounceIn 0.6s ease" }}>🏆</div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#f8fafc" }}>Kết thúc!</h1>
            <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: 14 }}>Trận đấu Live Quiz đã kết thúc</p>
          </div>

          {/* Podium - visual display */}
          {top3.length >= 3 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 8, marginTop: 8, marginBottom: 8 }}>
              {[1, 0, 2].map((rank) => {
                const p = top3[rank];
                const m = MEDAL_DATA[rank];
                if (!p) return null;
                return (
                  <div key={rank} style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    animation: `fadeSlideUp 0.5s ease ${rank * 0.15}s both`,
                  }}>
                    <div style={{ fontSize: rank === 0 ? 36 : 28, marginBottom: 8 }}>{m.emoji}</div>
                    <div style={{
                      width: 48, height: 48, borderRadius: 16,
                      background: `linear-gradient(135deg, ${m.color}44, ${m.color}22)`,
                      border: `2px solid ${m.color}88`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 900, color: m.color,
                      marginBottom: 8,
                    }}>
                      {p.fullName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", maxWidth: 90, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.fullName}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: m.color, marginTop: 4 }}>
                      {p.score ?? 0}
                    </span>
                    <div style={{
                      width: rank === 0 ? 100 : 80,
                      height: m.height,
                      borderRadius: "12px 12px 0 0",
                      background: m.bg,
                      border: `1px solid ${m.color}33`,
                      borderBottom: "none",
                      marginTop: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, fontWeight: 900, color: `${m.color}55`,
                    }}>
                      #{rank + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* My result */}
          <div style={{ ...S.glass, textAlign: "center", border: "1px solid rgba(251,191,36,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }} />
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Kết quả của bạn</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
              <div style={{ padding: 18, borderRadius: 14, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Tổng điểm</p>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#fbbf24" }}>⭐ {myEntry?.score ?? score}</p>
              </div>
              <div style={{ padding: 18, borderRadius: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Hạng của bạn</p>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#818cf8" }}>
                  {myRank > 0 ? `#${myRank}` : "?"}
                </p>
              </div>
            </div>
          </div>

          {/* Full Leaderboard */}
          <div style={S.glass}>
            <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>🏅 Bảng xếp hạng đầy đủ</h3>
            {players.map((p, i) => {
              const isMe = p.socketId === mySocketId;
              const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
              return (
                <div key={p.socketId} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 14, marginBottom: 8,
                  background: isMe ? "rgba(99,102,241,0.12)" : i < 3 ? "rgba(255,255,255,0.03)" : "transparent",
                  border: `1px solid ${isMe ? "rgba(99,102,241,0.35)" : i < 3 ? "#1e293b" : "transparent"}`,
                  animation: `fadeSlideUp 0.3s ease ${i * 0.05}s both`,
                }}>
                  <span style={{ width: 32, fontSize: medal ? 22 : 14, textAlign: "center", fontWeight: 800, color: "#64748b" }}>
                    {medal || (i + 1)}
                  </span>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `linear-gradient(135deg, ${OPTION_COLORS[i % OPTION_COLORS.length].bg}55, ${OPTION_COLORS[i % OPTION_COLORS.length].bg}22)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 900, color: "#fff", flexShrink: 0,
                  }}>
                    {p.fullName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isMe ? "#a5b4fc" : "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.fullName} {isMe && <span style={{ fontSize: 11, color: "#818cf8" }}>(Bạn)</span>}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{p.progress || 0} câu đã trả lời</p>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: i === 0 ? "#fbbf24" : "#e2e8f0" }}>
                    {p.score ?? 0}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Exit button */}
          <button onClick={handleExit} style={{ ...S.primaryBtn, background: "#334155", width: "100%" }}>
            ← Quay lại trang chủ
          </button>
        </div>
        <GlobalCSS />
      </div>
    );
  }

  return null;
}

// ─── Style Tokens ───────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0a0e1a 50%, #0f172a 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
    color: "#f8fafc",
    position: "relative",
    overflow: "hidden",
  },
  particles: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: "radial-gradient(1.5px 1.5px at 20% 30%, rgba(148,163,184,0.15) 50%, transparent 0), radial-gradient(1px 1px at 60% 70%, rgba(148,163,184,0.1) 50%, transparent 0), radial-gradient(1.5px 1.5px at 80% 20%, rgba(148,163,184,0.12) 50%, transparent 0)",
    backgroundSize: "200px 200px, 150px 150px, 180px 180px",
  },
  glass: {
    background: "rgba(15,23,42,0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(51,65,85,0.5)",
    borderRadius: 24,
    padding: 28,
  },
  input: {
    width: "100%",
    background: "rgba(10,14,26,0.8)",
    border: "1px solid #1e293b",
    color: "#f8fafc",
    padding: "16px 18px",
    borderRadius: 14,
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginTop: 8,
    transition: "border-color 0.2s",
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    padding: "16px 28px",
    borderRadius: 16,
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.5,
    transition: "all 0.2s",
    boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
  },
};

function GlobalCSS() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { overflow-x: hidden; }
      input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
      button:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
      button:active:not(:disabled) { transform: translateY(0) scale(0.98); }
      @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      @keyframes bounceIn { 0% { transform:scale(0.3); opacity:0; } 50% { transform:scale(1.08); } 100% { transform:scale(1); opacity:1; } }
      @keyframes urgentPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.2); } }
      @keyframes floatLogo { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
      @keyframes scaleUp { 0% { transform:scale(0.8); opacity:0; } 100% { transform:scale(1); opacity:1; } }
      @keyframes fadeSlideUp { 0% { transform:translateY(12px); opacity:0; } 100% { transform:translateY(0); opacity:1; } }
      @keyframes shake { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-8px); } 40% { transform:translateX(8px); } 60% { transform:translateX(-4px); } 80% { transform:translateX(4px); } }
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    `}</style>
  );
}
