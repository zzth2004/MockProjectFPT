import axiosClient from "../../../../api/axiosAPI";

/**
 * Exercise Service - Quản lý bài tập và câu hỏi
 */
const exerciseService = {
  getAllExercises: async (page = 1, limit = 10, search = "") => {
    console.log(`🚀 [ExerciseService] Fetching all exercises - Page: ${page}, Search: "${search}"`);
    
    return axiosClient.get("/materials/all", { 
      params: { 
        page, 
        limit, 
        search 
      } 
    }).then(res => {
      // Bóc vỏ data từ NestJS: res.data (Axios) -> res.data.data (NestJS)
      // Dữ liệu trả về thường có dạng: { items: [], meta: { total, page, ... } }
      return res.data.data; 
    });
  },
  // 1. Lấy danh sách bài tập theo bài học (Cho Admin - Thường lấy full detail)
  getByLesson: async (lessonId, page = 1, limit = 100) => {
    return axiosClient.get(`/materials/lesson/${lessonId}/exercises`, {
      params: { page, limit }
    }).then(res => res.data.data);
  },


  getByLessonAi: async (lessonId, page = 1, limit = 100) => {
    return axiosClient.get(`/materials/lesson/${lessonId}/exercises/ai-one`).then(res => res.data.data);
  },
  getByLessonAiAll: async (lessonId, page = 1, limit = 100) => {
    return axiosClient.get(`/materials/lesson/${lessonId}/exercises/ai-all`, {
      params: { page, limit }
    }).then(res => res.data.data);
  },

  
  // 2. Lấy chi tiết bài tập (Kèm Questions & Options)
  getDetail: async (id) => {
    return axiosClient.get(`/materials/exercise/${id}/detail`).then(res => res.data.data);
  },

  // 3. Tạo bài tập mới
  create: async (data) => {
    return axiosClient.post("/materials/exercise/new", data).then(res => res.data.data);
  },

  // 4. Cập nhật bài tập (Cascade update questions/options)
  update: async (id, data) => {
    return axiosClient.patch(`/materials/exercise/${id}/update`, data).then(res => res.data.data);
  },

  // 5. Xóa bài tập
  delete: async (id) => {
    return axiosClient.delete(`/materials/exercise/${id}/delete`).then(res => res.data.data);
  },

  // 6. Thao tác với câu hỏi lẻ
  deleteQuestion: async (questionId) => {
    return axiosClient.delete(`/materials/exercises/questions/${questionId}/delete`).then(res => res.data.data);
  },
/**
   * Nộp bài tập để chấm điểm
   * @param {Object} data - { exerciseId: number, answers: [{ questionId, selectedOptionId }] }
   */
  submitExercise: async ( data) => {
    console.log(`🚀 [ExerciseService] Submitting exercise ID: ${data.exerciseId}`);
    return axiosClient.post("/materials/exercise/submit", data)
      .then(res => res.data.data);
  },

  /**
   * Lấy lịch sử làm bài của bản thân học viên
   */
  getMyAttempts: async (page = 1, limit = 10, exerciseId = null) => {
    return axiosClient.get("/materials/exercise/my-attempts", {
      params: { page, limit, exerciseId }
    }).then(res => res.data.data);
  },

  /**
   * Xem chi tiết một lần làm bài (Để review đúng/sai)
   */
  getAttemptDetail: async (attemptId) => {
    return axiosClient.get(`/materials/exercise/attempt/${attemptId}`)
      .then(res => res.data.data);
  },

  // ======================================================
  // 8. QUẢN LÝ KẾT QUẢ (ADMIN)
  // ======================================================

  /**
   * [Admin] Lấy toàn bộ kết quả làm bài của hệ thống
   */
  getAllAttemptsAdmin: async (page = 1, limit = 10, search = "", exerciseId = null) => {
    console.log(`🚀 [ExerciseService] Admin fetching all attempts - Search: "${search}"`);
    return axiosClient.get("/materials/admin/all-attempts", {
      params: { 
        page, 
        limit, 
        search, 
        exerciseId 
      }
    }).then(res => res.data.data);
  },

  /**
   * [Admin] Lấy thống kê tổng quát (Điểm trung bình, tổng lượt làm...)
   */
  getGlobalStats: async () => {
    return axiosClient.get("/materials/admin/global-stats")
      .then(res => res.data.data);
  }
};

export default exerciseService;