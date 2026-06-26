import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Image, Loader2, Upload } from "lucide-react";
import { useAuth } from "../../../context/authContext";
import flashcardService from "../../../AdminControl/Service/API/lessonServiceAPI/flashcard.service";
import folderService from "../../../AdminControl/Service/API/lessonServiceAPI/folder.service";

export default function CreateSetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const folderId = new URLSearchParams(location.search).get("folderId");

  // State cho thông tin chung
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho Modal Nhập nhanh
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [separatorType, setSeparatorType] = useState("auto"); // auto | tab | dash | comma

  // State cho danh sách thẻ (Mặc định 3 thẻ trống)
  const [cards, setCards] = useState([
    { id: 1, term: "", def: "" },
    { id: 2, term: "", def: "" },
    { id: 3, term: "", def: "" },
  ]);

  // Thêm thẻ mới
  const addCard = () => {
    setCards([...cards, { id: Date.now(), term: "", def: "" }]);
  };

  // Xóa thẻ
  const deleteCard = (id) => {
    if (cards.length === 1) return; // Giữ lại ít nhất 1 thẻ
    setCards(cards.filter(c => c.id !== id));
  };

  // Cập nhật nội dung thẻ
  const updateCard = (id, field, value) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // Nhập từ file text tải lên (.txt hoặc .csv)
  const handleImportTextFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        setImportText(text);
      } catch (err) {
        console.error("Lỗi đọc file:", err);
        alert("Không thể đọc file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Xử lý chuỗi text người dùng nhập/dán vào
  const handleProcessImportText = () => {
    if (!importText.trim()) {
      alert("Vui lòng nhập hoặc dán nội dung thẻ trước!");
      return;
    }

    const lines = importText.split(/\r?\n/).filter(line => line.trim());
    let sep = "\t";

    if (separatorType === "auto") {
      const tabCount = (importText.match(/\t/g) || []).length;
      const dashCount = (importText.match(/ - /g) || importText.match(/-/g) || []).length;
      const commaCount = (importText.match(/,/g) || []).length;

      if (tabCount >= dashCount && tabCount >= commaCount) {
        sep = "\t";
      } else if (dashCount >= tabCount && dashCount >= commaCount) {
        sep = importText.includes(" - ") ? " - " : "-";
      } else if (commaCount >= tabCount && commaCount >= dashCount) {
        sep = ",";
      }
    } else if (separatorType === "tab") {
      sep = "\t";
    } else if (separatorType === "dash") {
      sep = importText.includes(" - ") ? " - " : "-";
    } else if (separatorType === "comma") {
      sep = ",";
    }

    const importedCards = lines.map((line, index) => {
      const parts = line.split(sep);
      const term = parts[0] || "";
      const def = parts.slice(1).join(sep) || "";
      return {
        id: Date.now() + index,
        term: term.trim(),
        def: def.trim()
      };
    }).filter(c => c.term || c.def);

    if (importedCards.length > 0) {
      setCards(importedCards);
      setShowImportModal(false);
      setImportText("");
      alert(`Đã nhập thành công ${importedCards.length} thẻ!`);
    } else {
      alert("Không tìm thấy dữ liệu thẻ phân tách hợp lệ.");
    }
  };

  const handleSaveSet = async () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề học phần!");
      return;
    }

    const validCards = cards.filter(c => c.term.trim() && c.def.trim());
    if (validCards.length < 1) {
      alert("Vui lòng nhập ít nhất 1 thẻ (gồm Thuật ngữ và Định nghĩa)!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Tạo cấu trúc JSON lồng nhau như BE yêu cầu
      const payload = {
        title: title.trim(),
        description: description.trim(),
        isPublic: false, // Mặc định là bộ thẻ cá nhân
        status: "ACTIVE",
        createdBy: user?.id ? Number(user.id) : 1,
        flashcards: validCards.map(c => ({
          frontText: c.term.trim(),
          backText: c.def.trim(),
          frontAudio: null,
          backImage: null
        }))
      };

      console.log("🔥 Gửi payload tạo học phần:", payload);

      // Gửi API tạo Deck và tất cả Cards lồng nhau
      const createdDeck = await flashcardService.createDeck(payload);

      // Nếu được tạo từ trong một thư mục, liên kết nó với thư mục đó
      if (folderId && createdDeck && createdDeck.id) {
        try {
          await folderService.addDeckToFolder(Number(folderId), createdDeck.id);
        } catch (assocErr) {
          console.error("Lỗi khi thêm học phần vào thư mục:", assocErr);
          alert(`Đã tạo học phần nhưng không thể thêm vào thư mục: ${assocErr.response?.data?.message || assocErr.message}`);
        }
      }

      alert("Đã tạo học phần thành công!");
      if (folderId) {
        navigate(`/user/flashcards/folder/${folderId}`);
      } else {
        navigate("/user/flashcards");
      }
    } catch (err) {
      console.error("Lỗi khi tạo học phần:", err);
      const errMsg = err.response?.data?.message || err.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
      alert(`Lỗi khi tạo học phần: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] font-sans pb-20">
      
      {/* HEADER CỐ ĐỊNH */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft /></button>
           <span className="font-bold text-gray-500 text-sm hidden md:inline">Tạo học phần mới</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowImportModal(true)}
            className="border border-[#377437] hover:bg-green-50 text-[#377437] px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm flex items-center gap-1.5 active:scale-95"
          >
            <Upload size={16} />
            Nhập nhanh (Excel/Quizlet)
          </button>
          <button 
            onClick={handleSaveSet}
            disabled={isSubmitting}
            className="bg-[#377437] hover:bg-green-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-green-900/10 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 text-xs sm:text-sm"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
            Hoàn tất
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* --- PHẦN 1: THÔNG TIN HỌC PHẦN --- */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
           <div>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Nhập tiêu đề, ví dụ "Chương 1: Gia đình"'
                className="w-full text-2xl font-black text-gray-800 placeholder-gray-300 border-b-2 border-gray-200 focus:border-[#377437] py-2 outline-none transition-colors"
              />
              <label className="text-xs font-bold text-gray-400 mt-1 block uppercase">TIÊU ĐỀ</label>
           </div>
           <div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Thêm mô tả..."
                className="w-full text-base font-medium text-gray-600 placeholder-gray-300 border-b-2 border-gray-200 focus:border-[#377437] py-2 outline-none resize-none transition-colors h-12"
              />
              <label className="text-xs font-bold text-gray-400 mt-1 block uppercase">MÔ TẢ</label>
           </div>
        </div>

        {/* --- PHẦN 2: DANH SÁCH THẺ (QUIZLET STYLE) --- */}
        <div className="space-y-4">
           {cards.map((card, index) => (
             <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:border-green-300 transition-all">
                
                {/* Card Header (Số thứ tự + Nút xóa) */}
                <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100 bg-gray-50">
                   <span className="font-bold text-gray-400">{index + 1}</span>
                   <button onClick={() => deleteCard(card.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>

                {/* Card Body (2 Cột Input) */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Cột Trái: Thuật ngữ */}
                   <div className="space-y-1">
                      <input 
                        value={card.term}
                        onChange={(e) => updateCard(card.id, 'term', e.target.value)}
                        className="w-full border-b-2 border-gray-200 focus:border-[#377437] py-2 outline-none font-bold text-lg text-gray-800 bg-transparent"
                        placeholder="Thuật ngữ (Hàn)"
                      />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">THUẬT NGỮ</span>
                   </div>

                   {/* Cột Phải: Định nghĩa */}
                   <div className="space-y-1">
                      <div className="flex items-end gap-2">
                        <input 
                          value={card.def}
                          onChange={(e) => updateCard(card.id, 'def', e.target.value)}
                          className="flex-1 border-b-2 border-gray-200 focus:border-[#377437] py-2 outline-none font-medium text-lg text-gray-800 bg-transparent"
                          placeholder="Định nghĩa (Việt)"
                        />
                        {/* Nút thêm ảnh (Giả lập) */}
                        <button className="p-2 border border-gray-300 rounded-lg text-gray-400 hover:border-yellow-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all">
                           <Image size={18} />
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ĐỊNH NGHĨA</span>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* --- NÚT THÊM THẺ --- */}
        <button 
          onClick={addCard}
          className="w-full py-6 rounded-2xl bg-white border-2 border-dashed border-gray-300 hover:border-[#377437] hover:bg-green-50 flex flex-col items-center justify-center gap-2 group transition-all"
        >
           <div className="w-10 h-10 rounded-full bg-[#377437] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={24} />
           </div>
           <span className="font-bold text-[#377437] uppercase tracking-widest text-sm">Thêm thẻ mới</span>
        </button>

      </div>

      {/* --- MODAL NHẬP NHANH --- */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-lg text-gray-800">Nhập nhanh từ Excel / Quizlet</h3>
              <button 
                onClick={() => { setShowImportModal(false); setImportText(""); }}
                className="text-gray-400 hover:text-gray-600 font-bold p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mb-4 leading-normal font-medium">
              Dán văn bản bạn sao chép từ Excel hoặc nút Xuất của Quizlet. Mỗi dòng tương ứng với một thẻ. Mặt trước và Mặt sau phân cách bằng phím Tab, Dấu gạch ngang (-) hoặc Dấu phẩy (,).
            </p>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`개발자 - Lập trình viên\n서버 - Máy chủ\n보안 - Bảo mật`}
              className="w-full h-48 p-4 border border-gray-200 rounded-2xl outline-none focus:border-[#377437] text-sm font-medium resize-none mb-4 focus:ring-2 focus:ring-green-600/10 transition-all"
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Phân tách bằng:</span>
                <select 
                  value={separatorType}
                  onChange={(e) => setSeparatorType(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none cursor-pointer focus:border-[#377437] transition-all"
                >
                  <option value="auto">Tự động phát hiện</option>
                  <option value="tab">Phím Tab (Từ Excel)</option>
                  <option value="dash">Dấu gạch ngang (-)</option>
                  <option value="comma">Dấu phẩy (,)</option>
                </select>
              </div>

              {/* Nhập từ file văn bản */}
              <label className="cursor-pointer text-xs font-bold text-[#377437] hover:underline flex items-center gap-1">
                Hoặc tải lên file .txt / .csv
                <input 
                  type="file" 
                  accept=".txt,.csv" 
                  className="hidden" 
                  onChange={handleImportTextFile}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button 
                onClick={() => { setShowImportModal(false); setImportText(""); }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleProcessImportText}
                className="px-5 py-2.5 bg-[#377437] hover:bg-green-800 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-green-900/10"
              >
                Nhập danh sách
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}