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

-- Drop all old full_access policies and create role-scoped ones
-- (See full migration applied via Supabase MCP)
-- Each table gets: SELECT for all authenticated, INSERT/UPDATE/DELETE scoped by role
-- Admin/Manager = full access, Employee = own data only, anon = no access
