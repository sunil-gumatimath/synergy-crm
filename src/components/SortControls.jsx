import React from "react";
import PropTypes from "prop-types";
import { ArrowUpDown, ArrowUp, ArrowDown } from "../lib/icons";
import "./sort-controls-styles.css";

const SortControls = ({ sortBy, sortOrder, onSortChange }) => {
  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "join_date", label: "Join Date" },
    { value: "department", label: "Department" },
    { value: "role", label: "Role" },
    { value: "status", label: "Status" },
  ];

  const handleSortByChange = (value) => {
    if (sortBy === value) {
      // Toggle sort order if clicking the same field
      onSortChange(value, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Default to ascending for new field
      onSortChange(value, "asc");
    }
  };

  return (
    <div className="sort-controls">
      <label className="sort-label">
        <ArrowUpDown size={16} />
        Sort by:
      </label>
      <div className="sort-options">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`sort-btn ${sortBy === option.value ? "active" : ""}`}
            onClick={() => handleSortByChange(option.value)}
          >
            {option.label}
            {sortBy === option.value && (
              <span className="sort-icon">
                {sortOrder === "asc" ? (
                  <ArrowUp size={14} />
                ) : (
                  <ArrowDown size={14} />
                )}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

SortControls.propTypes = {
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.oneOf(["asc", "desc"]).isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default SortControls;
