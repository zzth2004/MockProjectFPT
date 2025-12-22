export const KLBadge = ({ children, type = "success" }) => {
  const types = {
    success: "bg-[#E4FBE1] text-[#2d5a2d]",
    warning: "bg-orange-100 text-orange-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700"
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${types[type]}`}>
      {children}
    </span>
  );
};