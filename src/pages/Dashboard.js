import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PDFViewer from "../components/PDF/PDFViewer";
import ChatInterface from "../components/Chat/ChatInterface";
import { ArrowLeft, MessageSquare, FileText, Menu } from "lucide-react";

const Dashboard = () => {
  const { pdfId } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [targetPage, setTargetPage] = useState(null);
  const [activeView, setActiveView] = useState("chat");

  useEffect(() => {
    if (pdfId) {
      const url = `https://google-notebook-clone-server.onrender.com/api/${pdfId}`;
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Document Selected
          </h2>
          <p className="text-gray-600 mb-6">
            Please select a PDF document to start chatting.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Go Back to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
            <div className="h-6 border-l border-gray-300 hidden sm:block"></div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 hidden sm:block">
                Document Chat
              </h1>
            </div>
          </div>

          <div className="md:hidden">
            <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => setActiveView("chat")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeView === "chat"
                    ? "bg-white text-blue-600 shadow-sm font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Chat</span>
              </button>
              <button
                onClick={() => setActiveView("pdf")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeView === "pdf"
                    ? "bg-white text-blue-600 shadow-sm font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex w-full h-full overflow-hidden">
        <div
          className={`${
            activeView === "chat" ? "flex" : "hidden"
          } md:flex w-full md:w-2/3 lg:w-3/5 xl:w-2/3 bg-white border-r border-gray-200`}
        >
          <ChatInterface pdfId={pdfId} onCitationClick={handleCitationClick} />
        </div>

        <div
          className={`${
            activeView === "pdf" ? "flex" : "hidden"
          } md:flex w-full md:w-1/3 lg:w-2/5 xl:w-1/3`}
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
