import MainLayout2 from "../../../layout/MainLayout2";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const handleCancel = () => navigate(-1);
  const handleConfirm = () => {
    console.log("Đã logout");
    navigate("/login");
  };

  return (
    <MainLayout2>
      <div className="flex items-center justify-center mt-6 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-5 w-full max-w-lg text-center relative overflow-hidden">
          {/* Decorative gradient circle */}
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-green-100 rounded-full mix-blend-multiply opacity-40 animate-pulse"></div>

          <h2 className="text-3xl font-extrabold mb-6 text-gray-800">LOGOUT?</h2>

          <p className="text-gray-500 text-lg mb-8">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
          </p>

          <div className="flex justify-center gap-6">
            <button
              onClick={handleCancel}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-2xl shadow-xl transform hover:scale-105 transition"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-2xl shadow-xl transform hover:scale-105 transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </MainLayout2>
  );
}
