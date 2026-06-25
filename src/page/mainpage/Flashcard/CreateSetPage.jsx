import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Image, Loader2 } from "lucide-react";
import flashcardService from "../../../AdminControl/Service/API/lessonServiceAPI/flashcard.service";

export default function CreateSetPage() {
  const navigate = useNavigate();

  // State cho thông tin chung
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // 1. Tạo Deck
      const newDeck = await flashcardService.createDeck({
        title,
        description,
        isPublic: false // Mặc định là bộ thẻ cá nhân
      });

      // 2. Thêm Cards vào Deck
      const promises = validCards.map(c => 
        flashcardService.addCard({
          deckId: newDeck.id,
          frontText: c.term,
          backText: c.def
        })
      );
      await Promise.all(promises);

      alert("Đã tạo học phần thành công!");
      navigate("/user/flashcards");
    } catch (err) {
      console.error("Lỗi khi tạo học phần:", err);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
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
        <button 
          onClick={handleSaveSet}
          disabled={isSubmitting}
          className="bg-[#377437] hover:bg-green-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-900/10 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
          Hoàn tất
        </button>
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
    </div>
  );
}