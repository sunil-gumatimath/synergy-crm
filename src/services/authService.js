import { supabase } from "../lib/supabase";

/**
 * Authentication Service - Handles user authentication with Supabase
 */
export const authService = {
  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - Optional user metadata (name, etc.)
   * @returns {Promise<{user: Object|null, error: Error|null}>}
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata, // Store additional user data
        },
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { user: null, error };
    }
  },

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: Object|null, session: Object|null, error: Error|null}>}
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { user: null, session: null, error };
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise<{error: Error|null}>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error };
    }
  },

  /**
   * Get the current user session
   * @returns {Promise<{session: Object|null, error: Error|null}>}
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error) {
      console.error("Get session error:", error);
      return { session: null, error };
    }
  },

  /**
   * Get the current user
   * @returns {Promise<{user: Object|null, error: Error|null}>}
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Get user error:", error);
      return { user: null, error };
    }
  },

  /**
   * Reset password for a user
   * @param {string} email - User email
   * @returns {Promise<{error: Error|null}>}
   */
  async resetPassword(email) {
    try {
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error };
    }
  },

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<{user: Object|null, error: Error|null}>}
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Update password error:", error);
      return { user: null, error };
    }
  },

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Callback function
   * @returns {Object} Subscription object with unsubscribe method
   */
  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return data;
  },

  // ─── Admin User Creation ────────────────────────────────────

  /**
   * Create a new auth user (called by admin when adding an employee).
   * Uses a database RPC to insert directly into auth.users, bypassing
   * Supabase's signUp() entirely. This avoids email rate limits and
   * creates the user already confirmed.
   *
   * @param {string} email    - New user's email
   * @param {string} password - Initial password
   * @param {Object} metadata - Optional user_metadata (name, role, etc.)
   * @returns {Promise<{userId: string|null, error: Error|null}>}
   */
  async adminCreateUser(email, password, metadata = {}) {
    try {
      const { data: userId, error } = await supabase.rpc(
        "admin_create_auth_user",
        {
          user_email: email,
          user_password: password,
          user_metadata: metadata,
        },
      );

      if (error) throw error;
      if (!userId) throw new Error("Failed to create user account.");

      return { userId, error: null };
    } catch (error) {
      console.error("Admin create user error:", error);
      return { userId: null, error };
    }
  },

  // ─── MFA (Multi-Factor Authentication) ───────────────────────

  /**
   * Enroll a new TOTP MFA factor
   * Returns a QR code URI and secret for the authenticator app
   * @param {string} friendlyName - Display name for the factor (e.g. "My Authenticator")
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async enrollMFA(friendlyName = "Synergy EMS") {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName,
      });
      if (error) throw error;
      // data contains: id, type, totp.qr_code, totp.secret, totp.uri
      return { data, error: null };
    } catch (error) {
      console.error("MFA enroll error:", error);
      return { data: null, error };
    }
  },

  /**
   * Verify and activate MFA factor after enrollment
   * Must be called with a valid TOTP code from the authenticator app
   * @param {string} factorId - The factor ID from enrollment
   * @param {string} code - 6-digit TOTP code from authenticator
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async verifyMFA(factorId, code) {
    try {
      // Create a challenge first
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      // Verify the challenge with the TOTP code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("MFA verify error:", error);
      return { data: null, error };
    }
  },

  /**
   * Remove/unenroll an MFA factor
   * @param {string} factorId - The factor ID to unenroll
   * @returns {Promise<{error: Error|null}>}
   */
  async unenrollMFA(factorId) {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("MFA unenroll error:", error);
      return { error };
    }
  },

  /**
   * List all enrolled MFA factors for the current user
   * @returns {Promise<{factors: Array, error: Error|null}>}
   */
  async listMFAFactors() {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return { factors: data?.totp || [], error: null };
    } catch (error) {
      console.error("List MFA factors error:", error);
      return { factors: [], error };
    }
  },

  /**
   * Get the current MFA Assurance level
   * Returns 'aal1' (password only) or 'aal2' (password + MFA)
   * @returns {Promise<{level: string|null, error: Error|null}>}
   */
  async getMFAAssuranceLevel() {
    try {
      const { data, error } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      return {
        currentLevel: data.currentLevel,
        nextLevel: data.nextLevel,
        currentAuthenticationMethods: data.currentAuthenticationMethods,
        error: null,
      };
    } catch (error) {
      console.error("Get MFA assurance level error:", error);
      return { currentLevel: null, nextLevel: null, error };
    }
  },

  /**
   * Create an MFA challenge and verify with code (for login flow)
   * Used when user has MFA enabled and needs to provide second factor
   * @param {string} factorId - The factor ID to challenge
   * @param {string} code - 6-digit TOTP code
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async challengeAndVerifyMFA(factorId, code) {
    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("MFA challenge/verify error:", error);
      return { data: null, error };
    }
  },
};
