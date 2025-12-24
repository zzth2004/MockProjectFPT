export default function TextChat({ lastAiResponse }) {
  return (
    <div className="p-10 flex flex-col gap-4">
      {lastAiResponse && (
        <div className="self-start max-w-[80%] bg-[#377437] text-white p-5 rounded-3xl rounded-tl-none shadow-md">
          <p className="text-sm font-medium">{lastAiResponse}</p>
        </div>
      )}
      {/* Danh sách tin nhắn có thể map ở đây */}
    </div>
  );
}