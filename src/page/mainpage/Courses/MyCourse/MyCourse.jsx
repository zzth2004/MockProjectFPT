// src/pages/Course.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout2 from "../../../../layout/MainLayout2";
import AnimateOnView from "../../../../components/Wrapper/WrapperMotion";
import BookCard from "../../../../components/StudyComponent/BookCard";
import yonsei from "../../../../assets/yonsei.webp";
import sojong from "../../../../assets/sojong.png";

const booksData = [
    { id: 1, title: "Sojong 1", subtitle: "Tiếng Hàn Tổng hợp 1", image: sojong },
    { id: 2, title: "Sojong 2", subtitle: "Tiếng Hàn Tổng hợp 2", image: sojong },
    { id: 3, title: "Yonsei 1", subtitle: "Tiếng Hàn Yonsei 1", image: yonsei },
    { id: 4, title: "Yonsei 2", subtitle: "Tiếng Hàn Yonsei 2", image: yonsei },
];

const MyCourse = () => {
    const navigate = useNavigate();
    return (
        <MainLayout2>
            <div className="bg-gray-50 max-h-[80vh] py-8 px-4">
                <AnimateOnView>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 text-center">
                        Tất cả giáo trình Tiếng Hàn
                    </h1>

                    <div className="grid grid-cols-6 gap-6">
                        {booksData.map((book) => (
                            <div
                                key={book.id}
                                className="col-span-6 md:col-span-3 lg:col-span-2"
                            >
                                <BookCard
                                    image={book.image}
                                    title={book.title}
                                    subtitle={book.subtitle}
                                    btnText="Học tiếp"
                                    onClick={() => navigate(`/user/mycourses/${book.id}`)}
                                />
                            </div>
                        ))}
                    </div>

                </AnimateOnView>
            </div>
        </MainLayout2>
    );
};

export default MyCourse;
