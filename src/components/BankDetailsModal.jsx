import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Landmark, CreditCard, Hash, MapPin, AlertCircle, Save } from "../lib/icons";

const BankDetailsModal = ({
    isOpen,
    employee,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    // Initialize form data based on employee's bank details
    const getInitialFormData = () => ({
        bankName: employee?.bank_details?.bankName || "",
        accountNumber: employee?.bank_details?.accountNumber || "",
        ifscCode: employee?.bank_details?.ifscCode || "",
        branch: employee?.bank_details?.branch || "",
    });

    const [formData, setFormData] = useState(getInitialFormData);
    const [errors, setErrors] = useState({});

    // Reset form data when employee changes (only when modal opens with new employee)
    useEffect(() => {
        if (isOpen && employee) {
            const newData = getInitialFormData();
            setFormData(newData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employee?.id, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.bankName.trim()) {
            newErrors.bankName = "Bank name is required";
        }

        if (!formData.accountNumber.trim()) {
            newErrors.accountNumber = "Account number is required";
        }

        if (!formData.ifscCode.trim()) {
            newErrors.ifscCode = "IFSC code is required";
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
            newErrors.ifscCode = "Invalid IFSC code format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        await onSubmit(employee.id, {
            bank_details: {
                bankName: formData.bankName.trim(),
                accountNumber: formData.accountNumber.trim(),
                ifscCode: formData.ifscCode.toUpperCase().trim(),
                branch: formData.branch.trim(),
            },
        });
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen || !employee) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <Landmark size={20} />
                        </div>
                        <div>
                            <h2 className="modal-title">Bank Details</h2>
                            <p className="modal-subtitle">Update payment information for {employee.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="modal-close-btn"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-grid">
                        {/* Bank Name */}
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="bankName" className="form-label">
                                <Landmark size={14} style={{ marginRight: '6px', opacity: 0.7 }} />
                                Bank Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="bankName"
                                type="text"
                                value={formData.bankName}
                                onChange={(e) => handleChange("bankName", e.target.value)}
                                className={`form-input ${errors.bankName ? "error" : ""}`}
                                placeholder="e.g., State Bank of India"
                                disabled={isLoading}
                            />
                            {errors.bankName && (
                                <p className="form-error">
                                    <AlertCircle size={12} /> {errors.bankName}
                                </p>
                            )}
                        </div>

                        {/* Account Number */}
                        <div className="form-group">
                            <label htmlFor="accountNumber" className="form-label">
                                <CreditCard size={14} style={{ marginRight: '6px', opacity: 0.7 }} />
                                Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="accountNumber"
                                type="text"
                                value={formData.accountNumber}
                                onChange={(e) => handleChange("accountNumber", e.target.value)}
                                className={`form-input ${errors.accountNumber ? "error" : ""}`}
                                placeholder="e.g., 1234567890"
                                disabled={isLoading}
                            />
                            {errors.accountNumber && (
                                <p className="form-error">
                                    <AlertCircle size={12} /> {errors.accountNumber}
                                </p>
                            )}
                        </div>

                        {/* IFSC Code */}
                        <div className="form-group">
                            <label htmlFor="ifscCode" className="form-label">
                                <Hash size={14} style={{ marginRight: '6px', opacity: 0.7 }} />
                                IFSC Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="ifscCode"
                                type="text"
                                value={formData.ifscCode}
                                onChange={(e) => handleChange("ifscCode", e.target.value.toUpperCase())}
                                className={`form-input ${errors.ifscCode ? "error" : ""}`}
                                placeholder="e.g., SBIN0001234"
                                maxLength={11}
                                disabled={isLoading}
                            />
                            {errors.ifscCode && (
                                <p className="form-error">
                                    <AlertCircle size={12} /> {errors.ifscCode}
                                </p>
                            )}
                        </div>

                        {/* Branch */}
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="branch" className="form-label">
                                <MapPin size={14} style={{ marginRight: '6px', opacity: 0.7 }} />
                                Branch Name
                            </label>
                            <input
                                id="branch"
                                type="text"
                                value={formData.branch}
                                onChange={(e) => handleChange("branch", e.target.value)}
                                className="form-input"
                                placeholder="e.g., Bengaluru Main Branch"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="form-notice" style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                    }}>
                        <AlertCircle size={16} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                        <span>Bank details are stored securely and used only for salary processing. Ensure the information is accurate.</span>
                    </div>

                    {/* Actions */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-ghost"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Bank Details
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

BankDetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    employee: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        bank_details: PropTypes.shape({
            bankName: PropTypes.string,
            accountNumber: PropTypes.string,
            ifscCode: PropTypes.string,
            branch: PropTypes.string,
        }),
    }),
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default BankDetailsModal;
