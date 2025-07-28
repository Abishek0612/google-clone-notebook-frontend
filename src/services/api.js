import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    if (error.code === "ERR_NETWORK") {
      console.error(
        "Network Error: Check if backend server is running on port 5000"
      );
    }

    if (error.response?.status === 404) {
      console.error("API Endpoint not found:", error.config?.url);
    }

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

  getEmbeddingStatus: (id) => api.get(`/pdf/${id}/embedding-status`),

  reprocessEmbeddings: (id) => api.post(`/pdf/${id}/reprocess-embeddings`),

  delete: (id) => api.delete(`/pdf/${id}`),
};

export const chatAPI = {
  sendMessage: (pdfId, message) =>
    api.post("/chat/message", { pdfId, message }),

  getConversation: (pdfId) => api.get(`/chat/conversation/${pdfId}`),

  searchSimilar: (pdfId, query, limit = 5) =>
    api.post("/chat/search-similar", { pdfId, query, limit }),
};

export default api;
