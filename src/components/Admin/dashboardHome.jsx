// src/components/Admin/dashboardHome.jsx
import React from "react";
import "./admin.css";

export default function DashboardHome() {
  return (
    <>
      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">1,230</div>
        </div>
        <div className="stat-card green">
          <div className="stat-title">Courses</div>
          <div className="stat-value">34</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-title">Quizzes</div>
          <div className="stat-value">89</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-title">Feedback</div>
          <div className="stat-value">152</div>
        </div>
      </div>

      {/* CHART + WORD SETS */}
      <section className="content-grid">
        {/* Leaderboard */}
        <div className="leader card" style={{ gridColumn: "1 / -1" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 700 }}>Leaderboard</div>
            <div style={{ color: "var(--muted)" }}>2025</div>
          </div>
          <div
            className="chart"
            style={{ background: "linear-gradient(180deg,#fff,#fbfdff)" }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <polyline
                points="0,30 10,28 20,22 30,24 40,20 50,18 60,10 70,12 80,8 90,12 100,14"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <polyline
                points="0,28 10,26 20,24 30,20 40,18 50,16 60,12 70,10 80,14 90,10 100,12"
                fill="none"
                stroke="#f97316"
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Word sets */}
        <div className="word-sets" style={{ gridColumn: "1 / -1" }}>
          <div className="word-card card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Vocabulary</div>
            <div style={{ color: "var(--muted)" }}>
              Manage words, add audio pronunciation, group by topic.
            </div>
          </div>
          <div className="word-card card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Quizzet</div>
            <div style={{ color: "var(--muted)" }}>
              Create quizzes and auto-grade student results.
            </div>
          </div>
          <div className="word-card card">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Test</div>
            <div style={{ color: "var(--muted)" }}>
              Preview tests and export results.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
