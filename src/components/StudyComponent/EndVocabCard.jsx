import { Star } from "lucide-react";
import scheduleAva from "../../assets/schedule1.png";

export default function EndVocabPopup({ onClose, onCheckVocab, onReviewStar }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-300/30 backdrop-blur-sm z-50">
      {/* Card popup */}
      <div className="relative bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-6 pb-28 w-full max-w-md mx-auto animate-fadeIn">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Bạn đã học hết từ vựng! 🎉
          </h2>
          <p className="text-gray-600">Hãy thử các chế độ khác nhé</p>

          <div className="flex flex-col gap-3 items-stretch">
            {/* Nút kiểm tra */}
            <button
              onClick={onCheckVocab}
              className="w-full px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Kiểm tra từ vựng
            </button>

            {/* Nút xem lại */}
            <button
              onClick={onReviewStar}
              className="w-full px-6 py-2 bg-green-100 text-green-700 rounded-lg shadow hover:bg-green-200 transition flex justify-center items-center gap-2"
            >
              Xem lại các từ vựng có sao
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </button>

            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="w-full px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Ảnh minh họa góc dưới */}
        <img
          src={scheduleAva}
          alt="fighting"
          className="absolute -bottom-8 right-4 w-40 drop-shadow-lg"
        />
      </div>
    </div>
  );
}
