import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Calendar, Clock, FileText, AlertCircle } from "../../lib/icons";
import { leaveService } from "../../services/leaveService.js";

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
    const [calculatedDays, setCalculatedDays] = useState(0);
    const [availableBalance, setAvailableBalance] = useState(null);

    // Calculate days when dates change
    useEffect(() => {
        if (formData.startDate && formData.endDate && !formData.isHalfDay) {
            const days = leaveService.calculateBusinessDays(formData.startDate, formData.endDate);
            setCalculatedDays(days);
        } else if (formData.isHalfDay) {
            setCalculatedDays(0.5);
        } else {
            setCalculatedDays(0);
        }
    }, [formData.startDate, formData.endDate, formData.isHalfDay]);

    // Update available balance when leave type changes
    useEffect(() => {
        if (formData.leaveTypeId) {
            const balance = balances.find(
                (b) => b.leave_type_id === parseInt(formData.leaveTypeId)
            );
            if (balance) {
                setAvailableBalance(
                    balance.total_days - balance.used_days - balance.pending_days
                );
            } else {
                setAvailableBalance(null);
            }
        }
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
        <div className="modal-overlay">
            <div className="modal-content apply-leave-modal">
                {/* Header */}
                <div className="modal-header">
                    <h2>Apply for Leave</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Leave Type */}
                    <div className="form-group">
                        <label>
                            <FileText size={16} />
                            Leave Type
                        </label>
                        <select
                            name="leaveTypeId"
                            value={formData.leaveTypeId}
                            onChange={handleChange}
                            className={errors.leaveTypeId ? "error" : ""}
                        >
                            <option value="">Select leave type</option>
                            {leaveTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {errors.leaveTypeId && (
                            <span className="error-text">{errors.leaveTypeId}</span>
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
                            <label>
                                <Calendar size={16} />
                                {formData.isHalfDay ? "Date" : "Start Date"}
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                min={today}
                                className={errors.startDate ? "error" : ""}
                            />
                            {errors.startDate && (
                                <span className="error-text">{errors.startDate}</span>
                            )}
                        </div>

                        {!formData.isHalfDay && (
                            <div className="form-group">
                                <label>
                                    <Calendar size={16} />
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    min={formData.startDate || today}
                                    className={errors.endDate ? "error" : ""}
                                />
                                {errors.endDate && (
                                    <span className="error-text">{errors.endDate}</span>
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
                        <label>
                            <FileText size={16} />
                            Reason (Optional)
                        </label>
                        <textarea
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
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </div>
        </div>
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
