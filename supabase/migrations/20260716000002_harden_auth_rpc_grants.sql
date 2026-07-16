-- =============================================================
-- Harden auth/RBAC: RPC grants + privilege-escalation guard
-- =============================================================
-- H3: Re-grant admin_update_auth_email to authenticated.
--     20260405000001 revoked EXECUTE from PUBLIC/anon/authenticated,
--     leaving only service_role + postgres. The client app calls this
--     as the authenticated role, so it must be re-granted.
-- M1: Add a SECURITY DEFINER BEFORE UPDATE trigger on employees that
--     raises if a non-admin/non-manager changes role or status on any
--     row (privilege escalation guard). The existing `employees_update`
--     UPDATE policy (with_check = is_admin_or_manager() OR id=...) does
--     NOT prevent a non-admin from changing their own role/status, so
--     this closes that gap without touching the policy's admin paths.
-- M2: SKIPPED (see rationale in PR/report).
-- =============================================================

-- H3 -------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.admin_update_auth_email(uuid, text) TO authenticated, service_role;

-- M1 -------------------------------------------------------------
-- Trigger function: block role/status changes performed by a user who
-- is not an active admin/manager. Uses SECURITY DEFINER so it can read
-- the caller's employee row regardless of RLS.
CREATE OR REPLACE FUNCTION public.trg_block_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_is_privileged boolean;
BEGIN
  -- Only enforce when role or status is actually being changed.
  IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    -- Is the current caller an active admin/manager?
    SELECT EXISTS (
      SELECT 1
      FROM public.employees e
      WHERE e.user_id = auth.uid()
        AND e.status = 'Active'
        AND e.role IN ('Admin', 'Manager')
    ) INTO v_is_privileged;

    IF NOT v_is_privileged THEN
      RAISE EXCEPTION 'Only active Admin/Manager users can change role or status.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_block_privilege_escalation ON public.employees;
CREATE TRIGGER trg_block_privilege_escalation
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_block_privilege_escalation();
