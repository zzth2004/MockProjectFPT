import React from "react";

const S = {
  card: (border = "#334155") => ({
    background: "#1e293b",
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: 20,
  }),
  btn: (bg = "#4f46e5", color = "#fff") => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: bg,
    color,
    border: "none",
    padding: "9px 16px",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  }),
};

export default function Header({ connected, gameStatus }) {
  const statusColors = {
    IDLE: ["#94a3b8", "rgba(148,163,184,0.1)"],
    LOBBY: ["#818cf8", "rgba(79,70,229,0.15)"],
    PLAYING: ["#fbbf24", "rgba(245,158,11,0.15)"],
    FINISHED: ["#10b981", "rgba(16,185,129,0.15)"],
  };
  const [sc, sbg] = statusColors[gameStatus] || statusColors.IDLE;

  const handleCloseTab = () => {
    if (window.history.length <= 1) {
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <div style={S.card("#334155")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>🎮 Live Quiz — Host Control Panel</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>Tạo &amp; điều khiển phòng Quiz trực tiếp</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{
            padding: "6px 14px",
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            background: connected ? "rgba(16,185,129,0.15)" : "rgba(148,163,184,0.1)",
            color: connected ? "#10b981" : "#94a3b8",
            border: `1px solid ${connected ? "#10b981" : "#334155"}`
          }}>
            {connected ? "🟢 Đã kết nối" : "⚫ Chưa kết nối"}
          </span>
          <span style={{
            padding: "6px 14px",
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            background: sbg,
            color: sc,
            border: `1px solid ${sc}`
          }}>
            ⚡ {gameStatus}
          </span>
          <button onClick={handleCloseTab} style={S.btn("#334155", "#94a3b8")}>
            ✕ Đóng tab
          </button>
        </div>
      </div>
    </div>
  );
}
