import React, { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import Toast from "../components/common/Toast";

const ToastContext = createContext(null);

/* eslint-disable react-refresh/only-export-components */

/**
 * ToastProvider - Global toast notification provider
 * Centralizes all toast notifications across the application
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Generate unique ID for each toast
    const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Remove a toast by ID
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // Add a new toast
    const showToast = useCallback((type, message, options = {}) => {
        const id = generateId();
        const toast = {
            id,
            type,
            message,
            duration: options.duration || 5000,
            action: options.action || null,
            actionLabel: options.actionLabel || null,
        };

        setToasts((prev) => [...prev, toast]);

        // Auto-remove after duration
        if (toast.duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration);
        }

        return id;
    }, [removeToast]);

    // Convenience methods
    const success = useCallback((message, options) => showToast("success", message, options), [showToast]);
    const error = useCallback((message, options) => showToast("error", message, options), [showToast]);
    const warning = useCallback((message, options) => showToast("warning", message, options), [showToast]);
    const info = useCallback((message, options) => showToast("info", message, options), [showToast]);

    // Clear all toasts
    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    const value = {
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warning,
        info,
        clearAll,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        type={toast.type}
                        message={toast.message}
                        onClose={() => removeToast(toast.id)}
                        action={toast.action}
                        actionLabel={toast.actionLabel}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

ToastProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

/**
 * useToast - Hook to access toast functionality
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
