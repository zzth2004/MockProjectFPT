import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const TopikPage = () => {
  const navigate = useNavigate();

  // Mock Data: Các danh mục lớn (Đã xóa TOPIK ESP)
  const categories = [
    { id: "topik-1", title: "TOPIK I" },
    { id: "topik-2", title: "TOPIK II & SPEAKING" },
  ];

  // Mock Data: Danh sách đề thi
  const exams = [
    { id: 91, title: "Topik I ( 91st )", time: 100, pass: 100, isNew: true },
    { id: 90, title: "Topik I ( 90st )", time: 100, pass: 100, isNew: false },
    { id: 89, title: "Topik I ( 89st )", time: 100, pass: 100, isNew: false },
    { id: 88, title: "Topik I ( 88st )", time: 100, pass: 100, isNew: false },
  ];

  // Hàm xử lý chuyển trang chung
  const handleNavigate = (id) => {
    if (id === 'topik-1') {
      navigate('/user/topik/topik-1');
    } else if (id === 'topik-2') {
      navigate('/user/topik/topik-2');
    }
};

  return (
    <div className="w-full min-h-screen font-sans pt-4 pb-8 bg-[#F5F7FA] px-4 md:px-0">
      
      {/* Title */}
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">TOPIK Practice</h1>

      {/* --- CATEGORIES SECTION --- */}
      <div className="flex flex-col gap-4 mb-10">
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => handleNavigate(cat.id)}
            className="w-full md:max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-green-200 transition-all group"
          >
             <div className="flex justify-between items-center">
                <span className="text-xl font-extrabold text-gray-900 group-hover:text-[#377437] transition-colors uppercase tracking-wide">
                    {cat.title}
                </span>
                <ChevronRight className="text-gray-300 group-hover:text-[#377437] transition-colors" />
             </div>
          </button>
        ))}
      </div>

      {/* --- EXAM LIST SECTION --- */}
      <div className="flex items-center justify-between mb-6 md:max-w-6xl">
         <h2 className="text-xl font-bold text-gray-900">Exam</h2>
         <button className="text-sm font-bold text-gray-400 hover:text-[#377437] transition-colors">See more</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:max-w-6xl">
         {exams.map((exam) => (
            <div 
                key={exam.id}
                // 👇 ĐÃ SỬA: Thêm sự kiện click vào đây để vào làm bài luôn
                onClick={() => handleNavigate('topik-1')}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer relative group"
            >
                {/* Badge 'New' */}
                {exam.isNew && (
                    <span className="absolute top-5 right-5 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        New
                    </span>
                )}

                {/* Logo Placeholder */}
                <div className="w-full h-32 flex items-center justify-center mb-2">
                     <div className="flex items-center gap-0.5 select-none">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full border-4 border-t-orange-400 border-r-blue-500 border-b-green-500 border-l-red-500 mb-1"></div>
                            <span className="text-2xl font-black text-gray-800 tracking-tighter">TOPIK</span>
                        </div>
                     </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-[#377437] transition-colors">
                    {exam.title}
                </h3>
                
                {/* Meta Info */}
                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                    <span>Time: {exam.time}</span>
                    <span className="w-px h-3 bg-gray-300"></span>
                    <span>Pass: {exam.pass}</span>
                </div>
            </div>
         ))}
      </div>

    </div>
  );
};

export default TopikPage;