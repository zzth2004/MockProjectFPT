import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Video, 
  BookOpen, 
  ClipboardList, 
  Send,
  MessageCircle, 
  Bell           
} from "lucide-react";

// 👇 ĐƯỜNG DẪN QUAN TRỌNG: Hãy đảm bảo bạn đã tạo file ChatWidget ở đúng chỗ
// Nếu file ChatWidget nằm ở src/components/ChatWidget.jsx, thì import như sau:
import ChatWidget from "../../../../components/ChatWidget.jsx"; 

const LessonDetail = () => {
  const { bookId } = useParams(); 
  const navigate = useNavigate();

  // State để bật/tắt khung chat
  const [showChat, setShowChat] = useState(false);

  // Mock Data
  const courseData = {
    title: "Elementary Conversational Korean",
    instructor: "Mr. Kim",
    onlineClass: {
      platform: "Zoom/Meet",
      schedule: "Starts at 7:00 PM - Mon, Wed, Fri",
      link: "#"
    },
    materials: {
      vocab: "150 words",
      grammar: "10 structures",
      classCode: "XHS23"
    },
    lessons: [
      { id: 1, title: "Lesson 1: Hangeul Alphabet", status: "COMPLETED" },
      { id: 2, title: "Lesson 2: Syllable Structure and Sound Change", status: "COMPLETED" },
      { id: 3, title: "Lesson 3: Greetings and Self-introduction", status: "IN PROGRESS" },
    ],
    homework: [
      { id: 1, title: "Write a paragraph about family", status: "SUBMITTED" },
      { id: 2, title: "Listening practice: Unit 3 Dialogue", status: "NOT DONE" },
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "text-[#377437] font-bold"; 
      case "IN PROGRESS": return "text-orange-500 font-bold";
      case "SUBMITTED": return "text-[#377437] font-bold";
      case "NOT DONE": return "text-red-500 font-bold";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="w-full min-h-screen font-sans pt-2 pb-8 bg-[#F5F7FA] px-4 md:px-0 relative">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-6">
         <button 
           onClick={() => navigate('/courses/mycourses')} 
           className="p-2 rounded-full bg-white text-gray-500 hover:text-gray-900 transition-all shadow-sm"
         >
           <ChevronLeft size={20} />
         </button>
         
         {/* Icons bên phải */}
         <div className="flex gap-3 ml-auto">
            <button className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-600">
                <MessageCircle size={20} />
            </button>
            <button className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-600 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
         </div>
      </div>

      {/* --- COURSE TITLE --- */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
        {courseData.title}
      </h1>

      {/* --- MAIN LAYOUT (GRID) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === CỘT TRÁI (2/3) === */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Online Class */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-200 rounded-xl p-4">
                 <div className="flex items-center gap-3 w-full">
                    <Video size={24} className="text-gray-800"/>
                    <div>
                       <h3 className="font-bold text-gray-900 text-lg">Online class (Zoom/Meet)</h3>
                       <p className="text-xs text-gray-500 font-medium">{courseData.onlineClass.schedule}</p>
                    </div>
                 </div>
                 <button className="bg-[#377437] hover:bg-green-800 text-white text-sm font-bold py-2 px-6 rounded-lg transition-colors whitespace-nowrap">
                    Join Class Now
                 </button>
             </div>
          </div>

          {/* Lesson History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} className="text-[#377437]"/>
                <h3 className="font-bold text-lg text-gray-900">Lesson History</h3>
             </div>
             <div className="flex flex-col">
                {courseData.lessons.map((lesson, index) => (
                   <div key={lesson.id} className={`flex items-center justify-between py-4 px-2 ${index !== courseData.lessons.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <span className="font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg w-full mr-4">{lesson.title}</span>
                      <span className={`text-xs uppercase whitespace-nowrap ${getStatusColor(lesson.status)}`}>{lesson.status}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Homework */}
          {/* Homework Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={20} className="text-[#377437]"/>
                <h3 className="font-bold text-lg text-gray-900">Homework</h3>
             </div>
             <div className="flex flex-col">
                {courseData.homework.map((hw, index) => (
                   <div 
                     key={hw.id} 
                     // 👇 THÊM SỰ KIỆN CLICK ĐỂ CHUYỂN TRANG
                     onClick={() => navigate(`/courses/mycourses/${bookId}/homework/${hw.id}`)}
                     
                     className={`
                        flex items-center justify-between py-4 px-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg
                        ${index !== courseData.homework.length - 1 ? 'border-b border-gray-50' : ''}
                     `}
                   >
                      <span className="font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg w-full mr-4">
                        {hw.title}
                      </span>
                      <span className={`text-xs uppercase whitespace-nowrap ${getStatusColor(hw.status)}`}>
                        {hw.status}
                      </span>
                   </div>
                ))}
             </div>
          </div>

        </div>

        {/* === CỘT PHẢI (1/3) === */}
        <div className="flex flex-col gap-6">
           
           {/* Class Materials */}
           <div className="bg-[#E9F5EB] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                 <BookOpen size={20} className="text-gray-900"/>
                 <h3 className="font-bold text-lg text-gray-900">Class Materials</h3>
              </div>
              <div className="space-y-3 mb-6">
                 <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-green-200 shadow-sm">
                    <span className="text-sm font-bold text-gray-900 mr-2">Vocabulary:</span>
                    <span className="text-sm text-gray-600">{courseData.materials.vocab}</span>
                 </div>
                 <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-green-200 shadow-sm">
                    <span className="text-sm font-bold text-gray-900 mr-2">Grammar:</span>
                    <span className="text-sm text-gray-600">{courseData.materials.grammar}</span>
                 </div>
              </div>
              <div className="border-t border-green-200 pt-4">
                 <h4 className="font-bold text-gray-900 text-sm mb-1">External Assignment System</h4>
                 <p className="text-xs text-gray-600 mb-3">Use class code <span className="font-bold">{courseData.materials.classCode}</span> to join Classroom.</p>
                 <button className="w-full bg-[#377437] hover:bg-green-800 text-white font-bold py-3 rounded-xl text-sm shadow-sm transition-colors">Join Google Classroom</button>
              </div>
           </div>

           {/* Instructor */}
           <div className="bg-[#377437] rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-xs font-bold opacity-80 uppercase tracking-wider mb-2">INSTRUCTOR</h3>
              <div className="text-xl font-bold mb-6">{courseData.instructor}</div>
              
              <button 
                // Sự kiện: Bật/Tắt Chat Widget
                onClick={() => setShowChat(!showChat)}
                className="w-full bg-[#E9F5EB] hover:bg-white text-[#377437] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                 <Send size={18} />
                 Contact the Instructor
              </button>
           </div>
        </div>

      </div> {/* Kết thúc Grid Layout */}

      {/* --- CHAT WIDGET POPUP --- */}
      {showChat && (
        <ChatWidget onClose={() => setShowChat(false)} />
      )}

    </div>
  );
};

export default LessonDetail;