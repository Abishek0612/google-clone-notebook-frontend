import React from "react";

function PDFViewer({ pdfUrl }) {
  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <h3>PDF Viewer</h3>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
          Open PDF
        </a>
      </div>
      <iframe src={pdfUrl} width="100%" height="600px" title="PDF" />
    </div>
  );
}

export default PDFViewer;
