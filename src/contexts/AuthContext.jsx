import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { authService } from "../services/authService";
import { supabase } from "../lib/supabase";
import { normalizeRole } from "../utils/roles";

const AuthContext = createContext({});

/* eslint-disable react-refresh/only-export-components */

// Provider component for authentication context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetUser = React.useCallback(async (authUser) => {
    if (!authUser) return;
    try {
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', authUser.email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching employee profile:", error);
      }

      let resolvedEmployee = employee;

      // Auto-link auth.users.id -> employees.user_id when email matches.
      // This helps role-aware RLS policies that depend on employees.user_id = auth.uid().
      if (resolvedEmployee && !resolvedEmployee.user_id && authUser?.id) {
        const { data: linkedEmployee, error: linkError } = await supabase
          .from('employees')
          .update({ user_id: authUser.id })
          .eq('id', resolvedEmployee.id)
          .is('user_id', null)
          .select('*')
          .maybeSingle();

        if (linkError) {
          console.warn('Could not auto-link employee user_id:', linkError.message || linkError);
        } else if (linkedEmployee) {
          resolvedEmployee = linkedEmployee;
        }
      }

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
      setUser({
        ...authUser,
        role: normalizeRole(authUser?.user_metadata?.role || "Employee"),
      });
    }
  }, []);

  useEffect(() => {
    // Check active session on mount
    const initializeAuth = async () => {
      try {
        const { session: currentSession, error } = await authService.getSession();

        if (error) {
          console.error('Session error:', error);
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // Check if session exists and is valid
        if (currentSession) {
          // Check if token is expired
          const expiresAt = currentSession.expires_at * 1000; // Convert to milliseconds
          const now = Date.now();

          if (expiresAt < now) {

            const { data: { session: newSession }, error: refreshError } =
              await supabase.auth.refreshSession();

            if (refreshError || !newSession) {
              console.error('Failed to refresh expired session, signing out...');
              await authService.signOut();
              setSession(null);
              setUser(null);
            } else {

              setSession(newSession);
              await fetchAndSetUser(newSession.user);
            }
          } else {
            setSession(currentSession);
            await fetchAndSetUser(currentSession.user);
          }
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes (including automatic token refresh)
    const { subscription } = authService.onAuthStateChange(
      async (event, newSession) => {

        setSession(newSession);

        if (newSession?.user) {
          await fetchAndSetUser(newSession.user);
        } else {
          setUser(null);
        }



        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setSession(null);
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
      await fetchAndSetUser(signedInUser);
    }
    return { user: signedInUser, error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const value = {
    user,
    session,
    loading,
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
