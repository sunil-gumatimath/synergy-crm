import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isAllowedRole } from "../../utils/roles";

/**
 * ProtectedRoute - Wrapper component that requires authentication
 * Shows children only if user is authenticated, otherwise shows login page
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    // If not authenticated, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && !isAllowedRole(user.role, allowedRoles)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You do not have permission to view this page.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;
