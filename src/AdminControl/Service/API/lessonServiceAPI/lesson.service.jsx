import axiosClient from "../../../../api/axiosAPI";

const lessonService = {

  // 1️⃣ Lấy tất cả bài học hệ thống (Phân trang & Tìm kiếm)
  getAllLesson: async (page = 1, limit = 10, search = "") => {
    return axiosClient.get("/lessons/all", {
      params: { page, limit, search }
    }).then(res => {
      console.log(res.data.data);
      return res.data.data;
    });
  },

  // 2️⃣ Lấy danh sách bài học theo ID Khóa học (Sắp xếp theo orderIndex)
  getByCourse: async (courseId, page = 1, limit = 20, search = "") => {
    return axiosClient.get(`/lessons/${courseId}/all-by-course`, {
      params: { page, limit, search }
    }).then(res => {
      return res.data.data;
    });
  },

  // 3️⃣ Chi tiết bài học (Kèm thông tin Course)
  getDetail: async (id) => {
    return axiosClient.get(`/lessons/${id}/detail`).then(res => {
      return res.data.data;
    });
  },

  // 4️⃣ Tạo bài học mới (Yêu cầu quyền Teacher/Admin)
  create: async (data) => {
    return axiosClient.post("/lessons/new", data).then(res => {
      return res.data.data;
    });
  },

  // 5️⃣ Cập nhật nội dung bài học
  update: async (id, data) => {
    return axiosClient.patch(`/lessons/${id}/update`, data).then(res => {
      return res.data.data;
    });
  },

  // 6️⃣ Xóa bài học (Soft Delete)
  delete: async (id) => {
    return axiosClient.delete(`/lessons/${id}/delete`).then(res => {
      return res.data.data;
    });
  },

  // 7️⃣ Nạp dữ liệu bài học từ file JSON (Chỉ dành cho Admin)
  seedData: async () => {
    return axiosClient.post("/lessons/admin/seed").then(res => {
      return res.data.data;
    });
  }
};

export default lessonService;