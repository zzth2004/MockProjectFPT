import React, { useState } from "react";
import MainLayout2 from "../../layout/MainLayout2";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabClass = (tab) =>
    `px-6 py-2 rounded-t-xl text-sm font-semibold transition ${
      activeTab === tab
        ? "bg-green-500 text-white"
        : "bg-green-100 text-green-700 hover:bg-green-200"
    }`;

  return (
    <MainLayout2>
      <div className="bg-white rounded-2xl shadow-md p-6">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={tabClass("profile")}
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={tabClass("general")}
          >
            Cài đặt chung
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={tabClass("password")}
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold">Họ và tên</label>
              <input
                className="w-full border border-green-600 rounded-lg px-3 py-2"
                defaultValue="Bích Thùy"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Email</label>
              <input
                className="w-full border border-green-600 rounded-lg px-3 py-2"
                defaultValue="user@hmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Giới tính</label>
              <select className="w-full border border-green-600 rounded-lg px-3 py-2">
                <option>Nữ</option>
                <option>Nam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Tỉnh/Thành phố
              </label>
              <select className="w-full border border-green-600 rounded-lg px-3 py-2">
                <option>Đà Nẵng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Số điện thoại
              </label>
              <input
                className="w-full border border-green-600 rounded-lg px-3 py-2"
                placeholder="VD: 012345678"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Quận/Huyện</label>
              <select className="w-full border border-green-600 rounded-lg px-3 py-2">
                <option>Ngũ Hành Sơn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">Sinh nhật</label>
              <input
                className="w-full border border-green-600 rounded-lg px-3 py-2"
                placeholder="dd/mm/yy"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Địa chỉ cụ thể
              </label>
              <input
                className="w-full border border-green-600 rounded-lg px-3 py-2"
                placeholder="470 TDN"
              />
            </div>
          </div>
        )}

        {activeTab === "general" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">🔔</span>
                <div>
                  <p className="font-semibold">Thông báo</p>
                  <p className="text-sm text-gray-500">Thông báo đã tắt</p>
                </div>
              </div>
              <input type="checkbox" className="toggle accent-green-600" />
            </div>

            <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">🔊</span>
                <div>
                  <p className="font-semibold">Âm thanh trong ứng dụng</p>
                  <p className="text-sm text-gray-500">Âm thanh đã bật</p>
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle accent-green-600"
                defaultChecked
              />
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full border border-green-600 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full border border-green-600 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout2>
  );
}
