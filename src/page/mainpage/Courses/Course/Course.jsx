// src/pages/Course.jsx
import React from "react";
import MainLayout2 from "../../../../layout/MainLayout2";
import AnimateOnView from "../../../../components/Wrapper/WrapperMotion";
import BookCard from "../../../../components/StudyComponent/BookCard";
import yonsei from "../../../../assets/yonsei.webp";
import sojong from "../../../../assets/sojong.png";

const booksData = [
    { id: 1, title: "Sojong 1", subtitle: "Tiếng Hàn Tổng hợp 1", image: sojong },
    { id: 2, title: "Sojong 2", subtitle: "Tiếng Hàn Tổng hợp 2", image: sojong },
    { id: 3, title: "Yonsei 1", subtitle: "Tiếng Hàn Tổng hợp 3", image: sojong },
    { id: 4, title: "Yonsei 2", subtitle: "Tiếng Hàn Tổng hợp 4", image: sojong },
    { id: 5, title: "Yonsei 2", subtitle: "Tiếng Hàn Tổng hợp 5", image: sojong },
    { id: 6, title: "Yonsei 2", subtitle: "Tiếng Hàn Tổng hợp 6", image: sojong },
    { id: 7, title: "Yonsei 1", subtitle: "Tiếng Hàn Yonsei 1", image: yonsei },
    { id: 8, title: "Yonsei 2", subtitle: "Tiếng Hàn Yonsei 2", image: yonsei },
    { id: 9, title: "Yonsei 3", subtitle: "Tiếng Hàn Yonsei 3", image: yonsei },
    { id: 10, title: "Yonsei 4", subtitle: "Tiếng Hàn Yonsei 4", image: yonsei },
    { id: 11, title: "Yonsei 5", subtitle: "Tiếng Hàn Yonsei 5", image: yonsei },
    { id: 12, title: "Yonsei 6", subtitle: "Tiếng Hàn Yonsei 6", image: yonsei },
];

const Course = () => {
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
                                    btnText="Đăng kí"
                                    onClick={() => alert(`Bạn chọn: ${book.title}`)}
                                />
                            </div>
                        ))}
                    </div>

                </AnimateOnView>
            </div>
        </MainLayout2>
    );
};

export default Course;
