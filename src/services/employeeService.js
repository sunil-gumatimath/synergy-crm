import { supabase } from "../lib/supabase";
import { authService } from "./authService";

const TABLE_NAME = "employees";

/**
 * Employee Service - Handles all CRUD operations for employees
 */
export const employeeService = {
  /**
   * Fetch employees with optional pagination
   * @param {Object} [options] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.pageSize=50] - Rows per page
   * @returns {Promise<{data: Array, count: number|null, error: Error|null}>}
   */
  async getAll({ page = 1, pageSize = 50 } = {}) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from(TABLE_NAME)
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data, count, error: null };
    } catch (error) {
      console.error("Error fetching employees:", error);
      return { data: [], count: 0, error };
    }
  },

  /**
   * Get a single employee by ID
   * @param {number} id - Employee ID
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching employee:", error);
      return { data: null, error };
    }
  },

  /**
   * Create a new employee
   * 1. Pre-check: ensure email doesn't already exist in employees table
   * 2. Create a Supabase Auth user so the employee can log in
   * 3. Insert an employee row linked to that auth user
   * 4. Roll back auth user if employee insert fails
   * @param {Object} employeeData - Employee data (includes password)
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async create(employeeData) {
    let createdUserId = null;

    try {
      // Step 1: Pre-check — make sure the email isn't already in the employees table
      const { data: existing } = await supabase
        .from(TABLE_NAME)
        .select("id")
        .eq("email", employeeData.email)
        .maybeSingle();

      if (existing) {
        throw new Error("An employee with this email already exists.");
      }

      // Step 2: Create the auth user so the employee can log in
      const { userId, error: authError } = await authService.adminCreateUser(
        employeeData.email,
        employeeData.password,
        {
          full_name: employeeData.name,
          role: employeeData.role,
        },
      );

      if (authError) throw authError;
      createdUserId = userId;

      // Step 3: Insert the employee record, linking it to the auth user
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([
          {
            user_id: userId,
            name: employeeData.name,
            email: employeeData.email,
            role: employeeData.role,
            department: employeeData.department,
            status: employeeData.status || "Active",
            gender: employeeData.gender || "other",
            avatar: null,
            phone: employeeData.phone || null,
            address: employeeData.address || null,
            salary: employeeData.salary || 0,
            join_date:
              employeeData.joinDate || new Date().toISOString().split("T")[0],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      // Roll back: if auth user was created but employee insert failed, clean up
      if (createdUserId) {
        await supabase
          .rpc("admin_delete_auth_user", { target_user_id: createdUserId })
          .catch((e) =>
            console.warn("Failed to roll back auth user:", e.message),
          );
      }
      console.error("Error creating employee:", error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing employee
   * If email changes, also syncs the new email to auth.users
   * @param {string} id - Employee ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async update(id, updates) {
    try {
      const updateData = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.department !== undefined)
        updateData.department = updates.department;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.gender !== undefined) updateData.gender = updates.gender;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.salary !== undefined) updateData.salary = updates.salary;
      if (updates.joinDate !== undefined)
        updateData.join_date = updates.joinDate;
      // New fields
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.manager !== undefined) updateData.manager = updates.manager;
      if (updates.employment_type !== undefined) updateData.employment_type = updates.employment_type;
      if (updates.projects_completed !== undefined) updateData.projects_completed = updates.projects_completed;
      if (updates.bank_details !== undefined) updateData.bank_details = updates.bank_details;
      if (updates.education !== undefined) updateData.education = updates.education;
      if (updates.performance_score !== undefined) updateData.performance_score = updates.performance_score;

      // Handle type casting edge cases for PostgreSQL when resetting form fields
      if (updateData.salary === "") updateData.salary = null;
      if (updateData.join_date === "") updateData.join_date = null;

      // Normalize optional text fields
      if (updateData.phone === "") updateData.phone = null;
      if (updateData.address === "") updateData.address = null;
      if (updateData.location === "") updateData.location = null;
      if (updateData.manager === "") updateData.manager = null;

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // If email was changed, also sync it to auth.users so the employee
      // can log in with their new email address
      if (updateData.email && data.user_id) {
        const { error: emailSyncError } = await supabase.rpc(
          "admin_update_auth_email",
          { target_user_id: data.user_id, new_email: updateData.email },
        );
        if (emailSyncError) {
          console.warn(
            "Employee updated but failed to sync email to auth:",
            emailSyncError.message,
          );
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error updating employee:", error);
      return { data: null, error };
    }
  },

  /**
   * Delete an employee and their auth account
   * 1. Fetch the employee to get their user_id
   * 2. Delete the employee row
   * 3. Delete the associated auth user so they can't log in anymore
   * @param {string} id - Employee ID
   * @returns {Promise<{success: boolean, error: Error|null}>}
   */
  async delete(id) {
    try {
      // Step 1: Get the employee's user_id before deleting
      const { data: employee, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select("user_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const authUserId = employee?.user_id;

      // Step 2: Delete the employee row
      const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
      if (error) throw error;

      // Step 3: Clean up the auth user (if one was linked)
      if (authUserId) {
        const { error: authDeleteError } = await supabase.rpc(
          "admin_delete_auth_user",
          { target_user_id: authUserId },
        );
        if (authDeleteError) {
          // Log but don't fail — the employee was already deleted
          console.warn(
            "Employee deleted but failed to remove auth account:",
            authDeleteError.message,
          );
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting employee:", error);
      return { success: false, error };
    }
  },

  /**
   * Search employees by name, email, or department
   * @param {string} query - Search query
   * @param {Object} [options] - Pagination options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.pageSize=50] - Rows per page
   * @returns {Promise<{data: Array, count: number|null, error: Error|null}>}
   */
  async search(query, { page = 1, pageSize = 50 } = {}) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from(TABLE_NAME)
        .select("*", { count: "exact" })
        .or(
          `name.ilike.%${query}%,email.ilike.%${query}%,department.ilike.%${query}%`,
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data, count, error: null };
    } catch (error) {
      console.error("Error searching employees:", error);
      return { data: null, count: 0, error };
    }
  },

  /**
   * Filter employees by department and/or status
   * @param {Object} filters - Filter criteria
   * @param {number} [filters.page=1] - Page number
   * @param {number} [filters.pageSize=50] - Rows per page
   * @returns {Promise<{data: Array, count: number|null, error: Error|null}>}
   */
  async filter({ page = 1, pageSize = 50, ...filters } = {}) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from(TABLE_NAME).select("*", { count: "exact" });

      if (filters.department) {
        query = query.eq("department", filters.department);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data, count, error: null };
    } catch (error) {
      console.error("Error filtering employees:", error);
      return { data: null, count: 0, error };
    }
  },
};
