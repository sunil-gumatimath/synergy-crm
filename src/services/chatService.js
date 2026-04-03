import { supabase } from "../lib/supabase.js";

/**
 * Chat Service - Handles all team chat operations
 * NOTE: employees table uses `name` and `avatar` columns (not first_name/last_name/avatar_url)
 */
export const chatService = {
    /**
     * Get all conversations for a user (by their employee ID)
     * @param {string} employeeId - Employee ID (from employees table, NOT auth user ID)
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getConversations(employeeId) {
        try {
            // Get direct conversations where employee is a participant
            const { data: directConvos, error: directError } = await supabase
                .from("conversations")
                .select(`
                    *,
                    participant1:employees!conversations_participant1_id_fkey(id, name, avatar),
                    participant2:employees!conversations_participant2_id_fkey(id, name, avatar)
                `)
                .or(`participant1_id.eq.${employeeId},participant2_id.eq.${employeeId}`)
                .eq("type", "direct")
                .order("last_message_at", { ascending: false, nullsFirst: false });

            if (directError) throw directError;

            // Get group conversations where employee is a member
            const { data: groupMemberships, error: groupError } = await supabase
                .from("conversation_members")
                .select(`
                    conversation:conversations(
                        *,
                        members:conversation_members(
                            employee:employees(id, name, avatar)
                        )
                    )
                `)
                .eq("employee_id", employeeId);

            if (groupError) throw groupError;

            // Normalize direct conversations to have a `participants` array
            const normalizedDirect = (directConvos || []).map(c => {
                const participants = [c.participant1, c.participant2].filter(Boolean).map(p => ({
                    user_id: p.id,
                    name: p.name,
                    avatar: p.avatar,
                }));
                return {
                    ...c,
                    is_group: false,
                    participants,
                };
            });

            // Normalize group conversations
            const normalizedGroups = (groupMemberships || [])
                .map(m => m.conversation)
                .filter(Boolean)
                .map(c => ({
                    ...c,
                    is_group: true,
                    participants: (c.members || []).map(m => ({
                        user_id: m.employee?.id,
                        name: m.employee?.name,
                        avatar: m.employee?.avatar,
                    })),
                }));

            const conversations = [...normalizedDirect, ...normalizedGroups]
                .sort((a, b) => new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at));

            return { data: conversations, error: null };
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return { data: [], error };
        }
    },

    /**
     * Get messages for a conversation
     * @param {string} conversationId - Conversation ID
     * @param {number} limit - Number of messages to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getMessages(conversationId, limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from("messages")
                .select(`
                    *,
                    sender:employees(id, name, avatar)
                `)
                .eq("conversation_id", conversationId)
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            // Normalize sender to have consistent shape
            const normalized = (data || []).reverse().map(msg => ({
                ...msg,
                sender: msg.sender ? {
                    id: msg.sender.id,
                    name: msg.sender.name,
                    avatar: msg.sender.avatar,
                } : null,
            }));

            return { data: normalized, error: null };
        } catch (error) {
            console.error("Error fetching messages:", error);
            return { data: [], error };
        }
    },

    /**
     * Send a message
     * @param {Object} message - Message data
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async sendMessage({ conversationId, senderId, content, type = "text", attachments = null }) {
        try {
            const { data, error } = await supabase
                .from("messages")
                .insert({
                    conversation_id: conversationId,
                    sender_id: senderId,
                    content,
                    type,
                    attachments,
                })
                .select(`
                    *,
                    sender:employees(id, name, avatar)
                `)
                .single();

            if (error) throw error;

            // Update conversation's last_message_at
            await supabase
                .from("conversations")
                .update({
                    last_message_at: new Date().toISOString(),
                    last_message: content.substring(0, 100)
                })
                .eq("id", conversationId);

            return { data, error: null };
        } catch (error) {
            console.error("Error sending message:", error);
            return { data: null, error };
        }
    },

    /**
     * Create a direct conversation between two employees
     * @param {string} employeeId1 - First employee ID
     * @param {string} employeeId2 - Second employee ID
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async createDirectConversation(employeeId1, employeeId2) {
        try {
            // Check if conversation already exists
            const { data: existing } = await supabase
                .from("conversations")
                .select(`
                    *,
                    participant1:employees!conversations_participant1_id_fkey(id, name, avatar),
                    participant2:employees!conversations_participant2_id_fkey(id, name, avatar)
                `)
                .eq("type", "direct")
                .or(`and(participant1_id.eq.${employeeId1},participant2_id.eq.${employeeId2}),and(participant1_id.eq.${employeeId2},participant2_id.eq.${employeeId1})`)
                .maybeSingle();

            if (existing) {
                const participants = [existing.participant1, existing.participant2].filter(Boolean).map(p => ({
                    user_id: p.id,
                    name: p.name,
                    avatar: p.avatar,
                }));
                return { data: { ...existing, is_group: false, participants }, error: null };
            }

            const { data, error } = await supabase
                .from("conversations")
                .insert({
                    type: "direct",
                    participant1_id: employeeId1,
                    participant2_id: employeeId2,
                })
                .select(`
                    *,
                    participant1:employees!conversations_participant1_id_fkey(id, name, avatar),
                    participant2:employees!conversations_participant2_id_fkey(id, name, avatar)
                `)
                .single();

            if (error) throw error;

            const participants = [data.participant1, data.participant2].filter(Boolean).map(p => ({
                user_id: p.id,
                name: p.name,
                avatar: p.avatar,
            }));

            return { data: { ...data, is_group: false, participants }, error: null };
        } catch (error) {
            console.error("Error creating conversation:", error);
            return { data: null, error };
        }
    },

    /**
     * Create a group conversation
     * @param {Object} groupData - Group conversation data
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async createGroupConversation({ name, description, memberIds, createdBy }) {
        try {
            // Create the conversation
            const { data: conversation, error: convError } = await supabase
                .from("conversations")
                .insert({
                    type: "group",
                    name,
                    description,
                    created_by: createdBy,
                })
                .select()
                .single();

            if (convError) throw convError;

            // Add members (include creator as admin)
            const allMemberIds = [...new Set([createdBy, ...memberIds])];
            const members = allMemberIds.map(id => ({
                conversation_id: conversation.id,
                employee_id: id,
                role: id === createdBy ? 'admin' : 'member'
            }));

            const { error: memberError } = await supabase
                .from("conversation_members")
                .insert(members);

            if (memberError) throw memberError;

            return {
                data: {
                    ...conversation,
                    is_group: true,
                    participants: allMemberIds.map(id => ({ user_id: id })),
                },
                error: null
            };
        } catch (error) {
            console.error("Error creating group:", error);
            return { data: null, error };
        }
    },

    /**
     * Mark messages as read
     * @param {string} conversationId - Conversation ID
     * @param {string} employeeId - Employee ID
     * @returns {Promise<{error: Error|null}>}
     */
    async markAsRead(conversationId, employeeId) {
        try {
            // Use a raw SQL approach via RPC or just update read_by array
            // Simple approach: fetch unread messages and update them
            const { data: unread } = await supabase
                .from("messages")
                .select("id, read_by")
                .eq("conversation_id", conversationId)
                .not("sender_id", "eq", employeeId);

            if (!unread || unread.length === 0) return { error: null };

            // Update each message that hasn't been read by this user
            const toUpdate = unread.filter(msg => !msg.read_by?.includes(employeeId));

            for (const msg of toUpdate) {
                await supabase
                    .from("messages")
                    .update({ read_by: [...(msg.read_by || []), employeeId] })
                    .eq("id", msg.id);
            }

            return { error: null };
        } catch (error) {
            console.error("Error marking as read:", error);
            return { error };
        }
    },

    /**
     * Subscribe to new messages in a conversation
     * @param {string} conversationId - Conversation ID
     * @param {Function} callback - Callback receiving the full message object
     * @returns {Object} Subscription object
     */
    subscribeToMessages(conversationId, callback) {
        return supabase
            .channel(`messages:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                async (payload) => {
                    // Fetch full message with sender info
                    const { data } = await supabase
                        .from("messages")
                        .select(`*, sender:employees(id, name, avatar)`)
                        .eq("id", payload.new.id)
                        .single();

                    if (data) {
                        callback({
                            ...data,
                            sender: data.sender ? {
                                id: data.sender.id,
                                name: data.sender.name,
                                avatar: data.sender.avatar,
                            } : null,
                        });
                    }
                }
            )
            .subscribe();
    },

    /**
     * Subscribe to conversation updates
     * @param {string} employeeId - Employee ID
     * @param {Function} callback - Callback for updates
     * @returns {Object} Subscription object
     */
    subscribeToConversations(employeeId, callback) {
        return supabase
            .channel(`conversations:${employeeId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "conversations",
                },
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();
    },

    /**
     * Get all employees (for new conversation modal)
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async getEmployees() {
        try {
            const { data, error } = await supabase
                .from("employees")
                .select("id, name, avatar, department, role, status")
                .eq("status", "Active")
                .order("name");

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error fetching employees:", error);
            return { data: [], error };
        }
    },

    /**
     * Get online status of users
     * @param {Array} userIds - Array of employee IDs
     * @returns {Promise<{data: Object, error: Error|null}>}
     */
    async getOnlineStatus(userIds) {
        try {
            if (!userIds || userIds.length === 0) {
                return { data: {}, error: null };
            }

            const { data, error } = await supabase
                .from("user_presence")
                .select("*")
                .in("user_id", userIds);

            if (error) throw error;

            const statusMap = {};
            (data || []).forEach(p => {
                statusMap[p.user_id] = {
                    online: p.online,
                    lastSeen: p.last_seen
                };
            });

            return { data: statusMap, error: null };
        } catch (error) {
            console.error("Error fetching online status:", error);
            return { data: {}, error };
        }
    },

    /**
     * Update user's online status
     * @param {string} employeeId - Employee ID
     * @param {boolean} online - Online status
     * @returns {Promise<{error: Error|null}>}
     */
    async updatePresence(employeeId, online) {
        try {
            const { error } = await supabase
                .from("user_presence")
                .upsert({
                    user_id: employeeId,
                    online,
                    last_seen: new Date().toISOString()
                });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error updating presence:", error);
            return { error };
        }
    },

    /**
     * Search messages
     * @param {string} query - Search query
     * @returns {Promise<{data: Array, error: Error|null}>}
     */
    async searchMessages(query) {
        try {
            const { data, error } = await supabase
                .from("messages")
                .select(`
                    *,
                    sender:employees(id, name),
                    conversation:conversations(id, name, type)
                `)
                .ilike("content", `%${query}%`)
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw error;
            return { data: data || [], error: null };
        } catch (error) {
            console.error("Error searching messages:", error);
            return { data: [], error };
        }
    },

    /**
     * Delete a message
     * @param {string} messageId - Message ID
     * @param {string} employeeId - Employee ID (for permission check)
     * @returns {Promise<{error: Error|null}>}
     */
    async deleteMessage(messageId, employeeId) {
        try {
            const { error } = await supabase
                .from("messages")
                .delete()
                .eq("id", messageId)
                .eq("sender_id", employeeId);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error deleting message:", error);
            return { error };
        }
    },

    /**
     * Edit a message
     * @param {string} messageId - Message ID
     * @param {string} content - New content
     * @param {string} employeeId - Employee ID (for permission check)
     * @returns {Promise<{data: Object|null, error: Error|null}>}
     */
    async editMessage(messageId, content, employeeId) {
        try {
            const { data, error } = await supabase
                .from("messages")
                .update({
                    content,
                    edited_at: new Date().toISOString()
                })
                .eq("id", messageId)
                .eq("sender_id", employeeId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error("Error editing message:", error);
            return { data: null, error };
        }
    },

    /**
     * Add reaction to a message
     * @param {string} messageId - Message ID
     * @param {string} employeeId - Employee ID
     * @param {string} emoji - Emoji reaction
     * @returns {Promise<{error: Error|null}>}
     */
    async addReaction(messageId, employeeId, emoji) {
        try {
            const { error } = await supabase
                .from("message_reactions")
                .insert({
                    message_id: messageId,
                    user_id: employeeId,
                    emoji
                });

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error adding reaction:", error);
            return { error };
        }
    },

    /**
     * Remove reaction from a message
     * @param {string} messageId - Message ID
     * @param {string} employeeId - Employee ID
     * @param {string} emoji - Emoji reaction
     * @returns {Promise<{error: Error|null}>}
     */
    async removeReaction(messageId, employeeId, emoji) {
        try {
            const { error } = await supabase
                .from("message_reactions")
                .delete()
                .eq("message_id", messageId)
                .eq("user_id", employeeId)
                .eq("emoji", emoji);

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error("Error removing reaction:", error);
            return { error };
        }
    }
};
