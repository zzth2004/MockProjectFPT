import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    { to: "/admin", label: "🏠 Dashboard", end: true },
    { to: "/admin/courses", label: "📚 Courses" },
    { to: "/admin/users", label: "👥 Users" },
    { to: "/admin/quiz", label: "📝 Quiz" },
    { to: "/admin/vocabulary", label: "🔤 Vocabulary" },
    { to: "/admin/plans", label: "💳 Plans" },
    { to: "/admin/media", label: "🗂️ Media" },
  ];

  return (
    <aside className="bg-[#008236] text-white w-64 min-h-screen flex flex-col p-4">
      {/* Logo + tên */}
      <div className="flex items-center gap-2 mb-6">
        <div className="text-2xl font-bold text-white drop-shadow-md">AI</div>
        <div>
          <div className="text-lg font-semibold">한 Learn</div>
          <div className="text-xs opacity-80">Admin</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end} // chỉ dùng "end" cho dashboard
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg transition-all ${
                isActive ? "bg-white text-gray-900" : "hover:bg-gray-700"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-grow" />
      <div className="text-xs text-gray-500">
        © {new Date().getFullYear()} AI한 Learn
      </div>
    </aside>
  );
}
