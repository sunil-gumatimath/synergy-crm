import { supabase } from "../lib/supabase.js";

/**
 * Time Tracking Service - Handles clock in/out and timesheet operations
 */
export const timeTrackingService = {
    // ========================================
    // CLOCK IN/OUT
    // ========================================

    /**
     * Get today's time entry for employee
     */
    async getTodayEntry(employeeId) {
        try {
            const today = new Date().toISOString().split("T")[0];
            const { data, error } = await supabase
                .from("time_entries")
                .select("*")
                .eq("employee_id", employeeId)
                .eq("date", today)
                .maybeSingle();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error fetching today's entry:", error);
            return { data: null, error };
        }
    },

    /**
     * Clock in for today
     */
    async clockIn(employeeId, notes = null, location = null) {
        try {
            const today = new Date().toISOString().split("T")[0];

            // Check if already clocked in
            const { data: existing } = await this.getTodayEntry(employeeId);
            if (existing) {
                throw new Error("Already clocked in today");
            }

            const { data, error } = await supabase
                .from("time_entries")
                .insert({
                    employee_id: employeeId,
                    date: today,
                    clock_in: new Date().toISOString(),
                    notes,
                    location,
                    status: "active",
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error clocking in:", error);
            return { data: null, error };
        }
    },

    /**
     * Clock out for today
     */
    async clockOut(employeeId, notes = null) {
        try {
            const today = new Date().toISOString().split("T")[0];

            const { data, error } = await supabase
                .from("time_entries")
                .update({
                    clock_out: new Date().toISOString(),
                    status: "completed",
                    notes,
                })
                .eq("employee_id", employeeId)
                .eq("date", today)
                .is("clock_out", null)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error clocking out:", error);
            return { data: null, error };
        }
    },

    /**
     * Add break time
     */
    async addBreak(entryId, breakMinutes) {
        try {
            const { data, error } = await supabase
                .from("time_entries")
                .update({
                    break_minutes: breakMinutes,
                })
                .eq("id", entryId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error adding break:", error);
            return { data: null, error };
        }
    },

    // ========================================
    // TIME ENTRIES
    // ========================================

    /**
     * Get time entries for a date range
     */
    async getTimeEntries({
        employeeId = null,
        startDate = null,
        endDate = null,
        limit = 50,
    } = {}) {
        try {
            let query = supabase
                .from("time_entries")
                .select(`
          *,
          employee:employees(id, name, email, avatar, department)
        `)
                .order("date", { ascending: false })
                .limit(limit);

            if (employeeId) {
                query = query.eq("employee_id", employeeId);
            }

            if (startDate) {
                query = query.gte("date", startDate);
            }

            if (endDate) {
                query = query.lte("date", endDate);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching time entries:", error);
            return { data: [], error };
        }
    },

    /**
     * Update a time entry (for adjustments)
     */
    async updateTimeEntry(entryId, updates) {
        try {
            const { data, error } = await supabase
                .from("time_entries")
                .update({
                    ...updates,
                    status: "adjusted",
                })
                .eq("id", entryId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error updating time entry:", error);
            return { data: null, error };
        }
    },

    // ========================================
    // WEEKLY/MONTHLY REPORTS
    // ========================================

    /**
     * Get weekly hours summary
     */
    async getWeeklySummary(employeeId, weekStartDate = null) {
        try {
            // Default to current week's Monday
            if (!weekStartDate) {
                const today = new Date();
                const dayOfWeek = today.getDay();
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const monday = new Date(today);
                monday.setDate(today.getDate() + mondayOffset);
                weekStartDate = monday.toISOString().split("T")[0];
            }

            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6);
            const endDate = weekEndDate.toISOString().split("T")[0];

            const { data, error } = await supabase
                .from("time_entries")
                .select("*")
                .eq("employee_id", employeeId)
                .gte("date", weekStartDate)
                .lte("date", endDate)
                .order("date");

            if (error) throw error;

            // Process data into daily breakdown
            const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const dailyData = weekDays.map((day, index) => {
                const date = new Date(weekStartDate);
                date.setDate(date.getDate() + index);
                const dateStr = date.toISOString().split("T")[0];

                const entry = data?.find((e) => e.date === dateStr);
                return {
                    day,
                    date: dateStr,
                    hours: entry?.total_hours || 0,
                    clockIn: entry?.clock_in,
                    clockOut: entry?.clock_out,
                    status: entry?.status,
                };
            });

            const totalHours = dailyData.reduce((sum, d) => sum + (d.hours || 0), 0);
            const workingDays = dailyData.filter((d) => d.hours > 0).length;

            return {
                data: {
                    weekStart: weekStartDate,
                    weekEnd: endDate,
                    dailyData,
                    totalHours: Math.round(totalHours * 100) / 100,
                    workingDays,
                    averageHoursPerDay: workingDays > 0 ? Math.round((totalHours / workingDays) * 100) / 100 : 0,
                },
                error: null,
            };
        } catch (error) {
            console.error("Error fetching weekly summary:", error);
            return { data: null, error };
        }
    },

    /**
     * Get monthly summary
     */
    async getMonthlySummary(employeeId, year = null, month = null) {
        try {
            const now = new Date();
            year = year || now.getFullYear();
            month = month || now.getMonth() + 1;

            const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
            const endDate = new Date(year, month, 0).toISOString().split("T")[0];

            const { data, error } = await supabase
                .from("time_entries")
                .select("*")
                .eq("employee_id", employeeId)
                .gte("date", startDate)
                .lte("date", endDate)
                .order("date");

            if (error) throw error;

            const totalHours = data?.reduce((sum, e) => sum + (e.total_hours || 0), 0) || 0;
            const workingDays = data?.filter((e) => e.total_hours > 0).length || 0;
            const overtimeHours = Math.max(0, totalHours - workingDays * 8);

            return {
                data: {
                    year,
                    month,
                    startDate,
                    endDate,
                    entries: data || [],
                    totalHours: Math.round(totalHours * 100) / 100,
                    workingDays,
                    regularHours: Math.min(totalHours, workingDays * 8),
                    overtimeHours: Math.round(overtimeHours * 100) / 100,
                },
                error: null,
            };
        } catch (error) {
            console.error("Error fetching monthly summary:", error);
            return { data: null, error };
        }
    },

    // ========================================
    // WORK SCHEDULE
    // ========================================

    /**
     * Get work schedule for employee
     */
    async getWorkSchedule(employeeId) {
        try {
            const { data, error } = await supabase
                .from("work_schedules")
                .select("*")
                .eq("employee_id", employeeId)
                .order("day_of_week");

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching work schedule:", error);
            return { data: [], error };
        }
    },

    /**
     * Update work schedule
     */
    async updateWorkSchedule(employeeId, schedules) {
        try {
            // Upsert all schedule entries
            const { data, error } = await supabase
                .from("work_schedules")
                .upsert(
                    schedules.map((s) => ({
                        employee_id: employeeId,
                        ...s,
                    })),
                    { onConflict: "employee_id,day_of_week" }
                )
                .select();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error updating work schedule:", error);
            return { data: null, error };
        }
    },

    // ========================================
    // OVERTIME
    // ========================================

    /**
     * Get overtime records
     */
    async getOvertimeRecords({
        employeeId = null,
        status = null,
        startDate = null,
        endDate = null,
    } = {}) {
        try {
            let query = supabase
                .from("overtime_records")
                .select(`
          *,
          employee:employees(id, name, email, avatar),
          approver:employees!overtime_records_approved_by_fkey(id, name)
        `)
                .order("date", { ascending: false });

            if (employeeId) {
                query = query.eq("employee_id", employeeId);
            }

            if (status) {
                query = query.eq("status", status);
            }

            if (startDate) {
                query = query.gte("date", startDate);
            }

            if (endDate) {
                query = query.lte("date", endDate);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching overtime records:", error);
            return { data: [], error };
        }
    },

    /**
     * Create overtime record
     */
    async createOvertimeRecord({ employeeId, timeEntryId, date, hours, type = "regular" }) {
        try {
            const multipliers = {
                regular: 1.5,
                weekend: 2.0,
                holiday: 2.5,
            };

            const { data, error } = await supabase
                .from("overtime_records")
                .insert({
                    employee_id: employeeId,
                    time_entry_id: timeEntryId,
                    date,
                    overtime_hours: hours,
                    overtime_type: type,
                    multiplier: multipliers[type] || 1.5,
                    status: "pending",
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error creating overtime record:", error);
            return { data: null, error };
        }
    },

    /**
     * Approve overtime record
     */
    async approveOvertime(overtimeId, approverId) {
        try {
            const { data, error } = await supabase
                .from("overtime_records")
                .update({
                    status: "approved",
                    approved_by: approverId,
                    approved_at: new Date().toISOString(),
                })
                .eq("id", overtimeId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error approving overtime:", error);
            return { data: null, error };
        }
    },

    // ========================================
    // UTILITIES
    // ========================================

    /**
     * Format duration from hours
     */
    formatDuration(hours) {
        if (!hours) return "0h 0m";
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    },

    /**
     * Format time from ISO string
     */
    formatTime(isoString) {
        if (!isoString) return "--:--";
        return new Date(isoString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    },

    /**
     * Calculate elapsed time since clock in
     */
    getElapsedTime(clockInTime) {
        if (!clockInTime) return 0;
        const now = new Date();
        const clockIn = new Date(clockInTime);
        return (now - clockIn) / (1000 * 60 * 60); // hours
    },
};
