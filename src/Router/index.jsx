import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "../Router/ProtectedRoute.jsx";


import Login from "../page/auth/Login.jsx";
import Register from "../page/auth/Register.jsx";
import VerifyAccount from "../page/auth/VerifyAccount.jsx";
import PageNotFound from "../page/error/PageNotFound.jsx";
import ResetPassword from "../page/auth/ResetPassword.jsx";
import KoreanHomepage from "../page/homepage/HomePage.jsx";
import PageWrapper from "../components/Wrapper/PageWrapper.jsx";
import AboutUs from "../page/homepage/AboutUs.jsx";
import Community from "../page/homepage/Comunity.jsx";
import BlogPost from "../page/homepage/BlogPost.jsx";
import Feature from "../page/homepage/Feature.jsx";
import Course from "../page/homepage/Course.jsx";
import Courses from "../page/mainpage/Courses/Course/Course.jsx";
import MyCourse from "../page/mainpage/Courses/MyCourse/MyCourse.jsx";
import Dashboard from "../page/mainpage/Dashboard.jsx";
import ChatUI from "../page/mainpage/Chats/ChatUI.jsx";
import Schedule from "../page/mainpage/Schedule/Schedule.jsx";
import Settings from "../page/mainpage/Settings/Settings.jsx";
import Logout from "../page/mainpage/Settings/Logout.jsx";
import Account from "../page/mainpage/Account/Account.jsx";
import DemoVideoPlayer from "../page/mainpage/Courses/DemoPlan.jsx";
import ScheduleDetail from "../page/mainpage/Schedule/ScheduleDetail.jsx";

import StudyPage from "../page/mainpage/Courses/MyCourse/StudyPage.jsx";
import StudyVocab from "../page/mainpage/Courses/MyCourse/StudyVocab.jsx";
import QuizzPlaypage from "../page/mainpage/Quizzes/QuizzPlayPage.jsx";
import Page404 from "../page/error/PageNotFound2.jsx";
import CatchAll404 from "./CatchAll404.jsx";
// Thêm/Sửa các import này vào đoạn giữa file Router/index.jsx
import MainLayout2 from "../layout/MainLayout2.jsx";
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
import ChatPage from "../page/mainpage/Chats/ChatPages.jsx";
import BlogManagement from "../AdminControl/Admin/Blog/blog.ui.jsx"; // Kiểm tra lại đường dẫn này

import AdminLayout from "../layout/adminLayout.jsx"; // Import Layout mới
import DashboardHome from "../AdminControl/Admin/dashboardHome.jsx";

// admin
import UserList from "../AdminControl/Admin/User/user.ui.jsx";
import CourseList from "../AdminControl/Admin/Course/course.ui.jsx";
import CourseClassList from "../AdminControl/Admin/Course/course-class.ui.jsx";
import UserEnrollmentList from "../AdminControl/Admin/Course/user-enrollment.ui.jsx";
import LessonList from "../AdminControl/Admin/Course/Lesson/lesson.ui.jsx";
import LessonProgressList from "../AdminControl/Admin/Course/Lesson/lesson-progress.ui.jsx";
import GrammarList from "../AdminControl/Admin/Course/Lesson/Material/grammar.ui.jsx";
import VocabList from "../AdminControl/Admin/Course/Lesson/Material/vocab.ui.jsx";
import ExerciseList from "../AdminControl/Admin/Course/Lesson/Material/exercise.ui.jsx";
import AttemptList from "../AdminControl/Admin/Course/Lesson/Material/exercise-attemp.ui.jsx";
import SubscriptionPlanList from "../AdminControl/Admin/Subscription/subscription.ui.jsx";
import BookManagement from "../AdminControl/Admin/Book/book.ui.jsx";
import LateDevPage from "../AdminControl/Admin/latedev.ui.jsx";
import TeacherDashboardHome from "../AdminControl/teacherDashboard.ui.jsx";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/homeindex" replace />} />
        <Route path="/reset-pass" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/verify" element={<PageWrapper><VerifyAccount /></PageWrapper>} />
        // Routes
        <Route path="/404-1" element={<PageWrapper><PageNotFound /></PageWrapper>} />
        <Route path="/404-2" element={<PageWrapper><Page404 /></PageWrapper>} />



        {/* Home pages */}
        <Route path="/homeindex" element={<PageWrapper><KoreanHomepage /></PageWrapper>} />
        <Route path="/homeindex/aboutus" element={<PageWrapper><AboutUs /></PageWrapper>} />
        <Route path="/homeindex/community" element={<PageWrapper><Community /></PageWrapper>} />
        <Route path="/homeindex/community/:id" element={<PageWrapper><BlogPost /></PageWrapper>} />
        <Route path="/homeindex/features" element={<PageWrapper><Feature /></PageWrapper>} />
        <Route path="/homeindex/demo" element={<PageWrapper><DemoVideoPlayer /></PageWrapper>} />
        <Route path="/homeindex/courses" element={<PageWrapper><Course /></PageWrapper>} />


        <Route element={<MainLayout2 />}>
          <Route path="/user/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />

          {/* Courses */}
          <Route path="/courses" element={<PageWrapper><Courses /></PageWrapper>} />
          <Route path="/courses/general-learning" element={<PageWrapper><GeneralLearning /></PageWrapper>} />
          <Route path="/courses/mycourses" element={<PageWrapper><MyCourse /></PageWrapper>} />

          {/* General Learning Detail */}
          <Route path="/courses/general-learning/:unitId" element={<PageWrapper><StudyPage /></PageWrapper>} />
          <Route path="/courses/general-learning/:unitId/vocabulary" element={<PageWrapper><StudyVocab /></PageWrapper>} />
          <Route path="/courses/general-learning/:unitId/quiz" element={<PageWrapper><QuizzPlaypage /></PageWrapper>} />

          {/* MyCourse Detail */}
          <Route path="/courses/mycourses/:bookId" element={<PageWrapper><LessonDetail /></PageWrapper>} />
          <Route path="/courses/mycourses/:bookId/homework/:homeworkId" element={<PageWrapper><HomeworkSubmission /></PageWrapper>} />
          <Route path="/courses/mycourses/:bookId/:unitId" element={<PageWrapper><StudyPage /></PageWrapper>} />
          <Route path="/courses/mycourses/:bookId/:unitId/vocabulary" element={<PageWrapper><StudyVocab /></PageWrapper>} />

         {/* flashcard */}
          <Route path="/user/flashcards" element={<PageWrapper><FlashcardLibrary /></PageWrapper>} />
          <Route path="/user/flashcards/folder/:folderId" element={<PageWrapper><FolderDetail /></PageWrapper>} />
          <Route path="/user/flashcards/create-set" element={<PageWrapper><CreateSetPage /></PageWrapper>} />
          <Route path="/user/flashcards/study/:setId" element={<PageWrapper><StudyFlashcard /></PageWrapper>} />

          <Route path="/user/mycourses" element={<PageWrapper><ActiveCourses /></PageWrapper>} />
          <Route path="/user/mycourses/detail/:courseId" element={<PageWrapper><CourseDetail /></PageWrapper>} />
          <Route path="/user/mycourses/payment/:courseId" element={<PageWrapper><PaymentPage /></PageWrapper>} />

          {/* AI */}
          <Route path="/user/ai-support" element={<PageWrapper><AiSupportConsole /></PageWrapper>} />

          {/* Features */}
          <Route path="/user/message" element={<PageWrapper><ChatUI /></PageWrapper>} />
          <Route path="/user/schedule" element={<PageWrapper><Schedule /></PageWrapper>} />
          <Route path="/user/schedule/:id" element={<PageWrapper><ScheduleDetail /></PageWrapper>} />

          {/* Account */}
          {/* <Route path="/user/account" element={<PageWrapper><Account /></PageWrapper>} /> */}
          <Route path="/user/settings" element={<PageWrapper><Settings /></PageWrapper>} />
          <Route path="/user/logout" element={<PageWrapper><Logout /></PageWrapper>} />
          <Route path="/user/support" element={<PageWrapper><SupportPage /></PageWrapper>} />
          <Route path="/user/upgrade" element={<PageWrapper><UpgradePage /></PageWrapper>} />
          <Route path="/user/chats" element={<PageWrapper><ChatPage /></PageWrapper>} />
          <Route path="/user/chats/:id" element={<PageWrapper><ChatPage /></PageWrapper>} />

        </Route>

        {/* --- ADMIN ROUTES (Cải tiến) --- */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          {/* Đây là các Route con sẽ hiển thị vào <Outlet /> trong AdminLayout */}
          <Route index element={<DashboardHome />} />


          <Route path="classes" element={<PageWrapper><CourseClassList /></PageWrapper>} />
          <Route
            path="users"
            element={
              <PageWrapper>
                <UserList />
              </PageWrapper>
            }
          />
          <Route
            path="courses"
            element={
              <PageWrapper>
                <CourseList />
              </PageWrapper>
            }
          />
          <Route
            path="enrollments"
            element={
              <PageWrapper>
                <UserEnrollmentList />
              </PageWrapper>
            }
          />
          <Route
            path="lessons"
            element={
              <PageWrapper>
                <LessonList />
              </PageWrapper>
            }
          />
          <Route
            path="lesson-progress"
            element={
              <PageWrapper>
                <LessonProgressList />
              </PageWrapper>
            }
          />
          <Route
            path="grammar"
            element={
              <PageWrapper>
                <GrammarList />
              </PageWrapper>
            }
          />
          <Route
            path="vocabulary"
            element={
              <PageWrapper>
                <VocabList />
              </PageWrapper>
            }
          />
          
          <Route
            path="exercises"
            element={
              <PageWrapper>
                <ExerciseList />
              </PageWrapper>
            }
          />
          <Route
            path="exercise-attempts"
            element={
              <PageWrapper>
                <AttemptList />
              </PageWrapper>
            }
          />
          <Route
            path="flashcards"
            element={
              <PageWrapper>
                <AttemptList />
              </PageWrapper>
            }
          />
          <Route
            path="plans"
            element={
              <PageWrapper>
                <SubscriptionPlanList />
              </PageWrapper>
            }
          />
          <Route
            path="books"
            element={
              <PageWrapper>
                <BookManagement />
              </PageWrapper>
            }
          />
          <Route
            path="late-dev"
            element={
              <PageWrapper>
                <LateDevPage />
              </PageWrapper>
            }
          />
          <Route
            path="blog"
            element={
              <PageWrapper>
                <BlogManagement />
              </PageWrapper>
            }
          />
          <Route path="teacher/dashboard" element={<TeacherDashboardHome />} />

        </Route>

        {/* Catch all */}
        <Route path="*" element={<PageWrapper><CatchAll404 /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
