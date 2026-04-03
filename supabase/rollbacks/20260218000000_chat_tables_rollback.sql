-- ============================================
-- ROLLBACK: 20260218000000_chat_tables.sql
-- Drops all chat-related tables and indexes
-- Removes tables from realtime publication
-- ============================================

-- Remove from realtime publication first
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.messages;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.conversations;

-- Drop indexes (CASCADE on tables would handle this, but being explicit)
DROP INDEX IF EXISTS idx_conversations_participant1;
DROP INDEX IF EXISTS idx_conversations_participant2;
DROP INDEX IF EXISTS idx_messages_conversation;
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_conversation_members_employee;
DROP INDEX IF EXISTS idx_message_reactions_message;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.user_presence CASCADE;
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_members CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Note: This removes ALL chat data permanently.
-- To restore, re-run: 20260218000000_chat_tables.sql
