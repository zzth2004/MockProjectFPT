import MainLayout2 from "../../../layout/MainLayout2"; 
export default function ChatUI() {
  return (
    <MainLayout2>
      <div className="h-full p-6">
        <div className="bg-white rounded-2xl shadow-md p-6 max-w-5xl mx-auto h-full flex flex-col">
          {/* Header */}
          <h1 className="text-2xl font-bold mb-6">AICHAT</h1>

          {/* Chat messages area */}
          <div className="flex-1 overflow-auto space-y-6">
            {/* Bot message */}
            <div className="max-w-[60%] bg-gray-100 text-gray-800 rounded-2xl px-4 py-3">
              tôi có thể giúp gì cho bạn
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[50%] bg-green-200 text-gray-900 rounded-2xl px-4 py-3">
                Tôi muốn học ngữ pháp N + 입니까?
              </div>
            </div>
          </div>

          {/* Typing dots */}
          <div className="mt-6">
            <div className="bg-gray-100 text-gray-400 w-full px-4 py-3 rounded-2xl text-sm">
              .....
            </div>
          </div>

          {/* Input box */}
          <div className="mt-4 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent outline-none text-gray-700"
            />
            <button className="ml-2 text-black hover:scale-110 transition">
              {/* paper plane svg */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M22 2L11 13"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M22 2L15 22l-4-9-9-4 20-8z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </MainLayout2>
  );
}
