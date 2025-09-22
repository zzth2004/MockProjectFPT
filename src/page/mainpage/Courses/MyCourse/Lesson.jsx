
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout2 from "../../../../layout/MainLayout2";
import AnimateOnView from "../../../../components/Wrapper/WrapperMotion";
import LessonCard from "../../../../components/StudyComponent/LessonCard"; // 
import unitImg from "../../../../assets/schedule1.png";

const lessonsData = [
    {
        id: 1,
        title: "Unit 1 - Introduction - 소개하다",
        subtitle: "Learn how to introduce yourself and others in Korean",
        image: unitImg,
    },
    {
        id: 2,
        title: "Unit 2 - Healthy - 건강",
        subtitle: "Learn vocabulary and phrases about health and wellness",
        image: unitImg,
    },
    {
        id: 3,
        title: "Unit 3 - Travel - 여행",
        subtitle: "Learn expressions and words for traveling in Korea",
        image: unitImg,
    },
    {
        id: 4,
        title: "Unit 4 - Movies - 영화",
        subtitle: "Discuss movies, genres, and favorite films in Korean",
        image: unitImg,
    },
    {
        id: 5,
        title: "Unit 5 - Occupation - 직업",
        subtitle: "Learn how to talk about jobs and occupations",
        image: unitImg,
    },
    {
        id: 6,
        title: "Unit 6 - Hobbies - 취미",
        subtitle: "Learn vocabulary and phrases for hobbies and interests",
        image: unitImg,
    },
];



export default function LessonPage() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    return (
        <MainLayout2>
            <div className="bg-gray-50 max-h-[90vh] overflow-y-auto py-6">
                <AnimateOnView>
                    <section className="max-w-5xl mx-auto space-y-4">
                        

                        <div className="flex flex-col gap-4">
                            {lessonsData.map((lesson) => (
                                <LessonCard
                                    key={lesson.id}
                                    image={lesson.image}
                                    title={lesson.title}
                                    subtitle={lesson.subtitle}
                                    onClick={() => navigate(`/user/mycourses/${bookId}/${lesson.id}`)}
                                />
                            ))}
                        </div>
                    </section>
                </AnimateOnView>
            </div>
        </MainLayout2>

    );
}
