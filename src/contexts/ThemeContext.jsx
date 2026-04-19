import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { setEncryptedItem, getEncryptedItem } from "../utils/storageUtils";
import { themes, THEME_VARIABLES } from "../themes/themes";

const ThemeContext = createContext({});

/* eslint-disable react-refresh/only-export-components */

/**
 * ThemeProvider - Provides theme management across the application
 * Handles light/dark/system theme modes, color themes, and accent colors
 */
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("system");
    const [colorTheme, setColorTheme] = useState("default");
    const [accentColor, setAccentColor] = useState("indigo");
    const [compactMode, setCompactMode] = useState(false);
    const [effectiveTheme, setEffectiveTheme] = useState("light");

    // Accent color definitions
    const accentColors = {
        indigo: { primary: "#4f46e5", hover: "#4338ca", light: "rgba(79, 70, 229, 0.14)", rgb: "79, 70, 229" },
        blue: { primary: "#2563eb", hover: "#1d4ed8", light: "rgba(37, 99, 235, 0.14)", rgb: "37, 99, 235" },
        violet: { primary: "#7c3aed", hover: "#6d28d9", light: "rgba(124, 58, 237, 0.14)", rgb: "124, 58, 237" },
        rose: { primary: "#e11d48", hover: "#be123c", light: "rgba(225, 29, 72, 0.14)", rgb: "225, 29, 72" },
        emerald: { primary: "#059669", hover: "#047857", light: "rgba(5, 150, 105, 0.14)", rgb: "5, 150, 105" },
        amber: { primary: "#d97706", hover: "#b45309", light: "rgba(217, 119, 6, 0.14)", rgb: "217, 119, 6" },
    };

    // Load saved preferences on mount

    useEffect(() => {
        const savedTheme = getEncryptedItem("synergy_theme") || "system";
        const savedColorTheme = getEncryptedItem("synergy_color_theme") || "default";
        const savedAccent = getEncryptedItem("synergy_accent_color") || "indigo";
        const savedCompact = getEncryptedItem("synergy_compact_mode") === "true";

        setTheme(savedTheme);
        setColorTheme(savedColorTheme);
        setAccentColor(savedAccent);
        setCompactMode(savedCompact);
    }, []);

    // Determine effective theme based on system preference
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const updateEffectiveTheme = () => {
            if (theme === "system") {
                setEffectiveTheme(mediaQuery.matches ? "dark" : "light");
            } else {
                setEffectiveTheme(theme);
            }
        };

        updateEffectiveTheme();

        // Listen for system theme changes
        const handleChange = () => {
            if (theme === "system") {
                setEffectiveTheme(mediaQuery.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        // Remove existing theme classes
        root.classList.remove("light", "dark");
        // Add current theme class
        root.classList.add(effectiveTheme);

        // Set data attribute for CSS selectors
        root.setAttribute("data-theme", effectiveTheme);

        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            // Use the color theme's body color for the meta tag
            const currentColorTheme = themes[colorTheme];
            const modeVars = currentColorTheme?.[effectiveTheme] || {};
            const bodyColor = modeVars['--bg-body'] || (effectiveTheme === "dark" ? "#020817" : "#f6f8fc");
            themeColorMeta.setAttribute("content", bodyColor);
        }
    }, [effectiveTheme, colorTheme]);

    // Apply color theme CSS variables
    useEffect(() => {
        const root = document.documentElement;
        const mode = effectiveTheme; // "light" or "dark"
        const themeConfig = themes[colorTheme];

        // First, clear ALL theme-controlled CSS variables so base CSS takes over
        for (const varName of THEME_VARIABLES) {
            root.style.removeProperty(varName);
        }

        // Then apply overrides from the selected color theme
        if (themeConfig) {
            const overrides = themeConfig[mode] || {};
            for (const [key, value] of Object.entries(overrides)) {
                root.style.setProperty(key, value);
            }
        }

        // Set data attribute for any CSS-only overrides
        root.setAttribute("data-color-theme", colorTheme);
    }, [colorTheme, effectiveTheme]);

    // Apply accent color to CSS variables
    useEffect(() => {
        const colors = accentColors[accentColor] || accentColors.indigo;
        const root = document.documentElement;

        root.style.setProperty("--primary", colors.primary);
        root.style.setProperty("--primary-hover", colors.hover);
        root.style.setProperty("--primary-light", colors.light);
        root.style.setProperty("--primary-rgb", colors.rgb);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accentColor]);

    // Apply compact mode
    useEffect(() => {
        const root = document.documentElement;
        if (compactMode) {
            root.classList.add("compact-mode");
        } else {
            root.classList.remove("compact-mode");
        }
    }, [compactMode]);

    // Update theme
    const updateTheme = useCallback((newTheme) => {
        setTheme(newTheme);
        setEncryptedItem("synergy_theme", newTheme);
    }, []);

    // Update color theme
    const updateColorTheme = useCallback((newColorTheme) => {
        if (themes[newColorTheme]) {
            setColorTheme(newColorTheme);
            setEncryptedItem("synergy_color_theme", newColorTheme);
        }
    }, []);

    // Update accent color
    const updateAccentColor = useCallback((newColor) => {
        if (accentColors[newColor]) {
            setAccentColor(newColor);
            setEncryptedItem("synergy_accent_color", newColor);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update compact mode
    const updateCompactMode = useCallback((enabled) => {
        setCompactMode(enabled);
        setEncryptedItem("synergy_compact_mode", enabled.toString());
    }, []);

    // Sync settings from database (called after user settings are loaded)
    const syncFromDatabase = useCallback((settings) => {
        if (settings.theme) {
            setTheme(settings.theme);
            setEncryptedItem("synergy_theme", settings.theme);
        }
        if (settings.colorTheme && themes[settings.colorTheme]) {
            setColorTheme(settings.colorTheme);
            setEncryptedItem("synergy_color_theme", settings.colorTheme);
        }
        if (settings.accentColor) {
            setAccentColor(settings.accentColor);
            setEncryptedItem("synergy_accent_color", settings.accentColor);
        }
        if (settings.compactMode !== undefined) {
            setCompactMode(settings.compactMode);
            setEncryptedItem("synergy_compact_mode", settings.compactMode.toString());
        }
    }, []);

    const value = {
        theme,
        effectiveTheme,
        colorTheme,
        accentColor,
        compactMode,
        accentColors,
        updateTheme,
        updateColorTheme,
        updateAccentColor,
        updateCompactMode,
        syncFromDatabase,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
