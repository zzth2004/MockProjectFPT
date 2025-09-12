import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const PRIMARY = "#008236";

// Button custom
const Button = ({ to, onClick, children, variant = "primary", className = "" }) => {
  const base =
    "inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  if (variant === "primary") {
    return (
      <Link
        to={to || "#"}
        onClick={onClick}
        className={`${base} text-white ${className}`}
        style={{
          backgroundColor: PRIMARY,
          boxShadow: "0 6px 18px rgba(0,130,54,0.25)",
        }}
      >
        {children}
      </Link>
    );
  }

  if (variant === "ghost") {
    return (
      <Link
        to={to || "#"}
        onClick={onClick}
        className={`${base} border text-white hover:bg-gray-700 ${className}`}
        style={{ borderColor: PRIMARY }}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to || "#"}
      onClick={onClick}
      className={`${base} bg-gray-700 text-white hover:bg-gray-600 ${className}`}
    >
      {children}
    </Link>
  );
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-700 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-8">
        {/* Logo + intro */}
        <div>
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: PRIMARY }}
            >
              <BookOpen size={20} className="text-white" />
            </div>
            <span
              className="text-lg font-extrabold text-white"
            >
              KoreanLab
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-300">
            Học tiếng Hàn thông minh cho người bận rộn.
          </p>
        </div>

        {/* Sản phẩm */}
        <div>
          <div className="font-semibold mb-2 text-white">Sản phẩm</div>
          <ul className="space-y-1 text-sm text-gray-300">
            <li><Link to="#features" className="hover:text-white">Tính năng</Link></li>
            <li><Link to="#courses" className="hover:text-white">Khoá học</Link></li>
            <li><Link to="#community" className="hover:text-white">Cộng đồng</Link></li>
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div>
          <div className="font-semibold mb-2 text-white">Hỗ trợ</div>
          <ul className="space-y-1 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
            <li><a href="#" className="hover:text-white">Điều khoản</a></li>
            <li><a href="#" className="hover:text-white">Quyền riêng tư</a></li>
          </ul>
        </div>

        {/* CTA */}
        <div>
          <div className="font-semibold mb-2 text-white">Bắt đầu</div>
          <p className="text-sm text-gray-300">
            Miễn phí 100% cho khoá nhập môn.
          </p>
          <div className="mt-3">
            <Button to="/register">Đăng ký miễn phí</Button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 pb-6">
        © {new Date().getFullYear()} KoreanLab. All rights reserved.
      </div>
    </footer>
  );
}
