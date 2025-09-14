// src/pages/Dashboard.jsx
import React from "react";
import { Home, BookOpen, MessageCircle, Calendar, User, Settings, LogOut } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import MainLayout2 from "../../layout/MainLayout2";

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
            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar */}
                {/* Main content */}
                <main className="flex-1 p-8">
                    {/* Unit progress */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                            <h3 className="text-lg font-semibold">Unit 1.2</h3>
                            <p className="text-gray-500 flex items-center gap-1 mt-2"><span>Homework</span> 🏅</p>
                            <div className="w-full h-2 bg-gray-200 rounded mt-3">
                                <div className="h-2 bg-green-600 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                            <div className="flex justify-between">
                                <div className="text-gray-700">320</div>
                                <div className="text-gray-700">850</div>
                            </div>
                            <div className="flex justify-between mt-1 text-gray-500 text-sm">
                                <span>Coins</span>
                                <span>Scores</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center justify-center">
                            <div className="relative w-24 h-24">
                                <svg className="w-24 h-24" viewBox="0 0 36 36">
                                    <path
                                        className="text-gray-200"
                                        strokeWidth="3.5"
                                        fill="none"
                                        stroke="currentColor"
                                        d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className="text-green-600"
                                        strokeWidth="3.5"
                                        strokeDasharray="75,100"
                                        strokeLinecap="round"
                                        fill="none"
                                        stroke="currentColor"
                                        d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">5000</div>
                            </div>
                            <div className="text-gray-500 mt-2 text-sm">Total Word</div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition mb-8 h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>

                    {/* Word Sets */}
                    <h2 className="text-xl font-bold mb-4">Word Sets</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {["Vocabulary", "Quizzet", "Test"].map((word, idx) => (
                            <div key={idx} className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition cursor-pointer">
                                <div className="text-white font-bold text-lg">{word}</div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </MainLayout2>
    );
};

export default Dashboard;
