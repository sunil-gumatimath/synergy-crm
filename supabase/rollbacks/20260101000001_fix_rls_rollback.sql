-- ============================================
-- ROLLBACK: 20260101000001_fix_rls.sql
-- Reverts full_access policies from anon+authenticated
-- back to authenticated-only (original state from setup)
-- ============================================

-- Revert each policy to authenticated-only
ALTER POLICY "full_access" ON public.employees TO authenticated;
ALTER POLICY "full_access" ON public.tasks TO authenticated;
ALTER POLICY "full_access" ON public.leave_requests TO authenticated;
ALTER POLICY "full_access" ON public.payroll_records TO authenticated;
ALTER POLICY "full_access" ON public.performance_reviews TO authenticated;
ALTER POLICY "full_access" ON public.support_tickets TO authenticated;
ALTER POLICY "full_access" ON public.announcements TO authenticated;
ALTER POLICY "full_access" ON public.assets TO authenticated;

-- Note: This restores the original policy scope from the setup migration.
-- The full_access policies themselves are still wide-open (USING true).
