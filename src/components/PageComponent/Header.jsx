import { Link, useLocation } from "react-router-dom";
import { BookOpen, ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { to: "/homeindex/aboutus", label: "Về chúng tôi" },
  { to: "/homeindex/features", label: "Tính năng" },
  { to: "/homeindex/courses", label: "Khoá học" },
  { to: "/homeindex/community", label: "Cộng đồng" },
];

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(255,255,255,0.88)"
            : "rgba(255,255,255,0.60)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: scrolled
            ? "1px solid rgba(26,122,60,0.12)"
            : "1px solid rgba(255,255,255,0.4)",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">

          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #1a7a3c 0%, #2da05a 100%)",
                boxShadow: "0 4px 14px rgba(26,122,60,0.35)",
              }}
            >
              <BookOpen size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ color: "#1a7a3c" }}
            >
              KoreanLab
            </span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="nav-link px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    color: isActive ? "#1a7a3c" : "#374151",
                    background: isActive ? "rgba(26,122,60,0.08)" : "transparent",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── DESKTOP ACTIONS ── */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="btn-ghost text-sm"
              style={{ padding: "0.55rem 1.25rem" }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm"
              style={{ padding: "0.55rem 1.25rem" }}
            >
              Bắt đầu miễn phí <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

          {/* ── MOBILE TOGGLE ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl transition-colors hover:bg-gray-100"
            style={{ color: "#1a7a3c" }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU DRAWER ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ top: 64 }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(4px)" }}
          />
          <div
            className="absolute left-0 right-0 top-0 mx-4 mt-3 rounded-2xl p-5 shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(26,122,60,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1 mb-5">
              {NAV_LINKS.map(({ to, label }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className="px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      color: isActive ? "#1a7a3c" : "#374151",
                      background: isActive ? "rgba(26,122,60,0.08)" : "transparent",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-2.5 pt-4" style={{ borderTop: "1px solid #f0f0f0" }}>
              <Link to="/login" className="btn-ghost text-center justify-center">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-primary justify-center">
                Bắt đầu miễn phí <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
