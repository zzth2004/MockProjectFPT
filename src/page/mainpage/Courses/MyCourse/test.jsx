import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Bookmark, Loader2, BookOpen, MessageCircle, PenTool } from "lucide-react";

// Logic & Services
import useCallApiHandler from "../../../../hooks/HookHander/useCallApiHandler";
import lessonService from "../../../../AdminControl/Service/API/lessonServiceAPI/lesson.service";

const StudyPage = () => {
  const { lessonId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("vocab");
  const [savedIds, setSavedIds] = useState([]); // Lưu ID các mục đã đánh dấu sao

  // --- 1. FETCH DATA THỰC TẾ ---
  const fetchDetailFn = useCallback(
    () => lessonService.getDetailLesson(lessonId),
    [lessonId]
  );

  const { data: response, loading, call: refreshDetail } = useCallApiHandler(fetchDetailFn);

  useEffect(() => {
    if (lessonId) refreshDetail();
  }, [lessonId, refreshDetail]);

  // --- 2. XỬ LÝ DỮ LIỆU TỪ API ---
  const content = useMemo(() => {
    const data = response?.data || response || {};
    console.log("Lesson Detail Data:", data);
    return {
      vocab: data.vocabularies || [],
      grammar: data.grammars || [],
      communication: data.conversations || [],
      title: data.title || "Chi tiết bài học"
    };
  }, [response]);

  // Tự động chuyển tab từ location state
  useEffect(() => {
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  // Toggle Save (Đánh dấu sao)
  const toggleSave = (id) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Danh sách đã lưu
  const starredList = useMemo(() => {
    const all = [
      ...content.vocab.map(i => ({ ...i, type: 'vocab', typeName: 'Từ vựng' })),
      ...content.grammar.map(i => ({ ...i, type: 'grammar', typeName: 'Ngữ pháp' })),
      ...content.communication.map(i => ({ ...i, type: 'comm', typeName: 'Hội thoại' }))
    ];
    return all.filter(item => savedIds.includes(item.id));
  }, [content, savedIds]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 text-green-700">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-xs font-black uppercase tracking-widest">Đang tải nội dung bài học...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/30 font-sans pt-2 pb-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 rounded-xl bg-white text-gray-400 hover:text-green-700 hover:shadow-md transition-all border border-gray-100 active:scale-90"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex flex-col text-left">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span className="cursor-pointer hover:text-green-700" onClick={() => navigate('/courses')}>Course</span>
                <ChevronRight size={12} />
                <span className="text-green-700">{content.title}</span>
              </div>
              <h1 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">Nội dung học tập</h1>
          </div>
        </header>

        {/* --- TABS --- */}
        <div className="flex items-end overflow-x-auto no-scrollbar gap-1 border-b-2 border-green-700/20">
          {[
            { id: 'vocab', label: 'VOCAB', icon: BookOpen },
            { id: 'grammar', label: 'GRAMMAR', icon: PenTool },
            { id: 'communication', label: 'COMM', icon: MessageCircle },
            { id: 'starred', label: 'SAVED', icon: Star, color: 'text-yellow-500' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-t-2xl font-black text-[11px] tracking-wider transition-all relative top-[2px]
                ${activeTab === tab.id 
                  ? "bg-white text-green-800 border-t-2 border-l-2 border-r-2 border-green-700 border-b-white z-10" 
                  : "text-gray-400 hover:text-green-700"}
              `}
            >
              <tab.icon size={14} className={tab.id === 'starred' && savedIds.length > 0 ? "fill-yellow-400 text-yellow-400" : ""} />
              {tab.label}
              {tab.id === 'starred' && starredList.length > 0 && (
                <span className="bg-yellow-400 text-white text-[9px] px-1.5 py-0.5 rounded-full">{starredList.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className={`
          bg-white border-2 border-t-0 rounded-b-[2rem] rounded-tr-[2rem] p-6 min-h-[500px] shadow-xl shadow-green-900/5
          ${activeTab === 'starred' ? 'border-yellow-400' : 'border-green-700'}
        `}>
          
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab !== 'starred' ? (
              content[activeTab]?.length > 0 ? (
                content[activeTab].map((item) => (
                  <ContentItem 
                    key={item.id} 
                    item={item} 
                    isSaved={savedIds.includes(item.id)}
                    onToggle={() => toggleSave(item.id)}
                    type={activeTab}
                  />
                ))
              ) : <EmptyState message={`Chưa có dữ liệu cho phần này`} />
            ) : (
              starredList.length > 0 ? (
                starredList.map((item) => (
                  <ContentItem 
                    key={item.id} 
                    item={item} 
                    isSaved={true}
                    onToggle={() => toggleSave(item.id)}
                    type={item.type}
                    showBadge
                  />
                ))
              ) : <EmptyState message="Bạn chưa lưu mục nào" isStarred />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ContentItem = ({ item, isSaved, onToggle, type, showBadge }) => (
  <div className={`
    group flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer
    ${isSaved ? 'border-yellow-100 bg-yellow-50/30' : 'border-gray-50 bg-gray-50/30 hover:bg-white hover:border-green-100'}
  `}>
    <div className="text-left">
      <div className="font-black text-gray-800 text-lg tracking-tight">
        {item.word || item.structure || item.content || item.text}
      </div>
      <div className="text-sm font-bold text-gray-400 mt-1 italic uppercase tracking-tighter">
        {item.meaning || item.description || item.translation}
      </div>
      {showBadge && (
        <span className="text-[9px] font-black text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-lg mt-2 inline-block uppercase tracking-widest">
          {item.typeName}
        </span>
      )}
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onToggle(); }} 
      className="p-3 rounded-xl hover:bg-white transition-all active:scale-90"
    >
      <Star size={24} className={isSaved ? "text-yellow-400 fill-yellow-400" : "text-gray-200 group-hover:text-yellow-400"} strokeWidth={2.5}/>
    </button>
  </div>
);

const EmptyState = ({ message, isStarred }) => (
  <div className="flex flex-col items-center justify-center py-32 text-gray-300">
    {isStarred ? <Bookmark size={48} strokeWidth={1} /> : <BookOpen size={48} strokeWidth={1} />}
    <p className="mt-4 text-xs font-black uppercase tracking-[0.2em]">{message}</p>
  </div>
);

export default StudyPage;