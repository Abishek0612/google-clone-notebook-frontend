import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePDF } from "../hooks/usePDF";
import PDFUpload from "../components/PDF/PDFUpload";
import Sidebar from "../components/Layout/Sidebar";
import { MessageSquare, FileText, Sparkles, Menu, X } from "lucide-react";

const FeatureCard = React.memo(({ icon: Icon, title, description, color }) => (
  <div className="p-4 text-center">
    <div
      className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}
    >
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </div>
));

const Home = () => {
  const navigate = useNavigate();
  const {
    pdfs,
    isLoading,
    initialLoading,
    uploadProgress,
    uploadPDF,
    deletePDF,
    loadPDFs,
  } = usePDF();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleUpload = React.useCallback(
    async (file) => {
      try {
        const uploadedPdf = await uploadPDF(file);
        navigate(`/dashboard/${uploadedPdf.id}`);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    },
    [uploadPDF, navigate]
  );

  const handlePdfSelect = React.useCallback(
    (pdfId) => {
      navigate(`/dashboard/${pdfId}`);
      setIsSidebarOpen(false);
    },
    [navigate]
  );

  const features = useMemo(
    () => [
      {
        icon: FileText,
        title: "Upload PDF",
        description: "Drag and drop or click to upload your document",
        color: "bg-blue-100 text-blue-600",
      },
      {
        icon: MessageSquare,
        title: "Ask Questions",
        description: "Chat naturally about your document content",
        color: "bg-purple-100 text-purple-600",
      },
      {
        icon: Sparkles,
        title: "Get Insights",
        description: "Receive AI-powered analysis and citations",
        color: "bg-amber-100 text-amber-600",
      },
    ],
    []
  );

  if (initialLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center p-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {pdfs.length > 0 && (
        <>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-40 lg:hidden bg-white hover:bg-gray-50 p-3 rounded-xl shadow-lg border border-gray-200 transition-all duration-200"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          <div
            className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
            <div
              className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white transform transition-transform duration-300 ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Documents
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="h-full overflow-hidden">
                <Sidebar
                  pdfs={pdfs}
                  onPdfSelect={handlePdfSelect}
                  onDeletePdf={deletePDF}
                  onBack={() => setIsSidebarOpen(false)}
                  isLoading={isLoading && !initialLoading}
                  isMobile={true}
                />
              </div>
            </div>
          </div>

          <div className="hidden lg:block fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 z-30">
            <Sidebar
              pdfs={pdfs}
              onPdfSelect={handlePdfSelect}
              onDeletePdf={deletePDF}
              onBack={() => {}}
              isLoading={isLoading && !initialLoading}
            />
          </div>
        </>
      )}

      <div
        className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12 ${
          pdfs.length > 0 ? "lg:ml-80" : ""
        }`}
      >
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                NotebookLM
              </span>
              <br />
              <span className="text-gray-700">Clone</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Transform your PDFs into interactive conversations. Upload any
              document and start chatting with AI-powered insights.
            </p>
          </div>

          <div className="px-4">
            <PDFUpload
              onUpload={handleUpload}
              isLoading={isLoading}
              uploadProgress={uploadProgress}
            />
          </div>

          {pdfs.length === 0 && (
            <div className="mt-8 sm:mt-12 px-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
