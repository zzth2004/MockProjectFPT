import React from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import DashboardHome from "./dashboardHome.jsx";
import "./admin.css";
import Courses from "./course.jsx";
import Users from "./users.jsx";
import Quiz from "./quiz.jsx";
import Vocabulary from "./vocabulary.jsx";
import Plans from "./plans.jsx";
import Media from "./media.jsx";

export default function AdminDashboard() {
  return (
    <div className="admin-root">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">AI</div>
          <div>
            <div style={{ fontSize: 18 }}>한 Learn</div>
            <div className="small">Admin</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            🏠 Dashboard
          </NavLink>
          <NavLink
            to="/admin/courses"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {" "}
            📚 Course{" "}
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            👥 Users
          </NavLink>
          <NavLink
            to="/admin/quiz"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📝 Quiz
          </NavLink>
          <NavLink
            to="/admin/vocabulary"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            🔤 Vocabulary
          </NavLink>
          <NavLink
            to="/admin/plans"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            💳 Plans
          </NavLink>
          <NavLink
            to="/admin/media"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            🖼️ Media
          </NavLink>
        </nav>

        <div className="spacer" />
        <div className="small">© {new Date().getFullYear()} AI한 Learn</div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/users" element={<Users />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/media" element={<Media />} />
        </Routes>
        {/* TOPBAR */}
        <div className="topbar">
          <h2>Dashboard</h2>
          <div className="topbar-right">
            <button className="icon-btn">🔔</button>
            <div className="avatar-wrap">
              <img
                src="https://i.pravatar.cc/40"
                alt="Admin"
                className="avatar"
              />
              <div className="dropdown">
                <div>Profile</div>
                <div>Settings</div>
                <div>Logout</div>
              </div>
            </div>
          </div>
        </div>
        {/* CONTENT */}
      </main>
    </div>
  );
}
