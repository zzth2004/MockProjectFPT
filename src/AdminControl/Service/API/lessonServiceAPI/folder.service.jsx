import axiosClient from "../../../../api/axiosAPI";

const folderService = {
  // Lấy danh sách thư mục của tôi
  getMyFolders: async () => {
    return axiosClient.get("/folders/me").then(res => res.data.data);
  },

  // Tạo thư mục mới
  createFolder: async (data) => {
    return axiosClient.post("/folders/create", data).then(res => res.data.data);
  },

  // Lấy chi tiết thư mục (bao gồm các deck bên trong)
  getFolderDetail: async (folderId) => {
    return axiosClient.get(`/folders/${folderId}`).then(res => res.data.data);
  },

  // Cập nhật thư mục
  updateFolder: async (folderId, data) => {
    return axiosClient.patch(`/folders/${folderId}`, data).then(res => res.data.data);
  },

  // Xóa thư mục
  deleteFolder: async (folderId) => {
    return axiosClient.delete(`/folders/${folderId}`).then(res => res.data.data);
  },

  // Thêm bộ thẻ vào thư mục
  addDeckToFolder: async (folderId, deckId) => {
    return axiosClient.post(`/folders/${folderId}/add-deck`, { deckId }).then(res => res.data.data);
  },

  // Bỏ bộ thẻ khỏi thư mục
  removeDeckFromFolder: async (folderId, deckId) => {
    return axiosClient.delete(`/folders/${folderId}/remove-deck/${deckId}`).then(res => res.data.data);
  },

  // Tìm kiếm Deck có thể truy cập
  searchDecks: async (page = 1, limit = 10, search = "") => {
    return axiosClient.get("/folders/decks", { params: { page, limit, search } }).then(res => res.data.data);
  },

  // Tìm kiếm thư mục
  searchFolders: async (q = "", page = 1, limit = 10) => {
    return axiosClient.get("/folders/search", { params: { q, page, limit } }).then(res => res.data.data);
  }
};

export default folderService;
