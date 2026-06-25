import axios from "axios";


const axiosClient = axios.create({

  baseURL: "http://localhost:3000/api",

  headers: {
    "Content-Type": "application/json",

    "ngrok-skip-browser-warning": "69420"
    // "ngrok-skip-browser-warning": "69420",

  },
  timeout: 100000,
});
// Interceptor 401: silent freeze (keep chain from crashing)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("[axiosClient] 401 Unauthorized - token may be missing or expired.");
      return new Promise(() => { }); // freeze chain silently
    }
    return Promise.reject(error);
  }
);


axiosClient.interceptors.request.use(
  (config) => {
    // sessionStorage (same tab) -> localStorage (cross-tab, new tab) fallback
    const token = sessionStorage.getItem("jwt") || localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// axiosClient.interceptors.response.use(
//   (response) => {
//     return response.data;
//   },
//   (error) => {

//     if (error.response && error.response.status === 401) {
//       console.error("Unauthorized, logging out...");
//       localStorage.removeItem("token");
//       window.location.href = "/login"; 
//     }

//     return Promise.reject(error);
//   }
// );


export default axiosClient;
