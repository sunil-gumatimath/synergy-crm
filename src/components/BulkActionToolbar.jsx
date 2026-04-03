import React from "react";
import PropTypes from "prop-types";
import { X, Trash2, CheckCircle, XCircle, Clock } from "../lib/icons";
import "./bulk-action-toolbar-styles.css";

const BulkActionToolbar = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-toolbar">
      <div className="bulk-action-info">
        <div className="bulk-action-count">
          {selectedCount} {selectedCount === 1 ? "employee" : "employees"}{" "}
          selected
        </div>
        <button
          type="button"
          className="bulk-action-clear"
          onClick={onClearSelection}
          title="Clear selection"
        >
          <X size={16} />
          Clear
        </button>
      </div>

      <div className="bulk-action-buttons">
        <div className="bulk-action-group">
          <span className="bulk-action-label">Set Status:</span>
          <button
            type="button"
            className="bulk-action-btn status-active"
            onClick={() => onBulkStatusChange("Active")}
            title="Mark as Active"
          >
            <CheckCircle size={16} />
            Active
          </button>
          <button
            type="button"
            className="bulk-action-btn status-leave"
            onClick={() => onBulkStatusChange("On Leave")}
            title="Mark as On Leave"
          >
            <Clock size={16} />
            On Leave
          </button>
          <button
            type="button"
            className="bulk-action-btn status-offline"
            onClick={() => onBulkStatusChange("Offline")}
            title="Mark as Offline"
          >
            <XCircle size={16} />
            Offline
          </button>
        </div>

        <button
          type="button"
          className="bulk-action-btn danger"
          onClick={onBulkDelete}
          title={`Delete ${selectedCount} ${selectedCount === 1 ? "employee" : "employees"}`}
        >
          <Trash2 size={16} />
          Delete Selected
        </button>
      </div>
    </div>
  );
};

BulkActionToolbar.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  onBulkDelete: PropTypes.func.isRequired,
  onBulkStatusChange: PropTypes.func.isRequired,
};

export default BulkActionToolbar;
