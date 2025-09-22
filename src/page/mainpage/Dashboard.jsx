// src/pages/Dashboard.jsx
import React from "react";
import { Home, BookOpen, CirclePoundSterling, Trophy, Coins, Medal, ChevronLeft, ChevronRight, NotebookPen, ClipboardList, GraduationCap } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import MainLayout2 from "../../layout/MainLayout2";
import NestedDonutChart from "../../components/ChartComponent/NestedDonutChart";
import testImg from "../../assets/test.png";
import quizzImg from "../../assets/quizz.png";
import vocabImg from "../../assets/vocab.png";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const PRIMARY = "#008236";

const Dashboard = () => {
    const chartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "My Vocabulary",
                data: [2, 3, 2.5, 4, 3.8, 4.5, 3.2, 4, 4.5, 4.2, 4, 3.5],
                borderColor: PRIMARY,
                tension: 0.4,
                fill: false,
            },
            {
                label: "Repeat",
                data: [1, 2, 1.5, 2.5, 2, 3, 2.2, 2.8, 2.5, 3, 2.8, 2],
                borderColor: "#FF4C4C",
                tension: 0.4,
                fill: false,
            },
        ],
    };

    const chartOptions = {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <MainLayout2>
            <div>
                {/* Main content */}
                <main className="flex-1 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 items-stretch">
                        <div className="flex flex-col gap-6 md:col-span-3">
                            {/* Card 1: Unit Homework */}
                            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Unit 1.2</h3>
                                        <p className="text-gray-500 flex items-center gap-1 mt-1 text-base">
                                            Homework <Medal className="w-5 h-5 text-yellow-500" />
                                        </p>
                                    </div>
                                    <NotebookPen className="w-12 h-12 text-green-600" />
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded mt-4">
                                    <div className="h-2 bg-green-600 rounded w-1/2"></div>
                                </div>
                                <p className="mt-2 text-base text-gray-400">50% completed</p>
                            </div>

                            {/* Card 2: Coins & Scores */}
                            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">Achievements</h3>
                                    <Medal className="w-12 h-12 text-yellow-500" />
                                </div>
                                <div className="flex justify-between items-center text-2xl font-extrabold text-gray-700">
                                    <span>320</span>
                                    <span>850</span>
                                </div>
                                <div className="flex justify-between mt-3 text-gray-600 text-base">
                                    <div className="flex items-center gap-1">
                                        <CirclePoundSterling className="w-5 h-5 text-amber-400" />
                                        <span>Coins</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Trophy className="w-5 h-5 text-green-500" />
                                        <span>Scores</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle: Chart */}
                        <div className="md:col-span-6">
                            <NestedDonutChart
                                centerValue="5000"
                                data={[
                                    { label: "Từ vựng đã học", color: "#16a34a", value: 70 },
                                    { label: "Ngữ pháp đã học", color: "#3b82f6", value: 45 },
                                ]}
                            />
                        </div>

                        {/* Right: Study Goals */}
                        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col md:col-span-3">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Mục tiêu học tập</h3>
                            <ul className="space-y-4">
                                {[
                                    { label: "Học 200 từ mới", color: "bg-green-600", progress: 70 },
                                    { label: "Ôn 50 cấu trúc ngữ pháp", color: "bg-blue-500", progress: 45 },
                                    { label: "Hoàn thành 10 quiz", color: "bg-amber-400", progress: 30 },
                                    { label: "Nghe 5 podcast", color: "bg-purple-500", progress: 20 },
                                    { label: "Test 5 quizz", color: "bg-red-500", progress: 40 },
                                ].map((item, i) => (
                                    <li key={i} className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                                            <span className="text-gray-700 text-base">{item.label}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded mt-1">
                                            <div
                                                className={`h-2 rounded ${item.color}`}
                                                style={{ width: `${item.progress}%` }}
                                            ></div>
                                        </div>

                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Chart */}
                    <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                        <span>Statistics</span>
                        <div className="flex items-center gap-2">
                            <button className="p-2 transition">
                                <ChevronLeft className="w-5 h-5 text-gray-600 hover:text-blue-400" />
                            </button>
                            <span>2022</span>
                            <button className="p-2  transition">
                                <ChevronRight className="w-5 h-5 text-gray-600 hover:text-blue-400" />
                            </button>
                        </div>
                    </h2>
                    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition mb-8 h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>

                    {/* Word Sets */}
                    <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                        <span>Word Sets</span>
                        <div className="flex items-center gap-2">
                            <button className="p-2 transition">
                                <ChevronLeft className="w-5 h-5 text-gray-600 hover:text-blue-400" />
                            </button>
                            <span>|</span>
                            <button className="p-2  transition">
                                <ChevronRight className="w-5 h-5 text-gray-600 hover:text-blue-400" />
                            </button>
                        </div>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { label: "Vocabulary", img: vocabImg, gradient: "from-green-600/70 via-emerald-500/60 to-teal-600/70", icon: BookOpen },
                            { label: "Quizzet", img: quizzImg, gradient: "from-purple-600/70 via-pink-500/60 to-fuchsia-600/70", icon: ClipboardList },
                            { label: "Test", img: testImg, gradient: "from-blue-600/70 via-cyan-500/60 to-sky-600/70", icon: GraduationCap },
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={idx}
                                    className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition transform hover:-translate-y-1 h-48"
                                >
                                    {/* Full background image */}
                                    <img
                                        src={item.img}
                                        alt={item.label}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />

                                    {/* Gradient overlay */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-80 group-hover:opacity-90 transition`}
                                    ></div>

                                    {/* Center content */}
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                                        <Icon className="w-10 h-10 mb-2 drop-shadow-lg" />
                                        <p className="text-lg font-bold drop-shadow-md">{item.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </MainLayout2>
    );
};

export default Dashboard;
