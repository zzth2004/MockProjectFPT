import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, Layers, Plus, Search, ChevronRight } from "lucide-react";

export default function FlashcardLibrary() {
  const navigate = useNavigate();
  
  // State quản lý hiển thị Modal và Dropdown
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Mock Data: Danh sách thư mục
  const [folders, setFolders] = useState([
    { id: 1, title: "Tiếng Hàn Sơ Cấp 1", count: 3 },
    { id: 2, title: "Luyện thi Topik I", count: 5 },
  ]);

  // Mock Data: Danh sách học phần
  const [sets, setSets] = useState([
    { id: 101, title: "Từ vựng Bài 1: Chào hỏi", terms: 20, author: "Me" },
    { id: 102, title: "Động từ bất quy tắc", terms: 15, author: "Me" },
    { id: 103, title: "Tính từ chỉ cảm xúc", terms: 30, author: "Me" },
  ]);

  // Xử lý logic tạo thư mục mới
  const handleCreateFolder = () => {
    if(!newFolderName.trim()) return;
    const newFolder = { id: Date.now(), title: newFolderName, count: 0 };
    setFolders([newFolder, ...folders]);
    setNewFolderName("");
    setShowFolderModal(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] p-6 font-sans">
      
      {/* --- HEADER & ACTION BUTTONS --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-black text-gray-900">Thư viện của bạn</h1>
           <p className="text-gray-500 font-medium text-sm mt-1">Quản lý tất cả các bộ thẻ và thư mục học tập.</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowCreateOptions(!showCreateOptions)}
            className="flex items-center gap-2 bg-[#377437] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-800 transition-all active:scale-95"
          >
            <Plus size={20} /> Tạo mới
          </button>
          
          {/* Dropdown Menu (Popup chọn tạo Set hay Folder) */}
          {showCreateOptions && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 origin-top-right">
              <button 
                onClick={() => navigate('/user/flashcards/create-set')}
                className="w-full text-left px-5 py-4 hover:bg-green-50 text-gray-700 font-bold flex items-center gap-3 transition-colors border-b border-gray-50"
              >
                <div className="p-2 bg-green-100 rounded-lg text-[#377437]"><Layers size={18} /></div>
                Học phần
              </button>
              <button 
                onClick={() => { setShowFolderModal(true); setShowCreateOptions(false); }}
                className="w-full text-left px-5 py-4 hover:bg-green-50 text-gray-700 font-bold flex items-center gap-3 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Folder size={18} /></div>
                Thư mục
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- SECTION 1: DANH SÁCH THƯ MỤC (FOLDERS) --- */}
      <div className="mb-10">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Thư mục ({folders.length})</h2>
        
        {folders.length === 0 ? (
           <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 font-bold">Chưa có thư mục nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map(folder => (
              <div 
                key={folder.id}
                onClick={() => navigate(`/user/flashcards/folder/${folder.id}`)}
                className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#377437] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              >
                 <div className="absolute top-0 left-0 w-1 h-full bg-gray-100 group-hover:bg-[#377437] transition-colors"></div>
                 <div className="flex items-center gap-4 mb-3">
                   <Folder size={28} className="text-gray-400 group-hover:text-[#377437] transition-colors" />
                   <span className="font-bold text-lg text-gray-800 truncate">{folder.title}</span>
                 </div>
                 <div className="flex justify-between items-center pl-1">
                   <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md group-hover:bg-green-50 group-hover:text-[#377437] transition-colors">
                      {folder.count} học phần
                   </span>
                   <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#377437] group-hover:text-white text-gray-400 transition-all">
                      <ChevronRight size={16} />
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SECTION 2: DANH SÁCH HỌC PHẦN (SETS) --- */}
      <div>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Học phần gần đây ({sets.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {sets.map(set => (
            <div 
              key={set.id}
              onClick={() => navigate(`/user/flashcards/study/${set.id}`)} // Link tới trang StudyFlashcard
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
            >
               <div>
                 <h3 className="font-bold text-xl text-gray-900 mb-3 leading-tight line-clamp-2">{set.title}</h3>
                 <div className="flex items-center gap-2">
                    <span className="bg-[#E9F5EB] text-[#377437] text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wide">
                       {set.terms} Terms
                    </span>
                 </div>
               </div>
               
               <div className="flex items-center gap-3 pt-4 mt-2 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-white shadow-sm">
                    <img src="https://i.pravatar.cc/150?u=12" alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-gray-500">Minh Quân</span>
               </div>
            </div>
          ))}
          
          {/* Card Tạo nhanh (Add New Quick Card) */}
          <button 
             onClick={() => navigate('/user/flashcards/create-set')}
             className="min-h-[160px] rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#377437] hover:bg-green-50 flex flex-col items-center justify-center gap-2 group transition-all"
          >
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#377437] group-hover:text-white transition-colors">
                <Plus size={24} />
             </div>
             <span className="font-bold text-gray-400 group-hover:text-[#377437]">Tạo học phần mới</span>
          </button>
        </div>
      </div>

      {/* --- MODAL: POPUP NHẬP TÊN THƯ MỤC --- */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Tạo thư mục mới</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">Nhập tên thư mục để tổ chức các học phần của bạn một cách khoa học hơn.</p>
              
              <div className="space-y-6">
                 <div className="relative">
                    <input 
                      autoFocus
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="peer w-full border-b-2 border-gray-200 py-3 font-bold text-xl text-gray-800 outline-none focus:border-[#377437] bg-transparent transition-colors placeholder-transparent"
                      placeholder="Folder Name"
                      id="folderNameInput"
                    />
                    <label 
                      htmlFor="folderNameInput"
                      className="absolute left-0 -top-3.5 text-xs font-bold text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#377437] peer-focus:text-xs"
                    >
                      Tên thư mục (VD: Topik I)
                    </label>
                 </div>
                 
                 <div className="flex justify-end gap-3 pt-2">
                    <button 
                      onClick={() => setShowFolderModal(false)} 
                      className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      onClick={handleCreateFolder} 
                      className="px-8 py-3 rounded-xl font-bold bg-[#377437] text-white hover:bg-green-800 shadow-lg shadow-green-900/20 transition-all active:scale-95"
                    >
                      Tạo thư mục
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}