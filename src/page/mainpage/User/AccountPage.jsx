import React, { useState, useRef } from "react";
import {
  Camera,
  Save,
  User,
  Mail,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ===== USER INFO =====
  const [userData, setUserData] = useState({
    name: "Minh Quân",
    email: "quanminh@example.com",
    age: 22,
    avatar: "https://i.pravatar.cc/150?u=12",
    role: "Admin",
  });

  // ===== CHANGE PASSWORD =====
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ===== AVATAR CHANGE =====
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData({ ...userData, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // ===== SAVE PROFILE =====
  const handleSave = () => {
    // 👉 Gọi API update profile ở đây
    alert("Thông tin đã được cập nhật thành công!");
  };

  // ===== CHANGE PASSWORD =====
  const handleChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    // 👉 Gọi API đổi mật khẩu ở đây
    alert("Đổi mật khẩu thành công!");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate("/user/mycourses")}
          className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={24} /> Quay lại
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* COVER */}
          <div className="h-32 bg-gradient-to-r from-[#377437] to-[#5a915a]" />

          <div className="px-8 pb-10">

            {/* AVATAR */}
            <div className="relative -mt-16 mb-8 flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
                  <img
                    src={userData.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-1 right-1 p-2 bg-[#377437] text-white rounded-full shadow-md hover:bg-green-700 transition-all"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>

              <h1 className="mt-4 text-2xl font-black text-gray-900">
                {userData.name}
              </h1>
              <span className="px-3 py-1 bg-green-50 text-[#377437] rounded-full text-xs font-black uppercase tracking-widest mt-2 border border-green-100">
                {userData.role}
              </span>
            </div>

            {/* PROFILE FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase ml-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) =>
                      setUserData({ ...userData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#377437] border outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase ml-1">
                  Tuổi
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="number"
                    value={userData.age}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        age: Number(e.target.value),
                      })
                    }
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#377437] border outline-none font-bold"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-100 font-bold text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* SAVE PROFILE */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-10 py-4 bg-[#377437] hover:bg-green-800 text-white font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02]"
              >
                <Save size={20} /> Lưu thông tin
              </button>
            </div>

            {/* ===== CHANGE PASSWORD ===== */}
            <div className="mt-14 pt-10 border-t border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-6">
                Đổi mật khẩu
              </h2>

              <div className="space-y-5 max-w-md mx-auto">
                <input
                  type="password"
                  placeholder="Mật khẩu hiện tại"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#377437] border outline-none font-bold"
                />

                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#377437] border outline-none font-bold"
                />

                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 focus:bg-white focus:border-[#377437] border outline-none font-bold"
                />

                <button
                  onClick={handleChangePassword}
                  className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
