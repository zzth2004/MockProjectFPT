import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Layers,
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";
import { useNavigate } from "react-router-dom";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import courseService from "../../Service/API/courseServiceAPI/course.service";
import { useAuth } from "../../../context/authContext";

export default function CourseList() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  // --- 1. STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    isPublished: "", // "true", "false" hoặc ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // --- 2. FETCH DATA ---
  const fetchCoursesFn = useCallback(
    () => courseService.getAllCourses(1, 100),
    []
  );
  const {
    data: coursesResponse,
    loading,
    call: refreshCourses,
  } = useCallApiHandler(fetchCoursesFn);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  // --- 3. LOGIC LỌC ---
  const rawData = useMemo(() => coursesResponse?.data || [], [coursesResponse]);

  const rawDataFiltered = useMemo(() => {
    return rawData.filter((course) => {
      const searchMatch =
        !searchTerm ||
        [course.title, course.description].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const statusMatch =
        filters.isPublished === "" ||
        String(course.isPublished) === filters.isPublished;

      return searchMatch && statusMatch;
    });
  }, [rawData, searchTerm, filters]);

  // --- 4. PHÂN TRANG ---
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return rawDataFiltered.slice(startIndex, startIndex + pageSize);
  }, [rawDataFiltered, currentPage, pageSize]);

  const totalPages = Math.ceil(rawDataFiltered.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // --- 5. HANDLERS ---

  // 👇 Hàm xử lý chuyển đổi trạng thái Public/Private nhanh
  const handleToggleStatus = async (course) => {
    const newStatus = !course.isPublished;
    const label = newStatus ? "PUBLIC" : "PRIVATE";

    // UI xác nhận nhanh (có thể bỏ nếu muốn nhanh hơn)
    if (
      !window.confirm(
        `Bạn có muốn chuyển trạng thái khóa học "${course.title}" sang ${label}?`
      )
    ) {
      return;
    }

    try {
      // Gọi API update (Chỉ gửi trường isPublished)
      await courseService.updateCourse(course.id, { isPublished: newStatus });

      // Refresh lại danh sách ngay lập tức
      await refreshCourses();
      // alert(`✅ Đã chuyển sang ${label}`); // Optional
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi cập nhật trạng thái");
    }
  };

  const handleAction = async (type, course) => {
    switch (type) {
      case "view":
        navigate(`/admin/courses/${course.id}/detail`);
        break;
      case "edit":
        navigate(`/admin/courses/edit/${course.id}`);
        break;
      case "delete":
        if (
          window.confirm(
            `⚠️ Bạn có chắc chắn muốn XÓA khóa học: ${course.title}?`
          )
        ) {
          try {
            await courseService.deleteCourse(course.id);
            alert("✅ Đã xóa khóa học thành công!");
            refreshCourses();
          } catch (error) {
            alert("❌ Lỗi khi xóa khóa học");
          }
        }
        break;
      default:
        break;
    }
  };

  // --- 6. CẤU HÌNH CỘT ---
  const columns = [
    {
      key: "title",
      title: "Thông tin khóa học",
      render: (val, row) => (
        <div className="flex items-center gap-4 text-left py-1">
          <div className="w-20 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm flex-shrink-0">
            {row.thumbnail ? (
              <img
                src={row.thumbnail}
                alt="thumb"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                <BookOpen size={20} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            {/* 👇 1. Click vào tên -> Chuyển sang trang Detail */}
            <span
              onClick={() => navigate(`/admin/courses/${row.id}/detail`)}
              className="text-[15px] font-black text-gray-900 leading-tight line-clamp-1 hover:text-[#2d5a2d] transition-colors cursor-pointer"
              title="Xem chi tiết khóa học"
            >
              {val}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Slug: {row.slug}
              </span>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="text-[10px] text-red-500 font-black uppercase italic">
                {row.level}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "stats",
      title: "Thống kê",
      render: (_, row) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <KLBadge type="info">
              <div className="flex items-center gap-1 min-w-[70px]">
                <Layers size={10} />
                <span className="font-black text-[10px]">
                  {row.lessonsCount || 0} BÀI HỌC
                </span>
              </div>
            </KLBadge>
          </div>
          <div className="flex items-center gap-2">
            <KLBadge type={row.classesCount > 0 ? "success" : "default"}>
              <div className="flex items-center gap-1 min-w-[70px]">
                <Users size={10} />
                <span className="font-black text-[10px]">
                  {row.classesCount || 0} LỚP MỞ
                </span>
              </div>
            </KLBadge>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      title: "Học phí",
      render: (val, row) => (
        <div className="flex flex-col text-left">
          <span className="text-sm font-black text-gray-800">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(row.salePrice || val)}
          </span>
          {row.salePrice < row.price && (
            <span className="text-[10px] text-gray-400 font-bold line-through">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(row.price)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdBy",
      title: "Người tạo",
      render: (createdBy, row) => {
        
        // 💡 GIẢI PHÁP: Nếu API trả về null (như Row 129),
        // nhưng ID người tạo trùng với mình, thì lấy thông tin mình hiển thị luôn.
        const isMe = row.createdById === currentUser?.id || !row.createdBy;

        const displayName =
          createdBy?.fullName ||
          (isMe ? currentUser?.fullName : "Đang cập nhật...");
        const displayAvatar =
          createdBy?.avatar || (isMe ? currentUser?.avatar : null);
        const displayRole =
          createdBy?.role || (isMe ? currentUser?.role : "GIẢNG VIÊN");

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E4FBE1] text-[#2d5a2d] flex items-center justify-center font-black overflow-hidden">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              ) : (
                <span>{(displayName || "U")[0]}</span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[15px] font-black text-gray-800">
                {displayName}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">
                {displayRole}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "isPublished",
      title: "Trạng thái",
      render: (val, row) => (
        // 👇 2. Click vào Badge -> Toggle trạng thái
        <div
          onClick={(e) => {
            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài (nếu row có onClick)
            handleToggleStatus(row);
          }}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          title="Nhấn để thay đổi trạng thái"
        >
          <KLBadge type={val ? "success" : "danger"}>
            {val ? "PUBLIC" : "PRIVATE"}
          </KLBadge>
        </div>
      ),
    },
  ];

  // Logic Pagination UI
  const getPaginationRange = () => {
    const totalVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(totalVisible / 2));
    let end = Math.min(totalPages, start + totalVisible - 1);
    if (end === totalPages) start = Math.max(1, totalPages - totalVisible + 1);
    if (start === 1) end = Math.min(totalPages, totalVisible);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  const visiblePages = getPaginationRange();

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
            Quản lý <span className="text-[#2d5a2d]">Khóa học</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
            LMS Course Management System
          </p>
        </div>
        <div className="flex gap-2">
          <KLButton
            onClick={() => navigate("/admin/courses/create")}
            icon={Plus}
            className="bg-[#2d5a2d]"
          >
            Tạo khóa học
          </KLButton>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <KLCard className="bg-white border-none shadow-sm py-5 px-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm tên khóa học..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <KLButton
            variant={showFilters ? "primary" : "outline"}
            icon={showFilters ? X : Filter}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-black text-white border-black" : ""}
          >
            {showFilters ? "Đóng lọc" : "Lọc nâng cao"}
          </KLButton>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-dashed border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 px-1">
                Trạng thái hiển thị
              </label>

              {/* 👇 3. Cập nhật Text Bộ Lọc */}
              <select
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                value={filters.isPublished}
                onChange={(e) =>
                  setFilters({ ...filters, isPublished: e.target.value })
                }
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Public (Công khai)</option>
                <option value="false">Private (Riêng tư)</option>
              </select>
            </div>
          </div>
        )}
      </KLCard>

      {/* TABLE SECTION */}
      <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent relative">
        {loading ? (
          <div className="py-24 text-center">
            Đang nạp danh sách khóa học...
          </div>
        ) : (
          <>
            <KLTable
              columns={columns}
              data={paginatedData}
              showAction={true}
              onAction={handleAction}
              hiddenActions={["reset", "lock"]}
            />

            {/* PAGINATION (Giữ nguyên) */}
            <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">
                  Trang {currentPage} / {totalPages || 1}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Tổng: {rawDataFiltered.length} khóa học
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all active:scale-90"
                >
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
                <div className="flex gap-2">
                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${
                        currentPage === page
                          ? "bg-[#2d5a2d] text-white shadow-lg shadow-green-100"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all active:scale-90"
                >
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </>
        )}
      </KLCard>
    </div>
  );
}
