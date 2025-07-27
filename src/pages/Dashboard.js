import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PDFViewer from "../components/PDF/PDFViewer";
import ChatInterface from "../components/Chat/ChatInterface";
import { ArrowLeft } from "lucide-react";

const Dashboard = () => {
  const { pdfId } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [targetPage, setTargetPage] = useState(null);

  useEffect(() => {
    if (pdfId) {
      const url = `http://localhost:5000/api/pdf/${pdfId}`;
      console.log("Setting PDF URL:", url);
      setPdfUrl(url);
    }
  }, [pdfId]);

  const handleCitationClick = (page) => {
    console.log("Citation clicked for page:", page);
    setTargetPage(page);
  };

  const handleBack = () => {
    navigate("/");
  };

  if (!pdfId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            No PDF Selected
          </h2>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Upload</span>
          </button>
          <div className="h-6 border-l border-gray-300"></div>
          <h1 className="text-lg font-semibold text-gray-900">Document Chat</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-1/2 bg-white border-r">
          <ChatInterface pdfId={pdfId} onCitationClick={handleCitationClick} />
        </div>

        {/* PDF Viewer Panel */}
        <div className="w-1/2">
          {pdfUrl && (
            <PDFViewer
              pdfUrl={pdfUrl}
              targetPage={targetPage}
              onPageChange={() => setTargetPage(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
