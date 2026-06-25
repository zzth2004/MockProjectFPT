import { Link } from "react-router-dom";
import { BookOpen, Twitter, Facebook, Youtube, Mail, Heart } from "lucide-react";

const FOOTER_LINKS = {
  "Sản phẩm": [
    { label: "Tính năng", to: "/homeindex/features" },
    { label: "Khoá học", to: "/homeindex/courses" },
    { label: "Cộng đồng", to: "/homeindex/community" },
    { label: "Bảng giá", to: "/#fees" },
  ],
  "Hỗ trợ": [
    { label: "Về chúng tôi", to: "/homeindex/aboutus" },
    { label: "Trung tâm trợ giúp", to: "#" },
    { label: "Điều khoản dịch vụ", to: "#" },
    { label: "Quyền riêng tư", to: "#" },
  ],
};

const SOCIAL = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(180deg, #0a1f12 0%, #071510 100%)" }}>
      {/* ── TOP DIVIDER ── */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(26,122,60,0.5), transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* ── BRAND ── */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                style={{
                  background: "linear-gradient(135deg, #1a7a3c 0%, #2da05a 100%)",
                  boxShadow: "0 4px 16px rgba(26,122,60,0.4)",
                }}
              >
                <BookOpen size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">KoreanLab</span>
            </Link>

            <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Nền tảng học tiếng Hàn thông minh, tối ưu cho người bận rộn Việt Nam.
            </p>

            {/* Social */}
            <div className="flex gap-2.5">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(26,122,60,0.3)";
                    e.currentTarget.style.color = "#86efac";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* ── LINK GROUPS ── */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-sm font-extrabold text-white mb-4 tracking-wide">{group}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm transition-colors duration-150"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#86efac"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* ── CTA ── */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-4 tracking-wide">Bắt đầu ngay</h4>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              Miễn phí 100% cho khoá nhập môn tiếng Hàn cơ bản.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #1a7a3c, #2da05a)",
                color: "white",
                boxShadow: "0 4px 16px rgba(26,122,60,0.35)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,122,60,0.45)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,122,60,0.35)"; }}
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>

        {/* ── BOTTOM ── */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} KoreanLab. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Được xây dựng với <Heart size={11} className="text-red-400" fill="currentColor" /> tại Việt Nam 🇻🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
