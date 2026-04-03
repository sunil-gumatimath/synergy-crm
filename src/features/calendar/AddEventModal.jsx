import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Calendar, Clock, MapPin, Type, Repeat } from "../../lib/icons";
import { format } from "date-fns";
import "./calendar-styles.css";

const AddEventModal = ({ isOpen, onClose, onSave, initialDate, eventToEdit, isLoading }) => {
    const [formData, setFormData] = useState({
        title: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00",
        end_time: "10:00",
        location: "",
        description: "",
        type: "meeting",
        recurrence: "none",
        is_all_day: false
    });

    const [errors, setErrors] = useState({});

     
    useEffect(() => {
        if (eventToEdit) {
            setFormData({
                title: eventToEdit.title || "",
                date: eventToEdit.date ? format(new Date(eventToEdit.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
                time: eventToEdit.time || "09:00",
                end_time: eventToEdit.end_time || eventToEdit.endTime || "10:00",
                location: eventToEdit.location || "",
                description: eventToEdit.description || "",
                type: eventToEdit.type || "meeting",
                recurrence: eventToEdit.recurrence || "none",
                is_all_day: eventToEdit.is_all_day || eventToEdit.isAllDay || false
            });
        } else if (initialDate) {
            setFormData(prev => ({
                ...prev,
                date: format(initialDate, "yyyy-MM-dd"),
                title: "",
                time: "09:00",
                end_time: "10:00",
                location: "",
                description: "",
                type: "meeting",
                recurrence: "none",
                is_all_day: false
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventToEdit?.id, initialDate, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }
        if (!formData.date) {
            newErrors.date = "Date is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const eventData = {
            title: formData.title.trim(),
            date: formData.date,
            time: formData.is_all_day ? "All Day" : formData.time,
            end_time: formData.is_all_day ? null : formData.end_time,
            location: formData.location.trim(),
            description: formData.description.trim(),
            type: formData.type,
            recurrence: formData.recurrence,
            is_all_day: formData.is_all_day
        };

        onSave(eventData);
    };

    if (!isOpen) return null;

    const eventTypes = [
        { value: "meeting", label: "Meeting" },
        { value: "holiday", label: "Holiday" },
        { value: "deadline", label: "Deadline" },
        { value: "personal", label: "Personal" }
    ];

    const recurrenceOptions = [
        { value: "none", label: "Does not repeat" },
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" }
    ];

    return (
        <div className="event-modal-overlay" onClick={onClose}>
            <div className="event-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="event-modal-header">
                    <div className="event-modal-title">
                        <Calendar size={20} />
                        <h2>{eventToEdit ? "Edit Event" : "Add New Event"}</h2>
                    </div>
                    <button type="button" className="event-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="event-modal-body">
                    {/* Title */}
                    <div className="event-form-field">
                        <label>
                            <Type size={14} />
                            <span>Event Title <span className="required">*</span></span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter event title"
                            className={errors.title ? "error" : ""}
                        />
                        {errors.title && <span className="field-error">{errors.title}</span>}
                    </div>

                    {/* Date & Type Row */}
                    <div className="event-form-row">
                        <div className="event-form-field">
                            <label>
                                <Calendar size={14} />
                                <span>Date <span className="required">*</span></span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className={errors.date ? "error" : ""}
                            />
                            {errors.date && <span className="field-error">{errors.date}</span>}
                        </div>

                        <div className="event-form-field">
                            <label>Event Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                {eventTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* All Day Toggle */}
                    <div className="event-form-checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="is_all_day"
                                checked={formData.is_all_day}
                                onChange={handleChange}
                            />
                            <span className="custom-checkbox"></span>
                            <span>All Day Event</span>
                        </label>
                    </div>

                    {/* Time Row - only show if not all day */}
                    {!formData.is_all_day && (
                        <div className="event-form-row">
                            <div className="event-form-field">
                                <label>
                                    <Clock size={14} />
                                    <span>Start Time</span>
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="event-form-field">
                                <label>
                                    <Clock size={14} />
                                    <span>End Time</span>
                                </label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    <div className="event-form-field">
                        <label>
                            <MapPin size={14} />
                            <span>Location</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter location (optional)"
                        />
                    </div>

                    {/* Recurrence */}
                    <div className="event-form-field">
                        <label>
                            <Repeat size={14} />
                            <span>Repeat</span>
                        </label>
                        <select
                            name="recurrence"
                            value={formData.recurrence}
                            onChange={handleChange}
                        >
                            {recurrenceOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="event-form-field">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add event description (optional)"
                            rows={3}
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="event-modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-save"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : eventToEdit ? "Update Event" : "Create Event"}
                    </button>
                </div>
            </div>
        </div>
    );
};

AddEventModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    initialDate: PropTypes.instanceOf(Date),
    eventToEdit: PropTypes.object,
    isLoading: PropTypes.bool
};

export default AddEventModal;
