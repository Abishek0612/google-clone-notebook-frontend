import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { usePDF } from "../hooks/usePDF";
import ChatInterface from "../components/Chat/ChatInterface";
import PDFViewer from "../components/PDF/PDFViewer";
import Sidebar from "../components/Layout/Sidebar";
import Loading from "../components/UI/Loading";

const Dashboard = () => {
  const { pdfId } = useParams();
  const navigate = useNavigate();
  const [targetPage, setTargetPage] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const { pdfs, deletePDF, loadPDFs } = usePDF();
  const {
    messages,
    isLoading: isChatLoading,
    isLoadingHistory,
    sendMessage,
    loadConversation,
  } = useChat(pdfId);

  useEffect(() => {
    loadPDFs();
  }, [loadPDFs]);

  useEffect(() => {
    if (pdfId) {
      loadConversation();
      setPdfUrl(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000/api"
        }/pdf/${pdfId}`
      );
    }
  }, [pdfId, loadConversation]);

  const handleCitationClick = (page) => {
    setTargetPage(page);
  };

  const handlePdfSelect = (selectedPdfId) => {
    navigate(`/dashboard/${selectedPdfId}`);
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleDeletePdf = async (pdfIdToDelete) => {
    await deletePDF(pdfIdToDelete);
    if (pdfIdToDelete === pdfId) {
      navigate("/");
    }
  };

  if (!pdfId) {
    return <Loading text="Loading..." />;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        pdfs={pdfs}
        currentPdfId={pdfId}
        onPdfSelect={handlePdfSelect}
        onDeletePdf={handleDeletePdf}
        onBack={handleBack}
      />

      <div className="flex-1 flex">
        <div className="w-1/2 border-r border-gray-200">
          <ChatInterface
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={isChatLoading}
            isLoadingHistory={isLoadingHistory}
            onCitationClick={handleCitationClick}
          />
        </div>

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
