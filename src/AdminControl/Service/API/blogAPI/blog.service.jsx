import axiosClient from "../../../../api/axiosAPI";

const blogService = {
  
  getAll: async (params) => {
 
    return axiosClient.get("/blogs", { params }).then(res => res.data.data);
  },


  getBySlug: async (slug) => {
    return axiosClient.get(`/blogs/${slug}`).then(res => res.data.data);
  },

  create: async (data) => {
    return axiosClient.post("/blogs", data).then(res => res.data.data);
  },

  // 4️⃣ [ADMIN] Cập nhật bài viết
  update: async (id, data) => {
    return axiosClient.patch(`/blogs/${id}`, data).then(res => res.data.data);
  },

  // 5️⃣ [ADMIN] Xóa bài viết
  delete: async (id) => {
    return axiosClient.delete(`/blogs/${id}`).then(res => res.data.data);
  }
};

export default blogService;