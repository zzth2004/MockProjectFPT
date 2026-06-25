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
  label: {
    display: "block",
    marginBottom: 5,
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  select: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "inherit",
  },
};

const TABS_CREATE = ["manual", "json", "import", "ai", "mix"];
const TAB_LABELS = {
  manual: "✏️ Tạo thủ công",
  json: "📄 Nhập JSON",
  import: "📁 Import File → AI",
  ai: "🤖 AI theo yêu cầu",
  mix: "🔀 Trộn bài",
};

export default function ExerciseCreator({
  createTab,
  setCreateTab,
  creating,
  createResult,
  manualForm,
  setManualForm,
  questions,
  addQuestion,
  updateQuestion,
  updateOption,
  removeQuestion,
  jsonText,
  setJsonText,
  importFile,
  setImportFile,
  importMode,
  setImportMode,
  importLevel,
  setImportLevel,
  importSkill,
  setImportSkill,
  aiTopic,
  setAiTopic,
  aiCount,
  setAiCount,
  aiLevel,
  setAiLevel,
  handleCreateManual,
  handleCreateJson,
  handleImport,
  handleAiGenerate,
  // Mix props
  exercises,
  mixSources,
  setMixSources,
  mixCount,
  setMixCount,
  mixTitle,
  setMixTitle,
  mixDesc,
  setMixDesc,
  handleMixExercises,
}) {
  return (
    <div style={S.card("#a855f7")}>
      <h2 style={{ ...S.cardTitle, color: "#a855f7" }}>✨ Tạo bài tập mới</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS_CREATE.map((t) => (
          <button
            key={t}
            onClick={() => setCreateTab(t)}
            style={{
              ...S.btn(createTab === t ? "#a855f7" : "#1e293b", createTab === t ? "#fff" : "#94a3b8"),
              padding: "6px 12px",
              fontSize: 12,
              border: `1px solid ${createTab === t ? "#a855f7" : "#334155"}`,
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Result banner */}
      {createResult && (
        <div style={{ marginBottom: 14, padding: 12, background: "rgba(16,185,129,0.1)", border: "1px solid #10b981", borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#10b981", fontWeight: 700 }}>
            🎉 Tạo thành công! ID: {createResult.id} — <span style={{ color: "#fbbf24" }}>{createResult.title}</span>
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>Đã tự động chọn bài tập này để tạo phòng.</p>
        </div>
      )}

      <div style={{ maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
        {/* ── TAB: MANUAL ── */}
        {createTab === "manual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={S.label}>Tiêu đề *</label>
              <input
                style={S.input}
                value={manualForm.title}
                onChange={(e) => setManualForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Tên bài tập..."
              />
            </div>
            <div>
              <label style={S.label}>Mô tả</label>
              <input
                style={S.input}
                value={manualForm.description}
                onChange={(e) => setManualForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả ngắn..."
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div>
                <label style={S.label}>Kỹ năng</label>
                <select
                  style={S.select}
                  value={manualForm.skill}
                  onChange={(e) => setManualForm((p) => ({ ...p, skill: e.target.value }))}
                >
                  <option value="reading">Đọc</option>
                  <option value="listening">Nghe</option>
                  <option value="writing">Viết</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Cấp độ</label>
                <select
                  style={S.select}
                  value={manualForm.level}
                  onChange={(e) => setManualForm((p) => ({ ...p, level: e.target.value }))}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={`topik_${n}`}>TOPIK {n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Thời gian (phút)</label>
                <input
                  style={S.input}
                  type="number"
                  value={manualForm.timeLimit}
                  onChange={(e) => setManualForm((p) => ({ ...p, timeLimit: e.target.value }))}
                  min={1}
                />
              </div>
            </div>

            {/* Questions */}
            <div style={{ borderTop: "1px dashed #334155", paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Câu hỏi ({questions.length})</span>
                <button onClick={addQuestion} style={{ ...S.btn("#4f46e5", "#fff"), padding: "6px 12px", fontSize: 12 }}>
                  + Thêm câu
                </button>
              </div>
              {questions.map((q, qi) => (
                <div key={q.id} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>Câu {qi + 1}</span>
                    <button onClick={() => removeQuestion(q.id)} style={{ ...S.btn("#ef4444", "#fff"), padding: "3px 8px", fontSize: 11 }}>
                      Xóa
                    </button>
                  </div>
                  <input
                    style={{ ...S.input, marginBottom: 8 }}
                    value={q.questionText}
                    onChange={(e) => updateQuestion(q.id, "questionText", e.target.value)}
                    placeholder="Nội dung câu hỏi..."
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <div>
                      <label style={S.label}>Điểm</label>
                      <input
                        style={S.input}
                        type="number"
                        value={q.points}
                        onChange={(e) => updateQuestion(q.id, "points", Number(e.target.value))}
                        min={1}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Giải thích</label>
                      <input
                        style={S.input}
                        value={q.explanation}
                        onChange={(e) => updateQuestion(q.id, "explanation", e.target.value)}
                        placeholder="Giải thích đáp án..."
                      />
                    </div>
                  </div>
                  <label style={S.label}>Đáp án (click radio để chọn đúng)</label>
                  {q.options.map((opt) => (
                    <div key={opt.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        checked={opt.isCorrect}
                        onChange={() => updateOption(q.id, opt.id, "isCorrect", true)}
                        style={{ accentColor: "#10b981", cursor: "pointer" }}
                      />
                      <input
                        style={{ ...S.input, border: `1px solid ${opt.isCorrect ? "#10b981" : "#334155"}` }}
                        value={opt.optionText}
                        onChange={(e) => updateOption(q.id, opt.id, "optionText", e.target.value)}
                        placeholder={`Đáp án ${opt.id}...`}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <button
              onClick={handleCreateManual}
              disabled={creating}
              style={{ ...S.btn("#a855f7", "#fff"), justifyContent: "center", fontWeight: 700, opacity: creating ? 0.6 : 1 }}
            >
              {creating ? "Đang tạo..." : "💾 Tạo bài tập thủ công"}
            </button>
          </div>
        )}

        {/* ── TAB: JSON ── */}
        {createTab === "json" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={18}
              style={{ ...S.input, fontFamily: "monospace", fontSize: 12, resize: "vertical", lineHeight: 1.5 }}
              placeholder='{ "title": "...", "questions": [...] }'
            />
            <button
              onClick={handleCreateJson}
              disabled={creating}
              style={{ ...S.btn("#a855f7", "#fff"), justifyContent: "center", fontWeight: 700, opacity: creating ? 0.6 : 1 }}
            >
              {creating ? "Đang tạo..." : "📄 Tạo từ JSON"}
            </button>
          </div>
        )}

        {/* ── TAB: IMPORT FILE → AI ── */}
        {createTab === "import" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Upload file (JSON, PDF, ảnh) — AI sẽ phân tích và tạo đề thi tự động.</p>
            <div>
              <label style={S.label}>File đề thi (.json, .pdf, .png, .jpeg)</label>
              <input
                type="file"
                accept="application/json,application/pdf,image/*"
                onChange={(e) => setImportFile(e.target.files[0])}
                style={{ ...S.input, padding: "8px 12px", cursor: "pointer" }}
              />
              {importFile && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#10b981" }}>✓ {importFile.name}</p>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={S.label}>Chế độ sinh đề</label>
                <select
                  style={S.select}
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value)}
                >
                  <option value="topik_test">Trắc nghiệm TOPIK</option>
                  <option value="game">Game ghép từ</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Cấp độ TOPIK</label>
                <select
                  style={S.select}
                  value={importLevel}
                  onChange={(e) => setImportLevel(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={`topik_${n}`}>TOPIK {n}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={S.label}>Kỹ năng kiểm tra</label>
                <select
                  style={S.select}
                  value={importSkill}
                  onChange={(e) => setImportSkill(e.target.value)}
                >
                  <option value="reading">Đọc hiểu</option>
                  <option value="listening">Nghe hiểu</option>
                  <option value="writing">Viết</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleImport}
              disabled={creating || !importFile}
              style={{
                ...S.btn(!importFile || creating ? "#334155" : "#fbbf24", !importFile || creating ? "#94a3b8" : "#000"),
                justifyContent: "center",
                fontWeight: 700,
                opacity: !importFile || creating ? 0.5 : 1,
                cursor: !importFile || creating ? "not-allowed" : "pointer"
              }}
            >
              {creating ? "⏳ AI đang xử lý..." : "📤 Upload & Để AI tạo đề"}
            </button>
          </div>
        )}

        {/* ── TAB: AI TOPIC ── */}
        {createTab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Nhập chủ đề và yêu cầu — AI sẽ tự động sinh bài tập trắc nghiệm tiếng Hàn.</p>
            <div>
              <label style={S.label}>Chủ đề / Yêu cầu *</label>
              <textarea
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                rows={4}
                style={{ ...S.input, resize: "vertical", lineHeight: 1.5 }}
                placeholder="VD: Từ vựng về thời tiết, cấp TOPIK 2, 10 câu trắc nghiệm"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={S.label}>Số câu hỏi</label>
                <input
                  style={S.input}
                  type="number"
                  min={1}
                  max={30}
                  value={aiCount}
                  onChange={(e) => setAiCount(e.target.value)}
                />
              </div>
              <div>
                <label style={S.label}>Cấp độ TOPIK</label>
                <select
                  style={S.select}
                  value={aiLevel}
                  onChange={(e) => setAiLevel(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={`topik_${n}`}>TOPIK {n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ padding: 12, background: "rgba(168,85,247,0.08)", border: "1px solid #a855f7", borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#a855f7", fontWeight: 600 }}>💡 Gợi ý yêu cầu:</p>
              {[
                "Từ vựng mua sắm tại siêu thị, 5 câu, TOPIK 1",
                "Ngữ pháp kính ngữ tiếng Hàn, 8 câu, TOPIK 2",
                "Từ vựng về cảm xúc và tình cảm, 10 câu",
              ].map((s, i) => (
                <button
                  key={i}
                  onClick={() => setAiTopic(s)}
                  style={{ ...S.btn("#1e293b", "#94a3b8"), padding: "4px 10px", fontSize: 11, marginTop: 6, marginRight: 6 }}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={handleAiGenerate}
              disabled={creating}
              style={{
                ...S.btn(creating ? "#334155" : "#fbbf24", creating ? "#94a3b8" : "#000"),
                justifyContent: "center",
                fontWeight: 700,
                opacity: creating ? 0.5 : 1,
                cursor: creating ? "not-allowed" : "pointer"
              }}
            >
              {creating ? "⏳ AI đang sinh đề..." : "🤖 AI Sinh đề thi ngay"}
            </button>
          </div>
        )}

        {/* ── TAB: MIX ── */}
        {createTab === "mix" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
              Chọn nhiều bài tập có sẵn → trộn câu hỏi → tạo bài mới với số câu tùy chỉnh.
            </p>

            {/* Title & Description */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={S.label}>Tiêu đề bài mới</label>
                <input
                  style={S.input}
                  value={mixTitle}
                  onChange={(e) => setMixTitle(e.target.value)}
                  placeholder="VD: Đề thi tổng hợp TOPIK 2..."
                />
              </div>
              <div>
                <label style={S.label}>Số câu hỏi muốn lấy *</label>
                <input
                  style={S.input}
                  type="number"
                  min={1}
                  max={200}
                  value={mixCount}
                  onChange={(e) => setMixCount(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={S.label}>Mô tả (tuỳ chọn)</label>
              <input
                style={S.input}
                value={mixDesc}
                onChange={(e) => setMixDesc(e.target.value)}
                placeholder="Mô tả ngắn cho bài trộn..."
              />
            </div>

            {/* Source exercise picker */}
            <div>
              <label style={S.label}>
                Chọn bài tập nguồn ({mixSources.length} đã chọn)
              </label>
              <div style={{
                maxHeight: 220,
                overflowY: "auto",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 10,
              }}>
                {(!exercises || exercises.length === 0) ? (
                  <p style={{ textAlign: "center", padding: 16, color: "#475569", fontSize: 13 }}>
                    Không có bài tập. Hãy tải danh sách trước.
                  </p>
                ) : (
                  exercises.map((ex) => {
                    const isSelected = mixSources.some((s) => s.id === ex.id);
                    return (
                      <div
                        key={ex.id}
                        onClick={() => {
                          if (isSelected) {
                            setMixSources((prev) => prev.filter((s) => s.id !== ex.id));
                          } else {
                            setMixSources((prev) => [...prev, ex]);
                          }
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 14px",
                          borderBottom: "1px solid #1e293b",
                          cursor: "pointer",
                          background: isSelected ? "rgba(168,85,247,0.12)" : "transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        <span style={{
                          width: 18, height: 18, borderRadius: 4,
                          border: `2px solid ${isSelected ? "#a855f7" : "#475569"}`,
                          background: isSelected ? "#a855f7" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0,
                        }}>
                          {isSelected ? "✓" : ""}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{
                            margin: 0, fontSize: 13, fontWeight: 600, color: "#f8fafc",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {ex.title || `Bài tập #${ex.id}`}
                          </p>
                          <span style={{ fontSize: 11, color: "#475569" }}>
                            ID: {ex.id}
                            {ex.questions?.length != null && ` • ${ex.questions.length} câu`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected chips */}
            {mixSources.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {mixSources.map((ex) => (
                  <span
                    key={ex.id}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: "rgba(168,85,247,0.15)", border: "1px solid #a855f7",
                      color: "#c084fc", padding: "3px 10px", borderRadius: 20,
                      fontSize: 11, fontWeight: 600,
                    }}
                  >
                    {ex.title || `#${ex.id}`}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setMixSources((prev) => prev.filter((s) => s.id !== ex.id));
                      }}
                      style={{ cursor: "pointer", marginLeft: 2, color: "#ef4444", fontWeight: 700 }}
                    >
                      ✕
                    </span>
                  </span>
                ))}
                <button
                  onClick={() => setMixSources([])}
                  style={{ ...S.btn("#1e293b", "#ef4444"), padding: "3px 10px", fontSize: 11, border: "1px solid #334155" }}
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={handleMixExercises}
              disabled={creating || mixSources.length === 0}
              style={{
                ...S.btn(
                  creating || mixSources.length === 0 ? "#334155" : "#a855f7",
                  creating || mixSources.length === 0 ? "#94a3b8" : "#fff"
                ),
                justifyContent: "center",
                fontWeight: 700,
                opacity: creating || mixSources.length === 0 ? 0.5 : 1,
                cursor: creating || mixSources.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              {creating ? "⏳ Đang trộn và tạo bài..." : `🔀 Trộn & Tạo bài (${mixCount} câu)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
