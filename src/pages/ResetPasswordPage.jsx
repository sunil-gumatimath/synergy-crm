import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "../lib/icons";
import { HiOutlineArrowLeft as ArrowLeft } from "react-icons/hi2";
import { authService } from "../services/authService";
import "./ResetPasswordPage.css";

/**
 * ResetPasswordPage - Handles password reset flow
 * Users land here after clicking the reset link in their email
 */
const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: "" });

    // Check if we have a valid reset token in URL (hash fragment)
    useEffect(() => {
        // Parse hash fragment for access_token
        const hashParams = new URLSearchParams(window.location.hash.substring(1)); // Remove the leading '#'
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        // Also check query params as fallback or for specific flows
        const searchedAccessToken = searchParams.get("access_token");

        // Supabase sends token in hash, but sometimes we might get it in query
        const finalToken = accessToken || searchedAccessToken;

        if (!finalToken && type !== "recovery") {
            // No valid token, might be a direct navigation
            // We'll still show the form but handle errors gracefully
        }
    }, [searchParams]);

    // Password strength checker
    useEffect(() => {
        if (!password) {
            setPasswordStrength({ level: 0, text: "" });
            return;
        }

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { level: 1, text: "Very Weak" },
            { level: 2, text: "Weak" },
            { level: 3, text: "Fair" },
            { level: 4, text: "Strong" },
            { level: 5, text: "Very Strong" }
        ];

        setPasswordStrength(levels[strength - 1] || { level: 0, text: "" });
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (passwordStrength.level < 3) {
            setError("Please choose a stronger password");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await authService.updatePassword(password);

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];
        return colors[passwordStrength.level] || "";
    };

    if (success) {
        return (
            <div className="reset-password-page">
                <div className="reset-password-container">
                    <div className="success-state">
                        <div className="success-icon">
                            <CheckCircle />
                        </div>
                        <h1>Password Reset Successful!</h1>
                        <p>Your password has been successfully updated.</p>
                        <p className="redirect-text">Redirecting to login page...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-page">
            <div className="reset-password-container">
                <button
                    className="back-button"
                    onClick={() => navigate("/login")}
                >
                    <ArrowLeft size={20} />
                    Back to Login
                </button>

                <div className="reset-password-header">
                    <div className="lock-icon">
                        <Lock />
                    </div>
                    <h1>Reset Your Password</h1>
                    <p>Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="reset-password-form">
                    {error && (
                        <div className="error-message">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your new password"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {password && (
                            <div className="password-strength">
                                <div className="strength-bars">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`strength-bar ${level <= passwordStrength.level ? "active" : ""}`}
                                            style={{ backgroundColor: level <= passwordStrength.level ? getStrengthColor() : "" }}
                                        />
                                    ))}
                                </div>
                                <span className="strength-text" style={{ color: getStrengthColor() }}>
                                    {passwordStrength.text}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="field-error">Passwords do not match</p>
                        )}
                    </div>

                    <div className="password-requirements">
                        <p>Password must contain:</p>
                        <ul>
                            <li className={password.length >= 8 ? "met" : ""}>
                                At least 8 characters
                            </li>
                            <li className={/[A-Z]/.test(password) ? "met" : ""}>
                                One uppercase letter
                            </li>
                            <li className={/[a-z]/.test(password) ? "met" : ""}>
                                One lowercase letter
                            </li>
                            <li className={/[0-9]/.test(password) ? "met" : ""}>
                                One number
                            </li>
                            <li className={/[^A-Za-z0-9]/.test(password) ? "met" : ""}>
                                One special character
                            </li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" />
                                Resetting Password...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
