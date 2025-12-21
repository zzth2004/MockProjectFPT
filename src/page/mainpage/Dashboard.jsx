import React from "react";
import {
  Medal,
  Star,
  Coins,
  ChevronLeft,
  ChevronRight,
  Heart,
  BookOpen,
  Globe,
  Timer
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Import ảnh của bạn (Giữ nguyên)
import testImg from "../../assets/test.png";
import quizzImg from "../../assets/quizz.png";
import vocabImg from "../../assets/vocab.png";

// Đăng ký ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  // --- 1. Config Biểu đồ Đường (Statistics) ---
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Points",
        data: [20, 45, 35, 60, 55, 70, 65, 80, 75, 60, 50, 40],
        borderColor: "#C084FC", // Tím
        backgroundColor: "rgba(192, 132, 252, 0.0)", // Transparent fill
        tension: 0.4, // Đường cong mềm
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#C084FC",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
        borderWidth: 3,
      },
      {
        label: "Average",
        data: [30, 25, 40, 35, 50, 45, 60, 55, 70, 85, 75, 65],
        borderColor: "#22D3EE", // Cyan (Xanh sáng)
        backgroundColor: "rgba(34, 211, 238, 0.0)",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#22D3EE",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
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
        backgroundColor: "#1F2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
            label: (context) => `${context.parsed.y} Points` // Custom tooltip text
        }
      },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: "#9CA3AF", font: { size: 11 } } 
      },
      y: { 
        display: false, // Ẩn trục Y như ảnh mẫu
        min: 0,
        max: 100
      },
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
  };

  // --- 2. Config Biểu đồ Tròn (Total Word) ---
  const doughnutData = {
    labels: ["My Vocabulary", "Repeat"],
    datasets: [
      {
        data: [3500, 1500],
        backgroundColor: ["#22C55E", "#EF4444"], // Green, Red
        borderWidth: 0,
        cutout: "82%", // Độ mỏng của vòng tròn
        borderRadius: 20, // Bo tròn đầu mút (quan trọng để giống ảnh)
        spacing: 5 // Khoảng cách giữa các đoạn
      },
    ],
  };

  const doughnutOptions = {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 360,
  };

  return (
    // LƯU Ý: Không dùng <MainLayout2> ở đây nữa vì đã bọc ở Router rồi.
    <div className="w-full min-h-screen font-sans">
        
      {/* --- TOP ROW: 3 CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Homework Unit */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col justify-between h-52 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Unit 1.2</h3>
              <p className="text-gray-500 font-medium mt-1">Homework</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-2xl">
                {/* Icon Medal */}
                <Medal className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div>
            {/* Thanh Progress */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#5B6CF9] w-[65%] rounded-full shadow-lg shadow-blue-200"></div>
            </div>
            {/* Text ẩn hoặc hiện tùy ý, trong ảnh mẫu không có text % */}
          </div>
        </div>

        {/* Card 2: Coins & Scores */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center h-52 hover:shadow-md transition-shadow">
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mb-1">
               <Coins className="w-7 h-7 text-yellow-500 fill-yellow-500" />
            </div>
            <span className="text-3xl font-bold text-gray-800">320</span>
            <span className="text-sm font-semibold text-gray-400">Coins</span>
          </div>
          
          {/* Divider */}
          <div className="w-[2px] h-24 bg-gray-100 rounded-full"></div>

          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-1">
               <Star className="w-7 h-7 text-orange-400 fill-orange-400" />
            </div>
            <span className="text-3xl font-bold text-gray-800">850</span>
            <span className="text-sm font-semibold text-gray-400">Scores</span>
          </div>
        </div>

        {/* Card 3: Total Word Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center gap-6 h-52 hover:shadow-md transition-shadow">
           {/* Chart */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-2xl font-bold text-gray-800">5000</span>
               <span className="text-xs font-semibold text-gray-400">Total Word</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2">
                <span className="w-8 h-2 rounded-full bg-green-500"></span>
                <div>
                    <p className="text-xs font-bold text-gray-800">My Vocabulary</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-8 h-2 rounded-full bg-red-500"></span>
                <div>
                    <p className="text-xs font-bold text-gray-800">Repeat</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- MIDDLE ROW: STATISTICS CHART --- */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm mb-8 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Statistics</h2>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
               <ChevronLeft size={20} />
            </button>
            <span className="text-lg font-bold text-gray-700">2022</span>
            <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
               <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="h-64 w-full">
           <Line data={lineChartData} options={lineChartOptions} />
        </div>

        {/* Floating Tooltip Label (Giả lập cái mác đen 4.5 Points trong ảnh) */}
        <div className="hidden md:block absolute top-[35%] left-[60%] transform -translate-x-1/2 -translate-y-full">
            <div className="bg-[#1F2937] text-white px-3 py-1.5 rounded-lg shadow-lg text-center relative mb-2">
                <p className="text-xs text-gray-300">Points</p>
                <p className="text-lg font-bold">4.5</p>
                {/* Mũi tên trỏ xuống */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-[#1F2937] rotate-45"></div>
            </div>
            <div className="w-3 h-3 bg-[#1F2937] rounded-full mx-auto ring-4 ring-white shadow-sm"></div>
        </div>
      </div>

      {/* --- BOTTOM ROW: WORD SETS --- */}
      <div className="mb-4">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Word Sets</h2>
            <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-800 transition"><ChevronLeft /></button>
                <button className="p-2 text-gray-400 hover:text-gray-800 transition"><ChevronRight /></button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Vocabulary (Gradient Hồng Cam) */}
            <div className="relative h-44 rounded-[2rem] overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]"></div>
                
                {/* Heart Button */}
                <button className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm p-2 rounded-full hover:bg-white/50 transition">
                    <Heart className="w-5 h-5 text-white fill-white" />
                </button>
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {/* Icon Container */}
                    <div className="mb-2">
                        {/* Nếu không có ảnh thật thì dùng icon này */}
                        {!vocabImg && <BookOpen className="w-12 h-12 text-white drop-shadow-md" />} 
                    </div>
                    <h3 className="text-white text-xl font-bold tracking-wide drop-shadow-sm">Vocabulary</h3>
                </div>

                {/* Image Overlay (Nếu có ảnh 3D thật) */}
                <img src={vocabImg} className="absolute bottom-4 right-4 w-24 h-24 object-contain drop-shadow-2xl opacity-90 group-hover:scale-110 transition-transform duration-500" alt="vocab" />
            </div>

            {/* Card 2: Quizzet (Gradient Tím) */}
            <div className="relative h-44 rounded-[2rem] overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C471ED] to-[#F64F59]"></div>
                {/* Gradient tím pha chút đỏ/hồng cho giống ảnh */}
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-400 to-fuchsia-300"></div>

                <button className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm p-2 rounded-full hover:bg-white/50 transition">
                    <Heart className="w-5 h-5 text-white fill-white" />
                </button>

                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                    <h3 className="text-white text-xl font-bold tracking-wide drop-shadow-sm">Quizzet</h3>
                </div>
                 {/* Ảnh 3D */}
                <img src={quizzImg} className="absolute bottom-2 right-2 w-28 h-28 object-contain drop-shadow-2xl opacity-90 group-hover:rotate-12 transition-transform duration-500" alt="quizz" />
                 {/* Fallback Icon */}
                 {!quizzImg && <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-white/50" />}
            </div>

            {/* Card 3: Test (Gradient Xanh Hồng) */}
            <div className="relative h-44 rounded-[2rem] overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4facfe] to-[#00f2fe]"></div>
                {/* Lớp phủ gradient nhẹ để tạo màu giống ảnh */}
                <div className="absolute inset-0 bg-gradient-to-bl from-blue-300 to-pink-300 opacity-80"></div>

                <button className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm p-2 rounded-full hover:bg-white/50 transition">
                    <Heart className="w-5 h-5 text-white fill-white" />
                </button>

                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                    <h3 className="text-white text-xl font-bold tracking-wide drop-shadow-sm">Test</h3>
                </div>
                 {/* Ảnh 3D */}
                <img src={testImg} className="absolute bottom-4 right-4 w-24 h-24 object-contain drop-shadow-2xl opacity-90 group-hover:-translate-y-2 transition-transform duration-500" alt="test" />
                {!testImg && <Timer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-white/50" />}
            </div>
         </div>
      </div>

    </div>
  );
};

export default Dashboard;