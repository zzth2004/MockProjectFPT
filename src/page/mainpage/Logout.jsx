import MainLayout2 from "../../layout/MainLayout2";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1); // quay lại trang trước
  };

  const handleConfirm = () => {
    // TODO: Xử lý xóa token hoặc clear session ở đây
    console.log("Đã logout");
    navigate("/login"); // điều hướng về trang login
  };

  return (
    <MainLayout2>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-[300px] text-center">
          <h2 className="text-lg font-semibold mb-6">LOGOUT?</h2>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleCancel}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirm}
              className="bg-green-400 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </MainLayout2>
  );
}
