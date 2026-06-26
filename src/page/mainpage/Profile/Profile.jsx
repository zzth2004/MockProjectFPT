import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/authContext";
import { 
  User, Mail, Phone, MapPin, Target, Clock, Shield, Star, 
  Flame, Medal, GraduationCap, BookOpen, ExternalLink, Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import exerciseService from "../../../AdminControl/Service/API/lessonServiceAPI/exercise.service";
import userService from "../../../AdminControl/Service/API/userServiceAPI/user.service";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentExercises, setRecentExercises] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // 1. Fetch full profile from backend
        const profileData = await userService.getMyProfile();
        setProfile(profileData);

        // 2. Fetch Recent Exercises for student/all users
        const exData = await exerciseService.getMyAttempts(1, 5);
        if (exData && Array.isArray(exData.data)) {
          setRecentExercises(exData.data);
        } else if (exData && Array.isArray(exData)) {
          setRecentExercises(Array.isArray(exData[0]) ? exData[0] : exData);
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-8 border-gray-100 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-gray-400 uppercase tracking-widest animate-pulse">Đang nạp hồ sơ...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <p className="text-xl font-bold text-gray-700 mb-2">Không thể tải thông tin cá nhân</p>
        <p className="text-sm text-gray-500">Vui lòng thử lại sau hoặc tải lại trang.</p>
      </div>
    );
  }

  const isTeacherOrAdmin = profile.role === "teacher" || profile.role === "admin";
  const badges = profile.badges || [];
  const pointStats = profile.pointStats || { currentLevel: 1, currentStreak: 0, totalPoints: 0 };
  const teachingClasses = profile.teachingClasses || [];
  const createdCourses = profile.createdCourses || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* 1. HEADER / GENERAL INFO */}
      <div className="relative bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-600 to-emerald-400 p-1 shadow-2xl shrink-0 relative z-10">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-white">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-green-700">{profile.fullName?.charAt(0) || profile.username?.charAt(0) || "U"}</span>
            )}
          </div>
        </div>

        <div className="flex-1 relative z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                {profile.fullName || profile.username}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Shield size={16} className={isTeacherOrAdmin ? "text-purple-500" : "text-blue-500"} />
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  Vai trò: <span className={isTeacherOrAdmin ? "text-purple-600" : "text-blue-600"}>{profile.role}</span>
                </span>
                {profile.VIP && (
                  <span className="ml-2 bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    VIP
                  </span>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/user/settings')}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
            >
              Cập nhật hồ sơ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={18} className="text-slate-400" />
              <span className="font-medium text-sm">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone size={18} className="text-slate-400" />
              <span className="font-medium text-sm">{profile.phone || "Chưa cập nhật SĐT"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Target size={18} className="text-slate-400" />
              <span className="font-medium text-sm">{profile.learningGoal || "Chưa cập nhật mục tiêu"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Clock size={18} className="text-slate-400" />
              <span className="font-medium text-sm">{profile.preferredStudyTime || "Chưa cập nhật giờ học"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: GAMIFICATION & BADGES */}
        <div className="space-y-8">
          {/* STATS CƠ BẢN */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" /> Thành tích học tập
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center justify-center text-center">
                <Flame className="text-orange-500 mb-1" size={24} />
                <span className="text-xl font-black text-orange-600">{pointStats.currentStreak}</span>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">Ngày Lửa</span>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col items-center justify-center text-center">
                <Star className="text-green-600 mb-1" size={24} />
                <span className="text-xl font-black text-green-700">{pointStats.currentLevel}</span>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">Cấp Độ</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center col-span-2">
                <span className="text-2xl font-black text-blue-600">{pointStats.totalPoints}</span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Tổng Điểm XP</span>
              </div>
            </div>
          </div>

          {/* BADGES */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Medal className="text-purple-500" /> Huy hiệu của bạn
            </h3>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((b) => (
                  <div key={b.badgeId} className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                    <img src={b.badge?.iconUrl || "https://cdn-icons-png.flaticon.com/512/5739/5739958.png"} alt={b.badge?.name} className="w-12 h-12 object-contain mb-2" />
                    <span className="text-xs font-bold text-slate-700 text-center line-clamp-1">{b.badge?.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-400 text-center py-4 bg-slate-50 rounded-2xl">
                Chưa có huy hiệu nào
              </p>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: LỊCH SỬ QUIZ HOẶC ADMIN/TEACHER INFO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* NẾU LÀ GIÁO VIÊN / ADMIN: HIỂN THỊ CÁC LỚP VÀ KHÓA HỌC */}
          {isTeacherOrAdmin && (
            <>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="text-emerald-600" /> Lớp học đang phụ trách
                </h3>
                {teachingClasses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teachingClasses.map((cls) => (
                      <div key={cls.id} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800">{cls.name}</h4>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-md uppercase">
                            {cls.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-1">Khóa: {cls.course?.title}</p>
                        <div className="mt-auto flex items-center gap-2">
                          {cls.googleClassroomLink && (
                            <a href={cls.googleClassroomLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-md">
                              <ExternalLink size={12} /> Google Classroom
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400 text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Hiện chưa phụ trách lớp nào.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <BookOpen className="text-indigo-600" /> Khóa học đã tạo
                </h3>
                {createdCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {createdCourses.map((course) => (
                      <div key={course.id} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-indigo-100">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <BookOpen className="w-full h-full p-3 text-indigo-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{course.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{course.level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400 text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa tạo khóa học nào.
                  </p>
                )}
              </div>
            </>
          )}

          {/* LỊCH SỬ LÀM BÀI (Dành cho tất cả) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="text-teal-600" /> Bài tập đã nộp gần đây
            </h3>
            {recentExercises.length > 0 ? (
              <div className="space-y-3">
                {recentExercises.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate('/user/exercise-attempts')}>
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-slate-800 truncate">{attempt.exercise?.title || "Bài tập"}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {new Date(attempt.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${
                        attempt.score >= 80 ? "bg-green-100 text-green-700" :
                        attempt.score >= 50 ? "bg-orange-100 text-orange-700" :
                        "bg-rose-100 text-rose-700"
                      }`}>
                        {attempt.score} / 100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-400 text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có lịch sử làm bài.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
