import axiosClient from "../../../../api/axiosAPI";

const topikService = {
  // Lấy danh sách từ vựng theo Level (TOPIK_1, TOPIK_2, ...)
  getVocabByLevel: async (level, page = 1, limit = 50) => {
    const response = await axiosClient.get(`/materials/vocabulary`, {
      params: { level, page, limit }
    });
    return response.data.data;
  },

  // Lấy danh sách ngữ pháp theo Level (TOPIK_1, TOPIK_2, ...)
  getGrammarByLevel: async (level, page = 1, limit = 50) => {
    const response = await axiosClient.get(`/materials/grammars`, {
      params: { level, page, limit }
    });
    return response.data.data;
  },

  // Lấy danh sách đề thi thử (Mock Tests)
  getMockTests: async () => {
    const response = await axiosClient.get(`/topik-tests/all`);
    return response.data.data;
  },

  // Lấy chi tiết một đề thi thử (bao gồm câu hỏi)
  getMockTestDetail: async (id) => {
    const response = await axiosClient.get(`/topik-tests/${id}/detail`);
    return response.data.data;
  },

  // Nộp bài làm đề thi TOPIK
  submitMockTest: async (data) => {
    const response = await axiosClient.post(`/topik-tests/submit`, data);
    return response.data.data;
  }
};

export default topikService;
