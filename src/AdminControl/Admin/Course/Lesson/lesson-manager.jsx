import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  Search, Plus, Video, FileText, Clock, ChevronLeft, ChevronRight, Database, BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { KLCard } from "../../../Component/Card";
import { KLTable } from "../../../Component/Table";
import { KLButton } from "../../../Component/Button";
import { KLBadge } from "../../../Component/Badge";


import useCallApiHandler from "../../../../hooks/HookHander/useCallApiHandler";

import lessonService from "../../../Service/API/lessonServiceAPI/lesson.service";
import { useAuth } from "../../../../context/authContext"; // Import Auth

export default function LessonManager({ courseId, courseTitle }) {
  const navigate = useNavigate();
  
  // Xác định Role & BasePath
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const basePath = isTeacher ? "/teacher" : "/admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ isFree: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchLessonsFn = useCallback(() => {
    const LIMIT = 100; 
    const PAGE = 1;
    if (courseId) {
      return lessonService.getByCourse(courseId, PAGE, LIMIT);
    }
    return lessonService.getAllLesson(PAGE, LIMIT);
  }, [courseId]);

  const {
    data: lessonsResponse,
    loading,
    call: refreshLessons,
  } = useCallApiHandler(fetchLessonsFn);

  useEffect(() => {
    refreshLessons();
  }, [refreshLessons]);

  const rawData = useMemo(() => {
      if (Array.isArray(lessonsResponse)) return lessonsResponse;
      if (lessonsResponse?.data && Array.isArray(lessonsResponse.data)) return lessonsResponse.data;
      return [];
  }, [lessonsResponse]);

  const filteredDataset = useMemo(() => {
    return rawData.filter((lesson) => {
      const searchMatch = !searchTerm || lesson.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filters.isFree === "" || String(lesson.isFree) === filters.isFree;
      return searchMatch && statusMatch;
    });
  }, [rawData, searchTerm, filters]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDataset.slice(startIndex, startIndex + pageSize);
  }, [filteredDataset, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDataset.length / pageSize);

  // --- HANDLERS ---
  const handleCreate = () => {
    if (courseId) {
      // Truyền ID khóa học sang trang tạo để tự điền
      navigate(`${basePath}/lessons/create`, {
        state: { preSelectedCourseId: courseId, courseTitle: courseTitle },
      });
    } else {
      navigate(`${basePath}/lessons/create`);
    }
  };

  const handleAction = async (type, lesson) => {
    switch (type) {
      case "edit":
        navigate(`${basePath}/lessons/edit/${lesson.id}`);
        break;
      case "delete":
        if (window.confirm(`⚠️ Xóa bài học: ${lesson.title}?`)) {
          try {
            await lessonService.delete(lesson.id);
            alert("✅ Đã xóa thành công!");
            refreshLessons();
          } catch (error) {
            alert("❌ Lỗi xóa bài học.");
          }
        }
        break;
      default: break;
    }
  };

  const columns = [
    {
      key: "id", title: "STT (ID)",
      render: (val, row) => <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100">{row.id}</div>
    },
    {
      key: "title", title: "Bài giảng",
      render: (val, row) => (
        <div className="flex flex-col text-left py-1">
          <span className="text-sm font-black text-gray-900 mb-1 cursor-pointer hover:text-[#2d5a2d] transition-colors" onClick={() => handleAction("edit", row)}>
            {val}
          </span>
          <div className="flex items-center gap-2">
            {row.videoUrl ? 
                <span className="flex items-center gap-1 text-[9px] text-blue-600 font-bold uppercase"><Video size={10} /> Video</span> : 
                <span className="flex items-center gap-1 text-[9px] text-orange-500 font-bold uppercase"><FileText size={10} /> Docs</span>
            }
            {!courseId && row.course && (
                <span className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase border-l pl-2 border-gray-200">
                  <BookOpen size={10} /> {row.course.title}
                </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "duration", title: "Thời lượng",
      render: (val) => <div className="text-xs font-bold text-gray-500 flex items-center gap-1"><Clock size={12} /> {val ? `${val}p` : "--"}</div>
    },
    {
      key: "isFree", title: "Truy cập",
      render: (val) => <KLBadge type={val ? "success" : "default"}>{val ? "HỌC THỬ" : "NỘI BỘ"}</KLBadge>
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase">Danh sách bài học</h2>
          <p className="text-xs text-gray-400 font-bold">Tổng số: {filteredDataset.length} bài</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isTeacher && (
             <KLButton variant="outline" icon={Database} onClick={() => lessonService.seedData().then(refreshLessons)}>Seed</KLButton>
          )}
          <KLButton icon={Plus} className="bg-[#2d5a2d] flex-1 sm:flex-none justify-center" onClick={handleCreate}>Thêm bài học</KLButton>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-[#2d5a2d]/10 outline-none" 
            placeholder="Tìm kiếm bài học..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="px-4 py-2.5 bg-white rounded-xl border border-gray-100 text-xs font-bold uppercase text-gray-600 outline-none cursor-pointer"
          value={filters.isFree} onChange={(e) => setFilters({ ...filters, isFree: e.target.value })}>
          <option value="">Tất cả loại</option>
          <option value="true">Học thử</option>
          <option value="false">Nội bộ</option>
        </select>
      </div>

      <KLCard className="p-0 border-none shadow-sm overflow-hidden">
        {loading ? <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Đang tải dữ liệu...</div> : (
          <KLTable columns={columns} data={paginatedData} showAction={true} onAction={handleAction} hiddenActions={["reset", "lock", "view"]} />
        )}
        <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="p-2 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-100 transition-colors"><ChevronLeft size={16} /></button>
          <span className="px-4 py-2 bg-white rounded-lg text-xs font-black flex items-center border border-gray-100">Trang {currentPage} / {totalPages || 1}</span>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="p-2 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-100 transition-colors"><ChevronRight size={16} /></button>
        </div>
      </KLCard>
    </div>
  );
}