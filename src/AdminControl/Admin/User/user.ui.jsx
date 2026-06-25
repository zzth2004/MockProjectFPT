import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  Users, UserPlus, Search, Filter, Mail, ShieldCheck,
  X, ChevronLeft, ChevronRight, UserCheck, UserX, UserMinus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic & Hooks
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import { useAuth } from "../../../context/authContext"; 

// Services
import userService from "../../Service/API/userServiceAPI/user.service";
import teacherService from "../../Service/API/userServiceAPI/teacher.service"; 
export default function UserList() {
  const navigate = useNavigate();
  
  // --- 1. LẤY ROLE TỪ AUTH CONTEXT ---
  const { user } = useAuth();
  const currentRole = user?.role?.toLowerCase() || 'guest';
  const isTeacher = currentRole === 'teacher';

  // --- 2. STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    level: "",
    isActive: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Tăng pageSize lên 10 cho dễ nhìn

  // --- 3. FETCH DATA (LOGIC ĐỘNG) ---
  const fetchUsersFn = useCallback(() => {
    if (isTeacher) {
      return teacherService.getMyStudents(1, 100); 
    } 
    // Nếu là ADMIN -> Gọi API lấy tất cả user
    else {
      // console.log("🚀 [UserList] Admin mode: Fetching all users...");
      return userService.getAllUsers(1, 100);
    }
  }, [isTeacher]);

  const { data: usersData, loading, call: refreshUsers } = useCallApiHandler(fetchUsersFn);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // --- 4. LOGIC LỌC DỮ LIỆU ---
  const rawData = useMemo(() => {
    // Xử lý dữ liệu trả về: Teacher API có thể trả về 'items' hoặc 'data' tùy backend
    const list = usersData?.data || usersData?.items || [];
    return list;
  }, [usersData]);

  const filteredDataset = useMemo(() => {
    return rawData.filter(u => {
      // Lọc theo Search (Tên, Email, Username)
      const searchMatch = !searchTerm || 
        [u.fullName, u.email, u.username].some(field => 
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Lọc theo Role (Chỉ Admin mới cần lọc role, Teacher mặc định thấy student)
      const roleMatch = !filters.role || u.role === filters.role;
      
      // Lọc theo Level
      const levelMatch = !filters.level || u.level === filters.level;

      // Lọc theo Status
      const statusMatch = filters.isActive === "" || String(u.isActive) === filters.isActive;
      
      return searchMatch && roleMatch && levelMatch && statusMatch;
    });
  }, [rawData, searchTerm, filters]);

  // Nhóm học sinh theo lớp dành cho Giáo viên
  const groupedData = useMemo(() => {
    if (!isTeacher) return null;
    const groups = {};
    
    filteredDataset.forEach(u => {
      const enrollments = u.enrollments || [];
      if (enrollments.length > 0) {
        enrollments.forEach(enr => {
          const className = enr.class?.name || "Lớp khác / Chưa xếp lớp";
          const courseTitle = enr.class?.course?.title || enr.course?.title || "Chưa có thông tin khóa học";
          const key = `${courseTitle} - ${className}`;
          
          if (!groups[key]) {
            groups[key] = {
              className,
              courseTitle,
              students: []
            };
          }
          if (!groups[key].students.some(s => s.id === u.id)) {
            groups[key].students.push(u);
          }
        });
      } else {
        const key = "Chưa xếp lớp";
        if (!groups[key]) {
          groups[key] = {
            className: "Chưa xếp lớp",
            courseTitle: "",
            students: []
          };
        }
        groups[key].students.push(u);
      }
    });
    
    return groups;
  }, [filteredDataset, isTeacher]);

  const classKeys = useMemo(() => {
    return groupedData ? Object.keys(groupedData) : [];
  }, [groupedData]);

  const currentClassKey = classKeys[currentPage - 1];
  const currentClassGroup = currentClassKey ? groupedData[currentClassKey] : null;

  // Phân trang
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDataset.slice(startIndex, startIndex + pageSize);
  }, [filteredDataset, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    if (isTeacher) {
      return classKeys.length;
    }
    return Math.ceil(filteredDataset.length / pageSize);
  }, [isTeacher, classKeys, filteredDataset, pageSize]);

  // Reset trang về 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);


  // --- 5. HANDLERS ---
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleFilters = () => {
    if (showFilters) setFilters({ role: "", level: "", isActive: "" });
    setShowFilters(!showFilters);
  };

 const handleAction = async (type, targetUser) => {
    if (isTeacher && ['edit', 'delete', 'lock', 'unlock', 'reset'].includes(type)) {
      alert("⚠️ Bạn không có quyền thực hiện hành động này!");
      return;
    }

    switch (type) {
      case 'view': {
        const detailPath = isTeacher 
            ? `/teacher/students/${targetUser.id}` 
            : `/admin/users/${targetUser.id}`;
        navigate(detailPath);
        break;
      } // ✅ Đóng ngoặc nhọn
      
      case 'edit':
        navigate(`/admin/users/edit/${targetUser.id}`);
        break;

      case 'delete':
        if (window.confirm(`⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản: ${targetUser.username}?`)) {
          try {
            await userService.softDeleteUser(targetUser.id);
            alert("✅ Đã xóa thành công!");
            refreshUsers();
          } catch (e) { 
            console.error(e);
            alert("❌ Lỗi khi xóa user"); 
          }
        }
        break;

      case 'lock':
      case 'unlock': { 
        const isLocking = type === 'lock';
        if (window.confirm(`${isLocking ? 'Khóa' : 'Mở khóa'} tài khoản ${targetUser.username}?`)) {
            try {
                await userService.updateProfile(targetUser.id, { isActive: !isLocking });
                alert(`✅ Đã ${isLocking ? 'khóa' : 'mở khóa'} thành công!`);
                refreshUsers();
            } catch { 
                alert("❌ Thao tác thất bại");
            }
        }
        break;
      } 
      case 'kick': {
        if (window.confirm(`⚠️ Bạn muốn đuổi học viên "${targetUser.fullName || targetUser.username}" ra khỏi lớp?`)) {
            try {
                // Gọi API kick học viên (Bạn cần định nghĩa hàm này trong teacherService)
                // Ví dụ: await teacherService.removeStudentFromClass(targetUser.id, courseId);
                
                console.log("🔥 Đang đuổi học viên ID:", targetUser.id);
                alert("✅ Đã xóa học viên khỏi lớp thành công!");
                refreshUsers(); // Tải lại danh sách
            } catch (err) {
                alert("❌ Lỗi khi đuổi học viên: " + err.message);
            }
        }
        break;
    }

      default: break;
    }
  };
  // --- 6. CẤU HÌNH CỘT (DYNAMIC COLUMN) ---
  // Sử dụng .filter(Boolean) để loại bỏ các cột false (ẩn đi)
  const columns = [
    {
      key: "fullName",
      title: isTeacher ? "Học viên" : "Người dùng", // Đổi tiêu đề cột tùy role
      render: (val, row) => (
        <div 
            className={`flex items-center gap-3 group ${isTeacher ? '' : 'cursor-pointer'}`} 
            onClick={() => handleAction('view', row)}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#E4FBE1] text-[#2d5a2d] flex items-center justify-center font-black uppercase border-2 border-[#E4FBE1] group-hover:bg-white transition-colors">
            {(val || row.username || "U")[0]}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[15px] font-black text-gray-800 leading-tight group-hover:text-[#2d5a2d] transition-colors">
                {val || row.username}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-left">
                ID: #{row.id}
            </span>
          </div>
        </div>
      )
    },
    { key: "email", title: "Liên hệ" },
    
    // Cột Role: Chỉ hiện cho Admin. Teacher chỉ thấy học sinh nên không cần cột này.
    !isTeacher && {
      key: "role",
      title: "Vai trò",
      render: (role) => <KLBadge type={role === 'admin' ? 'warning' : 'success'}>{role}</KLBadge>
    },
    


    {
      key: "isActive",
      title: "Trạng thái",
      render: (isActive) => (
        <span className={`text-[12px] font-black uppercase ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
          {isActive ? '● Active' : '● Locked'}
        </span>
      )
    },
    isTeacher && {
        key: "actions",
        title: "Tác vụ",
        render: (_, row) => (
            <button 
                onClick={(e) => {
                    e.stopPropagation(); // Ngăn click nhầm vào dòng (view detail)
                    handleAction('kick', row);
                }}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md transition-all group"
                title="Đuổi khỏi lớp"
            >
                <UserMinus size={16} strokeWidth={2.5} />
            </button>
        )
    }
  ].filter(Boolean); // Lọc bỏ các giá trị false/null/undefined

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
            Quản lý <span className="text-[#2d5a2d]">{isTeacher ? "Học sinh" : "Nhân sự"}</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
            {isTeacher ? "Teacher Portal - My Students" : "KoreanLab System Admin"}
          </p>
        </div>
        
        {/* Chỉ Admin mới thấy nút Thêm thành viên */}
        {!isTeacher && (
            <KLButton icon={UserPlus} className="bg-[#2d5a2d]" onClick={() => navigate('/admin/users/create')}>
                Thêm thành viên
            </KLButton>
        )}
      </div>

      {/* FILTERS & SEARCH */}
      <KLCard className="bg-white border-none shadow-sm py-5 px-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                    type="text"
                    placeholder={isTeacher ? "Tìm tên học sinh..." : "Tìm user, email..."}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <KLButton
                variant={showFilters ? "primary" : "outline"}
                icon={showFilters ? X : Filter}
                onClick={toggleFilters}
                className={showFilters ? "bg-black text-white border-black" : ""}
            >
                {showFilters ? "Đóng bộ lọc" : "Lọc nâng cao"}
            </KLButton>
        </div>

        {showFilters && (
            <div className="mt-6 pt-6 border-t border-dashed border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300 text-left">
                {/* Chỉ Admin mới cần lọc Role */}
                {!isTeacher && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Quyền hệ thống</label>
                        <select 
                            className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                            value={filters.role} onChange={(e) => handleFilterChange("role", e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="teacher">Giáo viên</option>
                            <option value="student">Học sinh</option>
                        </select>
                    </div>
                )}
                
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trình độ</label>
                    <select 
                        className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                        value={filters.level} onChange={(e) => handleFilterChange("level", e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="topik_1">TOPIK 1</option>
                        <option value="topik_2">TOPIK 2</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trạng thái</label>
                    <select 
                        className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                        value={filters.isActive} onChange={(e) => handleFilterChange("isActive", e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Active</option>
                        <option value="false">Locked</option>
                    </select>
                </div>
            </div>
        )}
      </KLCard>

      {/* TABLE SECTION */}
      {loading ? (
         <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-white py-24 text-center flex flex-col items-center justify-center rounded-[2.5rem]">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-[#2d5a2d] rounded-full animate-spin mb-4"></div>
              <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</p>
         </KLCard>
      ) : isTeacher ? (
         classKeys.length === 0 ? (
            <KLCard className="py-20 text-center bg-white rounded-[2.5rem] border-none shadow-md italic font-black text-gray-400 uppercase tracking-widest">
                Hệ thống chưa ghi nhận dữ liệu học sinh
            </KLCard>
         ) : (
            <div className="space-y-6">
              {currentClassGroup && (
                <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-white rounded-[2.5rem] relative">
                  {/* Group Header */}
                  <div className="px-8 py-6 bg-gradient-to-r from-[#2d5a2d]/5 to-transparent border-b border-gray-50 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-black text-[#2d5a2d] uppercase tracking-tight">
                        {currentClassGroup.className}
                      </h3>
                      {currentClassGroup.courseTitle && (
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                          Khóa học: {currentClassGroup.courseTitle}
                        </p>
                      )}
                    </div>
                    <KLBadge type="success">
                      {currentClassGroup.students.length} Học viên
                    </KLBadge>
                  </div>
                  
                  {/* Table for this group */}
                  <KLTable
                    columns={columns}
                    data={currentClassGroup.students}
                    showAction={true}
                    onAction={handleAction}
                    hiddenActions={['edit', 'delete', 'lock', 'reset']}
                  />

                  {/* PAGINATION UI */}
                  <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
                     <div className="flex flex-col text-left">
                         <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest leading-none">
                             Lớp {currentPage} / {totalPages}
                         </span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                             Hiển thị {currentClassGroup.students.length} học viên trong lớp này
                         </span>
                     </div>

                     <div className="flex items-center gap-3">
                         <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all active:scale-90">
                             <ChevronLeft size={20} strokeWidth={3} />
                         </button>
                         <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all active:scale-90">
                             <ChevronRight size={20} strokeWidth={3} />
                         </button>
                     </div>
                  </div>
                </KLCard>
              )}
            </div>
         )
      ) : (
         <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-white rounded-[2.5rem] relative">
           <KLTable
              columns={columns}
              data={paginatedData}
              showAction={true}
              onAction={handleAction}
              hiddenActions={['reset', 'edit']}
           />

           {/* PAGINATION UI */}
           <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
              <div className="flex flex-col text-left">
                  <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest leading-none">
                      Trang {currentPage} / {totalPages || 1}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                      Hiển thị {paginatedData.length} / {filteredDataset.length} kết quả
                  </span>
              </div>

              <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all active:scale-90">
                      <ChevronLeft size={20} strokeWidth={3} />
                  </button>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all active:scale-90">
                      <ChevronRight size={20} strokeWidth={3} />
                  </button>
              </div>
           </div>
         </KLCard>
      )}
    </div>
  );
}