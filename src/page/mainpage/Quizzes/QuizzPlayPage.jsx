import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from "lucide-react";

// Mock Data cho bài kiểm tra
const QUIZ_DATA = [
  {
    id: 1,
    question: "한국", // Tiếng Hàn
    correctAnswer: "Hàn Quốc",
    options: ["Hàn Quốc", "Trung Quốc", "Việt Nam", "Nhật Bản"],
  },
  {
    id: 2,
    question: "사과",
    correctAnswer: "Quả táo",
    options: ["Quả lê", "Dưa hấu", "Quả táo", "Quả nho"],
  },
  {
    id: 3,
    question: "학교",
    correctAnswer: "Trường học",
    options: ["Bệnh viện", "Trường học", "Công ty", "Nhà hàng"],
  },
  {
    id: 4,
    question: "선생님",
    correctAnswer: "Giáo viên",
    options: ["Học sinh", "Bác sĩ", "Giáo viên", "Cảnh sát"],
  },
  // ... thêm data khác
];

const QuizzPlayPage = () => {
  const { bookId, unitId } = useParams();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // Lưu đáp án vừa chọn
  const [score, setScore] = useState(0); // Điểm số
  const [showScore, setShowScore] = useState(false); // Trạng thái hiển thị kết quả cuối cùng
  const [isAnswered, setIsAnswered] = useState(false); // Trạng thái đã trả lời câu hiện tại chưa

  const currentQuestion = QUIZ_DATA[currentQuestionIndex];
  const totalQuestions = QUIZ_DATA.length;

  // Xử lý khi chọn đáp án
  const handleOptionClick = (option) => {
    if (isAnswered) return; // Nếu đã chọn rồi thì không cho chọn lại

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  // Chuyển câu tiếp theo
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowScore(true); // Kết thúc bài thi
    }
  };

  // Quay lại câu trước (Chỉ để xem, không cho chọn lại nếu logic quiz chặt chẽ)
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Logic: Nếu quay lại thì reset state hoặc giữ nguyên tùy bạn. 
      // Ở đây tôi reset để demo đơn giản, thực tế nên lưu trạng thái từng câu.
      setSelectedOption(null); 
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  // --- MÀN HÌNH KẾT QUẢ ---
  if (showScore) {
    return (
      <div className="w-full min-h-screen bg-[#F5F7FA] font-sans p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-10 rounded-[2rem] shadow-lg text-center max-w-md w-full border border-gray-100">
          <div className="mb-6 flex justify-center text-green-500">
            <CheckCircle size={64} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Hoàn thành!</h2>
          <p className="text-gray-500 mb-8">Bạn đã trả lời đúng</p>
          
          <div className="text-5xl font-black text-[#008236] mb-8">
            {score} / {totalQuestions}
          </div>

          <div className="flex flex-col gap-3">
             <button 
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#008236] text-white rounded-xl font-bold hover:bg-green-700 transition"
             >
                <RotateCcw size={20}/> Làm lại
             </button>
             <button 
                onClick={() => navigate(-1)} // Quay lại StudyVocab
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
             >
                Thoát
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN QUIZ (Giống ảnh mẫu) ---
  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] font-sans pt-4 pb-8 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-4xl px-4 mb-6 flex items-center gap-3">
        {/* Nút Back ẩn danh hoặc về trang trước */}
        <button onClick={() => navigate(-1)} className="font-bold text-lg flex items-center gap-2 hover:text-gray-600">
           <ChevronLeft /> Back
        </button>
        <h1 className="text-xl font-bold ml-auto mr-auto pr-10">Unit 3 - Vocabulary Quiz</h1>
      </header>

      {/* Main Card */}
      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 min-h-[500px] flex flex-col justify-between">
        
        {/* Question Area */}
        <div className="mb-8">
            <p className="text-gray-500 font-bold text-sm mb-4 uppercase tracking-wider">Chọn nghĩa đúng của từ:</p>
            <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-2">
                {currentQuestion.question}
            </h2>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {currentQuestion.options.map((option, index) => {
                // Logic màu sắc:
                // 1. Mặc định: Trắng
                // 2. Khi chọn: 
                //    - Nếu Đúng: Xanh lá
                //    - Nếu Sai: Đỏ
                //    - Đáp án đúng (khi chọn sai): Xanh lá (để user biết câu đúng là gì)
                
                let btnClass = "bg-white border-2 border-gray-100 text-gray-800 hover:border-gray-300 hover:shadow-md"; // Default
                
                if (isAnswered) {
                    if (option === currentQuestion.correctAnswer) {
                        btnClass = "bg-green-100 border-2 border-green-500 text-green-700"; // Luôn hiện xanh đáp án đúng
                    } else if (option === selectedOption) {
                        btnClass = "bg-red-100 border-2 border-red-500 text-red-700"; // Chọn sai thì đỏ
                    } else {
                        btnClass = "bg-gray-50 border-gray-100 text-gray-400 opacity-50"; // Các câu còn lại làm mờ
                    }
                }

                return (
                    <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        disabled={isAnswered} // Chặn click khi đã chọn
                        className={`
                            py-4 px-6 rounded-2xl font-bold text-lg text-left shadow-sm transition-all duration-200
                            ${btnClass}
                        `}
                    >
                        {option}
                    </button>
                )
            })}
        </div>

      </div>

      {/* Footer Navigation (Counter) */}
      <div className="flex items-center gap-8 mt-8">
         <button 
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className={`p-2 transition ${currentQuestionIndex === 0 ? "text-gray-300" : "text-gray-800 hover:scale-110"}`}
         >
             <ChevronLeft size={40} strokeWidth={1}/>
         </button>

         <span className="text-2xl font-bold text-gray-800">
            {currentQuestionIndex + 1}/{totalQuestions}
         </span>

         <button 
            onClick={handleNext}
            // Nếu chưa chọn đáp án thì có thể disable nút Next nếu muốn bắt buộc trả lời
            // disabled={!isAnswered} 
            className="text-gray-800 hover:scale-110 transition p-2"
         >
             <ChevronRight size={40} strokeWidth={1}/>
         </button>
      </div>

    </div>
  );
};

export default QuizzPlayPage;