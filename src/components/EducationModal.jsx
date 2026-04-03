import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, GraduationCap, Building, Calendar, Award, Plus, Trash2, AlertCircle, Save } from "../lib/icons";

const EducationModal = ({
    isOpen,
    employee,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const [educationList, setEducationList] = useState([]);
    const [errors, setErrors] = useState({});


    useEffect(() => {
        if (employee?.education && Array.isArray(employee.education)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEducationList(employee.education.map((edu, idx) => ({ ...edu, id: idx })));
        } else {
            setEducationList([]);
        }
    }, [employee?.id, employee?.education]);

    const addEducation = () => {
        setEducationList((prev) => [
            ...prev,
            { id: Date.now(), degree: "", institution: "", year: "", grade: "" },
        ]);
    };

    const removeEducation = (id) => {
        setEducationList((prev) => prev.filter((edu) => edu.id !== id));
    };

    const updateEducation = (id, field, value) => {
        setEducationList((prev) =>
            prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
        );
        // Clear error for this field
        if (errors[`${id}-${field}`]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[`${id}-${field}`];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        educationList.forEach((edu) => {
            if (!edu.degree.trim()) {
                newErrors[`${edu.id}-degree`] = "Degree is required";
            }
            if (!edu.institution.trim()) {
                newErrors[`${edu.id}-institution`] = "Institution is required";
            }
            if (!edu.year.trim()) {
                newErrors[`${edu.id}-year`] = "Year is required";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Remove the temporary id before submitting
        const cleanEducation = educationList.map(({ degree, institution, year, grade }) => ({
            degree: degree.trim(),
            institution: institution.trim(),
            year: year.trim(),
            grade: grade.trim(),
        }));

        try {
            await onSubmit(employee.id, { education: cleanEducation });
            handleClose();
        } catch (error) {
            console.error("Failed to update education:", error);
            // Optional: Set a form error here if needed
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen || !employee) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <h2 className="modal-title">Education History</h2>
                            <p className="modal-subtitle">Manage education records for {employee.name}</p>
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
                    {educationList.length === 0 ? (
                        <div className="education-empty" style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            background: 'var(--surface-secondary)',
                            borderRadius: '12px',
                            border: '2px dashed var(--border-color)'
                        }}>
                            <GraduationCap size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
                            <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No Education Records</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                Click the button below to add education history
                            </p>
                            <button
                                type="button"
                                onClick={addEducation}
                                className="btn btn-primary"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
                            >
                                <Plus size={16} />
                                Add Education
                            </button>
                        </div>
                    ) : (
                        <div className="education-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {educationList.map((edu, index) => (
                                <div
                                    key={edu.id}
                                    className="education-item"
                                    style={{
                                        padding: '20px',
                                        background: 'var(--surface-secondary)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Item Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '16px'
                                    }}>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '12px',
                                                fontWeight: '700'
                                            }}>
                                                {index + 1}
                                            </span>
                                            Education #{index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeEducation(edu.id)}
                                            className="btn-icon-danger"
                                            style={{
                                                padding: '6px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            title="Remove education"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Fields */}
                                    <div className="form-grid" style={{ gap: '12px' }}>
                                        {/* Degree */}
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '12px' }}>
                                                <GraduationCap size={12} style={{ marginRight: '4px', opacity: 0.7 }} />
                                                Degree / Qualification <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                                className={`form-input ${errors[`${edu.id}-degree`] ? "error" : ""}`}
                                                placeholder="e.g., B.Tech in Computer Science"
                                                disabled={isLoading}
                                            />
                                            {errors[`${edu.id}-degree`] && (
                                                <p className="form-error" style={{ fontSize: '11px' }}>
                                                    <AlertCircle size={10} /> {errors[`${edu.id}-degree`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Institution */}
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '12px' }}>
                                                <Building size={12} style={{ marginRight: '4px', opacity: 0.7 }} />
                                                Institution <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                                                className={`form-input ${errors[`${edu.id}-institution`] ? "error" : ""}`}
                                                placeholder="e.g., IIT Delhi"
                                                disabled={isLoading}
                                            />
                                            {errors[`${edu.id}-institution`] && (
                                                <p className="form-error" style={{ fontSize: '11px' }}>
                                                    <AlertCircle size={10} /> {errors[`${edu.id}-institution`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Year */}
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '12px' }}>
                                                <Calendar size={12} style={{ marginRight: '4px', opacity: 0.7 }} />
                                                Year of Completion <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.year}
                                                onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                                                className={`form-input ${errors[`${edu.id}-year`] ? "error" : ""}`}
                                                placeholder="e.g., 2020"
                                                maxLength={4}
                                                disabled={isLoading}
                                            />
                                            {errors[`${edu.id}-year`] && (
                                                <p className="form-error" style={{ fontSize: '11px' }}>
                                                    <AlertCircle size={10} /> {errors[`${edu.id}-year`]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Grade */}
                                        <div className="form-group">
                                            <label className="form-label" style={{ fontSize: '12px' }}>
                                                <Award size={12} style={{ marginRight: '4px', opacity: 0.7 }} />
                                                Grade / Percentage
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.grade}
                                                onChange={(e) => updateEducation(edu.id, "grade", e.target.value)}
                                                className="form-input"
                                                placeholder="e.g., 8.5 CGPA or 85%"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add More Button */}
                            <button
                                type="button"
                                onClick={addEducation}
                                style={{
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '2px dashed var(--border-color)',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease'
                                }}
                                className="add-education-btn"
                            >
                                <Plus size={18} />
                                Add Another Education
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="modal-footer" style={{ marginTop: '24px' }}>
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
                            disabled={isLoading || educationList.length === 0}
                            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Education
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EducationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    employee: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        education: PropTypes.arrayOf(
            PropTypes.shape({
                degree: PropTypes.string,
                institution: PropTypes.string,
                year: PropTypes.string,
                grade: PropTypes.string,
            })
        ),
    }),
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

export default EducationModal;
