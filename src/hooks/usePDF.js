import { useState, useCallback, useEffect } from "react";
import { pdfAPI } from "../services/api";
import toast from "react-hot-toast";
import { MESSAGES } from "../utils/constants";

const CACHE_KEY = "pdf_cache";
const CACHE_DURATION = 5 * 60 * 1000;

const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error("Cache read error:", error);
  }
  return null;
};

const setCache = (data) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Cache write error:", error);
  }
};

const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Cache clear error:", error);
  }
};

export const usePDF = () => {
  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const cachedData = getCache();
    if (cachedData) {
      setPdfs(cachedData);
      setInitialLoading(false);
    } else {
      loadPDFs();
    }
  }, []);

  const loadPDFs = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await pdfAPI.getAll();
      setPdfs(response.data);
      setCache(response.data);
    } catch (error) {
      console.error("Failed to load PDFs:", error);
      toast.error("Failed to load PDFs");
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, []);

  const uploadPDF = useCallback(async (file) => {
    setIsLoading(true);
    setUploadProgress(0);

    try {
      const response = await pdfAPI.upload(file, (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(progress);
      });

      const newPdf = response.data;
      setPdfs((prev) => {
        const updated = [newPdf, ...prev];
        setCache(updated);
        return updated;
      });

      toast.success(MESSAGES.UPLOAD_SUCCESS);
      return newPdf;
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(MESSAGES.UPLOAD_ERROR);
      throw error;
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }, []);

  const deletePDF = useCallback(async (id) => {
    try {
      await pdfAPI.delete(id);
      setPdfs((prev) => {
        const updated = prev.filter((pdf) => pdf._id !== id);
        setCache(updated);
        return updated;
      });
      toast.success(MESSAGES.DELETE_SUCCESS);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(MESSAGES.DELETE_ERROR);
    }
  }, []);

  const refreshPDFs = useCallback(() => {
    clearCache();
    loadPDFs();
  }, [loadPDFs]);

  return {
    pdfs,
    isLoading,
    initialLoading,
    uploadProgress,
    uploadPDF,
    deletePDF,
    loadPDFs,
    refreshPDFs,
  };
};
