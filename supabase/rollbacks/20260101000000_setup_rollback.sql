-- ============================================
-- ROLLBACK: 20260101000000_setup.sql
-- Drops ALL tables created in the initial setup
-- Run this to fully undo the initial migration
-- ============================================

-- Drop tables in reverse dependency order (children first)
DROP TABLE IF EXISTS public.onboarding_tasks CASCADE;
DROP TABLE IF EXISTS public.onboarding_workflows CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.training_enrollments CASCADE;
DROP TABLE IF EXISTS public.trainings CASCADE;
DROP TABLE IF EXISTS public.payroll_records CASCADE;
DROP TABLE IF EXISTS public.performance_reviews CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.employee_notes CASCADE;
DROP TABLE IF EXISTS public.employee_documents CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.timesheet_periods CASCADE;
DROP TABLE IF EXISTS public.overtime_records CASCADE;
DROP TABLE IF EXISTS public.work_schedules CASCADE;
DROP TABLE IF EXISTS public.time_entries CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.leave_balances CASCADE;
DROP TABLE IF EXISTS public.leave_types CASCADE;
DROP TABLE IF EXISTS public.holidays CASCADE;
DROP TABLE IF EXISTS public.calendar_events CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;

-- Note: This removes ALL data and schema. Use with extreme caution.
-- To restore, re-run: 20260101000000_setup.sql
