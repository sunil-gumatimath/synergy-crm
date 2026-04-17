import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { authService } from "../services/authService";
import { supabase } from "../lib/supabase";
import { normalizeRole } from "../utils/roles";

const AuthContext = createContext({});

// Only fetch basic employee data on boot to ensure the role is loaded.
// Private details (salary, bank info) are fetched on demand in the Profile/Settings views.
const EMPLOYEE_SELECT = `*`;

const flattenEmployeeRecord = (record) => {
  if (!record) return record;
  const privateDetails = Array.isArray(record.private_details)
    ? record.private_details[0]
    : record.private_details;

  return {
    ...record,
    ...(privateDetails || {}),
    private_details: privateDetails || null,
  };
};

// Build an optimistic user object synchronously from the auth/JWT payload so
// the UI can render immediately without waiting on a Supabase REST round-trip.
const buildOptimisticUser = (authUser) => {
  if (!authUser) return null;
  const meta = authUser.user_metadata || {};
  return {
    ...authUser,
    id: authUser.id,
    name: meta.full_name || meta.name || authUser.email,
    role: normalizeRole(meta.role || "Employee"),
  };
};

/* eslint-disable react-refresh/only-export-components */

// Provider component for authentication context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const lastProfileFetchIdRef = useRef(null);

  const fetchAndSetUser = React.useCallback(async (authUser) => {
    if (!authUser) return;
    // Dedupe: skip if we've already fetched this auth user's profile.
    if (lastProfileFetchIdRef.current === authUser.id) return;
    lastProfileFetchIdRef.current = authUser.id;
    try {
      // Use a more robust lookup: primary on user_id (UUID match), 
      // fallback on case-insensitive email (for users not yet linked by ID).
      const { data: employee, error } = await supabase
        .from('employees')
        .select(EMPLOYEE_SELECT)
        .or(`user_id.eq.${authUser.id},email.ilike.${authUser.email}`)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching employee profile:", error);
      }

      const resolvedEmployee = flattenEmployeeRecord(employee);

      // Role comes from employee table, normalized for consistent RBAC checks
      const role = normalizeRole(resolvedEmployee?.role || 'Employee');

      setUser({
        ...authUser,
        ...resolvedEmployee,
        role: role,
        id: authUser.id, // Keep auth ID as primary ID, or use employee.id as employeeId
        employeeId: resolvedEmployee?.id
      });
    } catch (err) {
      console.error("Error in fetchAndSetUser:", err);
      setUser((prev) => prev || buildOptimisticUser(authUser));
    } finally {
      setProfileLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Bootstrap the user synchronously from the session/JWT and release the UI
    // immediately, then enrich the profile from the employees table in the
    // background so the app never blocks on a Supabase REST round-trip.
    const bootstrap = (authUser) => {
      setUser((prev) => prev || buildOptimisticUser(authUser));
      setLoading(false);
      void fetchAndSetUser(authUser);
    };

    const initializeAuth = async () => {
      try {
        const { session: currentSession, error } = await authService.getSession();

        if (error) {
          console.error('Session error:', error);
          setSession(null);
          setUser(null);
          setLoading(false);
          setProfileLoaded(true);
          return;
        }

        if (currentSession) {
          const expiresAt = currentSession.expires_at * 1000;
          const now = Date.now();

          if (expiresAt < now) {
            const { data: { session: newSession }, error: refreshError } =
              await supabase.auth.refreshSession();

            if (refreshError || !newSession) {
              console.error('Failed to refresh expired session, signing out...');
              await authService.signOut();
              setSession(null);
              setUser(null);
              setLoading(false);
              setProfileLoaded(true);
            } else {
              setSession(newSession);
              bootstrap(newSession.user);
            }
          } else {
            setSession(currentSession);
            bootstrap(currentSession.user);
          }
        } else {
          setSession(null);
          setUser(null);
          setLoading(false);
          setProfileLoaded(true);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setSession(null);
        setUser(null);
        setLoading(false);
        setProfileLoaded(true);
      }
    };

    initializeAuth();

    // Listen for auth changes (including automatic token refresh)
    const { subscription } = authService.onAuthStateChange(
      (event, newSession) => {
        // initializeAuth() already handled the initial session; skip the
        // duplicate INITIAL_SESSION event that Supabase emits on boot.
        if (event === 'INITIAL_SESSION') return;

        setSession(newSession);

        if (event === 'SIGNED_OUT') {
          lastProfileFetchIdRef.current = null;
          setSession(null);
          setUser(null);
          setProfileLoaded(true);
          return;
        }

        if (newSession?.user) {
          // TOKEN_REFRESHED keeps the same user id - no need to refetch profile.
          if (event === 'TOKEN_REFRESHED' &&
              lastProfileFetchIdRef.current === newSession.user.id) {
            return;
          }
          setUser((prev) => prev || buildOptimisticUser(newSession.user));
          setLoading(false);
          void fetchAndSetUser(newSession.user);
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchAndSetUser]);

  const signUp = async (email, password, metadata) => {
    const { user: newUser, error } = await authService.signUp(
      email,
      password,
      metadata,
    );
    if (!error && newUser) {
      // For new signups, they might not be in employees table yet
      setUser({ ...newUser, role: normalizeRole('Employee') });
    }
    return { user: newUser, error };
  };

  const signIn = async (email, password) => {
    const {
      user: signedInUser,
      session: newSession,
      error,
    } = await authService.signIn(email, password);
    if (!error) {
      setSession(newSession);
      // Allow profile refetch on sign-in even if the same user id was cached.
      lastProfileFetchIdRef.current = null;
      setUser((prev) => prev || buildOptimisticUser(signedInUser));
      void fetchAndSetUser(signedInUser);
    }
    return { user: signedInUser, error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      lastProfileFetchIdRef.current = null;
      setUser(null);
      setSession(null);
      setProfileLoaded(true);
    }
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    profileLoaded,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook for using authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
