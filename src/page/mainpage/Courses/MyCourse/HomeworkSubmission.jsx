import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Upload } from "lucide-react";

const HomeworkSubmission = () => {
  const navigate = useNavigate();
  const { bookId, homeworkId } = useParams();

  // Mock Data (Khớp với ảnh mẫu)
  const assignment = {
    title: "Assignment: Listening practice",
    course: "Elementary Conversational Korean",
    unit: "Unit 3",
    description: "Listen to the dialogue in Unit 3 (Page 45). Summarize the main points of the conversation between Min-ji and the shop assistant. Please use at least 5 new vocabulary words learned in this unit.",
    dueDate: "Dec 25, 2025 • 11:59 PM",
    instructor: "Mr. Kim",
    points: "100 Max Points",
    attempts: "1 / 1 Allowed",
    status: "NOT SUBMITTED"
  };

  const [answer, setAnswer] = useState("");

  return (
    <div className="w-full min-h-screen font-sans pt-2 pb-8 bg-[#F5F7FA] px-4 md:px-0">
       
       {/* --- HEADER ĐƠN GIẢN (Chỉ có nút Back) --- */}
       <div className="flex items-center mb-6">
         <button 
           onClick={() => navigate(-1)} 
           className="p-2 rounded-full bg-white text-gray-500 hover:text-gray-900 shadow-sm transition-all border border-gray-200"
         >
           <ChevronLeft size={20} />
         </button>
       </div>

       {/* --- TITLE & STATUS --- */}
       <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Homework Submission</h1>
            <p className="text-gray-500 font-medium text-sm md:text-base">
                {assignment.course} • {assignment.unit}
            </p>
          </div>
          <span className="bg-[#EAD4B6] text-[#856404] px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider self-start md:mt-2">
             {assignment.status}
          </span>
       </div>

       {/* --- MAIN LAYOUT --- */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === CỘT TRÁI: KHUNG NỘP BÀI === */}
          <div className="lg:col-span-2 flex flex-col gap-6">
             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                
                {/* Đề bài */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">{assignment.title}</h2>
                <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
                   {assignment.description}
                </p>

                {/* Nhập câu trả lời */}
                <div className="mb-6">
                   <label className="block text-sm font-bold text-gray-900 mb-2">Your Answer (Optional)</label>
                   <textarea
                     value={answer}
                     onChange={(e) => setAnswer(e.target.value)}
                     placeholder="Write your answer or comments here..."
                     className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#377437] resize-none text-gray-700 bg-white placeholder-gray-400 text-sm"
                   />
                </div>

                {/* Upload File */}
                <div className="mb-8">
                   <label className="block text-sm font-bold text-gray-900 mb-2">Attach Files</label>
                   <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-[#377437] transition-all cursor-pointer group bg-white">
                      <div className="w-12 h-12 bg-green-50 text-[#377437] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                         <Upload size={24} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-400 mt-1">Support: PDF, JPG, PNG, DOC (Max 10MB)</span>
                   </div>
                </div>

                {/* Nút Nộp */}
                <button className="w-full bg-[#377437] hover:bg-green-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-green-900/10">
                   Submit Assignment
                </button>

             </div>
          </div>

          {/* === CỘT PHẢI: THÔNG TIN === */}
          <div className="flex flex-col gap-6">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
                
                {/* Due Date */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                   <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">DUE DATE</span>
                   <div className="font-bold text-gray-800 text-sm">{assignment.dueDate}</div>
                </div>

                {/* Instructor */}
                <div className="mb-5 pb-5 border-b border-gray-100">
                   <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">INSTRUCTOR</span>
                   <div className="font-bold text-gray-800 text-sm">{assignment.instructor}</div>
                </div>

                 {/* Points */}
                 <div className="mb-5 pb-5 border-b border-gray-100">
                   <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">POINTS</span>
                   <div className="font-bold text-gray-800 text-sm">{assignment.points}</div>
                </div>

                 {/* Attempts */}
                 <div>
                   <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ATTEMPTS</span>
                   <div className="font-bold text-gray-800 text-sm">{assignment.attempts}</div>
                </div>

             </div>
          </div>
       </div>
    </div>
  );
};

export default HomeworkSubmission;