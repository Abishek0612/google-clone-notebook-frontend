import React from "react";
import { ArrowLeft, FileText, Trash2, RefreshCw } from "lucide-react";
import { formatFileSize, formatDate } from "../../utils/helpers";
import Button from "../UI/Button";

const SkeletonItem = React.memo(() => (
  <div className="animate-pulse p-3 rounded-lg border border-gray-200">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="w-4 h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
));

const PDFItem = React.memo(({ pdf, isSelected, onSelect, onDelete }) => (
  <div
    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
      isSelected ? "border-primary-500 bg-primary-50" : "border-gray-200"
    }`}
    onClick={() => onSelect(pdf._id)}
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
          onDelete(pdf._id);
        }}
        className="text-gray-400 hover:text-red-500 transition-colors p-1"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
));

const Sidebar = React.memo(
  ({ pdfs, currentPdfId, onPdfSelect, onDeletePdf, onBack, isLoading }) => {
    const currentPdf = React.useMemo(
      () => pdfs.find((pdf) => pdf._id === currentPdfId),
      [pdfs, currentPdfId]
    );

    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <Button variant="outline" size="sm" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            {pdfs.length > 0 && (
              <button
                onClick={() => window.location.reload()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonItem key={i} />
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {pdfs.map((pdf) => (
                <PDFItem
                  key={pdf._id}
                  pdf={pdf}
                  isSelected={pdf._id === currentPdfId}
                  onSelect={onPdfSelect}
                  onDelete={onDeletePdf}
                />
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
  }
);

export default Sidebar;
