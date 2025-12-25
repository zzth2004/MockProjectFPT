import axiosClient from "../../../../api/axiosAPI";

/**
 * Course Class Service - LMS Classes
 */
const courseClassService = {
  // 1️⃣ Lấy danh sách lớp học (Phân trang & Tìm kiếm & Status)
  getAllClasses: async (page = 1, limit = 100, search = "", status = "") => {
    return axiosClient
      .get("/course-classes/class", {
        params: { page, limit, search, status },
      })
      .then((res) => {
        console.log(res.data.data);
        return res.data.data;
      });
  },

  // 2️⃣ Chi tiết lớp học (Kèm học viên & Google Link)
  getClassDetail: async (id) => {
    return axiosClient.get(`/course-classes/class/${id}/detail`).then((res) => {
      return res.data.data;
    });
  },

  // 3️⃣ Lấy lớp học theo ID Khóa học
  getClassesByCourse: async (courseId) => {
    return axiosClient
      .get(`/course-classes/course/${courseId}/class`)
      .then((res) => {
        return res.data.data;
      });
  },

  // 4️⃣ Tạo lớp học mới (Tự động tạo Classroom/Meet)
  createClass: async (classData) => {
    return axiosClient
      .post("/course-classes/class/new", classData)
      .then((res) => {
        return res.data.data;
      });
  },

  // 5️⃣ Cập nhật thông tin lớp học
  updateClass: async (id, updateData) => {
    return axiosClient
      .patch(`/course-classes/class/${id}/update`, updateData)
      .then((res) => {
        return res.data.data;
      });
  },

  // 6️⃣ Xóa lớp học (Chỉ khi chưa có học viên)
  deleteClass: async (id) => {
    return axiosClient
      .delete(`/course-classes/class/${id}/delete`)
      .then((res) => {
        return res.data.data;
      });
  },

  getMyClassOfTeacher: async () =>{
    return axiosClient.get(`/course-classes/class/my-classes`)
    .then((res) => {
        return res.data.data;
      });
  },
  getMyClassTeacher: async (id) =>{
    return axiosClient.get(`/course-classes/class/teacher/${id}`)
    .then((res) => {
        return res.data.data;
      });
  }
};

export default courseClassService;
