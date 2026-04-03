import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { User, Camera, Mail, Smartphone, AlertCircle, Loader2 } from "../../../lib/icons";
import Avatar from "../../../components/common/Avatar";
import { avatarService } from "../../../services/avatarService";

/**
 * Account Section Component
 * Handles profile and personal information settings
 */
const AccountSection = ({
    settings,
    user,
    errors,
    isSaving,
    onUpdateSetting
}) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user?.employeeId) return;
        setIsUploading(true);
        try {
            const { url, error } = await avatarService.upload(user.employeeId, file);
            if (error) throw error;
            onUpdateSetting("avatarUrl", url);
        } catch (err) {
            console.error("Avatar upload failed:", err);
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    return (
        <div className="settings-panel">
            <div className="settings-panel-header">
                <div className="settings-panel-icon">
                    <User size={20} />
                </div>
                <div>
                    <h2 className="settings-panel-title">Account Settings</h2>
                    <p className="settings-panel-description">Manage your personal information and profile</p>
                </div>
            </div>

            <div className="settings-panel-content">
                {/* Avatar Section */}
                <div className="settings-avatar-section">
                    <div className="settings-avatar-container">
                        <Avatar
                            src={settings.avatarUrl}
                            name={`${settings.firstName} ${settings.lastName}`}
                            gender={user?.gender}
                            size="xl"
                            className="settings-avatar-large"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            style={{ display: 'none' }}
                            onChange={handleAvatarUpload}
                        />
                        <button
                            className="settings-avatar-edit"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            title="Upload photo"
                        >
                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                        </button>
                    </div>
                    <div className="settings-avatar-info">
                        <h3>{settings.firstName} {settings.lastName}</h3>
                        <p className="text-muted text-sm">{user?.role}</p>
                        <p className="text-muted text-xs mt-1">{settings.email}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="settings-form-row">
                    <div className="settings-field">
                        <label className="settings-field-label">First Name</label>
                        <input
                            type="text"
                            value={settings.firstName}
                            onChange={(e) => onUpdateSetting("firstName", e.target.value)}
                            className={`settings-field-input ${errors.firstName ? "error" : ""}`}
                            placeholder="Enter first name"
                            disabled={isSaving}
                        />
                        {errors.firstName && (
                            <span className="settings-field-error">
                                <AlertCircle size={12} /> {errors.firstName}
                            </span>
                        )}
                    </div>

                    <div className="settings-field">
                        <label className="settings-field-label">Last Name</label>
                        <input
                            type="text"
                            value={settings.lastName}
                            onChange={(e) => onUpdateSetting("lastName", e.target.value)}
                            className="settings-field-input"
                            placeholder="Enter last name"
                            disabled={isSaving}
                        />
                    </div>
                </div>

                <div className="settings-field">
                    <label className="settings-field-label">Email Address</label>
                    <div className="settings-field-with-icon">
                        <Mail size={18} className="settings-field-icon" />
                        <input
                            type="email"
                            value={settings.email}
                            className="settings-field-input with-icon"
                            disabled
                        />
                    </div>
                    <span className="settings-field-hint">Contact administrator to change email</span>
                </div>

                <div className="settings-field">
                    <label className="settings-field-label">Phone Number</label>
                    <div className="settings-field-with-icon">
                        <Smartphone size={18} className="settings-field-icon" />
                        <input
                            type="tel"
                            value={settings.phone}
                            onChange={(e) => onUpdateSetting("phone", e.target.value)}
                            className="settings-field-input with-icon"
                            placeholder="+91 12345 67890"
                            disabled={isSaving}
                        />
                    </div>
                </div>

                <div className="settings-field">
                    <label className="settings-field-label">Bio</label>
                    <textarea
                        value={settings.bio}
                        onChange={(e) => onUpdateSetting("bio", e.target.value)}
                        className="settings-field-textarea"
                        placeholder="Tell us a little about yourself..."
                        rows={3}
                        disabled={isSaving}
                    />
                </div>
            </div>
        </div>
    );
};

AccountSection.propTypes = {
    settings: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
        bio: PropTypes.string,
        avatarUrl: PropTypes.string,
    }).isRequired,
    user: PropTypes.object,
    errors: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onUpdateSetting: PropTypes.func.isRequired,
};

export default AccountSection;
