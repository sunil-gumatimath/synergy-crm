import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar, Clock, FileText, AlertCircle } from "../../lib/icons";
import { leaveService } from "../../services/leaveService.js";
import "./leave-styles.css";

const ApplyLeaveModal = ({
    isOpen,
    onClose,
    onSuccess,
    leaveTypes,
    balances,
    employeeId,
}) => {
    const [formData, setFormData] = useState({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
        isHalfDay: false,
        halfDayPeriod: "morning",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    // Derived: business days for the selected range (or 0.5 for half-day).
    const calculatedDays = useMemo(() => {
        if (formData.startDate && formData.endDate && !formData.isHalfDay) {
            return leaveService.calculateBusinessDays(formData.startDate, formData.endDate);
        }
        if (formData.isHalfDay) return 0.5;
        return 0;
    }, [formData.startDate, formData.endDate, formData.isHalfDay]);

    // Derived: remaining balance for the chosen leave type.
    const availableBalance = useMemo(() => {
        if (!formData.leaveTypeId) return null;
        const balance = balances.find(
            (b) => b.leave_type_id === parseInt(formData.leaveTypeId)
        );
        return balance
            ? balance.total_days - balance.used_days - balance.pending_days
            : null;
    }, [formData.leaveTypeId, balances]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };
    const validate = () => {
        const newErrors = {};

        if (!formData.leaveTypeId) {
            newErrors.leaveTypeId = "Please select a leave type";
        }

        if (!formData.startDate) {
            newErrors.startDate = "Start date is required";
        }

        if (!formData.isHalfDay && !formData.endDate) {
            newErrors.endDate = "End date is required";
        }

        if (formData.startDate && formData.endDate && !formData.isHalfDay) {
            if (new Date(formData.endDate) < new Date(formData.startDate)) {
                newErrors.endDate = "End date must be after start date";
            }
        }

        if (new Date(formData.startDate) < new Date().setHours(0, 0, 0, 0)) {
            newErrors.startDate = "Start date cannot be in the past";
        }

        if (availableBalance !== null && calculatedDays > availableBalance) {
            newErrors.leaveTypeId = `Insufficient balance. Available: ${availableBalance} days`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const { data, error } = await leaveService.createLeaveRequest({
                employeeId,
                leaveTypeId: parseInt(formData.leaveTypeId),
                startDate: formData.startDate,
                endDate: formData.isHalfDay ? formData.startDate : formData.endDate,
                reason: formData.reason,
                isHalfDay: formData.isHalfDay,
                halfDayPeriod: formData.isHalfDay ? formData.halfDayPeriod : null,
            });

            if (error) throw error;

            onSuccess(data);
            onClose();
        } catch (error) {
            console.error("Error submitting leave request:", error);
            setErrors({ submit: "Failed to submit leave request. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const today = new Date().toISOString().split("T")[0];

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="modal-overlay" />
                <Dialog.Content className="modal-content apply-leave-modal">
                    {/* Header */}
                    <div className="modal-header">
                        <Dialog.Title asChild>
                            <h2>Apply for Leave</h2>
                        </Dialog.Title>
                        <Dialog.Description className="sr-only">
                            Fill in the leave request form and submit it for approval.
                        </Dialog.Description>
                        <Dialog.Close asChild>
                            <button className="modal-close-btn" aria-label="Close">
                                <X size={20} />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Body */}
                    <form id="apply-leave-form" onSubmit={handleSubmit} className="modal-body">
                        {/* Leave Type */}
                        <div className="form-group">
                            <label htmlFor="leaveTypeId">
                                <FileText size={16} />
                                Leave Type
                            </label>
                            <select
                                id="leaveTypeId"
                                name="leaveTypeId"
                                value={formData.leaveTypeId}
                                onChange={handleChange}
                                className={errors.leaveTypeId ? "error" : ""}
                                aria-invalid={!!errors.leaveTypeId}
                                aria-describedby={errors.leaveTypeId ? "err-leaveTypeId" : undefined}
                            >
                                <option value="">Select leave type</option>
                                {leaveTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            {errors.leaveTypeId && (
                                <span id="err-leaveTypeId" className="error-text">{errors.leaveTypeId}</span>
                            )}
                            {availableBalance !== null && (
                                <span className="balance-info">
                                    Available: <strong>{availableBalance}</strong> days
                                </span>
                            )}
                        </div>

                        {/* Half Day Toggle */}
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isHalfDay"
                                    checked={formData.isHalfDay}
                                    onChange={handleChange}
                                />
                                <span className="checkbox-text">Half Day Leave</span>
                            </label>
                            {formData.isHalfDay && (
                                <div className="half-day-options">
                                    <label className={`half-day-option ${formData.halfDayPeriod === "morning" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="halfDayPeriod"
                                            value="morning"
                                            checked={formData.halfDayPeriod === "morning"}
                                            onChange={handleChange}
                                        />
                                        Morning
                                    </label>
                                    <label className={`half-day-option ${formData.halfDayPeriod === "afternoon" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="halfDayPeriod"
                                            value="afternoon"
                                            checked={formData.halfDayPeriod === "afternoon"}
                                            onChange={handleChange}
                                        />
                                        Afternoon
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Date Fields */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startDate">
                                    <Calendar size={16} />
                                    {formData.isHalfDay ? "Date" : "Start Date"}
                                </label>
                                <input
                                    id="startDate"
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    min={today}
                                    className={errors.startDate ? "error" : ""}
                                    aria-invalid={!!errors.startDate}
                                    aria-describedby={errors.startDate ? "err-startDate" : undefined}
                                />
                                {errors.startDate && (
                                    <span id="err-startDate" className="error-text">{errors.startDate}</span>
                                )}
                            </div>

                            {!formData.isHalfDay && (
                                <div className="form-group">
                                    <label htmlFor="endDate">
                                        <Calendar size={16} />
                                        End Date
                                    </label>
                                    <input
                                        id="endDate"
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        min={formData.startDate || today}
                                        className={errors.endDate ? "error" : ""}
                                        aria-invalid={!!errors.endDate}
                                        aria-describedby={errors.endDate ? "err-endDate" : undefined}
                                    />
                                    {errors.endDate && (
                                        <span id="err-endDate" className="error-text">{errors.endDate}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Days Summary */}
                        {calculatedDays > 0 && (
                            <div className="days-summary">
                                <Clock size={16} />
                                <span>
                                    Total: <strong>{calculatedDays}</strong> day{calculatedDays !== 1 ? "s" : ""}
                                </span>
                            </div>
                        )}

                        {/* Reason */}
                        <div className="form-group">
                            <label htmlFor="reason">
                                <FileText size={16} />
                                Reason (Optional)
                            </label>
                            <textarea
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Provide a reason for your leave request..."
                                rows={3}
                            />
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="submit-error">
                                <AlertCircle size={16} />
                                {errors.submit}
                            </div>
                        )}
                    </form>

                    {/* Footer */}
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="apply-leave-form"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

ApplyLeaveModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    leaveTypes: PropTypes.array.isRequired,
    balances: PropTypes.array.isRequired,
    employeeId: PropTypes.number,
};

export default ApplyLeaveModal;
