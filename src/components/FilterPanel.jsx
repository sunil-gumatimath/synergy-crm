import React, { useState, useMemo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Filter, X, ChevronDown } from "../lib/icons";
import "./filter-panel-styles.css";

const FilterPanel = ({ employees, filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Extract unique values for each filter
  const filterOptions = useMemo(() => {
    const departments = [...new Set(employees.map((e) => e.department))].sort();
    const roles = [...new Set(employees.map((e) => e.role))].sort();
    const statuses = [...new Set(employees.map((e) => e.status))].sort();

    return { departments, roles, statuses };
  }, [employees]);

  const handleFilterChange = (type, value) => {
    onFilterChange({
      ...filters,
      [type]: filters[type] === value ? "" : value,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      department: "",
      role: "",
      status: "",
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="filter-panel-container" ref={panelRef}>
      <button
        className={`filter-toggle-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Filter size={18} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
        <ChevronDown
          size={16}
          className={`chevron ${isOpen ? "rotate" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="filter-panel">
          <div className="filter-panel-header">
            <h3>Filter Employees</h3>
            {activeFilterCount > 0 && (
              <button
                className="filter-clear-btn"
                onClick={clearAllFilters}
                type="button"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          <div className="filter-groups">
            {/* Department Filter */}
            <div className="filter-group">
              <label className="filter-label">Department</label>
              <div className="filter-options">
                {filterOptions.departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    className={`filter-chip ${filters.department === dept ? "active" : ""}`}
                    onClick={() => handleFilterChange("department", dept)}
                  >
                    {dept}
                    {filters.department === dept && <X size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Filter */}
            <div className="filter-group">
              <label className="filter-label">Role</label>
              <div className="filter-options">
                {filterOptions.roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`filter-chip ${filters.role === role ? "active" : ""}`}
                    onClick={() => handleFilterChange("role", role)}
                  >
                    {role}
                    {filters.role === role && <X size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <div className="filter-options">
                {filterOptions.statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`filter-chip status-${status.toLowerCase().replace(/\s+/g, "-")} ${filters.status === status ? "active" : ""}`}
                    onClick={() => handleFilterChange("status", status)}
                  >
                    {status}
                    {filters.status === status && <X size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

FilterPanel.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      department: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    }),
  ).isRequired,
  filters: PropTypes.shape({
    department: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterPanel;
