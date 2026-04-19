import React from "react";
import PropTypes from "prop-types";
import { Palette, Sun, Moon, Monitor, Check } from "../../../lib/icons";
import { themes, themeIds } from "../../../themes/themes";
import { useTheme } from "../../../contexts/ThemeContext";

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
 * Mini preview swatch — shows a tiny sidebar + content area mockup
 * using the theme's colors for the current brightness mode
 */
const ThemePreviewSwatch = ({ themeId, mode }) => {
    const themeConfig = themes[themeId];
    if (!themeConfig) return null;

    const preview = themeConfig.preview[mode] || themeConfig.preview.light;

    return (
        <div
            className="settings-color-theme-swatch"
            style={{ backgroundColor: preview.body }}
        >
            {/* Sidebar stripe */}
            <div
                className="settings-color-theme-swatch-sidebar"
                style={{ backgroundColor: preview.sidebar }}
            >
                <div className="settings-color-theme-swatch-dot" style={{ backgroundColor: 'var(--primary, #4f46e5)', opacity: 0.7 }} />
                <div className="settings-color-theme-swatch-line" style={{ backgroundColor: preview.surface, opacity: 0.5 }} />
                <div className="settings-color-theme-swatch-line" style={{ backgroundColor: preview.surface, opacity: 0.3 }} />
            </div>
            {/* Content area */}
            <div className="settings-color-theme-swatch-content">
                <div
                    className="settings-color-theme-swatch-card"
                    style={{ backgroundColor: preview.surface }}
                >
                    <div className="settings-color-theme-swatch-bar" style={{ backgroundColor: 'var(--primary, #4f46e5)', opacity: 0.8 }} />
                    <div className="settings-color-theme-swatch-text" style={{ backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }} />
                    <div className="settings-color-theme-swatch-text short" style={{ backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />
                </div>
            </div>
        </div>
    );
};

ThemePreviewSwatch.propTypes = {
    themeId: PropTypes.string.isRequired,
    mode: PropTypes.oneOf(['light', 'dark']).isRequired,
};

/**
 * Appearance Section Component
 * Handles theme, color theme, and display settings
 */
const AppearanceSection = ({ settings, isSaving, onUpdateSetting }) => {
    const { effectiveTheme } = useTheme();
    const currentMode = effectiveTheme === 'dark' ? 'dark' : 'light';

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
                {/* Theme Selection (Light/Dark/System) */}
                <div className="settings-field">
                    <label className="settings-field-label">Mode</label>
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
                    <span className="settings-field-hint">Switch instantly between a polished light, dark, or system-matched theme.</span>
                </div>

                {/* Color Theme Selection */}
                <div className="settings-field">
                    <label className="settings-field-label">Color Theme</label>
                    <div className="settings-color-theme-grid">
                        {themeIds.map((id) => {
                            const themeConfig = themes[id];
                            const isActive = settings.colorTheme === id;
                            return (
                                <button
                                    key={id}
                                    className={`settings-color-theme-card ${isActive ? "active" : ""}`}
                                    onClick={() => onUpdateSetting("colorTheme", id)}
                                    disabled={isSaving}
                                    title={themeConfig.label}
                                >
                                    <ThemePreviewSwatch themeId={id} mode={currentMode} />
                                    <div className="settings-color-theme-info">
                                        <span className="settings-color-theme-name">{themeConfig.label}</span>
                                        <span className="settings-color-theme-desc">{themeConfig.description}</span>
                                    </div>
                                    {isActive && (
                                        <div className="settings-color-theme-check">
                                            <Check size={12} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <span className="settings-field-hint">Choose a color personality for your workspace — works with both light and dark modes.</span>
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
                    <span className="settings-field-hint">Choose an accent color to personalize highlights, focus states, and actions.</span>
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
        colorTheme: PropTypes.string,
        accentColor: PropTypes.string,
        compactMode: PropTypes.bool,
    }).isRequired,
    isSaving: PropTypes.bool.isRequired,
    onUpdateSetting: PropTypes.func.isRequired,
};

export default AppearanceSection;
