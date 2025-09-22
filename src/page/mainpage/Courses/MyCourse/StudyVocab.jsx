import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VocabCard from "../../../../components/StudyComponent/VocabCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import LayoutNoSideBar from "../../../../layout/LayoutNoSideBar";
import { CircleCheckBig, ChevronRight, ChevronLeft } from "lucide-react";
import EndVocabPopup from "../../../../components/StudyComponent/EndVocabCard";
import PopupConfirmComp from "../../../../components/PopupComponent/PopupConfirmComp";
const vocabList = [
  {
    id: 1,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197582.png",
    wordKorean: "안녕하세요",
    wordEnglish: "Hello",
    wordVietnamese: "Xin chào",
    example: "안녕하세요! 만나서 반갑습니다.",
  },
  {
    id: 2,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197604.png",
    wordKorean: "학교",
    wordEnglish: "School",
    wordVietnamese: "Trường học",
    example: "저는 학교에 갑니다.",
  },
  {
    id: 3,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197375.png",
    wordKorean: "사랑",
    wordEnglish: "Love",
    wordVietnamese: "Tình yêu",
    example: "사랑은 아름답습니다.",
  },
  {
    id: 4,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197633.png",
    wordKorean: "책",
    wordEnglish: "Book",
    wordVietnamese: "Quyển sách",
    example: "저는 책을 읽고 있습니다.",
  },
  {
    id: 5,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197561.png",
    wordKorean: "음식",
    wordEnglish: "Food",
    wordVietnamese: "Đồ ăn",
    example: "한국 음식은 맛있습니다.",
  },
  {
    id: 6,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197564.png",
    wordKorean: "물",
    wordEnglish: "Water",
    wordVietnamese: "Nước",
    example: "물을 많이 마셔야 합니다.",
  },
  {
    id: 7,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197388.png",
    wordKorean: "하늘",
    wordEnglish: "Sky",
    wordVietnamese: "Bầu trời",
    example: "오늘 하늘이 맑습니다.",
  },
  {
    id: 8,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197500.png",
    wordKorean: "친구",
    wordEnglish: "Friend",
    wordVietnamese: "Bạn bè",
    example: "저는 친구와 영화를 봅니다.",
  },
  {
    id: 9,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197593.png",
    wordKorean: "음악",
    wordEnglish: "Music",
    wordVietnamese: "Âm nhạc",
    example: "저는 음악 듣기를 좋아합니다.",
  },
  {
    id: 10,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197457.png",
    wordKorean: "집",
    wordEnglish: "Home",
    wordVietnamese: "Ngôi nhà",
    example: "저는 집에 갑니다.",
  },
  {
    id: 11,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197600.png",
    wordKorean: "시간",
    wordEnglish: "Time",
    wordVietnamese: "Thời gian",
    example: "시간이 빠르게 갑니다.",
  },
  {
    id: 12,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197622.png",
    wordKorean: "돈",
    wordEnglish: "Money",
    wordVietnamese: "Tiền",
    example: "저는 돈을 절약합니다.",
  },
  {
    id: 13,
    imgPath: "https://cdn-icons-png.flaticon.com/512/197/197569.png",
    wordKorean: "여행",
    wordEnglish: "Travel",
    wordVietnamese: "Du lịch",
    example: "저는 한국으로 여행하고 싶습니다.",
  }
];


export default function StudyVocab() {
  const { bookId, unitId, tab } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEndCard, setShowEndCard] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  const progress = ((currentIndex + 1) / vocabList.length) * 100;

  const handleNext = () => {
    if (swiperRef.current && currentIndex < vocabList.length - 1) {
      swiperRef.current.slideNext();
    }
  };

  const handlePrev = () => {
    if (swiperRef.current && currentIndex > 0) {
      swiperRef.current.slidePrev();
    }
  };
  const handleEnd = () => {
    console.log("Đã học xong từ vựng!");
    setShowEndCard(true)

  };
  const handleCancel = () => {
    setShowPopup(false);
    navigate(-1); // quay lại trang trước
  };

  const handleConfirm = () => {
    console.log("Xác nhận hành động!");
    setShowPopup(false);
    navigate(`/user/quizz/${bookId}/${unitId}/vocabulary`);
  };
  const handleCheckVocab = () => {
    console.log("Đã chon xong từ vựng!");
    setShowPopup(true)

  };
  const handleStarVocab = () => {
    console.log("Đã chon hoc từ vựng gan sao! -> phat trien sau");


  };


  return (
    <LayoutNoSideBar>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center mb-6">
            {/* Nút Back */}
            {/* <button
              onClick={() => navigate(-1)}
              className="mr-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              
            </button> */}
            <h1 className="text-3xl font-bold text-green-700 text-center flex-1">
              Study Vocabulary
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold text-gray-700">
                Progress
              </span>
              <span className="text-lg font-semibold text-green-600">
                {currentIndex + 1}/{vocabList.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-600 h-4 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Swiper */}
          <Swiper
            spaceBetween={20}
            slidesPerView={1}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
          >
            {vocabList.map((vocab) => (
              <SwiperSlide key={vocab.id}>
                <VocabCard vocab={vocab} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-6 py-2 rounded-lg shadow transition ${currentIndex === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              <ChevronLeft className="w-6 h-6 inline-block mr-2" /> Prev
            </button>

            {currentIndex === vocabList.length - 1 ? (
              <button
                onClick={handleEnd}
                className="px-6 py-2 rounded-lg shadow bg-green-600 text-white hover:bg-green-700 transition"
              >
                Hoàn thành <CircleCheckBig className="w-6 h-6 inline-block ml-2" />

              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-lg shadow bg-green-600 text-white hover:bg-green-700 transition"
              >
                Next
                <ChevronRight className="w-6 h-6 inline-block ml-2" />
              </button>
            )}
            {showEndCard && (
              <EndVocabPopup
                onClose={() => {
                  setShowEndCard(false);
                  navigate(`/user/mycourses/${bookId}/${unitId}`);
                }}

                onCheckVocab={() =>
                  // navigate(`/user/quiz/${bookId}/${unitId}/vocabulary`)
                  handleCheckVocab()
                }
                onReviewStar={() =>
                  // navigate(`/user/review/${bookId}/${unitId}/starred`)
                  handleStarVocab()
                }
              />
            )}
            {/* Popup confirm */}
            {showPopup && (
              <PopupConfirmComp
                title="Xác nhận"
                message="Bạn đã học xong và chuyển qua quiz vocabulary nhé?"
                onCancel={handleCancel}
                onConfirm={handleConfirm}
              />
            )}


          </div>
        </div>
      </div>
    </LayoutNoSideBar >
  );
}