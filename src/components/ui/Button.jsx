import React from "react";
import PropTypes from "prop-types";

const Button = ({ children, variant = "primary", onClick, className = "" }) => {
  return (
    <button className={`btn btn-${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "ghost"]),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;
