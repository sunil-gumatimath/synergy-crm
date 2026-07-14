-- Fix admin_create_employee_full return type construction.
-- row_to_json returns json, which cannot be concatenated with jsonb via ||.

CREATE OR REPLACE FUNCTION public.admin_create_employee_full(
  employee_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  caller_user_id uuid := auth.uid();
  new_auth_id uuid;
  new_employee_id uuid;
  encrypted_pw text;
  result_record jsonb;
  v_email text;
  v_password text;
  v_name text;
  v_role text;
  v_department text;
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
    RAISE EXCEPTION 'Only active Admin users can create employees.';
  END IF;

  v_email := employee_data->>'email';
  v_password := employee_data->>'password';
  v_name := employee_data->>'name';
  v_role := employee_data->>'role';
  v_department := employee_data->>'department';

  IF EXISTS (SELECT 1 FROM public.employees WHERE email = v_email) THEN
    RAISE EXCEPTION 'An employee with this email already exists.';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    RAISE EXCEPTION 'An account with this email already exists.';
  END IF;

  new_auth_id := extensions.gen_random_uuid();
  encrypted_pw := extensions.crypt(v_password, extensions.gen_salt('bf'));

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_auth_id, 'authenticated', 'authenticated', v_email, encrypted_pw, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', v_name, 'role', v_role),
    now(), now(), '', '', '', '', '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_auth_id, new_auth_id, v_email,
    jsonb_build_object('sub', new_auth_id::text, 'email', v_email, 'email_verified', true),
    'email', now(), now(), now()
  );

  UPDATE public.employees
  SET
    name = v_name,
    email = v_email,
    role = v_role,
    department = v_department,
    status = COALESCE(employee_data->>'status', 'Active'),
    gender = COALESCE(employee_data->>'gender', 'other'),
    join_date = COALESCE((employee_data->>'joinDate')::date, CURRENT_DATE),
    avatar = NULL
  WHERE user_id = new_auth_id
  RETURNING id INTO new_employee_id;

  IF new_employee_id IS NULL THEN
    INSERT INTO public.employees (
      user_id, name, email, role, department, status, gender,
      join_date, avatar
    ) VALUES (
      new_auth_id,
      v_name,
      v_email,
      v_role,
      v_department,
      COALESCE(employee_data->>'status', 'Active'),
      COALESCE(employee_data->>'gender', 'other'),
      COALESCE((employee_data->>'joinDate')::date, CURRENT_DATE),
      NULL
    )
    RETURNING id INTO new_employee_id;
  END IF;

  INSERT INTO public.employee_private_details (
    employee_id, phone, address, location, salary, performance_score,
    employment_type, manager, projects_completed, bank_details, education
  ) VALUES (
    new_employee_id,
    employee_data->>'phone',
    employee_data->>'address',
    employee_data->>'location',
    COALESCE(NULLIF(employee_data->>'salary', ''), '0')::numeric,
    COALESCE(NULLIF(employee_data->>'performance_score', ''), '0')::numeric,
    COALESCE(employee_data->>'employment_type', 'Full-time'),
    employee_data->>'manager',
    COALESCE(NULLIF(employee_data->>'projects_completed', ''), '0')::int,
    employee_data->'bank_details',
    COALESCE(employee_data->'education', '[]'::jsonb)
  )
  ON CONFLICT (employee_id) DO UPDATE
  SET
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    location = EXCLUDED.location,
    salary = EXCLUDED.salary,
    performance_score = EXCLUDED.performance_score,
    employment_type = EXCLUDED.employment_type,
    manager = EXCLUDED.manager,
    projects_completed = EXCLUDED.projects_completed,
    bank_details = EXCLUDED.bank_details,
    education = EXCLUDED.education,
    updated_at = now();

  SELECT to_jsonb(e) || jsonb_build_object('private_details', to_jsonb(pd))
  INTO result_record
  FROM public.employees e
  LEFT JOIN public.employee_private_details pd ON pd.employee_id = e.id
  WHERE e.id = new_employee_id;

  RETURN result_record;
END;
$function$;
