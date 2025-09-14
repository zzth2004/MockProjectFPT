import MainLayout2 from "../../layout/MainLayout2";

export default function Schedule() {
  // dữ liệu mẫu
  const days = ["MON", "TUES", "WED", "THUR", "FRI", "SAT", "SUN"];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1); // 5 tuần * 7 ngày

  return (
    <MainLayout2>
      <div className="bg-green-300 p-6 rounded-2xl shadow-md">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-6">Schedule</h1>

        {/* Lịch */}
        <div className="grid grid-cols-7 gap-3">
          {/* Hàng tiêu đề (Mon -> Sun) */}
          {days.map((day) => (
            <div
              key={day}
              className="text-center font-bold bg-green-700 text-white py-2 rounded-lg shadow-sm"
            >
              {day}
            </div>
          ))}

          {/* Các ô ngày */}
          {dates.map((date) => (
            <div
              key={date}
              className="bg-green-100 rounded-lg shadow-sm p-2 flex flex-col items-start"
            >
              <span className="text-sm font-bold">{date}</span>
              <span className="text-xs text-gray-700">Học từ vựng bài ...</span>
              <span className="text-xs text-gray-700">Tập nói bài ...</span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout2>
  );
}
