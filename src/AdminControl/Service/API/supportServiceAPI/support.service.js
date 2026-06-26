import axiosClient from "../../../../api/axiosAPI";

const supportService = {
  getMyTickets() {
    return axiosClient.get("/support/my-tickets");
  },

  getTicketDetail(id) {
    return axiosClient.get(`/support/ticket/${id}`);
  },

  createTicket(data) {
    return axiosClient.post("/support/ticket", data);
  },

  replyTicket(id, data) {
    return axiosClient.post(`/support/ticket/${id}/reply`, data);
  },
  
  uploadAttachment(file) {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/support/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
};

export default supportService;
