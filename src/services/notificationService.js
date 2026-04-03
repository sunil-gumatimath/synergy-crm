import { supabase } from "../lib/supabase.js";

/**
 * Notification Service - Handles all notification-related operations
 */
export const notificationService = {
    /**
     * Get all notifications for the current user
     * @param {Object} options - Query options
     * @param {string} options.userId - User ID to fetch notifications for
     * @param {boolean} options.unreadOnly - Only fetch unread notifications
     * @param {number} options.limit - Maximum number of notifications to fetch
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getNotifications({ userId = null, unreadOnly = false, limit = 50 } = {}) {
        try {
            let query = supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(limit);

            // Filter by user_id if provided
            if (userId) {
                query = query.eq("user_id", userId);
            }

            if (unreadOnly) {
                query = query.eq("read", false);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return { data: [], error };
        }
    },

    /**
     * Get unread notification count
     * @param {string} userId - User ID to count notifications for
     * @returns {Promise<{count: number, error: Error|null}>}
     */
    async getUnreadCount(userId = null) {
        try {
            let query = supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .eq("read", false);

            // Filter by user_id if provided
            if (userId) {
                query = query.eq("user_id", userId);
            }

            const { count, error } = await query;

            if (error) throw error;
            return { count: count || 0, error: null };
        } catch (error) {
            console.error("Error fetching unread count:", error);
            return { count: 0, error };
        }
    },

    /**
     * Mark a notification as read
     * @param {number} notificationId - ID of the notification
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async markAsRead(notificationId) {
        try {
            const { data, error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", notificationId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error marking notification as read:", error);
            return { data: null, error };
        }
    },

    /**
     * Mark all notifications as read
     * @returns {Promise<{error: Error|null}>}
     */
    async markAllAsRead() {
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("read", false);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error marking all as read:", error);
            return { error };
        }
    },

    /**
     * Delete a notification
     * @param {number} notificationId - ID of the notification
     * @returns {Promise<{error: Error|null}>}
     */
    async deleteNotification(notificationId) {
        try {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", notificationId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error deleting notification:", error);
            return { error };
        }
    },

    /**
     * Clear all notifications
     * @returns {Promise<{error: Error|null}>}
     */
    async clearAll() {
        try {
            const { error } = await supabase.from("notifications").delete().neq("id", 0);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error clearing notifications:", error);
            return { error };
        }
    },

    /**
     * Create a notification (for client-side creation)
     * @param {Object} notification - Notification data
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async createNotification({ userId, title, message, type = "info", link = null, metadata = null }) {
        try {
            const { data, error } = await supabase
                .from("notifications")
                .insert({
                    user_id: userId,
                    title,
                    message,
                    type,
                    link,
                    metadata,
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating notification:", error);
            return { data: null, error };
        }
    },

    /**
     * Subscribe to real-time notification updates
     * @param {Function} callback - Callback function for new notifications
     * @returns {Object} Subscription object with unsubscribe method
     */
    subscribeToNotifications(userId, callback) {
        const subscription = supabase
            .channel(`notifications:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    callback(payload.new);
                }
            )
            .subscribe();

        return subscription;
    },

    /**
     * Get notification preferences for the current user
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async getPreferences() {
        try {
            const { data, error } = await supabase
                .from("notification_preferences")
                .select("*")
                .maybeSingle();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error fetching preferences:", error);
            return { data: null, error };
        }
    },

    /**
     * Update notification preferences
     * @param {Object} preferences - Preference updates
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async updatePreferences(preferences) {
        try {
            const { data: existingData } = await supabase
                .from("notification_preferences")
                .select("id")
                .maybeSingle();

            let result;
            if (existingData) {
                result = await supabase
                    .from("notification_preferences")
                    .update(preferences)
                    .eq("id", existingData.id)
                    .select()
                    .single();
            } else {
                result = await supabase
                    .from("notification_preferences")
                    .insert(preferences)
                    .select()
                    .single();
            }

            if (result.error) throw result.error;
            return { data: result.data, error: null };
        } catch (error) {
            console.error("Error updating preferences:", error);
            return { data: null, error };
        }
    },
};
