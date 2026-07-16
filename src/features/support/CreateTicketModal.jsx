import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Save, AlertCircle, Loader2 } from "../../lib/icons";
import "./support-styles.css";

const buildInitialForm = (ticketToEdit) => {
    if (ticketToEdit) {
        return {
            title: ticketToEdit.title || "",
            category: ticketToEdit.category || "IT Support",
            priority: ticketToEdit.priority || "medium",
            status: ticketToEdit.status || "open",
            description: ticketToEdit.description || "",
        };
    }
    return {
        title: "",
        category: "IT Support",
        priority: "medium",
        status: "open",
        description: "",
    };
};

const CreateTicketModal = ({ isOpen, onClose, onSubmit, isLoading, ticketToEdit = null }) => {
    const [formData, setFormData] = useState(() => buildInitialForm(ticketToEdit));
    const [errors, setErrors] = useState({});

    // Re-sync the form whenever the modal is opened or the target ticket changes,
    // so editing a second ticket never shows a previous ticket's stale data.
  /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (isOpen) {
            setFormData(buildInitialForm(ticketToEdit));
            setErrors({});
        }
    }, [isOpen, ticketToEdit]);
  /* eslint-enable react-hooks/set-state-in-effect */

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({
                ...formData,
                type: 'ticket',
                status: formData.status,
            });
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="modal-overlay" />
                <Dialog.Content className="modal-content max-w-lg w-full">
                    <div className="modal-header">
                        <Dialog.Title className="modal-title">{ticketToEdit ? "Edit Ticket" : "Raise a New Ticket"}</Dialog.Title>
                        <Dialog.Description className="sr-only">
                            Provide a subject and description to raise a support ticket.
                        </Dialog.Description>
                        <Dialog.Close asChild>
                            <button className="modal-close-btn" aria-label="Close">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-body">
                        {/* Title */}
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`form-input ${errors.title ? "border-red-500" : ""}`}
                                placeholder="e.g., Laptop screen flickering"
                                aria-invalid={!!errors.title}
                                aria-describedby={errors.title ? "err-title" : undefined}
                            />
                            {errors.title && (
                                <p id="err-title" className="text-red-500 text-xs mt-1">{errors.title}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Category */}
                            <div className="form-group">
                                <label htmlFor="category" className="form-label">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="IT Support">IT Support</option>
                                    <option value="HR Services">HR Services</option>
                                    <option value="Payroll & Finance">Payroll & Finance</option>
                                    <option value="Facilities">Facilities</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div className="form-group">
                                <label htmlFor="priority" className="form-label">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            {/* Status (visible when editing an existing ticket) */}
                            {ticketToEdit && (
                                <div className="form-group">
                                    <label htmlFor="status" className="form-label">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="form-select"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        {/* Description */}
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={`form-textarea ${errors.description ? "border-red-500" : ""}`}
                                placeholder="Please describe your issue in detail..."
                                aria-invalid={!!errors.description}
                                aria-describedby={errors.description ? "err-description" : undefined}
                            />
                            {errors.description && (
                                <p id="err-description" className="text-red-500 text-xs mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div className="support-info-banner">
                            <AlertCircle size={16} />
                            <p>
                                Your ticket will be assigned to the relevant department automatically.
                                Typical response time is 24 hours.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-ghost"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>{ticketToEdit ? "Saving..." : "Submitting..."}</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>{ticketToEdit ? "Save Changes" : "Submit Ticket"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default CreateTicketModal;
