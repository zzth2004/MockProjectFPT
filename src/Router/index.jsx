import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "../Router/ProtectedRoute.jsx";

import AdminDashboard from "../AdminControl/Admin/admin.jsx";
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
import Lesson from "../page/mainpage/Courses/MyCourse/Lesson.jsx"
import StudyPage from "../page/mainpage/Courses/MyCourse/StudyPage.jsx";
import StudyVocab from "../page/mainpage/Courses/MyCourse/StudyVocab.jsx";
import QuizzPlaypage from "../page/mainpage/Quizzes/QuizzPlayPage.jsx";
import Page404 from "../page/error/PageNotFound2.jsx";
import CatchAll404 from "./CatchAll404.jsx";
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

        {/* User routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><Dashboard /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><Courses /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/mycourses" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><MyCourse /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/mycourses/:bookId" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><Lesson /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/mycourses/:bookId/:unitId" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><StudyPage /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/mycourses/:bookId/:unitId/vocabulary" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><StudyVocab /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/quizz/:bookId/:unitId/vocabulary" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><QuizzPlaypage /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/message" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><ChatUI /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/settings" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><Settings /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/logout" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><Logout /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/account" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><Account /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/schedule" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><Schedule /></PageWrapper>
          </ProtectedRoute>
        } />
        <Route path="/user/schedule/:id" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PageWrapper><ScheduleDetail /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<PageWrapper><CatchAll404 /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
