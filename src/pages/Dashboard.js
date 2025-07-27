import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PDFViewer from "../components/PDF/PDFViewer";
import ChatInterface from "../components/Chat/ChatInterface";
import { ArrowLeft, MessageSquare, FileText } from "lucide-react";

const Dashboard = () => {
  const { pdfId } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [targetPage, setTargetPage] = useState(null);
  const [activeView, setActiveView] = useState("chat");

  useEffect(() => {
    if (pdfId) {
      const url = `http://localhost:5000/api/pdf/${pdfId}`;
      setPdfUrl(url);
    }
  }, [pdfId]);

  const handleCitationClick = (page) => {
    setTargetPage(page);
    setActiveView("pdf");
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
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <div className="bg-white border-b px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Upload</span>
            </button>
            <div className="h-6 border-l border-gray-300 hidden sm:block"></div>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              Document Chat
            </h1>
          </div>

          <div className="md:hidden flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView("chat")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors ${
                activeView === "chat"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Chat</span>
            </button>
            <button
              onClick={() => setActiveView("pdf")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors ${
                activeView === "pdf"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex w-full h-full overflow-hidden">
        <div
          className={`${
            activeView === "chat" ? "flex" : "hidden"
          } md:flex w-full md:w-2/3 lg:w-3/5 xl:w-2/3 bg-white border-r border-gray-300`}
        >
          <ChatInterface pdfId={pdfId} onCitationClick={handleCitationClick} />
        </div>

        <div
          className={`${
            activeView === "pdf" ? "flex" : "hidden"
          } md:flex w-full md:w-1/3 lg:w-2/5 xl:w-1/3 bg-gray-50`}
        >
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
