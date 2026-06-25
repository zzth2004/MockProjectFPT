import React from "react";

const S = {
  card: (border = "#334155") => ({
    background: "#1e293b",
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: 20,
  }),
  cardTitle: {
    margin: "0 0 16px",
    fontSize: 15,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
    borderBottom: "1px dashed #334155",
  },
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

export default function RoomControl({
  room,
  selectedEx,
  players,
  gameStatus,
  connected,
  handleCreateRoom,
  handleStart,
  handleEnd,
  handleDisconnect,
}) {
  const gameCanCreate = gameStatus === "IDLE" || gameStatus === "FINISHED";

  return (
    <div style={S.card("#10b981")}>
      <h2 style={{ ...S.cardTitle, color: "#10b981" }}>🎯 Bảng điều khiển</h2>

      {/* PIN */}
      <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px dashed #334155", marginBottom: 16 }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Mã PIN tham gia</p>
        <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 12, color: room ? "#fbbf24" : "#334155" }}>
          {room?.pin || "------"}
        </div>
        {selectedEx && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#94a3b8" }}>📚 {selectedEx.title}</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px dashed #334155", marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👥</div>
        <div>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>{players.length}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Học sinh trong phòng</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={() => handleCreateRoom(selectedEx)}
          disabled={!selectedEx || !gameCanCreate}
          style={{
            ...S.btn(!selectedEx || !gameCanCreate ? "#334155" : "#10b981", !selectedEx || !gameCanCreate ? "#94a3b8" : "#000"),
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            cursor: !selectedEx || !gameCanCreate ? "not-allowed" : "pointer",
            opacity: !selectedEx || !gameCanCreate ? 0.5 : 1
          }}
        >
          ⚡ Tạo phòng &amp; Kết nối
        </button>
        <button
          onClick={handleStart}
          disabled={gameStatus !== "LOBBY" || players.length === 0}
          style={{
            ...S.btn("#4f46e5", "#fff"),
            justifyContent: "center",
            fontWeight: 700,
            opacity: gameStatus !== "LOBBY" || players.length === 0 ? 0.4 : 1,
            cursor: gameStatus !== "LOBBY" || players.length === 0 ? "not-allowed" : "pointer"
          }}
        >
          ▶ Bắt đầu Live Quiz
        </button>
        <button
          onClick={handleEnd}
          disabled={gameStatus !== "PLAYING"}
          style={{
            ...S.btn("#ef4444", "#fff"),
            justifyContent: "center",
            opacity: gameStatus !== "PLAYING" ? 0.4 : 1,
            cursor: gameStatus !== "PLAYING" ? "not-allowed" : "pointer"
          }}
        >
          ⏹ Kết thúc Game
        </button>
        {connected && (
          <button onClick={handleDisconnect} style={{ ...S.btn("#334155", "#94a3b8"), justifyContent: "center", fontSize: 12 }}>
            🔌 Ngắt kết nối
          </button>
        )}
      </div>
    </div>
  );
}
