import React from "react";
import { Image, Video, Music, Download, Trash2, Plus } from "lucide-react";
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
      name: "lesson2.mp4",
      type: "Video",
      size: "38 MB",
      src: "/media/lesson2.mp4",
    },
    {
      name: "vocab.png",
      type: "Image",
      size: "500 KB",
      src: "https://www.bing.com/th/id/OIP.xVQFM_OCiWkzGtrdxQA5awHaJ3?w=160&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
    },
    {
      name: "grammar.png",
      type: "Image",
      size: "450 KB",
      src: "https://www.bing.com/th/id/OIP.3hITyKz-GY2t6i0ph5oVGAHaLH?w=160&h=240&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
    },
    {
      name: "quiz-audio.mp3",
      type: "Audio",
      size: "2 MB",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      name: "pronunciation.mp3",
      type: "Audio",
      size: "3 MB",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
  ];

  const stats = {
    videos: files.filter((f) => f.type === "Video").length,
    images: files.filter((f) => f.type === "Image").length,
    audios: files.filter((f) => f.type === "Audio").length,
  };

  return (
    <div className="flex flex-col h-screen space-y-6 p-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          🗂️ Media Library
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:scale-105 hover:bg-indigo-700 transition shadow">
          <Plus size={18} /> Thêm media
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-md">
          <Video className="mx-auto mb-2 text-purple-500" />
          <p className="text-lg font-semibold">{stats.videos} Video</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md">
          <Image className="mx-auto mb-2 text-blue-500" />
          <p className="text-lg font-semibold">{stats.images} Ảnh</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-md">
          <Music className="mx-auto mb-2 text-green-500" />
          <p className="text-lg font-semibold">{stats.audios} Ghi âm</p>
        </Card>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-auto">
        {files.map((file, idx) => (
          <Card
            key={idx}
            className="p-4 flex flex-col justify-between shadow-lg rounded-2xl bg-white hover:shadow-xl transition h-fit"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                {file.type === "Image" && <Image size={16} className="text-blue-500" />}
                {file.type === "Video" && <Video size={16} className="text-purple-500" />}
                {file.type === "Audio" && <Music size={16} className="text-green-500" />}
                {file.name}
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {file.type}
              </span>
            </div>

            {/* Preview */}
            {file.type === "Image" && (
              <img
                src={file.src}
                alt={file.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}
            {file.type === "Video" && (
              <video
                src={file.src}
                controls
                className="w-full h-40 rounded mb-3 object-cover"
              />
            )}
            {file.type === "Audio" && (
              <audio controls className="w-full mb-3">
                <source src={file.src} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{file.size}</span>
              <div className="flex gap-3">
                <button className="text-blue-500 hover:scale-110 transition flex items-center gap-1">
                  <Download size={16} />
                </button>
                <button className="text-red-500 hover:scale-110 transition flex items-center gap-1">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Extra Section: Storage Info */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 shadow-md rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-medium">Dung lượng đã dùng: 88 MB</p>
            <p className="text-xs text-gray-500">Giới hạn: 500 MB</p>
          </div>
          <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[18%]"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}