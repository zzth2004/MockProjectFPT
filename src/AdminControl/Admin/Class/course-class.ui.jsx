import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Video,
  School,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Services & Hooks
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";
import { useAuth } from "../../../context/authContext"; // ✅ Import Auth

export default function CourseClassList() {
  const navigate = useNavigate();

  // 1. Lấy thông tin User & Role
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  // ✅ Xác định đường dẫn cơ sở: Teacher -> /teacher, Admin -> /admin
  const basePath = isTeacher ? "/teacher" : "/admin";

  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // --- 2. FETCH DATA ---
  const fetchClassesFn = useCallback(async () => {
    try {
      if (!isTeacher) {
        // Admin
        const result = await courseClassService.getAllClasses(1, 100);
        return { data: result.data || [] };
      }

      if (isTeacher) {
        // Teacher
        const result = await courseClassService.getMyClassOfTeacher();
        return { data: result || [] };
      }

      return { data: [] };
    } catch (error) {
      console.error("❌ Lỗi hệ thống khi tải danh sách lớp:", error);
      return { data: [] };
    }
  }, [isTeacher]);

  const {
    data: classResponse,
    loading,
    call: refreshClasses,
  } = useCallApiHandler(fetchClassesFn);

  useEffect(() => {
    refreshClasses();
  }, [refreshClasses]);

  // --- 3. LOGIC LỌC CLIENT (Search/Filter) ---
  const rawData = useMemo(() => {
    // Trường hợp 1: classResponse chính là mảng
    if (Array.isArray(classResponse)) return classResponse;

    // Trường hợp 2: classResponse là object có key 'data' là mảng
    if (classResponse && Array.isArray(classResponse.data)) {
      return classResponse.data;
    }

    // Trường hợp 3: API trả về null/undefined hoặc format lạ -> Trả về mảng rỗng để không crash app
    return [];
  }, [classResponse]);

  const searchOnlyData = useMemo(() => {
    if (!searchTerm) return rawData;
    // Vì rawData đã được đảm bảo là Array ở trên, nên gọi .filter() an toàn
    return rawData.filter((item) =>
      [item.name, item.teacher?.fullName, item.course?.title].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [rawData, searchTerm]);

  const advancedFilteredData = useMemo(() => {
    return rawData.filter((item) => {
      const searchMatch =
        !searchTerm ||
        [item.name, item.teacher?.fullName, item.course?.title].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const statusMatch = !filters.status || item.status === filters.status;
      return searchMatch && statusMatch;
    });
  }, [rawData, searchTerm, filters]);

  // --- 4. PHÂN TRANG ---
  const currentActiveDataset = useMemo(() => {
    if (!searchTerm && !showFilters) return rawData;
    return showFilters ? advancedFilteredData : searchOnlyData;
  }, [searchTerm, showFilters, rawData, advancedFilteredData, searchOnlyData]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentActiveDataset.slice(start, start + pageSize);
  }, [currentActiveDataset, currentPage]);

  const totalPages = Math.ceil(currentActiveDataset.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, showFilters]);

  // --- 5. ACTION HANDLERS ---
  const handleAction = async (type, item) => {
    switch (type) {
      case "view":
        navigate(`${basePath}/classes/${item.id}`); // ✅ Dùng basePath
        break;
      case "edit":
        navigate(`${basePath}/classes/edit/${item.id}`); // ✅ Dùng basePath
        break;
      case "delete":
        if (
          window.confirm(
            "⚠️ Chỉ xóa được lớp CHƯA CÓ HỌC VIÊN. Bạn chắc chắn muốn xóa?"
          )
        ) {
          try {
            await courseClassService.deleteClass(item.id);
            alert("✅ Đã xóa lớp học!");
            refreshClasses();
          } catch (error) {
            alert("❌ Không thể xóa (Lớp có học viên hoặc lỗi hệ thống)");
          }
        }
        break;
      default:
        break;
    }
  };

  // --- 6. COLUMNS ---
  const columns = [
    {
      key: "name",
      title: "Lớp học",
      render: (val, row) => (
        <div
          className="flex flex-col text-left cursor-pointer group"
          onClick={() => navigate(`${basePath}/classes/${row.id}`)}
        >
          <span className="text-[15px] font-black text-gray-800 leading-tight group-hover:text-[#2d5a2d] transition-colors">
            {val}
          </span>
          <span className="text-[10px] text-[#2d5a2d] font-bold uppercase tracking-tighter">
            Khóa: {row.course?.title || "---"}
          </span>
        </div>
      ),
    },
    {
      key: "teacher",
      title: "Giáo viên",
      render: (teacher) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-600">
            {teacher?.fullName || "Chưa gán"}
          </span>
        </div>
      ),
    },
    {
      key: "startDate",
      title: "Lịch khai giảng",
      render: (date) => (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 text-gray-700 font-bold text-[13px]">
            <Calendar size={12} />{" "}
            {date ? new Date(date).toLocaleDateString("vi-VN") : "---"}
          </div>
        </div>
      ),
    },
    {
      key: "googleMeetLink",
      title: "Liên kết",
      render: (val, row) => (
        <div className="flex gap-2">
          {val && (
            <a
              href={val}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Video
                size={18}
                className="text-red-500 hover:scale-110 transition-transform"
              />
            </a>
          )}
          {row.googleClassroomLink && (
            <a
              href={row.googleClassroomLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <School
                size={18}
                className="text-green-600 hover:scale-110 transition-transform"
              />
            </a>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (status) => {
        const configs = {
          UPCOMING: { type: "info", text: "Sắp mở" },
          ONGOING: { type: "success", text: "Đang học" },
          FINISHED: { type: "default", text: "Kết thúc" },
          CANCELLED: { type: "danger", text: "Đã hủy" },
        };
        const config = configs[status] || configs.UPCOMING;
        return <KLBadge type={config.type}>{config.text}</KLBadge>;
      },
    },
  ];

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900 uppercase italic">
          Quản lý <span className="text-[#2d5a2d]">Lớp học</span>
        </h1>
        <KLButton
          onClick={() => navigate(`${basePath}/classes/create`)}
          icon={Plus}
          className="bg-[#2d5a2d]"
        >
          Tạo lớp mới
        </KLButton>
      </div>

      {/* BỘ LỌC */}
      <KLCard className="bg-white border-none shadow-sm py-5 px-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm tên lớp, giáo viên..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <KLButton
            variant={showFilters ? "primary" : "outline"}
            icon={showFilters ? X : Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Đóng lọc" : "Lọc trạng thái"}
          </KLButton>
        </div>
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-dashed animate-in slide-in-from-top-4">
            <div className="w-full md:w-1/3 space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-gray-400 px-1">
                Tình trạng
              </label>
              <select
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">Tất cả trạng thái</option>
                <option value="UPCOMING">Sắp khai giảng</option>
                <option value="ONGOING">Đang diễn ra</option>
                <option value="FINISHED">Đã kết thúc</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>
        )}
      </KLCard>

      {/* BẢNG DỮ LIỆU */}
      <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent">
        {loading ? (
          <div className="py-24 text-center font-black animate-pulse">
            ĐANG TẢI LỚP HỌC...
          </div>
        ) : (
          <>
            <KLTable
              columns={columns}
              data={paginatedData}
              onAction={handleAction}
              showAction={true}
              hiddenActions={["reset"]}
            />
            <div className="px-8 py-6 bg-white border-t border-gray-50 flex justify-between items-center rounded-b-[2.5rem]">
              <div className="text-left">
                <span className="text-[11px] font-black text-gray-800 uppercase block">
                  Trang {currentPage} / {totalPages || 1}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Tổng: {currentActiveDataset.length} lớp
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 transition-all active:scale-90"
                >
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${
                      currentPage === i + 1
                        ? "bg-[#2d5a2d] text-white shadow-lg shadow-green-100"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 transition-all active:scale-90"
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
