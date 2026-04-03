import React, { memo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Edit, Trash } from "../lib/icons";
import Avatar from "./common/Avatar";

/**
 * Optimized Employee Card Component
 * Uses React.memo to prevent unnecessary re-renders
 * Uses Avatar component with initials and gender-based colors
 * Supports multi-select with checkbox
 */
const EmployeeCard = memo(
  ({ employee, onEdit, onDelete, isSelected, onToggleSelect, isAdmin = true }) => {
    const navigate = useNavigate();

    const getStatusClass = (status) => {
      switch (status) {
        case "Active":
          return "active";
        case "On Leave":
          return "leave";
        default:
          return "offline";
      }
    };

    const handleCardClick = (e) => {
      // If clicking checkbox or in selection mode, don't navigate
      if (
        e.target.type === "checkbox" ||
        e.target.closest(".employee-checkbox-wrapper")
      ) {
        return;
      }
      navigate(`/employees/${employee.id}`);
    };

    const handleCheckboxChange = (e) => {
      e.stopPropagation();
      onToggleSelect(employee.id);
    };

    const handleEdit = (e) => {
      e.stopPropagation(); // Prevent card click
      onEdit(employee);
    };

    const handleDelete = (e) => {
      e.stopPropagation(); // Prevent card click
      onDelete(employee);
    };

    return (
      <div
        className="card employee-card employee-card-clickable"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="employee-card-header">
          {onToggleSelect && (
            <div className="employee-checkbox-wrapper">
              <input
                type="checkbox"
                className="employee-checkbox"
                checked={isSelected}
                onChange={handleCheckboxChange}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${employee.name}`}
              />
            </div>
          )}
          <div className="employee-info">
            <Avatar
              name={employee.name}
              gender={employee.gender || 'other'}
              size="lg"
              className="employee-avatar"
            />
            <div className="employee-details">
              <h3>{employee.name}</h3>
              <p>{employee.role}</p>
            </div>
          </div>
          <span
            className={`employee-status-badge ${getStatusClass(employee.status)}`}
          >
            {employee.status}
          </span>
        </div>

        <div className="employee-meta">
          <div className="employee-meta-row">
            <span className="employee-meta-label">Department</span>
            <span className="employee-meta-value">{employee.department}</span>
          </div>
          <div className="employee-meta-row">
            <span className="employee-meta-label">Email</span>
            <span className="employee-meta-value">{employee.email}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="employee-actions">
            <button
              type="button"
              className="employee-action-btn"
              onClick={handleEdit}
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              type="button"
              className="employee-action-btn danger"
              onClick={handleDelete}
            >
              <Trash size={16} />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  },
);

EmployeeCard.displayName = "EmployeeCard";

EmployeeCard.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    gender: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  onToggleSelect: PropTypes.func,
  isAdmin: PropTypes.bool,
};

export default EmployeeCard;
