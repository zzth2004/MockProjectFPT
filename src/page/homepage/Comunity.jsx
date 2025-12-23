// src/pages/Community.jsx
import React from "react";
import MainLayout from "../../layout/MainLayout";
import AnimateOnView from "../../components/Wrapper/WrapperMotion";
import communityHero from "../../assets/community.jpg";
import listen from "../../assets/listen.jpg";
import tips from "../../assets/tips.jpg";
import flashcard from "../../assets/flashcard.png";
import { Link } from "react-router-dom";
import { Users, Calendar, MessageCircle } from "lucide-react";

const PRIMARY = "#008236";

const posts = [
    {
        id: 1,
        title: "5 Tips Học Tiếng Hàn Nhanh",
        author: "Nguyễn Văn A",
        date: "12/09/2025",
        excerpt: "Học tiếng Hàn không khó nếu bạn biết cách luyện tập 4 kỹ năng đều đặn. Bài viết này tổng hợp 5 mẹo...",
        comments: 12,
        image: tips,
    },
    {
        id: 2,
        title: "Flashcards AI Có Thực Sự Hiệu Quả?",
        author: "Trần Thị B",
        date: "10/09/2025",
        excerpt: "Flashcards thông minh giúp bạn ghi nhớ từ vựng nhanh hơn. Hãy cùng phân tích ưu nhược điểm...",
        comments: 8,
        image: flashcard,
    },
    {
        id: 3,
        title: "Kinh Nghiệm Luyện Nghe Tiếng Hàn",
        author: "Lê Văn C",
        date: "05/09/2025",
        excerpt: "Nghe là kỹ năng quan trọng nhưng nhiều người gặp khó khăn. Dưới đây là các phương pháp luyện nghe...",
        comments: 15,
        image: listen,
    },
];

const Community = () => {
    return (
        <main>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-green-50 to-green-100 py-24">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                    <AnimateOnView>
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                                Cộng đồng Học Tiếng Hàn
                            </h1>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                Chia sẻ kinh nghiệm, mẹo học, bài viết hữu ích và kết nối với những người học khác.
                            </p>
                        </div>
                    </AnimateOnView>
                    <AnimateOnView>
                        <img
                            src={communityHero}
                            alt="Community Hero"
                            className="w-full h-auto rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                    </AnimateOnView>
                </div>
            </section>

            {/* Posts Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
                    {posts.map((post) => (
                        <AnimateOnView key={post.id}>
                            <Link
                                to={`/homeindex/community/${post.id}`} // link tới chi tiết bài viết
                                className="block rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 duration-500 bg-white"
                            >
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6 space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                                    <p className="text-gray-700 text-sm">{post.excerpt}</p>
                                    <div className="flex items-center justify-between text-gray-500 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} /> {post.author}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} /> {post.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle size={16} /> {post.comments}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </AnimateOnView>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-green-100 to-teal-100 text-center">
                <div className="max-w-5xl mx-auto px-6 space-y-6">
                    <AnimateOnView>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                            Tham gia cộng đồng ngay hôm nay!
                        </h2>
                        <p className="text-gray-700 text-lg mb-6">
                            Chia sẻ kinh nghiệm học tập, đặt câu hỏi và kết nối với những người học khác.
                        </p>
                        <a
                            href="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-3xl font-semibold shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl"
                            style={{ backgroundColor: PRIMARY, color: "#fff" }}
                        >
                            Tham gia ngay
                        </a>
                    </AnimateOnView>
                </div>
            </section>
        </main>
    );
};

export default Community;
