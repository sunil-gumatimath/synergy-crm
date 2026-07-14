-- =====================================================================
-- Migration: Drop rogue 'full_access' policies
-- =====================================================================
-- Description:
-- The initial setup created a "full_access" policy on almost all tables.
-- A subsequent migration attempted to establish proper role-based policies
-- but did not drop the original "full_access" policies. Because Postgres RLS
-- evaluates policies with an OR condition, this left all records completely
-- exposed to any authenticated user. This migration explicitly drops them.
-- =====================================================================

DROP POLICY IF EXISTS "full_access" ON public.employees;
DROP POLICY IF EXISTS "full_access" ON public.tasks;
DROP POLICY IF EXISTS "full_access" ON public.calendar_events;
DROP POLICY IF EXISTS "full_access" ON public.holidays;
DROP POLICY IF EXISTS "full_access" ON public.leave_types;
DROP POLICY IF EXISTS "full_access" ON public.leave_balances;
DROP POLICY IF EXISTS "full_access" ON public.leave_requests;
DROP POLICY IF EXISTS "full_access" ON public.time_entries;
DROP POLICY IF EXISTS "full_access" ON public.work_schedules;
DROP POLICY IF EXISTS "full_access" ON public.overtime_records;
DROP POLICY IF EXISTS "full_access" ON public.timesheet_periods;
DROP POLICY IF EXISTS "full_access" ON public.notifications;
DROP POLICY IF EXISTS "full_access" ON public.notification_preferences;
DROP POLICY IF EXISTS "full_access" ON public.user_settings;
DROP POLICY IF EXISTS "full_access" ON public.employee_documents;
DROP POLICY IF EXISTS "full_access" ON public.employee_notes;
DROP POLICY IF EXISTS "full_access" ON public.support_tickets;
DROP POLICY IF EXISTS "full_access" ON public.announcements;
DROP POLICY IF EXISTS "full_access" ON public.performance_reviews;
DROP POLICY IF EXISTS "full_access" ON public.payroll_records;
DROP POLICY IF EXISTS "full_access" ON public.trainings;
DROP POLICY IF EXISTS "full_access" ON public.training_enrollments;
DROP POLICY IF EXISTS "full_access" ON public.expenses;
DROP POLICY IF EXISTS "full_access" ON public.assets;
DROP POLICY IF EXISTS "full_access" ON public.onboarding_workflows;
DROP POLICY IF EXISTS "full_access" ON public.onboarding_tasks;
DROP POLICY IF EXISTS "full_access" ON public.conversations;
DROP POLICY IF EXISTS "full_access" ON public.conversation_members;
DROP POLICY IF EXISTS "full_access" ON public.messages;
DROP POLICY IF EXISTS "full_access" ON public.message_reactions;
DROP POLICY IF EXISTS "full_access" ON public.user_presence;
