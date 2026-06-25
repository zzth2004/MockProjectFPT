import React, { useState, useEffect } from "react";
import {
  Medal, Star, Coins, ChevronLeft, ChevronRight, Heart,
  BookOpen, Globe, Timer, Link2, Video, Clock, ExternalLink,
  Calendar as CalendarIcon, Sparkles, AlertCircle, Loader2, Zap
} from "lucide-react";
import { Line } from "react-chartjs-2";
import clientAxios from "../../api/axiosAPI";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { KLDonutChart } from "../../AdminControl/Chart/chart";
// Đăng ký ChartJS
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler
);

// --- MOCKUP ẢNH (Thay bằng path của bạn) ---
import testImg from "../../assets/test.png";
import quizzImg from "../../assets/quizz.png";
import vocabImg from "../../assets/vocab.png";

const Dashboard = () => {
  // --- STATE CHO GOOGLE CALENDAR ---
  const [isConnected, setIsConnected] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [events, setEvents] = useState([]);
  const [viewType, setViewType] = useState("week"); // week | month | year
  const [statsData, setStatsData] = useState(new Array(7).fill(0));
  const [statsLabels, setStatsLabels] = useState(["T2", "T3", "T4", "T5", "T6", "T7", "CN"]);
  const [loadingStats, setLoadingStats] = useState(false);


  const [skillStats, setSkillStats] = useState([]); // Khởi tạo là mảng []
  const [streak, setStreak] = useState(0);
  // Dữ liệu thô đã lọc từ Google
  const [studyEvents, setStudyEvents] = useState([]);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isOnFire, setIsOnFire] = useState(false);


  // --- TÍNH PHÂN BỔ KỸ NĂNG ---
  const calculateSkillDistribution = (events) => {
    const distribution = { "Từ vựng": 0, "Ngữ pháp": 0, "Giao tiếp": 0, "Luyện nghe": 0, "Khác": 0 };

    events.forEach(ev => {
      const title = (ev.summary || "").toLowerCase();
      if (title.includes("vựng") || title.includes("vocab")) distribution["Từ vựng"] += ev.duration;
      else if (title.includes("pháp") || title.includes("grammar")) distribution["Ngữ pháp"] += ev.duration;
      else if (title.includes("nói") || title.includes("meet") || title.includes("speaking")) distribution["Giao tiếp"] += ev.duration;
      else if (title.includes("nghe") || title.includes("listening")) distribution["Luyện nghe"] += ev.duration;
      else distribution["Khác"] += ev.duration;
    });

    // Chuyển đổi object thành mảng các object cho Recharts
    const formattedData = Object.entries(distribution)
      .filter(([_, value]) => value > 0) // Chỉ lấy những mục có thời gian học
      .map(([name, value]) => ({
        name: name,
        value: value
      }));

    setSkillStats(formattedData);
  };
  // --- 2. TÍNH STREAK 🔥 ---
  const calculateStreak = (events) => {
    if (!events || events.length === 0) {
      setStreak(0);
      setMaxStreak(0);
      setIsOnFire(false);
      return;
    }

    // 1. Lấy danh sách ngày duy nhất (YYYY-MM-DD), sắp xếp từ mới nhất đến cũ nhất
    const studyDates = [...new Set(events.map(ev => ev.start.split('T')[0]))]
      .sort((a, b) => new Date(b) - new Date(a));

    const msPerDay = 1000 * 60 * 60 * 24;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // --- BƯỚC 1: TÍNH KỶ LỤC (MAX STREAK) TRONG QUÁ KHỨ ---
    let globalMax = 0;
    let tempMax = 1;

    for (let i = 0; i < studyDates.length; i++) {
      const d1 = new Date(studyDates[i]);
      const d2 = studyDates[i + 1] ? new Date(studyDates[i + 1]) : null;

      if (d2) {
        const diff = (d1 - d2) / msPerDay;
        if (Math.round(diff) === 1) {
          tempMax++;
        } else {
          if (tempMax > globalMax) globalMax = tempMax;
          tempMax = 1;
        }
      } else {
        if (tempMax > globalMax) globalMax = tempMax;
      }
    }
    setMaxStreak(globalMax);

    // --- BƯỚC 2: TÍNH CHUỖI HIỆN TẠI (CURRENT STREAK) ---
    const mostRecentStudyDate = new Date(studyDates[0]);
    mostRecentStudyDate.setHours(0, 0, 0, 0);

    // Kiểm tra xem lần cuối học là Hôm nay hoặc Hôm qua
    const isStudiedToday = mostRecentStudyDate.getTime() === today.getTime();
    const isStudiedYesterday = mostRecentStudyDate.getTime() === yesterday.getTime();

    if (isStudiedToday || isStudiedYesterday) {
      let currentS = 0;
      // Tính ngược từ ngày học gần nhất về quá khứ
      for (let i = 0; i < studyDates.length; i++) {
        const d1 = new Date(studyDates[i]);
        const d2 = studyDates[i + 1] ? new Date(studyDates[i + 1]) : null;

        currentS++;

        if (d2) {
          const diff = (d1 - d2) / msPerDay;
          if (Math.round(diff) !== 1) break; // Bị ngắt quãng
        }
      }
      setStreak(currentS);
      setIsOnFire(true);
    } else {
      // Đã quá 1 ngày không học -> Đứt chuỗi
      setStreak(0);
      setIsOnFire(false);
    }
  };
  // --- 3. VẼ BIỂU ĐỒ LINE ---
  const processChartData = (events, type) => {
    let labels = [];
    let dataPoints = [];

    if (type === "week") {
      labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
      dataPoints = new Array(7).fill(0);
      events.forEach(ev => {
        const idx = ev.weekday === 0 ? 6 : ev.weekday - 1;
        if (idx >= 0 && idx < 7) dataPoints[idx] += (ev.duration || 0);
      });
    } else if (type === "month") {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      dataPoints = new Array(daysInMonth).fill(0);
      events.forEach(ev => {
        if (ev.day) dataPoints[ev.day - 1] += (ev.duration || 0);
      });
    } else {
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      dataPoints = new Array(12).fill(0);
      events.forEach(ev => {
        if (ev.month) dataPoints[ev.month - 1] += (ev.duration || 0);
      });
    }

    setStatsLabels(labels);
    setStatsData(dataPoints);
  };

  // --- 4. FETCH VÀ LỌC DỮ LIỆU ---
  const fetchAnalytics = async (type) => {
    try {
      setLoadingStats(true);
      const res = await clientAxios.get(`/google/analytics?type=${type}`);

      const rawEvents = res.data?.data?.data;
      if (!Array.isArray(rawEvents)) {
        processChartData([], type);
        return;
      }

      // SỬA LỖI: Chuyển sang mảng để dùng được .some()
      const learningKeywords = ['[koreanlab]', 'học', 'study', 'tiếng hàn'];

      const filteredData = rawEvents.filter(ev => {
        const summary = (ev.summary || "").toLowerCase();
        // Kiểm tra xem tiêu đề có chứa bất kỳ từ khóa nào không
        return learningKeywords.some(key => summary.includes(key.toLowerCase()));
      });

      // CẬP NHẬT STATE CHUNG
      setStudyEvents(filteredData);
      // Gửi dữ liệu đã lọc đi vẽ biểu đồ
      processChartData(filteredData, type);

    } catch (err) {
      console.error("Lỗi lấy thống kê:", err);
      processChartData([], type);
    } finally {
      setLoadingStats(false);
    }
  };

  // --- 5. EFFECTS ---
  // Tự động tính toán lại Streak và Kỹ năng khi studyEvents thay đổi
  useEffect(() => {
    if (studyEvents.length > 0) {
      calculateSkillDistribution(studyEvents);
      calculateStreak(studyEvents);
    }
  }, [studyEvents]);

  // Fetch dữ liệu khi đổi Tab hoặc khi trang load
  useEffect(() => {
    if (isConnected) fetchAnalytics(viewType);
  }, [viewType, isConnected]);
  // --- CONFIG BIỂU ĐỒ ĐƯỜNG ---
  const lineChartData = {
    labels: statsLabels,
    datasets: [
      {
        label: "Số phút học",
        data: statsData,
        borderColor: "#377437", // Đổi sang màu xanh thương hiệu
        backgroundColor: "rgba(55, 116, 55, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: viewType === "month" ? 2 : 5, // Tháng nhiều điểm nên làm nhỏ lại
        pointBackgroundColor: "#fff",
        borderWidth: 3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.parsed.y} phút học`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9CA3AF", font: { weight: 'bold' } } },
      y: {
        beginAtZero: true,
        ticks: { color: "#9CA3AF", font: { weight: 'bold' } }
      },
    },
  };


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('google');
    const userEmail = params.get('email');

    if (status === 'connected') {
      // 1. Cập nhật UI ngay lập tức
      setIsConnected(true);

      // 2. Thông báo cho người dùng (Dùng Toast hoặc Alert)
      alert(`Kết nối thành công với: ${userEmail}`);

      // 3. Xóa các tham số trên URL để URL sạch sẽ (về lại /dashboard)
      window.history.replaceState({}, document.title, window.location.pathname);

      // 4. Gọi hàm lấy danh sách sự kiện mới nhất
      fetchEvents();
    }
  }, []);
  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const res = await clientAxios.get('/google/check-status');
      console.log("Google Connection Status:", res.data);
      setIsConnected(res.data.data.connected);
      if (res.data.data.connected) fetchEvents();
      console.log("Google Calendar connection status:", res.data.data.connected);
    } catch (err) {
      setIsConnected(false);
    } finally {
      setLoadingCalendar(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await clientAxios.get('/google/events');
      console.log("Lịch học nhận được từ Google:", res.data);
      // Nếu Backend trả về mảng, cập nhật state
      console.log("Dữ liệu lịch học:", res.data.data);
      if (Array.isArray(res.data.data)) {
        const studyEvents = res.data.data.filter(event =>
          event.summary !== "Happy birthday!" &&
          event.summary !== "Sinh nhật" &&
          !event.id.includes('birthday') // Google thường để chữ birthday trong ID
        );
        setEvents(studyEvents);
      }
    } catch (err) {
      console.error("Lỗi lấy lịch:", err);
      if (err.response?.status === 401) {
        // Nếu lỗi 401 (hết hạn), có thể set lại isConnected = false 
        // để người dùng nhấn kết nối lại hoặc tự động gọi refresh ở Backend
        setIsConnected(false);
      }
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await clientAxios.get('/google/connect');

      // 2. Nhận link từ Backend và chuyển hướng trình duyệt
      if (res.data && res.data.url) {
        // Chuyển hướng sang trang login của Google (link ngoại sàn)
        // Cách này không bị React Router chặn
        console.log("Chuyển hướng đến:", res.data.url);
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Lỗi kết nối Google:", err);
      alert("Không thể khởi tạo kết nối Google. Vui lòng đăng nhập lại.");
    }
  };
  return (
    <div className="w-full min-h-screen font-sans flex flex-col gap-8 pb-10">

      {/* --- PHẦN 1: LỊCH HỌC GOOGLE (THAY THẾ PHẦN TRÊN BIỂU ĐỒ) --- */}
      <div className="relative bg-white rounded-[2.5rem] p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

            {/* Cột trái: Thông tin kết nối */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                  <CalendarIcon size={20} /> Lịch học thông minh
                </h2>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                {isConnected ? "Tự động đồng bộ với Google Calendar của bạn" : "Kết nối để AI tự động sắp xếp lịch và tạo link Meet"}
              </p>
            </div>

            {/* Cột phải: Nút hành động */}
            {!isConnected ? (
              <button
                onClick={handleConnectGoogle}
                className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-gray-50 transition-all active:scale-95"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" className="w-5 h-5" alt="gg" />
                Kết nối Google ngay
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Trạng thái</p>
                  <p className="text-xs font-black text-[#377437] uppercase">Đã đồng bộ</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#377437]">
                  <Sparkles size={20} />
                </div>
              </div>
            )}
          </div>

          {/* Danh sách sự kiện (Dạng Row ngang) */}
          {isConnected && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              {events.length > 0 ? events.slice(0, 4).map(event => (
                <div key={event.id} className="bg-white/60 p-5 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Clock size={16} />
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase italic">Upcoming</span>
                  </div>
                  <h4 className="text-sm font-black text-gray-800 line-clamp-1 mb-1">{event.summary}</h4>
                  <p className="text-[11px] font-bold text-gray-400 uppercase mb-4">
                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(event.start).toLocaleDateString('vi-VN')}
                  </p>
                  {event.meetLink && (
                    <a href={event.meetLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-[#377437] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100">
                      <Video size={12} /> Vào lớp
                    </a>
                  )}
                </div>
              )) : (
                <div className="col-span-full py-10 flex flex-col items-center opacity-30">
                  <AlertCircle size={40} />
                  <p className="text-xs font-black uppercase tracking-widest mt-2">Không có lịch học sắp tới</p>
                </div>
              )}
            </div>
          )}
      </div>

      {/* --- PHẦN 2: BIỂU ĐỒ THỐNG KÊ --- */}
      {/* CONTAINER TỔNG - Lưới 12 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">

        {/* BÊN TRÁI: BIỂU ĐỒ LINE (CHIẾM 8 CỘT) */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
          {loadingStats && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#377437]" size={32} />
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase flex items-center gap-2">
                Thống kê học tập <div className="w-2 h-2 rounded-full bg-[#377437]" />
              </h2>
              <p className="text-sm text-gray-400 font-medium mt-1">Dữ liệu thời gian thực từ Google Calendar</p>
            </div>

            {/* BỘ CHỌN TYPE: TUẦN / THÁNG / NĂM */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
              {["week", "month", "year"].map((type) => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewType === type
                      ? "bg-white text-[#377437] shadow-sm scale-105"
                      : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {type === 'week' ? 'Tuần' : type === 'month' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[300px] w-full mt-auto">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* BÊN PHẢI: PHÂN BỔ KỸ NĂNG (CHIẾM 4 CỘT) */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col transition-all duration-300 hover:shadow-md">
          <div className="mb-8">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Kỹ năng</h3>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Skill Distribution</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-[280px]">
            <KLDonutChart data={skillStats} />

            {/* TEXT Ở GIỮA BIỂU ĐỒ TRÒN */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -translate-y-4">
              <span className="text-4xl font-black text-gray-800 tracking-tighter">
                {studyEvents.length}
              </span>
              <div className="h-[2px] w-4 bg-[#377437] my-1 rounded-full" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Buổi học</span>
            </div>
          </div>

          {/* Footer nhỏ bên dưới biểu đồ kỹ năng nếu cần */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex justify-center">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Learning Analytics</span>
          </div>
        </div>

      </div>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-6">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
          <Zap size={32} fill="currentColor" />
        </div>
        <div>
          <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest">Learning Streak</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-800">{streak}</span>
            <span className="text-sm font-bold text-gray-500 uppercase">Ngày liên tiếp</span>
          </div>
        </div>
        {streak > 0 && (
          <div className="ml-auto animate-bounce text-orange-500 font-black flex items-center gap-1">
            🔥 <span className="text-xs">ON FIRE!</span>
          </div>
        )}
      </div>

      {/* --- PHẦN 3: WORD SETS --- */}
      <div>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest flex items-center gap-3">
            <BookOpen size={20} className="text-blue-500" /> Bộ từ vựng
          </h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-gray-800 shadow-sm transition"><ChevronLeft size={20} /></button>
            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-gray-800 shadow-sm transition"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Vocabulary */}
          <div className="relative h-52 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-pink-100 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]"></div>
            <button className="absolute top-6 right-6 bg-white/30 backdrop-blur-sm p-3 rounded-2xl hover:bg-white/50 transition">
              <Heart className="w-5 h-5 text-white fill-white" />
            </button>
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
              <h3 className="text-white text-2xl font-black tracking-wide drop-shadow-md">Vocabulary</h3>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">3500 Words • 85% Mastered</p>
            </div>
            <img src={vocabImg} className="absolute bottom-6 right-6 w-28 h-28 object-contain group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 rounded-3xl" alt="vocab" />
          </div>

          {/* Card Quizzet */}
          <div className="relative h-52 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-purple-100 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C471ED] to-[#F64F59]"></div>
            <button className="absolute top-6 right-6 bg-white/30 backdrop-blur-sm p-3 rounded-2xl hover:bg-white/50 transition">
              <Heart className="w-5 h-5 text-white fill-white" />
            </button>
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
              <h3 className="text-white text-2xl font-black tracking-wide drop-shadow-md">Quizzet</h3>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">12 Topics • Daily Challenge</p>
            </div>
            <img src={quizzImg} className="absolute bottom-4 right-4 w-32 h-32 object-contain group-hover:rotate-12 transition-transform duration-500 rounded-3xl" alt="quizz" />
          </div>

          {/* Card Test */}
          <div className="relative h-52 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4facfe] to-[#00f2fe]"></div>
            <button className="absolute top-6 right-6 bg-white/30 backdrop-blur-sm p-3 rounded-2xl hover:bg-white/50 transition">
              <Heart className="w-5 h-5 text-white fill-white" />
            </button>
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
              <h3 className="text-white text-2xl font-black tracking-wide drop-shadow-md">Final Test</h3>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Level B1 • 45 Minutes</p>
            </div>
            <img src={testImg} className="absolute bottom-6 right-6 w-28 h-28 object-contain group-hover:-translate-y-3 transition-transform duration-500 rounded-3xl" alt="test" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;