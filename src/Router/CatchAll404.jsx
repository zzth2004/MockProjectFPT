import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

export default function CatchAll404() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/404-1" replace />;
  if (user.role === 'user') return <Navigate to="/404-2" replace />;
  if (user.role === 'admin' || user.role === 'teacher') {
    return <Navigate to="/admin/late-dev" replace />;
  }

  // 3. Nếu là User (Học viên) -> Chuyển về trang 404 giao diện học viên
  if (user.role === 'user' || user.role === 'student') {
    return <Navigate to="/student/404" replace />;
  } // admin hoặc các role khác
}
