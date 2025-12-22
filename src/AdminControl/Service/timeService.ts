export const getTimeData = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { 
      text: "Chào buổi sáng", 
      icon: "☀️", 
      sub: "Chúc bạn một ngày làm việc năng suất!",
      color: "from-[#2d5a2d] to-[#4ea84e]" // Xanh lá đậm
    };
  }
  if (hour >= 12 && hour < 18) {
    return { 
      text: "Chào buổi chiều", 
      icon: "🌤️", 
      sub: "Tiếp tục hoàn thành các mục tiêu nhé!",
      color: "from-orange-500 to-amber-400" // Cam nắng
    };
  }
  return { 
    text: "Chào buổi tối", 
    icon: "🌙", 
    sub: "Hãy kiểm tra lại các báo cáo cuối ngày.",
    color: "from-[#0f172a] to-[#334155]" // Xanh đen tối (Slate)
  };
};

