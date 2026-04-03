import React from "react";
import PropTypes from "prop-types";
import { Palette, Sun, Moon, Monitor, Check } from "../../../lib/icons";

// Theme options
const themeOptions = [
    { id: "light", label: "Light", icon: Sun, description: "Bright and clean" },
    { id: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
    { id: "system", label: "System", icon: Monitor, description: "Match device settings" },
];

// Accent color options
const accentColors = [
    { id: "indigo", color: "#4f46e5", label: "Indigo" },
    { id: "blue", color: "#2563eb", label: "Blue" },
    { id: "violet", color: "#7c3aed", label: "Violet" },
    { id: "rose", color: "#e11d48", label: "Rose" },
    { id: "emerald", color: "#059669", label: "Emerald" },
    { id: "amber", color: "#d97706", label: "Amber" },
];

/**
 * Appearance Section Component
 * Handles theme and display settings
 */
const AppearanceSection = ({ settings, isSaving, onUpdateSetting }) => {
    return (
        <div className="settings-panel">
            <div className="settings-panel-header">
                <div className="settings-panel-icon">
                    <Palette size={20} />
                </div>
                <div>
                    <h2 className="settings-panel-title">Appearance</h2>
                    <p className="settings-panel-description">Customize how Synergy looks on your device</p>
                </div>
            </div>

            <div className="settings-panel-content">
                {/* Theme Selection */}
                <div className="settings-field">
                    <label className="settings-field-label">Theme</label>
                    <div className="settings-theme-grid">
                        {themeOptions.map((theme) => {
                            const Icon = theme.icon;
                            return (
                                <button
                                    key={theme.id}
                                    className={`settings-theme-option ${settings.theme === theme.id ? "active" : ""}`}
                                    onClick={() => onUpdateSetting("theme", theme.id)}
                                    disabled={isSaving}
                                >
                                    <div className="settings-theme-icon">
                                        <Icon size={24} />
                                    </div>
                                    <span className="settings-theme-label">{theme.label}</span>
                                    <span className="settings-theme-description">{theme.description}</span>
                                    {settings.theme === theme.id && (
                                        <div className="settings-theme-check">
                                            <Check size={14} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <span className="settings-field-hint">Theme switching is coming soon!</span>
                </div>

                {/* Accent Color */}
                <div className="settings-field">
                    <label className="settings-field-label">Accent Color</label>
                    <div className="settings-color-grid">
                        {accentColors.map((color) => (
                            <button
                                key={color.id}
                                className={`settings-color-option ${settings.accentColor === color.id ? "active" : ""}`}
                                style={{ "--color": color.color }}
                                onClick={() => onUpdateSetting("accentColor", color.id)}
                                disabled={isSaving}
                                title={color.label}
                            >
                                {settings.accentColor === color.id && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                    <span className="settings-field-hint">Accent color customization is coming soon!</span>
                </div>

                {/* Compact Mode Toggle */}
                <div className="settings-toggle-item">
                    <div className="settings-toggle-info">
                        <span className="settings-toggle-label">Compact Mode</span>
                        <span className="settings-toggle-description">Reduce spacing and use smaller elements</span>
                    </div>
                    <label className="settings-switch">
                        <input
                            type="checkbox"
                            checked={settings.compactMode}
                            onChange={(e) => onUpdateSetting("compactMode", e.target.checked)}
                            disabled={isSaving}
                        />
                        <span className="settings-switch-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    );
};

AppearanceSection.propTypes = {
    settings: PropTypes.shape({
        theme: PropTypes.string,
        accentColor: PropTypes.string,
        compactMode: PropTypes.bool,
    }).isRequired,
    isSaving: PropTypes.bool.isRequired,
    onUpdateSetting: PropTypes.func.isRequired,
};

export default AppearanceSection;
