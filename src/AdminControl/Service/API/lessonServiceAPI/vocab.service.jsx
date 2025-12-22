import axiosClient from "../../../../api/axiosAPI";

/**
 * Vocab Service - LMS Vocabulary
 */
const vocabService = {
  // 1. Lấy từ vựng theo bài học
  getByLesson: async (lessonId, page = 1, limit = 100) => {
    return axiosClient.get(`/materials/${lessonId}/vocabulary`, {
      params: { page, limit }
    }).then(res => res.data.data);
  },

   getAllVocab: async (page = 1, limit = 100, search ="") => {
    return axiosClient.get(`/materials/vocab/all`, {
      params: { page, limit, search }
    }).then(res => res.data.data);
  },

  // 2. Lấy chi tiết một từ
  getDetail: async (id) => {
    return axiosClient.get(`/materials/vocabulary/${id}/detail`).then(res => res.data.data);
  },

  // 3. Cập nhật từ vựng
  update: async (id, data) => {
    return axiosClient.patch(`/materials/vocabulary/${id}/update`, data).then(res => res.data.data);
  },

  // 4. Xóa từ vựng
  delete: async (id) => {
    return axiosClient.delete(`/materials/vocabulary/${id}/delete`).then(res => res.data.data);
  },

  // Nạp dữ liệu từ JSON
  seedData: async () => {
    return axiosClient.post("/materials/vocabs/admin/seed").then(res => res.data.data);
  }
};

export default vocabService;