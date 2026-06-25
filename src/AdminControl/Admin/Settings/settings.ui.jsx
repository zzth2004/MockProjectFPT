import React, { useState, useEffect } from "react";
import { 
  Settings, Globe, BookOpen, Cpu, ShieldAlert, Save, 
  RefreshCw, CheckCircle, Info, Mail, Phone, MapPin, 
  Award, Sparkles, Sliders, Server, ToggleLeft, ToggleRight
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

const DEFAULT_SETTINGS = {
  // General
  platformName: "KoreanLab",
  contactEmail: "contact@koreanlab.edu.vn",
  contactPhone: "0987.654.321",
  address: "Thành phố Đà Nẵng, Việt Nam",
  defaultLanguage: "vi",
  
  // LMS
  passingThreshold: 80,
  xpPerQuiz: 50,
  streakMultiplier: 1.5,
  defaultClassCapacity: 30,

  // AI & Integrations
  isAIEnabled: true,
  aiModel: "gemini-pro",
  classroomSyncInterval: 12, // Hours
  googleClientId: "99752bf6-8f5f-4663-9acf-e9cfc4d9593c.apps.googleusercontent.com",

  // Maintenance & System
  isMaintenanceMode: false,
  debugLevel: "medium",
  allowGuestAccess: false
};

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general"); // general, lms, ai, maintenance
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("sys_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse settings", err);
      }
    }
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("sys_settings", JSON.stringify(settings));
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 800000 / 1000000); // Simulate save loading
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục cài đặt mặc định của hệ thống không?")) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem("sys_settings", JSON.stringify(DEFAULT_SETTINGS));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const tabs = [
    { id: "general", label: "Cấu hình chung", icon: Globe },
    { id: "lms", label: "Đào tạo & LMS", icon: BookOpen },
    { id: "ai", label: "AI & Tích hợp", icon: Cpu },
    { id: "maintenance", label: "Hệ thống", icon: ShieldAlert }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER HERO */}
      <KLCard className="relative overflow-hidden border-none shadow-xl bg-white">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-24 -mt-24 opacity-10 bg-[#2d5a2d] blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-[#2d5a2d] shadow-inner shrink-0">
              <Settings size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tight">Cài đặt hệ thống</h1>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-2">
                <span className="w-8 h-[2px] bg-[#2d5a2d]"></span>
                Cấu hình thông số vận hành và tài nguyên KoreanLab
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <KLButton
              variant="outline"
              icon={RefreshCw}
              onClick={handleReset}
              className="border-gray-200 text-gray-500 font-bold"
            >
              Khôi phục mặc định
            </KLButton>
            <KLButton
              icon={Save}
              onClick={handleSave}
              className="bg-[#2d5a2d] text-white font-bold shadow-lg shadow-green-100 hover:-translate-y-0.5"
              disabled={isSaving}
            >
              {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
            </KLButton>
          </div>
        </div>
      </KLCard>

      {/* FEEDBACK STATUS */}
      {isSaved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 font-bold text-sm animate-in slide-in-from-top duration-300">
          <CheckCircle size={18} />
          <span>Đã lưu tất cả các cấu hình cài đặt hệ thống thành công!</span>
        </div>
      )}

      {/* TABS CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT TAB MENU */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible py-2 border-b lg:border-b-0 border-gray-100 bg-white lg:bg-transparent p-2 lg:p-0 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap lg:w-full ${
                  isActive
                    ? "bg-[#2d5a2d] text-white shadow-lg shadow-green-100"
                    : "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT PANEL */}
        <div className="flex-1">
          <KLCard className="bg-white border-none shadow-xl rounded-[2rem] p-8 min-h-[400px]">
            
            {/* 1. GENERAL TAB */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="border-b border-gray-50 pb-4 mb-4">
                  <h3 className="text-lg font-black text-gray-900 uppercase">Thông tin trung tâm</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">Cấu hình các thông tin cơ bản hiển thị trên trang chủ và chân trang</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Tên nền tảng / Trung tâm</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Sliders size={16} />
                      </span>
                      <input
                        type="text"
                        value={settings.platformName}
                        onChange={(e) => handleChange("platformName", e.target.value)}
                        className="w-full py-2.5 pl-11 pr-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Email hỗ trợ liên hệ</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => handleChange("contactEmail", e.target.value)}
                        className="w-full py-2.5 pl-11 pr-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Số điện thoại hotline</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone size={16} />
                      </span>
                      <input
                        type="text"
                        value={settings.contactPhone}
                        onChange={(e) => handleChange("contactPhone", e.target.value)}
                        className="w-full py-2.5 pl-11 pr-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Ngôn ngữ mặc định hệ thống</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => handleChange("defaultLanguage", e.target.value)}
                      className="w-full py-2.5 px-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                    >
                      <option value="vi">Tiếng Việt (vi)</option>
                      <option value="ko">Tiếng Hàn (ko)</option>
                      <option value="en">Tiếng Anh (en)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Địa chỉ trụ sở chính</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <MapPin size={16} />
                      </span>
                      <input
                        type="text"
                        value={settings.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        className="w-full py-2.5 pl-11 pr-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LMS TAB */}
            {activeTab === "lms" && (
              <div className="space-y-6">
                <div className="border-b border-gray-50 pb-4 mb-4">
                  <h3 className="text-lg font-black text-gray-900 uppercase">Cấu hình Đào tạo & Điểm số</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">Quản lý quy trình kiểm tra năng lực và hệ thống phần thưởng gamification</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1">Tỷ lệ điểm đạt bài tập (%)</label>
                    <span className="text-[10px] text-gray-400 font-bold block mb-2">Số phần trăm câu hỏi đúng tối thiểu để qua bài luyện tập</span>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Award size={16} />
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.passingThreshold}
                        onChange={(e) => handleChange("passingThreshold", Number(e.target.value))}
                        className="w-full py-2.5 pl-11 pr-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1">XP nhận được mỗi bài thi</label>
                    <span className="text-[10px] text-gray-400 font-bold block mb-2">Điểm kinh nghiệm cơ bản tích lũy khi hoàn thành xuất sắc</span>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Sparkles size={16} />
                      </span>
                      <input
                        type="number"
                        value={settings.xpPerQuiz}
                        onChange={(e) => handleChange("xpPerQuiz", Number(e.target.value))}
                        className="w-full py-2.5 pl-11 pr-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1">Hệ số nhân khi duy trì chuỗi học (Streak)</label>
                    <span className="text-[10px] text-gray-400 font-bold block mb-2">Nhân số XP nhận được khi đăng nhập học tập mỗi ngày liên tục</span>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.streakMultiplier}
                      onChange={(e) => handleChange("streakMultiplier", Number(e.target.value))}
                      className="w-full py-2.5 px-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1">Sức chứa tối đa của lớp học</label>
                    <span className="text-[10px] text-gray-400 font-bold block mb-2">Số lượng học sinh tối đa tự động khóa đăng ký vào lớp học mới</span>
                    <input
                      type="number"
                      value={settings.defaultClassCapacity}
                      onChange={(e) => handleChange("defaultClassCapacity", Number(e.target.value))}
                      className="w-full py-2.5 px-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. AI & INTEGRATIONS TAB */}
            {activeTab === "ai" && (
              <div className="space-y-6">
                <div className="border-b border-gray-50 pb-4 mb-4">
                  <h3 className="text-lg font-black text-gray-900 uppercase">Trí tuệ nhân tạo (AI) & Tích hợp</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">Cấu hình mô hình AI trợ lý học tập và đồng bộ hóa kết nối Google API</p>
                </div>

                <div className="space-y-6">
                  {/* AI Learning Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <Cpu size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">Bật tính năng AI Learning Assistant</p>
                        <p className="text-[10px] text-gray-400 font-bold">Cho phép học sinh sử dụng Chat Tutor giải nghĩa ngữ pháp tiếng Hàn</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange("isAIEnabled", !settings.isAIEnabled)}
                      className="text-gray-500 hover:text-gray-900 transition-all focus:outline-none"
                    >
                      {settings.isAIEnabled ? (
                        <ToggleRight size={44} className="text-[#2d5a2d]" />
                      ) : (
                        <ToggleLeft size={44} className="text-gray-300" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-500 mb-2">Mô hình ngôn ngữ AI sử dụng</label>
                      <select
                        disabled={!settings.isAIEnabled}
                        value={settings.aiModel}
                        onChange={(e) => handleChange("aiModel", e.target.value)}
                        className={`w-full py-2.5 px-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none ${
                          !settings.isAIEnabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <option value="gemini-pro">Google Gemini Pro (Khuyên dùng)</option>
                        <option value="gpt-4">OpenAI GPT-4 Turbo</option>
                        <option value="gpt-3.5-turbo">OpenAI GPT-3.5</option>
                        <option value="claude-3">Anthropic Claude 3 Sonnet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-500 mb-2">Tần suất đồng bộ Google Classroom (Giờ)</label>
                      <input
                        type="number"
                        min="1"
                        value={settings.classroomSyncInterval}
                        onChange={(e) => handleChange("classroomSyncInterval", Number(e.target.value))}
                        className="w-full py-2.5 px-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-black uppercase text-gray-500 mb-2">Google Client ID (Dành cho OAuth2 Link Sync)</label>
                      <input
                        type="text"
                        value={settings.googleClientId}
                        onChange={(e) => handleChange("googleClientId", e.target.value)}
                        className="w-full py-2.5 px-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MAINTENANCE TAB */}
            {activeTab === "maintenance" && (
              <div className="space-y-6">
                <div className="border-b border-gray-50 pb-4 mb-4">
                  <h3 className="text-lg font-black text-gray-900 uppercase">Hệ thống & Bảo trì</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">Cấu hình chế độ an ninh, nhật ký lỗi và vận hành cơ sở hạ tầng</p>
                </div>

                <div className="space-y-6">
                  {/* Maintenance Mode Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <Server size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">Bật Chế độ Bảo trì (Maintenance Mode)</p>
                        <p className="text-[10px] text-gray-400 font-bold">Chặn mọi lượt truy cập của học viên, chỉ cho phép tài khoản Admin</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange("isMaintenanceMode", !settings.isMaintenanceMode)}
                      className="text-gray-500 hover:text-gray-900 transition-all focus:outline-none"
                    >
                      {settings.isMaintenanceMode ? (
                        <ToggleRight size={44} className="text-red-600" />
                      ) : (
                        <ToggleLeft size={44} className="text-gray-300" />
                      )}
                    </button>
                  </div>

                  {/* Allow Guest Access Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">Cho phép Guest truy cập xem khóa học</p>
                        <p className="text-[10px] text-gray-400 font-bold">Cho phép người dùng chưa đăng nhập xem danh mục và bài học công khai</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange("allowGuestAccess", !settings.allowGuestAccess)}
                      className="text-gray-500 hover:text-gray-900 transition-all focus:outline-none"
                    >
                      {settings.allowGuestAccess ? (
                        <ToggleRight size={44} className="text-[#2d5a2d]" />
                      ) : (
                        <ToggleLeft size={44} className="text-gray-300" />
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Mức độ chi tiết của Server Debug Logs</label>
                    <select
                      value={settings.debugLevel}
                      onChange={(e) => handleChange("debugLevel", e.target.value)}
                      className="w-full py-2.5 px-4 text-sm font-bold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#2d5a2d] focus:ring-2 focus:ring-green-100 transition-all outline-none"
                    >
                      <option value="low">Thấp (Chỉ Log các lỗi Fatal nguy hiểm)</option>
                      <option value="medium">Vừa phải (Bao gồm cảnh báo Warning & Logs giao dịch)</option>
                      <option value="high">Chi tiết (Log toàn bộ các lượt gọi API và Event, ngốn CPU)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* INFORMATIVE TIP */}
            <div className="mt-8 pt-6 border-t border-gray-50 flex gap-3 text-xs text-gray-400 font-bold leading-relaxed items-start">
              <Info size={16} className="text-gray-300 shrink-0 mt-0.5" />
              <p>
                Lưu ý: Mọi cấu hình thay đổi sẽ lập tức áp dụng lên bộ máy biên dịch và quản lý phiên của các thiết bị thành viên đang truy cập. 
                Vui lòng cân nhắc kỹ trước khi thay đổi trạng thái bảo trì hoặc khóa API tích hợp.
              </p>
            </div>
            
          </KLCard>
        </div>

      </div>

    </div>
  );
}
