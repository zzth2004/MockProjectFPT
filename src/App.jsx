import "./App.css";

import {
  Navigate,
  Routes,
  Route,
  BrowserRouter as Router,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
// import Login from "./page/auth/Login.jsx";
// import Register from "./page/auth/Register.jsx";
// import VerifyAccount from "./page/auth/VerifyAccount.jsx";
import PageNotFound from "./page/error/PageNotFound.jsx";
// import ResetPassword from "./page/auth/ResetPassword.jsx";
import KoreanHomepage from "./page/homepage/HomePage.jsx";
import PageWrapper from "./components/Wrapper/PageWrapper.jsx";
import AdminDashboard from "./AdminControl/Admin/admin.jsx";
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/homeindex" replace />} />

        {/* Admin Dashboard */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* <Route
          path="/reset-pass"
          element={
            <PageWrapper>
              <ResetPassword />
            </PageWrapper>
          }
        /> */}
        {/* <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <PageWrapper>
              <Register />
            </PageWrapper>
          }
        /> */}
        {/* <Route
          path="/verify"
          element={
            <PageWrapper>
              <VerifyAccount />
            </PageWrapper>
          }
        /> */}
        <Route
          path="/404"
          element={
            <PageWrapper>
              <PageNotFound />
            </PageWrapper>
          }
        />
        <Route
          path="/homeindex"
          element={
            <PageWrapper>
              <KoreanHomepage />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return <AnimatedRoutes />;
}
export default App;
