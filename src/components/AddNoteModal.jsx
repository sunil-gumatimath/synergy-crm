import React, { useState } from "react";
import PropTypes from "prop-types";
import { X, AlertCircle } from "../lib/icons";
import noteService from "../services/noteService";

const CATEGORIES = [
  { value: "general", label: "General", icon: "📝" },
  { value: "performance", label: "Performance", icon: "📊" },
  { value: "meeting", label: "Meeting", icon: "💼" },
  { value: "praise", label: "Praise", icon: "⭐" },
  { value: "disciplinary", label: "Disciplinary", icon: "⚠️" },
  { value: "other", label: "Other", icon: "📄" },
];

const AddNoteModal = ({ isOpen, employeeId, onClose, onNoteAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    is_private: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length > 5000) {
      newErrors.content = "Content must be less than 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const { data, error } = await noteService.create({
      employee_id: employeeId,
      ...formData,
    });

    setIsSubmitting(false);

    if (error) {
      setErrors({
        submit: error.message || "Failed to add note. Please try again.",
      });
    } else {
      onNoteAdded(data);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      content: "",
      category: "general",
      is_private: false,
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Note</h2>
          <button className="modal-close-btn" onClick={handleClose}>
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

            {/* Title */}
            <div className="form-group">
              <label htmlFor="note-title" className="form-label required">
                Title
              </label>
              <input
                id="note-title"
                type="text"
                className={`form-input ${errors.title ? "error" : ""}`}
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter note title"
                maxLength={200}
                disabled={isSubmitting}
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
              <span className="text-xs text-muted mt-1">
                {formData.title.length}/200 characters
              </span>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="note-category" className="form-label">
                Category
              </label>
              <select
                id="note-category"
                className="form-input"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                disabled={isSubmitting}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="form-group">
              <label htmlFor="note-content" className="form-label required">
                Content
              </label>
              <textarea
                id="note-content"
                className={`form-input ${errors.content ? "error" : ""}`}
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Enter note content..."
                rows={8}
                maxLength={5000}
                disabled={isSubmitting}
              />
              {errors.content && (
                <span className="error-message">{errors.content}</span>
              )}
              <span className="text-xs text-muted mt-1">
                {formData.content.length}/5000 characters
              </span>
            </div>

            {/* Private Note Checkbox */}
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_private}
                  onChange={(e) => handleChange("is_private", e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 rounded border-border-color"
                />
                <span className="text-sm text-main">
                  Mark as private (only visible to managers)
                </span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddNoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  employeeId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onNoteAdded: PropTypes.func.isRequired,
};

export default AddNoteModal;
