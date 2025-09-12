import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";

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
                className={`${base} border text-gray-800 hover:bg-gray-50 ${className}`}
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
            className={`${base} bg-gray-200 text-gray-800 hover:bg-gray-300 ${className}`}
        >
            {children}
        </Link>
    );
};

// Header
export default function Header() {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center"
                        style={{ background: PRIMARY }}
                    >
                        <BookOpen size={20} className="text-white" />
                    </div>
                    <span
                        className="text-xl font-extrabold"
                        style={{ color: PRIMARY }}
                    >
                        KoreanLab
                    </span>
                </Link>

                {/* Menu desktop */}
                <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
                    <Link to="#aboutus" className="text-gray-700 hover:opacity-80">
                        Về chúng tôi
                    </Link>
                    <Link to="#features" className="text-gray-700 hover:opacity-80">
                        Tính năng
                    </Link>
                    <Link to="#courses" className="text-gray-700 hover:opacity-80">
                        Khoá học
                    </Link>
                    <Link to="#community" className="text-gray-700 hover:opacity-80">
                        Cộng đồng
                    </Link>

                </nav>

                {/* Nút desktop */}
                <div className="hidden md:flex items-center gap-3">
                    <Button variant="ghost" to="/login">
                        Đăng nhập
                    </Button>
                    <Button to="/register">
                        Bắt đầu miễn phí <ArrowRight size={16} />
                    </Button>
                </div>

                {/* Mobile CTA */}
                <Button to="/register" className="md:hidden">
                    Bắt đầu <ArrowRight size={16} />
                </Button>
            </div>
        </header>
    );
}
