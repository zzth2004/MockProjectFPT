import axiosClient from "../../../../api/axiosAPI";

const googleService = {
  checkStatus: async () => {
    return axiosClient.get("/google/check-status").then((res) => res.data);
  },
  connect: async () => {
    return axiosClient.get("/google/connect").then((res) => res.data);
  },
  getAnalytics: async (type = "week") => {
    return axiosClient.get(`/google/analytics?type=${type}`).then((res) => res.data);
  }
};

export default googleService;
