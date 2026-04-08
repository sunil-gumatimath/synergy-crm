import { supabase } from "../lib/supabase";

const BUCKET = "avatars";
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const signedUrlCache = new Map();

function normalizeAvatarPath(value) {
    if (!value) return null;
    if (!value.startsWith("http")) return value;
    const marker = `/${BUCKET}/`;
    const markerIndex = value.indexOf(marker);
    if (markerIndex === -1) return value;

    const pathWithQuery = value.slice(markerIndex + marker.length);
    return pathWithQuery.split("?")[0] || null;
}

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

            // Save storage path to employee record; the client resolves signed URLs on demand.
            const { error: dbError } = await supabase
                .from("employees")
                .update({ avatar: path })
                .eq("id", employeeId);

            if (dbError) throw dbError;

            signedUrlCache.delete(path);
            const signedUrl = await this.getUrl(path, { bustCache: true });
            return { url: signedUrl || path, path, error: null };
        } catch (error) {
            console.error("Avatar upload error:", error);
            return { url: null, path: null, error };
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
                paths.forEach((path) => signedUrlCache.delete(path));
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
     * Resolve an avatar path to a signed URL for private bucket access.
     * @param {string} avatarPath - The avatar URL/path from the employee record
     * @returns {string|null}
     */
    async getUrl(avatarPath, { bustCache = false } = {}) {
        const normalizedPath = normalizeAvatarPath(avatarPath);
        if (!normalizedPath) return null;
        if (normalizedPath.startsWith("http")) return normalizedPath;

        if (!bustCache) {
            const cached = signedUrlCache.get(normalizedPath);
            if (cached && cached.expiresAt > Date.now()) {
                return cached.url;
            }
        }

        const { data, error } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS);

        if (error || !data?.signedUrl) {
            console.error("Avatar signed URL error:", error);
            return null;
        }

        signedUrlCache.set(normalizedPath, {
            url: data.signedUrl,
            expiresAt: Date.now() + ((SIGNED_URL_TTL_SECONDS - 30) * 1000),
        });

        return data.signedUrl;
    },
};
