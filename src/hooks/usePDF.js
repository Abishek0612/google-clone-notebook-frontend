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
    if (cachedData && Array.isArray(cachedData)) {
      setPdfs(cachedData);
      setInitialLoading(false);
      setTimeout(() => loadPDFs(false), 1000);
    } else {
      loadPDFs();
    }
  }, []);

  useEffect(() => {
    const processingPdfs = pdfs.filter(
      (pdf) =>
        pdf.embeddingStatus === "processing" ||
        pdf.embeddingStatus === "pending"
    );

    if (processingPdfs.length > 0) {
      const interval = setInterval(async () => {
        try {
          const updates = await Promise.all(
            processingPdfs.map(async (pdf) => {
              try {
                const response = await pdfAPI.getEmbeddingStatus(pdf._id);
                return {
                  id: pdf._id,
                  status: response.data.status,
                  progress: response.data.progress || 0,
                  error: response.data.error,
                };
              } catch (error) {
                console.error(
                  `Failed to get status for PDF ${pdf._id}:`,
                  error
                );
                return null;
              }
            })
          );

          setPdfs((prev) => {
            const updated = prev.map((pdf) => {
              const update = updates.find((u) => u && u.id === pdf._id);
              if (update) {
                return {
                  ...pdf,
                  embeddingStatus: update.status,
                  embeddingProgress: update.progress,
                  embeddingError: update.error,
                };
              }
              return pdf;
            });
            setCache(updated);
            return updated;
          });

          const stillProcessing = updates.some(
            (u) => u && (u.status === "processing" || u.status === "pending")
          );

          if (!stillProcessing) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Failed to update embedding statuses:", error);
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [pdfs]);

  const loadPDFs = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await pdfAPI.getAll();
      const pdfsData = response.data || [];
      setPdfs(pdfsData);
      setCache(pdfsData);
    } catch (error) {
      console.error("Failed to load PDFs:", error);
      if (error.response?.status !== 429) {
        toast.error("Failed to load PDFs");
      }
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, []);

  const uploadPDF = useCallback(async (file) => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const response = await pdfAPI.upload(file, (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      const newPdf = response.data;
      if (!newPdf || !newPdf.id) {
        throw new Error("Invalid response from upload");
      }

      setPdfs((prev) => {
        const updated = [newPdf, ...prev];
        setCache(updated);
        return updated;
      });

      toast.success("PDF uploaded successfully!");
      return newPdf;
    } catch (error) {
      console.error("Upload failed:", error);

      if (error.response?.data?.details) {
        toast.error(error.response.data.details);
      } else if (error.message.includes("Network Error")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error("Failed to upload PDF. Please try again.");
      }

      throw error;
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }, []);

  const deletePDF = useCallback(async (id) => {
    if (!id || id === "undefined") {
      toast.error("Invalid PDF ID");
      return;
    }

    try {
      await pdfAPI.delete(id);
      setPdfs((prev) => {
        const updated = prev.filter((pdf) => pdf._id !== id);
        setCache(updated);
        return updated;
      });
      toast.success("PDF deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);

      if (error.response?.status === 404) {
        toast.error("PDF not found");
        setPdfs((prev) => {
          const updated = prev.filter((pdf) => pdf._id !== id);
          setCache(updated);
          return updated;
        });
      } else {
        toast.error("Failed to delete PDF");
      }
    }
  }, []);

  const checkPDFStatus = useCallback(async (id) => {
    if (!id || id === "undefined") {
      return null;
    }

    try {
      const response = await pdfAPI.repairCheck(id);
      return response.data;
    } catch (error) {
      console.error("Status check failed:", error);
      return null;
    }
  }, []);

  const refreshPDFs = useCallback(() => {
    clearCache();
    loadPDFs();
  }, [loadPDFs]);

  const reprocessEmbeddings = useCallback(async (id) => {
    if (!id || id === "undefined") {
      toast.error("Invalid PDF ID");
      return;
    }

    try {
      await pdfAPI.reprocessEmbeddings(id);
      toast.success("Reprocessing started");

      setPdfs((prev) =>
        prev.map((pdf) =>
          pdf._id === id
            ? { ...pdf, embeddingStatus: "processing", embeddingProgress: 0 }
            : pdf
        )
      );
    } catch (error) {
      console.error("Reprocess failed:", error);

      if (error.response?.data?.needsReupload) {
        toast.error("File missing. Please re-upload the document.");
      } else {
        toast.error("Failed to start reprocessing");
      }
    }
  }, []);

  return {
    pdfs,
    isLoading,
    initialLoading,
    uploadProgress,
    uploadPDF,
    deletePDF,
    loadPDFs,
    refreshPDFs,
    checkPDFStatus,
    reprocessEmbeddings,
  };
};
