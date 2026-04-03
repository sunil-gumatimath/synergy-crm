import React, { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Settings as SettingsIcon,
  ChevronRight,
  LogOut,
  Loader2,
  X
} from "../../lib/icons";
import { SkeletonSettingsSection, Skeleton } from "../../components/common/Skeleton";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { authService } from "../../services/authService";
import {
  AccountSection,
  AppearanceSection,
  NotificationsSection,
  PreferencesSection,
  SecuritySection,
} from "./components";
import "./settings-styles.css";

// Navigation items configuration
const navigationItems = [
  { id: "account", label: "Account", icon: User, description: "Profile & personal info" },
  { id: "appearance", label: "Appearance", icon: Palette, description: "Theme & display" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Alerts & reminders" },
  { id: "preferences", label: "Preferences", icon: Globe, description: "Language & region" },
  { id: "security", label: "Security", icon: Shield, description: "Password & 2FA" },
];

// Default settings state
const defaultSettings = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bio: "",
  avatarUrl: "",
  theme: "system",
  accentColor: "indigo",
  compactMode: false,
  emailNotifications: true,
  pushNotifications: false,
  taskReminders: true,
  leaveUpdates: true,
  systemAnnouncements: true,
  weeklyDigest: false,
  mentionNotifications: true,
  language: "en",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  startOfWeek: "monday",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorEnabled: false,
};

/**
 * SettingsView - Main settings page component
 * Refactored to use modular section components
 */
const SettingsView = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState("account");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState({});

  // Load initial data
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data: userSettings, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) console.error("Error loading settings:", error);

        const nameParts = (user.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const loadedSettings = {
          firstName,
          lastName,
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          avatarUrl: user.avatar || "",
          theme: userSettings?.theme || "system",
          accentColor: userSettings?.accent_color || "indigo",
          compactMode: userSettings?.compact_mode || false,
          emailNotifications: userSettings?.email_notifications ?? true,
          pushNotifications: userSettings?.push_notifications ?? false,
          taskReminders: userSettings?.task_reminders ?? true,
          leaveUpdates: userSettings?.leave_updates ?? true,
          systemAnnouncements: userSettings?.system_updates ?? true,
          weeklyDigest: userSettings?.weekly_reports ?? false,
          mentionNotifications: userSettings?.mention_notifications ?? true,
          language: userSettings?.language || "en",
          timezone: userSettings?.timezone || "Asia/Kolkata",
          dateFormat: userSettings?.date_format || "DD/MM/YYYY",
          timeFormat: userSettings?.time_format || "12h",
          startOfWeek: userSettings?.start_of_week || "monday",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          twoFactorEnabled: userSettings?.two_factor_auth || false,
        };

        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } catch (err) {
        console.error("Failed to load settings:", err);
        toast.error("Failed to load settings.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, toast]);

  // Track changes
  useEffect(() => {
    const passwordFields = ['currentPassword', 'newPassword', 'confirmPassword'];
    const changed = Object.keys(settings).some(key => {
      if (passwordFields.includes(key)) {
        return settings[key] !== "";
      }
      return settings[key] !== originalSettings[key];
    });
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const updateSetting = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!settings.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (settings.newPassword || settings.confirmPassword) {
      if (!settings.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (settings.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(settings.newPassword)) {
        newErrors.newPassword = "Password must include uppercase, lowercase, and number";
      }
      if (settings.newPassword !== settings.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSettings = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);

    try {
      const fullName = `${settings.firstName} ${settings.lastName}`.trim();

      // Update Profile
      if (fullName !== user.name) {
        if (user.employeeId) {
          const { error: profileError } = await supabase
            .from('employees')
            .update({ name: fullName })
            .eq('id', user.employeeId);

          if (profileError) throw profileError;
        }

        await supabase.auth.updateUser({
          data: { full_name: fullName }
        });
      }

      // Update User Settings
      const settingsPayload = {
        user_id: user.id,
        theme: settings.theme,
        accent_color: settings.accentColor,
        compact_mode: settings.compactMode,
        email_notifications: settings.emailNotifications,
        push_notifications: settings.pushNotifications,
        task_reminders: settings.taskReminders,
        leave_updates: settings.leaveUpdates,
        system_updates: settings.systemAnnouncements,
        weekly_reports: settings.weeklyDigest,
        mention_notifications: settings.mentionNotifications,
        language: settings.language,
        timezone: settings.timezone,
        date_format: settings.dateFormat,
        time_format: settings.timeFormat,
        start_of_week: settings.startOfWeek,
        two_factor_auth: settings.twoFactorEnabled,
        updated_at: new Date().toISOString(),
      };

      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert(settingsPayload);

      if (settingsError) throw settingsError;

      // Update Password if provided
      if (settings.newPassword) {
        const { error: passwordError } = await authService.updatePassword(settings.newPassword);
        if (passwordError) throw passwordError;

        setSettings(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
        toast.success("Settings and password updated successfully!");
      } else {
        toast.success("Settings saved successfully!");
      }

      setOriginalSettings({
        ...settings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    setSettings(originalSettings);
    setErrors({});
    toast.info("Changes discarded");
  };

  // Render active section
  const renderActiveSection = () => {
    if (isLoading) {
      return (
        <div className="settings-loading">
          <Loader2 size={32} className="animate-spin" />
          <span>Loading settings...</span>
        </div>
      );
    }

    const sectionProps = { settings, errors, isSaving, onUpdateSetting: updateSetting };

    switch (activeSection) {
      case "account":
        return <AccountSection {...sectionProps} user={user} />;
      case "appearance":
        return <AppearanceSection {...sectionProps} />;
      case "notifications":
        return <NotificationsSection {...sectionProps} />;
      case "preferences":
        return <PreferencesSection {...sectionProps} />;
      case "security":
        return <SecuritySection {...sectionProps} />;
      default:
        return <AccountSection {...sectionProps} user={user} />;
    }
  };

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="settings-container">
        <div className="settings-header">
          <div className="settings-header-content">
            <Skeleton width="48px" height="48px" borderRadius="12px" />
            <div>
              <Skeleton width="120px" height="28px" />
              <Skeleton width="200px" height="14px" className="mt-2" />
            </div>
          </div>
        </div>
        <div className="settings-layout">
          <aside className="settings-sidebar">
            <nav className="settings-nav">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
                  <Skeleton width="36px" height="36px" borderRadius="8px" />
                  <div>
                    <Skeleton width="80px" height="14px" />
                    <Skeleton width="120px" height="10px" className="mt-1" />
                  </div>
                </div>
              ))}
            </nav>
          </aside>
          <main className="settings-main">
            <SkeletonSettingsSection rows={4} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      {/* Page Header */}
      <div className="settings-header">
        <div className="settings-header-content">
          <div className="settings-header-icon">
            <SettingsIcon size={28} />
          </div>
          <div>
            <h1 className="settings-header-title">Settings</h1>
            <p className="settings-header-subtitle">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`settings-nav-item ${activeSection === item.id ? "active" : ""}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <div className="settings-nav-icon">
                    <Icon size={18} />
                  </div>
                  <div className="settings-nav-content">
                    <span className="settings-nav-label">{item.label}</span>
                    <span className="settings-nav-description">{item.description}</span>
                  </div>
                  <ChevronRight size={16} className="settings-nav-arrow" />
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="settings-sidebar-footer">
            <button
              className="settings-logout-btn"
              onClick={() => authService.signOut()}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="settings-main">
          {renderActiveSection()}

          {/* Save Bar */}
          {hasChanges && (
            <div className="settings-save-bar">
              <span className="settings-save-text">You have unsaved changes</span>
              <div className="settings-save-actions">
                <button
                  className="settings-btn-secondary"
                  onClick={discardChanges}
                  disabled={isSaving}
                >
                  <X size={16} />
                  Discard
                </button>
                <button
                  className="settings-btn-primary"
                  onClick={saveSettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsView;
