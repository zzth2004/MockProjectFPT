import React from "react";
import { Volume2 } from "lucide-react";

const VocabCard = ({ vocab }) => {
  const speak = (text, lang) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-2xl w-full">
        {/* Header */}
        <h2 className="text-2xl font-bold text-green-600 text-center">
          Learn with KoreanLab
        </h2>

        {/* Image + Korean Word */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-6">
          <div className="w-40 h-40 rounded-xl border overflow-hidden">
            <img
              src={vocab.imgPath}
              alt={vocab.wordKorean}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder.png"; // fallback ảnh
              }}
            />
          </div>
          <div className="bg-white shadow-md rounded-xl px-6 py-4">
            <p className="text-3xl font-bold text-gray-900">
              {vocab.wordKorean}
            </p>
          </div>
        </div>

        {/* Buttons Speak */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <button
            onClick={() => speak(vocab.wordKorean, "ko-KR")}
            className="flex items-center gap-2 px-5 py-3 bg-green-100 rounded-full shadow-md hover:bg-green-200 transition"
          >
            <Volume2 className="w-6 h-6" />
            <span className="text-lg font-semibold">{vocab.wordKorean}</span>
          </button>

          <button
            onClick={() => speak(vocab.wordEnglish, "en-US")}
            className="flex items-center gap-2 px-5 py-3 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition"
          >
            <Volume2 className="w-6 h-6" />
            <span className="text-lg">{vocab.wordEnglish}</span>
          </button>

          <button
            onClick={() => speak(vocab.wordVietnamese, "vi-VN")}
            className="flex items-center gap-2 px-5 py-3 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition"
          >
            <Volume2 className="w-6 h-6" />
            <span className="text-lg">{vocab.wordVietnamese}</span>
          </button>
        </div>

        {/* Example */}
        <div className="mt-8 px-4">
          <h3 className="text-xl font-semibold">Example:</h3>
          <p className="mt-2 text-gray-800 text-lg">
            {vocab.example || "No example provided."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VocabCard;
