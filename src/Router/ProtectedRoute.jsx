import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  // Nếu chưa login => guest
  if (!user) {
    return <Navigate to="/login" replace />; // guest đi 404_1
  }

  // Nếu role không hợp lệ
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "user") return <Navigate to="/404-2" replace />;
    return <Navigate to="/404-1" replace />; // admin hoặc các role khác chưa hợp lệ
  }

  // Nếu hợp lệ
  return children;
}
