import React from "react";

const S = {
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
  badge: (bg) => ({
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 4,
    background: bg,
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: 700,
  }),
};

export default function PreviewModal({
  showPreview,
  setShowPreview,
  loadingPreview,
  preview,
}) {
  if (!showPreview) return null;

  return (
    <div
      onClick={() => setShowPreview(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1e293b",
          border: "1px solid #00e5ff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 680,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #334155",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, color: "#00e5ff", fontSize: 16, fontWeight: 700 }}>🔍 Xem trước đề thi</h3>
          <button onClick={() => setShowPreview(false)} style={S.btn("#ef4444", "#fff")}>
            Đóng
          </button>
        </div>
        <div style={{ padding: 24, overflowY: "auto" }}>
          {loadingPreview ? (
            <p style={{ textAlign: "center", color: "#94a3b8" }}>Đang tải...</p>
          ) : preview ? (
            <div>
              <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px dashed #334155" }}>
                <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 15, color: "#f8fafc" }}>
                  📚 {preview.title}
                </p>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "#94a3b8" }}>{preview.description}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={S.badge("#4f46e5")}>{preview.level}</span>
                  <span style={S.badge("#0ea5e9")}>{preview.skill}</span>
                  <span style={S.badge("#334155")}>{preview.timeLimit || 0} phút</span>
                  <span style={S.badge("#334155")}>{(preview.questions || []).length} câu</span>
                </div>
              </div>
              {(preview.questions || []).map((q, qi) => (
                <div
                  key={q.id}
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    background: "#0f172a",
                    borderRadius: 10,
                    border: "1px solid #334155",
                  }}
                >
                  <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>
                    Câu {qi + 1}: {q.questionText}
                    <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 11, marginLeft: 8 }}>
                      ({q.points} điểm)
                    </span>
                  </p>
                  {(q.options || []).map((opt) => (
                    <div
                      key={opt.id}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        marginBottom: 4,
                        fontSize: 13,
                        background: opt.isCorrect ? "rgba(16,185,129,0.1)" : "transparent",
                        color: opt.isCorrect ? "#10b981" : "#94a3b8",
                        border: `1px solid ${opt.isCorrect ? "#10b981" : "#1e293b"}`,
                        fontWeight: opt.isCorrect ? 700 : 400,
                      }}
                    >
                      {opt.isCorrect ? "✅ " : "○ "}{opt.optionText}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#ef4444" }}>Không thể tải.</p>
          )}
        </div>
      </div>
    </div>
  );
}
