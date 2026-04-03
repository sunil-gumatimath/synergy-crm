import React from "react";
import PropTypes from "prop-types";
import { Bell } from "../../../lib/icons";

// Notification type configuration
const notificationTypes = [
    { key: "taskReminders", label: "Task Reminders", desc: "Alerts for upcoming and overdue tasks" },
    { key: "leaveUpdates", label: "Leave Updates", desc: "Status changes on leave requests" },
    { key: "mentionNotifications", label: "Mentions", desc: "When someone mentions you" },
    { key: "systemAnnouncements", label: "System Announcements", desc: "Important updates and maintenance" },
    { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary of your week's activities" },
];

/**
 * Notifications Section Component
 * Handles notification preferences settings
 */
const NotificationsSection = ({ settings, isSaving, onUpdateSetting }) => {
    return (
        <div className="settings-panel">
            <div className="settings-panel-header">
                <div className="settings-panel-icon">
                    <Bell size={20} />
                </div>
                <div>
                    <h2 className="settings-panel-title">Notifications</h2>
                    <p className="settings-panel-description">Choose what updates you want to receive</p>
                </div>
            </div>

            <div className="settings-panel-content">
                <div className="settings-notification-group">
                    <h3 className="settings-group-title">Delivery Methods</h3>

                    <div className="settings-toggle-item">
                        <div className="settings-toggle-info">
                            <span className="settings-toggle-label">Email Notifications</span>
                            <span className="settings-toggle-description">Receive updates via email</span>
                        </div>
                        <label className="settings-switch">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => onUpdateSetting("emailNotifications", e.target.checked)}
                                disabled={isSaving}
                            />
                            <span className="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div className="settings-toggle-item">
                        <div className="settings-toggle-info">
                            <span className="settings-toggle-label">Push Notifications</span>
                            <span className="settings-toggle-description">Browser and desktop alerts</span>
                        </div>
                        <label className="settings-switch">
                            <input
                                type="checkbox"
                                checked={settings.pushNotifications}
                                onChange={(e) => onUpdateSetting("pushNotifications", e.target.checked)}
                                disabled={isSaving}
                            />
                            <span className="settings-switch-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="settings-notification-group">
                    <h3 className="settings-group-title">Notification Types</h3>

                    {notificationTypes.map(({ key, label, desc }) => (
                        <div key={key} className="settings-toggle-item">
                            <div className="settings-toggle-info">
                                <span className="settings-toggle-label">{label}</span>
                                <span className="settings-toggle-description">{desc}</span>
                            </div>
                            <label className="settings-switch">
                                <input
                                    type="checkbox"
                                    checked={settings[key]}
                                    onChange={(e) => onUpdateSetting(key, e.target.checked)}
                                    disabled={isSaving}
                                />
                                <span className="settings-switch-slider"></span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

NotificationsSection.propTypes = {
    settings: PropTypes.shape({
        emailNotifications: PropTypes.bool,
        pushNotifications: PropTypes.bool,
        taskReminders: PropTypes.bool,
        leaveUpdates: PropTypes.bool,
        mentionNotifications: PropTypes.bool,
        systemAnnouncements: PropTypes.bool,
        weeklyDigest: PropTypes.bool,
    }).isRequired,
    isSaving: PropTypes.bool.isRequired,
    onUpdateSetting: PropTypes.func.isRequired,
};

export default NotificationsSection;
