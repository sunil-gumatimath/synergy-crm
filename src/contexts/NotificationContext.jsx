import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { notificationService } from "../services/notificationService.js";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    loading: true,
    isOpen: false,
    fetchNotifications: () => { },
    markAsRead: () => { },
    markAllAsRead: () => { },
    deleteNotification: () => { },
    clearAll: () => { },
    togglePanel: () => { },
    closePanel: () => { },
    requestPermission: () => { },
});

/* eslint-disable react-refresh/only-export-components */

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        const { data, error } = await notificationService.getNotifications({ userId: user.id });
        if (!error) {
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.read).length);
        }
        setLoading(false);
    }, [user?.id]);

    // Initial fetch

    useEffect(() => {
        if (user?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchNotifications();
        } else {

            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
        }
    }, [user?.id, fetchNotifications]);

    // Real-time subscription
    useEffect(() => {
        if (!user?.id) return;

        const subscription = notificationService.subscribeToNotifications(
            user.id,
            (newNotification) => {
                setNotifications((prev) => [newNotification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                // Show browser notification if permission granted
                if (Notification.permission === "granted") {
                    new Notification(newNotification.title, {
                        body: newNotification.message,
                        icon: "/logo.svg",
                    });
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [user?.id]);

    // Mark single notification as read
    const markAsRead = useCallback(async (notificationId) => {
        const { error } = await notificationService.markAsRead(notificationId);
        if (!error) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        const { error } = await notificationService.markAllAsRead();
        if (!error) {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        }
    }, []);

    // Delete a notification
    const deleteNotification = useCallback(async (notificationId) => {
        const notification = notifications.find((n) => n.id === notificationId);
        const { error } = await notificationService.deleteNotification(notificationId);
        if (!error) {
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            if (notification && !notification.read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        }
    }, [notifications]);

    // Clear all notifications
    const clearAll = useCallback(async () => {
        const { error } = await notificationService.clearAll();
        if (!error) {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, []);

    // Toggle notification panel
    const togglePanel = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    // Close notification panel
    const closePanel = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Request browser notification permission
    const requestPermission = useCallback(async () => {
        if ("Notification" in window && Notification.permission === "default") {
            await Notification.requestPermission();
        }
    }, []);

    const value = {
        notifications,
        unreadCount,
        loading,
        isOpen,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        togglePanel,
        closePanel,
        requestPermission,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
