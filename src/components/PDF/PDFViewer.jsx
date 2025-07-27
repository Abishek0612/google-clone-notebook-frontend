import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import Button from "../UI/Button";
import Loading from "../UI/Loading";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ pdfUrl, onPageChange, targetPage }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }) => {
      setNumPages(numPages);
      setIsLoading(false);
      if (targetPage && targetPage <= numPages) {
        setPageNumber(targetPage);
      }
    },
    [targetPage]
  );

  const onDocumentLoadError = useCallback((error) => {
    console.error("PDF load error:", error);
    setIsLoading(false);
  }, []);

  const goToPrevPage = useCallback(() => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
    }
  }, [pageNumber, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
    }
  }, [pageNumber, numPages, onPageChange]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.1, 2.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  React.useEffect(() => {
    if (targetPage && targetPage !== pageNumber && targetPage <= numPages) {
      setPageNumber(targetPage);
    }
  }, [targetPage, pageNumber, numPages]);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-sm text-gray-600">
            Page {pageNumber} of {numPages || 0}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <Loading text="Loading PDF..." />
        ) : (
          <div className="flex justify-center">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<Loading text="Loading document..." />}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={<Loading text="Loading page..." />}
                className="shadow-lg"
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
