import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, ChevronLeft, Search, Menu, MessageSquareMore, BellDot } from "lucide-react";
import avatar from "../../assets/text.png";

const PRIMARY = "#008236";

export default function MainHeader({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo chỉ hiện trên mobile */}
        <Link to="/" className="flex items-center gap-2 md:hidden">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: PRIMARY }}
          >
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-xl font-extrabold" style={{ color: PRIMARY }}>
            KoreanLab
          </span>
        </Link>

        {/* Điều hướng desktop */}
        <div className="hidden md:flex items-center gap-2 ml-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
            <ChevronLeft size={20} />
          </Link>
          <Link className="text-gray-600 hover:text-gray-900">
            <ChevronRight size={20} />
          </Link>
        </div>

        {/* Search bar - desktop */}
        <div className="flex-1 mx-4 max-w-md hidden md:flex">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full border border-gray-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Icons + Avatar desktop */}
        <div className="hidden md:flex items-center gap-6 mr-11">
          <div className="flex items-center gap-2 ml-4">
            <button className="bg-gray-100 rounded-xl p-1 transition">
              <Link to="/">
                <MessageSquareMore size={20} className="text-gray-900 hover:text-red-400" />
              </Link>
            </button>
            <button className="bg-gray-100 rounded-xl p-1 transition">
              <Link to="/">
                <BellDot size={20} className="text-gray-600 hover:text-red-400" />
              </Link>
            </button>
          </div>
          <Link to="/">
            <img
              src={avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-green-600"
            />
          </Link>
        </div>

        {/* Mobile menu icon */}
        <div className="flex md:hidden items-center gap-2">
          <button
            className="p-2 rounded-full border border-gray-300"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
