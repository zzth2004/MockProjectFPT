// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- Lấy user từ localStorage ---
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("❌ Lỗi parse user:", err);
      return null;
    }
  });

  // --- Lấy JWT từ localStorage ---
  const [jwt, setJwt] = useState(() => localStorage.getItem("jwt") || null);

  // --- Lưu user vào localStorage khi thay đổi ---
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // --- Lưu jwt vào localStorage khi thay đổi ---
  useEffect(() => {
    if (jwt) localStorage.setItem("jwt", jwt);
    else localStorage.removeItem("jwt");
  }, [jwt]);

  // --- LOGIN: set user + jwt ---
  const login = (userData, token) => {
    setUser(userData);
    setJwt(token);
  };

  // --- LOGOUT: xóa hết session ---
  const logout = () => {
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
