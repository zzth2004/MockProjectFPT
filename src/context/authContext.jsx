// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- Lấy user: sessionStorage (ưu tiên) -> localStorage (fallback cho new tab) ---
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("user") || localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("❌ Lỗi parse user:", err);
      return null;
    }
  });

  // --- Lấy JWT: sessionStorage -> localStorage fallback ---
  const [jwt, setJwt] = useState(
    () => sessionStorage.getItem("jwt") || localStorage.getItem("jwt") || null
  );

  // --- Lưu user vào cả hai storage ---
  useEffect(() => {
    if (user) {
      const str = JSON.stringify(user);
      sessionStorage.setItem("user", str);
      localStorage.setItem("user", str);
    } else {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
    }
  }, [user]);

  // --- Lưu jwt vào cả hai storage ---
  useEffect(() => {
    if (jwt) {
      sessionStorage.setItem("jwt", jwt);
      localStorage.setItem("jwt", jwt);
    } else {
      sessionStorage.removeItem("jwt");
      localStorage.removeItem("jwt");
    }
  }, [jwt]);

  // --- LOGIN: set user + jwt ---
  const login = (userData, token) => {
    setUser(userData);
    setJwt(token);
  };

  // --- LOGOUT: xóa hết session ---
  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("jwt");
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    setUser(null);
    setJwt(null);
  };

  return (
    <AuthContext.Provider value={{ user, jwt, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
