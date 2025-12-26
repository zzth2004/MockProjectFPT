import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "../Router/ProtectedRoute.jsx";
import { useAuth } from "../context/authContext.jsx"; // Đảm bảo import useAuth

// --- AUTH PAGES ---
import Login from "../page/auth/Login.jsx";
import Register from "../page/auth/Register.jsx";
import VerifyAccount from "../page/auth/VerifyAccount.jsx";
import ResetPassword from "../page/auth/ResetPassword.jsx";

// --- HOMEPAGE ---
import KoreanHomepage from "../page/homepage/HomePage.jsx";
import PageWrapper from "../components/Wrapper/PageWrapper.jsx";
import AboutUs from "../page/homepage/AboutUs.jsx";
import Community from "../page/homepage/Comunity.jsx";
import BlogPost from "../page/homepage/BlogPost.jsx";
import Feature from "../page/homepage/Feature.jsx";
import Course from "../page/homepage/Course.jsx";

// --- MAIN USER PAGES ---
import MainLayout from "../layout/MainLayout.jsx";
import MainLayout2 from "../layout/MainLayout2.jsx";
import Courses from "../page/mainpage/Courses/Course/Course.jsx";
import CourseListGrid from "../page/mainpage/Courses/general-learning/general-course.jsx";
import MyCourse from "../page/mainpage/Courses/MyCourse/MyCourse.jsx";
import Dashboard from "../page/mainpage/Dashboard.jsx";
import ChatUI from "../page/mainpage/Chats/ChatUI.jsx";
import ChatPage from "../page/mainpage/Chats/ChatPages.jsx";
import Schedule from "../page/mainpage/Schedule/Schedule.jsx";
import Settings from "../page/mainpage/Settings/Settings.jsx";
import Logout from "../page/mainpage/Settings/Logout.jsx";
import DemoVideoPlayer from "../page/mainpage/Courses/DemoPlan.jsx";
import ScheduleDetail from "../page/mainpage/Schedule/ScheduleDetail.jsx";
import StudyPage from "../page/mainpage/Courses/MyCourse/StudyPage.jsx";
import StudyVocab from "../page/mainpage/Courses/MyCourse/StudyVocab.jsx";
import QuizzPlaypage from "../page/mainpage/Quizzes/QuizzPlayPage.jsx";
import GeneralLearning from "../page/mainpage/Courses/general-learning/general-learning.jsx";
import LessonDetail from "../page/mainpage/Courses/MyCourse/LessonDetail.jsx";
import HomeworkSubmission from "../page/mainpage/Courses/MyCourse/HomeworkSubmission.jsx";
import FlashcardLibrary from "../page/mainpage/Flashcard/FlashcardLibrary.jsx";
import FolderDetail from "../page/mainpage/Flashcard/FolderDetail.jsx";
import CreateSetPage from "../page/mainpage/Flashcard/CreateSetPage.jsx";
import StudyFlashcard from "../page/mainpage/Flashcard/StudyFlashcard.jsx";
import ActiveCourses from "../page/mainpage/ActiveCourse/ActiveCourses.jsx";
import CourseDetail from "../page/mainpage/ActiveCourse/CourseDetail.jsx";
import PaymentPage from "../page/mainpage/Payment/Payment.jsx";
import AiSupportConsole from "../page/mainpage/AISupport/AiSupportConsole.jsx";
import SupportPage from "../page/mainpage/Settings/Support.jsx";
import UpgradePage from "../page/mainpage/Upgrade/Upgrade.jsx";

// --- ADMIN & TEACHER PAGES ---
import AdminLayout from "../layout/adminLayout.jsx"; 
import DashboardHome from "../AdminControl/Admin/dashboardHome.jsx";
import TeacherDashboardHome from "../TeacherControl/teacherDashboard.ui.jsx";
import ScheduleTeacher from "../AdminControl/Admin/Schedule/Schedule.jsx";
import ScheduleDetailTeacher from "../AdminControl/Admin/Schedule/schedule-detail.jsx";


// ... Import các file UI quản lý (User, Course, Lesson...)
import UserList from "../AdminControl/Admin/User/user.ui.jsx";
import UserDetail from "../AdminControl/Admin/User/user-detail.jsx";
import CourseList from "../AdminControl/Admin/Course/course.ui.jsx";
import CreateCourse from "../AdminControl/Admin/Course/CreateCourse.jsx";
import CourseDetailAdmin from "../AdminControl/Admin/Course/course-detail.jsx";
import EditCourse from "../AdminControl/Admin/Course/edit-course.jsx";
import CourseLessons from "../AdminControl/Admin/Course/course-lesson.jsx";
import CourseClassList from "../AdminControl/Admin/Class/course-class.ui.jsx";
import CreateClass from "../AdminControl/Admin/Class/CreateClass.jsx";
import ClassDetail from "../AdminControl/Admin/Class/class-detail.jsx";
import EditClass from "../AdminControl/Admin/Class/edit-class.jsx";
import UserEnrollmentList from "../AdminControl/Admin/Course/user-enrollment.ui.jsx";
import LessonList from "../AdminControl/Admin/Course/Lesson/lesson.ui.jsx";
import CreateLesson from "../AdminControl/Admin/Course/Lesson/create-lesson.jsx";
import EditLesson from "../AdminControl/Admin/Course/Lesson/edit-lesson.jsx";
import LessonProgressList from "../AdminControl/Admin/Course/Lesson/lesson-progress.ui.jsx";
import GrammarList from "../AdminControl/Admin/Course/Lesson/Material/grammar.ui.jsx";
import VocabList from "../AdminControl/Admin/Course/Lesson/Material/vocab.ui.jsx";
import ExerciseList from "../AdminControl/Admin/Course/Lesson/Material/exercise.ui.jsx";
import AttemptList from "../AdminControl/Admin/Course/Lesson/Material/exercise-attemp.ui.jsx";
import SubscriptionPlanList from "../AdminControl/Admin/Subscription/subscription.ui.jsx";
import BookManagement from "../AdminControl/Admin/Book/book.ui.jsx";
import BlogManagement from "../AdminControl/Admin/Blog/blog.ui.jsx";
import LateDevPage from "../AdminControl/Admin/latedev.ui.jsx";

import CatchAll404 from "./CatchAll404.jsx";

import TeacherDashboardHome from "../AdminControl/teacherDashboard.ui.jsx";
import CreateCourse from "../AdminControl/Admin/Course/CreateCourse.jsx";
import CourseDetailAdmin from "../AdminControl/Admin/Course/course-detail.jsx";
import EditCourse from "../AdminControl/Admin/Course/edit-course.jsx";
import CourseLessons from "../AdminControl/Admin/Course/course-lesson.jsx";
import CreateLesson from "../AdminControl/Admin/Course/Lesson/create-lesson.jsx";
import EditLesson from "../AdminControl/Admin/Course/Lesson/edit-lesson.jsx";
import ClassDetail from "../AdminControl/Admin/Class/class-detail.jsx";
import EditClass from "../AdminControl/Admin/Class/edit-class.jsx";
import UserDetail from "../AdminControl/Admin/User/user-detail.jsx";


import MainLayout from "../layout/MainLayout.jsx";
import CourseListGrid from "../page/mainpage/Courses/general-learning/general-course.jsx";

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth(); // Lấy thông tin user để điều hướng trang chủ

  // Component điều hướng thông minh cho đường dẫn gốc "/"
  const RootRedirect = () => {
    if (!user) return <Navigate to="/homeindex" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* --- 1. ROOT & PUBLIC ROUTES --- */}
        <Route path="/" element={<RootRedirect />} />

        {/* Các trang Public có Layout Main */}
        <Route element={<MainLayout />}>
          <Route path="/homeindex" element={<PageWrapper><KoreanHomepage /></PageWrapper>} />
          <Route path="/homeindex/aboutus" element={<PageWrapper><AboutUs /></PageWrapper>} />
          <Route path="/homeindex/features" element={<PageWrapper><Feature /></PageWrapper>} />
          <Route path="/homeindex/demo" element={<PageWrapper><DemoVideoPlayer /></PageWrapper>} />
          <Route path="/homeindex/courses" element={<PageWrapper><Course /></PageWrapper>} />
          <Route path="/homeindex/community" element={<PageWrapper><Community /></PageWrapper>} />
          <Route path="/homeindex/community/:id" element={<PageWrapper><BlogPost /></PageWrapper>} />
          
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/reset-pass" element={<PageWrapper><ResetPassword /></PageWrapper>} />
          <Route path="/verify" element={<PageWrapper><VerifyAccount /></PageWrapper>} />
        </Route>

        {/* --- 2. USER ROUTES (Layout MainLayout2) --- */}
        <Route element={<MainLayout2 />}>
          <Route path="/user/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          
          <Route path="/courses" element={<PageWrapper><Courses /></PageWrapper>} />
          <Route path="/courses/general-course" element={<PageWrapper><CourseListGrid /></PageWrapper>} /> 
          <Route path="/courses/:slug" element={<PageWrapper><GeneralLearning /></PageWrapper>} />
          <Route path="/courses/learning/:lessonId" element={<PageWrapper><StudyPage /></PageWrapper>} />
          <Route path="/courses/mycourses" element={<PageWrapper><MyCourse /></PageWrapper>} />

          <Route path="/courses/general-learning/:unitId" element={<PageWrapper><StudyPage /></PageWrapper>} />
          <Route path="/courses/learning/:lessonId/vocabulary" element={<PageWrapper><StudyVocab /></PageWrapper>} />
          <Route path="/courses/learning/:lessonId/quizzes/:exerciseId" element={<PageWrapper><QuizzPlaypage /></PageWrapper>} />


          {/* MyCourse Detail */}
          <Route path="/courses/mycourses/:courseId" element={<PageWrapper><LessonDetail /></PageWrapper>} />
          <Route path="/courses/mycourses/:courseId/homework/:homeworkId" element={<PageWrapper><HomeworkSubmission /></PageWrapper>} />
          <Route path="/courses/mycourses/:courseId/:unitId" element={<PageWrapper><StudyPage /></PageWrapper>} />
          <Route path="/courses/mycourses/:courseId/:unitId/vocabulary" element={<PageWrapper><StudyVocab /></PageWrapper>} />

          <Route path="/user/flashcards" element={<PageWrapper><FlashcardLibrary /></PageWrapper>} />
          <Route path="/user/flashcards/folder/:folderId" element={<PageWrapper><FolderDetail /></PageWrapper>} />
          <Route path="/user/flashcards/create-set" element={<PageWrapper><CreateSetPage /></PageWrapper>} />
          <Route path="/user/flashcards/study/:setId" element={<PageWrapper><StudyFlashcard /></PageWrapper>} />

          <Route path="/user/active-courses" element={<PageWrapper><ActiveCourses /></PageWrapper>} />
          <Route path="/user/active-courses/detail/:courseId" element={<PageWrapper><CourseDetail /></PageWrapper>} />
          <Route path="/user/active-courses/payment/:courseId" element={<PageWrapper><PaymentPage /></PageWrapper>} />

          <Route path="/user/ai-support" element={<PageWrapper><AiSupportConsole /></PageWrapper>} />
          <Route path="/user/message" element={<PageWrapper><ChatUI /></PageWrapper>} />
          <Route path="/user/schedule" element={<PageWrapper><Schedule /></PageWrapper>} />
          <Route path="/user/schedule/:id" element={<PageWrapper><ScheduleDetail /></PageWrapper>} />
          <Route path="/user/settings" element={<PageWrapper><Settings /></PageWrapper>} />
          <Route path="/user/logout" element={<PageWrapper><Logout /></PageWrapper>} />
          <Route path="/user/support" element={<PageWrapper><SupportPage /></PageWrapper>} />
          <Route path="/user/upgrade" element={<PageWrapper><UpgradePage /></PageWrapper>} />
          <Route path="/user/chats" element={<PageWrapper><ChatPage /></PageWrapper>} />
          <Route path="/user/chats/:id" element={<PageWrapper><ChatPage /></PageWrapper>} />
        </Route>

        {/* --- 3. ADMIN ROUTES (URL: /admin/...) --- */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout currentRole="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          
          {/* Quản lý User (Chỉ Admin) */}
          <Route path="users" element={<PageWrapper><UserList /></PageWrapper>} />
          <Route path="users/:id" element={<PageWrapper><UserDetail /></PageWrapper>} />

          {/* Quản lý Khóa học */}
          <Route path="courses" element={<PageWrapper><CourseList /></PageWrapper>} />
          <Route path="courses/create" element={<PageWrapper><CreateCourse /></PageWrapper>} />
          <Route path="courses/:id/detail" element={<PageWrapper><CourseDetailAdmin /></PageWrapper>} />
          <Route path="courses/edit/:id" element={<PageWrapper><EditCourse /></PageWrapper>} />
          <Route path="courses/:id/lessons" element={<PageWrapper><CourseLessons /></PageWrapper>} />

          {/* Quản lý Bài học */}
          <Route path="lessons" element={<PageWrapper><LessonList /></PageWrapper>} />
          <Route path="lessons/create" element={<PageWrapper><CreateLesson /></PageWrapper>} />
          <Route path="lessons/edit/:lessonId" element={<PageWrapper><EditLesson /></PageWrapper>} />
          <Route path="lesson-progress" element={<PageWrapper><LessonProgressList /></PageWrapper>} />

          {/* Quản lý Lớp học */}
          <Route path="classes" element={<PageWrapper><CourseClassList /></PageWrapper>} />
          <Route path="classes/create" element={<PageWrapper><CreateClass /></PageWrapper>} />
          <Route path="classes/:id" element={<PageWrapper><ClassDetail /></PageWrapper>} />
          <Route path="classes/edit/:id" element={<PageWrapper><EditClass /></PageWrapper>} />
          
          {/* Quản lý Ghi danh & Doanh thu */}
          <Route path="enrollments" element={<PageWrapper><UserEnrollmentList /></PageWrapper>} />
          <Route path="plans" element={<PageWrapper><SubscriptionPlanList /></PageWrapper>} />

          {/* Tài nguyên học tập */}
          <Route path="grammar" element={<PageWrapper><GrammarList /></PageWrapper>} />
          <Route path="vocabulary" element={<PageWrapper><VocabList /></PageWrapper>} />
          <Route path="exercises" element={<PageWrapper><ExerciseList /></PageWrapper>} />
          <Route path="exercise-attempts" element={<PageWrapper><AttemptList /></PageWrapper>} />
          <Route path="flashcards" element={<PageWrapper><AttemptList /></PageWrapper>} />
          <Route path="books" element={<PageWrapper><BookManagement /></PageWrapper>} />
          <Route path="blog" element={<PageWrapper><BlogManagement /></PageWrapper>} />
          <Route path="late-dev" element={<PageWrapper><LateDevPage /></PageWrapper>} />
        </Route>

        {/* --- 4. TEACHER ROUTES (URL: /teacher/...) --- */}
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AdminLayout currentRole="teacher" />
            </ProtectedRoute>
          }
        >


          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardHome />} />
           <Route path="users" element={<PageWrapper><UserList /></PageWrapper>} />


          {/* Teacher quản lý khóa học (Dùng chung component nhưng URL khác) */}
          <Route path="courses" element={<PageWrapper><CourseList /></PageWrapper>} />
          <Route path="courses/create" element={<PageWrapper><CreateCourse /></PageWrapper>} />
          <Route path="courses/:id/detail" element={<PageWrapper><CourseDetailAdmin /></PageWrapper>} />
          <Route path="courses/:id/lessons" element={<PageWrapper><CourseLessons /></PageWrapper>} />
          {/* Tùy chỉnh: Teacher có được tạo/sửa khóa không? Nếu có thì thêm route create/edit vào đây */}
          <Route path="courses/edit/:id" element={<PageWrapper><EditCourse /></PageWrapper>} />
          <Route path="scheduleteacher" element={<PageWrapper><ScheduleTeacher /></PageWrapper>} />
          <Route path="scheduleteacher/:id" element={<PageWrapper><ScheduleDetailTeacher /></PageWrapper>} />
          {/* Teacher quản lý lớp học */}
          <Route path="classes" element={<PageWrapper><CourseClassList /></PageWrapper>} />
          <Route path="classes/create" element={<PageWrapper><CreateClass /></PageWrapper>} />
          <Route path="classes/:id" element={<PageWrapper><ClassDetail /></PageWrapper>} />
          <Route path="classes/edit/:id" element={<PageWrapper><EditClass /></PageWrapper>} />
          <Route path="enrollments" element={<PageWrapper><UserEnrollmentList /></PageWrapper>} />

          {/* Teacher quản lý bài học */}
          <Route path="lessons" element={<PageWrapper><LessonList /></PageWrapper>} />
          <Route path="lessons/create" element={<PageWrapper><CreateLesson /></PageWrapper>} />
          <Route path="lessons/edit/:lessonId" element={<PageWrapper><EditLesson /></PageWrapper>} />
          
          <Route path="grammar" element={<PageWrapper><GrammarList /></PageWrapper>} />
          <Route path="vocabulary" element={<PageWrapper><VocabList /></PageWrapper>} />
          <Route path="exercises" element={<PageWrapper><ExerciseList /></PageWrapper>} />
          <Route path="exercise-attempts" element={<PageWrapper><AttemptList /></PageWrapper>} />
          <Route path="blog" element={<PageWrapper><BlogManagement /></PageWrapper>} />
          <Route path="late-dev" element={<PageWrapper><LateDevPage /></PageWrapper>} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<PageWrapper><CatchAll404 /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;