-- =============================================================
-- Harden admin auth-user RPCs with explicit caller RBAC checks
-- =============================================================

CREATE OR REPLACE FUNCTION public.admin_create_auth_user(
  user_email text,
  user_password text,
  user_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  caller_user_id uuid := auth.uid();
  new_user_id uuid;
  encrypted_pw text;
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
    RAISE EXCEPTION 'Only active Admin users can create auth users.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = user_email
  ) THEN
    RAISE EXCEPTION 'An account with this email already exists.';
  END IF;

  new_user_id := extensions.gen_random_uuid();
  encrypted_pw := extensions.crypt(user_password, extensions.gen_salt('bf'));

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    encrypted_pw,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    user_metadata,
    now(),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    new_user_id,
    user_email,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', user_email,
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  );

  RETURN new_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_delete_auth_user(target_user_id uuid)
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
    RAISE EXCEPTION 'Only active Admin users can delete auth users.';
  END IF;

  IF target_user_id = caller_user_id THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  DELETE FROM auth.users
  WHERE id = target_user_id;
END;
$function$;
