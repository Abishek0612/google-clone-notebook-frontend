import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const pdfAPI = {
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append("pdf", file);

    return api.post("/pdf/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
    });
  },

  getAll: () => api.get("/pdf"),

  getById: (id) =>
    api.get(`/pdf/${id}`, {
      responseType: "blob",
    }),

  delete: (id) => api.delete(`/pdf/${id}`),
};

export const chatAPI = {
  sendMessage: (pdfId, message) =>
    api.post("/chat/message", { pdfId, message }),

  getConversation: (pdfId) => api.get(`/chat/conversation/${pdfId}`),
};

export default api;
