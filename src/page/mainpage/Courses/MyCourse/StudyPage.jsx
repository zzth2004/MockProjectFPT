// src/pages/Study.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout2 from "../../../../layout/MainLayout2";
import { Star, X } from "lucide-react";
import AnimateOnView from "../../../../components/Wrapper/WrapperMotion";

// Dữ liệu ví dụ
const studyData = {
  1: {
    title: "Unit 1 - Introduction - 소개하다",
    vocabulary: [
      { id: 1, content: "안녕하세요 - Hello", favorite: false },
      { id: 2, content: "저는 … 입니다 - I am ...", favorite: false },
      { id: 3, content: "만나서 반갑습니다 - Nice to meet you", favorite: false },
    ],
    grammar: [
      { id: 1, content: "이/가 vs 은/는", favorite: false },
      { id: 2, content: "입니다 (to be)", favorite: false },
    ],
    communication: [
      { id: 1, content: "Introducing yourself", favorite: false },
      { id: 2, content: "Greeting others", favorite: false },
    ],
  },
  2: {
    title: "Unit 2 - Healthy - 건강",
    vocabulary: [
      { id: 1, content: "건강 - Health", favorite: false },
      { id: 2, content: "아프다 - Sick", favorite: false },
      { id: 3, content: "약 - Medicine", favorite: false },
    ],
    grammar: [
      { id: 1, content: "Adjective + 아/어하다", favorite: false },
      { id: 2, content: "Past tense ~았/었어요", favorite: false },
    ],
    communication: [
      { id: 1, content: "Talking about illness", favorite: false },
      { id: 2, content: "Asking about health", favorite: false },
    ],
  },
  3: {
    title: "Unit 3 - Travel - 여행",
    vocabulary: [
      { id: 1, content: "비행기 - Airplane", favorite: false },
      { id: 2, content: "호텔 - Hotel", favorite: false },
      { id: 3, content: "여권 - Passport", favorite: false },
    ],
    grammar: [
      { id: 1, content: "Direction & location: ~에/에서", favorite: false },
      { id: 2, content: "Making suggestions: ~까요?", favorite: false },
    ],
    communication: [
      { id: 1, content: "Asking for directions", favorite: false },
      { id: 2, content: "Booking a hotel", favorite: false },
    ],
  },
  4: {
    title: "Unit 4 - Movies - 영화",
    vocabulary: [
      { id: 1, content: "영화 - Movie", favorite: false },
      { id: 2, content: "장르 - Genre", favorite: false },
      { id: 3, content: "감독 - Director", favorite: false },
    ],
    grammar: [
      { id: 1, content: "Expressing likes/dislikes: ~을/를 좋아하다", favorite: false },
      { id: 2, content: "Talking about past: ~았/었어요", favorite: false },
    ],
    communication: [
      { id: 1, content: "Talking about favorite movies", favorite: false },
      { id: 2, content: "Discussing movie genres", favorite: false },
    ],
  },
  5: {
    title: "Unit 5 - Occupation - 직업",
    vocabulary: [
      { id: 1, content: "의사 - Doctor", favorite: false },
      { id: 2, content: "선생님 - Teacher", favorite: false },
      { id: 3, content: "학생 - Student", favorite: false },
    ],
    grammar: [
      { id: 1, content: "Talking about work: ~에서 일하다", favorite: false },
      { id: 2, content: "Asking about jobs: 직업이 뭐예요?", favorite: false },
    ],
    communication: [
      { id: 1, content: "Asking about someone's occupation", favorite: false },
      { id: 2, content: "Describing your job", favorite: false },
    ],
  },
  6: {
    title: "Unit 6 - Hobbies - 취미",
    vocabulary: [
      { id: 1, content: "독서 - Reading", favorite: false },
      { id: 2, content: "운동 - Exercise", favorite: false },
      { id: 3, content: "게임 - Games", favorite: false },
    ],
    grammar: [
      { id: 1, content: "Talking about hobbies: ~을/를 좋아하다", favorite: false },
      { id: 2, content: "Expressing frequency: 자주/가끔/매일", favorite: false },
    ],
    communication: [
      { id: 1, content: "Talking about hobbies", favorite: false },
      { id: 2, content: "Inviting someone to join an activity", favorite: false },
    ],
  },
};
// Thêm hàm xử lý


export default function StudyPage() {
  const { bookId, unitId } = useParams();
  const unitStudy = studyData[unitId];

  // handle navigate

  const navigate = useNavigate();

  const handleLearn = (tab) => {
    console.log("Học ngay:", tab, typeof tab); // debug
    navigate(`/user/mycourses/${bookId}/${unitId}/${tab}`);
  };


  const [activeTab, setActiveTab] = useState("vocabulary");
  const [starred, setStarred] = useState({}); // {vocabulary: [1,3], grammar: [2], ...}

  const [mobileModal, setMobileModal] = useState(null);
  const toggleStar = (tab, id) => {
    setStarred((prev) => {
      const tabStars = prev[tab] || [];
      if (tabStars.includes(id)) {
        return { ...prev, [tab]: tabStars.filter((x) => x !== id) };
      } else {
        return { ...prev, [tab]: [...tabStars, id] };
      }
    });
  };

  const tabs = ["vocabulary", "grammar", "communication"];

  const renderList = (tab) => (
    <div className="space-y-3">
      {unitStudy[tab].map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center p-4 bg-white shadow rounded-lg"
        >
          <span className="text-base md:text-lg">{item.content}</span>
          <button onClick={() => toggleStar(tab, item.id)}>
            <Star
              size={24}
              className={`transition-colors ${starred[tab]?.includes(item.id) ? "text-yellow-400" : "text-gray-300"
                }`}
            />
          </button>
        </div>
      ))}

      {/* Nút học ngay */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => handleLearn(tab)}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
        >
          Học ngay
        </button>
      </div>
    </div>
  );


  return (
    <MainLayout2>
      <div className="bg-gray-50 max-h-[80vh] py-8 md:py-12 px-4 md:px-0">
        <AnimateOnView>
          <section className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 text-center md:text-left">
              {`${unitId}. ${unitStudy.title}`}
            </h1>

            {/* Desktop / Tablet Tabs */}
            <div className="hidden md:flex justify-center mb-[-2px]">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-1/3 px-8 py-4 text-lg rounded-t-lg font-bold transition-all duration-200
                    ${activeTab === tab
                      ? "bg-green-600 text-white shadow border-t-2 border-l-2 border-r-2 border-green-600"
                      : "bg-white text-gray-700 shadow border-b-2 border-green-600 hover:bg-gray-100"
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Mobile Tabs */}
            <div className="flex flex-col space-y-3 md:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMobileModal(tab)}
                  className="w-full px-6 py-3 text-base font-bold rounded-lg bg-white shadow border-2 border-green-600 hover:bg-green-50 text-gray-800"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content Desktop / Tablet */}
            <div className="hidden md:block border-2 border-green-600 rounded-b-md rounded-tl-none rounded-tr-none p-4 bg-white mt-[-2px]">
              {renderList(activeTab)}
            </div>

            {/* Mobile Modal */}
            {mobileModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-24 px-4">
                <div className="bg-white rounded-lg w-full max-w-md p-4 relative shadow-lg">
                  <button
                    onClick={() => setMobileModal(null)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                  >
                    <X size={24} />
                  </button>
                  <h2 className="text-xl font-bold mb-4">
                    {mobileModal.charAt(0).toUpperCase() + mobileModal.slice(1)}
                  </h2>
                  {renderList(mobileModal)}
                </div>
              </div>
            )}
          </section>
        </AnimateOnView>
      </div>
    </MainLayout2>
  );
}