import { supabase } from "../lib/supabase";

/**
 * Utility to handle API calls with automatic retry on token refresh
 */
export const withTokenRefresh = async (apiCall, maxRetries = 1) => {
    let retries = 0;

    while (retries <= maxRetries) {
        try {
            const result = await apiCall();

            // If there's an error and it's JWT-related, try to refresh
            if (result.error && result.error.code === 'PGRST301') {
                throw result.error;
            }

            return result;
        } catch (error) {
            // Check if error is JWT-related
            const isJWTError =
                error?.code === 'PGRST301' ||
                error?.code === 'PGRST302' ||
                error?.code === 'PGRST303' ||
                error?.message?.toLowerCase().includes('jwt');

            if (isJWTError && retries < maxRetries) {


                // Try to refresh the session
                const { data: { session }, error: refreshError } = await supabase.auth.getSession();

                if (refreshError || !session) {
                    console.error('Failed to refresh session:', refreshError);
                    // Sign out the user if refresh fails
                    await supabase.auth.signOut();
                    throw new Error('Session expired. Please log in again.');
                }


                retries++;
                continue;
            }

            // If not JWT error or max retries reached, return the error
            return { data: null, error };
        }
    }

    return { data: null, error: new Error('Max retries exceeded') };
};

/**
 * Check if the current session is valid
 */
export const isSessionValid = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            return false;
        }

        // Check if token is expired or about to expire (within 5 minutes)
        const expiresAt = session.expires_at * 1000; // Convert to milliseconds
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (expiresAt - now < fiveMinutes) {

            const { data: { session: newSession }, error: refreshError } =
                await supabase.auth.refreshSession();

            return !refreshError && !!newSession;
        }

        return true;
    } catch (error) {
        console.error('Error checking session validity:', error);
        return false;
    }
};
