export default function ConfirmModal({ message, onConfirm, onCancel, isOpen, title = "Confirmation" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
           
            <div className="absolute inset-0 bg-black opacity-30" />

           
            <div className="relative bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full z-10">
                <h2 className="text-lg font-semibold mb-3">{title}</h2>
                <p className="text-gray-700 mb-5">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
