import { supabase } from "../lib/supabase.js";

const TABLE_NAME = "tasks";

/**
 * Task Service - Comprehensive task management operations
 */
export const taskService = {
    /**
     * Get all tasks with assignee info (paginated)
     * @param {Object} options - Filters and pagination
     * @param {number} [options.page=1] - 1-indexed page
     * @param {number} [options.pageSize=20] - rows per page
     * @returns {Promise<{data: Array, count: number, error: Error|null}>}
     */
    async getAll({ page = 1, pageSize = 20, ...filters } = {}) {
        try {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from(TABLE_NAME)
                .select(`
          *,
          assignee:employees(id, name, email, avatar, department)
        `, { count: "exact" })
                .order("created_at", { ascending: false })
                .range(from, to);

            // Apply filters
            if (filters.status && filters.status !== "all") {
                query = query.eq("status", filters.status);
            }
            if (filters.priority && filters.priority !== "all") {
                query = query.eq("priority", filters.priority);
            }
            if (filters.assignee_id) {
                query = query.eq("assignee_id", filters.assignee_id);
            }

            const { data, count, error } = await query;

            if (error) throw error;
            return { data: data || [], count: count ?? 0, error: null };
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return { data: [], count: 0, error };
        }
    },

    /**
     * Get tasks for a specific employee
     */
    async getByEmployee(employeeId) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select(`
          *,
          assignee:employees(id, name, email, avatar, department)
        `)
                .eq("assignee_id", employeeId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching employee tasks:", error);
            return { data: [], error };
        }
    },

    /**
     * Get a single task by ID
     */
    async getById(taskId) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select(`
          *,
          assignee:employees(id, name, email, avatar, department)
        `)
                .eq("id", taskId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error fetching task:", error);
            return { data: null, error };
        }
    },

    /**
     * Create a new task
     */
    async create(taskData) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([{
                    title: taskData.title,
                    description: taskData.description || null,
                    status: taskData.status || "To Do",
                    priority: taskData.priority || "Medium",
                    assignee_id: taskData.assignee_id || null,
                    due_date: taskData.due_date || null,
                    tags: taskData.tags || [],
                }])
                .select(`
          *,
          assignee:employees(id, name, email, avatar, department)
        `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating task:", error);
            return { data: null, error };
        }
    },

    /**
     * Update a task
     */
    async update(taskId, updates) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update(updates)
                .eq("id", taskId)
                .select(`
          *,
          assignee:employees(id, name, email, avatar, department)
        `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error updating task:", error);
            return { data: null, error };
        }
    },

    /**
     * Update task status
     */
    async updateStatus(taskId, newStatus) {
        return this.update(taskId, { status: newStatus });
    },

    /**
     * Delete a task
     */
    async delete(taskId) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .delete()
                .eq("id", taskId);

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error("Error deleting task:", error);
            return { success: false, error };
        }
    },

    /**
     * Get task statistics
     */
    async getStats() {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("status, priority");

            if (error) throw error;

            const stats = {
                total: data?.length || 0,
                byStatus: {
                    "To Do": 0,
                    "In Progress": 0,
                    "Review": 0,
                    "Done": 0
                },
                byPriority: {
                    "Low": 0,
                    "Medium": 0,
                    "High": 0,
                    "Urgent": 0
                }
            };

            data?.forEach(task => {
                if (task.status && stats.byStatus[task.status] !== undefined) {
                    stats.byStatus[task.status]++;
                }
                if (task.priority && stats.byPriority[task.priority] !== undefined) {
                    stats.byPriority[task.priority]++;
                }
            });

            return { data: stats, error: null };
        } catch (error) {
            console.error("Error fetching task stats:", error);
            return { data: null, error };
        }
    }
};

export default taskService;
