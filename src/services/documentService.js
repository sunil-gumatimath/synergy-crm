import { supabase } from "../lib/supabase";
const STORAGE_BUCKET = "employee-documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file extensions for document uploads (security: prevents .exe, .html, .svg XSS vectors)
const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "rtf", "ppt", "pptx",
  "jpg", "jpeg", "png", "gif", "webp", "bmp",
];

// Allowed MIME types (secondary validation alongside extension check)
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "text/plain",
  "application/rtf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
];

function extractStoragePath(fileRef) {
  if (!fileRef) return null;
  if (!fileRef.startsWith("http")) return fileRef;
  const marker = `/${STORAGE_BUCKET}/`;
  const idx = fileRef.indexOf(marker);
  if (idx === -1) return null;
  return fileRef.slice(idx + marker.length);
}

export const documentService = {
  /**
   * Get all documents for an employee
   * @param {number} employeeId - The employee ID
   * @returns {Promise<{data: Array, error: Error}>}
   */
  async getByEmployeeId(employeeId) {
    try {
      const { data, error } = await supabase
        .from("employee_documents")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error fetching documents:", error);
      return { data: [], error };
    }
  },

  /**
   * Upload a document
   * @param {number} employeeId - The employee ID
   * @param {File} file - The file to upload
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<{data: Object, error: Error}>}
   */
  async upload(employeeId, file, metadata = {}) {
    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        );
      }

      // Validate file extension (security: prevents .exe, .html, .svg uploads)
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
        throw new Error(
          `File type ".${fileExt || "unknown"}" is not allowed. Accepted types: ${ALLOWED_EXTENSIONS.join(", ")}`,
        );
      }

      // Secondary MIME type check (can be spoofed, but adds defense-in-depth)
      if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error(
          `File MIME type "${file.type}" is not allowed.`,
        );
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      let uploaderEmployeeId = null;
      if (user?.id) {
        const { data: uploader } = await supabase
          .from("employees")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        uploaderEmployeeId = uploader?.id || null;
      }

      // Create unique file name (reuses fileExt validated above)
      const fileName = `${employeeId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { data, error } = await supabase
        .from("employee_documents")
        .insert([
          {
            employee_id: employeeId,
            name: file.name,
            type: metadata.type || "other",
            file_url: fileName,
            file_size: file.size,
            uploaded_by: uploaderEmployeeId,
          },
        ])
        .select()
        .single();

      if (error) {
        await supabase.storage.from(STORAGE_BUCKET).remove([fileName]);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error uploading document:", error);
      return { data: null, error };
    }
  },

  /**
   * Delete a document
   * @param {number} id - The document ID
   * @returns {Promise<{success: boolean, error: Error}>}
   */
  async delete(id) {
    try {
      const { data: doc, error: fetchError } = await supabase
        .from("employee_documents")
        .select("file_url")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const filePath = extractStoragePath(doc.file_url);

      if (filePath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      }

      const { error } = await supabase
        .from("employee_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting document:", error);
      return { success: false, error };
    }
  },

  /**
   * Download a document
   * @param {string} fileRef - The storage path or legacy URL
   * @param {string} fileName - The original file name
   */
  async download(fileRef, fileName) {
    try {
      const filePath = extractStoragePath(fileRef);
      if (!filePath) {
        throw new Error("Invalid document path.");
      }

      const { data: signed, error: signedError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, 60);

      if (signedError || !signed?.signedUrl) {
        throw signedError || new Error("Could not create secure download URL.");
      }

      const response = await fetch(signed.signedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, error: null };
    } catch (error) {
      console.error("Error downloading document:", error);
      return { success: false, error };
    }
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  /**
   * Get file icon based on type
   */
  getFileIcon(mimeType) {
    if (!mimeType) return "File";
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.includes("word") || mimeType.includes("document"))
      return "DOC";
    if (mimeType.includes("image")) return "IMG";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "XLS";
    return "File";
  },
};

export default documentService;
