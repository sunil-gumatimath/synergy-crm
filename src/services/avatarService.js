import { supabase } from "../lib/supabase";

const BUCKET = "avatars";

/**
 * Avatar Service — Upload, retrieve, and remove profile photos via Supabase Storage
 */
export const avatarService = {
    /**
     * Upload a profile photo for an employee
     * @param {string} employeeId - Employee UUID
     * @param {File}   file       - Image file (jpeg/png/webp/gif, max 2 MB)
     * @returns {Promise<{url: string|null, error: Error|null}>}
     */
    async upload(employeeId, file) {
        try {
            const ext = file.name.split(".").pop().toLowerCase();
            const path = `${employeeId}/profile.${ext}`;

            // Upload (upsert to overwrite existing)
            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(path, file, { upsert: true, contentType: file.type });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
            const publicUrl = `${data.publicUrl}?t=${Date.now()}`; // cache-bust

            // Save URL to employee record
            const { error: dbError } = await supabase
                .from("employees")
                .update({ avatar: publicUrl })
                .eq("id", employeeId);

            if (dbError) throw dbError;

            return { url: publicUrl, error: null };
        } catch (error) {
            console.error("Avatar upload error:", error);
            return { url: null, error };
        }
    },

    /**
     * Remove the profile photo for an employee
     * @param {string} employeeId - Employee UUID
     * @returns {Promise<{error: Error|null}>}
     */
    async remove(employeeId) {
        try {
            // List files in the employee's avatar folder
            const { data: files, error: listError } = await supabase.storage
                .from(BUCKET)
                .list(employeeId);

            if (listError) throw listError;

            if (files && files.length > 0) {
                const paths = files.map((f) => `${employeeId}/${f.name}`);
                const { error: removeError } = await supabase.storage
                    .from(BUCKET)
                    .remove(paths);
                if (removeError) throw removeError;
            }

            // Clear avatar URL from employee record
            const { error: dbError } = await supabase
                .from("employees")
                .update({ avatar: null })
                .eq("id", employeeId);

            if (dbError) throw dbError;

            return { error: null };
        } catch (error) {
            console.error("Avatar remove error:", error);
            return { error };
        }
    },

    /**
     * Get the public URL for an employee's avatar
     * Returns null if the employee has no avatar column value
     * @param {string} avatarPath - The avatar URL/path from the employee record
     * @returns {string|null}
     */
    getUrl(avatarPath) {
        if (!avatarPath) return null;
        // If it's already a full URL, return as-is
        if (avatarPath.startsWith("http")) return avatarPath;
        // Otherwise construct from storage
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(avatarPath);
        return data.publicUrl;
    },
};
