import { supabase } from "../lib/supabase";


export const noteService = {
  /**
   * Get all notes for an employee
   * @param {number} employeeId - The employee ID
   * @returns {Promise<{data: Array, error: Error}>}
   */
  async getByEmployeeId(employeeId) {
    try {
      const { data, error } = await supabase
        .from("employee_notes")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error fetching notes:", error);
      return { data: [], error };
    }
  },

  /**
   * Create a new note
   * @param {Object} noteData - The note data
   * @returns {Promise<{data: Object, error: Error}>}
   */
  async create(noteData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("employee_notes")
        .insert([
          {
            ...noteData,
            created_by: user?.email || "demo@company.com",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error creating note:", error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing note
   * @param {number} id - The note ID
   * @param {Object} updates - The fields to update
   * @returns {Promise<{data: Object, error: Error}>}
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from("employee_notes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error updating note:", error);
      return { data: null, error };
    }
  },

  /**
   * Delete a note
   * @param {number} id - The note ID
   * @returns {Promise<{success: boolean, error: Error}>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from("employee_notes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting note:", error);
      return { success: false, error };
    }
  },
};

export default noteService;
