import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Bookmark, BookOpen, Play, Loader2 } from "lucide-react";

import useCallApiHandler from "../../../../hooks/HookHander/useCallApiHandler";
import lessonService from "../../../../AdminControl/Service/API/lessonServiceAPI/lesson.service";

const StudyPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("vocab");
  const [savedIds, setSavedIds] = useState([]);

  const fetchDetailFn = useCallback(
    () => lessonService.getDetailLesson(lessonId),
    [lessonId]
  );

  const { data: response, loading, call: refreshDetail } = useCallApiHandler(fetchDetailFn);

  // Lấy unitId từ response hoặc URL nếu có (tránh lỗi undefined)
  const currentUnitId = response?.courseId || "default";

  useEffect(() => {
    if (lessonId) refreshDetail();
  }, [lessonId, refreshDetail]);

  const content = useMemo(() => {
    if (!response) {
      return { vocab: [], grammar: [], exercise: [], title: "Đang tải..." };
    }

    return {
      vocab: (response.vocabularies || []).map((v) => ({
        ...v,
        text: v.wordKorean,
        subText: v.meaningVietnamese,
        type: 'vocab',
        typeName: 'Từ vựng',
      })),
      grammar: (response.grammars || []).map((g) => ({
        ...g,
        text: g.pattern,
        subText: g.explanation,
        type: 'grammar',
        typeName: 'Ngữ pháp'
      })),
      exercise: (response.exercises || []).map((e) => ({
        ...e,
        text: e.title,
        subText: e.description,
        type: 'exercise',
        typeName: 'Bài tập'
      })),
      title: response.title || "Chi tiết bài học"
    };
  }, [response]);

  // Fix logic: Kiểm tra item có nằm trong danh sách đã lưu không
  const isItemSaved = (id) => savedIds.includes(id);

  const toggleSave = (id) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const starredList = useMemo(() => {
    const all = [...content.vocab, ...content.grammar, ...content.exercise];
    return all.filter(item => savedIds.includes(item.id));
  }, [content, savedIds]);

  // Nút Float điều hướng
  const handleFloatBtnClick = () => {
    if (activeTab === 'vocab') {
      navigate(`/courses/learning/${lessonId}/vocabulary`);
    } else if (activeTab === 'exercise') {
      const firstExId = content.exercise[0]?.id;
      if (firstExId) navigate(`/courses/general-learning/${currentUnitId}/exercise/${firstExId}`);
    }
    // Bạn có thể thêm logic cho grammar ở đây nếu có trang học riêng
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 text-green-700">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-xs font-black uppercase tracking-widest">Đang tải nội dung...</p>
      </div>
    );
  }
  const getFloatBtnContent = () => {
    switch (activeTab) {
      case 'vocab':
        return {
          icon: <BookOpen size={20} />,
          label: " Học ngay: Vocab",
          color: "bg-[#5CA370]"
        };
      case 'exercise':
        return {
          icon: <Play size={20} fill="currentColor" />,
          label: " Làm bài:  Exercise",
          color: "bg-[#5CA370]"
        };
      case 'grammar':
        return {
          icon: <BookOpen size={20} />,
          label: " Học ngay: Grammar",
          color: "bg-[#5CA370]"
        };
      default:
        return null;
    }
  };
  const floatConfig = getFloatBtnContent();
  const shouldShowFloatBtn = ['vocab', 'exercise', 'grammar'].includes(activeTab) && content[activeTab]?.length > 0;

  return (
    <div className="w-full min-h-screen font-sans pt-2 pb-8 relative bg-gray-50/50">

      {/* --- HEADER --- */}
      <header className="flex items-center gap-2 mb-8 px-4 -ml-2">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white text-gray-500 border border-gray-200 shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-gray-800 ml-1">
          <span className="opacity-50 hover:opacity-100 cursor-pointer transition" onClick={() => navigate('/courses')}>Course</span>
          <ChevronRight size={18} className="text-gray-400" />
          <span className="opacity-50 hover:opacity-100 cursor-pointer transition" onClick={() => navigate(`/courses/general-learning`)}>General Learning</span>
          <ChevronRight size={18} className="text-gray-400" />
          <span className="uppercase text-[#008236] truncate max-w-[200px]">{content.title}</span>
        </div>
      </header>

      {/* --- TABS --- */}
      <div className="flex items-end pl-4 overflow-x-auto no-scrollbar">
        {['vocab', 'grammar', 'exercise'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-t-xl font-bold text-sm tracking-wide transition-all relative top-[2px] z-10 border-t-2 border-l-2 border-r-2 
              ${activeTab === tab ? "bg-white text-black border-[#5CA370] border-b-white" : "bg-transparent text-gray-400 border-transparent border-b-[#5CA370]"}`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
        <button
          onClick={() => setActiveTab("starred")}
          className={`flex items-center gap-2 px-8 py-3 rounded-t-xl font-bold text-sm tracking-wide transition-all relative top-[2px] z-10 border-t-2 border-l-2 border-r-2 
            ${activeTab === "starred" ? "bg-yellow-50 text-yellow-700 border-yellow-400 border-b-yellow-50" : "bg-transparent text-gray-400 border-transparent border-b-[#5CA370]"}`}
        >
          <Star size={16} className={activeTab === "starred" ? "fill-yellow-500 text-yellow-500" : ""} /> SAVED
        </button>
      </div>

      {/* --- CONTENT BOX --- */}
      <div className={`
        relative bg-white border-2 border-t-0 rounded-b-[2.5rem] rounded-tr-[2.5rem] p-6 min-h-[550px] shadow-2xl shadow-green-900/10
        ${activeTab === 'starred' ? 'border-yellow-400' : 'border-[#5CA370]'}
      `}>

        {/* NÚT FLOAT Ở ĐẦU TAB (Bên trong Content Box) */}
        <div className="sticky top-[50px] z-50 h-0 w-full flex justify-end">
          {shouldShowFloatBtn && floatConfig && (
            <button
              onClick={handleFloatBtnClick}
              className="relative -top-7 right-0 h-14 px-6 bg-[#5CA370] text-white rounded-full shadow-[0_8px_20px_rgba(92,163,112,0.3)] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 border-4 border-white animate-in fade-in slide-in-from-right-5 duration-300"
            >
              <div className="flex items-center justify-center p-1.5 bg-white/20 rounded-full">
                {floatConfig.icon}
              </div>
              <span className="text-sm font-black uppercase tracking-tight whitespace-nowrap">
                {floatConfig.label}
              </span>
            </button>
          )}
        </div>
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab !== 'starred' ? (
            content[activeTab]?.length > 0 ? (
              content[activeTab].map((item) => (
                <ContentItem
                  key={`${activeTab}-${item.id}`}
                  item={item}
                  isSaved={isItemSaved(item.id)}
                  onToggle={() => toggleSave(item.id)}
                  onClick={() => {
                    // if (activeTab === 'vocab') navigate(`/courses/general-learning/${currentUnitId}/vocabulary`);
                    // if (activeTab === 'exercise') navigate(`/courses/general-learning/${currentUnitId}/exercise/${item.id}`);
                  }}
                />
              ))
            ) : <EmptyState message="Chưa có dữ liệu cho phần này" />
          ) : (
            starredList.length > 0 ? (
              starredList.map((item) => (
                <ContentItem
                  key={`starred-${item.id}`}
                  item={item}
                  isSaved={true}
                  showBadge
                  onToggle={() => toggleSave(item.id)}
                  onClick={() => {
                    const path = item.type === 'vocab' ? 'vocabulary' : `exercise/${item.id}`;
                    navigate(`/courses/general-learning/${currentUnitId}/${path}`);
                  }}
                />
              ))
            ) : <EmptyState message="Bạn chưa lưu mục nào" isStarred />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---
const ContentItem = ({ item, isSaved, onToggle, onClick, showBadge }) => (
  <div
    onClick={onClick}
    className="group flex items-center justify-between p-5 rounded-xl border-2 border-[#E8F3EB] bg-white hover:border-[#5CA370] hover:bg-green-50/30 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
  >
    <div className="flex flex-col text-left flex-1 pr-4">
      <div className="font-bold text-[#2D5A3C] text-xl leading-tight">
        {item.text}
      </div>
      {item.subText && (
        <div className="text-gray-600 mt-1.5 text-md font-normal italic line-clamp-2">
          {item.subText}
        </div>
      )}
      {(showBadge || item.typeName) && (
        <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-md mt-2.5 w-fit uppercase">
          {item.typeName}
        </span>
      )}
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="p-2 transition-transform hover:scale-110"
    >
      <Star size={26} className={isSaved ? "text-yellow-400 fill-yellow-400" : "text-gray-200 group-hover:text-yellow-400"} />
    </button>
  </div>
);

const EmptyState = ({ message, isStarred }) => (
  <div className="flex flex-col items-center justify-center py-32 text-gray-300">
    {isStarred ? <Bookmark size={48} className="opacity-20" /> : <BookOpen size={48} className="opacity-20" />}
    <p className="mt-4 font-bold text-sm uppercase tracking-widest text-center px-4">{message}</p>
  </div>
);

export default StudyPage;