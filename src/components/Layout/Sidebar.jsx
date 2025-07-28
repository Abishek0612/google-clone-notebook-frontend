import React from "react";
import {
  ArrowLeft,
  FileText,
  Trash2,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatFileSize, formatDate } from "../../utils/helpers";
import Button from "../UI/Button";

const EmbeddingStatus = React.memo(({ status, progress, fileExists }) => {
  const getStatusConfig = (status, fileExists) => {
    if (!fileExists) {
      return {
        color: "text-red-600 bg-red-50 border-red-200",
        text: "File Missing",
        icon: <XCircle className="w-3 h-3" />,
      };
    }

    switch (status) {
      case "completed":
        return {
          color: "text-green-600 bg-green-50 border-green-200",
          text: "Vector Ready",
          icon: <CheckCircle className="w-3 h-3" />,
        };
      case "processing":
        return {
          color: "text-blue-600 bg-blue-50 border-blue-200",
          text: `Processing ${progress || 0}%`,
          icon: <RefreshCw className="w-3 h-3 animate-spin" />,
        };
      case "failed":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          text: "Processing Failed",
          icon: <XCircle className="w-3 h-3" />,
        };
      default:
        return {
          color: "text-gray-600 bg-gray-50 border-gray-200",
          text: "Pending",
          icon: <div className="w-3 h-3 border border-gray-400 rounded-full" />,
        };
    }
  };

  const config = getStatusConfig(status, fileExists);

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.icon}
      <span className="ml-1">{config.text}</span>
    </span>
  );
});

const FileStatusIndicator = React.memo(({ fileExists }) => {
  if (fileExists === undefined) return null;

  return (
    <div
      className={`w-2 h-2 rounded-full ${
        fileExists ? "bg-green-500" : "bg-red-500"
      }`}
    />
  );
});

const SkeletonItem = React.memo(({ index }) => (
  <div
    key={`skeleton-${index}`}
    className="animate-pulse p-3 rounded-lg border border-gray-200"
  >
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

const PDFItem = React.memo(
  ({ pdf, isSelected, onSelect, onDelete, onReprocess }) => {
    const needsAttention = !pdf.fileExists || pdf.embeddingStatus === "failed";

    return (
      <div
        key={pdf._id}
        className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-sm"
            : needsAttention
            ? "border-red-200 bg-red-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => onSelect(pdf._id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected
                    ? "bg-blue-100"
                    : needsAttention
                    ? "bg-red-100"
                    : "bg-gray-100"
                }`}
              >
                <FileText
                  className={`w-4 h-4 ${
                    isSelected
                      ? "text-blue-600"
                      : needsAttention
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-semibold truncate ${
                    isSelected ? "text-blue-900" : "text-gray-900"
                  }`}
                >
                  {pdf.originalName}
                </h3>
              </div>
              <FileStatusIndicator fileExists={pdf.fileExists} />
            </div>

            <div className="ml-10 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{pdf.pageCount} pages</span>
                <span>{formatFileSize(pdf.size)}</span>
              </div>

              <EmbeddingStatus
                status={pdf.embeddingStatus}
                progress={pdf.embeddingProgress}
                fileExists={pdf.fileExists}
              />

              {!pdf.fileExists && (
                <div className="flex items-center space-x-1 text-xs text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Re-upload required</span>
                </div>
              )}

              {pdf.embeddingStatus === "failed" && pdf.fileExists && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReprocess?.(pdf._id);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Retry processing
                </button>
              )}

              <div className="text-xs text-gray-500">
                {formatDate(pdf.uploadedAt)}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pdf._id);
            }}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
);

const Sidebar = React.memo(
  ({
    pdfs,
    currentPdfId,
    onPdfSelect,
    onDeletePdf,
    onReprocessEmbeddings,
    onBack,
    isLoading,
    isMobile = false,
  }) => {
    const currentPdf = React.useMemo(
      () => pdfs.find((pdf) => pdf._id === currentPdfId),
      [pdfs, currentPdfId]
    );

    return (
      <div className="h-full bg-white flex flex-col">
        {!isMobile && (
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="mb-4 w-full justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
              {pdfs.length > 0 && (
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonItem key={`skeleton-${i}`} index={i} />
              ))}
            </div>
          ) : pdfs.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No documents yet
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Upload your first PDF to get started with AI-powered document
                analysis.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {pdfs.map((pdf) => (
                <PDFItem
                  key={pdf._id}
                  pdf={pdf}
                  isSelected={pdf._id === currentPdfId}
                  onSelect={onPdfSelect}
                  onDelete={onDeletePdf}
                  onReprocess={onReprocessEmbeddings}
                />
              ))}
            </div>
          )}
        </div>

        {currentPdf && (
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Current Document
                </h3>
                <div className="text-xs text-blue-700">
                  <div className="truncate font-medium">
                    {currentPdf.originalName}
                  </div>
                  <div className="mt-1 opacity-75">
                    {currentPdf.pageCount} pages
                  </div>
                  <div className="mt-1">
                    <EmbeddingStatus
                      status={currentPdf.embeddingStatus}
                      progress={currentPdf.embeddingProgress}
                      fileExists={currentPdf.fileExists}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isMobile && (
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="w-full justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        )}
      </div>
    );
  }
);

export default Sidebar;
