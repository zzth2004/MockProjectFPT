import {
  Users,
  BookOpen,
  FileQuestion,
  MessageSquarePlus,
  PlusCircle,
  TrendingUp,
  Activity,
  CalendarDays,
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Table from "../ui/Table";

export default function DashboardHome() {
  const userColumns = [
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "role", title: "Role" },
  ];

  const userData = [
    { name: "John Doe", email: "john@example.com", role: "Student" },
    { name: "Jane Smith", email: "jane@example.com", role: "Instructor" },
    { name: "Alice Johnson", email: "alice@example.com", role: "Student" },
    { name: "Bob Brown", email: "bob@example.com", role: "Admin" },
  ];

  return (
    <div className="flex flex-col h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 space-y-6 overflow-y-auto">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
          📊 Admin Dashboard
        </h1>
        <Button variant="primary" className="flex items-center gap-2 shadow">
          <PlusCircle className="w-5 h-5" /> Add New
        </Button>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">Total Users</div>
              <div className="text-2xl font-extrabold">1,230</div>
            </div>
            <Users className="w-6 h-6 opacity-90" />
          </div>
        </Card>

        <Card className="p-4 text-white bg-gradient-to-r from-green-500 to-green-400 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">Courses</div>
              <div className="text-2xl font-extrabold">34</div>
            </div>
            <BookOpen className="w-6 h-6 opacity-90" />
          </div>
        </Card>

        <Card className="p-4 text-white bg-gradient-to-r from-purple-500 to-purple-400 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">Quizzes</div>
              <div className="text-2xl font-extrabold">89</div>
            </div>
            <FileQuestion className="w-6 h-6 opacity-90" />
          </div>
        </Card>

        <Card className="p-4 text-white bg-gradient-to-r from-pink-500 to-pink-400 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">Feedback</div>
              <div className="text-2xl font-extrabold">152</div>
            </div>
            <MessageSquarePlus className="w-6 h-6 opacity-90" />
          </div>
        </Card>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-[300px]">
        {/* Chart Section */}
        <Card className="col-span-2 flex flex-col p-4 bg-gradient-to-b from-indigo-50 to-indigo-100">
          <div className="text-gray-700 mb-3 font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> User Growth (Last
            30 days)
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg animate-pulse">
            📈 Chart Coming Soon
          </div>
        </Card>

        {/* Quick Activity */}
        <Card className="flex flex-col p-4">
          <div className="text-gray-700 mb-3 font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-500" /> Quick Activity
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ New course published</li>
            <li>👤 User John Doe signed up</li>
            <li>📧 3 new feedback messages</li>
            <li>📆 Meeting scheduled tomorrow</li>
          </ul>
        </Card>
      </div>

      {/* Recent Users Table */}
      <Card className="p-4 max-h-64 overflow-auto">
        <div className="text-gray-700 mb-3 font-semibold flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-500" /> Recent Users
        </div>
        <Table columns={userColumns} data={userData} />
      </Card>
    </div>
  );
}
