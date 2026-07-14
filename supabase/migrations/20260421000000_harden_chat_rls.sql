-- =============================================================
-- Migration: Add missing Team Chat WRITE RLS policies
-- =============================================================
-- Chat READ access was already hardened in 20260227010000_proper_rls_policies.sql
-- (policies scoped via public.can_access_conversation()) and 20260306172000
-- (conversations_insert / conversation_members_insert). However, when
-- 20260408000000_drop_full_access_policies.sql removed the open "full_access"
-- policies, the repository only carried SELECT policies (+ 2 INSERT policies)
-- for the chat tables. Under RLS, a table with no policy for an operation
-- DENIES it — so messages.insert/update/delete, message_reactions writes,
-- and user_presence writes would all fail at runtime, breaking the chat UI.
--
-- This migration adds the missing WRITE policies, scoped to the same
-- membership rules (public.can_access_conversation / owner checks) used by the
-- existing SELECT policies. It does NOT recreate any SELECT policy, so it is
-- safe to re-run and cannot regress the read hardening.
--
-- Requires (already defined by earlier migrations):
--   public.can_access_conversation(uuid)
--   public.get_my_employee_id()
--   public.is_admin_or_manager()
-- =============================================================

-- ─── CONVERSATIONS (add UPDATE / DELETE) ───────────────────
DROP POLICY IF EXISTS conversations_update ON public.conversations;
CREATE POLICY conversations_update ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR public.can_access_conversation(id))
  WITH CHECK (public.is_admin_or_manager() OR public.can_access_conversation(id));

DROP POLICY IF EXISTS conversations_delete ON public.conversations;
CREATE POLICY conversations_delete ON public.conversations FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR public.can_access_conversation(id));

-- ─── CONVERSATION MEMBERS (add UPDATE / DELETE) ───────────
DROP POLICY IF EXISTS conversation_members_update ON public.conversation_members;
CREATE POLICY conversation_members_update ON public.conversation_members FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR public.can_access_conversation(conversation_id))
  WITH CHECK (public.is_admin_or_manager() OR public.can_access_conversation(conversation_id));

DROP POLICY IF EXISTS conversation_members_delete ON public.conversation_members;
CREATE POLICY conversation_members_delete ON public.conversation_members FOR DELETE TO authenticated
  USING (
    public.is_admin_or_manager()
    OR employee_id = public.get_my_employee_id()
    OR public.can_access_conversation(conversation_id)
  );

-- ─── MESSAGES (add INSERT / UPDATE / DELETE) ──────────────
DROP POLICY IF EXISTS messages_insert ON public.messages;
CREATE POLICY messages_insert ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_manager()
    OR (public.can_access_conversation(conversation_id)
        AND sender_id = public.get_my_employee_id())
  );

DROP POLICY IF EXISTS messages_delete ON public.messages;
CREATE POLICY messages_delete ON public.messages FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR sender_id = public.get_my_employee_id());

DROP POLICY IF EXISTS messages_update ON public.messages;
CREATE POLICY messages_update ON public.messages FOR UPDATE TO authenticated
  -- can_access_conversation: a participant may mark received messages read
  -- (chatService.markAsRead updates rows where sender_id != self). Owner-only
  -- edits of one's own text are enforced in the client query; admins/mods full.
  USING (public.is_admin_or_manager() OR public.can_access_conversation(conversation_id))
  WITH CHECK (public.is_admin_or_manager() OR public.can_access_conversation(conversation_id));

DROP POLICY IF EXISTS message_reactions_update ON public.message_reactions;
CREATE POLICY message_reactions_update ON public.message_reactions FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR user_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR user_id = public.get_my_employee_id());

DROP POLICY IF EXISTS message_reactions_delete ON public.message_reactions;
CREATE POLICY message_reactions_delete ON public.message_reactions FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR user_id = public.get_my_employee_id());

-- ─── USER PRESENCE (add INSERT / UPDATE / DELETE) ────────
-- Selectable by everyone (presence indicators); writes scoped to own row
-- (admins/managers may also manage, e.g. force-offline a departed user).
DROP POLICY IF EXISTS user_presence_insert ON public.user_presence;
CREATE POLICY user_presence_insert ON public.user_presence FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR user_id = public.get_my_employee_id());

DROP POLICY IF EXISTS user_presence_update ON public.user_presence;
CREATE POLICY user_presence_update ON public.user_presence FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR user_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR user_id = public.get_my_employee_id());

DROP POLICY IF EXISTS user_presence_delete ON public.user_presence;
CREATE POLICY user_presence_delete ON public.user_presence FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR user_id = public.get_my_employee_id());
