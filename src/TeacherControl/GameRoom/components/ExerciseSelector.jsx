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
  input: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
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

export default function ExerciseSelector({
  exercises,
  loadingEx,
  searchQ,
  setSearchQ,
  selectedEx,
  setSelectedEx,
  handlePreview,
  loadExercises,
  addLog,
}) {
  const filtered = exercises.filter((ex) =>
    (ex.title || "").toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div style={S.card("#00e5ff")}>
      <h2 style={{ ...S.cardTitle, color: "#00e5ff" }}>🔍 Chọn bài tập có sẵn</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          style={S.input}
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Tìm theo tên..."
        />
        <button style={S.btn("#00e5ff", "#000")} onClick={() => loadExercises(searchQ)}>
          Tìm
        </button>
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto", background: "#0f172a", border: "1px solid #334155", borderRadius: 10 }}>
        {loadingEx ? (
          <p style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: 20, color: "#475569", fontSize: 13 }}>Không có bài tập.</p>
        ) : (
          filtered.map((ex) => (
            <div
              key={ex.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 14px",
                borderBottom: "1px solid #1e293b",
                background: selectedEx?.id === ex.id ? "rgba(0,229,255,0.06)" : "transparent",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#f8fafc",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 210,
                  }}
                >
                  {ex.title || `Bài tập #${ex.id}`}
                </p>
                <span style={{ fontSize: 11, color: "#475569" }}>ID: {ex.id}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  style={{ ...S.btn("#1e293b", "#00e5ff"), padding: "4px 9px", fontSize: 11 }}
                  onClick={() => handlePreview(ex)}
                >
                  👁 Preview
                </button>
                <button
                  style={{
                    ...S.btn(selectedEx?.id === ex.id ? "#10b981" : "#4f46e5", "#fff"),
                    padding: "4px 9px",
                    fontSize: 11,
                  }}
                  onClick={() => {
                    setSelectedEx(ex);
                    if (addLog) addLog(`Chọn: ${ex.title}`, "success");
                  }}
                >
                  {selectedEx?.id === ex.id ? "✓ Đã chọn" : "Chọn"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
