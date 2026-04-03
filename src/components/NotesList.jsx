import React, { useState, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Plus, Edit, Trash, Calendar, User, FileText, CheckCircle, AlertTriangle, Users } from "../lib/icons";
import { formatDistanceToNow } from "date-fns";
const AddNoteModal = lazy(() => import("./AddNoteModal"));
const EditNoteModal = lazy(() => import("./EditNoteModal"));
const ConfirmModal = lazy(() => import("./ui/ConfirmModal"));

const NotesList = ({
  employeeId,
  notes,
  onNoteAdded,
  onNoteUpdated,
  onNoteDeleted,
  isLoading,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // Re-mapped Tailwind backgrounds to custom timeline colors and styles to fit seamlessly in the Enterprise Theme
  const getCategoryColor = (category) => {
    const colors = {
      performance: "text-blue-600 bg-blue-50 border-blue-200",
      general: "text-gray-600 bg-gray-50 border-gray-200",
      disciplinary: "text-red-600 bg-red-50 border-red-200",
      praise: "text-green-600 bg-green-50 border-green-200",
      meeting: "text-purple-600 bg-purple-50 border-purple-200",
      other: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      performance: <FileText size={16} />,
      general: <FileText size={16} />,
      disciplinary: <AlertTriangle size={16} />,
      praise: <CheckCircle size={16} />,
      meeting: <Users size={16} />,
      other: <FileText size={16} />,
    };
    return icons[category] || icons.other;
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setShowEditModal(true);
  };

  const handleDeleteNote = (note) => {
    setSelectedNote(note);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedNote) {
      setActionLoading(true);
      try {
        await onNoteDeleted(selectedNote.id);
        setShowDeleteModal(false);
        setSelectedNote(null);
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="emp-detail__card">
        <div className="emp-detail__card-header">
          <h3 className="emp-detail__card-title">
            <FileText size={18} />
            Notes & Activity Log
          </h3>
        </div>
        <div className="emp-detail__card-body flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Sort notes so newest is generally at top of timeline
  const sortedNotes = notes ? [...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];

  return (
    <div className="emp-detail__card">
      <div className="emp-detail__card-header">
        <h3 className="emp-detail__card-title">
          <FileText size={18} />
          Notes & Activity Log
        </h3>
        <button
          className="emp-detail__btn emp-detail__btn--primary emp-detail__btn--sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          Log Activity
        </button>
      </div>

      <div className="emp-detail__card-body">
        {sortedNotes && sortedNotes.length > 0 ? (
          <div className="emp-detail__timeline pt-4 pb-2 px-2">
            {sortedNotes.map((note) => (
              <div key={note.id} className="emp-detail__timeline-item group">
                <div className={`emp-detail__timeline-marker ${note.category === 'disciplinary' ? 'border-red-500 text-red-500' : ''} ${note.category === 'praise' ? 'border-green-500 text-green-500' : ''}`}>
                  {getCategoryIcon(note.category)}
                </div>

                <div className="emp-detail__timeline-content relative">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-main text-base mb-1">{note.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted">
                        <span className="flex items-center gap-1.5">
                          <User size={13} className="text-primary opacity-80" />
                          <span className="text-main">by {note.created_by}</span>
                        </span>
                        <span className="text-border-color">•</span>
                        <span className="flex items-center gap-1.5 opacity-80 decoration-dotted underline-offset-4 hover:underline cursor-help" title={new Date(note.created_at).toLocaleString()}>
                          <Calendar size={13} />
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </span>
                        <span className="text-border-color">•</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] tracking-wide uppercase ${getCategoryColor(note.category)}`}>
                          {note.category}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons appear gracefully on hover of the timeline content */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-surface rounded-lg shadow-sm border border-border-color p-1">
                      <button
                        className="p-1.5 hover:bg-primary-light hover:text-primary rounded-md transition-colors text-muted"
                        onClick={() => handleEditNote(note)}
                        title="Edit log"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="p-1.5 hover:bg-danger-bg hover:text-danger-color rounded-md transition-colors text-muted"
                        onClick={() => handleDeleteNote(note)}
                        title="Delete log"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-main/40 rounded-xl p-4 border border-border-light text-muted text-sm leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="emp-detail__empty h-full w-full py-10 border-0 bg-transparent">
            <div className="bg-main h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-border-color">
              <FileText size={32} className="opacity-30 text-muted" />
            </div>
            <h3 className="text-lg font-bold text-main mb-2">No activity logged</h3>
            <p className="text-muted text-sm mb-6 max-w-sm mx-auto text-center">
              Keep track of performance reviews, general check-ins, or disciplinary notes for this employee.
            </p>
            <button
              className="emp-detail__btn emp-detail__btn--primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              Log First Entry
            </button>
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      <Suspense fallback={null}>
        <AddNoteModal
          isOpen={showAddModal}
          employeeId={employeeId}
          onClose={() => setShowAddModal(false)}
          onNoteAdded={(note) => {
            onNoteAdded(note);
            setShowAddModal(false);
          }}
        />
      </Suspense>

      {/* Edit Note Modal */}
      <Suspense fallback={null}>
        {selectedNote && (
          <EditNoteModal
            isOpen={showEditModal}
            note={selectedNote}
            onClose={() => {
              setShowEditModal(false);
              setSelectedNote(null);
            }}
            onNoteUpdated={(updatedNote) => {
              onNoteUpdated(updatedNote);
              setShowEditModal(false);
              setSelectedNote(null);
            }}
          />
        )}
      </Suspense>

      {/* Delete Confirmation Modal */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Activity Log"
          message={`Are you sure you want to delete "${selectedNote?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedNote(null);
          }}
          isLoading={actionLoading}
          type="danger"
        />
      </Suspense>
    </div>
  );
};

NotesList.propTypes = {
  employeeId: PropTypes.number.isRequired,
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      category: PropTypes.string,
      created_by: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      updated_at: PropTypes.string,
    }),
  ),
  onNoteAdded: PropTypes.func.isRequired,
  onNoteUpdated: PropTypes.func.isRequired,
  onNoteDeleted: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default NotesList;
