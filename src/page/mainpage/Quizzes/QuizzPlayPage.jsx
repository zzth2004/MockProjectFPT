import React, { useState, useEffect } from "react";
import SelectQuizz from "../../../components/Quizz/SelectQuizz"; 
import { useNavigate } from "react-router-dom";
import LayoytNoSideBar from "../../../layout/LayoutNoSideBar";

const questions = [
  {
    id: 1,
    image: "https://cdn-icons-png.flaticon.com/512/197/197582.png",
    wordKorean: "안녕하세요",
    options: ["Hello", "School", "Love", "Book"],
    correctAnswer: "Hello",
    timeLimit: 10,
    maxScore: 100,
  },
  {
    id: 2,
    image: "https://cdn-icons-png.flaticon.com/512/197/197604.png",
    wordKorean: "학교",
    options: ["Travel", "School", "Music", "Food"],
    correctAnswer: "School",
    timeLimit: 8,
    maxScore: 80,
  },
  {
    id: 3,
    image: "https://cdn-icons-png.flaticon.com/512/197/197375.png",
    wordKorean: "사랑",
    options: ["Love", "Water", "Sky", "Friend"],
    correctAnswer: "Love",
    timeLimit: 12,
    maxScore: 120,
  },
];

export default function QuizPlayPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const [globalTime, setGlobalTime] = useState(
    questions.reduce((sum, q) => sum + q.timeLimit, 0) + Math.ceil(questions.length * 1.2)
  );

  useEffect(() => {
    if (showResult) return;
    if (globalTime <= 0) {
      setShowResult(true);
      return;
    }
    const timer = setInterval(() => setGlobalTime(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [globalTime, showResult]);

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) setCurrentQ(i => i + 1);
    else setShowResult(true);
  };

  const handleSelect = ({ answer, score }) => {
    setScore(s => s + score);
    setTimeout(nextQuestion, 1200); // chờ 1.2s hiển thị màu đáp án
  };

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <h1 className="text-4xl font-extrabold text-green-600 mb-4">🎉 Quiz Completed!</h1>
          <p className="text-xl text-gray-700">Điểm số của bạn: <span className="font-bold">{score}</span></p>
          <button
            onClick={() => navigate("/user/mycourses")}
            className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <LayoytNoSideBar>
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-green-50 flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-4">
        <span className="text-lg font-semibold text-gray-700">Câu {currentQ + 1}/{questions.length}</span>
        <span className="text-lg font-semibold text-red-600">⏳ {globalTime}s</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl h-4 bg-gray-200 rounded-full mb-6 overflow-hidden shadow-inner">
        <div
          className="h-4 bg-green-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 mb-8">
        <SelectQuizz
          image={q.image}
          wordKorean={q.wordKorean}
          options={q.options}
          correctAnswer={q.correctAnswer}
          timeLimit={q.timeLimit}
          maxScore={q.maxScore}
          onSelect={handleSelect}
        />
      </div>
    </div>
    </LayoytNoSideBar>
  );
}
