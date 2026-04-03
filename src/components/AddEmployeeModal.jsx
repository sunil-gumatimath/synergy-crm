import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { X, AlertCircle, User, Shield, Eye, EyeOff, RefreshCw, Copy, Check } from "../lib/icons";
import Avatar from "./common/Avatar";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const ROLES = ["Admin", "Manager", "Employee"];

/**
 * Generate a random, secure password
 * Format: 3 uppercase + 3 lowercase + 3 digits + 3 special = 12 chars, shuffled
 */
function generatePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const pick = (src, n) =>
    Array.from({ length: n }, () => src[Math.floor(Math.random() * src.length)]).join("");
  const raw = pick(upper, 3) + pick(lower, 3) + pick(digits, 3) + pick(special, 1);
  return raw
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  department: z.string().min(1, "Department is required"),
  status: z.string().default("Active"),
  gender: z.string().default("other"),
  joinDate: z.string().default(() => new Date().toISOString().split("T")[0]),
});

const AddEmployeeModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: generatePassword(),
      role: "",
      department: "",
      gender: "other",
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
    },
  });

  const watchName = watch("name");
  const watchGender = watch("gender");
  const watchPassword = watch("password");

  const departments = [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Sales",
    "HR",
    "IT",
    "Data",
  ];

  const statuses = ["Active", "On Leave", "Offline"];
  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Prefer not to say" },
  ];

  const handleGeneratePassword = useCallback(() => {
    setValue("password", generatePassword());
    setCopied(false);
  }, [setValue]);

  const handleCopyPassword = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(watchPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const textarea = document.createElement("textarea");
      textarea.value = watchPassword;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [watchPassword]);

  const submitForm = async (data) => {
    await onSubmit(data);
  };

  const handleClose = () => {
    reset({
      name: "",
      email: "",
      password: generatePassword(),
      role: "",
      department: "",
      gender: "other",
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
    });
    setCopied(false);
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal-content"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="flex items-center gap-3">
              <div className="modal-icon">
                <User size={20} />
              </div>
              <div>
                <Dialog.Title className="modal-title">Add New Employee</Dialog.Title>
                <Dialog.Description className="modal-subtitle">
                  Fill in the details to add a new team member
                </Dialog.Description>
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
          <form onSubmit={handleSubmit(submitForm)} className="modal-body">
            {/* Avatar Preview */}
            <div className="avatar-preview-section">
              <Avatar
                name={watchName || "New Employee"}
                gender={watchGender}
                size="xl"
              />
              <p className="avatar-preview-hint">Avatar preview based on name and gender</p>
            </div>

            <div className="form-grid">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`form-input ${errors.name ? "error" : ""}`}
                  placeholder="Enter full name"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="form-error">
                    <AlertCircle size={12} /> {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="email@company.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="form-error">
                    <AlertCircle size={12} /> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password — full-width row */}
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="password" className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Shield size={13} style={{ color: "#6366f1" }} />
                  Initial Password <span className="text-red-500">*</span>
                </label>
                <div style={{ position: "relative", display: "flex", gap: 6 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      className={`form-input ${errors.password ? "error" : ""}`}
                      placeholder="Min 6 characters"
                      disabled={isLoading}
                      style={{ paddingRight: "2.5rem", fontFamily: showPassword ? "monospace" : undefined }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: 2,
                        display: "flex",
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Generate */}
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="btn btn-ghost btn-sm"
                    title="Generate random password"
                    disabled={isLoading}
                    style={{ minWidth: 36, padding: "0 8px" }}
                  >
                    <RefreshCw size={15} />
                  </button>

                  {/* Copy */}
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="btn btn-ghost btn-sm"
                    title={copied ? "Copied!" : "Copy password"}
                    disabled={isLoading}
                    style={{ minWidth: 36, padding: "0 8px", color: copied ? "var(--success-color)" : undefined }}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">
                    <AlertCircle size={12} /> {errors.password.message}
                  </p>
                )}
                <p className="form-hint" style={{ fontSize: "0.75rem", color: "var(--text-light)", marginTop: 4 }}>
                  Share this password with the employee. They can change it after first login.
                </p>
              </div>

              {/* Role */}
              <div className="form-group">
                <label htmlFor="role" className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={13} style={{ color: "#6366f1" }} />
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  {...register("role")}
                  className={`form-select ${errors.role ? "error" : ""}`}
                  disabled={isLoading}
                  style={{ borderColor: "rgba(99,102,241,0.4)", boxShadow: "0 0 0 1px rgba(99,102,241,0.15)" }}
                >
                  <option value="">Select role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.role && (
                  <p className="form-error">
                    <AlertCircle size={12} /> {errors.role.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="form-group">
                <label htmlFor="department" className="form-label">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  {...register("department")}
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
                    <AlertCircle size={12} /> {errors.department.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  {...register("status")}
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

              {/* Gender */}
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  id="gender"
                  {...register("gender")}
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

              {/* Join Date */}
              <div className="form-group">
                <label htmlFor="joinDate" className="form-label">
                  Join Date
                </label>
                <input
                  id="joinDate"
                  type="date"
                  {...register("joinDate")}
                  className="form-input"
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
                    Adding...
                  </>
                ) : (
                  "Add Employee"
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

AddEmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default AddEmployeeModal;
