import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Shield, Key, Monitor, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Trash2 } from "../../../lib/icons";
import { authService } from "../../../services/authService";
import { useAuth } from "../../../contexts/AuthContext";

/**
 * Security Section Component
 * Handles password, MFA (TOTP), and session settings
 */
const SecuritySection = ({ settings, errors, isSaving, onUpdateSetting }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === "Admin" || user?.role === "Manager";

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // MFA State
    const [mfaFactors, setMfaFactors] = useState([]);
    const [mfaLoading, setMfaLoading] = useState(false);
    const [enrollData, setEnrollData] = useState(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [mfaError, setMfaError] = useState("");
    const [mfaSuccess, setMfaSuccess] = useState("");

    // Load existing MFA factors
    const loadFactors = useCallback(async () => {
        setMfaLoading(true);
        const { factors } = await authService.listMFAFactors();
        setMfaFactors(factors || []);
        setMfaLoading(false);
    }, []);

    // Load MFA factors on mount for admin users (avoid setState in effect)
    const hasLoadedFactors = React.useRef(false);
    React.useEffect(() => {
        if (isAdmin && !hasLoadedFactors.current) {
            hasLoadedFactors.current = true;
            loadFactors();
        }
    }, [isAdmin, loadFactors]);

    const hasVerifiedFactor = mfaFactors.some(f => f.status === "verified");

    const handleEnrollMFA = async () => {
        setMfaError("");
        setMfaSuccess("");
        setMfaLoading(true);
        const { data, error } = await authService.enrollMFA("Synergy EMS Authenticator");
        setMfaLoading(false);
        if (error) {
            setMfaError(error.message || "Failed to start MFA enrollment");
            return;
        }
        setEnrollData(data);
    };

    const handleVerifyMFA = async () => {
        if (!verifyCode || verifyCode.length !== 6) {
            setMfaError("Please enter a 6-digit code");
            return;
        }
        setMfaError("");
        setMfaLoading(true);
        const { error } = await authService.verifyMFA(enrollData.id, verifyCode);
        setMfaLoading(false);
        if (error) {
            setMfaError(error.message || "Invalid verification code");
            return;
        }
        setMfaSuccess("MFA has been enabled successfully!");
        setEnrollData(null);
        setVerifyCode("");
        loadFactors();
    };

    const handleUnenrollMFA = async (factorId) => {
        if (!confirm("Are you sure you want to disable MFA? This will remove the second factor from your account.")) return;
        setMfaLoading(true);
        const { error } = await authService.unenrollMFA(factorId);
        setMfaLoading(false);
        if (error) {
            setMfaError(error.message || "Failed to disable MFA");
            return;
        }
        setMfaSuccess("MFA has been disabled");
        loadFactors();
    };

    return (
        <div className="settings-panel">
            <div className="settings-panel-header">
                <div className="settings-panel-icon">
                    <Shield size={20} />
                </div>
                <div>
                    <h2 className="settings-panel-title">Security</h2>
                    <p className="settings-panel-description">Password, two-factor authentication, and sessions</p>
                </div>
            </div>

            <div className="settings-panel-content">
                {/* Change Password */}
                <div className="settings-security-section">
                    <div className="settings-security-header">
                        <Key size={18} />
                        <h3>Change Password</h3>
                    </div>
                    <div className="settings-field">
                        <label className="settings-field-label">New Password</label>
                        <div className="settings-field-password">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={settings.newPassword}
                                onChange={(e) => onUpdateSetting("newPassword", e.target.value)}
                                className={`settings-field-input ${errors.newPassword ? "error" : ""}`}
                                placeholder="Enter new password"
                                disabled={isSaving}
                            />
                            <button type="button" className="settings-password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.newPassword ? (
                            <span className="settings-field-error"><AlertCircle size={12} /> {errors.newPassword}</span>
                        ) : (
                            <span className="settings-field-hint">Minimum 8 characters with uppercase, lowercase, and number</span>
                        )}
                    </div>
                    <div className="settings-field">
                        <label className="settings-field-label">Confirm New Password</label>
                        <div className="settings-field-password">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={settings.confirmPassword}
                                onChange={(e) => onUpdateSetting("confirmPassword", e.target.value)}
                                className={`settings-field-input ${errors.confirmPassword ? "error" : ""}`}
                                placeholder="Confirm new password"
                                disabled={isSaving}
                            />
                            <button type="button" className="settings-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span className="settings-field-error"><AlertCircle size={12} /> {errors.confirmPassword}</span>
                        )}
                    </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="settings-security-section">
                    <div className="settings-security-header">
                        <Shield size={18} />
                        <h3>Two-Factor Authentication (TOTP)</h3>
                    </div>

                    {!isAdmin ? (
                        <div className="settings-coming-soon">
                            <span>🔐 MFA is available for Admin and Manager accounts.</span>
                        </div>
                    ) : mfaLoading && !enrollData ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px", color: "var(--text-muted)" }}>
                            <Loader2 size={18} className="animate-spin" /> Loading MFA status...
                        </div>
                    ) : (
                        <>
                            {mfaError && (
                                <div style={{
                                    padding: "10px 14px", background: "var(--danger-bg)",
                                    border: "1px solid var(--danger-color)", borderRadius: "8px",
                                    color: "var(--danger-text)", fontSize: "13px", display: "flex",
                                    alignItems: "center", gap: "8px", marginBottom: "12px",
                                }}>
                                    <AlertCircle size={14} /> {mfaError}
                                </div>
                            )}
                            {mfaSuccess && (
                                <div style={{
                                    padding: "10px 14px", background: "var(--success-bg)",
                                    border: "1px solid var(--success-color)", borderRadius: "8px",
                                    color: "var(--success-text)", fontSize: "13px", display: "flex",
                                    alignItems: "center", gap: "8px", marginBottom: "12px",
                                }}>
                                    <CheckCircle size={14} /> {mfaSuccess}
                                </div>
                            )}

                            {hasVerifiedFactor && (
                                <div style={{ marginBottom: "16px" }}>
                                    {mfaFactors.filter(f => f.status === "verified").map(factor => (
                                        <div key={factor.id} style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "12px 16px", background: "var(--success-bg)",
                                            border: "1px solid var(--success-color)", borderRadius: "10px",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <CheckCircle size={18} style={{ color: "var(--success-color)" }} />
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)" }}>
                                                        {factor.friendly_name || "Authenticator App"}
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                        MFA enabled • TOTP Factor
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnenrollMFA(factor.id)}
                                                disabled={mfaLoading}
                                                style={{
                                                    padding: "6px 12px", borderRadius: "6px",
                                                    border: "1px solid var(--danger-color)",
                                                    background: "var(--danger-bg)", color: "var(--danger-text)",
                                                    cursor: "pointer", fontSize: "12px", fontWeight: 500,
                                                    display: "flex", alignItems: "center", gap: "4px",
                                                }}
                                            >
                                                <Trash2 size={12} /> Disable
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {enrollData ? (
                                <div style={{
                                    padding: "20px", background: "var(--bg-body)",
                                    borderRadius: "12px", border: "1px solid var(--border)",
                                }}>
                                    <h4 style={{ marginBottom: "12px", fontSize: "15px", fontWeight: 600 }}>
                                        Scan QR Code with your Authenticator App
                                    </h4>
                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                                        Use Google Authenticator, Authy, or any TOTP-compatible app to scan this QR code.
                                    </p>
                                    <div style={{
                                        display: "flex", justifyContent: "center", padding: "16px",
                                        background: "var(--bg-surface)", borderRadius: "8px", marginBottom: "16px",
                                    }}>
                                        <img src={enrollData.totp.qr_code} alt="MFA QR Code" style={{ width: "200px", height: "200px" }} />
                                    </div>
                                    <div style={{
                                        padding: "10px 14px", background: "var(--primary-light)",
                                        borderRadius: "8px", marginBottom: "16px", fontSize: "12px",
                                    }}>
                                        <span style={{ color: "var(--text-muted)" }}>Manual entry key: </span>
                                        <code style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--text-main)", letterSpacing: "1px" }}>
                                            {enrollData.totp.secret}
                                        </code>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            value={verifyCode}
                                            onChange={(e) => { setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setMfaError(""); }}
                                            placeholder="Enter 6-digit code"
                                            maxLength={6}
                                            style={{
                                                flex: 1, padding: "10px 14px", borderRadius: "8px",
                                                border: "1px solid var(--border)",
                                                background: "var(--bg-surface)", color: "var(--text-main)",
                                                fontSize: "16px", fontFamily: "monospace",
                                                letterSpacing: "4px", textAlign: "center",
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleVerifyMFA}
                                            disabled={mfaLoading || verifyCode.length !== 6}
                                            className="btn btn-primary"
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            {mfaLoading ? <Loader2 size={16} className="animate-spin" /> : "Verify & Enable"}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => { setEnrollData(null); setVerifyCode(""); setMfaError(""); }}
                                        style={{
                                            marginTop: "12px", padding: "6px 12px",
                                            background: "transparent", border: "none",
                                            color: "var(--text-muted)", cursor: "pointer", fontSize: "13px",
                                        }}
                                    >
                                        Cancel Setup
                                    </button>
                                </div>
                            ) : !hasVerifiedFactor ? (
                                <div>
                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                                        Protect your admin account with TOTP-based two-factor authentication.
                                        You'll need an authenticator app like Google Authenticator or Authy.
                                    </p>
                                    <button onClick={handleEnrollMFA} disabled={mfaLoading} className="btn btn-primary" style={{ gap: "6px" }}>
                                        <Shield size={16} />
                                        {mfaLoading ? "Setting up..." : "Enable Two-Factor Authentication"}
                                    </button>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                {/* Active Sessions */}
                <div className="settings-security-section">
                    <div className="settings-security-header">
                        <Monitor size={18} />
                        <h3>Active Sessions</h3>
                    </div>
                    <div className="settings-session-item current">
                        <div className="settings-session-icon">
                            <Monitor size={18} />
                        </div>
                        <div className="settings-session-info">
                            <span className="settings-session-device">Current Session</span>
                            <span className="settings-session-details">
                                This device • {new Date().toLocaleDateString()}
                            </span>
                        </div>
                        <span className="settings-session-badge">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

SecuritySection.propTypes = {
    settings: PropTypes.shape({
        newPassword: PropTypes.string,
        confirmPassword: PropTypes.string,
        twoFactorEnabled: PropTypes.bool,
    }).isRequired,
    errors: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onUpdateSetting: PropTypes.func.isRequired,
};

export default SecuritySection;
