import { supabase } from "../lib/supabase";
import { authService } from "./authService";

const TABLE_NAME = "employees";
const EMPLOYEE_SELECT = `
  *,
  private_details:employee_private_details(*)
`;

/**
 * Sanitize user input for PostgREST filter strings.
 * Strips characters that have special meaning in PostgREST filter syntax
 * (commas, dots, parens, colons, asterisks) to prevent filter injection.
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input safe for .or() filters
 */
function sanitizeFilterInput(input) {
  if (!input) return "";
  return input.replace(/[,.()*:]/g, "");
}

function flattenEmployeeRecord(record) {
  if (!record) return record;
  const privateDetails = Array.isArray(record.private_details)
    ? record.private_details[0]
    : record.private_details;

  return {
    ...record,
    ...(privateDetails || {}),
    private_details: privateDetails || null,
  };
}

function flattenEmployeeRecords(records) {
  return (records || []).map(flattenEmployeeRecord);
}

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
        .select(EMPLOYEE_SELECT, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: flattenEmployeeRecords(data), count, error: null };
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
        .select(EMPLOYEE_SELECT)
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data: flattenEmployeeRecord(data), error: null };
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
      const { data: createdEmployee, error } = await supabase
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
            join_date:
              employeeData.joinDate || new Date().toISOString().split("T")[0],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const { error: privateError } = await supabase
        .from("employee_private_details")
        .upsert({
          employee_id: createdEmployee.id,
          phone: employeeData.phone || null,
          address: employeeData.address || null,
          location: employeeData.location || null,
          salary: employeeData.salary || 0,
          performance_score: employeeData.performance_score || 0,
          employment_type: employeeData.employment_type || "Full-time",
          manager: employeeData.manager || null,
          projects_completed: employeeData.projects_completed || 0,
          bank_details: employeeData.bank_details || null,
          education: employeeData.education || [],
        });

      if (privateError) throw privateError;

      const { data } = await this.getById(createdEmployee.id);
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
      const employeeUpdates = {};
      const privateUpdates = {};

      if (updates.name !== undefined) employeeUpdates.name = updates.name;
      if (updates.email !== undefined) employeeUpdates.email = updates.email;
      if (updates.role !== undefined) employeeUpdates.role = updates.role;
      if (updates.department !== undefined)
        employeeUpdates.department = updates.department;
      if (updates.status !== undefined) employeeUpdates.status = updates.status;
      if (updates.gender !== undefined) employeeUpdates.gender = updates.gender;
      if (updates.joinDate !== undefined)
        employeeUpdates.join_date = updates.joinDate;
      if (updates.avatar !== undefined) employeeUpdates.avatar = updates.avatar;

      if (updates.phone !== undefined) privateUpdates.phone = updates.phone;
      if (updates.address !== undefined) privateUpdates.address = updates.address;
      if (updates.salary !== undefined) privateUpdates.salary = updates.salary;
      if (updates.location !== undefined) privateUpdates.location = updates.location;
      if (updates.manager !== undefined) privateUpdates.manager = updates.manager;
      if (updates.employment_type !== undefined)
        privateUpdates.employment_type = updates.employment_type;
      if (updates.projects_completed !== undefined)
        privateUpdates.projects_completed = updates.projects_completed;
      if (updates.bank_details !== undefined)
        privateUpdates.bank_details = updates.bank_details;
      if (updates.education !== undefined) privateUpdates.education = updates.education;
      if (updates.performance_score !== undefined)
        privateUpdates.performance_score = updates.performance_score;

      if (privateUpdates.salary === "") privateUpdates.salary = null;
      if (employeeUpdates.join_date === "") employeeUpdates.join_date = null;
      if (privateUpdates.phone === "") privateUpdates.phone = null;
      if (privateUpdates.address === "") privateUpdates.address = null;
      if (privateUpdates.location === "") privateUpdates.location = null;
      if (privateUpdates.manager === "") privateUpdates.manager = null;

      let updatedEmployee = null;
      if (Object.keys(employeeUpdates).length > 0) {
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .update(employeeUpdates)
          .eq("id", id)
          .select("id, user_id")
          .single();

        if (error) throw error;
        updatedEmployee = data;
      } else {
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select("id, user_id")
          .eq("id", id)
          .single();

        if (error) throw error;
        updatedEmployee = data;
      }

      if (Object.keys(privateUpdates).length > 0) {
        const { error } = await supabase
          .from("employee_private_details")
          .upsert({ employee_id: id, ...privateUpdates });

        if (error) throw error;
      }

      // If email was changed, also sync it to auth.users so the employee
      // can log in with their new email address
      if (employeeUpdates.email && updatedEmployee.user_id) {
        const { error: emailSyncError } = await supabase.rpc(
          "admin_update_auth_email",
          { target_user_id: updatedEmployee.user_id, new_email: employeeUpdates.email },
        );
        if (emailSyncError) {
          console.warn(
            "Employee updated but failed to sync email to auth:",
            emailSyncError.message,
          );
        }
      }

      const { data } = await this.getById(id);
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

      // Sanitize input to prevent PostgREST filter injection
      const safeQuery = sanitizeFilterInput(query);
      if (!safeQuery) {
        return { data: [], count: 0, error: null };
      }

      const { data, error, count } = await supabase
        .from(TABLE_NAME)
        .select(EMPLOYEE_SELECT, { count: "exact" })
        .or(
          `name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,department.ilike.%${safeQuery}%`,
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: flattenEmployeeRecords(data), count, error: null };
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

      let query = supabase.from(TABLE_NAME).select(EMPLOYEE_SELECT, { count: "exact" });

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
      return { data: flattenEmployeeRecords(data), count, error: null };
    } catch (error) {
      console.error("Error filtering employees:", error);
      return { data: null, count: 0, error };
    }
  },
};
