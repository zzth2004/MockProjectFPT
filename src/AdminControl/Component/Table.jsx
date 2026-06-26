import React from "react";
import { Edit3, Trash2, KeyRound, Lock, Unlock, Eye, BookOpen, 
  Calendar, 
 } from "lucide-react";

/**
 * KLTable Nâng cấp:
 * - onAction: Hàm callback tập trung (type, record)
 * - extraActions: Cho phép thêm các nút tùy chỉnh khác
 */
export const KLTable = ({ 
  columns, 
  data, 
  showAction = true, 
  onAction, // Truyền (type, row) ví dụ: onAction('edit', row)
  hiddenActions = [], // Danh sách các key muốn ẩn: ['delete', 'reset']
  actionVariant = "button", // "button" hoặc "link"
}) => {
  const safeData = Array.isArray(data) ? data : [];

  // 🛠️ Định nghĩa danh sách các nút Action tiềm năng
  const ACTION_CONFIG = [
    {
      key: 'view',
      label: 'Chi tiết',
      icon: Eye,
      color: 'text-gray-600 hover:text-gray-800',
      hover: 'hover:bg-gray-100'
    },
    {
      key: 'edit',
      label: 'Sửa',
      icon: Edit3,
      color: 'text-[#2d5a2d] hover:text-[#1c381c]',
      hover: 'hover:bg-[#E4FBE1]'
    },
    {
      key: 'reset',
      label: 'Mật khẩu',
      icon: KeyRound,
      color: 'text-blue-600 hover:text-blue-850',
      hover: 'hover:bg-blue-50'
    },
    {
      key: 'lock',
      label: 'Khóa',
      icon: Lock,
      color: 'text-orange-600 hover:text-orange-850',
      hover: 'hover:bg-orange-50'
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: Trash2,
      color: 'text-red-600 hover:text-red-800',
      hover: 'hover:bg-red-50'
    }
  ];

  // Lọc bỏ các nút nằm trong danh sách ẩn
  const visibleActions = ACTION_CONFIG.filter(action => !hiddenActions.includes(action.key));

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full border-separate border-spacing-y-3">
        <thead>
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={`px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 text-left ${col.className || ""}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.title}
              </th>
            ))}
            {showAction && (
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 text-right whitespace-nowrap">
                Thao tác
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {safeData.map((row, idx) => (
            <tr key={row.id || idx} className="group transition-all">
              {columns.map((col, colIdx) => (
                <td 
                  key={col.key} 
                  className={`
                    px-6 py-5 bg-white border-y-2 border-gray-50 
                    first:border-l-2 first:rounded-l-3xl 
                    text-[15px] font-black text-gray-800 group-hover:bg-gray-50/80 transition-colors
                    ${!showAction && colIdx === columns.length - 1 ? "border-r-2 rounded-r-3xl" : ""}
                    ${col.className || ""}
                  `}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.render ? col.render(row[col.key], row) : (row[col.key] || "---")}
                </td>
              ))}
              
              {showAction && (
                <td className="px-6 py-5 bg-white border-y-2 border-r-2 border-gray-50 rounded-r-3xl text-right group-hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                    {visibleActions.map((action) => {
                      const Icon = action.icon;
                      // Logic đặc biệt: Nếu nút là 'lock' nhưng user đang bị khóa -> đổi sang icon Unlock
                      if (action.key === 'lock' && row.isActive === false) {
                        return (
                          <button
                            key="unlock"
                            onClick={() => onAction && onAction('unlock', row)}
                            className={
                              actionVariant === "link"
                                ? "px-2 py-1 transition-all active:scale-95 flex items-center gap-1 font-bold text-xs uppercase text-green-600 hover:underline"
                                : "p-2.5 rounded-xl transition-all active:scale-90 flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter text-green-600 hover:bg-green-50"
                            }
                          >
                            <Unlock size={actionVariant === "link" ? 14 : 16} strokeWidth={3} />
                            <span>Mở khóa</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={action.key}
                          onClick={() => onAction && onAction(action.key, row)}
                          className={
                            actionVariant === "link"
                              ? `px-2 py-1.5 transition-all active:scale-95 flex items-center gap-1 font-bold text-xs uppercase hover:underline ${action.color}`
                              : `p-2.5 rounded-xl transition-all active:scale-90 flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter ${action.color} ${action.hover}`
                          }
                        >
                          <Icon size={actionVariant === "link" ? 14 : 16} strokeWidth={3} />
                          <span className={actionVariant === "link" ? "" : "hidden xl:inline"}>{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {safeData.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 italic font-black text-gray-400 uppercase tracking-widest">
            Hệ thống chưa ghi nhận dữ liệu
        </div>
      )}
    </div>
  );
};