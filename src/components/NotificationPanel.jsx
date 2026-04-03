import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    X,
    Info,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    ClipboardList,
    Calendar,
    LifeBuoy,
} from "../lib/icons";
import { useNotifications } from "../contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import "./notification-panel-styles.css";

const NotificationPanel = () => {
    const navigate = useNavigate();
    const panelRef = useRef(null);
    const {
        notifications,
        unreadCount,
        loading,
        isOpen,
        togglePanel,
        closePanel,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    } = useNotifications();

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                closePanel();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, closePanel]);

    // Close panel on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape" && isOpen) {
                closePanel();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, closePanel]);

    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircle className="notification-icon success" />;
            case "warning":
                return <AlertTriangle className="notification-icon warning" />;
            case "error":
                return <AlertCircle className="notification-icon error" />;
            case "task":
                return <ClipboardList className="notification-icon task" />;
            case "event":
                return <Calendar className="notification-icon event" />;
            case "ticket":
                return <LifeBuoy className="notification-icon ticket" />;
            default:
                return <Info className="notification-icon info" />;
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            closePanel();
        }
    };

    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        await deleteNotification(notificationId);
    };

    return (
        <div className="notification-container" ref={panelRef}>
            {/* Bell Button */}
            <button
                className="notification-bell-btn"
                onClick={togglePanel}
                aria-label="Toggle notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="notification-panel">
                    {/* Header */}
                    <div className="notification-header">
                        <div className="notification-header-title">
                            <Bell size={18} />
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="unread-count">{unreadCount} new</span>
                            )}
                        </div>
                        <div className="notification-header-actions">
                            {unreadCount > 0 && (
                                <button
                                    className="mark-all-read-btn"
                                    onClick={markAllAsRead}
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={16} />
                                </button>
                            )}
                            <button
                                className="close-panel-btn"
                                onClick={closePanel}
                                title="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="notification-content">
                        {loading ? (
                            <div className="notification-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={48} strokeWidth={1} />
                                <p>No notifications yet</p>
                                <span>You're all caught up!</span>
                            </div>
                        ) : (
                            <div className="notification-list">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${notification.read ? "read" : "unread"
                                            }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="notification-icon-wrapper">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="notification-body">
                                            <div className="notification-title">
                                                {notification.title}
                                            </div>
                                            <div className="notification-message">
                                                {notification.message}
                                            </div>
                                            <div className="notification-time">
                                                {formatDistanceToNow(new Date(notification.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </div>
                                        </div>
                                        <div className="notification-actions">
                                            {!notification.read && (
                                                <button
                                                    className="mark-read-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification.id);
                                                    }}
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button
                                                className="delete-notification-btn"
                                                onClick={(e) => handleDelete(e, notification.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <button className="clear-all-btn" onClick={clearAll}>
                                <Trash2 size={14} />
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
