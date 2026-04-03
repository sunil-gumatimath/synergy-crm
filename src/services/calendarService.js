import { supabase } from "../lib/supabase.js";

const TABLE_NAME = "calendar_events";

/**
 * Calendar Service - Handles all calendar event operations
 */
export const calendarService = {
    /**
     * Get all calendar events with optional filters (paginated)
     * @param {Object} options - Query options
     * @param {number} [options.page=1] - 1-indexed page
     * @param {number} [options.pageSize=20] - rows per page
     * @returns {Promise<{data: Array, count: number, error: Error|null}>}
     */
    async getAll({ page = 1, pageSize = 20, startDate = null, endDate = null, type = null, employeeId = null } = {}) {
        try {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from(TABLE_NAME)
                .select(`
                    *,
                    employee:employees!calendar_events_employee_id_fkey(id, name, email, avatar, department),
                    creator:employees!calendar_events_created_by_fkey(id, name, email, avatar)
                `, { count: "exact" })
                .order("date", { ascending: true })
                .range(from, to);

            // Filter by date range
            if (startDate) {
                query = query.gte("date", startDate);
            }
            if (endDate) {
                query = query.lte("date", endDate);
            }

            // Filter by type
            if (type && type !== "all") {
                query = query.eq("type", type);
            }

            // Filter by employee
            if (employeeId) {
                query = query.eq("employee_id", employeeId);
            }

            const { data, count, error } = await query;

            if (error) throw error;
            return { data: data || [], count: count ?? 0, error: null };
        } catch (error) {
            console.error("Error fetching calendar events:", error);
            return { data: [], count: 0, error };
        }
    },

    /**
     * Get a single calendar event by ID
     * @param {string} eventId - Event ID
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async getById(eventId) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select(`
                    *,
                    employee:employees!calendar_events_employee_id_fkey(id, name, email, avatar, department),
                    creator:employees!calendar_events_created_by_fkey(id, name, email, avatar)
                `)
                .eq("id", eventId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error fetching calendar event:", error);
            return { data: null, error };
        }
    },

    /**
     * Get events for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getByDate(date) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select(`
                    *,
                    employee:employees!calendar_events_employee_id_fkey(id, name, email, avatar, department),
                    creator:employees!calendar_events_created_by_fkey(id, name, email, avatar)
                `)
                .eq("date", date)
                .order("time", { ascending: true });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching events for date:", error);
            return { data: [], error };
        }
    },

    /**
     * Get events for a date range (month view, week view, etc.)
     * @param {string} startDate - Start date in YYYY-MM-DD format
     * @param {string} endDate - End date in YYYY-MM-DD format
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getByDateRange(startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select(`
                    *,
                    employee:employees!calendar_events_employee_id_fkey(id, name, email, avatar, department),
                    creator:employees!calendar_events_created_by_fkey(id, name, email, avatar)
                `)
                .gte("date", startDate)
                .lte("date", endDate)
                .order("date", { ascending: true })
                .order("time", { ascending: true });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching events for date range:", error);
            return { data: [], error };
        }
    },

    /**
     * Create a new calendar event
     * @param {Object} eventData - Event data
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async create(eventData) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([{
                    title: eventData.title,
                    description: eventData.description || "",
                    date: eventData.date,
                    time: eventData.time || null,
                    end_time: eventData.end_time || eventData.endTime || null,
                    type: eventData.type || "event",
                    location: eventData.location || null,
                    recurrence: eventData.recurrence || "none",
                    is_all_day: eventData.is_all_day || eventData.isAllDay || false,
                    color: eventData.color || null,
                    employee_id: eventData.employee_id || eventData.employeeId || null,
                    created_by: eventData.created_by || eventData.createdBy || null,
                }])
                .select(`
                    *,
                    employee:employees!calendar_events_employee_id_fkey(id, name, email, avatar, department),
                    creator:employees!calendar_events_created_by_fkey(id, name, email, avatar)
                `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating calendar event:", error);
            return { data: null, error };
        }
    },

    /**
     * Update a calendar event
     * @param {string} eventId - Event ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async update(eventId, updates) {
        try {
            const updateData = {};

            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.date !== undefined) updateData.date = updates.date;
            if (updates.time !== undefined) updateData.time = updates.time;
            if (updates.end_time !== undefined) updateData.end_time = updates.end_time;
            if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
            if (updates.type !== undefined) updateData.type = updates.type;
            if (updates.location !== undefined) updateData.location = updates.location;
            if (updates.recurrence !== undefined) updateData.recurrence = updates.recurrence;
            if (updates.is_all_day !== undefined) updateData.is_all_day = updates.is_all_day;
            if (updates.isAllDay !== undefined) updateData.is_all_day = updates.isAllDay;
            if (updates.color !== undefined) updateData.color = updates.color;
            if (updates.employee_id !== undefined) updateData.employee_id = updates.employee_id;
            if (updates.employeeId !== undefined) updateData.employee_id = updates.employeeId;

            updateData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update(updateData)
                .eq("id", eventId)
                .select(`
                    *,
                    employee:employees!calendar_events_employee_id_fkey(id, name, email, avatar, department),
                    creator:employees!calendar_events_created_by_fkey(id, name, email, avatar)
                `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error updating calendar event:", error);
            return { data: null, error };
        }
    },

    /**
     * Delete a calendar event
     * @param {string} eventId - Event ID
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    async delete(eventId) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .delete()
                .eq("id", eventId);

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error("Error deleting calendar event:", error);
            return { success: false, error };
        }
    },

    /**
     * Get upcoming events
     * @param {number} limit - Number of events to return
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getUpcoming(limit = 5) {
        try {
            const today = new Date().toISOString().split("T")[0];

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select(`
                    *,
                    employee:employees!calendar_events_employee_id_fkey(id, name, email, avatar, department),
                    creator:employees!calendar_events_created_by_fkey(id, name, email, avatar)
                `)
                .gte("date", today)
                .order("date", { ascending: true })
                .order("time", { ascending: true })
                .limit(limit);

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching upcoming events:", error);
            return { data: [], error };
        }
    },

    /**
     * Get events by type
     * @param {string} type - Event type (meeting, event, birthday, etc.)
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getByType(type) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select(`
                    *,
                    employee:employees!calendar_events_employee_id_fkey(id, name, email, avatar, department),
                    creator:employees!calendar_events_created_by_fkey(id, name, email, avatar)
                `)
                .eq("type", type)
                .order("date", { ascending: true });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching events by type:", error);
            return { data: [], error };
        }
    },

    /**
     * Get event statistics
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async getStats() {
        try {
            const today = new Date().toISOString().split("T")[0];

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("type, date");

            if (error) throw error;

            const stats = {
                total: data?.length || 0,
                upcoming: 0,
                past: 0,
                byType: {}
            };

            data?.forEach((event) => {
                // Count upcoming vs past
                if (event.date >= today) {
                    stats.upcoming++;
                } else {
                    stats.past++;
                }

                // Count by type
                const type = event.type || "event";
                stats.byType[type] = (stats.byType[type] || 0) + 1;
            });

            return { data: stats, error: null };
        } catch (error) {
            console.error("Error fetching event stats:", error);
            return { data: null, error };
        }
    },
};

export default calendarService;
