import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  MessageCircle,
  Calendar,
  User,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";

const PRIMARY = "#008236";
const PRIMARY_DARK = "#00591A";

const PRIMARY_DARK_2 = "#284228";

const bg = `linear-gradient(to bottom, ${PRIMARY} 0%, ${PRIMARY_DARK_2} 100%)`;
const sizeIcon = 25;

export default function Sidebar({ mobile = false }) {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const navItems = [
    { icon: <Home size={sizeIcon} />, label: "Dashboard", to: "/user/dashboard" },
    { icon: <BookOpen size={sizeIcon} />, label: "Course", to: "/courses" },
    { icon: <MessageCircle size={sizeIcon} />, label: "Message", to: "/user/message" },
    { icon: <Calendar size={sizeIcon} />, label: "Schedule", to: "/user/schedule" },
    { icon: <GraduationCap size={sizeIcon} />, label: "My Course", to: "/user/mycourses" },
    { icon: <User size={sizeIcon} />, label: "Account", to: "/user/account" },
  ];

  const footerItems = [
    { icon: <Settings size={sizeIcon} />, label: "Settings", to: "/user/settings" },
    { icon: <LogOut size={sizeIcon} />, label: "Log out", to: "/user/logout" },
  ];

  const renderLink = (item) => {
    const isActive = location.pathname.startsWith(item.to);

    return (
      <Link
        key={item.label}
        to={item.to}
        onClick={() => setActiveItem(item.to)}
        className={`flex items-center gap-3 px-4 py-3 mb-2 transition duration-200 ${isActive
            ? "bg-white text-black"
            : "text-white hover:bg-green-600"
          }`}
        style={{
          borderTopLeftRadius: isActive ? "0.8rem" : "0",
          borderBottomLeftRadius: isActive ? "0.8rem" : "0",
        }}
      >
        {item.icon}
        <span className="font-bold text-xl">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`w-64 text-white flex flex-col min-h-screen ${mobile ? "" : "hidden md:flex"
        }`}
      style={{ background: bg }}
    >
      {/* Header */}
      <Link to="/user/dashboard">
        <div
          className="px-2 py-2 flex items-center gap-4 shadow-2xl rounded-b-2xl mb-1.5"
          style={{ backgroundColor: PRIMARY_DARK }}
        >
          <span className="bg-white text-green-700 px-4 py-2 rounded-2xl font-bold text-3xl shadow-sm">
            AI 한
          </span>
          <span className="text-white text-4xl font-extrabold tracking-wide">
            Learn
          </span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col mt-4 ml-4 pl-4">
        {navItems.map(renderLink)}
      </nav>

      {/* Footer */}
      <div className="flex flex-col border-t border-green-600 mt-4">
        {footerItems.map(renderLink)}
      </div>
    </aside>
  );
}
