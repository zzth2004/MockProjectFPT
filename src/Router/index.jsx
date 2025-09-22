// src/router/index.jsx
import {
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";


import { AnimatePresence } from "framer-motion";
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
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/homeindex" replace />} />

        <Route path="/reset-pass" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/verify" element={<PageWrapper><VerifyAccount /></PageWrapper>} />
        <Route path="/404" element={<PageWrapper><PageNotFound /></PageWrapper>} />

        {/* home index */}
        <Route path="/homeindex" element={<PageWrapper><KoreanHomepage /></PageWrapper>} />
        <Route path="/homeindex/aboutus" element={<PageWrapper><AboutUs /></PageWrapper>} />
        <Route path="/homeindex/community" element={<PageWrapper><Community /></PageWrapper>} />
        <Route path="/homeindex/community/:id" element={<PageWrapper><BlogPost /></PageWrapper>} />
        <Route path="/homeindex/features" element={<PageWrapper><Feature /></PageWrapper>} />
        <Route path="/homeindex/demo" element={<PageWrapper><DemoVideoPlayer /></PageWrapper>} />
        <Route path="/homeindex/courses" element={<PageWrapper><Course /></PageWrapper>} />
        {/* user */}


        <Route path="/user/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />

        {/* Course */}
        <Route path="/courses" element={<PageWrapper><Courses /></PageWrapper>} />
        <Route path="/user/mycourses" element={<PageWrapper><MyCourse /></PageWrapper>} />
        <Route path="/user/mycourses/:bookId" element={<PageWrapper><Lesson /></PageWrapper>} />
        <Route path="/user/mycourses/:bookId/:unitId" element={<PageWrapper><StudyPage /></PageWrapper>} />
        <Route
          path="/user/mycourses/:bookId/:unitId/vocabulary"
          element={<PageWrapper><StudyVocab /></PageWrapper>}
        />
        

        {/* quizz */}

        <Route path="/user/quizz/:bookId/:unitId/vocabulary" element={<PageWrapper><QuizzPlaypage /></PageWrapper>} />

        {/* messChat */}
        <Route path="/user/message" element={<PageWrapper><ChatUI /></PageWrapper>} />
        {/* settings */}
        <Route path="/user/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        <Route path="/user/logout" element={<PageWrapper><Logout /></PageWrapper>} />
        <Route path="/user/account" element={<PageWrapper><Account /></PageWrapper>} />

        {/* Schedule */}
        <Route path="/user/schedule" element={<PageWrapper><Schedule /></PageWrapper>} />
        <Route path="/user/schedule/:id" element={<PageWrapper><ScheduleDetail /></PageWrapper>} />

        {/* admin routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* catch all -> 404 */}
        <Route path="*" element={<PageWrapper><PageNotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
