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
};

export default function Leaderboard({ players }) {
  return (
    <div style={{ ...S.card("#4f46e5"), gridColumn: "1/-1" }}>
      <h2 style={{ ...S.cardTitle, color: "#818cf8" }}>🏆 Bảng xếp hạng trực tiếp</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Hạng", "Tên học sinh", "Đã trả lời", "Điểm", "Socket ID"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  borderBottom: "1px solid #334155",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#475569" }}>
                Chưa có học sinh nào
              </td>
            </tr>
          ) : (
            players.map((p, i) => (
              <tr key={p.socketId} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #1e293b" }}>
                  {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span style={{ color: "#94a3b8" }}>{i + 1}</span>}
                </td>
                <td style={{ padding: "10px 12px", fontWeight: 600, borderBottom: "1px solid #1e293b" }}>
                  {p.fullName || "Ẩn danh"}
                </td>
                <td style={{ padding: "10px 12px", color: "#94a3b8", borderBottom: "1px solid #1e293b" }}>
                  {p.progress || 0} câu
                </td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#10b981", borderBottom: "1px solid #1e293b" }}>
                  {p.score ?? 0}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: "#475569",
                    fontSize: 11,
                    fontFamily: "monospace",
                    borderBottom: "1px solid #1e293b",
                  }}
                >
                  {p.socketId}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
