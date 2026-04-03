-- ============================================
-- SYNERGY EMS - TEAM CHAT TABLES
-- Migration: 20260218000000_chat_tables.sql
-- ============================================

-- Drop existing chat tables if they exist (for clean re-run)
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_members CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.user_presence CASCADE;

-- ============================================
-- 1. CONVERSATIONS
-- Supports both direct (1:1) and group chats
-- ============================================
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    name TEXT,                          -- Only for group chats
    description TEXT,                   -- Only for group chats
    -- For direct chats: store both participant IDs for easy lookup
    participant1_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    participant2_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CONVERSATION MEMBERS (for group chats)
-- ============================================
CREATE TABLE public.conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, employee_id)
);

-- ============================================
-- 3. MESSAGES
-- ============================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
    attachments JSONB,
    read_by UUID[] DEFAULT '{}',
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. MESSAGE REACTIONS
-- ============================================
CREATE TABLE public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- ============================================
-- 5. USER PRESENCE
-- ============================================
CREATE TABLE public.user_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE UNIQUE,
    online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_conversations_participant1 ON public.conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON public.conversations(participant2_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_conversation_members_employee ON public.conversation_members(employee_id);
CREATE INDEX idx_message_reactions_message ON public.message_reactions(message_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Full Access for Development)
-- ============================================
CREATE POLICY "full_access" ON public.conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.conversation_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.message_reactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.user_presence FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- ENABLE REALTIME for messages and conversations
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
