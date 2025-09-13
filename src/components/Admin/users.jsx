import React, { useState } from "react";
import "./users.css";

export default function Users() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "a@example.com",
      role: "Student",
      status: "Active",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "b@example.com",
      role: "Teacher",
      status: "Active",
    },
    {
      id: 3,
      name: "Phạm Văn C",
      email: "c@example.com",
      role: "Student",
      status: "Banned",
    },
  ]);

  return (
    <div className="users-root">
      {/* Header */}
      <div className="users-header">
        <h2>👥 Users</h2>
        <button className="btn-primary">+ Add User</button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input type="text" placeholder="🔎 Search users..." />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td className="user-cell">
                  <img
                    src={`https://i.pravatar.cc/40?u=${u.id}`}
                    alt={u.name}
                    className="avatar"
                  />
                  {u.name}
                </td>
                <td>{u.email}</td>
                <td>
                  <span
                    className={`role-badge ${
                      u.role === "Teacher" ? "purple" : "blue"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      u.status === "Active" ? "green" : "red"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-edit">✏️ Edit</button>
                  <button
                    className="btn-delete"
                    onClick={() =>
                      setUsers((prev) => prev.filter((x) => x.id !== u.id))
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
