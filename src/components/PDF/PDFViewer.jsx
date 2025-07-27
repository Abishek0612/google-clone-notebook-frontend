import React, { useState, useEffect } from "react";
import { ExternalLink, Download, FileText, Smartphone } from "lucide-react";

function PDFViewer({ pdfUrl, targetPage }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);
      if (mobile) {
        setShowFallback(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const openInNewTab = () => {
    window.open(pdfUrl, "_blank");
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isMobile || showFallback) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <div className="px-4 py-3 bg-white border-b flex justify-between items-center flex-shrink-0">
          <h3 className="text-sm font-medium text-gray-700">PDF Document</h3>
          <Smartphone className="w-4 h-4 text-blue-500" />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              PDF Document Ready
            </h3>

            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              For the best mobile experience, open the PDF in your browser or
              download it to your device.
            </p>

            <div className="space-y-3">
              <button
                onClick={openInNewTab}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="font-medium">Open PDF in Browser</span>
              </button>

              <button
                onClick={downloadPDF}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors shadow-sm"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Download PDF</span>
              </button>

              <button
                onClick={() => setShowFallback(false)}
                className="w-full px-6 py-3 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Try viewing inline anyway
              </button>
            </div>

            {targetPage && (
              <div className="mt-4 text-xs text-gray-500">
                Jump to page {targetPage} after opening
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="px-3 py-2 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-700">PDF Document</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFallback(true)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Mobile View
          </button>
          <button
            onClick={openInNewTab}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden lg:inline">Open</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full overflow-hidden">
        <iframe
          src={`${pdfUrl}#page=${targetPage || 1}&view=FitH`}
          width="100%"
          height="100%"
          title="PDF Viewer"
          className="border-0 w-full h-full"
          onError={() => setShowFallback(true)}
        />
      </div>
    </div>
  );
}

export default PDFViewer;
