import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // 1. Import useNavigate, useParams
import { ChevronLeft } from "lucide-react";

const TopikQuizStart = () => {
  const navigate = useNavigate();
  const { partId } = useParams(); // 2. Lấy partId từ URL

  // State lưu cấu hình
  const [testMode, setTestMode] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [questionCount, setQuestionCount] = useState(10);

  const partTitle = "Correct Answer";
  const partDesc = "Listen and choose the correct answer.";

  // 👇 3. HÀM XỬ LÝ KHI BẤM START (SỬA Ở ĐÂY)
  const handleStart = () => {
    // Chuyển hướng sang trang /test/...
    // Kèm theo state để trang Test biết người dùng chọn chế độ nào
    navigate(`/user/topik/test/${partId}`, {
      state: { 
        testMode, 
        autoNext, 
        questionCount 
      }
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F8F9FC] flex flex-col font-sans p-6">
      
      {/* Nút Back */}
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={24} />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 max-w-5xl w-full">
            
            {/* Ảnh Ninja */}
            <div className="flex-1 flex justify-center">
                <div className="w-64 h-64 md:w-80 md:h-80 relative">
                    <img 
                        src="https://cdn-icons-png.flaticon.com/512/4322/4322991.png" 
                        alt="Ninja Mascot" 
                        className="w-full h-full object-contain animate-in fade-in zoom-in duration-500"
                    />
                    <div className="absolute -z-10 bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-green-100 rounded-[100%] blur-md"></div>
                </div>
            </div>

            {/* Bảng Cài đặt */}
            <div className="flex-1 w-full max-w-md">
                
                <div className="bg-white rounded-[2rem] p-8 shadow-sm text-center mb-8 border border-gray-100">
                    <h1 className="text-xl md:text-2xl font-bold text-[#377437] mb-2">{partTitle}</h1>
                    <p className="text-gray-500 font-medium">{partDesc}</p>
                </div>

                {/* Các nút gạt (Switch) */}
                <div className="flex items-center justify-between px-4 mb-8">
                    
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setTestMode(!testMode)}>
                        <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${testMode ? 'bg-[#377437]' : 'bg-gray-200'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${testMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500">Test mode</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setAutoNext(!autoNext)}>
                        <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${autoNext ? 'bg-[#377437]' : 'bg-gray-200'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${autoNext ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500">Auto-next</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <select 
                            value={questionCount}
                            onChange={(e) => setQuestionCount(e.target.value)}
                            className="h-8 px-2 rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-700 outline-none focus:border-[#377437]"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                        </select>
                        <span className="text-xs font-bold text-gray-500">Question</span>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <p className="text-[#377437] font-bold text-sm">You can see the explanation during the test!</p>
                </div>

                {/* 👇 4. GẮN HÀM VÀO SỰ KIỆN ONCLICK */}
                <button 
                  onClick={handleStart}
                  className="w-full bg-[#377437] hover:bg-green-800 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-green-900/20 transform transition-all hover:scale-[1.02] active:scale-95"
                >
                    START NOW
                </button>

            </div>
        </div>
      </div>
    </div>
  );
};

export default TopikQuizStart;