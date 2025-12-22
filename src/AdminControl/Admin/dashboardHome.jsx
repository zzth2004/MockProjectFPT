import React from "react";
import {
  Users, BookOpen, FileQuestion, MessageSquarePlus,
  PlusCircle, TrendingUp, Activity, CalendarDays,
  Zap, GraduationCap
} from "lucide-react";


import { useEffect, useCallback } from "react";

// Import bộ UI Components của bạn
import { KLCard, KLStatsCard } from "../Component/Card";
import { KLTable } from "../Component/Table";
import { KLButton } from "../Component/Button";
import { KLBadge } from "../Component/Badge";

import useCallApiHandler from "../../hooks/HookHander/useCallApiHandler";

// Import bộ biểu đồ Recharts
import { KLAreaChart, KLDonutChart } from "../Chart/chart";
import { getTimeData } from '../Service/timeService';
import userService from "../Service/API/userServiceAPI/user.service";

export default function DashboardHome() {
  const timeData = getTimeData();

  // 🛠️ SỬ DỤNG HOOK CỦA BẠN
  // Lấy thống kê tổng quan
  // --- SỬA LẠI ĐOẠN NÀY ---

  // 1. Memoize hàm lấy stats (Bạn đã làm nhưng cần chắc chắn userService không đổi)
  const fetchData = useCallback(() => {
    return userService.getAdminStats();
  }, []);

  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    call: fetchStats
  } = useCallApiHandler(fetchData);

  // 2. QUAN TRỌNG: Sửa hàm lấy danh sách học viên
  const fetchStudentsData = useCallback(() => {
    return userService.getStudents(1, 5);
  }, []); // Dependency array trống để hàm không bị tạo lại

  const {
    data: students,
    loading: studentsLoading,
    call: fetchStudents
  } = useCallApiHandler(fetchStudentsData); // Truyền hàm đã được memoize vào đây

  useEffect(() => {
    fetchStats();
    fetchStudents();
  }, [fetchStats, fetchStudents]);
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
          <div className="flex flex-wrap gap-4">
            <KLButton
              variant="outline"
              icon={Zap}
              className="border-gray-200 text-gray-800 hover:border-[#2d5a2d]"
            >
              Tải báo cáo
            </KLButton>
            <KLButton
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

        <KLCard title="Phân bổ trình độ">
          <KLDonutChart data={stats?.distributionData || []} />
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

    </div>
  );
}