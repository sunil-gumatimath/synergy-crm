import React from "react";
import PropTypes from "prop-types";

/**
 * Reusable Loading Spinner Component
 * @param {string} size - 'sm', 'md', 'lg' (default: 'md')
 * @param {string} message - Optional loading message
 */
const LoadingSpinner = ({ size = "md", message = "" }) => {
  const sizeClasses = {
    sm: "spinner-sm",
    md: "spinner-md",
    lg: "spinner-lg",
  };

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  message: PropTypes.string,
};

export default LoadingSpinner;
