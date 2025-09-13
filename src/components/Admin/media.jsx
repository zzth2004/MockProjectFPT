import React, { useState } from "react";
import "./media.css";

export default function Media() {
  const [media, setMedia] = useState([
    {
      id: 1,
      type: "image",
      src: "https://khoinguonsangtao.vn/wp-content/uploads/2022/08/hinh-anh-meo-cute-1.jpg",
      name: "cat1.jpg",
    },
    {
      id: 2,
      type: "image",
      src: "https://preview.redd.it/trbtuvbrqtq81.jpg?width=640&crop=smart&auto=webp&s=04ca9929b1a633949b590327096fcdb3a40ccf8d",
      name: "cat2.jpg",
    },
    {
      id: 3,
      type: "audio",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      name: "greeting.mp3",
    },
    {
      id: 4,
      type: "video",
      src: "https://www.w3schools.com/html/mov_bbb.mp4",
      name: "lesson.mp4",
    },
  ]);

  const handleDelete = (id) => {
    setMedia((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="media-root">
      <div className="media-header">
        <h2>🗂️ Media Library</h2>
        <button className="btn-primary">+ Upload Media</button>
      </div>

      <div className="media-grid">
        {media.map((item) => (
          <div key={item.id} className="media-card">
            {item.type === "image" && <img src={item.src} alt={item.name} />}
            {item.type === "audio" && <audio controls src={item.src}></audio>}
            {item.type === "video" && (
              <video controls>
                <source src={item.src} type="video/mp4" />
              </video>
            )}
            <div className="media-info">
              <span>{item.name}</span>
              <button
                className="btn-delete"
                onClick={() => handleDelete(item.id)}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
