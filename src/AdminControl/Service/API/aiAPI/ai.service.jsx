import axiosClient from "../../../../api/axiosAPI";
import { useAuth } from "../../../../context/authContext";

const AiService = {
  

  navigate: async (message) => {
    const response = await axiosClient.post('/ai/navigate', { message });
    return response.data;
  },

  navigatePublic: async (message) => {
    const response = await axiosClient.post('/ai/navigate-public', { message });
    return response.data;
  },

  // ==================== 2. SESSION MANAGEMENT ====================
  // Quản lý lịch sử các cuộc hội thoại
  createSession: async (userId, type, title) => {
    const response = await axiosClient.post('/ai/session', { userId, type, title });
    console.log("Create Session Response:", response);
    return response.data.data;
  },

  getSessions: async (userId, type = null) => {
    const response = await axiosClient.get(`/ai/sessions/${userId}`, {
      params: { type },
    });
    console.log("Get Sessions Response:", response);
    return response.data.data;
  },

  getSessionMessages: async (sessionId, userId) => {
    const response = await axiosClient.get(`/ai/session/${sessionId}/messages/${userId}`);
    console.log("Get Session Messages Response:", response);
    return response.data.data;
  },

  deleteSession: async (sessionId, userId) => {
    const response = await axiosClient.delete(`/ai/session/${sessionId}/${userId}`);
    console.log("Delete Session Response:", response);
    return response.data.data;
  },

  // ==================== 3. CORE AI FEATURES (4 PHẦN CHÍNH) ====================

  /**
   * PHẦN CHAT: Chat text với AI
   * @param {number} sessionId - ID phiên làm việc
   * @param {number} userId - ID người dùng
   * @param {string} message - Nội dung chat
   */
  chat: async (sessionId, userId, message) => {
    const response = await axiosClient.post('/ai/chat', { sessionId, userId, message });
    return response.data.data;
  },

  /**
   * PHẦN TALK WITH AI: Chấm điểm phát âm
   * @param {Object} pronunciationDto - { userTranscript, targetSentence, userId, ... }
   */
  evaluatePronunciation: async (pronunciationDto) => {
    const response = await axiosClient.post('/ai/evaluate-pronunciation', pronunciationDto);
    return response.data.data;
  },

  /**
   * PHẦN EXPLAIN: Giải thích từ vựng hoặc ngữ pháp
   * @param {string} word - Từ cần giải thích
   * @param {string} context - Ngữ cảnh (optional)
   */
  explainWord: async (word, context = '') => {
    const response = await axiosClient.post('/ai/explain-word', { word, context });
    return response.data.data;
  },

  /**
   * PHẦN SỬA BÀI VIẾT: Chấm điểm và sửa lỗi văn bản
   * @param {string} text - Văn bản người dùng viết
   * @param {string[]} criteria - Các tiêu chí (grammar, spelling...)
   */
  evaluateWriting: async (text, criteria = []) => {
    const response = await axiosClient.post('/ai/writing-evaluate', { text, criteria });
    return response.data.data;
  },

  // ==================== 4. CONTENT GENERATION (Dành cho Giáo viên/Admin) ====================
  
  generateVocab: async (lessonId, config) => {
    const response = await axiosClient.post(`/ai/generate-vocab/${lessonId}`, config);
    return response.data.data;
  },

  generateGrammar: async (lessonId, config) => {
    const response = await axiosClient.post(`/ai/generate-grammar/${lessonId}`, config);
    return response.data.data;
  },

  generateExercise: async (exerciseId, config) => {
    const response = await axiosClient.post(`/ai/generate-exercise/${exerciseId}`, config);
    return response.data.data;
  },

  generateFlashcards: async (deckId, config) => {
    const response = await axiosClient.post(`/ai/generate-flashcards/${deckId}`, config);
    return response.data;
  },

  generateReading: async (lessonIds, topic) => {
    const response = await axiosClient.post('/ai/generate-reading', { lessonIds, topic });
    return response.data.data;
  }
};

export default AiService;