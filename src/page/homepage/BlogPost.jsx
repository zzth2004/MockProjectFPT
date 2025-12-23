// src/pages/BlogPost.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import AnimateOnView from "../../components/Wrapper/WrapperMotion";
import { Heart, Users, Calendar, MessageCircle } from "lucide-react";
import tips from "../../assets/tips.jpg";
import flashcard from "../../assets/flashcard.png";

const PRIMARY = "#008236";

const posts = [
  {
    id: 1,
    title: "5 Tips Học Tiếng Hàn Nhanh",
    author: "Nguyễn Văn A",
    date: "12/09/2025",
    image: tips,
    content: `
      <p>Học tiếng Hàn không khó nếu bạn biết cách luyện tập 4 kỹ năng đều đặn. Dưới đây là 5 mẹo giúp bạn tiến bộ nhanh chóng:</p>
      <ol class="list-decimal ml-6 my-4 space-y-2">
        <li>Nghe mỗi ngày ít nhất 20 phút.</li>
        <li>Luyện nói theo mẫu câu hàng ngày.</li>
        <li>Sử dụng flashcards AI để học từ vựng.</li>
        <li>Tham gia hội thoại mô phỏng thực tế.</li>
        <li>Kiểm tra kiến thức sau mỗi unit.</li>
      </ol>
      <p>Thực hành đều đặn, bạn sẽ thấy tiến bộ rõ rệt chỉ sau vài tuần.</p>
    `,
    comments: [
      { id: 1, author: "Trần Thị B", text: "Bài viết rất hữu ích, cảm ơn bạn!", likes: 3, liked: false, replies: [] },
      { id: 2, author: "Lê Văn C", text: "Mình sẽ áp dụng ngay các mẹo này.", likes: 5, liked: false, replies: [] },
    ],
  },
  {
    id: 2,
    title: "Học Từ Vựng Hiệu Quả với Flashcards AI",
    author: "Trần Thị B",
    date: "10/09/2025",
    image: flashcard,
    content: `
      <p>Sử dụng flashcards AI mỗi ngày giúp bạn ghi nhớ từ vựng lâu dài.</p>
      <ul class="list-disc ml-6 my-4 space-y-2">
        <li>Chọn từ vựng theo chủ đề yêu thích.</li>
        <li>Luyện tập phát âm và kiểm tra AI.</li>
        <li>Nhận đánh giá tiến độ hàng tuần.</li>
      </ul>
      <p>Kết hợp lộ trình học cá nhân hóa để đạt hiệu quả tối đa.</p>
    `,
    comments: [],
  },
];

const BlogPost = () => {
  const { id } = useParams();
  const post = posts.find((p) => p.id === parseInt(id)) || posts[0];

  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");

  // Like toggle comment
  const handleLike = (id, isReply = false, parentId = null) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id && !isReply) {
          const liked = !c.liked;
          const likes = liked ? c.likes + 1 : c.likes - 1;
          return { ...c, liked, likes };
        }
        if (c.replies && isReply && c.id === parentId) {
          const replies = c.replies.map((r) => {
            if (r.id === id) {
              const liked = !r.liked;
              const likes = liked ? r.likes + 1 : r.likes - 1;
              return { ...r, liked, likes };
            }
            return r;
          });
          return { ...c, replies };
        }
        return c;
      })
    );
  };

  // Submit new comment
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const nextId = comments.length + 1;
    setComments([...comments, { id: nextId, author: "Bạn", text: newComment, likes: 0, liked: false, replies: [] }]);
    setNewComment("");
  };

  // Submit reply
  const handleReplySubmit = (e, parentId, replyText) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          const nextId = c.replies.length + 1;
          return { ...c, replies: [...c.replies, { id: nextId, author: "Bạn", text: replyText, likes: 0, liked: false }] };
        }
        return c;
      })
    );
  };

  // Toggle show reply form
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [replyText, setReplyText] = useState("");

  return (
    <main>
      {/* Hero */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <AnimateOnView>
            <div className="flex flex-col md:flex-row items-start gap-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full md:w-1/3 h-auto rounded-2xl shadow-md hover:shadow-xl transition-transform duration-500 hover:scale-105"
              />
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{post.title}</h1>
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <div className="flex items-center gap-1"><Users size={16} /> {post.author}</div>
                  <div className="flex items-center gap-1"><Calendar size={16} /> {post.date}</div>
                </div>
                <div
                  className="mt-4 text-gray-700 prose prose-green max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                ></div>
              </div>
            </div>
          </AnimateOnView>
        </div>
      </section>

      {/* Comment Form */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <AnimateOnView>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="flex-1 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-300 focus:outline-none shadow-sm resize-none transition"
                rows={1}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition"
              >
                Gửi
              </button>
            </form>
          </AnimateOnView>

          {/* Comment List */}
          <div className="space-y-4 mt-6">
            {comments.map((c) => (
              <AnimateOnView key={c.id}>
                <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-1">
                      <p className="text-gray-900 font-semibold">{c.author}</p>
                      <p className="text-gray-700">{c.text}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <button
                          className="text-sm text-blue-500 hover:underline"
                          onClick={() => setShowReplyForm(showReplyForm === c.id ? null : c.id)}
                        >
                          Phản hồi
                        </button>
                      </div>
                    </div>
                    <button
                      className={`flex items-center gap-1 transition text-lg ${c.liked ? "text-red-500" : "text-gray-400"} hover:scale-110`}
                      onClick={() => handleLike(c.id)}
                    >
                      <Heart size={20} /> {c.likes}
                    </button>
                  </div>

                  {/* Reply Form */}
                  {showReplyForm === c.id && (
                    <form
                      onSubmit={(e) => {
                        handleReplySubmit(e, c.id, replyText);
                        setReplyText("");
                        setShowReplyForm(null);
                      }}
                      className="flex gap-3 mt-2"
                    >
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Viết phản hồi..."
                        className="flex-1 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-300 focus:outline-none shadow-sm resize-none transition"
                        rows={1}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded-xl shadow hover:bg-green-600 transition"
                      >
                        Gửi
                      </button>
                    </form>
                  )}

                  {/* Replies List */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="ml-6 mt-2 space-y-2">
                      {c.replies.map((r) => (
                        <div key={r.id} className="flex justify-between items-start gap-2 p-3 bg-gray-50 rounded-xl shadow-sm">
                          <div className="flex-1">
                            <p className="text-gray-900 font-semibold">{r.author}</p>
                            <p className="text-gray-700">{r.text}</p>
                          </div>
                          <button
                            className={`flex items-center gap-1 transition text-lg ${r.liked ? "text-red-500" : "text-gray-400"} hover:scale-110`}
                            onClick={() => handleLike(r.id, true, c.id)}
                          >
                            <Heart size={18} /> {r.likes}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AnimateOnView>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogPost;
