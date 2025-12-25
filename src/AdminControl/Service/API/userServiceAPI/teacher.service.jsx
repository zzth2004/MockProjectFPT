import axiosClient from "../../../../api/axiosAPI";

const teacherService = {
    /**
     * 🏠 Lấy dữ liệu tổng quan Dashboard (Header, Welcome message)
     * GET /teacher/dashboard/overview
     */
    getDashboardOverview: async () => {
        console.log("🚀 [TeacherService] Fetching: Dashboard Overview");
        return axiosClient.get("/users/teacher/dashboard/overview")
            .then(res => res.data.data);
    },

    /**
     * 📊 Lấy thống kê chi tiết (Số lượng học viên, bài tập, lớp học)
     * GET /teacher/dashboard/stats
     */
    getDashboardStats: async () => {
        console.log("🚀 [TeacherService] Fetching: Dashboard Stats");
        return axiosClient.get("/users/teacher/dashboard/stats")
            .then(res => {
                // Log ở đây mới thấy dữ liệu
                console.log("📊 Data nhận được từ API:", res.data.data);
                return res.data.data;
            })
            .catch(err => {
                console.error("❌ Lỗi gọi API Stats:", err);
                throw err;
            });
    },

    /**
     * 📚 Lấy danh sách các khóa học do giáo viên này giảng dạy
     * GET /teacher/my-courses
     */
    getMyCourses: async (page = 1, limit = 10) => {
        return axiosClient.get("/courses/teacher/my-courses", { params: { page, limit } })
            .then(res => res.data.data);
    },

    /**
     * 👥 Lấy danh sách học viên trong các khóa học của tôi (Phân trang)
     * GET /teacher/my-students
     */
    getMyStudents: async (page = 1, limit = 10, search = "") => {
        return axiosClient.get("/courses/teacher/my-students", { params: { page, limit, search } })
            .then(res => {
                console.log("📊 Data student nhận được từ API:", res.data.data);
                return res.data.data
            });
    },

    /**
     * 🔍 Tìm kiếm học viên chung dành cho giáo viên
     * GET /teacher/students
     */
    getStudents: async (page = 1, limit = 10, search = "") => {
        return axiosClient.get("/users/students", { params: { page, limit, search } })
            .then(res => res.data.data);
    },

    //   /**
    //    * ⚡ Tìm kiếm nhanh học sinh (Dành cho Dropdown/Quick Search)
    //    * GET /teacher/students/search?keyword=...
    //    */
    //   searchStudents: async (keyword) => {
    //     return axiosClient.get("/teacher/students/search", { params: { keyword } })
    //       .then(res => res.data.data);
    //   },

    /**
     * 📝 Cập nhật thông tin chuyên môn/Profile giáo viên
     * PATCH /teacher/profile
     */
    updateProfile: async (profileData) => {
        return axiosClient.patch("/users/teacher/profile", profileData)
            .then(res => res.data.data);
    }
};

export default teacherService;