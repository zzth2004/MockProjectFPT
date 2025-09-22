import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Table from "../ui/Table";

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

  // Cấu hình cột cho Table
  const columns = [
    { key: "id", title: "#" },
    { key: "name", title: "Tên" },
    { key: "email", title: "Email" },
    { key: "role", title: "Vai trò" },
    { key: "actions", title: "Hành động" },
  ];

  // Chuyển data -> định dạng Table
  const data = users.map((user) => ({
    id: <span className="text-gray-500">{user.id}</span>,
    name: <span className="font-medium text-gray-700">{user.name}</span>,
    email: <span className="text-gray-600">{user.email}</span>,
    role: (
      <Badge
        color={
          user.role === "Admin"
            ? "red"
            : user.role === "Teacher"
            ? "purple"
            : "blue"
        }
      >
        {user.role}
      </Badge>
    ),
    actions: (
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="text-blue-600 border-blue-200">
          ✏️ Sửa
        </Button>
        <Button variant="danger">🗑️ Xóa</Button>
      </div>
    ),
  }));

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">👥 Người dùng</h2>
        <Button variant="success">➕ Thêm người dùng</Button>
      </div>

      {/* Summary */}
      <div className="text-gray-600 text-sm">
        📊 Tổng số người dùng:{" "}
        <span className="font-semibold text-gray-900">{totalUsers}</span>
      </div>

      {/* Users Table */}
      <Card className="flex-1">
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
}
