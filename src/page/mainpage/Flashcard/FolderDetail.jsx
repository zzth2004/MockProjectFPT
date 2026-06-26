import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FolderOpen, Plus, Layers, Loader2, Trash2 } from "lucide-react";
import folderService from "../../../AdminControl/Service/API/lessonServiceAPI/folder.service";

export default function FolderDetail() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [folder, setFolder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (folderId) fetchFolderDetail();
  }, [folderId]);

  const fetchFolderDetail = async () => {
    setIsLoading(true);
    try {
      const data = await folderService.getFolderDetail(folderId);
      setFolder(data);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết thư mục:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDeck = async (e, deckId, deckTitle) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa học phần "${deckTitle}" khỏi thư mục này không?`)) {
      try {
        await folderService.removeDeckFromFolder(folderId, deckId);
        setFolder({
          ...folder,
          decks: folder.decks.filter(d => d.id !== deckId)
        });
        alert("Đã xóa học phần khỏi thư mục thành công!");
      } catch (err) {
        console.error("Lỗi xóa học phần khỏi thư mục:", err);
        alert(`Không thể xóa học phần khỏi thư mục: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const setsInFolder = folder?.decks || [];

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#377437] mb-4" />
        <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">Đang tải chi tiết thư mục...</p>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center">
        <p className="font-bold text-gray-500 uppercase tracking-widest text-sm mb-4">Không tìm thấy thư mục</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] p-6 font-sans">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors">
         <ChevronLeft size={20} /> Quay lại thư viện
      </button>

      {/* Header Thư mục */}
      <div className="flex items-center gap-5 mb-10">
         <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-[#377437] shadow-sm">
            <FolderOpen size={40} />
         </div>
         <div>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Thư mục</span>
            <h1 className="text-3xl font-black text-gray-900 mt-1">{folder.name}</h1>
            <p className="text-sm font-bold text-gray-500 mt-1">{setsInFolder.length} học phần</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* Card Thêm học phần mới vào thư mục */}
         <div 
            onClick={() => navigate(`/user/flashcards/create-set?folderId=${folderId}`)}
            className="h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#377437] hover:bg-green-50 transition-all group"
         >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#377437] group-hover:text-white transition-colors">
               <Plus size={24} className="text-gray-400 group-hover:text-white" />
            </div>
            <span className="font-bold text-gray-400 group-hover:text-[#377437]">Thêm học phần</span>
         </div>

         {/* Danh sách học phần (Sets) */}
         {setsInFolder.map(set => (
            <div 
               key={set.id} 
               /* 👇 QUAN TRỌNG: Dẫn tới trang StudyFlashcard */
               onClick={() => navigate(`/user/flashcards/study/${set.id}`)}
               className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-green-400 transition-all cursor-pointer flex flex-col justify-between h-48 group"
            >
               <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#377437] transition-colors">
                     {set.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-3">
                     <span className="bg-[#E9F5EB] text-[#377437] px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide">
                        {set.flashcards?.length || set._count?.flashcards || 0} Terms
                     </span>
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-white overflow-hidden">
                     <img src="https://i.pravatar.cc/150?u=12" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-gray-500">{set.owner?.fullName || "Người dùng"}</span>
                  
                  {/* Remove from folder button */}
                  <button
                     onClick={(e) => handleRemoveDeck(e, set.id, set.title)}
                     className="ml-auto p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                     title="Xóa khỏi thư mục"
                  >
                     <Trash2 size={16} />
                  </button>
                  
                  {/* Icon details (hidden on hover when trash appears) */}
                  <div className="ml-auto opacity-100 group-hover:opacity-0 transition-opacity text-[#377437]">
                     <Layers size={18} />
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}