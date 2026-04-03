import React, { useState, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Upload, Download, Trash, Calendar, Folder } from "../lib/icons";
import { formatDistanceToNow } from "date-fns";
const DocumentUploadModal = lazy(() => import("./DocumentUploadModal"));
const ConfirmModal = lazy(() => import("./ui/ConfirmModal"));
import documentService from "../services/documentService";

const DocumentList = ({
  employeeId,
  documents,
  onDocumentAdded,
  onDocumentDeleted,
  isLoading,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getDocumentIcon = (mimeType) => {
    const icon = documentService.getFileIcon(mimeType);
    const icons = {
      PDF: "📄",
      DOC: "📝",
      IMG: "🖼️",
      XLS: "📊",
      File: "📎",
    };
    return icons[icon] || icons.File;
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      resume: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      contract: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      certificate: "bg-green-500/10 text-green-500 border-green-500/20",
      id_proof: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[type] || colors.other;
  };

  const handleDownload = async (document) => {
    setDownloadingId(document.id);
    await documentService.download(document.file_url, document.name);
    setDownloadingId(null);
  };

  const handleDeleteDocument = (document) => {
    setSelectedDocument(document);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedDocument) {
      setActionLoading(true);
      try {
        await onDocumentDeleted(selectedDocument.id);
        setShowDeleteModal(false);
        setSelectedDocument(null);
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="emp-detail__card">
        <div className="emp-detail__card-header">
          <h3 className="emp-detail__card-title">
            <Folder size={18} />
            Documents
          </h3>
        </div>
        <div className="emp-detail__card-body flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-detail__card">
      <div className="emp-detail__card-header">
        <h3 className="emp-detail__card-title">
          <Folder size={18} />
          Documents
        </h3>
        <button
          className="emp-detail__btn emp-detail__btn--primary emp-detail__btn--sm"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      <div className="emp-detail__card-body">
        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border-color hover:border-primary transition-all duration-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-3xl flex-shrink-0 bg-main p-2 rounded-lg border border-border-color">
                    {getDocumentIcon(document.mime_type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-main truncate text-sm">
                      {document.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1.5 font-medium">
                      <span
                        className={`px-2 py-0.5 rounded-md border ${getDocumentTypeColor(document.type)}`}
                      >
                        {document.type}
                      </span>
                      <span>
                        {documentService.formatFileSize(document.file_size)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-light" />
                        <span>
                          {formatDistanceToNow(new Date(document.created_at || document.uploaded_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    {document.notes && (
                      <p className="text-xs text-muted mt-2 italic bg-main/50 p-2 rounded border border-border-light inline-block w-full truncate">
                        {document.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button
                    className="p-2.5 bg-main hover:bg-primary-light hover:text-primary rounded-lg transition-colors border border-border-color hover:border-primary-light text-muted"
                    onClick={() => handleDownload(document)}
                    disabled={downloadingId === document.id}
                    title="Download document"
                  >
                    {downloadingId === document.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                  <button
                    className="p-2.5 bg-main hover:bg-danger-bg hover:text-danger-color rounded-lg transition-colors border border-border-color hover:border-danger-bg text-muted"
                    onClick={() => handleDeleteDocument(document)}
                    title="Delete document"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="emp-detail__empty h-full w-full py-8 border-0 bg-transparent">
            <Folder size={48} className="emp-detail__empty-icon opacity-30 text-muted" />
            <h3 className="text-lg font-bold text-main mt-4 mb-2">No documents uploaded</h3>
            <p className="text-muted text-sm mb-6">Upload credentials, contracts, or identification.</p>
            <button
              className="emp-detail__btn emp-detail__btn--primary"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={16} />
              Upload First Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Suspense fallback={null}>
        <DocumentUploadModal
          isOpen={showUploadModal}
          employeeId={employeeId}
          onClose={() => setShowUploadModal(false)}
          onDocumentUploaded={(document) => {
            onDocumentAdded(document);
            setShowUploadModal(false);
          }}
        />
      </Suspense>

      {/* Delete Confirmation Modal */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Document"
          message={`Are you sure you want to delete "${selectedDocument?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedDocument(null);
          }}
          isLoading={actionLoading}
          type="danger"
        />
      </Suspense>
    </div>
  );
};

DocumentList.propTypes = {
  employeeId: PropTypes.number.isRequired,
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      file_url: PropTypes.string.isRequired,
      file_size: PropTypes.number,
      mime_type: PropTypes.string,
      uploaded_at: PropTypes.string.isRequired,
      notes: PropTypes.string,
    }),
  ),
  onDocumentAdded: PropTypes.func.isRequired,
  onDocumentDeleted: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default DocumentList;
