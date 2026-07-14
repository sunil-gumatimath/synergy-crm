-- =============================================================
-- Harden admin_update_auth_email with explicit caller RBAC checks
-- =============================================================
-- This function was NOT hardened in the original
-- 20260405000000_harden_admin_auth_user_rpcs.sql alongside
-- admin_create_auth_user and admin_delete_auth_user. It was
-- left with the original SECURITY DEFINER definition that lacked:
--   - caller_user_id := auth.uid() and NULL check
--   - Active Admin role check
--   - SET search_path TO '' (search-path injection protection)
-- =============================================================

CREATE OR REPLACE FUNCTION public.admin_update_auth_email(
  target_user_id uuid,
  new_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  caller_user_id uuid := auth.uid();
BEGIN
  IF caller_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.user_id = caller_user_id
      AND e.role = 'Admin'
      AND e.status = 'Active'
  ) THEN
    RAISE EXCEPTION 'Only active Admin users can update auth emails.';
  END IF;

  UPDATE auth.users
  SET email = new_email,
      updated_at = NOW()
  WHERE id = target_user_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.admin_update_auth_email(uuid, text) FROM PUBLIC, anon, authenticated;
