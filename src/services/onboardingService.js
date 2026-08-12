import { supabase } from "../lib/supabase.js";

const WORKFLOWS_TABLE = "onboarding_workflows";
const TASKS_TABLE = "onboarding_tasks";

const TASK_SELECT = `
    *,
    employee:employees!onboarding_tasks_employee_id_fkey(id, name, email, avatar, department),
    assigned:employees!onboarding_tasks_assigned_to_fkey(id, name, email, avatar, department)
`;

/**
 * Onboarding Service - Manage onboarding workflows and their tasks
 */
export const onboardingService = {
    /**
     * Get all onboarding workflows with their tasks (for progress tracking)
     */
    async getWorkflows() {
        try {
            const { data, error } = await supabase
                .from(WORKFLOWS_TABLE)
                .select(`*, tasks:${TASKS_TABLE}(id, status)`)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching onboarding workflows:", error);
            return { data: [], error };
        }
    },

    /**
     * Get a single workflow by ID
     */
    async getWorkflowById(workflowId) {
        try {
            const { data, error } = await supabase
                .from(WORKFLOWS_TABLE)
                .select("*")
                .eq("id", workflowId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error fetching onboarding workflow:", error);
            return { data: null, error };
        }
    },

    /**
     * Create a new onboarding workflow
     */
    async createWorkflow(workflowData) {
        try {
            const { data, error } = await supabase
                .from(WORKFLOWS_TABLE)
                .insert([{
                    name: workflowData.name,
                    description: workflowData.description || null,
                    department: workflowData.department || null,
                    is_active: workflowData.is_active !== false,
                }])
                .select("*")
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating onboarding workflow:", error);
            return { data: null, error };
        }
    },

    /**
     * Update an onboarding workflow
     */
    async updateWorkflow(workflowId, updates) {
        try {
            const { data, error } = await supabase
                .from(WORKFLOWS_TABLE)
                .update(updates)
                .eq("id", workflowId)
                .select("*")
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error updating onboarding workflow:", error);
            return { data: null, error };
        }
    },

    /**
     * Delete an onboarding workflow (cascades to its tasks)
     */
    async deleteWorkflow(workflowId) {
        try {
            const { error } = await supabase
                .from(WORKFLOWS_TABLE)
                .delete()
                .eq("id", workflowId);

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error("Error deleting onboarding workflow:", error);
            return { success: false, error };
        }
    },

    /**
     * Get tasks for a workflow with linked employee info
     */
    async getTasks(workflowId) {
        try {
            const { data, error } = await supabase
                .from(TASKS_TABLE)
                .select(TASK_SELECT)
                .eq("workflow_id", workflowId)
                .order("order_index", { ascending: true })
                .order("created_at", { ascending: true });

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching onboarding tasks:", error);
            return { data: [], error };
        }
    },

    /**
     * Create a task in a workflow
     */
    async createTask(taskData) {
        try {
            const { data, error } = await supabase
                .from(TASKS_TABLE)
                .insert([{
                    workflow_id: taskData.workflow_id,
                    title: taskData.title,
                    description: taskData.description || null,
                    category: taskData.category || "general",
                    assigned_to: taskData.assigned_to || null,
                    employee_id: taskData.employee_id || null,
                    due_days: taskData.due_days ?? 7,
                    due_date: taskData.due_date || null,
                    status: taskData.status || "pending",
                    order_index: taskData.order_index || 0,
                }])
                .select(TASK_SELECT)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating onboarding task:", error);
            return { data: null, error };
        }
    },

    /**
     * Update an onboarding task
     */
    async updateTask(taskId, updates) {
        try {
            const { data, error } = await supabase
                .from(TASKS_TABLE)
                .update(updates)
                .eq("id", taskId)
                .select(TASK_SELECT)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error updating onboarding task:", error);
            return { data: null, error };
        }
    },

    /**
     * Delete an onboarding task
     */
    async deleteTask(taskId) {
        try {
            const { error } = await supabase
                .from(TASKS_TABLE)
                .delete()
                .eq("id", taskId);

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error("Error deleting onboarding task:", error);
            return { success: false, error };
        }
    },

    /**
     * Get onboarding statistics
     */
    async getStats() {
        try {
            const [workflowsRes, tasksRes] = await Promise.all([
                supabase.from(WORKFLOWS_TABLE).select("id, is_active"),
                supabase.from(TASKS_TABLE).select("id, status"),
            ]);

            if (workflowsRes.error) throw workflowsRes.error;
            if (tasksRes.error) throw tasksRes.error;

            const workflows = workflowsRes.data || [];
            const tasks = tasksRes.data || [];

            return {
                data: {
                    totalWorkflows: workflows.length,
                    activeWorkflows: workflows.filter(w => w.is_active).length,
                    totalTasks: tasks.length,
                    pending: tasks.filter(t => t.status === "pending").length,
                    inProgress: tasks.filter(t => t.status === "in_progress").length,
                    completed: tasks.filter(t => t.status === "completed").length,
                },
                error: null,
            };
        } catch (error) {
            console.error("Error fetching onboarding stats:", error);
            return { data: null, error };
        }
    },
};

export default onboardingService;