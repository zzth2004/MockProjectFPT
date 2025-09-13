import Card from "../ui/Card";

export default function DashboardHome() {
  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50 space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">📊 Admin Dashboard</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          <span className="mr-2 text-lg">➕</span>Add New
        </button>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
        <Card className="p-4 text-white bg-gradient-to-r from-blue-500 to-blue-400 shadow-md rounded-lg">
          <div className="text-sm opacity-80">Total Users</div>
          <div className="text-2xl font-bold">1,230</div>
        </Card>
        <Card className="p-4 text-white bg-gradient-to-r from-blue-500 to-blue-400 shadow-md rounded-lg">
          <div className="text-sm opacity-80">Courses</div>
          <div className="text-2xl font-bold">34</div>
        </Card>
        <Card className="p-4 text-white bg-gradient-to-r from-blue-500 to-blue-400 shadow-md rounded-lg">
          <div className="text-sm opacity-80">Quizzes</div>
          <div className="text-2xl font-bold">89</div>
        </Card>
        <Card className="p-4 text-white bg-gradient-to-r from-blue-500 to-blue-400 shadow-md rounded-lg">
          <div className="text-sm opacity-80">Feedback</div>
          <div className="text-2xl font-bold">152</div>
        </Card>
      </div>

      {/* CHART + TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Chart */}
        <Card className="col-span-2 h-full flex flex-col p-4 bg-gradient-to-b from-indigo-50 to-indigo-100">
          <div className="text-gray-700 mb-2 font-semibold">
            User Growth (Last 30 days)
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            📈 Chart Placeholder
          </div>
        </Card>

        {/* Recent Users Table */}
        <Card className="h-full p-4 overflow-auto">
          <div className="text-gray-500 mb-2">Recent Users</div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-sm font-semibold text-gray-600">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              <tr>
                <td className="py-2">John Doe</td>
                <td className="py-2">john@example.com</td>
                <td className="py-2">Student</td>
              </tr>
              <tr>
                <td className="py-2">Jane Smith</td>
                <td className="py-2">jane@example.com</td>
                <td className="py-2">Instructor</td>
              </tr>
              <tr>
                <td className="py-2">Alice Johnson</td>
                <td className="py-2">alice@example.com</td>
                <td className="py-2">Student</td>
              </tr>
              <tr>
                <td className="py-2">Bob Brown</td>
                <td className="py-2">bob@example.com</td>
                <td className="py-2">Admin</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
