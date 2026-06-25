import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Users, BookOpen, FileQuestion, MessageSquarePlus,
  PlusCircle, TrendingUp, Activity, CalendarDays,
  Zap, GraduationCap, Download, Upload, FileSpreadsheet,
  FileCheck, Info, X
} from "lucide-react";


// Import bộ UI Components của bạn
import { KLCard, KLStatsCard } from "../Component/Card";
import { KLTable } from "../Component/Table";
import { KLButton } from "../Component/Button";
import { KLBadge } from "../Component/Badge";
import { useNavigate } from "react-router-dom";

import useCallApiHandler from "../../hooks/HookHander/useCallApiHandler";

// Import bộ biểu đồ Recharts
import { KLAreaChart, KLDonutChart, KLLineChart, KLBarChart, KLRadarChart } from "../Chart/chart";
import { getTimeData } from '../Service/timeService';
import userService from "../Service/API/userServiceAPI/user.service";

export default function DashboardHome() {
  const navigate = useNavigate();
  const timeData = getTimeData();

  // States quản lý import Excel/CSV
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const fileInputRef = useRef(null);

  // 🛠️ SỬ DỤNG HOOK CỦA BẠN
  const fetchData = useCallback(() => {
    return userService.getAdminStats();
  }, []);

  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    call: fetchStats
  } = useCallApiHandler(fetchData);

  const fetchStudentsData = useCallback(() => {
    return userService.getStudents(1, 5);
  }, []);

  const {
    data: students,
    loading: studentsLoading,
    call: fetchStudents
  } = useCallApiHandler(fetchStudentsData);

  useEffect(() => {
    fetchStats();
    fetchStudents();
  }, [fetchStats, fetchStudents]);

  // Hàm xuất danh sách học viên thành Excel CSV
  const exportStudentsToCSV = async () => {
    try {
      const data = await userService.getStudents(1, 100);
      const list = data?.data || [];
      if (!list.length) {
        alert("Không có dữ liệu học viên để xuất!");
        return;
      }
      
      const headers = ["id", "fullName", "email", "level", "phone", "address", "createdAt"];
      const displayHeaders = ["Mã học viên", "Họ tên", "Email", "Trình độ", "Số điện thoại", "Địa chỉ", "Ngày tham gia"];
      
      let csvContent = "\uFEFF"; // UTF-8 BOM
      csvContent += displayHeaders.join(",") + "\n";
      
      list.forEach(row => {
        const line = headers.map(h => {
          let val = row[h] || "";
          if (h === 'createdAt' && val) {
            val = new Date(val).toLocaleDateString('vi-VN');
          }
          if (typeof val === 'string') {
            val = val.replace(/"/g, '""');
            if (val.includes(",") || val.includes('"') || val.includes("\n")) {
              val = `"${val}"`;
            }
          }
          return val;
        });
        csvContent += line.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `danh_sach_hoc_vien_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
      alert("Lỗi xuất Excel: " + err.message);
    }
  };

  // Hàm xuất báo cáo tổng hợp
  const exportReportToCSV = () => {
    if (!stats) return;
    let csvContent = "\uFEFF"; // UTF-8 BOM
    
    csvContent += "BÁO CÁO THỐNG KÊ HỆ THỐNG\n";
    csvContent += `Ngày xuất báo cáo,${new Date().toLocaleString('vi-VN')}\n\n`;
    
    csvContent += "Chỉ số,Số lượng\n";
    csvContent += `Tổng số người dùng,${stats.totalUsers}\n`;
    csvContent += `Tổng số học viên,${stats.totalStudents}\n`;
    csvContent += `Tổng số giáo viên,${stats.totalTeachers}\n`;
    csvContent += `Tổng số khóa học,${stats.totalCourses}\n`;
    csvContent += `Tăng trưởng học viên,${stats.userTrend}\n\n`;
    
    csvContent += "TĂNG TRƯỞNG THÀNH VIÊN THEO THÁNG\n";
    csvContent += "Tháng,Số lượng đăng ký\n";
    (stats.growthData || []).forEach(d => {
      csvContent += `${d.month},${d.count}\n`;
    });
    csvContent += "\n";

    csvContent += "PHÂN BỔ VAI TRÒ THÀNH VIÊN\n";
    csvContent += "Vai trò,Số lượng\n";
    (stats.distributionData || []).forEach(d => {
      csvContent += `${d.name},${d.value}\n`;
    });
    csvContent += "\n";

    csvContent += "DOANH THU HỌC PHÍ THEO THÁNG\n";
    csvContent += "Tháng,Số tiền (VNĐ)\n";
    (stats.revenueData || []).forEach(d => {
      csvContent += `${d.month},${d.amount}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bao_cao_he_thong_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Đọc file CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      try {
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          alert("Tệp tin CSV không hợp lệ hoặc rỗng!");
          return;
        }
        
        const rawHeaders = lines[0].split(",");
        const headers = rawHeaders.map(h => h.trim().replace(/^["']|["']$/g, ''));
        
        const headerMap = {
          "họ tên": "fullName",
          "fullname": "fullName",
          "tên": "fullName",
          "email": "email",
          "trình độ": "level",
          "level": "level",
          "số điện thoại": "phone",
          "sđt": "phone",
          "phone": "phone",
          "địa chỉ": "address",
          "address": "address",
          "username": "username"
        };
        
        const mappedKeys = headers.map(h => headerMap[h.toLowerCase()] || h);
        
        const parsedUsers = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          const rowData = {};
          
          mappedKeys.forEach((key, index) => {
            let val = matches[index] || "";
            val = val.trim().replace(/^["']|["']$/g, '');
            rowData[key] = val;
          });
          
          if (rowData.email && (rowData.fullName || rowData.username)) {
            parsedUsers.push(rowData);
          }
        }
        
        if (parsedUsers.length === 0) {
          alert("Không tìm thấy dòng dữ liệu học viên hợp lệ (cần tối thiểu cột Họ tên và Email)!");
          return;
        }
        
        setImportedData(parsedUsers);
        setIsImportModalOpen(true);
      } catch (err) {
        console.error(err);
        alert("Lỗi khi đọc file CSV: " + err.message);
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = null;
  };

  const handleConfirmImport = async () => {
    setIsSubmittingImport(true);
    try {
      const res = await userService.bulkCreateStudents(importedData);
      alert(`Nhập thành công! Đã tạo thêm ${res.count} học viên mới.`);
      setIsImportModalOpen(false);
      fetchStats();
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Lỗi nhập dữ liệu học viên: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingImport(false);
    }
  };
  // --- UI KHI ĐANG LOADING ---
  if (statsLoading || studentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-8 border-gray-100 border-t-[#2d5a2d] rounded-full animate-spin"></div>
        <p className="font-black text-gray-400 uppercase tracking-widest animate-pulse">Đang nạp dữ liệu hệ thống...</p>
      </div>
    );
  }

  // --- UI KHI CÓ LỖI ---
  if (statsError) {
    return (
      <KLCard className="bg-red-50 border-red-200">
        <p className="text-red-600 font-black">Lỗi kết nối: {statsError.message || "Không thể lấy dữ liệu"}</p>
        <KLButton className="mt-4" onClick={fetchStats}>Thử lại</KLButton>
      </KLCard>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* 1. HERO SECTION (Giữ nguyên phần chào Admin của bạn) */}
      <KLCard className="relative overflow-hidden border-none shadow-2xl transition-all duration-500">
        {/* Đốm màu trang trí thay đổi theo thời gian */}
        <div className={`absolute top-0 right-0 w-48 h-48 rounded-full -mr-20 -mt-20 opacity-20 blur-3xl bg-current`}
          style={{ color: timeData.color.split(' ')[1].replace('to-', '') }}></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">

            {/* Icon lớn thay đổi theo giờ */}
            <div className={`hidden sm:flex w-24 h-24 rounded-[2.5rem] bg-gradient-to-br ${timeData.color} items-center justify-center shadow-2xl shrink-0 animate-bounce-slow`}>
              <span className="text-4xl drop-shadow-lg">{timeData.icon}</span>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${timeData.color}`}>
                  System Active
                </span>
                <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">
                  {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>

              <h1 className="text-5xl font-black text-gray-950 tracking-tighter uppercase leading-none">
                {timeData.text}, <span className="text-[#2d5a2d]">Admin!</span>
              </h1>

              <p className="text-gray-500 font-bold mt-3 uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                <span className="w-12 h-[3px] bg-[#2d5a2d]"></span>
                {timeData.sub}
              </p>
            </div>
          </div>

          {/* Nút hành động nhanh */}
          <div className="flex flex-wrap gap-4 items-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv" 
              className="hidden" 
            />
            
            <KLButton
              onClick={() => fileInputRef.current?.click()}
              icon={Upload}
              className="bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1 shadow-md shadow-blue-100 font-bold border-none transition-all"
            >
              Nhập Excel học viên
            </KLButton>

            <KLButton
              onClick={exportStudentsToCSV}
              icon={Download}
              className="bg-emerald-600 hover:bg-emerald-700 text-white hover:-translate-y-1 shadow-md shadow-emerald-100 font-bold border-none transition-all"
            >
              Xuất Excel học viên
            </KLButton>

            <KLButton
              onClick={exportReportToCSV}
              icon={Download}
              className="bg-amber-600 hover:bg-amber-700 text-white hover:-translate-y-1 shadow-md shadow-amber-100 font-bold border-none transition-all"
            >
              Xuất Báo cáo
            </KLButton>
        
            <KLButton
              onClick={() => navigate("/admin/courses/create")}
              icon={PlusCircle}
              className="bg-[#2d5a2d] hover:shadow-green-200 hover:-translate-y-1"
            >
              Tạo khóa học mới
            </KLButton>
          </div>
        </div>
      </KLCard>

      {/* 2. STATS CARDS (Dữ liệu từ API) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <KLStatsCard
          title="Tổng học viên"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={stats?.userTrend}
        />
        <KLStatsCard
          title="Khóa học"
          value={stats?.totalCourses || 0}
          icon={BookOpen}
          color="blue"
        />
        <KLStatsCard
          title="Bài tập"
          value={stats?.totalQuizzes || 0}
          icon={FileQuestion}
          color="orange"
        />
        <KLStatsCard
          title="Phản hồi"
          value={stats?.totalFeedbacks || 0}
          icon={MessageSquarePlus}
          color="red"
        />
      </div>

      {/* 3. CHARTS (Dữ liệu từ API) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <KLCard className="lg:col-span-2" title="Tăng trưởng học viên">
          <KLAreaChart
            data={stats?.growthData || []}
            xKey="month"
            dataKey="count"
          />
        </KLCard>

        <KLCard title="Phân bổ thành viên">
          <KLDonutChart data={stats?.distributionData || []} />
        </KLCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <KLCard title="Thống kê nộp bài tập">
          <KLBarChart
            data={stats?.submissionData || []}
            xKey="month"
            yKey="count"
          />
        </KLCard>

        <KLCard className="lg:col-span-2" title="Doanh thu học phí (VNĐ)">
          <KLLineChart
            data={stats?.revenueData || []}
            xKey="month"
            dataKey="amount"
            color="#4ea84e"
          />
        </KLCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <KLCard title="Đánh giá kỹ năng học viên (Trung bình)">
          <KLRadarChart data={stats?.skillsData || []} />
        </KLCard>

        <KLCard title="Hướng dẫn biểu đồ & Thao tác báo cáo" subtitle="Trợ giúp nghiệp vụ Quản trị">
          <div className="space-y-4 text-sm font-bold text-gray-600">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center text-[#2d5a2d] shrink-0 mt-0.5">
                <Info size={14} />
              </div>
              <p className="leading-relaxed">
                Biểu đồ <span className="text-gray-950 font-black">Tăng trưởng học viên</span> và <span className="text-gray-950 font-black">Doanh thu học phí</span> giúp theo dõi quy mô và tình hình tài chính của trung tâm theo thời gian thực.
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <Info size={14} />
              </div>
              <p className="leading-relaxed">
                Biểu đồ <span className="text-gray-950 font-black">Thống kê nộp bài</span> và <span className="text-gray-950 font-black">Đánh giá kỹ năng (Radar)</span> phản ánh mức độ chuyên cần và năng lực học tập của học viên để điều chỉnh giáo án.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl flex-1 text-center">
                <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">Mẫu Tệp CSV Nhập</span>
                <code className="text-[10px] text-gray-800 bg-white border border-gray-100 p-1.5 rounded block select-all">
                  fullName,email,level,phone,address
                </code>
              </div>
            </div>
          </div>
        </KLCard>
      </div>

      {/* 4. RECENT STUDENTS TABLE */}
      <KLCard title="Học viên mới đăng ký" subtitle="Dữ liệu thời gian thực từ Database">
        <KLTable
          columns={[
            {
              key: "fullName",
              title: "Tên học sinh",
              render: (val, row) => val || row.username || row.email
            },
            { key: "email", title: "Email" },
            {
              key: "level",
              title: "Trình độ",
              render: (v) => <KLBadge type="info">{v?.toUpperCase()}</KLBadge>
            },
            {
              key: "createdAt",
              title: "Ngày gia nhập",
              render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "---"
            }
          ]}
          // 🚩 QUAN TRỌNG NHẤT: students là object, students.data mới là mảng
          data={students?.data || []}
          showAction={false}
        />
      </KLCard>

      {/* MODAL PREVIEW IMPORT */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#2d5a2d] border border-green-100">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight">Xem trước danh sách nhập</h3>
                  <p className="text-xs font-bold text-gray-400">Tìm thấy {importedData.length} học viên hợp lệ từ file</p>
                </div>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-2xl custom-scrollbar mb-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-black uppercase tracking-wider border-b border-gray-100">
                    <th className="p-4">Họ tên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Trình độ</th>
                    <th className="p-4">SĐT</th>
                    <th className="p-4">Địa chỉ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold text-gray-700">
                  {importedData.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="p-4">{u.fullName || u.username}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4 uppercase text-[#2d5a2d]">{u.level || "topik_1"}</td>
                      <td className="p-4">{u.phone || "---"}</td>
                      <td className="p-4 truncate max-w-[150px]">{u.address || "---"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 shrink-0">
              <KLButton
                onClick={() => setIsImportModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold"
                disabled={isSubmittingImport}
              >
                Hủy bỏ
              </KLButton>
              <KLButton
                onClick={handleConfirmImport}
                icon={FileCheck}
                className="bg-[#2d5a2d] font-bold"
                disabled={isSubmittingImport}
              >
                {isSubmittingImport ? "Đang xử lý..." : "Nhập dữ liệu ngay"}
              </KLButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}