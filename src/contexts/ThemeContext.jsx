import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { setLocalItem, getLocalItem } from "../utils/storageUtils";
import { themes, THEME_VARIABLES } from "../themes/themes";

// Convert a #rrggbb hex string into an [r, g, b] tuple.
const hexToRgb = (hex) => {
    const int = parseInt(hex.replace("#", ""), 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};

const ThemeContext = createContext({});

/* eslint-disable react-refresh/only-export-components */

/**
 * ThemeProvider - Provides theme management across the application
 * Handles light/dark/system theme modes, color themes, and accent colors
 */
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => getLocalItem("synergy_theme") || "system");
    const [colorTheme, setColorTheme] = useState(() => getLocalItem("synergy_color_theme") || "default");
    const [accentColor, setAccentColor] = useState(() => getLocalItem("synergy_accent_color") || "iris");
    const [compactMode, setCompactMode] = useState(() => getLocalItem("synergy_compact_mode") === "true");
    const [effectiveTheme, setEffectiveTheme] = useState("light");

    // Accent color definitions
    const accentColors = {
        violet: { primary: "#8b5cf6", hover: "#7c3aed", light: "rgba(139, 92, 246, 0.14)", rgb: "139, 92, 246" },
        iris: { primary: "#6366f1", hover: "#4f46e5", light: "rgba(99, 102, 241, 0.14)", rgb: "99, 102, 241" },
        teal: { primary: "#14b8a6", hover: "#0f7660", light: "rgba(20, 184, 166, 0.14)", rgb: "20, 184, 166" },
        coral: { primary: "#f43f5e", hover: "#e11d48", light: "rgba(244, 63, 94, 0.14)", rgb: "244, 63, 94" },
        amber: { primary: "#f59e0b", hover: "#d97706", light: "rgba(245, 158, 11, 0.14)", rgb: "245, 158, 11" },
        graphite: { primary: "#94a3b8", hover: "#64748b", light: "rgba(148, 163, 184, 0.14)", rgb: "148, 163, 184" },
        emerald: { primary: "#10b981", hover: "#059669", light: "rgba(16, 185, 129, 0.14)", rgb: "16, 185, 129" },
        green: { primary: "#22c55e", hover: "#16a34a", light: "rgba(34, 197, 94, 0.14)", rgb: "34, 197, 94" },
        pink: { primary: "#ec4899", hover: "#db2777", light: "rgba(236, 72, 153, 0.14)", rgb: "236, 72, 153" },
        fuchsia: { primary: "#d946ef", hover: "#c026d3", light: "rgba(217, 70, 239, 0.14)", rgb: "217, 70, 239" },
        red: { primary: "#ef4444", hover: "#dc2626", light: "rgba(239, 68, 68, 0.14)", rgb: "239, 68, 68" },
        orange: { primary: "#f97316", hover: "#ea580c", light: "rgba(249, 115, 22, 0.14)", rgb: "249, 115, 22" },
        yellow: { primary: "#eab308", hover: "#ca8a04", light: "rgba(234, 179, 8, 0.14)", rgb: "234, 179, 8" },
        copper: { primary: "#b45309", hover: "#92400e", light: "rgba(180, 83, 9, 0.14)", rgb: "180, 83, 9" },
        sky: { primary: "#0ea5e9", hover: "#0284c7", light: "rgba(14, 165, 233, 0.14)", rgb: "14, 165, 233" },
    };
    // Resolve an accent id to its definition, falling back to a safe default
    // so legacy/invalid stored ids (e.g. old "rose"/"indigo" in the DB)
    // never crash the provider.
    const DEFAULT_ACCENT = "iris";
    const resolveAccent = (id) => accentColors[id] || accentColors[DEFAULT_ACCENT];

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
        const colors = resolveAccent(accentColor);
        const root = document.documentElement;

        root.style.setProperty("--primary", colors.primary);
        root.style.setProperty("--primary-hover", colors.hover);
        // Keep Tailwind color utilities (bg-primary / text-primary / border-primary)
        // in sync with the user-selectable accent.
        root.style.setProperty("--color-primary", colors.primary);
        root.style.setProperty("--color-primary-hover", colors.hover);
        root.style.setProperty("--color-primary-light", colors.light);

        // --primary-light and --primary-rgb must respect the active theme so the
        // accent stays visible on both light and dark surfaces. Inline overrides
        // otherwise defeat the .dark definitions in index.css.
        if (effectiveTheme === "dark") {
            const [r, g, b] = hexToRgb(colors.primary);
            const lr = Math.round(r + (255 - r) * 0.2);
            const lg = Math.round(g + (255 - g) * 0.2);
            const lb = Math.round(b + (255 - b) * 0.2);
            root.style.setProperty("--primary-rgb", lr + ", " + lg + ", " + lb);
            root.style.setProperty("--primary-light", "rgba(" + lr + ", " + lg + ", " + lb + ", 0.18)");
        } else {
            root.style.setProperty("--primary-light", colors.light);
            root.style.setProperty("--primary-rgb", colors.rgb);
        }
    }, [accentColor, effectiveTheme]);

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
        setLocalItem("synergy_theme", newTheme);
    }, []);

    // Update color theme
    const updateColorTheme = useCallback((newColorTheme) => {
        if (themes[newColorTheme]) {
            setColorTheme(newColorTheme);
            setLocalItem("synergy_color_theme", newColorTheme);
        }
    }, []);

    // Update accent color
    const updateAccentColor = useCallback((newColor) => {
        const resolved = resolveAccent(newColor);
        const safe = resolved === accentColors[newColor] ? newColor : DEFAULT_ACCENT;
        setAccentColor(safe);
        setLocalItem("synergy_accent_color", safe);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update compact mode
    const updateCompactMode = useCallback((enabled) => {
        setCompactMode(enabled);
        setLocalItem("synergy_compact_mode", enabled.toString());
    }, []);

    // Sync settings from database (called after user settings are loaded)
    const syncFromDatabase = useCallback((settings) => {
        if (settings.theme) {
            setTheme(settings.theme);
            setLocalItem("synergy_theme", settings.theme);
        }
        if (settings.colorTheme && themes[settings.colorTheme]) {
            setColorTheme(settings.colorTheme);
            setLocalItem("synergy_color_theme", settings.colorTheme);
        }
        if (settings.accentColor && accentColors[settings.accentColor]) {
            setAccentColor(settings.accentColor);
            setLocalItem("synergy_accent_color", settings.accentColor);
        }
        if (settings.compactMode !== undefined) {
            setCompactMode(settings.compactMode);
            setLocalItem("synergy_compact_mode", settings.compactMode.toString());
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
