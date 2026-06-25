import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Video, BookOpen,
  Plus, X, Trash2, CheckCircle2, Calendar as CalendarIcon, Clock, ExternalLink, Bell, Loader2
} from "lucide-react";
import clientAxios from "../../../api/axiosAPI";

const ScheduleTeacher = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [googleEvents, setGoogleEvents] = useState([]);
  const [localTasks, setLocalTasks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- FORM STATES ---
  const [newTask, setNewTask] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [useMeet, setUseMeet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notifiedEvents = useRef(new Set());

  const formatDateKey = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const getClassColor = (title) => {
    if (!title) return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", label: "text-gray-800" };
    
    // Clean up title (remove "[KoreanLab]" prefix)
    const cleanTitle = title.replace(/\[KoreanLab\]\s*/i, "").trim();
    
    // Hash function to pick a stable color index
    let hash = 0;
    for (let i = 0; i < cleanTitle.length; i++) {
      hash = cleanTitle.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      { bg: "bg-blue-50 text-blue-700 border-blue-100", label: "text-blue-800" },
      { bg: "bg-purple-50 text-purple-700 border-purple-100", label: "text-purple-800" },
      { bg: "bg-pink-50 text-pink-700 border-pink-100", label: "text-pink-800" },
      { bg: "bg-yellow-50 text-yellow-700 border-yellow-100", label: "text-yellow-800" },
      { bg: "bg-indigo-50 text-indigo-700 border-indigo-100", label: "text-indigo-800" },
      { bg: "bg-cyan-50 text-cyan-700 border-cyan-100", label: "text-cyan-800" },
      { bg: "bg-rose-50 text-rose-700 border-rose-100", label: "text-rose-800" },
      { bg: "bg-[#E4FBE1] text-[#2d5a2d] border-[#d1f7cc]", label: "text-[#2d5a2d]" }
    ];
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const overlapConflict = useMemo(() => {
    if (!selectedDate || !newTask.trim()) return null;
    const datePart = formatDateKey(selectedDate);
    const candStart = new Date(`${datePart}T${startTime}:00`);
    const candEnd = new Date(`${datePart}T${endTime}:00`);
    
    if (candEnd <= candStart) return null;
    
    // Check against Google events
    const conflictingGoogleEvent = googleEvents.find(ev => {
      if (!ev.start || ev.start.length <= 10) return false;
      if (!ev.start.startsWith(datePart)) return false;
      
      const exStart = new Date(ev.start);
      const exEnd = ev.end ? new Date(ev.end) : new Date(exStart.getTime() + 60 * 60000);
      
      return candStart < exEnd && exStart < candEnd;
    });
    
    if (conflictingGoogleEvent) {
      return `Trùng lịch với sự kiện Google Calendar: "${conflictingGoogleEvent.summary}"`;
    }
    
    // Check against local tasks
    const conflictingLocalTask = localTasks.find(task => {
      if (task.date !== datePart) return false;
      
      const exStart = new Date(`${datePart}T${task.time}:00`);
      const taskEndTime = task.endTime || task.time;
      const exEnd = new Date(`${datePart}T${taskEndTime}:00`);
      
      const finalExEnd = exStart.getTime() === exEnd.getTime() 
        ? new Date(exStart.getTime() + 60 * 60000) 
        : exEnd;
        
      return candStart < finalExEnd && exStart < candEnd;
    });
    
    if (conflictingLocalTask) {
      return `Trùng lịch với lịch tự học: "${conflictingLocalTask.title}"`;
    }
    
    return null;
  }, [selectedDate, startTime, endTime, newTask, googleEvents, localTasks]);

  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const res = await clientAxios.get('/google/check-status');
      if (res.data.data.connected) {
        setIsConnected(true);
        fetchGoogleEvents();
      }
    } catch (err) {
      setIsConnected(false);
    }
  };

  const fetchGoogleEvents = async () => {
    try {
      const res = await clientAxios.get('/google/events');
      if (res.data && Array.isArray(res.data.data)) {
        const filtered = res.data.data.filter(ev => !ev.summary.includes("birthday"));
        setGoogleEvents(filtered);
      }
    } catch (err) {
      console.error("Lỗi lấy lịch Google:", err);
    }
  };

  // Logic Thông báo & Glow
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      googleEvents.forEach(ev => {
        if (!ev.meetLink || !ev.start) return;
        const start = new Date(ev.start);
        const diff = (start - now) / (1000 * 60);
        if (diff <= 5 && diff > 0 && !notifiedEvents.current.has(ev.id)) {
          sendNotification(ev);
          notifiedEvents.current.add(ev.id);
        }
      });
    }, 30000);
    return () => clearInterval(timer);
  }, [googleEvents]);

  const sendNotification = (event) => {
    if (Notification.permission === "granted") {
      new Notification("Sắp đến giờ học!", {
        body: `Lớp "${event.summary}" sẽ bắt đầu sau 5 phút nữa.`,
        icon: "/iconsd.svg"
      }).onclick = () => { window.focus(); if (event.meetLink) window.open(event.meetLink, "_blank"); };
    }
  };

  const isGlowing = (startTimeStr) => {
    if (!startTimeStr || startTimeStr.length <= 10) return false;
    const now = new Date();
    const start = new Date(startTimeStr);
    const diff = (start - now) / (1000 * 60);
    return diff <= 5 && diff >= -15; // Sáng lên trước 5p và sáng trong 15p đầu buổi
  };

  // --- HÀM LƯU LỊCH CHÍNH ---
  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    if (overlapConflict) {
      alert(`⚠️ Không thể tạo: ${overlapConflict}`);
      return;
    }

    // 1. Tính toán duration (phút) từ startTime và endTime
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const durationMinutes = (end - start) / (1000 * 60);

    if (durationMinutes <= 0) {
      alert("Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }

    const datePart = formatDateKey(selectedDate);
    const fullDateTimeString = `${datePart}T${startTime}:00`;

    if (isConnected) {
      setIsSubmitting(true);
      const newTaskContent = "[KoreanLab] " + newTask;
      try {
        const payload = {
          title: newTaskContent,
          date: fullDateTimeString,
          createMeet: useMeet,
          duration: durationMinutes // Gửi số phút đã tính toán
        };

        const res = await clientAxios.post('/google/create-event', payload);

        if (res.data.status === 'success') {
          await fetchGoogleEvents();
          setNewTask("");
          setUseMeet(false);
          alert("✅ Đã tạo lịch thành công!");
        }
      } catch (err) {
        console.error(err);
        saveToLocal();
      } finally {
        setIsSubmitting(false);
      }
    } else {
      saveToLocal();
    }
  };

  const saveToLocal = () => {
    const newTaskObj = {
      id: Date.now(),
      date: formatDateKey(selectedDate),
      time: startTime,
      endTime: endTime,
      title: newTask,
      type: "SELF_STUDY",
      isCompleted: false
    };
    setLocalTasks([...localTasks, newTaskObj]);
    setNewTask("");
  };

  const handleDayClick = (dateObj) => {
    setSelectedDate(dateObj);
    setIsModalOpen(true);
    setNewTask("");
    setStartTime("08:00");
    setEndTime("09:00");
  };

  const { days, firstDayIndex } = (() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const d = new Date(year, month + 1, 0).getDate();
    const first = new Date(year, month, 1).getDay();
    return { days: d, firstDayIndex: first === 0 ? 6 : first - 1 };
  })();

  return (
    <div className="w-full min-h-screen font-sans pt-2 pb-8 bg-[#F5F7FA] px-4 md:px-0">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Schedule</h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            {isConnected && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
            <p className="text-sm font-medium">{isConnected ? 'Synced with Google Calendar' : 'Local Mode'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-lg font-black text-gray-800 min-w-[140px] text-center uppercase tracking-tighter">
            {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* --- CALENDAR GRID --- */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-7 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className={`text-center font-black text-xs uppercase tracking-widest ${i >= 5 ? 'text-red-400' : 'text-gray-400'}`}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty-${i}`} className="h-28 md:h-36 bg-gray-50/50 rounded-3xl"></div>)}

          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateStr = formatDateKey(dateObj);
            const dayItems = [
              ...googleEvents.filter(e => e.start?.startsWith(dateStr)),
              ...localTasks.filter(t => t.date === dateStr)
            ];
            const isToday = dateStr === formatDateKey(new Date());

            return (
              <div
                key={day}
                onClick={() => handleDayClick(dateObj)}
                className={`h-28 md:h-36 rounded-3xl border-2 p-2 flex flex-col gap-1 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 ${isToday ? 'bg-green-50/40 border-[#377437]' : 'bg-white border-transparent hover:border-green-200'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-sm font-black ${isToday ? 'bg-[#377437] text-white' : 'text-gray-400'}`}>{day}</span>
                  {dayItems.length > 0 && <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-lg text-gray-500 font-black">{dayItems.length}</span>}
                </div>
                <div className="flex-1 overflow-hidden flex flex-col gap-1">
                  {dayItems.slice(0, 2).map((item, idx) => {
                    const colorClasses = getClassColor(item.summary || item.title);
                    return (
                      <div key={idx} className={`px-2 py-1 rounded-lg text-[9px] font-black truncate uppercase tracking-tighter border ${colorClasses.bg}`}>
                        {item.summary || item.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- DAY DETAIL MODAL --- */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white">

            <div className="bg-[#377437] p-8 text-white flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-2 opacity-80 text-xs font-black uppercase tracking-widest mb-1">
                  <CalendarIcon size={14} /> <span>{selectedDate.getFullYear()} Schedule</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 hover:bg-white/30 p-2.5 rounded-2xl transition-all"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#FDFDFD]">
              {[
                ...googleEvents.filter(e => e.start?.startsWith(formatDateKey(selectedDate))),
                ...localTasks.filter(t => t.date === formatDateKey(selectedDate))
              ].length === 0 ? (
                <div className="text-center py-12 text-gray-300 font-black uppercase text-xs tracking-[0.2em]">No events scheduled</div>
              ) : (
                <>
                  {[
                    ...googleEvents.filter(e => e.start?.startsWith(formatDateKey(selectedDate))),
                    ...localTasks.filter(t => t.date === formatDateKey(selectedDate))
                  ].map(ev => {
                    const isGoogle = !ev.hasOwnProperty('isCompleted');
                    const timeStr = isGoogle ? ev.start : `${ev.date}T${ev.time}:00`;
                    const glowing = isGlowing(timeStr);
                    const time = (timeStr && timeStr.length > 10) 
                      ? new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : 'All Day';
                    const colorClasses = getClassColor(ev.summary || ev.title);
                    return (
                      <div key={ev.id} className="flex gap-4 items-center group">
                        <div className="w-14 text-right shrink-0 font-black text-[11px] text-gray-400 uppercase">{time}</div>
                        <div className={`flex-1 p-4 rounded-3xl border-2 flex items-center justify-between gap-3 transition-all duration-500 ${glowing ? 'bg-white border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse scale-[1.02]' : `bg-white ${colorClasses.bg} border-gray-100`}`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white rounded-2xl shadow-sm text-gray-700">
                              {ev.meetLink ? <Video size={18} /> : <CalendarIcon size={18} />}
                            </div>
                            <div>
                              <h4 className={`font-black text-sm uppercase tracking-tight ${colorClasses.label}`}>{ev.summary || ev.title}</h4>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                {isGoogle ? 'Google Calendar' : 'Local Schedule'}
                              </p>
                            </div>
                          </div>
                          {ev.meetLink && (
                            <a href={ev.meetLink} target="_blank" className={`p-2.5 rounded-xl transition-all ${glowing ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-300 border border-gray-100 hover:text-green-600'}`}><ExternalLink size={16} /></a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* --- FOOTER: NHẬP LIỆU CÓ THÊM CỘT THỜI GIAN --- */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/80 shrink-0">
              <div className="flex flex-col gap-4">
                {overlapConflict && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-2xl border border-red-100 flex items-center gap-2 text-left animate-in slide-in-from-bottom-2 duration-300">
                    <Bell size={14} className="shrink-0 animate-bounce" />
                    <span>{overlapConflict}</span>
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  {/* 1. Ô nhập tên bài học */}
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Tên bài học</span>
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="VD: Lớp Tiếng Hàn Sơ Cấp 1..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#377437] bg-white shadow-sm"
                    />
                  </div>

                  {/* 2. Ô chọn giờ bắt đầu */}
                  <div className="w-28 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Bắt đầu</span>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-2 py-3 text-sm font-black outline-none focus:border-[#377437] bg-white"
                      />
                    </div>
                  </div>

                  {/* 3. Ô chọn giờ kết thúc */}
                  <div className="w-28 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Kết thúc</span>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-2 py-3 text-sm font-black outline-none focus:border-[#377437] bg-white"
                      />
                    </div>
                  </div>

                  {/* Nút lưu */}
                  <button
                    onClick={handleAddTask}
                    disabled={isSubmitting || !newTask.trim() || !!overlapConflict}
                    className="bg-[#377437] hover:bg-green-800 text-white p-3.5 rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300"
                  >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={24} />}
                  </button>
                </div>

                {/* Toggle Meet */}
                {isConnected && (
                  <div className="flex items-center justify-between bg-white/50 p-3 rounded-2xl border border-white">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => setUseMeet(!useMeet)}
                        className={`w-10 h-5 rounded-full transition-all relative border-2 ${useMeet ? 'bg-[#377437] border-[#377437]' : 'bg-gray-200 border-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${useMeet ? 'left-5.5' : 'left-0.5'}`}></div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Tự động tạo Google Meet cho buổi học này</span>
                    </label>
                    <Bell size={16} className={useMeet ? "text-[#377437] animate-bounce" : "text-gray-200"} />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTeacher;