import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { FILE_TYPES, FILE_SIZE_LIMIT, MESSAGES } from "../../utils/constants";
import { formatFileSize } from "../../utils/helpers";

const PDFUpload = ({ onUpload, isLoading, uploadProgress }) => {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((error) => error.code === "file-too-large")) {
          alert(MESSAGES.FILE_TOO_LARGE);
        } else if (
          rejection.errors.some((error) => error.code === "file-invalid-type")
        ) {
          alert(MESSAGES.INVALID_FILE_TYPE);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [FILE_TYPES.PDF]: [".pdf"],
    },
    maxSize: FILE_SIZE_LIMIT,
    multiple: false,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-blue-50 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Processing PDF
          </h3>
          <p className="text-gray-600 mb-6">
            Extracting content and preparing your document for AI analysis
          </p>
        </div>

        {uploadProgress > 0 && (
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-blue-600">
              {uploadProgress}% Complete
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 lg:p-12 text-center cursor-pointer transition-all duration-300 ease-out
          ${
            isDragActive
              ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105"
              : "border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            {isDragActive ? (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                <Upload className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg">
                <FileText className="w-10 h-10 text-gray-600 hover:text-blue-600 transition-colors duration-300" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {isDragActive
                ? "Drop your PDF here"
                : "Upload PDF to start chatting"}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              {isDragActive
                ? "Release to upload your document"
                : "Drag and drop your PDF file here, or click to browse"}
            </p>

            <button
              type="button"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              <span>Choose File</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
            <AlertCircle className="w-4 h-4" />
            <span>Maximum file size: {formatFileSize(FILE_SIZE_LIMIT)}</span>
          </div>
        </div>

        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};

export default PDFUpload;
