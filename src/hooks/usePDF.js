import { useState, useCallback } from "react";
import { pdfAPI } from "../services/api";
import toast from "react-hot-toast";
import { MESSAGES } from "../utils/constants";

export const usePDF = () => {
  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadPDFs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await pdfAPI.getAll();
      setPdfs(response.data);
    } catch (error) {
      console.error("Failed to load PDFs:", error);
      toast.error("Failed to load PDFs");
    } finally {
      setIsLoading(false);
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

      toast.success(MESSAGES.UPLOAD_SUCCESS);
      setPdfs((prev) => [response.data, ...prev]);
      return response.data;
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
      setPdfs((prev) => prev.filter((pdf) => pdf._id !== id));
      toast.success(MESSAGES.DELETE_SUCCESS);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(MESSAGES.DELETE_ERROR);
    }
  }, []);

  return {
    pdfs,
    isLoading,
    uploadProgress,
    uploadPDF,
    deletePDF,
    loadPDFs,
  };
};
