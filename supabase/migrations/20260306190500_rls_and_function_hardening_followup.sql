-- =============================================================
-- Follow-up hardening for remaining security advisor warnings
-- =============================================================

-- 1) Replace permissive INSERT policies (WITH CHECK true)

DROP POLICY IF EXISTS calendar_events_insert ON public.calendar_events;
CREATE POLICY calendar_events_insert
ON public.calendar_events
FOR INSERT
TO authenticated
WITH CHECK (
  (public.is_admin_or_manager() OR created_by = public.get_my_employee_id())
  AND (
    employee_id IS NULL
    OR public.is_admin_or_manager()
    OR employee_id = public.get_my_employee_id()
  )
);

DROP POLICY IF EXISTS employee_notes_insert ON public.employee_notes;
CREATE POLICY employee_notes_insert
ON public.employee_notes
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = public.get_my_employee_id()
  AND (
    public.is_admin_or_manager()
    OR employee_id = public.get_my_employee_id()
  )
);

DROP POLICY IF EXISTS notifications_insert ON public.notifications;
CREATE POLICY notifications_insert
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR public.is_admin_or_manager()
);

DROP POLICY IF EXISTS support_tickets_insert ON public.support_tickets;
CREATE POLICY support_tickets_insert
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_manager()
  OR created_by = public.get_my_employee_id()
);

DROP POLICY IF EXISTS tasks_insert ON public.tasks;
CREATE POLICY tasks_insert
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_manager()
  OR assignee_id = public.get_my_employee_id()
);

-- 2) Fix mutable search_path warnings on functions

DO $$
BEGIN
  IF to_regprocedure('public.get_weekly_hours(bigint,date)') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.get_weekly_hours(bigint, date) SET search_path = public, pg_catalog';
  END IF;

  IF to_regprocedure('public.update_leave_balance_on_request()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.update_leave_balance_on_request() SET search_path = public, pg_catalog';
  END IF;

  IF to_regprocedure('public.add_pending_leave_on_create()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.add_pending_leave_on_create() SET search_path = public, pg_catalog';
  END IF;

  IF to_regprocedure('public.calculate_leave_days(date,date,boolean)') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.calculate_leave_days(date, date, boolean) SET search_path = public, pg_catalog';
  END IF;

  IF to_regprocedure('public.notify_task_assigned()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.notify_task_assigned() SET search_path = public, pg_catalog';
  END IF;

  IF to_regprocedure('public.initialize_leave_balances(bigint)') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.initialize_leave_balances(bigint) SET search_path = public, pg_catalog';
  END IF;

  IF to_regprocedure('public.update_updated_at_column()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_catalog';
  END IF;
END
$$;
