import React from "react";
import Card from "../ui/Card";

export default function Users() {
  const users = [
    { id: 1, name: "Minji", email: "minji@example.com", role: "Student" },
    { id: 2, name: "Hanni", email: "hanni@example.com", role: "Teacher" },
    { id: 3, name: "Daniel", email: "daniel@example.com", role: "Admin" },
    { id: 4, name: "Haerin", email: "haerin@example.com", role: "Student" },
    { id: 5, name: "Hyein", email: "hyein@example.com", role: "Student" },
    { id: 6, name: "Jisoo", email: "jisoo@example.com", role: "Teacher" },
    { id: 7, name: "Lia", email: "lia@example.com", role: "Student" },
    { id: 8, name: "Kai", email: "kai@example.com", role: "Admin" },
  ];

  const totalUsers = users.length;

  const roleColors = {
    Admin: "bg-red-100 text-red-700",
    Teacher: "bg-purple-100 text-purple-700",
    Student: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">👥 Người dùng</h2>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm người dùng
        </button>
      </div>

      {/* Summary */}
      <div className="text-gray-600 text-sm">
        📊 Tổng số người dùng:{" "}
        <span className="font-semibold text-gray-900">{totalUsers}</span>
      </div>

      {/* Users Table */}
      <Card className="flex-1 overflow-auto p-4 bg-white shadow-md rounded-2xl">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">#</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-indigo-50 transition-all duration-200"
              >
                <td className="p-3 text-gray-500">{user.id}</td>
                <td className="p-3 font-medium text-gray-700">{user.name}</td>
                <td className="p-3 text-gray-600">{user.email}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      roleColors[user.role] || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button className="text-blue-500 hover:underline mr-3">
                    ✏️ Sửa
                  </button>
                  <button className="text-red-500 hover:underline">
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
