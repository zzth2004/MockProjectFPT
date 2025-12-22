import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X, Loader2 } from "lucide-react";
import { useAuth } from "../../context/authContext";
import { authLogout } from "../../services/authService";

export default function LogoutPopup({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Nếu bạn cần cập nhật state user trong context
  const [isExiting, setIsExiting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsExiting(true);
    try {
      // 1. Gọi API logout
      await authLogout();
      
      // 2. Nếu có hàm logout từ context để xóa state, hãy gọi nó
      if (logout) logout(); 

      console.log("🚀 Đã logout thành công");
      
      // 3. Chuyển hướng
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      setIsExiting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      
      {/* Backdrop dùng để đóng khi click ra ngoài */}
      <div className="absolute inset-0" onClick={isExiting ? null : onClose} />

      {/* Nội dung trang Logout của bạn */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10 w-full max-w-md text-center relative overflow-hidden animate-in zoom-in duration-300 z-10">
        
        {/* Mascot Ninja */}
        <div className="mb-6 flex justify-center">
          <div className={`w-32 h-32 relative ${isExiting ? "animate-pulse" : ""}`}>
             <img 
               src="https://cdn-icons-png.flaticon.com/512/4322/4322991.png" 
               alt="Ninja Mascot" 
               className="w-full h-full object-contain"
             />
          </div>
        </div>

        <h2 className="text-3xl font-black mb-4 text-gray-900 tracking-tight uppercase italic">
          Đăng <span className="text-[#377437]">xuất?</span>
        </h2>

        <p className="text-gray-500 font-bold text-lg mb-10 leading-relaxed">
          Bạn có chắc chắn muốn đăng xuất <br /> khỏi tài khoản không?
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            disabled={isExiting}
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black px-8 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            <X size={20} /> KHÔNG
          </button>
          
          <button
            disabled={isExiting}
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-[#377437] hover:bg-[#2d5a2d] text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-green-900/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {isExiting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <LogOut size={20} />
            )}
            {isExiting ? "ĐANG THOÁT..." : "ĐĂNG XUẤT"}
          </button>
        </div>

        {/* Trang trí nền */}
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-green-50 rounded-full -z-10 opacity-60"></div>
      </div>
    </div>
  );
}