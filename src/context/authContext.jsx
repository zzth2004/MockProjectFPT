// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- Lấy user từ sessionStorage ---
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("❌ Lỗi parse user:", err);
      return null;
    }
  });

  // --- Lấy JWT từ sessionStorage ---
  const [jwt, setJwt] = useState(() => sessionStorage.getItem("jwt") || null);

  // --- Lưu user vào sessionStorage khi thay đổi ---
  useEffect(() => {
    if (user) sessionStorage.setItem("user", JSON.stringify(user));
    else sessionStorage.removeItem("user");
  }, [user]);

  // --- Lưu jwt vào sessionStorage khi thay đổi ---
  useEffect(() => {
    if (jwt) sessionStorage.setItem("jwt", jwt);
    else sessionStorage.removeItem("jwt");
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
