import { SearchCheck } from "lucide-react";
import axiosClient from "../../../../api/axiosAPI";

/**
 * Grammar Service - Kết nối MaterialController (NestJS)
 */
const grammarService = {
  // 1. Lấy danh sách ngữ pháp theo bài học (Phân trang)
  getByLesson: async (lessonId, page = 1, limit = 10) => {
    return axiosClient.get(`/materials/${lessonId}/grammar`, {
      params: { page, limit }
    }).then(res => res.data.data);
  },

  getAllGrammar: async(page = 1, limit = 10, search = "") =>{
    return axiosClient.get('/materials/grammar/all', {
      params: { page, limit, search }
    }).then(res => res.data.data);
  },

  // 2. Chi tiết ngữ pháp
  getDetail: async (id) => {
    return axiosClient.get(`/materials/grammar/${id}/detail`).then(res => res.data.data);
  },

  // 3. Tạo mới ngữ pháp
  create: async (data) => {
    return axiosClient.post("/materials/grammar/new", data).then(res => res.data.data);
  },

  // 4. Cập nhật ngữ pháp
  update: async (id, data) => {
    return axiosClient.patch(`/materials/grammar/${id}/update`, data).then(res => res.data.data);
  },

  // 5. Xóa ngữ pháp (Soft Delete)
  delete: async (id) => {
    return axiosClient.delete(`/materials/grammar/${id}/delete`).then(res => res.data.data);
  },

  // 6. Nạp dữ liệu mẫu từ thư viện
  seedData: async () => {
    return axiosClient.post("/materials/grammar/admin/seed").then(res => res.data.data);
  }
};

export default grammarService;