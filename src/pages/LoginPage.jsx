import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import {
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Mail,
} from "../lib/icons";
import SynergyLogo from "../components/common/SynergyLogo";
import { setEncryptedItem, getEncryptedItem, removeEncryptedItem } from "../utils/storageUtils";
import "./login-styles.css";

const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Forgot Password Modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = getEncryptedItem("synergy_remembered_email");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  const isRateLimited = cooldownSeconds > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
    if (!e.target.checked) {
      removeEncryptedItem("synergy_remembered_email");
    }
  };

  /**
   * Get cooldown duration based on number of failed attempts.
   * Progressive: 3 failures → 5s, 4 → 15s, 5+ → 30s.
   */
  const getCooldownDuration = (attempts) => {
    if (attempts >= 5) return 30;
    if (attempts >= 4) return 15;
    if (attempts >= 3) return 5;
    return 0;
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    try {
      // Handle Remember Me
      if (rememberMe) {
        setEncryptedItem("synergy_remembered_email", formData.email);
      } else {
        removeEncryptedItem("synergy_remembered_email");
      }

      const { error: signInError, user: signedInUser } = await signIn(
        formData.email,
        formData.password,
      );
      if (signInError) {
        // Track failed attempts for client-side rate limiting
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        const cooldown = getCooldownDuration(newAttempts);
        if (cooldown > 0) {
          setCooldownSeconds(cooldown);
        }

        // Handle specific error cases
        if (signInError.message?.includes('Invalid login credentials')) {
          setError("Invalid email or password. Please try again.");
        } else if (signInError.message?.includes('Email not confirmed')) {
          setError("Please verify your email address before signing in.");
        } else if (signInError.message?.includes('JWT') || signInError.code?.includes('JWT')) {
          setError("Session expired. Please try signing in again.");
        } else {
          setError(signInError.message || "Failed to sign in. Please try again.");
        }
      } else if (signedInUser) {
        // Reset rate limiting on successful login
        setFailedAttempts(0);
        setCooldownSeconds(0);
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@")) {
      setResetMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setResetLoading(true);
    setResetMessage({ type: "", text: "" });

    try {
      const { error } = await authService.resetPassword(resetEmail);
      if (error) {
        setResetMessage({ type: "error", text: error.message || "Failed to send reset email" });
      } else {
        setResetMessage({
          type: "success",
          text: "Password reset link sent! Check your email inbox.",
        });
        // Clear email after successful send
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail("");
          setResetMessage({ type: "", text: "" });
        }, 3000);
      }
    } catch {
      setResetMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setResetLoading(false);
    }
  };


  return (
    <div className="login-page">
      {/* Animated Background Elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="forgot-password-modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowForgotPassword(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="modal-icon">
              <Mail size={32} />
            </div>

            <h3 className="modal-title">Reset Password</h3>
            <p className="modal-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetMessage.text && (
              <div className={`reset-message ${resetMessage.type}`}>
                {resetMessage.type === "error" ? (
                  <AlertCircle size={16} />
                ) : (
                  <Check size={16} />
                )}
                <span>{resetMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="reset-form">
              <div className="form-group">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="form-input"
                  placeholder=" "
                  disabled={resetLoading}
                  autoComplete="email"
                />
                <label className="floating-label">Email Address</label>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              className="back-to-login-btn"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="login-container">
        {/* Logo and Title */}
        <div className="login-header">
          <div className="logo-wrapper">
            <SynergyLogo size={40} className="logo-icon" />
          </div>
          <h1 className="app-title">Synergy</h1>
        </div>

        {/* Form Card */}
        <div className="login-card">
          <div className="card-content">
            <div className="form-header">
              <h2 className="form-title">Employee Login</h2>
              <p className="form-subtitle">Sign in to access your dashboard. Your account is created by your admin or manager.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-alert">
                <AlertCircle size={18} className="error-icon" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="form-group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder=" "
                  disabled={loading}
                  autoComplete="email"
                />
                <label htmlFor="email" className="floating-label">
                  Email Address
                </label>
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="password-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder=" "
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <label htmlFor="password" className="floating-label">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-actions">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <span className="checkbox-text">Remember me</span>
                </label>
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => {
                    setResetEmail(formData.email);
                    setShowForgotPassword(true);
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={loading || isRateLimited}>
                {loading ? (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

        {/* Footer */}
        <p className="auth-footer">
          © {new Date().getFullYear()} Synergy. Secure employee management.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
