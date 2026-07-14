-- =============================================================
-- Optimize RLS helper functions and add missing FK index
-- =============================================================
-- Context:
--   Every RLS-protected query invokes the helper functions
--   (get_my_role / get_my_employee_id / is_admin_or_manager),
--   each of which runs
--       SELECT ... FROM public.employees WHERE user_id = auth.uid()
--   Without an index on employees.user_id this is a sequential
--   scan per helper call, which dominates latency on the auth
--   bootstrap query and every subsequent request.
--
-- This migration:
--   1. Adds a btree index on public.employees(user_id).
--   2. Redefines the three helpers to use (SELECT auth.uid())
--      so Postgres caches the result as an initPlan per query
--      (Supabase RLS performance recommendation).
--   3. Refreshes planner statistics on employees.
-- =============================================================

-- 1. Index the FK column used by every RLS helper.
CREATE INDEX IF NOT EXISTS idx_employees_user_id
    ON public.employees(user_id);

-- 2. Redefine helper functions with (SELECT auth.uid()) so the
--    JWT claim is read once per query instead of per row / per
--    helper invocation. Fallback for NULL user_id is preserved.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
      FROM public.employees
     WHERE (user_id = (SELECT auth.uid())
        OR (user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))))
     LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_employee_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id
      FROM public.employees
     WHERE (user_id = (SELECT auth.uid())
        OR (user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))))
     LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
          FROM public.employees
         WHERE (user_id = (SELECT auth.uid())
            OR (user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))))
           AND role IN ('Admin', 'Manager')
    );
$$;

-- Re-apply the EXECUTE grants previously set in
-- 20260306172000_rbac_hardening_and_storage_lockdown.sql so they
-- survive the function redefinition.
REVOKE EXECUTE ON FUNCTION public.get_my_role()          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_employee_id()   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_manager()  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_my_role()          TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_employee_id()   TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager()  TO authenticated, service_role;

-- 3. Refresh planner statistics so the new index is considered.
ANALYZE public.employees;
