import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FolderOpen, Plus, Layers } from "lucide-react";

export default function FolderDetail() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  // Mock Data: Các set trong folder
  const setsInFolder = [
    { id: 101, title: "Từ vựng Bài 1: Chào hỏi", terms: 20 },
    { id: 102, title: "Từ vựng Bài 2: Trường học", terms: 35 },
    { id: 103, title: "Động từ cơ bản", terms: 50 },
  ];

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
            <h1 className="text-3xl font-black text-gray-900 mt-1">Tiếng Hàn Sơ Cấp 1</h1>
            <p className="text-sm font-bold text-gray-500 mt-1">{setsInFolder.length} học phần</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* Card Thêm học phần mới vào thư mục */}
         <div 
            onClick={() => navigate('/user/flashcards/create-set')}
            className="h-48 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-[#377437] hover:bg-green-50 transition-all group"
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
               className="bg-white p-6 rounded-3xl border border-gray-200 hover:border-green-400 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-48 group"
            >
               <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#377437] transition-colors">
                     {set.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-3">
                     <span className="bg-[#E9F5EB] text-[#377437] px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide">
                        {set.terms} Terms
                     </span>
                  </div>
               </div>

               <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-white shadow-sm overflow-hidden">
                     <img src="https://i.pravatar.cc/150?u=12" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-gray-500">Minh Quân</span>
                  
                  {/* Icon mũi tên nhỏ để gợi ý bấm vào */}
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#377437]">
                     <Layers size={18} />
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}