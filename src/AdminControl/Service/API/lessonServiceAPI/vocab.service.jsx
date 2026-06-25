import axiosClient from "../../../../api/axiosAPI";

/**
 * Vocab Service - LMS Vocabulary
 */
const vocabService = {
  // 1. Lấy từ vựng theo bài học
  getByLesson: async (lessonId, page = 1, limit = 100) => {
    console.log(`[getByLesson] Gọi API với lessonId: ${lessonId}, page: ${page}, limit: ${limit}`);
    return axiosClient
      .get(`/materials/${lessonId}/vocabulary`, {
        params: { page, limit }
      })
      .then(res => {
        console.log("[getByLesson] Dữ liệu trả về:", res.data.data);
        return res.data.data;
      })
      .catch(err => {
        console.error("[getByLesson] Lỗi API:", err);
        throw err;
      });
  },

  // Lấy tất cả từ vựng (cho Admin hoặc tìm kiếm)
  getAllVocab: async (page = 1, limit = 100, search = "") => {
    console.log(`[getAllVocab] Search: "${search}", Page: ${page}`);
    return axiosClient
      .get(`/materials/vocab/all`, {
        params: { page, limit, search }
      })
      .then(res => {
        console.log("[getAllVocab] Dữ liệu trả về:", res.data.data);
        return res.data.data;
      })
      .catch(err => {
        console.error("[getAllVocab] Lỗi API:", err);
        throw err;
      });
  },

  // 2. Lấy chi tiết một từ
  getDetail: async (id) => {
    console.log(`[getDetail] Lấy chi tiết ID: ${id}`);
    return axiosClient
      .get(`/materials/vocabulary/${id}/detail`)
      .then(res => {
        console.log("[getDetail] Dữ liệu chi tiết:", res.data.data);
        return res.data.data;
      })
      .catch(err => {
        console.error("[getDetail] Lỗi API:", err);
        throw err;
      });
  },

  // Tạo mới từ vựng
  create: async (data) => {
    console.log("[create] Tạo mới từ vựng, Payload:", data);
    return axiosClient
      .post("/materials/vocabulary/new", data)
      .then(res => {
        console.log("[create] Tạo mới thành công:", res.data.data);
        return res.data.data;
      })
      .catch(err => {
        console.error("[create] Lỗi khi tạo mới từ vựng:", err);
        throw err;
      });
  },

  // 3. Cập nhật từ vựng
  update: async (id, data) => {
    console.log(`[update] Cập nhật ID: ${id}, Payload:`, data);
    return axiosClient
      .patch(`/materials/vocabulary/${id}/update`, data)
      .then(res => {
        console.log("[update] Cập nhật thành công:", res.data.data);
        return res.data.data;
      })
      .catch(err => {
        console.error("[update] Lỗi khi cập nhật:", err);
        throw err;
      });
  },

  // 4. Xóa từ vựng
  delete: async (id) => {
    console.log(`[delete] Đang xóa ID: ${id}`);
    return axiosClient
      .delete(`/materials/vocabulary/${id}/delete`)
      .then(res => {
        console.log("[delete] Xóa thành công ID:", id);
        return res.data.data;
      })
      .catch(err => {
        console.error("[delete] Lỗi khi xóa:", err);
        throw err;
      });
  },

  // Nạp dữ liệu từ JSON (Admin seed)
  seedData: async () => {
    console.log("[seedData] Đang bắt đầu nạp dữ liệu Admin...");
    return axiosClient
      .post("/materials/vocabs/admin/seed")
      .then(res => {
        console.log("[seedData] Nạp dữ liệu thành công:", res.data.data);
        return res.data.data;
      })
      .catch(err => {
        console.error("[seedData] Lỗi seed data:", err);
        throw err;
      });
  }

};

export default vocabService;