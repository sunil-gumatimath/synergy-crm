import React from "react";
import PropTypes from "prop-types";
import { Globe, Clock, Calendar } from "../../../lib/icons";

/**
 * Preferences Section Component
 * Handles language, timezone, and regional settings
 */
const PreferencesSection = ({ settings, isSaving, onUpdateSetting }) => {
    return (
        <div className="settings-panel">
            <div className="settings-panel-header">
                <div className="settings-panel-icon">
                    <Globe size={20} />
                </div>
                <div>
                    <h2 className="settings-panel-title">Preferences</h2>
                    <p className="settings-panel-description">Language, timezone, and regional settings</p>
                </div>
            </div>

            <div className="settings-panel-content">
                <div className="settings-form-row">
                    <div className="settings-field">
                        <label className="settings-field-label">Language</label>
                        <select
                            value={settings.language}
                            onChange={(e) => onUpdateSetting("language", e.target.value)}
                            className="settings-field-select"
                            disabled={isSaving}
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="hi">हिंदी</option>
                        </select>
                    </div>

                    <div className="settings-field">
                        <label className="settings-field-label">Timezone</label>
                        <div className="settings-field-with-icon">
                            <Clock size={18} className="settings-field-icon" />
                            <select
                                value={settings.timezone}
                                onChange={(e) => onUpdateSetting("timezone", e.target.value)}
                                className="settings-field-select with-icon"
                                disabled={isSaving}
                            >
                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                <option value="America/New_York">America/New York (EST)</option>
                                <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                                <option value="Europe/London">Europe/London (GMT)</option>
                                <option value="Europe/Paris">Europe/Paris (CET)</option>
                                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="settings-form-row">
                    <div className="settings-field">
                        <label className="settings-field-label">Date Format</label>
                        <div className="settings-field-with-icon">
                            <Calendar size={18} className="settings-field-icon" />
                            <select
                                value={settings.dateFormat}
                                onChange={(e) => onUpdateSetting("dateFormat", e.target.value)}
                                className="settings-field-select with-icon"
                                disabled={isSaving}
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                            </select>
                        </div>
                    </div>

                    <div className="settings-field">
                        <label className="settings-field-label">Time Format</label>
                        <select
                            value={settings.timeFormat}
                            onChange={(e) => onUpdateSetting("timeFormat", e.target.value)}
                            className="settings-field-select"
                            disabled={isSaving}
                        >
                            <option value="12h">12 Hour (2:30 PM)</option>
                            <option value="24h">24 Hour (14:30)</option>
                        </select>
                    </div>
                </div>

                <div className="settings-field">
                    <label className="settings-field-label">Start of Week</label>
                    <select
                        value={settings.startOfWeek}
                        onChange={(e) => onUpdateSetting("startOfWeek", e.target.value)}
                        className="settings-field-select"
                        style={{ maxWidth: "300px" }}
                        disabled={isSaving}
                    >
                        <option value="sunday">Sunday</option>
                        <option value="monday">Monday</option>
                        <option value="saturday">Saturday</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

PreferencesSection.propTypes = {
    settings: PropTypes.shape({
        language: PropTypes.string,
        timezone: PropTypes.string,
        dateFormat: PropTypes.string,
        timeFormat: PropTypes.string,
        startOfWeek: PropTypes.string,
    }).isRequired,
    isSaving: PropTypes.bool.isRequired,
    onUpdateSetting: PropTypes.func.isRequired,
};

export default PreferencesSection;
