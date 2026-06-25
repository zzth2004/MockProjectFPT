import React, { useRef, useEffect } from "react";

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

export default function ConsoleLog({ logs, clearLogs }) {
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div style={{ ...S.card(), gridColumn: "1/-1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...S.cardTitle, color: "#39ff14" }}>
        <span>📟 Console Logs</span>
        <button onClick={clearLogs} style={{ ...S.btn("#334155", "#94a3b8"), padding: "4px 10px", fontSize: 11 }}>
          Xóa
        </button>
      </div>
      <div style={{ background: "#000", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 12, height: 160, overflowY: "auto", border: "1px solid #334155" }}>
        {logs.map((l, i) => (
          <div
            key={i}
            style={{
              marginBottom: 4,
              lineHeight: 1.5,
              color: l.type === "error" ? "#ef4444" : l.type === "warn" ? "#fbbf24" : l.type === "success" ? "#10b981" : "#00e5ff",
            }}
          >
            {l.time && <span style={{ opacity: 0.4 }}>[{l.time}] </span>}
            {l.msg}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
