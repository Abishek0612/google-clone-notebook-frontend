import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { FILE_TYPES, FILE_SIZE_LIMIT, MESSAGES } from "../../utils/constants";
import { formatFileSize } from "../../utils/helpers";
import Button from "../UI/Button";

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
      <div className="card text-center">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
          <h3 className="text-lg font-medium text-gray-900">Processing PDF</h3>
          <p className="text-gray-600">
            Please wait while we extract and process your document...
          </p>
        </div>
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
          ${
            isDragActive
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          {isDragActive ? (
            <Upload className="w-12 h-12 text-primary-500" />
          ) : (
            <FileText className="w-12 h-12 text-gray-400" />
          )}

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive
                ? "Drop your PDF here"
                : "Upload PDF to start chatting"}
            </h3>
            <p className="text-gray-600 mb-4">
              Click or drag and drop your file here
            </p>

            <Button variant="primary">Choose File</Button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span>Maximum file size: {formatFileSize(FILE_SIZE_LIMIT)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;
