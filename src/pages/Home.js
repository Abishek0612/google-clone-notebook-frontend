import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePDF } from "../hooks/usePDF";
import PDFUpload from "../components/PDF/PDFUpload";
import Sidebar from "../components/Layout/Sidebar";

const Home = () => {
  const navigate = useNavigate();
  const { pdfs, isLoading, uploadProgress, uploadPDF, deletePDF, loadPDFs } =
    usePDF();

  useEffect(() => {
    loadPDFs();
  }, [loadPDFs]);

  const handleUpload = async (file) => {
    try {
      const uploadedPdf = await uploadPDF(file);
      navigate(`/dashboard/${uploadedPdf.id}`);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handlePdfSelect = (pdfId) => {
    navigate(`/dashboard/${pdfId}`);
  };

  return (
    <div className="h-screen flex flex-col sm:flex-row bg-gray-50">
      {pdfs.length > 0 && (
        <div className="w-full sm:w-80 flex-shrink-0 order-2 sm:order-1">
          <Sidebar
            pdfs={pdfs}
            onPdfSelect={handlePdfSelect}
            onDeletePdf={deletePDF}
            onBack={() => {}}
            isLoading={isLoading}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 order-1 sm:order-2">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              NotebookLM Clone
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Upload a PDF and start chatting with your document
            </p>
          </div>

          <PDFUpload
            onUpload={handleUpload}
            isLoading={isLoading}
            uploadProgress={uploadProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
