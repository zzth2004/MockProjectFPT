import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Layout
import MainLayout2 from "../layout/MainLayout2";
import PageWrapper from "../components/Wrapper/PageWrapper.jsx";

// Auth
import Login from "../page/auth/Login.jsx";
import Register from "../page/auth/Register.jsx";
import VerifyAccount from "../page/auth/VerifyAccount.jsx";
import ResetPassword from "../page/auth/ResetPassword.jsx";
import AccountPage from "../page/mainpage/User/AccountPage.jsx";
import SupportPage from "../page/mainpage/Settings/Support.jsx";

// Public
import KoreanHomepage from "../page/homepage/HomePage.jsx";
import AboutUs from "../page/homepage/AboutUs.jsx";
import Community from "../page/homepage/Comunity.jsx";
import BlogPost from "../page/homepage/BlogPost.jsx";
import Feature from "../page/homepage/Feature.jsx";
import CoursePublic from "../page/homepage/Course.jsx";
import DemoVideoPlayer from "../page/mainpage/Courses/DemoPlan.jsx";
import HomeworkSubmission from "../page/mainpage/Courses/MyCourse/HomeworkSubmission.jsx";

// Main App
import Dashboard from "../page/mainpage/Dashboard.jsx";
import Courses from "../page/mainpage/Courses/Course/Course.jsx";
import GeneralLearning from "../page/mainpage/Courses/general-learning/general-learning.jsx";
import MyCourse from "../page/mainpage/Courses/MyCourse/MyCourse.jsx";
import LessonDetail from "../page/mainpage/Courses/MyCourse/LessonDetail.jsx";
import StudyPage from "../page/mainpage/Courses/MyCourse/StudyPage.jsx";
import StudyVocab from "../page/mainpage/Courses/MyCourse/StudyVocab.jsx";
import QuizzPlaypage from "../page/mainpage/Quizzes/QuizzPlayPage.jsx";
import ChatUI from "../page/mainpage/Chats/ChatUI.jsx";
import Schedule from "../page/mainpage/Schedule/Schedule.jsx";
import ScheduleDetail from "../page/mainpage/Schedule/ScheduleDetail.jsx";
import Settings from "../page/mainpage/Settings/Settings.jsx";
import Logout from "../page/mainpage/Settings/Logout.jsx";
import Account from "../page/mainpage/Account/Account.jsx";
import FlashcardLibrary from "../page/mainpage/Flashcard/FlashcardLibrary.jsx";
import CreateSetPage from "../page/mainpage/Flashcard/CreateSetPage.jsx";
import FolderDetail from "../page/mainpage/Flashcard/FolderDetail.jsx";
import StudyFlashcard from "../page/mainpage/Flashcard/StudyFlashcard";

import ActiveCourses from "../page/mainpage/ActiveCourse/ActiveCourses.jsx";
import CourseDetail from "../page/mainpage/ActiveCourse/CourseDetail.jsx";
import PaymentPage from "../page/mainpage/Payment/Payment.jsx";
import UpgradePage from "../page/mainpage/Upgrade/Upgrade.jsx";
import ChatPage from "../page/mainpage/Chats/ChatPages.jsx";
import AiSupportConsole from "../page/mainpage/AISupport/AiSupportConsole.jsx";

// Admin & Error
import AdminDashboard from "../AdminControl/Admin/admin.jsx";
import PageNotFound from "../page/error/PageNotFound.jsx";
import Page404 from "../page/error/PageNotFound2.jsx";
import CatchAll404 from "./CatchAll404.jsx";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split("/")[1]}>
        {/* Redirect */}
        <Route path="/" element={<Navigate to="/homeindex" replace />} />
        

        {/* Auth */}
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/verify" element={<PageWrapper><VerifyAccount /></PageWrapper>} />
        <Route path="/reset-pass" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        <Route path="/user/profile" element={<PageWrapper><AccountPage /></PageWrapper>}
/>
       

        {/* Public */}
        <Route path="/homeindex" element={<PageWrapper><KoreanHomepage /></PageWrapper>} />
        <Route path="/homeindex/aboutus" element={<PageWrapper><AboutUs /></PageWrapper>} />
        <Route path="/homeindex/community" element={<PageWrapper><Community /></PageWrapper>} />
        <Route path="/homeindex/community/:id" element={<PageWrapper><BlogPost /></PageWrapper>} />
        <Route path="/homeindex/features" element={<PageWrapper><Feature /></PageWrapper>} />
        <Route path="/homeindex/demo" element={<PageWrapper><DemoVideoPlayer /></PageWrapper>} />
        <Route path="/homeindex/courses" element={<PageWrapper><CoursePublic /></PageWrapper>} />

        {/* --- NHÓM 1: CÓ SIDEBAR & HEADER (MainLayout2) --- */}
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

        {/* --- NHÓM 2: FULL MÀN HÌNH (Không Sidebar) --- */}
        {/* Quan trọng: Route này phải nằm TRONG thẻ <Routes> */}

        {/* Admin & Teacher */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/teacher/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />

        {/* Errors */}
        <Route path="/404-1" element={<PageWrapper><PageNotFound /></PageWrapper>} />
        <Route path="/404-2" element={<PageWrapper><Page404 /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><CatchAll404 /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;