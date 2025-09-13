import React, { useState } from "react";
import "./course.css";

export default function Courses() {
  const [courses, setCourses] = useState([
    { id: 1, title: "Tiếng Hàn sơ cấp 1", level: "Beginner", students: 45 },
    { id: 2, title: "Tiếng Hàn sơ cấp 2", level: "Beginner", students: 32 },
    {
      id: 3,
      title: "Tiếng Hàn trung cấp 3",
      level: "Intermediate",
      students: 55,
    },
    {
      id: 4,
      title: "Tiếng Hàn trung cấp 4",
      level: "Intermediate",
      students: 33,
    },
    {
      id: 5,
      title: "Tiếng Hàn cao cấp 5",
      level: "Advanced",
      students: 37,
    },
    {
      id: 6,
      title: "Tiếng Hàn cao cấp 6",
      level: "Advanced",
      students: 26,
    },
  ]);

  return (
    <div className="courses-root">
      {/* Header */}
      <div className="courses-header">
        <h2>📚 Courses</h2>
        <button className="btn-primary">+ Add Course</button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input type="text" placeholder="🔎 Search courses..." />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="course-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Title</th>
              <th>Level</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.title}</td>
                <td>
                  <span
                    className={`level-badge ${
                      c.level === "Beginner"
                        ? "green"
                        : c.level === "Intermediate"
                        ? "blue"
                        : "red"
                    }`}
                  >
                    {c.level}
                  </span>
                </td>
                <td>{c.students}</td>
                <td className="actions">
                  <button className="btn-edit">✏️ Edit</button>
                  <button
                    className="btn-delete"
                    onClick={() =>
                      setCourses((prev) => prev.filter((x) => x.id !== c.id))
                    }
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
