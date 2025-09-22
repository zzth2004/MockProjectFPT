import React from "react";

export default function PopupConfirmComp({ 
  title, 
  message, 
  onCancel, 
  onConfirm 
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
        
        {/* Message */}
        <p className="text-gray-700 mb-6">{message}</p>
        
        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
