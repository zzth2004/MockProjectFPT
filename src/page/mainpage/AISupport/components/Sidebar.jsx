import { ChevronRight } from "lucide-react";

export const Sidebar = ({ menuModes, activeMode, setActiveMode }) => (
  <aside className="w-72 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col p-6 flex-shrink-0">
    <div className="mb-10 px-2">
      <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">AICHAT</h2>
      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Support System</p>
    </div>

    <nav className="flex-1 space-y-3">
      {menuModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setActiveMode(mode.id)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group
            ${activeMode === mode.id ? "bg-green-50 text-[#377437] shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${activeMode === mode.id ? "bg-[#377437] text-white" : "bg-gray-50 text-gray-400 group-hover:text-[#377437]"}`}>
              {mode.icon}
            </div>
            <p className="text-sm font-black leading-tight text-left">{mode.label}</p>
          </div>
          <ChevronRight size={16} className={activeMode === mode.id ? "opacity-100" : "opacity-0"} />
        </button>
      ))}
    </nav>

    <div className="pt-6 border-t border-gray-50 flex items-center gap-3 px-4">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Engine Active</span>
    </div>
  </aside>
);