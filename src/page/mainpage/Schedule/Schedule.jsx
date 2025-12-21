import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, ChevronRight, Video, BookOpen, 
  Plus, X, Trash2, CheckCircle2, Calendar as CalendarIcon, Clock
} from "lucide-react";

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  
  // State quản lý Modal Chi Tiết Ngày
  const [selectedDate, setSelectedDate] = useState(null); // Ngày đang chọn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState("");

  // 1. Mock Data: Lịch học cố định (Class Schedule)
  const fixedClasses = [
    {
      id: "c1",
      name: "Korean Basic 1",
      scheduleDays: [1, 3, 5], // T2, T4, T6
      time: "19:00",
      duration: "90 min",
      platform: "Zoom"
    }
  ];

  const formatDateKey = (date) => date.toISOString().split('T')[0];

  // 2. Tự động tạo lịch học
  useEffect(() => {
    const generateClassEvents = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let generatedEvents = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dayOfWeek = dateObj.getDay();
        const dateKey = formatDateKey(dateObj);

        fixedClasses.forEach(course => {
          if (course.scheduleDays.includes(dayOfWeek)) {
            generatedEvents.push({
              id: `class-${dateKey}`,
              date: dateKey,
              title: course.name,
              time: course.time,
              duration: course.duration,
              type: "CLASS",
              isCompleted: false
            });
          }
        });
      }
      
      setEvents(prev => {
        const userTasks = prev.filter(e => e.type === "SELF_STUDY");
        return [...userTasks, ...generatedEvents];
      });
    };
    generateClassEvents();
  }, [currentDate]);

  // --- ACTIONS ---

  const handleDayClick = (dateObj) => {
    setSelectedDate(dateObj);
    setIsModalOpen(true);
    setNewTask("");
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const newEvent = {
      id: Date.now(),
      date: formatDateKey(selectedDate),
      title: newTask,
      type: "SELF_STUDY",
      isCompleted: false
    };
    setEvents([...events, newEvent]);
    setNewTask("");
  };

  const handleDelete = (id) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const handleToggle = (id) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, isCompleted: !ev.isCompleted } : ev));
  };

  // Lấy sự kiện của ngày đang chọn trong Modal
  const currentDayEvents = selectedDate 
    ? events.filter(e => e.date === formatDateKey(selectedDate)) 
    : [];

  // --- CALENDAR HELPERS ---
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
    return { days, firstDayIndex };
  };
  const { days, firstDayIndex } = getDaysInMonth();

  return (
    <div className="w-full min-h-screen font-sans pt-2 pb-8 bg-[#F5F7FA] px-4 md:px-0 relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Schedule</h1>
            <p className="text-gray-500 mt-1">Click on a date to see details</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20}/></button>
            <span className="text-lg font-bold text-gray-800 min-w-[140px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* --- CALENDAR GRID --- */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-7 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className={`text-center font-bold text-sm uppercase tracking-wider ${i >= 5 ? 'text-red-400' : 'text-gray-400'}`}>{day}</div>
            ))}
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-4">
            {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty-${i}`} className="h-28 md:h-36 bg-gray-50/50 rounded-2xl"></div>)}

            {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateStr = formatDateKey(dateObj);
                const dayEvents = events.filter(e => e.date === dateStr);
                const isToday = dateStr === formatDateKey(new Date());

                return (
                    <div 
                        key={day} 
                        onClick={() => handleDayClick(dateObj)}
                        className={`
                            h-28 md:h-36 rounded-2xl border p-2 flex flex-col gap-1 transition-all cursor-pointer hover:shadow-md hover:-translate-y-1
                            ${isToday ? 'bg-green-50/40 border-[#377437]' : 'bg-white border-gray-100 hover:border-green-300'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-[#377437] text-white' : 'text-gray-700'}`}>
                                {day}
                            </span>
                            {/* Đếm số task */}
                            {dayEvents.length > 0 && (
                                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">
                                    {dayEvents.length}
                                </span>
                            )}
                        </div>

                        {/* Preview List (Tối đa 2 dòng) */}
                        <div className="flex-1 overflow-hidden flex flex-col gap-1">
                            {dayEvents.slice(0, 2).map((ev) => (
                                <div key={ev.id} className={`px-2 py-1 rounded-md text-[10px] font-bold truncate ${ev.type === 'CLASS' ? 'bg-[#377437] text-white' : 'bg-orange-100 text-orange-700'}`}>
                                    {ev.title}
                                </div>
                            ))}
                            {dayEvents.length > 2 && <div className="text-[10px] text-gray-400 pl-1">+ {dayEvents.length - 2} more</div>}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* --- DAY DETAIL MODAL --- */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl transform transition-all scale-100 overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Modal Header */}
                <div className="bg-[#377437] p-6 text-white flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-2 opacity-90 text-sm font-medium mb-1">
                            <CalendarIcon size={16} />
                            <span>{selectedDate.getFullYear()}</span>
                        </div>
                        <h2 className="text-3xl font-bold">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h2>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Event List Container */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    
                    {currentDayEvents.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 italic">No schedules for this day.</div>
                    ) : (
                        currentDayEvents.map(ev => (
                            <div key={ev.id} className="flex gap-4 group">
                                {/* Time Column */}
                                <div className="w-16 pt-1 text-right shrink-0">
                                    <span className="text-xs font-bold text-gray-500 block">
                                        {ev.type === 'CLASS' ? ev.time : 'All Day'}
                                    </span>
                                    {ev.type === 'CLASS' && <span className="text-[10px] text-gray-400">{ev.duration}</span>}
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 p-3 rounded-xl border flex items-start gap-3 transition-colors ${ev.type === 'CLASS' ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}>
                                    <div className={`mt-0.5 ${ev.type === 'CLASS' ? 'text-[#377437]' : 'text-orange-400'}`}>
                                        {ev.type === 'CLASS' ? <Video size={20}/> : 
                                            <button onClick={() => handleToggle(ev.id)}>
                                                <CheckCircle2 size={20} className={ev.isCompleted ? "fill-green-500 text-white" : ""}/>
                                            </button>
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold text-gray-800 ${ev.isCompleted ? 'line-through text-gray-400' : ''}`}>{ev.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">
                                            {ev.type === 'CLASS' ? 'Online Class • Zoom' : 'Self Study Plan'}
                                        </p>
                                    </div>
                                    
                                    {/* Delete Button (Self Study only) */}
                                    {ev.type === 'SELF_STUDY' && (
                                        <button onClick={() => handleDelete(ev.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add New Task Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                            placeholder="Add a new task..." 
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#377437] focus:ring-1 focus:ring-[#377437] bg-white transition-all"
                        />
                        <button 
                            onClick={handleAddTask}
                            className="bg-[#377437] hover:bg-green-800 text-white p-3 rounded-xl shadow-md transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default Schedule;