import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { X, Upload, AlertCircle, FileText } from "../lib/icons";
import documentService from "../services/documentService";

const DOCUMENT_TYPES = [
  { value: "resume", label: "Resume / CV" },
  { value: "contract", label: "Contract" },
  { value: "certificate", label: "Certificate" },
  { value: "id_proof", label: "ID Proof" },
  { value: "other", label: "Other" },
];

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DocumentUploadModal = ({
  isOpen,
  employeeId,
  onClose,
  onDocumentUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    type: "other",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const newErrors = {};

    if (!file) {
      newErrors.file = "Please select a file";
      return newErrors;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      newErrors.file =
        "Invalid file type. Allowed types: PDF, DOCX, DOC, JPG, PNG";
      return newErrors;
    }

    if (file.size > MAX_FILE_SIZE) {
      newErrors.file = `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      return newErrors;
    }

    return newErrors;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileErrors = validateFile(file);
      if (Object.keys(fileErrors).length > 0) {
        setErrors(fileErrors);
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setErrors({});
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileErrors = validateFile(file);
      if (Object.keys(fileErrors).length > 0) {
        setErrors(fileErrors);
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setErrors({});
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fileErrors = validateFile(selectedFile);
    if (Object.keys(fileErrors).length > 0) {
      setErrors(fileErrors);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress (you can implement real progress tracking)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const { data, error } = await documentService.upload(
      employeeId,
      selectedFile,
      formData,
    );

    clearInterval(progressInterval);
    setUploadProgress(100);

    setTimeout(() => {
      setIsUploading(false);

      if (error) {
        setErrors({
          submit:
            error.message || "Failed to upload document. Please try again.",
        });
        setUploadProgress(0);
      } else {
        onDocumentUploaded(data);
        handleClose();
      }
    }, 500);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFormData({
      type: "other",
      notes: "",
    });
    setErrors({});
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Upload Document</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div className="error-banner">
                <AlertCircle size={20} />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                selectedFile
                  ? "border-primary-color bg-primary-color/5"
                  : "border-border-color hover:border-primary-color"
              } ${errors.file ? "border-danger-color" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={isUploading}
              />

              {selectedFile ? (
                <div>
                  <FileText
                    size={48}
                    className="mx-auto mb-3 text-primary-color"
                  />
                  <p className="text-main font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted mt-1">
                    {documentService.formatFileSize(selectedFile.size)}
                  </p>
                  <p className="text-xs text-muted mt-2">
                    Click to change file
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={48} className="mx-auto mb-3 text-muted" />
                  <p className="text-main font-medium">
                    Drop file here or click to browse
                  </p>
                  <p className="text-sm text-muted mt-2">
                    Supported formats: PDF, DOCX, DOC, JPG, PNG
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Maximum file size: 10MB
                  </p>
                </div>
              )}
            </div>
            {errors.file && (
              <span className="error-message mt-2 block">{errors.file}</span>
            )}

            {/* Document Type */}
            <div className="form-group mt-4">
              <label htmlFor="document-type" className="form-label">
                Document Type
              </label>
              <select
                id="document-type"
                className="form-input"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                disabled={isUploading}
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="document-notes" className="form-label">
                Notes (Optional)
              </label>
              <textarea
                id="document-notes"
                className="form-input"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Add any additional notes about this document..."
                rows={3}
                maxLength={500}
                disabled={isUploading}
              />
              <span className="text-xs text-muted mt-1">
                {formData.notes.length}/500 characters
              </span>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-main">Uploading...</span>
                  <span className="text-muted">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-tertiary rounded-full h-2">
                  <div
                    className="bg-primary-color h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedFile || isUploading}
            >
              {isUploading
                ? `Uploading... ${uploadProgress}%`
                : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

DocumentUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  employeeId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onDocumentUploaded: PropTypes.func.isRequired,
};

export default DocumentUploadModal;
