export const KLButton = ({ children, variant = "primary", icon: Icon, className = "", ...props }) => {
  const variants = {
    primary: "bg-[#2d5a2d] text-white shadow-green-200 hover:bg-[#1e3d1e]",
    danger: "bg-red-600 text-white shadow-red-200 hover:bg-red-700",
    outline: "border-3 border-[#2d5a2d] text-[#2d5a2d] hover:bg-[#E4FBE1]",
    ghost: "text-gray-600 hover:bg-gray-100 shadow-none"
  };

  return (
    <button 
      className={`
        flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider
        transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50
        ${variants[variant]} ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={20} strokeWidth={3} />}
      {children}
    </button>
  );
};