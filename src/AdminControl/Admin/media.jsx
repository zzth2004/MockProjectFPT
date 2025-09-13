import React from "react";
import Card from "../ui/Card";

export default function Media() {
  const files = [
    {
      name: "lesson1.mp4",
      type: "Video",
      size: "45 MB",
      src: "/media/lesson1.mp4",
    },
    {
      name: "vocab.png",
      type: "Image",
      size: "500 KB",
      src: "https://www.bing.com/th/id/OIP.xVQFM_OCiWkzGtrdxQA5awHaJ3?w=160&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
    },
    {
      name: "quiz-audio.mp3",
      type: "Audio",
      size: "2 MB",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🗂️ Media</h2>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm media
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-auto">
        {files.map((file, idx) => (
          <Card
            key={idx}
            className="p-4 flex flex-col shadow-md rounded-lg bg-gray-50"
          >
            <div className="mb-2 font-medium">{file.name}</div>

            {/* Preview */}
            {file.type === "Image" && (
              <img
                src={file.src}
                alt={file.name}
                className="w-full h-48 object-cover rounded mb-2"
              />
            )}
            {file.type === "Video" && (
              <video
                src={file.src}
                controls
                className="w-full h-48 rounded mb-2 object-cover"
              />
            )}
            {file.type === "Audio" && (
              <audio controls className="w-full mb-2">
                <source src={file.src} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{file.size}</span>
              <div>
                <button className="text-blue-500 hover:underline mr-2">
                  Download
                </button>
                <button className="text-red-500 hover:underline">Xóa</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
