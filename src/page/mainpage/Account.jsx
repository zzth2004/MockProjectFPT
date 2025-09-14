import MainLayout2 from "../../layout/MainLayout2";

export default function Account() {
  return (
    <MainLayout2>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl space-y-8">
          {/* Header: Avatar + Name */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-green-200 flex items-center justify-center text-3xl font-bold text-green-700 shadow-md">
              A
            </div>
            <h2 className="text-2xl font-semibold mt-4 text-gray-800">
              Bích Thùy
            </h2>
            <p className="text-gray-500 text-sm">user@hmail.com</p>
          </div>

          {/* Card: Tiến độ + Gói + Cấp độ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tiến độ */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center">
              <h3 className="text-sm font-semibold text-green-700 mb-2">
                Tiến độ học tập
              </h3>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 mt-1">65% hoàn thành</span>
            </div>

            {/* Cấp độ */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center">
              <h3 className="text-sm font-semibold text-green-700 mb-2">
                Cấp độ hiện tại
              </h3>
              <span className="text-lg font-bold text-green-800">
                Intermediate
              </span>
            </div>

            {/* Gói đăng ký */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center">
              <h3 className="text-sm font-semibold text-green-700 mb-2">
                Gói hiện tại
              </h3>
              <span className="text-lg font-bold text-green-800">Premium</span>
              <span className="text-xs text-gray-600">Hết hạn: 30/12/2025</span>
            </div>
          </div>

          {/* Thông tin cá nhân */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-medium">Số điện thoại</p>
              <p className="text-sm text-gray-600">0123 456 789</p>
            </div>
            <div>
              <p className="font-medium">Ngày tạo tài khoản</p>
              <p className="text-sm text-gray-600">12/06/2023</p>
            </div>
            <div>
              <p className="font-medium">Giới tính</p>
              <p className="text-sm text-gray-600">Nữ</p>
            </div>
            <div>
              <p className="font-medium">Địa chỉ</p>
              <p className="text-sm text-gray-600">470 TDN, Đà Nẵng</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center sm:justify-end gap-4 mt-4">
            <button className="border border-green-500 text-green-600 px-4 py-2 rounded-xl hover:bg-green-50 transition">
              Đổi mật khẩu
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md transition">
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>
      </div>
    </MainLayout2>
  );
}
