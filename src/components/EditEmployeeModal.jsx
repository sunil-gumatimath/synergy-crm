import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { X, AlertCircle, Edit2, Phone, IndianRupee, Shield, Lock } from "../lib/icons";
import Avatar from "./common/Avatar";
import { useAuth } from "../contexts/AuthContext";
import { isAdminRole } from "../utils/roles";
import * as Dialog from "@radix-ui/react-dialog";

const ROLES = ["Admin", "Manager", "Employee"];

const EditEmployeeModal = ({
  isOpen,
  employee,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { user: currentUser } = useAuth();
  const isAdmin = isAdminRole(currentUser?.role);
  // Initialize form data based on employee prop
  const initialFormData = useMemo(() => {
    if (employee) {
      return {
        name: employee.name || "",
        email: employee.email || "",
        role: employee.role || "",
        department: employee.department || "",
        gender: employee.gender || "other",
        status: employee.status || "Active",
        joinDate: employee.join_date || employee.joinDate || "",
        phone: employee.phone || "",
        address: employee.address || "",
        location: employee.location || "",
        salary: employee.salary || "",
        manager: employee.manager || "",
        employment_type: employee.employment_type || "Full-time",
      };
    }
    return {
      name: "",
      email: "",
      role: "",
      department: "",
      gender: "other",
      status: "Active",
      joinDate: "",
      phone: "",
      address: "",
      location: "",
      salary: "",
      manager: "",
      employment_type: "Full-time",
    };
  }, [employee]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Reset form when employee changes

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        role: employee.role || "",
        department: employee.department || "",
        gender: employee.gender || "other",
        status: employee.status || "Active",
        joinDate: employee.join_date || employee.joinDate || "",
        phone: employee.phone || "",
        address: employee.address || "",
        location: employee.location || "",
        salary: employee.salary || "",
        manager: employee.manager || "",
        employment_type: employee.employment_type || "Full-time",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee?.id]);

  const departments = [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Sales",
    "Human Resources",
    "IT",
    "Data",
    "Finance",
    "Operations",
  ];

  const statuses = ["Active", "On Leave", "Inactive"];
  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Prefer not to say" }
  ];
  const employmentTypes = ["Full-time", "Part-time", "Contract", "Intern", "Freelance"];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = { ...formData };

    // Avoid overwriting optional fields with empty strings
    if (!String(payload.role || "").trim()) delete payload.role;
    if (!String(payload.department || "").trim()) delete payload.department;
    if (!String(payload.manager || "").trim()) payload.manager = null;
    if (!String(payload.location || "").trim()) payload.location = null;
    if (!String(payload.address || "").trim()) payload.address = null;
    if (!String(payload.phone || "").trim()) payload.phone = null;

    await onSubmit(employee.id, payload);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal-content modal-content--large"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="flex items-center gap-3">
              <div className="modal-icon">
                <Edit2 size={20} />
              </div>
              <div>
                <Dialog.Title className="modal-title">Edit Employee</Dialog.Title>
                <Dialog.Description className="modal-subtitle">Update employee information</Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="modal-close-btn"
                disabled={isLoading}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="modal-body">
            {/* Avatar Preview */}
            <div className="avatar-preview-section">
              <Avatar
                name={formData.name || "Employee"}
                gender={formData.gender}
                size="xl"
              />
              <p className="avatar-preview-hint">Avatar updates with name and gender</p>
            </div>

            <div className="form-grid">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="edit-name" className="form-label">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`form-input ${errors.name ? "error" : ""}`}
                  placeholder="Enter full name"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="form-error">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="edit-email" className="form-label">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="email@company.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="form-error">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Role — Admin Only Dropdown */}
              <div className="form-group">
                <label htmlFor="edit-role" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={13} style={{ color: isAdmin ? '#6366f1' : 'var(--text-muted)' }} />
                  Role <span className="text-red-500">*</span>
                  {isAdmin ? (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      background: 'rgba(99,102,241,0.12)',
                      color: '#6366f1',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>Admin Only</span>
                  ) : (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '10px',
                      fontWeight: '600',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      background: 'var(--bg-body)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}><Lock size={9} /> Read Only</span>
                  )}
                </label>
                <select
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className={`form-select ${errors.role ? "error" : ""}`}
                  disabled={isLoading || !isAdmin}
                  style={isAdmin ? {
                    borderColor: 'rgba(99,102,241,0.4)',
                    boxShadow: '0 0 0 1px rgba(99,102,241,0.15)'
                  } : {
                    opacity: 0.7,
                    cursor: 'not-allowed'
                  }}
                  title={!isAdmin ? 'Only Admins can change roles' : 'Select access role'}
                >
                  <option value="">Select role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {!isAdmin && (
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={10} /> Only Admins can change the access role.
                  </p>
                )}
                {errors.role && (
                  <p className="form-error">
                    <AlertCircle size={12} /> {errors.role}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="form-group">
                <label htmlFor="edit-department" className="form-label">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className={`form-select ${errors.department ? "error" : ""}`}
                  disabled={isLoading}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="form-error">
                    <AlertCircle size={12} /> {errors.department}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="form-group">
                <label htmlFor="edit-gender" className="form-label">
                  Gender
                </label>
                <select
                  id="edit-gender"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="form-select"
                  disabled={isLoading}
                >
                  {genders.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label htmlFor="edit-status" className="form-label">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="form-select"
                  disabled={isLoading}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Join Date */}
              <div className="form-group">
                <label htmlFor="edit-joinDate" className="form-label">
                  Join Date
                </label>
                <input
                  id="edit-joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleChange("joinDate", e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              {/* Employment Type */}
              <div className="form-group">
                <label htmlFor="edit-employment_type" className="form-label">
                  Employment Type
                </label>
                <select
                  id="edit-employment_type"
                  value={formData.employment_type}
                  onChange={(e) => handleChange("employment_type", e.target.value)}
                  className="form-select"
                  disabled={isLoading}
                >
                  {employmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section Divider - Contact */}
            <div style={{
              margin: '20px 0 12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Phone size={14} style={{ color: 'var(--primary)' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Contact & Location
              </span>
            </div>

            <div className="form-grid">
              {/* Phone */}
              <div className="form-group">
                <label htmlFor="edit-phone" className="form-label">
                  Phone Number
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="form-input"
                  placeholder="+91 98765 43210"
                  disabled={isLoading}
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label htmlFor="edit-location" className="form-label">
                  Work Location
                </label>
                <input
                  id="edit-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="form-input"
                  placeholder="e.g., Bengaluru, Karnataka"
                  disabled={isLoading}
                />
              </div>

              {/* Address */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="edit-address" className="form-label">
                  Full Address
                </label>
                <input
                  id="edit-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="form-input"
                  placeholder="Enter full address"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Section Divider - Compensation */}
            <div style={{
              margin: '20px 0 12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <IndianRupee size={14} style={{ color: 'var(--primary)' }} />
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Compensation & Management
              </span>
            </div>

            <div className="form-grid">
              {/* Salary */}
              <div className="form-group">
                <label htmlFor="edit-salary" className="form-label">
                  Annual Salary (₹)
                </label>
                <input
                  id="edit-salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  className="form-input"
                  placeholder="e.g., 1200000"
                  disabled={isLoading}
                  min="0"
                />
              </div>

              {/* Manager */}
              <div className="form-group">
                <label htmlFor="edit-manager" className="form-label">
                  Reporting Manager
                </label>
                <input
                  id="edit-manager"
                  type="text"
                  value={formData.manager}
                  onChange={(e) => handleChange("manager", e.target.value)}
                  className="form-input"
                  placeholder="Enter manager name"
                  disabled={isLoading}
                />
              </div>
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
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  "Update Employee"
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

EditEmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  employee: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    department: PropTypes.string,
    gender: PropTypes.string,
    status: PropTypes.string,
    join_date: PropTypes.string,
    joinDate: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default EditEmployeeModal;
