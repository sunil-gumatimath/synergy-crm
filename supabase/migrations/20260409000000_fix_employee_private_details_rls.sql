-- =============================================================
-- Fix Employee Private Details RLS Privilege Escalation
-- =============================================================
-- The previous policy allowed employees to update their own salary
-- and performance score by granting UPDATE on all columns.
-- We fix this by restricting updates only to non-sensitive columns
-- for the employee themselves, while Admins/Managers still have full access.
-- We use a trigger to prevent unauthorized column changes.

CREATE OR REPLACE FUNCTION public.check_private_details_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins and Managers can update anything
  IF public.is_admin_or_manager() THEN
    RETURN NEW;
  END IF;

  -- Employees updating their own record cannot change sensitive fields
  IF OLD.salary IS DISTINCT FROM NEW.salary OR
     OLD.performance_score IS DISTINCT FROM NEW.performance_score OR
     OLD.manager IS DISTINCT FROM NEW.manager OR
     OLD.employment_type IS DISTINCT FROM NEW.employment_type OR
     OLD.projects_completed IS DISTINCT FROM NEW.projects_completed
  THEN
    RAISE EXCEPTION 'You do not have permission to update sensitive fields (salary, performance_score, manager, employment_type, projects_completed).';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_private_details_permissions ON public.employee_private_details;
CREATE TRIGGER enforce_private_details_permissions
BEFORE UPDATE ON public.employee_private_details
FOR EACH ROW
EXECUTE FUNCTION public.check_private_details_update();

-- Also prevent INSERT privilege escalation for employees inserting their own row
CREATE OR REPLACE FUNCTION public.check_private_details_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin_or_manager() THEN
    RETURN NEW;
  END IF;

  IF NEW.salary IS DISTINCT FROM 0 AND NEW.salary IS NOT NULL OR
     NEW.performance_score IS DISTINCT FROM 0 AND NEW.performance_score IS NOT NULL OR
     NEW.manager IS NOT NULL OR
     NEW.employment_type IS DISTINCT FROM 'Full-time' AND NEW.employment_type IS NOT NULL OR
     NEW.projects_completed IS DISTINCT FROM 0 AND NEW.projects_completed IS NOT NULL
  THEN
    RAISE EXCEPTION 'You do not have permission to insert sensitive fields.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_private_details_insert_permissions ON public.employee_private_details;
CREATE TRIGGER enforce_private_details_insert_permissions
BEFORE INSERT ON public.employee_private_details
FOR EACH ROW
EXECUTE FUNCTION public.check_private_details_insert();
