// src/pages/Course.jsx
import React from "react";
import MainLayout from "../../layout/MainLayout";
import { PlayCircle } from "lucide-react";
import AnimateOnView from "../../components/Wrapper/WrapperMotion";

// Danh sách unit Sojong (1→6)
const sojongUnits = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Sojong ${i + 1}`,
    description: `Tiếng Hàn Tổng hợp ${i + 1}`,
    image: `https://source.unsplash.com/400x300/?korean,${i + 1}`, // lấy ảnh minh họa đại
}));

// Danh sách unit Yonsei (1→6)
const yonseiUnits = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Yonsei ${i + 1}`,
    description: `Tiếng Hàn Tổng hợp ${i + 1}`,
    image: `https://source.unsplash.com/400x300/?korean,${i + 7}`, // lấy ảnh minh họa đại
}));

const Course = () => {
    const renderUnits = (units) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {units.map((unit) => (
                <div
                    key={unit.id}
                    className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition flex flex-col"
                >
                    <img
                        src={unit.image}
                        alt={unit.title}
                        className="w-full h-48 object-cover"
                    />
                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mt-2">{unit.title}</h2>
                            <p className="text-gray-700 mt-2">{unit.description}</p>
                        </div>
                        <div className="mt-4">
                            <button className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-2xl shadow hover:bg-green-700 transition flex items-center justify-center gap-2">
                                <PlayCircle size={20} /> Bắt đầu học
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <MainLayout>
            <AnimateOnView>
                <section className="bg-gray-50 py-16">
                    <div className="max-w-6xl mx-auto px-6 space-y-12">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Giáo trình Học Tiếng Hàn - Sojong</h1>
                            {renderUnits(sojongUnits)}
                        </div>

                    </div>
                </section>
            </AnimateOnView>
            <AnimateOnView>
                <section className="bg-gray-50 py-16">
                    <div className="max-w-6xl mx-auto px-6 space-y-12">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Giáo trình Học Tiếng Hàn - Yonsei</h1>
                            {renderUnits(yonseiUnits)}
                        </div>

                    </div>
                </section>
            </AnimateOnView>
        </MainLayout>
    );
};

export default Course;
