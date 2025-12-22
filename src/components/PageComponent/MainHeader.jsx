import { Link } from "react-router-dom";
import { 
  BookOpen, ChevronRight, ChevronLeft, Search, 
  Menu, MessageSquareMore, BellDot, ShieldCheck 
} from "lucide-react";
import avatar from "../../assets/text.png";
import { useRouteHistory } from "../../hooks/HookHander/useRouteHistory";
import { useAuth } from "../../context/authContext"; // Import useAuth để lấy role

const PRIMARY = "#008236";

export default function MainHeader({ onMenuClick }) {
  const { back, forward, canBack, canForward } = useRouteHistory();
  const { user } = useAuth(); // Lấy thông tin user từ context

  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        
        {/* 1. Logo chỉ hiện trên mobile */}
        <Link to="/user/dashboard" className="flex items-center gap-2 md:hidden">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-green-100"
            style={{ backgroundColor: PRIMARY }}
          >
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter italic" style={{ color: PRIMARY }}>
            KoreanLab
          </span>
        </Link>

        {/* 2. Điều hướng lịch sử (Desktop) */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          <button
            onClick={back}
            disabled={!canBack}
            className={`p-2 rounded-lg transition-colors ${!canBack ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={forward}
            disabled={!canForward}
            className={`p-2 rounded-lg transition-colors ${!canForward ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* 3. Thanh tìm kiếm (Desktop) */}
        <div className="flex-1 mx-8 max-w-md hidden md:flex">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-2 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-white focus:border-green-500 transition-all"
            />
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors"
            />
          </div>
        </div>

        {/* 4. Action Icons + Avatar (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1 mr-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-white rounded-xl transition-all">
              <MessageSquareMore size={20} />
            </button>
            <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-white rounded-xl transition-all relative">
              <BellDot size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>

          {/* --- LOGIC: NẾU KHÔNG PHẢI ADMIN THÌ HIỆN AVATAR --- */}
          {!isAdmin ? (
            <Link to="/user/account" className="transition-transform active:scale-95">
              <img
                src={avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-2xl border-2 border-green-600 p-0.5 object-cover bg-white shadow-sm"
              />
            </Link>
          ) : (
            // Nếu là Admin, có thể hiện một Badge nhỏ thay vì Avatar nếu muốn
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-xl text-white shadow-lg shadow-gray-200">
               <ShieldCheck size={16} className="text-green-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Administrator</span>
            </div>
          )}
        </div>

        {/* 5. Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            className="p-2.5 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 active:scale-90 transition-all"
            onClick={onMenuClick}
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
}