import { supabase } from "../lib/supabase.js";

/**
 * Leave Management Service - Handles all leave-related operations
 */
export const leaveService = {
    // ========================================
    // LEAVE TYPES
    // ========================================

    /**
     * Get all leave types
     */
    async getLeaveTypes() {
        try {
            const { data, error } = await supabase
                .from("leave_types")
                .select("*")
                .order("name");

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching leave types:", error);
            return { data: [], error };
        }
    },

    // ========================================
    // LEAVE BALANCES
    // ========================================

    /**
     * Get leave balances for an employee
     */
    async getLeaveBalances(employeeId, year = new Date().getFullYear()) {
        try {
            const { data, error } = await supabase
                .from("leave_balances")
                .select(`
          *,
          leave_type:leave_types(*)
        `)
                .eq("employee_id", employeeId)
                .eq("year", year);

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching leave balances:", error);
            return { data: [], error };
        }
    },

    /**
     * Initialize leave balances for an employee
     */
    async initializeBalances(employeeId) {
        try {
            const { error } = await supabase.rpc("initialize_leave_balances", {
                p_employee_id: employeeId,
            });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error initializing balances:", error);
            return { error };
        }
    },

    // ========================================
    // LEAVE REQUESTS
    // ========================================

    /**
     * Get all leave requests with optional filters
     */
    async getLeaveRequests({
        employeeId = null,
        status = null,
        startDate = null,
        endDate = null,
        limit = 50
    } = {}) {
        try {
            let query = supabase
                .from("leave_requests")
                .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey(id, name, email, avatar, department, role),
          leave_type:leave_types(*),
          approver:employees!leave_requests_approver_id_fkey(id, name, avatar)
        `)
                .order("created_at", { ascending: false })
                .limit(limit);

            if (employeeId) {
                query = query.eq("employee_id", employeeId);
            }

            if (status) {
                query = query.eq("status", status);
            }

            if (startDate) {
                query = query.gte("start_date", startDate);
            }

            if (endDate) {
                query = query.lte("end_date", endDate);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching leave requests:", error);
            return { data: [], error };
        }
    },

    /**
     * Get pending requests for approval (for managers/admins)
     */
    async getPendingRequests() {
        return this.getLeaveRequests({ status: "pending" });
    },

    /**
     * Get a single leave request by ID
     */
    async getLeaveRequest(id) {
        try {
            const { data, error } = await supabase
                .from("leave_requests")
                .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey(id, name, email, avatar, department, role),
          leave_type:leave_types(*),
          approver:employees!leave_requests_approver_id_fkey(id, name, avatar)
        `)
                .eq("id", id)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error fetching leave request:", error);
            return { data: null, error };
        }
    },

    /**
     * Create a new leave request
     */
    async createLeaveRequest({
        employeeId,
        leaveTypeId,
        startDate,
        endDate,
        reason,
        isHalfDay = false,
        halfDayPeriod = null,
    }) {
        try {
            // Calculate total days
            const totalDays = isHalfDay ? 0.5 : this.calculateBusinessDays(startDate, endDate);

            const { data, error } = await supabase
                .from("leave_requests")
                .insert({
                    employee_id: employeeId,
                    leave_type_id: leaveTypeId,
                    start_date: startDate,
                    end_date: isHalfDay ? startDate : endDate,
                    total_days: totalDays,
                    reason,
                    is_half_day: isHalfDay,
                    half_day_period: halfDayPeriod,
                    status: "pending",
                })
                .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey(id, name, email, avatar),
          leave_type:leave_types(*)
        `)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating leave request:", error);
            return { data: null, error };
        }
    },

    /**
     * Approve a leave request
     */
    async approveRequest(requestId, approverId) {
        try {
            const { data, error } = await supabase
                .from("leave_requests")
                .update({
                    status: "approved",
                    approver_id: approverId,
                    approved_at: new Date().toISOString(),
                })
                .eq("id", requestId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error approving request:", error);
            return { data: null, error };
        }
    },

    /**
     * Reject a leave request
     */
    async rejectRequest(requestId, approverId, rejectionReason = null) {
        try {
            const { data, error } = await supabase
                .from("leave_requests")
                .update({
                    status: "rejected",
                    approver_id: approverId,
                    approved_at: new Date().toISOString(),
                    rejection_reason: rejectionReason,
                })
                .eq("id", requestId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error rejecting request:", error);
            return { data: null, error };
        }
    },

    /**
     * Cancel a leave request
     */
    async cancelRequest(requestId) {
        try {
            const { data, error } = await supabase
                .from("leave_requests")
                .update({ status: "cancelled" })
                .eq("id", requestId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error cancelling request:", error);
            return { data: null, error };
        }
    },

    /**
     * Delete a leave request (only if pending)
     */
    async deleteRequest(requestId) {
        try {
            const { error } = await supabase
                .from("leave_requests")
                .delete()
                .eq("id", requestId)
                .eq("status", "pending");

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error deleting request:", error);
            return { error };
        }
    },

    // ========================================
    // HOLIDAYS
    // ========================================

    /**
     * Get holidays for a year
     */
    async getHolidays(year = new Date().getFullYear()) {
        try {
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;

            const { data, error } = await supabase
                .from("holidays")
                .select("*")
                .gte("date", startDate)
                .lte("date", endDate)
                .order("date");

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching holidays:", error);
            return { data: [], error };
        }
    },

    /**
     * Add a new holiday
     */
    async addHoliday({ name, date, isOptional = false, description = null }) {
        try {
            const { data, error } = await supabase
                .from("holidays")
                .insert({
                    name,
                    date,
                    is_optional: isOptional,
                    description,
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error adding holiday:", error);
            return { data: null, error };
        }
    },

    /**
     * Delete a holiday
     */
    async deleteHoliday(holidayId) {
        try {
            const { error } = await supabase
                .from("holidays")
                .delete()
                .eq("id", holidayId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error deleting holiday:", error);
            return { error };
        }
    },

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    /**
     * Calculate business days between two dates (client-side)
     */
    calculateBusinessDays(startDate, endDate, holidays = []) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let count = 0;
        const holidayDates = holidays.map((h) => h.date);

        const current = new Date(start);
        while (current <= end) {
            const dayOfWeek = current.getDay();
            const dateStr = current.toISOString().split("T")[0];

            // Skip weekends (0 = Sunday, 6 = Saturday) and holidays
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(dateStr)) {
                count++;
            }

            current.setDate(current.getDate() + 1);
        }

        return count;
    },

    /**
     * Get leave statistics for an employee
     */
    async getLeaveStats(employeeId) {
        try {
            const year = new Date().getFullYear();

            // Get balances
            const { data: balances } = await this.getLeaveBalances(employeeId, year);

            // Get requests for this year
            const { data: requests } = await this.getLeaveRequests({
                employeeId,
                startDate: `${year}-01-01`,
                endDate: `${year}-12-31`,
            });

            // Calculate stats
            const totalEntitled = balances.reduce((sum, b) => sum + (b.total_days || 0), 0);
            const totalUsed = balances.reduce((sum, b) => sum + (b.used_days || 0), 0);
            const totalPending = balances.reduce((sum, b) => sum + (b.pending_days || 0), 0);
            const totalAvailable = totalEntitled - totalUsed - totalPending;

            const pendingCount = requests.filter((r) => r.status === "pending").length;
            const approvedCount = requests.filter((r) => r.status === "approved").length;
            const rejectedCount = requests.filter((r) => r.status === "rejected").length;

            return {
                data: {
                    balances,
                    totalEntitled,
                    totalUsed,
                    totalPending,
                    totalAvailable,
                    requestCounts: {
                        pending: pendingCount,
                        approved: approvedCount,
                        rejected: rejectedCount,
                        total: requests.length,
                    },
                },
                error: null,
            };
        } catch (error) {
            console.error("Error getting leave stats:", error);
            return { data: null, error };
        }
    },

    /**
     * Check if employee has enough leave balance
     */
    async checkLeaveBalance(employeeId, leaveTypeId, days) {
        try {
            const year = new Date().getFullYear();
            const { data: balances } = await this.getLeaveBalances(employeeId, year);

            const balance = balances.find((b) => b.leave_type_id === leaveTypeId);

            if (!balance) {
                return { hasBalance: false, available: 0 };
            }

            const available = balance.total_days - balance.used_days - balance.pending_days;
            return { hasBalance: available >= days, available };
        } catch (error) {
            console.error("Error checking balance:", error);
            return { hasBalance: false, available: 0 };
        }
    },
};
