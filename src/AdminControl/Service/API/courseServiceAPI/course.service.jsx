import axiosClient from "../../../../api/axiosAPI";

/**
 * Course Service - Kết nối API LMS Courses
 * Cấu trúc trả về từ Backend: { status: 'success', data: { ... } }
 */
const courseService = {
  
  // 1️⃣ Lấy danh sách khóa học (Công khai + Phân trang)
  // Trả về: { data: [...], total, page, lastPage }
  getAllCourses: async (page = 1, limit = 10, search = "") => {
    console.log(`🚀 [CourseService] Fetching courses - Page: ${page}, Search: "${search}"`);
    return axiosClient.get("/courses", { 
      params: { page, limit, search } 
    }).then(res => {
      // Bóc vỏ data của NestJS
      console.log("✅ [CourseService] List received:", res.data.data);
      return res.data.data; 
    });
  },

  // 2️⃣ Xem chi tiết một khóa học
  // Trả về: Object Course kèm lessons và info người tạo
  getCourseDetail: async (id) => {
    return axiosClient.get(`/courses/${id}/detail`).then(res => {
      return res.data.data;
    });
  },

  // 3️⃣ Tạo khóa học mới (Yêu cầu Teacher/Admin)
  // Payload: { title, description, thumbnail, ... }
  createCourse: async (courseData) => {
    return axiosClient.post("/courses/new", courseData).then(res => {
      return res.data.data;
    });
  },

  // 4️⃣ Cập nhật khóa học
  updateCourse: async (id, updateData) => {
    console.log(`🚀 [CourseService] Updating course #${id}`);
    return axiosClient.patch(`/courses/${id}/update`, updateData).then(res => {
      return res.data.data;
    });
  },

  // 5️⃣ Xóa khóa học (Soft Delete)
  deleteCourse: async (id) => {
    console.log(`⚠️ [CourseService] Soft deleting course #${id}`);
    return axiosClient.delete(`/courses/${id}/delete`).then(res => {
      return res.data.data;
    });
  },
};

export default courseService;