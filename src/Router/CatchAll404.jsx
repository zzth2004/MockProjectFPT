import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

export default function CatchAll404() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/404-1" replace />;
  if (user.role === 'user') return <Navigate to="/404-2" replace />;
  return <Navigate to="/404-1" replace />; // admin hoặc các role khác
}
