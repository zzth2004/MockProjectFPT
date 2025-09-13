import React from "react";
import Card from "../ui/Card";

export default function Users() {
  const users = [
    { id: 1, name: "Minji", email: "minji@example.com", role: "Student" },
    { id: 2, name: "Hanni", email: "hanni@example.com", role: "Teacher" },
    { id: 3, name: "Daniel", email: "daniel@example.com", role: "Admin" },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">👥 Người dùng</h2>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm người dùng
        </button>
      </div>

      {/* Users Table */}
      <Card className="flex-1 overflow-auto p-4 bg-gray-50 shadow-md rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">#</th>
              <th className="p-2">Tên</th>
              <th className="p-2">Email</th>
              <th className="p-2">Vai trò</th>
              <th className="p-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-2">{user.id}</td>
                <td className="p-2 font-medium">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "Admin"
                        ? "bg-red-200 text-red-800"
                        : user.role === "Teacher"
                        ? "bg-purple-200 text-purple-800"
                        : "bg-blue-200 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-2 text-right">
                  <button className="text-blue-500 hover:underline mr-2">
                    Sửa
                  </button>
                  <button className="text-red-500 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
