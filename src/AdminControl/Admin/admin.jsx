import { Routes, Route } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import DashboardHome from "./dashboardHome";
import Courses from "./course";
import Users from "./users";
import Quiz from "./quiz";
import Vocabulary from "./vocabulary";
import Plans from "./plans";
import Media from "./media";

export default function AdminDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/users" element={<Users />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/media" element={<Media />} />
        </Routes>
      </main>
    </div>
  );
}
