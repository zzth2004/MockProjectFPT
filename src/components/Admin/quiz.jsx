import React, { useState } from "react";
import "./quiz.css";

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: "Basic Korean 1", questions: 10, status: "Published" },
    { id: 2, title: "Grammar Test", questions: 15, status: "Draft" },
    { id: 3, title: "Vocabulary Challenge", questions: 8, status: "Published" },
  ]);

  return (
    <div className="quiz-root">
      {/* Header */}
      <div className="quiz-header">
        <h2>📝 Quizzes</h2>
        <button className="btn-primary">+ New Quiz</button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input type="text" placeholder="🔎 Search quizzes..." />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="quiz-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Quiz Title</th>
              <th>Questions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td className="quiz-title">{q.title}</td>
                <td>{q.questions}</td>
                <td>
                  <span
                    className={`status-badge ${
                      q.status === "Published" ? "green" : "orange"
                    }`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-edit">✏️ Edit</button>
                  <button
                    className="btn-delete"
                    onClick={() =>
                      setQuizzes((prev) => prev.filter((x) => x.id !== q.id))
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
