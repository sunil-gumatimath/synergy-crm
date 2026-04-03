-- =============================================================
-- Rollback: Revert proper RLS policies back to full_access
-- =============================================================
-- WARNING: This restores the insecure full_access policies.
-- Only use in development or if the new policies cause issues.
-- =============================================================

-- Drop helper functions
DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS public.get_my_employee_id();
DROP FUNCTION IF EXISTS public.is_admin_or_manager();

-- Drop all new policies and restore full_access on every table
DO $$
DECLARE
  tbl RECORD;
  pol RECORD;
BEGIN
  -- Drop all policies on public tables
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl.tablename
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl.tablename);
    END LOOP;

    -- Restore full_access policy
    EXECUTE format(
      'CREATE POLICY "full_access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      tbl.tablename
    );
  END LOOP;
END;
$$;
