-- =============================================================
-- RBAC hardening and storage lockdown
-- =============================================================

-- 1) Tighten admin RPC privileges and enforce Admin-only checks

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
  new_user_id UUID;
  encrypted_pw TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.user_id = auth.uid()
      AND e.role = 'Admin'
  ) THEN
    RAISE EXCEPTION 'Only Admin users can create auth users.';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
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
    NOW(),
    '{"provider":"email","providers":["email"]}'::JSONB,
    user_metadata,
    NOW(),
    NOW(),
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
      'sub', new_user_id::TEXT,
      'email', user_email,
      'email_verified', true
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
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
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.user_id = auth.uid()
      AND e.role = 'Admin'
  ) THEN
    RAISE EXCEPTION 'Only Admin users can delete auth users.';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_update_auth_email(
  target_user_id uuid,
  new_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.user_id = auth.uid()
      AND e.role = 'Admin'
  ) THEN
    RAISE EXCEPTION 'Only Admin users can update auth emails.';
  END IF;

  UPDATE auth.users
  SET email = new_email,
      updated_at = NOW()
  WHERE id = target_user_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.admin_create_auth_user(text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_delete_auth_user(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_auth_email(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_auth_user(text, text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_auth_user(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_auth_email(uuid, text) TO authenticated, service_role;

-- Remove helper-function execute for anon
REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_employee_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_manager() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_employee_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO authenticated, service_role;

-- 2) Fix chat RLS leakage and typo in conversations_select logic

CREATE OR REPLACE FUNCTION public.can_access_conversation(conv_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = conv_id
      AND (
        public.is_admin_or_manager()
        OR c.participant1_id = public.get_my_employee_id()
        OR c.participant2_id = public.get_my_employee_id()
        OR c.created_by = public.get_my_employee_id()
        OR EXISTS (
          SELECT 1
          FROM public.conversation_members cm
          WHERE cm.conversation_id = c.id
            AND cm.employee_id = public.get_my_employee_id()
        )
      )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.can_access_conversation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_conversation(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS conversations_select ON public.conversations;
CREATE POLICY conversations_select
ON public.conversations
FOR SELECT
TO authenticated
USING (public.can_access_conversation(id));

DROP POLICY IF EXISTS conversation_members_select ON public.conversation_members;
CREATE POLICY conversation_members_select
ON public.conversation_members
FOR SELECT
TO authenticated
USING (public.can_access_conversation(conversation_id));

DROP POLICY IF EXISTS messages_select ON public.messages;
CREATE POLICY messages_select
ON public.messages
FOR SELECT
TO authenticated
USING (public.can_access_conversation(conversation_id));

DROP POLICY IF EXISTS message_reactions_select ON public.message_reactions;
CREATE POLICY message_reactions_select
ON public.message_reactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.messages m
    WHERE m.id = message_id
      AND public.can_access_conversation(m.conversation_id)
  )
);

DROP POLICY IF EXISTS conversations_insert ON public.conversations;
CREATE POLICY conversations_insert
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = public.get_my_employee_id()
  AND (
    type = 'group'
    OR participant1_id = public.get_my_employee_id()
    OR participant2_id = public.get_my_employee_id()
  )
);

DROP POLICY IF EXISTS conversation_members_insert ON public.conversation_members;
CREATE POLICY conversation_members_insert
ON public.conversation_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_manager()
  OR EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = conversation_id
      AND c.created_by = public.get_my_employee_id()
  )
  OR employee_id = public.get_my_employee_id()
);

-- 3) Lock down public storage policies for employee documents

DROP POLICY IF EXISTS "Policies 75ydll_0" ON storage.objects;
DROP POLICY IF EXISTS "Policies 75ydll_1" ON storage.objects;
DROP POLICY IF EXISTS "Policies 75ydll_2" ON storage.objects;

CREATE POLICY employee_documents_select
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'employee-documents'
  AND (
    public.is_admin_or_manager()
    OR name LIKE (public.get_my_employee_id()::text || '/%')
  )
);

CREATE POLICY employee_documents_insert
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employee-documents'
  AND (
    public.is_admin_or_manager()
    OR name LIKE (public.get_my_employee_id()::text || '/%')
  )
);

CREATE POLICY employee_documents_delete
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'employee-documents'
  AND (
    public.is_admin_or_manager()
    OR name LIKE (public.get_my_employee_id()::text || '/%')
  )
);

CREATE POLICY employee_documents_update
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'employee-documents'
  AND (
    public.is_admin_or_manager()
    OR name LIKE (public.get_my_employee_id()::text || '/%')
  )
)
WITH CHECK (
  bucket_id = 'employee-documents'
  AND (
    public.is_admin_or_manager()
    OR name LIKE (public.get_my_employee_id()::text || '/%')
  )
);
