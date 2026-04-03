import { supabase } from "../lib/supabase.js";

const TABLE_NAME = "support_tickets";

/**
 * Support Service - Handles all support ticket operations
 */
export const supportService = {
    /**
     * Get all support tickets with optional filters (paginated)
     * @param {Object} options - Query options
     * @param {number} [options.page=1] - 1-indexed page
     * @param {number} [options.pageSize=20] - rows per page
     * @returns {Promise<{data: Array, count: number, error: Error|null}>}
     */
    async getAll({ page = 1, pageSize = 20, userId = null, status = null, priority = null } = {}) {
        try {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from(TABLE_NAME)
                .select(`
                    *,
                    creator:employees!support_tickets_created_by_fkey(id, name, email, avatar, department),
                    assignee:employees!support_tickets_assigned_to_fkey(id, name, email, avatar)
                `, { count: "exact" })
                .order("created_at", { ascending: false })
                .range(from, to);

            // Filter by creator if provided
            if (userId) {
                query = query.eq("created_by", userId);
            }

            // Filter by status
            if (status && status !== "all") {
                query = query.eq("status", status);
            }

            // Filter by priority
            if (priority && priority !== "all") {
                query = query.eq("priority", priority);
            }

            const { data, count, error } = await query;

            if (error) throw error;
            return { data: data || [], count: count ?? 0, error: null };
        } catch (error) {
            console.error("Error fetching support tickets:", error);
            return { data: [], count: 0, error };
        }
    },

    /**
     * Get a single support ticket by ID
     * @param {string} ticketId - Ticket ID
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async getById(ticketId) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select(`
                    *,
                    creator:employees!support_tickets_created_by_fkey(id, name, email, avatar, department),
                    assignee:employees!support_tickets_assigned_to_fkey(id, name, email, avatar)
                `)
                .eq("id", ticketId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error fetching support ticket:", error);
            return { data: null, error };
        }
    },

    /**
     * Create a new support ticket
     * @param {Object} ticketData - Ticket data
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async create(ticketData) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([{
                    title: ticketData.title,
                    description: ticketData.description || "",
                    category: ticketData.category || "general",
                    priority: ticketData.priority || "medium",
                    status: ticketData.status || "open",
                    created_by: ticketData.createdBy || null,
                    assigned_to: ticketData.assignedTo || null,
                }])
                .select(`
                    *,
                    creator:employees!support_tickets_created_by_fkey(id, name, email, avatar, department),
                    assignee:employees!support_tickets_assigned_to_fkey(id, name, email, avatar)
                `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating support ticket:", error);
            return { data: null, error };
        }
    },

    /**
     * Update a support ticket
     * @param {string} ticketId - Ticket ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async update(ticketId, updates) {
        try {
            const updateData = {};

            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.description !== undefined) updateData.description = updates.description;
            if (updates.category !== undefined) updateData.category = updates.category;
            if (updates.priority !== undefined) updateData.priority = updates.priority;
            if (updates.status !== undefined) updateData.status = updates.status;
            if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;

            // Set resolved_at if status is changing to resolved
            if (updates.status === "resolved" && !updates.resolved_at) {
                updateData.resolved_at = new Date().toISOString();
            }

            updateData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update(updateData)
                .eq("id", ticketId)
                .select(`
                    *,
                    creator:employees!support_tickets_created_by_fkey(id, name, email, avatar, department),
                    assignee:employees!support_tickets_assigned_to_fkey(id, name, email, avatar)
                `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error updating support ticket:", error);
            return { data: null, error };
        }
    },

    /**
     * Update ticket status
     * @param {string} ticketId - Ticket ID
     * @param {string} newStatus - New status
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async updateStatus(ticketId, newStatus) {
        return this.update(ticketId, { status: newStatus });
    },

    /**
     * Delete a support ticket
     * @param {string} ticketId - Ticket ID
     * @returns {Promise<{success: boolean, error: Error|null}>}
     */
    async delete(ticketId) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .delete()
                .eq("id", ticketId);

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error("Error deleting support ticket:", error);
            return { success: false, error };
        }
    },

    /**
     * Get ticket statistics
     * @param {string} userId - Optional user ID to filter by
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async getStats(userId = null) {
        try {
            let query = supabase
                .from(TABLE_NAME)
                .select("status, priority");

            if (userId) {
                query = query.eq("created_by", userId);
            }

            const { data, error } = await query;

            if (error) throw error;

            const stats = {
                total: data?.length || 0,
                byStatus: {
                    open: 0,
                    in_progress: 0,
                    resolved: 0,
                    closed: 0,
                },
                byPriority: {
                    low: 0,
                    medium: 0,
                    high: 0,
                    urgent: 0,
                },
            };

            data?.forEach((ticket) => {
                if (ticket.status && stats.byStatus[ticket.status] !== undefined) {
                    stats.byStatus[ticket.status]++;
                }
                if (ticket.priority && stats.byPriority[ticket.priority] !== undefined) {
                    stats.byPriority[ticket.priority]++;
                }
            });

            return { data: stats, error: null };
        } catch (error) {
            console.error("Error fetching ticket stats:", error);
            return { data: null, error };
        }
    },
};

export default supportService;
