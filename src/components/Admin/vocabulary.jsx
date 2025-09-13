import React, { useState } from "react";
import "./vocabulary.css";

export default function Vocabulary() {
  const [words, setWords] = useState([
    { id: 1, word: "안녕하세요", meaning: "Xin chào", type: "Greeting" },
    { id: 2, word: "사랑", meaning: "Tình yêu", type: "Noun" },
    { id: 3, word: "빠르다", meaning: "Nhanh", type: "Adjective" },
  ]);

  return (
    <div className="vocab-root">
      {/* Header */}
      <div className="vocab-header">
        <h2>🔤 Vocabulary</h2>
        <button className="btn-primary">+ Add Word</button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input type="text" placeholder="🔎 Search words..." />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="vocab-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Word</th>
              <th>Meaning</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {words.map((w) => (
              <tr key={w.id}>
                <td>{w.id}</td>
                <td className="word-col">{w.word}</td>
                <td>{w.meaning}</td>
                <td>
                  <span className={`type-badge ${w.type.toLowerCase()}`}>
                    {w.type}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-edit">✏️ Edit</button>
                  <button
                    className="btn-delete"
                    onClick={() =>
                      setWords((prev) => prev.filter((x) => x.id !== w.id))
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
