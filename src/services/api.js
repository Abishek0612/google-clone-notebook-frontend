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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (config.url && config.url.includes("undefined")) {
      console.error("API Request with undefined ID:", config.url);
      return Promise.reject(new Error("Invalid ID in request"));
    }

    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
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

    if (error.response?.data?.needsReupload) {
      console.warn("File needs re-upload:", error.response.data);
    }

    return Promise.reject(error);
  }
);

const validateId = (id, paramName = "ID") => {
  if (
    !id ||
    id === "undefined" ||
    id === "null" ||
    id === undefined ||
    id === null
  ) {
    throw new Error(`Invalid ${paramName}: ${id}`);
  }
  return id;
};

export const pdfAPI = {
  upload: (file, onProgress) => {
    if (!file) {
      return Promise.reject(new Error("No file provided"));
    }

    const formData = new FormData();
    formData.append("pdf", file);

    return api.post("/pdf/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
      timeout: 120000,
    });
  },

  getAll: () => api.get("/pdf"),

  getById: (id) => {
    validateId(id, "PDF ID");
    return api.get(`/pdf/${id}`, {
      responseType: "blob",
    });
  },

  getEmbeddingStatus: (id) => {
    validateId(id, "PDF ID");
    return api.get(`/pdf/${id}/embedding-status`);
  },

  repairCheck: (id) => {
    validateId(id, "PDF ID");
    return api.get(`/pdf/${id}/repair`);
  },

  reprocessEmbeddings: (id) => {
    validateId(id, "PDF ID");
    return api.post(`/pdf/${id}/reprocess-embeddings`);
  },

  delete: (id) => {
    validateId(id, "PDF ID");
    return api.delete(`/pdf/${id}`);
  },
};

export const chatAPI = {
  sendMessage: (pdfId, message) => {
    validateId(pdfId, "PDF ID");
    if (!message || !message.trim()) {
      return Promise.reject(new Error("Message cannot be empty"));
    }
    return api.post("/chat/message", { pdfId, message });
  },

  getConversation: (pdfId) => {
    validateId(pdfId, "PDF ID");
    return api.get(`/chat/conversation/${pdfId}`);
  },

  deleteMessage: (pdfId, messageId) => {
    validateId(pdfId, "PDF ID");
    validateId(messageId, "Message ID");
    return api.delete(`/chat/conversation/${pdfId}/message/${messageId}`);
  },

  clearConversation: (pdfId) => {
    validateId(pdfId, "PDF ID");
    return api.delete(`/chat/conversation/${pdfId}/clear`);
  },

  searchSimilar: (pdfId, query, limit = 5) => {
    validateId(pdfId, "PDF ID");
    if (!query || !query.trim()) {
      return Promise.reject(new Error("Query cannot be empty"));
    }
    return api.post("/chat/search-similar", { pdfId, query, limit });
  },
};

export default api;
