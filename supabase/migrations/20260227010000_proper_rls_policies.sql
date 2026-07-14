-- =============================================================
-- Migration: Replace full_access RLS with role-scoped policies
-- =============================================================
-- Strategy:
--   • Admin / Manager  → full read/write on all rows
--   • Employee         → read/write only their own data
--   • anon             → NO access at all
-- =============================================================

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT role FROM public.employees WHERE user_id = auth.uid() LIMIT 1; $$;
CREATE OR REPLACE FUNCTION public.get_my_employee_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT id FROM public.employees WHERE user_id = auth.uid() LIMIT 1; $$;
CREATE OR REPLACE FUNCTION public.is_admin_or_manager() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.employees WHERE user_id = auth.uid() AND role IN ('Admin', 'Manager')); $$;

-- =============================================================
-- Role-scoped RLS policies (committed to source control).
-- Strategy (matches later chat/private-details/storage migrations):
--   • Admin / Manager  → full read/write on all rows
--   • Employee         → read/write only their own row
--   • anon             → NO access at all (RLS enabled, no anon policy)
--
-- Helper functions: get_my_employee_id(), is_admin_or_manager(), get_my_role()
-- Keying: employee-scoped tables use employee_id = get_my_employee_id();
-- user-scoped tables (notifications, settings) use user_id = auth.uid().
-- =============================================================

-- ─── EMPLOYEES (own row; admin/manager full) ──────────────
DROP POLICY IF EXISTS "full_access" ON public.employees;
CREATE POLICY employees_select ON public.employees FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR id = public.get_my_employee_id());
CREATE POLICY employees_insert ON public.employees FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager());
CREATE POLICY employees_update ON public.employees FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR id = public.get_my_employee_id());
CREATE POLICY employees_delete ON public.employees FOR DELETE TO authenticated
  USING (public.is_admin_or_manager());

-- ─── CALENDAR EVENTS (own; admin/manager full) ───────────
DROP POLICY IF EXISTS "full_access" ON public.calendar_events;
CREATE POLICY calendar_events_select ON public.calendar_events FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY calendar_events_insert ON public.calendar_events FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY calendar_events_update ON public.calendar_events FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY calendar_events_delete ON public.calendar_events FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());

-- ─── TASKS (assignee own; admin/manager full) ───────────
DROP POLICY IF EXISTS "full_access" ON public.tasks;
CREATE POLICY tasks_select ON public.tasks FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR assignee_id = public.get_my_employee_id());
CREATE POLICY tasks_insert ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR assignee_id = public.get_my_employee_id());
CREATE POLICY tasks_update ON public.tasks FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR assignee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR assignee_id = public.get_my_employee_id());
CREATE POLICY tasks_delete ON public.tasks FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR assignee_id = public.get_my_employee_id());

-- ─── CHAT TABLES (defense in depth; can_access_conversation also enforced) ──
DROP POLICY IF EXISTS "full_access" ON public.conversations;
DROP POLICY IF EXISTS "full_access" ON public.conversation_members;
DROP POLICY IF EXISTS "full_access" ON public.messages;
DROP POLICY IF EXISTS "full_access" ON public.message_reactions;
DROP POLICY IF EXISTS "full_access" ON public.user_presence;
CREATE POLICY conversations_select ON public.conversations FOR SELECT TO authenticated
  USING (public.can_access_conversation(id));
CREATE POLICY conversation_members_select ON public.conversation_members FOR SELECT TO authenticated
  USING (public.can_access_conversation(conversation_id));
CREATE POLICY messages_select ON public.messages FOR SELECT TO authenticated
  USING (public.can_access_conversation(conversation_id));
CREATE POLICY message_reactions_select ON public.message_reactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND public.can_access_conversation(m.conversation_id)));
CREATE POLICY user_presence_select ON public.user_presence FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR user_id = public.get_my_employee_id());

-- ─── LEAVE (employee = own requests/balances; admin/manager full) ──
DROP POLICY IF EXISTS "full_access" ON public.leave_types;
DROP POLICY IF EXISTS "full_access" ON public.leave_balances;
DROP POLICY IF EXISTS "full_access" ON public.leave_requests;
CREATE POLICY leave_types_select ON public.leave_types FOR SELECT TO authenticated USING (true);
CREATE POLICY leave_types_manage ON public.leave_types FOR ALL TO authenticated
  USING (public.is_admin_or_manager()) WITH CHECK (public.is_admin_or_manager());
CREATE POLICY leave_balances_select ON public.leave_balances FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY leave_balances_insert ON public.leave_balances FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY leave_balances_update ON public.leave_balances FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY leave_balances_delete ON public.leave_balances FOR DELETE TO authenticated
  USING (public.is_admin_or_manager());
CREATE POLICY leave_requests_select ON public.leave_requests FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY leave_requests_insert ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY leave_requests_update ON public.leave_requests FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY leave_requests_delete ON public.leave_requests FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());

-- ─── TIME TRACKING (own; admin/manager full) ───────────
DROP POLICY IF EXISTS "full_access" ON public.time_entries;
DROP POLICY IF EXISTS "full_access" ON public.work_schedules;
DROP POLICY IF EXISTS "full_access" ON public.overtime_records;
DROP POLICY IF EXISTS "full_access" ON public.timesheet_periods;
CREATE POLICY time_entries_select ON public.time_entries FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY time_entries_insert ON public.time_entries FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY time_entries_update ON public.time_entries FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY time_entries_delete ON public.time_entries FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY work_schedules_select ON public.work_schedules FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY work_schedules_insert ON public.work_schedules FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY work_schedules_update ON public.work_schedules FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY work_schedules_delete ON public.work_schedules FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY overtime_records_select ON public.overtime_records FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY overtime_records_insert ON public.overtime_records FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY overtime_records_update ON public.overtime_records FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY overtime_records_delete ON public.overtime_records FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY timesheet_periods_select ON public.timesheet_periods FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY timesheet_periods_insert ON public.timesheet_periods FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY timesheet_periods_update ON public.timesheet_periods FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY timesheet_periods_delete ON public.timesheet_periods FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());

-- ─── NOTIFICATIONS / PREFERENCES / SETTINGS (user_id = auth.uid()) ──
DROP POLICY IF EXISTS "full_access" ON public.notifications;
DROP POLICY IF EXISTS "full_access" ON public.notification_preferences;
DROP POLICY IF EXISTS "full_access" ON public.user_settings;
CREATE POLICY notifications_select ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY notifications_update ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notifications_delete ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY notification_preferences_select ON public.notification_preferences FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY notification_preferences_insert ON public.notification_preferences FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY notification_preferences_update ON public.notification_preferences FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notification_preferences_delete ON public.notification_preferences FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY user_settings_select ON public.user_settings FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY user_settings_insert ON public.user_settings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_settings_update ON public.user_settings FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_settings_delete ON public.user_settings FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ─── ANNOUNCEMENTS (read all; admin/manager manage) ───────
DROP POLICY IF EXISTS "full_access" ON public.announcements;
CREATE POLICY announcements_select ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY announcements_manage ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin_or_manager()) WITH CHECK (public.is_admin_or_manager());

-- ─── PERFORMANCE REVIEWS (own + reviewer; admin/manager full) ──
DROP POLICY IF EXISTS "full_access" ON public.performance_reviews;
CREATE POLICY performance_reviews_select ON public.performance_reviews FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id() OR reviewer_id = public.get_my_employee_id());
CREATE POLICY performance_reviews_insert ON public.performance_reviews FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id() OR reviewer_id = public.get_my_employee_id());
CREATE POLICY performance_reviews_update ON public.performance_reviews FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id() OR reviewer_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id() OR reviewer_id = public.get_my_employee_id());
CREATE POLICY performance_reviews_delete ON public.performance_reviews FOR DELETE TO authenticated
  USING (public.is_admin_or_manager());

-- ─── PAYROLL (admin/manager only) ───────────────────────
DROP POLICY IF EXISTS "full_access" ON public.payroll_records;
CREATE POLICY payroll_records_manage ON public.payroll_records FOR ALL TO authenticated
  USING (public.is_admin_or_manager()) WITH CHECK (public.is_admin_or_manager());

-- ─── TRAININGS / ENROLLMENTS ───────────────────────────
DROP POLICY IF EXISTS "full_access" ON public.trainings;
DROP POLICY IF EXISTS "full_access" ON public.training_enrollments;
CREATE POLICY trainings_select ON public.trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY trainings_manage ON public.trainings FOR ALL TO authenticated
  USING (public.is_admin_or_manager()) WITH CHECK (public.is_admin_or_manager());
CREATE POLICY training_enrollments_select ON public.training_enrollments FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY training_enrollments_insert ON public.training_enrollments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY training_enrollments_update ON public.training_enrollments FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY training_enrollments_delete ON public.training_enrollments FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());

-- ─── EXPENSES (own; admin/manager full) ───────────────
DROP POLICY IF EXISTS "full_access" ON public.expenses;
CREATE POLICY expenses_select ON public.expenses FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY expenses_insert ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY expenses_update ON public.expenses FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY expenses_delete ON public.expenses FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());

-- ─── ASSETS (read all; admin/manager manage) ──────────
DROP POLICY IF EXISTS "full_access" ON public.assets;
CREATE POLICY assets_select ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY assets_manage ON public.assets FOR ALL TO authenticated
  USING (public.is_admin_or_manager()) WITH CHECK (public.is_admin_or_manager());

-- ─── ONBOARDING (read all; admin/manager manage) ───────
DROP POLICY IF EXISTS "full_access" ON public.onboarding_workflows;
DROP POLICY IF EXISTS "full_access" ON public.onboarding_tasks;
CREATE POLICY onboarding_workflows_select ON public.onboarding_workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY onboarding_workflows_manage ON public.onboarding_workflows FOR ALL TO authenticated
  USING (public.is_admin_or_manager()) WITH CHECK (public.is_admin_or_manager());
CREATE POLICY onboarding_tasks_select ON public.onboarding_tasks FOR SELECT TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY onboarding_tasks_insert ON public.onboarding_tasks FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY onboarding_tasks_update ON public.onboarding_tasks FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id())
  WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY onboarding_tasks_delete ON public.onboarding_tasks FOR DELETE TO authenticated
  USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());

-- NOTE: employee_documents / employee_notes / employee_private_details /
-- conversations / messages / storage objects already have their role-scoped
-- policies defined in later migrations; their full_access policies are
-- dropped in 20260408000000_drop_full_access_policies.sql.
