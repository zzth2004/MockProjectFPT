import React, { useEffect, useCallback, useMemo } from "react";
import {
  Users, PlusCircle, GraduationCap, ClipboardCheck,
  Clock, CalendarDays, Activity, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

// UI Components
import { KLCard, KLStatsCard } from "../AdminControl/Component/Card";
import { KLTable } from "../AdminControl/Component/Table";
import { KLButton } from "../AdminControl/Component/Button";
import { KLBadge } from "../AdminControl/Component/Badge";

// Logic & API
import useCallApiHandler from "../hooks/HookHander/useCallApiHandler";
import { getTimeData } from '../AdminControl/Service/timeService';
import teacherService from "../AdminControl/Service/API/userServiceAPI/teacher.service"; 

// Charts
import { KLAreaChart, KLDonutChart } from "../AdminControl/Chart/chart";

// --- DỮ LIỆU MẪU (MOCK DATA) ---
const MOCK_STATS = {
  totalStudents: 12, 
  studentTrend: "+2 tháng này",
  totalCourses: 1,
  pendingAssignments: 5,
  attendanceRate: 100,
  performanceHistory: [
    { month: 'T10', score: 80 },
    { month: 'T11', score: 85 },
    { month: 'T12', score: 92 }
  ],
  submissionStats: [
    { name: 'Đã hoàn thành', value: 75, color: '#377437' },
    { name: 'Đang chờ', value: 25, color: '#FFB800' }
  ]
};

const MOCK_STUDENTS = [
  { id: 'm1', fullName: "Học viên mẫu A", email: "sample-a@gmail.com", courseName: "Khóa học mẫu", status: "active", joinedAt: new Date().toISOString() },
  { id: 'm2', fullName: "Học viên mẫu B", email: "sample-b@gmail.com", courseName: "Khóa học mẫu", status: "warning", joinedAt: new Date().toISOString() }
];

export default function TeacherDashboardHome() {
  const navigate = useNavigate(); // 2. Khai báo hook navigate
  const timeData = getTimeData();
  const basePath = "/teacher"; // Hardcode vì đây là trang Teacher Dashboard

  // API Calls
  const { data: overview, loading: ovLoading, call: fetchOv } = useCallApiHandler(
    useCallback(() => teacherService.getDashboardOverview(), [])
  );
  const { data: stats, loading: stLoading, call: fetchStats } = useCallApiHandler(
    useCallback(() => teacherService.getDashboardStats(), [])
  );
  const { data: studentRes, loading: sdLoading, call: fetchStudents } = useCallApiHandler(
    useCallback(() => teacherService.getMyStudents(1, 5), [])
  );

  useEffect(() => {
    fetchOv(); fetchStats(); fetchStudents();
  }, [fetchOv, fetchStats, fetchStudents]);

  // --- LOGIC XỬ LÝ DỮ LIỆU ---
  const displayStats = useMemo(() => {
    const s = stats || {}; 
    return {
      totalStudents: s.totalStudents ?? MOCK_STATS.totalStudents,
      studentTrend: s.studentTrend ?? MOCK_STATS.studentTrend,
      totalCourses: s.totalCourses ?? MOCK_STATS.totalCourses,
      pendingAssignments: s.pendingAssignments ?? MOCK_STATS.pendingAssignments,
      attendanceRate: s.attendanceRate ?? MOCK_STATS.attendanceRate,
      performanceHistory: (Array.isArray(s.performanceHistory) && s.performanceHistory.length > 0) 
        ? s.performanceHistory 
        : MOCK_STATS.performanceHistory,
      submissionStats: (Array.isArray(s.submissionStats) && s.submissionStats.length > 0) 
        ? s.submissionStats 
        : MOCK_STATS.submissionStats
    };
  }, [stats]);

  const displayStudents = useMemo(() => {
    const realData = studentRes?.items || studentRes?.data || [];
    return realData.length > 0 ? realData : MOCK_STUDENTS;
  }, [studentRes]);

  // UI Loading
  if (ovLoading || stLoading || sdLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-[#377437] animate-spin" />
        <p className="font-black text-gray-400 uppercase tracking-widest animate-pulse text-[10px]">
          Đang nạp dữ liệu giảng dạy...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      
      {/* 1. HERO SECTION */}
      <KLCard className="relative overflow-hidden border-none shadow-2xl bg-white p-1">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 opacity-[0.05] blur-3xl bg-[#377437]"></div>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-6">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${timeData.color} flex items-center justify-center shadow-lg shrink-0`}>
              <span className="text-2xl drop-shadow-md">{timeData.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <KLBadge type="success" className="text-[9px] font-black uppercase">Teacher Portal</KLBadge>
                <span className="text-gray-400 font-bold text-[10px] uppercase flex items-center gap-1">
                   <Clock size={10} /> {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                {timeData.text}, <span className="text-[#377437]">Teacher!</span>
              </h1>
              <p className="text-gray-400 font-bold mt-2 uppercase text-[9px] tracking-[0.2em] flex items-center gap-2">
                <span className="w-8 h-[1px] bg-gray-300"></span>
                {overview?.todayClassesMessage || `Hệ thống quản lý ${displayStats.totalCourses} lớp học`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* 3. NÚT LỊCH DẠY HOẠT ĐỘNG */}
            <KLButton 
                variant="outline" 
                icon={CalendarDays} 
                className="text-[10px] font-black border-gray-100 hover:bg-green-50 hover:text-[#377437]"
                onClick={() => navigate(`${basePath}/schedule`)}
            >
                Lịch dạy
            </KLButton>
            
            <KLButton 
                icon={PlusCircle} 
                className="bg-[#377437] text-[10px] font-black hover:bg-[#2a522a]"
                onClick={() => alert("Chức năng giao bài tập đang phát triển!")}
            >
                Giao bài tập
            </KLButton>
          </div>
        </div>
      </KLCard>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KLStatsCard
          title="Học sinh"
          value={displayStats.totalStudents}
          icon={Users}
          trend={displayStats.studentTrend}
        />
        <KLStatsCard
          title="Khóa học"
          value={displayStats.totalCourses}
          icon={GraduationCap}
          color="blue"
        />
        <KLStatsCard
          title="Cần chấm"
          value={displayStats.pendingAssignments}
          icon={ClipboardCheck}
          color="orange"
        />
        <KLStatsCard
          title="Chuyên cần"
          value={`${displayStats.attendanceRate}%`}
          icon={Activity}
          color="green"
        />
      </div>

      {/* 3. CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <KLCard className="lg:col-span-2" title="Tiến độ học tập">
          <KLAreaChart
            data={displayStats.performanceHistory}
            xKey="month"
            dataKey="score"
          />
        </KLCard>
        <KLCard title="Trạng thái nộp bài">
          <div className="h-[240px] flex items-center justify-center">
            <KLDonutChart data={displayStats.submissionStats} />
          </div>
        </KLCard>
      </div>

      {/* 4. RECENT STUDENTS TABLE */}
      <KLCard title="Học viên mới gia nhập" subtitle="Dữ liệu từ Database hệ thống">
        <KLTable
          columns={[
            {
              key: "fullName",
              title: "Học sinh",
              render: (val, row) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-[#377437] text-[10px] border border-gray-100">
                    {(val || row.username || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs mb-0.5">{val || row.username}</p>
                    <p className="text-[9px] text-gray-400 font-medium">{row.email || 'N/A'}</p>
                  </div>
                </div>
              )
            },
            { 
              key: "courseName", 
              title: "Khóa học", 
              render: (v, row) => (
                <span className="font-bold text-gray-500 text-xs">
                  {row.enrollments?.[0]?.class?.course?.title || v || "N/A"}
                </span>
              ) 
            },
            {
              key: "status",
              title: "Trạng thái",
              render: (s, row) => {
                const statusVal = s || (row.enrollments?.length > 0 ? 'active' : 'offline');
                return (
                  <KLBadge type={statusVal === 'active' ? 'success' : 'warning'} className="text-[9px]">
                    {statusVal.toUpperCase()}
                  </KLBadge>
                );
              }
            },
            {
              key: "joinedAt",
              title: "Ngày gia nhập",
              render: (date, row) => {
                const actualDate = row.enrollments?.[0]?.createdAt || date;
                return actualDate ? new Date(actualDate).toLocaleDateString('vi-VN') : "---";
              }
            }
          ]}
          data={displayStudents}
          showAction={true}
          // Thêm handler cho action xem chi tiết học viên nếu cần
          onAction={(type, row) => {
             if (type === 'view') navigate(`/teacher/users/${row.id}`);
          }}
        />
      </KLCard>
    </div>
  );
}