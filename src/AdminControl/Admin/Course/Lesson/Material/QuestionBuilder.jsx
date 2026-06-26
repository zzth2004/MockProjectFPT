import React from "react";
import { Plus, Sparkles, Code, X, HelpCircle, ArrowUp, ArrowDown, Trash, Trash2, Loader2, Database } from "lucide-react";

export default function QuestionBuilder({
    formData,
    isViewMode,
    // Hook states
    showAiGeneratePanel, setShowAiGeneratePanel,
    aiQuestionsCount, setAiQuestionsCount,
    aiSelectedTypes, setAiSelectedTypes,
    isGeneratingQuestions,
    showJsonInput, setShowJsonInput,
    jsonText, setJsonText,
    handleImportJson,
    handleAiGenerateQuestions,
    questionHelpers
}) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2 flex-wrap gap-2">
                                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">2. Danh sách câu hỏi ({formData.questions.length})</h4>
                                    {!isViewMode && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAiGeneratePanel(false);
                                                    setShowJsonInput(!showJsonInput);
                                                }}
                                                className={`flex items-center gap-1.5 px-4 py-2 border transition-all font-black text-xs uppercase rounded-xl ${showJsonInput
                                                    ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-900"
                                                    : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                                                    }`}
                                            >
                                                <Code size={14} />
                                                Nhập nhanh câu hỏi
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowJsonInput(false);
                                                    setShowAiGeneratePanel(!showAiGeneratePanel);
                                                }}
                                                className={`flex items-center gap-1.5 px-4 py-2 border transition-all font-black text-xs uppercase rounded-xl ${showAiGeneratePanel
                                                    ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                                                    : "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
                                                    }`}
                                            >
                                                <Sparkles size={14} />
                                                Tạo bằng AI
                                            </button>
                                            <button
                                                type="button"
                                                onClick={questionHelpers.addQuestion}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-[#2d5a2d] hover:bg-green-100 border border-green-100/50 transition-all font-black text-xs uppercase rounded-xl"
                                            >
                                                <Plus size={14} strokeWidth={3} />
                                                Thêm thủ công
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {showAiGeneratePanel && (
                                    <div className="p-6 bg-purple-50/50 rounded-[2rem] border border-purple-100/50 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="text-purple-600 animate-pulse" size={18} />
                                                <span className="text-sm font-black uppercase text-purple-900">Tạo câu hỏi bằng AI</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowAiGeneratePanel(false)}
                                                className="text-gray-400 hover:text-gray-600 transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-purple-700/60 px-1">Số lượng câu hỏi</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={20}
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-purple-600/20 outline-none"
                                                    value={aiQuestionsCount}
                                                    onChange={(e) => setAiQuestionsCount(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-purple-700/60 px-1">Dạng câu hỏi</label>
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {[
                                                        { val: "multiple_choice", label: "Trắc nghiệm" },
                                                        { val: "fill_blank", label: "Điền từ" },
                                                        { val: "true_false", label: "Đúng/Sai" },
                                                        { val: "grammar", label: "Ngữ pháp" }
                                                    ].map(t => {
                                                        const active = aiSelectedTypes.includes(t.val);
                                                        return (
                                                            <button
                                                                key={t.val}
                                                                type="button"
                                                                onClick={() => {
                                                                    setAiSelectedTypes(prev =>
                                                                        prev.includes(t.val)
                                                                            ? prev.filter(x => x !== t.val)
                                                                            : [...prev, t.val]
                                                                    );
                                                                }}
                                                                className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase transition-all ${active
                                                                    ? "bg-purple-600 text-white shadow-sm"
                                                                    : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                                                                    }`}
                                                            >
                                                                {t.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="button"
                                                disabled={isGeneratingQuestions || aiSelectedTypes.length === 0}
                                                onClick={handleAiGenerateQuestions}
                                                className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-all font-black text-xs uppercase rounded-xl shadow-md shadow-purple-600/10 active:scale-95"
                                            >
                                                {isGeneratingQuestions ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={14} />
                                                        Đang tạo câu hỏi...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles size={14} />
                                                        Bắt đầu tạo
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showJsonInput && (
                                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200/50 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Code className="text-slate-600" size={18} />
                                                <span className="text-sm font-black uppercase text-slate-900">Dán câu hỏi hoặc cấu hình JSON</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowJsonInput(false)}
                                                className="text-gray-400 hover:text-gray-600 transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] font-black uppercase text-slate-500">Nội dung câu hỏi (Văn bản hoặc JSON)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setJsonText(`Tiêu đề: Bài tập tổng hợp: Từ vựng & Ngữ pháp cơ bản
Mô tả: Bài tập dành cho người học mới bắt đầu, bao gồm từ vựng, ngữ pháp, nghe và điền từ.
Bài học: 1
Câu 1 - Con chó tiếng Hàn là gì? - MULTIPLE_CHOICE - 고양이 | 강아지 | 사람 | 책 - 강아지
Câu 2 - Từ nào nghĩa là 'Trường học'? - MULTIPLE_CHOICE - 학교 | 집 | 물 - 학교
Câu 3 - ‘물’ nghĩa là ‘nước’. - TRUE_FALSE - Đúng | Sai - Đúng
Câu 4 - ‘의자’ nghĩa là ‘bàn’. - TRUE_FALSE - Đúng | Sai - Sai
Câu 5 - Điền từ đúng: Tôi là học sinh = 저는 ___ 입니다. - FILL_BLANK - 학생
Câu 6 - Điền từ đúng: Cảm ơn = ___ 감사합니다. - FILL_BLANK - 정말
Câu 7 - Nghe và chọn đáp án đúng. - LISTENING - Xin chào | Tạm biệt | Cảm ơn - Xin chào - https://sample.com/audio/annyeong.mp3
Câu 8 - Chọn đáp án đúng: Dạng kính ngữ của ‘먹다’ (ăn) là: - GRAMMAR - 드시다 | 마시다 | 자다 - 드시다
Câu 9 - Từ nào nghĩa là ‘Nhà’? - MULTIPLE_CHOICE - 집 | phân loại | trường học - 집
Câu 10 - ‘한국’ nghĩa là gì? - MULTIPLE_CHOICE - Hàn Quốc | Nhật Bản | Trung Quốc - Hàn Quốc`)}
                                                    className="text-[10px] text-green-600 hover:text-green-700 font-black uppercase tracking-wider bg-green-50 hover:bg-green-100/80 transition px-2.5 py-1 rounded-lg"
                                                >
                                                    Tải dữ liệu mẫu
                                                </button>
                                            </div>
                                            <textarea
                                                rows={8}
                                                placeholder={`Dạng văn bản (mỗi dòng một câu hỏi):
Câu 1 - Con chó tiếng Hàn là gì? - MULTIPLE_CHOICE - 고양이 | 강아지 | người | sách - 강아지
Câu 2 - Điền từ đúng: Tôi là học sinh = 저는 ___ 입니다. - FILL_BLANK - 학생

Hoặc Dạng JSON (ví dụ):
{
  "lessonId": 1,
  "title": "Bài tập tổng hợp",
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "questionText": "Con chó tiếng Hàn là gì?",
      "options": [
        { "optionText": "고양이", "isCorrect": false },
        { "optionText": "강아지", "isCorrect": true }
      ]
    }
  ]
}`}
                                                className="w-full px-4 py-3 bg-white rounded-2xl border-none font-mono text-xs focus:ring-2 focus:ring-slate-600/20 outline-none resize-y"
                                                value={jsonText}
                                                onChange={(e) => setJsonText(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="button"
                                                onClick={handleImportJson}
                                                className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white transition-all font-black text-xs uppercase rounded-xl shadow-md active:scale-95"
                                            >
                                                <Database size={14} />
                                                Nhập câu hỏi
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {formData.questions.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                        <HelpCircle size={40} className="text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-400 text-sm font-bold">Chưa có câu hỏi nào trong đề thi này</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {formData.questions.map((q, qIdx) => (
                                            <div
                                                key={qIdx}
                                                className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 hover:shadow-md transition-all relative"
                                            >
                                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-xl bg-green-50 text-[#2d5a2d] font-black text-sm flex items-center justify-center">
                                                            {qIdx + 1}
                                                        </span>
                                                        <span className="text-sm font-black text-gray-700 uppercase">Câu hỏi số {qIdx + 1}</span>
                                                    </div>

                                                    {!isViewMode && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={qIdx === 0}
                                                                onClick={() => questionHelpers.moveQuestion(qIdx, "up")}
                                                                className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                            >
                                                                <ArrowUp size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={qIdx === formData.questions.length - 1}
                                                                onClick={() => questionHelpers.moveQuestion(qIdx, "down")}
                                                                className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                            >
                                                                <ArrowDown size={14} />
                                                            </button>

                                                            <select
                                                                className="px-3 py-1.5 bg-gray-50 rounded-xl border-none font-bold text-xs cursor-pointer"
                                                                value={q.type}
                                                                onChange={(e) => questionHelpers.updateQuestion(qIdx, "type", e.target.value)}
                                                            >
                                                                <option value="multiple_choice">Trắc nghiệm (Quiz)</option>
                                                                <option value="fill_blank">Điền từ (Fill Blank)</option>
                                                                <option value="true_false">Đúng/Sai (True/False)</option>
                                                                <option value="listening">Luyện nghe (Listening)</option>
                                                                <option value="speaking">Luyện nói (Speaking)</option>
                                                                <option value="writing">Luyện viết (Writing)</option>
                                                                <option value="grammar">Ngữ pháp (Grammar)</option>
                                                                <option value="matching">Trò chơi Ghép đôi (Matching)</option>
                                                                <option value="fast_match">Trò chơi Ghép nhanh (Fast Match)</option>
                                                                <option value="memory_card">Trò chơi Lật thẻ (Memory Card)</option>
                                                                <option value="word_search">Trò chơi Tìm từ (Word Search)</option>
                                                                <option value="word_match">Trò chơi Nối từ (Word Match)</option>
                                                            </select>

                                                            <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-2 py-1">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase">Điểm:</span>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    className="w-12 bg-transparent text-center border-none font-black text-xs focus:ring-0 p-0 outline-none"
                                                                    value={q.points}
                                                                    onChange={(e) => questionHelpers.updateQuestion(qIdx, "points", e.target.value)}
                                                                />
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => questionHelpers.removeQuestion(qIdx)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Nội dung câu hỏi *</label>
                                                    <textarea
                                                        rows={2}
                                                        required
                                                        disabled={isViewMode}
                                                        placeholder="Nhập câu hỏi..."
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none resize-none"
                                                        value={q.questionText}
                                                        onChange={(e) => questionHelpers.updateQuestion(qIdx, "questionText", e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Giải thích câu hỏi (Không bắt buộc)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ví dụ: Giải thích lý do chọn đáp án này"
                                                        disabled={isViewMode}
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                                        value={q.explanation || ""}
                                                        onChange={(e) => questionHelpers.updateQuestion(qIdx, "explanation", e.target.value)}
                                                    />
                                                </div>

                                                {/* OPTIONS OR GAME DATA CONFIGURATION */}
                                                {(() => {
                                                    const isGameType = ["matching", "fast_match", "memory_card", "word_search", "word_match"].includes(q.type);
                                                    const isOptionType = ["multiple_choice", "fill_blank", "true_false", "listening", "grammar"].includes(q.type);

                                                    if (isGameType) {
                                                        return (
                                                            <div className="space-y-4 pt-2 border-t border-dashed border-gray-100">
                                                                <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100/50">
                                                                    <span className="text-[10px] font-black uppercase text-[#2d5a2d] block mb-1">Cấu hình Trò chơi (Game Type: {q.type})</span>
                                                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                                                        Trò chơi sẽ sử dụng dữ liệu gameData bên dưới để tự động tạo màn chơi cho học sinh thay vì sử dụng các đáp án trắc nghiệm thông thường.
                                                                    </p>
                                                                </div>

                                                                {["fast_match", "word_search"].includes(q.type) && (
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2 text-left">
                                                                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Kích thước lưới (Grid Size)</label>
                                                                            <input
                                                                                type="number"
                                                                                min={3}
                                                                                max={15}
                                                                                disabled={isViewMode}
                                                                                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border-none font-bold text-xs focus:ring-2 focus:ring-green-600/20 outline-none"
                                                                                value={q.gameData?.gridSize || 5}
                                                                                onChange={(e) => questionHelpers.updateGameData(qIdx, "gridSize", e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {q.type === "word_search" ? (
                                                                    <div className="space-y-2 text-left">
                                                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Từ khóa ẩn (Cách nhau bằng dấu phẩy)</label>
                                                                        <input
                                                                            type="text"
                                                                            disabled={isViewMode}
                                                                            placeholder="Ví dụ: KOREA, SEOUL, KIMCHI"
                                                                            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border-none font-bold text-xs focus:ring-2 focus:ring-green-600/20 outline-none"
                                                                            value={(q.gameData?.words || []).join(", ")}
                                                                            onChange={(e) => {
                                                                                const words = e.target.value.split(",").map(w => w.trim());
                                                                                questionHelpers.updateGameData(qIdx, "words", words);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[10px] font-black uppercase text-gray-400">Danh sách cặp nối ({q.gameData?.pairs?.length || 0})</span>
                                                                            {!isViewMode && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => questionHelpers.addGamePair(qIdx)}
                                                                                    className="text-[10px] font-black uppercase text-[#2d5a2d] bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100"
                                                                                >
                                                                                    + Thêm cặp ghép
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            {(q.gameData?.pairs || []).map((pair, pIdx) => (
                                                                                <div key={pIdx} className="flex items-center gap-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        required
                                                                                        disabled={isViewMode}
                                                                                        placeholder="Cột trái (Tiếng Hàn)"
                                                                                        className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border-none font-bold text-xs outline-none"
                                                                                        value={pair.left || pair.kor || ""}
                                                                                        onChange={(e) => questionHelpers.updateGamePair(qIdx, pIdx, "left", e.target.value)}
                                                                                    />
                                                                                    <span className="text-gray-300 font-bold">⇄</span>
                                                                                    <input
                                                                                        type="text"
                                                                                        required
                                                                                        disabled={isViewMode}
                                                                                        placeholder="Cột phải (Tiếng Việt)"
                                                                                        className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border-none font-bold text-xs outline-none"
                                                                                        value={pair.right || pair.vie || ""}
                                                                                        onChange={(e) => questionHelpers.updateGamePair(qIdx, pIdx, "right", e.target.value)}
                                                                                    />
                                                                                    {!isViewMode && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => questionHelpers.removeGamePair(qIdx, pIdx)}
                                                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                                                                        >
                                                                                            <X size={14} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    if (isOptionType) {
                                                        const isFillBlank = q.type === "fill_blank";
                                                        return (
                                                            <div className="space-y-3 pt-2 border-t border-dashed border-gray-100">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-black uppercase text-gray-400">
                                                                        {isFillBlank ? "Đáp án đúng cho câu điền từ" : "Danh sách đáp án lựa chọn"}
                                                                    </span>
                                                                    {!isViewMode && !isFillBlank && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => questionHelpers.addOption(qIdx)}
                                                                            className="text-[10px] font-black uppercase text-[#2d5a2d] bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100"
                                                                        >
                                                                            + Thêm đáp án
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {(q.options || []).map((opt, oIdx) => (
                                                                        <div key={oIdx} className="flex items-center gap-3">
                                                                            {!isViewMode && (
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-4 h-4 rounded text-green-600 border-gray-300 focus:ring-green-500"
                                                                                    checked={!!opt.isCorrect}
                                                                                    onChange={(e) => questionHelpers.updateOption(qIdx, oIdx, "isCorrect", e.target.checked)}
                                                                                />
                                                                            )}
                                                                            {isViewMode && (
                                                                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${opt.isCorrect ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                                                                                    {opt.isCorrect ? "✓" : "✗"}
                                                                                </span>
                                                                            )}
                                                                            <input
                                                                                type="text"
                                                                                required
                                                                                disabled={isViewMode}
                                                                                placeholder={isFillBlank ? "Nhập từ cần điền đúng..." : `Đáp án số ${oIdx + 1}`}
                                                                                className={`flex-1 px-4 py-2 bg-gray-50 rounded-xl border-none font-bold text-xs outline-none ${opt.isCorrect ? "ring-2 ring-green-600/20 bg-white" : ""}`}
                                                                                value={opt.optionText}
                                                                                onChange={(e) => questionHelpers.updateOption(qIdx, oIdx, "optionText", e.target.value)}
                                                                            />
                                                                            {!isViewMode && !isFillBlank && (
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={(q.options || []).length <= 1}
                                                                                    onClick={() => questionHelpers.removeOption(qIdx, oIdx)}
                                                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        ))}
                                    </div>
                                )}
        </div>
    );
}
