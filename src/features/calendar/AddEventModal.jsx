import React, { useState } from "react";
import PropTypes from "prop-types";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar, Clock, MapPin, Type, Repeat } from "../../lib/icons";
import { format } from "date-fns";
import "./calendar-styles.css";

const AddEventModal = ({ isOpen, onClose, onSave, initialDate, eventToEdit, isLoading }) => {
    const [formData, setFormData] = useState(() => {
        const base = {
            title: "",
            date: format(new Date(), "yyyy-MM-dd"),
            time: "09:00",
            end_time: "10:00",
            location: "",
            description: "",
            type: "meeting",
            recurrence: "none",
            is_all_day: false
        };
        if (eventToEdit) {
            return {
                title: eventToEdit.title || "",
                date: eventToEdit.date ? format(new Date(eventToEdit.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
                time: eventToEdit.time || "09:00",
                end_time: eventToEdit.end_time || eventToEdit.endTime || "10:00",
                location: eventToEdit.location || "",
                description: eventToEdit.description || "",
                type: eventToEdit.type || "meeting",
                recurrence: eventToEdit.recurrence || "none",
                is_all_day: eventToEdit.is_all_day || eventToEdit.isAllDay || false
            };
        }
        if (initialDate) {
            return { ...base, date: format(initialDate, "yyyy-MM-dd") };
        }
        return base;
    });

    const [errors, setErrors] = useState({});

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
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="event-modal-overlay" />
                <Dialog.Content className="event-modal-container">
                    {/* Header */}
                    <div className="event-modal-header">
                        <div className="event-modal-title">
                            <Calendar size={20} />
                            <Dialog.Title asChild>
                                <h2>{eventToEdit ? "Edit Event" : "Add New Event"}</h2>
                            </Dialog.Title>
                        </div>
                        <Dialog.Description className="sr-only">
                            Fill in the event details and save the event.
                        </Dialog.Description>
                        <Dialog.Close asChild>
                            <button type="button" className="event-modal-close" aria-label="Close">
                                <X size={18} />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Form */}
                    <form id="event-form" onSubmit={handleSubmit} className="event-modal-body">
                        {/* Title */}
                        <div className="event-form-field">
                            <label htmlFor="title">
                                <Type size={14} />
                                <span>Event Title <span className="required">*</span></span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter event title"
                                className={errors.title ? "error" : ""}
                                aria-invalid={!!errors.title}
                                aria-describedby={errors.title ? "err-title" : undefined}
                            />
                            {errors.title && <span id="err-title" className="field-error">{errors.title}</span>}
                        </div>

                        {/* Date & Type Row */}
                        <div className="event-form-row">
                            <div className="event-form-field">
                                <label htmlFor="date">
                                    <Calendar size={14} />
                                    <span>Date <span className="required">*</span></span>
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={errors.date ? "error" : ""}
                                    aria-invalid={!!errors.date}
                                    aria-describedby={errors.date ? "err-date" : undefined}
                                />
                                {errors.date && <span id="err-date" className="field-error">{errors.date}</span>}
                            </div>

                            <div className="event-form-field">
                                <label htmlFor="type">Event Type</label>
                                <select
                                    id="type"
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
                                    <label htmlFor="time">
                                        <Clock size={14} />
                                        <span>Start Time</span>
                                    </label>
                                    <input
                                        id="time"
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="event-form-field">
                                    <label htmlFor="end_time">
                                        <Clock size={14} />
                                        <span>End Time</span>
                                    </label>
                                    <input
                                        id="end_time"
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
                            <label htmlFor="location">
                                <MapPin size={14} />
                                <span>Location</span>
                            </label>
                            <input
                                id="location"
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter location (optional)"
                            />
                        </div>

                        {/* Recurrence */}
                        <div className="event-form-field">
                            <label htmlFor="recurrence">
                                <Repeat size={14} />
                                <span>Repeat</span>
                            </label>
                            <select
                                id="recurrence"
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
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
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
                            form="event-form"
                            className="btn-save"
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : eventToEdit ? "Update Event" : "Create Event"}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
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
