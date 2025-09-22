import { BookOpen } from "lucide-react";

const NestedDonutChart = ({ data, centerIcon: CenterIcon = BookOpen, centerValue }) => {
  const baseRadius = 15.9155; // bán kính chuẩn (SVG 36x36)
  const ringGap = 3;          // khoảng cách giữa các vòng

  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col items-center justify-center md:col-span-9">
      {/* Chart */}
      <div className="relative w-56 h-56">
        <svg className="w-56 h-56" viewBox="0 0 36 36">
          {data.map((item, index) => {
            const radius = baseRadius - index * ringGap; // vòng trong nhỏ hơn
            const circumference = 2 * Math.PI * radius;
            const dash = (item.value / 100) * circumference;

            return (
              <g key={index}>
                {/* Background vòng */}
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  stroke="currentColor"
                  className="text-gray-200"
                  strokeWidth="2.5"
                  fill="none"
                />
                {/* Progress vòng */}
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  stroke={item.color}
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)" // bắt đầu từ top
                />
              </g>
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <CenterIcon className="w-10 h-10 text-green-600 mb-2" />
          <span className="text-2xl font-extrabold">{centerValue}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-col gap-2 text-gray-600 text-base">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></span>
            <span>{item.label} ({item.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NestedDonutChart;
