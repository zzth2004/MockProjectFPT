export const KLInput = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-2">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={3} />}
      <input 
        className={`w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 ${Icon ? 'pl-12' : 'px-6'} pr-6 font-bold text-gray-800 focus:border-[#2d5a2d] focus:bg-white outline-none transition-all shadow-inner`}
        {...props} 
      />
    </div>
  </div>
);