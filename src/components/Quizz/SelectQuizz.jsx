import React, { useState, useEffect } from "react";

const SelectQuizz = ({
  image,
  wordKorean,
  options,
  correctAnswer,
  onSelect,
  timeLimit,
  maxScore,
}) => {
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [timeoutExpired, setTimeoutExpired] = useState(false);

  // Reset khi đổi câu hỏi
  useEffect(() => {
    setSelected(null);
    setTimeLeft(timeLimit);
    setTimeoutExpired(false);
  }, [wordKorean, timeLimit]);

  // Timer countdown câu hỏi
  useEffect(() => {
    if (timeLeft <= 0 || selected) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, selected]);

  // Khi hết giờ
  useEffect(() => {
    if (timeLeft === 0 && !selected) {
      setSelected("timeout");
      setTimeoutExpired(true);
      onSelect?.({ answer: null, score: 0, timeLeft: 0 });
    }
  }, [timeLeft, selected, onSelect]);

  const handleSelect = (opt) => {
    if (selected) return;

    setSelected(opt);

    let score = 0;
    if (opt === correctAnswer) {
      const calculated = Math.floor((timeLeft / timeLimit) * maxScore);
      score =
        timeLeft <= timeLimit / 2
          ? Math.max(calculated, Math.floor(maxScore / 2))
          : calculated;
    }

    onSelect?.({ answer: opt, score, timeLeft });
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg p-6 flex flex-col">
      {/* Header: Đồng hồ */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">⏳ Thời gian còn lại</span>
        <span
          className={`font-bold text-lg ${
            timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-green-600"
          }`}
        >
          {timeLeft}s
        </span>
      </div>

      {/* Thanh progress */}
      <div className="w-full h-3 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-3 bg-green-500 transition-all duration-500"
          style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
        />
      </div>

      {/* Nội dung câu hỏi */}
      <div className="flex flex-col md:flex-row items-center md:items-center justify-center mb-6 space-y-4 md:space-y-0 md:space-x-6 flex-1">
        <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-xl shadow-inner">
          <img
            src={image}
            alt={wordKorean}
            className="w-24 h-24 object-contain"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">{wordKorean}</h2>
      </div>

      {/* Đáp án */}
      <div
        className={`grid gap-4 mt-auto ${
          options.length === 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {options.map((opt, idx) => {
          const label = String.fromCharCode(65 + idx);
          let btnClass =
            "flex items-center justify-start p-4 border rounded-xl font-medium transition cursor-pointer text-lg w-full";

          if (timeoutExpired) {
            btnClass += " border-red-500 bg-red-50 text-red-700";
          } else if (selected) {
            if (opt === correctAnswer) {
              btnClass +=
                " border-green-500 bg-green-50 text-green-700 shadow-md";
            } else if (opt === selected) {
              btnClass += " border-red-500 bg-red-50 text-red-700";
            } else {
              btnClass += " border-gray-300 bg-gray-50 opacity-60";
            }
          } else {
            btnClass +=
              " border-gray-300 bg-white hover:border-green-500 hover:bg-green-50";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              className={btnClass}
              disabled={!!selected || timeoutExpired}
            >
              <span className="font-bold text-green-600 mr-3">{label}.</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectQuizz;
