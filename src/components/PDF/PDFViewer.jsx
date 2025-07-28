import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Download,
  FileText,
  Maximize2,
  Eye,
  AlertTriangle,
} from "lucide-react";

function PDFViewer({ pdfUrl, targetPage }) {
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    setShowFallback(true);
  };

  if (showFallback || hasError) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
        <div className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">
              PDF Document
            </h3>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25">
                <FileText className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Document Ready
            </h3>

            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              For the best experience, view the PDF in your browser or download
              it locally.
            </p>

            <div className="space-y-4">
              <button
                onClick={openInNewTab}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <ExternalLink className="w-5 h-5" />
                  <span>Open in Browser</span>
                </div>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button
                onClick={downloadPDF}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </div>
              </button>

              <button
                onClick={() => setShowFallback(false)}
                className="w-full text-sm text-blue-600 hover:text-blue-800 py-3 transition-colors duration-200"
              >
                Try inline viewer instead
              </button>
            </div>

            {targetPage && (
              <div className="mt-6 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  Jump to page {targetPage} after opening
                </p>
              </div>
            )}

            {hasError && (
              <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-amber-700">
                  PDF viewer unavailable. Use browser or download options above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col">
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center flex-shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
            <FileText className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">PDF Document</h3>
          {targetPage && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Page {targetPage}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={openInNewTab}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden lg:inline">Expand</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full overflow-hidden relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        <iframe
          src={`${pdfUrl}#page=${targetPage || 1}&view=FitH&zoom=page-width`}
          width="100%"
          height="100%"
          title="PDF Viewer"
          className="border-0 w-full h-full"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ display: isLoading ? "none" : "block" }}
        />

        {!isLoading && !hasError && (
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={() => setShowFallback(true)}
              className="px-3 py-2 bg-white/90 hover:bg-white text-gray-700 text-xs rounded-lg border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
            >
              Options
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFViewer;
