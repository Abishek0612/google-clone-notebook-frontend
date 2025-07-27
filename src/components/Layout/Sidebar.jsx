import React from "react";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import { formatFileSize, formatDate } from "../../utils/helpers";
import Button from "../UI/Button";

const Sidebar = ({
  pdfs,
  currentPdfId,
  onPdfSelect,
  onDeletePdf,
  onBack,
  isLoading,
}) => {
  const currentPdf = pdfs.find((pdf) => pdf._id === currentPdfId);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Button variant="outline" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </Button>

        <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-16 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {pdfs.map((pdf) => (
              <div
                key={pdf._id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                  pdf._id === currentPdfId
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200"
                }`}
                onClick={() => onPdfSelect(pdf._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {pdf.originalName}
                      </h3>
                    </div>

                    <div className="mt-1 text-xs text-gray-500 space-y-1">
                      <div>{pdf.pageCount} pages</div>
                      <div>{formatFileSize(pdf.size)}</div>
                      <div>{formatDate(pdf.uploadedAt)}</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePdf(pdf._id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentPdf && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Current Document
          </h3>
          <div className="text-xs text-gray-600">
            <div className="truncate">{currentPdf.originalName}</div>
            <div className="mt-1">{currentPdf.pageCount} pages</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
