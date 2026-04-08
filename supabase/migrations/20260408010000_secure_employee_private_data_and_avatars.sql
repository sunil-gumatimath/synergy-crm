-- =============================================================
-- Secure employee private data and avatar storage
-- =============================================================

CREATE TABLE IF NOT EXISTS public.employee_private_details (
  employee_id uuid PRIMARY KEY REFERENCES public.employees(id) ON DELETE CASCADE,
  phone text,
  address text,
  location text,
  salary numeric(12, 2) DEFAULT 0,
  performance_score numeric(3, 1) DEFAULT 0,
  employment_type text DEFAULT 'Full-time',
  manager text,
  projects_completed integer DEFAULT 0,
  bank_details jsonb DEFAULT NULL,
  education jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.employee_private_details (
  employee_id,
  phone,
  address,
  location,
  salary,
  performance_score,
  employment_type,
  manager,
  projects_completed,
  bank_details,
  education
)
SELECT
  e.id,
  e.phone,
  e.address,
  e.location,
  e.salary,
  e.performance_score,
  e.employment_type,
  e.manager,
  e.projects_completed,
  e.bank_details,
  COALESCE(e.education, '[]'::jsonb)
FROM public.employees e
ON CONFLICT (employee_id) DO UPDATE SET
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  location = EXCLUDED.location,
  salary = EXCLUDED.salary,
  performance_score = EXCLUDED.performance_score,
  employment_type = EXCLUDED.employment_type,
  manager = EXCLUDED.manager,
  projects_completed = EXCLUDED.projects_completed,
  bank_details = EXCLUDED.bank_details,
  education = EXCLUDED.education;

ALTER TABLE public.employee_private_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS employee_private_details_select ON public.employee_private_details;
CREATE POLICY employee_private_details_select
ON public.employee_private_details
FOR SELECT
TO authenticated
USING (
  public.is_admin_or_manager()
  OR employee_id = public.get_my_employee_id()
);

DROP POLICY IF EXISTS employee_private_details_insert ON public.employee_private_details;
CREATE POLICY employee_private_details_insert
ON public.employee_private_details
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_or_manager()
  OR employee_id = public.get_my_employee_id()
);

DROP POLICY IF EXISTS employee_private_details_update ON public.employee_private_details;
CREATE POLICY employee_private_details_update
ON public.employee_private_details
FOR UPDATE
TO authenticated
USING (
  public.is_admin_or_manager()
  OR employee_id = public.get_my_employee_id()
)
WITH CHECK (
  public.is_admin_or_manager()
  OR employee_id = public.get_my_employee_id()
);

DROP POLICY IF EXISTS employee_private_details_delete ON public.employee_private_details;
CREATE POLICY employee_private_details_delete
ON public.employee_private_details
FOR DELETE
TO authenticated
USING (public.is_admin_or_manager());

DROP TRIGGER IF EXISTS update_employee_private_details_updated_at ON public.employee_private_details;
CREATE TRIGGER update_employee_private_details_updated_at
BEFORE UPDATE ON public.employee_private_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.employees
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS salary,
  DROP COLUMN IF EXISTS performance_score,
  DROP COLUMN IF EXISTS employment_type,
  DROP COLUMN IF EXISTS manager,
  DROP COLUMN IF EXISTS projects_completed,
  DROP COLUMN IF EXISTS bank_details,
  DROP COLUMN IF EXISTS education;

UPDATE public.employees
SET avatar = regexp_replace(
  regexp_replace(avatar, '^.*?/avatars/', ''),
  '\?.*$',
  ''
)
WHERE avatar LIKE 'http%' AND avatar LIKE '%/avatars/%';

DROP POLICY IF EXISTS avatar_select ON storage.objects;
DROP POLICY IF EXISTS avatar_insert ON storage.objects;
DROP POLICY IF EXISTS avatar_update ON storage.objects;
DROP POLICY IF EXISTS avatar_delete ON storage.objects;

UPDATE storage.buckets
SET public = false
WHERE id = 'avatars';

CREATE OR REPLACE FUNCTION public.can_manage_avatar_object(object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    public.is_admin_or_manager()
    OR (
      split_part(object_name, '/', 1) ~* '^[0-9a-f-]{36}$'
      AND split_part(object_name, '/', 1)::uuid = public.get_my_employee_id()
    );
$function$;

REVOKE EXECUTE ON FUNCTION public.can_manage_avatar_object(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_avatar_object(text) TO authenticated, service_role;

CREATE POLICY avatar_select
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY avatar_insert
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND public.can_manage_avatar_object(name)
);

CREATE POLICY avatar_update
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND public.can_manage_avatar_object(name)
)
WITH CHECK (
  bucket_id = 'avatars'
  AND public.can_manage_avatar_object(name)
);

CREATE POLICY avatar_delete
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND public.can_manage_avatar_object(name)
);
