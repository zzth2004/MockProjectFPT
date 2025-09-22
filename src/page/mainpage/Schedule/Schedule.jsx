import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout2 from "../../../layout/MainLayout2";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Schedule() {
  const days = ["MON", "TUES", "WED", "THUR", "FRI", "SAT", "SUN"];
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [viewMode, setViewMode] = useState("desktop"); // mobile | tablet | desktop

  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 768) setViewMode("mobile");
      else if (window.innerWidth < 1024) setViewMode("tablet");
      else setViewMode("desktop");
    };
    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, []);

  const formatDate = (date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${d}/${m}`;
  };

  const currentDayIndex = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDayIndex);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const totalDays = lastDayOfMonth.getDate();
  const totalCells = Math.ceil((startDay + totalDays) / 7) * 7;

  const monthDates = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDay + 1;
    if (dayNum > 0 && dayNum <= totalDays) {
      return new Date(year, month, dayNum);
    }
    return new Date(
      year,
      dayNum <= 0 ? month - 1 : month + 1,
      dayNum <= 0
        ? new Date(year, month, 0).getDate() + dayNum
        : dayNum - totalDays
    );
  });

  const sampleDay = {
    date: currentDate,
    tasks: [
      "Học từ vựng bài 10",
      "Tập nói bài 10",
      "Làm quiz ngữ pháp thì hiện tại hoàn thành",
      "Nghe podcast chủ đề đời sống",
    ],
  };

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "mobile") d.setDate(d.getDate() - 1);
    else if (viewMode === "tablet") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "mobile") d.setDate(d.getDate() + 1);
    else if (viewMode === "tablet") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  return (
    <MainLayout2>
      <div className="bg-green-300 p-6 rounded-2xl shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrev} className="px-3 py-1 bg-white hover:bg-green-700 text-gray-500 hover:text-white rounded-lg">
            <ChevronLeft size={30} />
          </button>
          <h1 className="text-2xl font-bold text-black">
            {viewMode === "mobile" && formatDate(currentDate)}
            {viewMode === "tablet" && `Tuần của ${formatDate(startOfWeek)}`}
            {viewMode === "desktop" &&
              new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" })}
          </h1>
          <button onClick={handleNext} className="px-3 py-1  bg-white hover:bg-green-700 text-gray-500 hover:text-white  rounded-lg">
            <ChevronRight size={30} />
          </button>
        </div>

        {/* Mobile */}
        <div className="block md:hidden">
          <Link to={`/user/schedule/${sampleDay.date.toISOString().split("T")[0]}`}>
            <div className="bg-green-100 rounded-lg shadow-sm p-4">
              <span className="text-lg font-bold text-gray-800">
                {formatDate(sampleDay.date)}
              </span>
              <ul className="mt-3 list-disc list-inside space-y-2">
                {sampleDay.tasks.map((task, idx) => (
                  <li key={idx} className="text-base text-gray-700">
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        </div>

        {/* Tablet */}
        <div className="hidden md:grid lg:hidden grid-cols-12 gap-4">
          {weekDates.map((date, idx) => (
            <Link
              key={idx}
              to={`/user/schedule/${date.toISOString().split("T")[0]}`}
              className="col-span-3 bg-green-100 rounded-lg shadow-sm p-4 flex flex-col items-start"
            >
              <span className="text-lg font-bold text-gray-800">{formatDate(date)}</span>
              <span className="text-base text-gray-700">Học từ vựng bài ...</span>
              <span className="text-base text-gray-700">Tập nói bài ...</span>
            </Link>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden lg:grid grid-cols-7 gap-3">
          {days.map((day) => (
            <div
              key={day}
              className="text-center font-bold bg-green-700 text-white py-3 rounded-lg shadow-sm text-lg"
            >
              {day}
            </div>
          ))}

          {monthDates.map((date, idx) => {
            const isCurrentMonth = date.getMonth() === month;
            return (
              <Link
                key={idx}
                to={`/user/schedule/${date.toISOString().split("T")[0]}`}
                className={`rounded-lg shadow-sm p-3 flex flex-col items-start min-h-[100px] ${isCurrentMonth ? "bg-green-100" : "bg-gray-200"
                  }`}
              >
                <span className="text-lg font-bold">{formatDate(date)}</span>
                {isCurrentMonth && (
                  <>
                    <span className="text-base text-gray-700">Học từ vựng bài ...</span>
                    <span className="text-base text-gray-700">Tập nói bài ...</span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </MainLayout2>
  );
}
