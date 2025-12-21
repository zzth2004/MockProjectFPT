import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";

export default function Logout() {
  const navigate = useNavigate();

  const handleCancel = () => navigate(-1);
  const handleConfirm = () => {
    // Xóa Token/Session tại đây nếu có
    console.log("Đã logout");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6 font-sans">
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 w-full max-w-md text-center relative overflow-hidden animate-in zoom-in duration-300">
        
        {/* Mascot Ninja */}
        <div className="mb-6 flex justify-center">
          <div className="w-32 h-32 relative">
             <img 
               src="https://cdn-icons-png.flaticon.com/512/4322/4322991.png" 
               alt="Ninja Mascot" 
               className="w-full h-full object-contain"
             />
          </div>
        </div>

        <h2 className="text-3xl font-black mb-4 text-gray-900 tracking-tight uppercase">Đăng xuất?</h2>

        <p className="text-gray-500 font-bold text-lg mb-10 leading-relaxed">
          Bạn có chắc chắn muốn đăng xuất <br /> khỏi tài khoản không?
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black px-8 py-4 rounded-2xl transition-all active:scale-95"
          >
            <X size={20} /> KHÔNG
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-[#377437] hover:bg-green-800 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-green-900/20 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <LogOut size={20} /> ĐĂNG XUẤT
          </button>
        </div>

        {/* Trang trí nền */}
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-green-50 rounded-full -z-10 opacity-60"></div>
      </div>
    </div>
  );
}