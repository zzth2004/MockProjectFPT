// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth(); // user = {name, role} hoặc null

  if (!user) {
    // guest chưa login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // role không hợp lệ → 404
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;
