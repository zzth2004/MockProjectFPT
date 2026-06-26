import React, { useState, useEffect } from "react";
import {
  Medal, Star, Flame, Trophy, Activity, CalendarDays, BookOpen, Clock, ChevronRight, Sparkles
} from "lucide-react";
import clientAxios from "../../api/axiosAPI";
import { useAuth } from "../../context/authContext";
import gamificationService from "../../AdminControl/Service/API/gamificationAPI/gamification.service";
import exerciseService from "../../AdminControl/Service/API/lessonServiceAPI/exercise.service";
import { KLCard } from "../../AdminControl/Component/Card";
import { KLAreaChart } from "../../AdminControl/Chart/chart";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalPoints: 0, currentLevel: 1, currentStreak: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [historyChart, setHistoryChart] = useState([]);
  const [recentExercises, setRecentExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- GOOGLE CALENDAR ---
  const [isConnected, setIsConnected] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('google');
    const userEmail = params.get('email');

    if (status === 'connected') {
      setIsConnected(true);
      alert(`Kết nối Google thành công với: ${userEmail}`);
      // Xóa params khỏi URL để sạch
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const res = await clientAxios.get('/google/check-status');
      setIsConnected(res.data.data.connected);
    } catch (err) {
      setIsConnected(false);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await clientAxios.get('/google/connect');
      if (res.data && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Lỗi kết nối Google:", err);
      alert("Không thể khởi tạo kết nối Google. Vui lòng đăng nhập lại.");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Stats
        const myStats = await gamificationService.getMyStats();
        if (myStats) setStats(myStats);

        // 2. Fetch Leaderboard
        const lbData = await gamificationService.getLeaderboard(5);
        if (lbData && Array.isArray(lbData)) setLeaderboard(lbData);

        // 3. Fetch History for Chart
        const histData = await gamificationService.getMyHistory(1);
        if (histData && Array.isArray(histData[0])) {
          // Process history to chart data (group by day)
          const transactions = histData[0];
          const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          });
          
          const chartMap = {};
          last7Days.forEach(date => chartMap[date] = 0);

          transactions.forEach(tx => {
            const dateStr = new Date(tx.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            if (chartMap[dateStr] !== undefined && tx.points > 0) {
              chartMap[dateStr] += tx.points;
            }
          });

          const chartArr = last7Days.map(date => ({
            name: date,
            Điểm: chartMap[date]
          }));
          setHistoryChart(chartArr);
        }

        // 4. Fetch Recent Exercises
        const exData = await exerciseService.getMyAttempts(1, 5);
        if (exData && Array.isArray(exData.data)) {
          setRecentExercises(exData.data);
        } else if (exData && Array.isArray(exData)) { // Sometimes structure is [data, total]
          setRecentExercises(Array.isArray(exData[0]) ? exData[0] : exData); 
        }

      } catch (err) {
        console.error("Lỗi lấy dữ liệu Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-8 border-gray-100 border-t-[#2d5a2d] rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-gray-400 uppercase tracking-widest animate-pulse">Đang nạp dữ liệu cá nhân...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2d5a2d] to-[#4ea84e] p-1 shadow-2xl shrink-0">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-white">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-[#2d5a2d]">{user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}</span>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Chào mừng trở lại, <span className="text-[#2d5a2d]">{user?.fullName || user?.username}!</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Hôm nay bạn muốn học gì nào?
              </p>
              
              {/* Google Connect Badge/Button */}
              {!loadingCalendar && (
                isConnected ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Đã đồng bộ Calendar</span>
                  </div>
                ) : (
                  <button onClick={handleConnectGoogle} className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 transition-colors shadow-sm">
                    <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" className="w-3 h-3" alt="gg" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Kết nối Google</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 relative z-10">
          <div className="bg-orange-50 px-6 py-4 rounded-3xl border border-orange-100 flex flex-col items-center justify-center min-w-[120px]">
            <Flame className="text-orange-500 mb-1" size={28} />
            <span className="text-2xl font-black text-orange-600">{stats.currentStreak}</span>
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">Ngày Lửa</span>
          </div>
          <div className="bg-green-50 px-6 py-4 rounded-3xl border border-green-100 flex flex-col items-center justify-center min-w-[120px]">
            <Star className="text-green-600 mb-1" size={28} />
            <span className="text-2xl font-black text-green-700">{stats.currentLevel}</span>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">Cấp Độ</span>
          </div>
          <div className="bg-blue-50 px-6 py-4 rounded-3xl border border-blue-100 flex flex-col items-center justify-center min-w-[120px]">
            <Trophy className="text-blue-500 mb-1" size={28} />
            <span className="text-2xl font-black text-blue-600">{stats.totalPoints}</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Điểm XP</span>
          </div>
        </div>
      </div>

      {/* 2. THỐNG KÊ CHI TIẾT & BIỂU ĐỒ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Biểu đồ điểm số */}
        <KLCard title="Tăng Trưởng Điểm XP" subtitle="7 ngày gần nhất" className="lg:col-span-2">
          {historyChart.length > 0 ? (
            <KLAreaChart data={historyChart} xKey="name" dataKey="Điểm" color="#2d5a2d" />
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
              <Activity size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Chưa có dữ liệu điểm</p>
            </div>
          )}
        </KLCard>

        {/* Bảng Xếp Hạng Mini */}
        <KLCard title="Bảng Vàng" subtitle="Top 5 xuất sắc nhất" action={
          <button onClick={() => navigate('/user/leaderboard')} className="text-xs font-bold text-[#2d5a2d] hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={14}/>
          </button>
        }>
          <div className="space-y-4 mt-2">
            {leaderboard.length > 0 ? leaderboard.map((lbUser, index) => (
              <div key={lbUser.userId || index} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    index === 0 ? "bg-yellow-100 text-yellow-600" :
                    index === 1 ? "bg-slate-200 text-slate-600" :
                    index === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-slate-50 text-slate-400"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{lbUser.user?.fullName || lbUser.user?.username}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Level {lbUser.currentLevel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#2d5a2d]">{lbUser.totalPoints}</span>
                  <span className="text-[10px] font-bold text-slate-400 ml-1">XP</span>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-slate-400 font-bold py-8">Chưa có dữ liệu xếp hạng</p>
            )}
          </div>
        </KLCard>

      </div>

      {/* 3. BÀI TẬP GẦN ĐÂY */}
      <KLCard title="Lịch Sử Làm Bài" subtitle="Các bài tập bạn vừa hoàn thành">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {recentExercises.length > 0 ? recentExercises.map((attempt) => (
            <div key={attempt.id} className="border border-slate-100 rounded-3xl p-5 hover:shadow-lg transition-all bg-slate-50/50 cursor-pointer" onClick={() => navigate(`/user/exercise-attempts`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                  <span className="text-xs font-black text-slate-700">{attempt.score} / 100</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug mb-2">
                {attempt.exercise?.title || "Bài tập"}
              </h3>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-auto pt-4 border-t border-slate-200/60">
                <Clock size={12} />
                {new Date(attempt.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
              <BookOpen size={32} className="mb-3 opacity-20" />
              <p className="font-bold text-sm">Bạn chưa hoàn thành bài tập nào.</p>
              <button onClick={() => navigate('/user/exercises')} className="mt-4 px-6 py-2 bg-[#2d5a2d] text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#1a381a] transition-colors">
                Bắt đầu học ngay
              </button>
            </div>
          )}
        </div>
      </KLCard>
    </div>
  );
}