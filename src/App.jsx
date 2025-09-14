import "./App.css";

import {
  Navigate,
  Routes,
  Route,
  BrowserRouter as Router,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AdminDashboard from "./AdminControl/Admin/admin.jsx";
import Login from './page/auth/Login.jsx';
import Register from './page/auth/Register.jsx';
import VerifyAccount from './page/auth/VerifyAccount.jsx';
import PageNotFound from './page/error/PageNotFound.jsx';
import ResetPassword from './page/auth/ResetPassword.jsx';
import KoreanHomepage from './page/homepage/HomePage.jsx';
import PageWrapper from './components/Wrapper/PageWrapper.jsx';
import AboutUs from './page/homepage/AboutUs.jsx';
import Community from './page/homepage/Comunity.jsx';
import BlogPost from './page/homepage/BlogPost.jsx';
import Feature from './page/homepage/Feature.jsx';
import Course from './page/homepage/Course.jsx';
import Dashboard from './page/mainpage/Dashboard.jsx';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>



        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/reset-pass" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/verify" element={<PageWrapper><VerifyAccount /></PageWrapper>} />
        <Route path="/404" element={<PageWrapper><PageNotFound /></PageWrapper>} />
        <Route path="/homeindex" element={<PageWrapper><KoreanHomepage /></PageWrapper>} />
        <Route path="/aboutus" element={<PageWrapper><AboutUs /></PageWrapper>} />
        <Route path="/community" element={<PageWrapper><Community /></PageWrapper>} />
        <Route path="/community/:id" element={<PageWrapper><BlogPost /></PageWrapper>} />
        <Route path="/features" element={<PageWrapper><Feature /></PageWrapper>} />
        <Route path="/courses" element={<PageWrapper><Course /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />

        {/* admin routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />


      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return <AnimatedRoutes />;
}
export default App;
