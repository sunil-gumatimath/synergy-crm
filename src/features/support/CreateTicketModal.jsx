import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Loader2 } from "../../lib/icons";

const CreateTicketModal = ({ isOpen, onClose, onSubmit, isLoading, ticketToEdit = null }) => {
    const [formData, setFormData] = useState({
        title: "",
        category: "IT Support",
        priority: "medium",
        description: "",
    });

    const [errors, setErrors] = useState({});

     
    useEffect(() => {
        if (isOpen) {
            if (ticketToEdit) {
                setFormData({
                    title: ticketToEdit.title || "",
                    category: ticketToEdit.category || "IT Support",
                    priority: ticketToEdit.priority || "medium",
                    description: ticketToEdit.description || "",
                });
            } else {
                setFormData({
                    title: "",
                    category: "IT Support",
                    priority: "medium",
                    description: "",
                });
            }
            setErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, ticketToEdit?.id]);

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
                status: ticketToEdit ? ticketToEdit.status : 'todo',
                due_date: ticketToEdit ? ticketToEdit.due_date : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-lg w-full">
                <div className="modal-header">
                    <h2 className="modal-title">{ticketToEdit ? "Edit Ticket" : "Raise a New Ticket"}</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
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
                        />
                        {errors.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-none border border-blue-100 flex gap-2 items-start mb-4">
                        <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700">
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
            </div>
        </div>
    );
};

export default CreateTicketModal;
