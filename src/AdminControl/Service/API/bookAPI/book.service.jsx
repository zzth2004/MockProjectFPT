import axiosClient from "../../../../api/axiosAPI";

/**
 * Book Service - Quản lý kho sách và tài liệu
 */
const bookService = {
  // 1️⃣ Lấy danh sách sách công khai (Public)
  getAllPublic: async (params) => {
    return axiosClient.get("/books", { params }).then(res => res.data.data);
  },

  // 2️⃣ Xem chi tiết sách theo ID
  getDetail: async (id) => {
    return axiosClient.get(`/books/detail/${id}`).then(res => res.data.data);
  },

  // 3️⃣ Xem chi tiết sách theo Slug (Dành cho SEO/FE)
  getBySlug: async (slug) => {
    return axiosClient.get(`/books/slug/${slug}`).then(res => res.data.data);
  },

  // 4️⃣ [ADMIN] Lấy tất cả sách (Bao gồm cả sách ẩn)
  getAdminList: async (page = 1, limit = 10, search = "") => {
    return axiosClient.get("/books/admin/list", {
      params: { page, limit, search }
    }).then(res => res.data.data);
  },

  // 5️⃣ [ADMIN] Thêm sách mới
  create: async (data) => {
    return axiosClient.post("/books", data).then(res => res.data.data);
  },

  // 6️⃣ [ADMIN] Cập nhật thông tin sách
  update: async (id, data) => {
    return axiosClient.patch(`/books/${id}`, data).then(res => res.data.data);
  },

  // 7️⃣ [ADMIN] Xóa sách
  delete: async (id) => {
    return axiosClient.delete(`/books/${id}`).then(res => res.data.data);
  },

  // 8️⃣ [ADMIN] Nạp dữ liệu từ file JSON
  seed: async () => {
    return axiosClient.post("/books/admin/seed").then(res => res.data.data);
  }
};

export default bookService;