import React, { useState } from "react";
import { Bell, Volume2 } from "lucide-react";

export default function Settings() {
  // Chỉ còn một tab duy nhất là Cài đặt chung
  const [settings, setSettings] = useState({
    notifications: false,
    appSound: true,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 md:p-6 font-sans"> 
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-10 max-w-4xl mx-auto">
        
        {/* Header Tab */}
        <div className="flex mb-10 border-b border-gray-50">
          <button className="px-10 py-3 rounded-t-2xl text-sm font-black bg-[#377437] text-white transition-all shadow-lg shadow-green-900/10">
            Cài đặt chung
          </button>
        </div>

        {/* Nội dung Cài đặt */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Mục: Thông báo */}
          <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-gray-50/50 border border-transparent hover:border-green-100 transition-all group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-green-50 text-[#377437] rounded-2xl group-hover:scale-110 transition-transform">
                <Bell size={24} />
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg">Thông báo</p>
                <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                  {settings.notifications ? "Thông báo đang bật" : "Thông báo đã tắt"}
                </p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <button 
              onClick={() => toggleSetting('notifications')}
              className={`w-16 h-9 rounded-full p-1.5 transition-all duration-300 relative ${settings.notifications ? 'bg-[#377437]' : 'bg-gray-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.notifications ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Mục: Âm thanh ứng dụng */}
          <div className="flex items-center justify-between p-6 rounded-[1.5rem] bg-gray-50/50 border border-transparent hover:border-green-100 transition-all group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-green-50 text-[#377437] rounded-2xl group-hover:scale-110 transition-transform">
                <Volume2 size={24} />
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg">Âm thanh trong ứng dụng</p>
                <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                  {settings.appSound ? "Âm thanh đang bật" : "Âm thanh đã tắt"}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => toggleSetting('appSound')}
              className={`w-16 h-9 rounded-full p-1.5 transition-all duration-300 relative ${settings.appSound ? 'bg-[#377437]' : 'bg-gray-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.appSound ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>

        {/* Nút lưu thay đổi */}
        <div className="mt-12 flex justify-end">
          <button className="px-12 py-4 bg-[#377437] text-white font-black text-lg rounded-2xl shadow-xl shadow-green-900/20 transform transition-all hover:scale-[1.02] active:scale-95">
            Lưu thay đổi
          </button>
        </div>

      </div>
    </div>
  );
} 