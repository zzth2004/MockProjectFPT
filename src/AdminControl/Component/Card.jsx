export const KLCard = ({ 
  title, 
  subtitle, 
  children, 
  action, 
  className = "", 
  ...props // Nhận tất cả props còn lại (onClick, onBlur, id, v.v.)
}) => {
  // Tự động thêm cursor-pointer nếu có sự kiện onClick
  const clickableClass = props.onClick ? "cursor-pointer active:scale-[0.99] transition-all" : "";

  return (
    <div 
      className={`bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl overflow-hidden ${clickableClass} ${className}`}
      {...props} // Đổ các props vào đây
    >
      {(title || action) && (
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            {title && <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm font-bold text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      {/* Logic: Nếu className có chứa 'p-' (padding) thì không dùng p-8 mặc định */}
      <div className={className.includes("p-") ? "" : "p-8"}>
        {children}
      </div>
    </div>
  );
};
export const KLStatsCard = ({ title, value, icon: Icon, trend, color = "primary" }) => {
  const colorMap = {
    primary: "from-[#2d5a2d] to-[#4ea84e] shadow-green-100",
    blue: "from-blue-600 to-blue-400 shadow-blue-100",
    orange: "from-orange-600 to-orange-400 shadow-orange-100",
    red: "from-red-600 to-red-400 shadow-red-100",
    green: "from-[#2d5a2d] to-[#4a8a4a] shadow-green-100"
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} p-8 rounded-[2.5rem] text-white shadow-2xl transition-transform hover:-translate-y-2 cursor-default`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">{title}</p>
          <h4 className="text-4xl font-black tracking-tighter">{value}</h4>
          {trend && <p className="text-[10px] font-black mt-2 bg-white/20 w-fit px-2 py-1 rounded-lg">↑ {trend}% SO VỚI THÁNG TRƯỚC</p>}
        </div>
        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
          <Icon size={28} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};