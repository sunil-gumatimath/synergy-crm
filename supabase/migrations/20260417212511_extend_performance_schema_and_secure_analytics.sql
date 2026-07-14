-- Migration: extend_performance_schema_and_secure_analytics

-- B11: review_cycles table
CREATE TABLE IF NOT EXISTS public.review_cycles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY review_cycles_select ON public.review_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY review_cycles_manage ON public.review_cycles FOR ALL TO authenticated USING (public.is_admin_or_manager());

-- B12: Extend performance_reviews
ALTER TABLE public.performance_reviews 
  ADD COLUMN IF NOT EXISTS review_type text DEFAULT 'annual',
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS categories jsonb DEFAULT '[]'::jsonb;

-- B7: Extend performance_goals
ALTER TABLE public.performance_goals 
  ADD COLUMN IF NOT EXISTS review_id uuid REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS target_date date,
  ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 1,
  ADD COLUMN IF NOT EXISTS period text;

-- B8: Extend skills_assessment
ALTER TABLE public.skills_assessment 
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS current_level numeric,
  ADD COLUMN IF NOT EXISTS target_level numeric,
  ADD COLUMN IF NOT EXISTS self_rating numeric,
  ADD COLUMN IF NOT EXISTS manager_rating numeric;

-- B9: Extend performance_feedback & fix ambiguity
ALTER TABLE public.performance_feedback 
  DROP COLUMN IF EXISTS reviewer_id CASCADE, -- Remove ambiguous employee FK
  ADD COLUMN IF NOT EXISTS provider_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_id uuid REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS relationship text;

-- Create feedback_requests
CREATE TABLE IF NOT EXISTS public.feedback_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  requested_from uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  relationship text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY feedback_requests_select ON public.feedback_requests FOR SELECT TO authenticated USING (public.is_admin_or_manager() OR requested_from = public.get_my_employee_id());
CREATE POLICY feedback_requests_insert ON public.feedback_requests FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_manager() OR EXISTS(SELECT 1 FROM public.performance_reviews pr WHERE pr.id = review_id AND pr.employee_id = public.get_my_employee_id()));
CREATE POLICY feedback_requests_update ON public.feedback_requests FOR UPDATE TO authenticated USING (public.is_admin_or_manager() OR requested_from = public.get_my_employee_id());
CREATE POLICY feedback_requests_delete ON public.feedback_requests FOR DELETE TO authenticated USING (public.is_admin_or_manager());

-- B10: Secure Analytics Department Stats
DROP VIEW IF EXISTS public.analytics_department_stats;

CREATE OR REPLACE FUNCTION public.get_analytics_department_stats()
RETURNS TABLE (
  department text,
  headcount bigint,
  avg_performance numeric,
  total_payroll numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Strict RBAC check inside the Security Definer function
  IF NOT public.is_admin_or_manager() THEN
    RAISE EXCEPTION 'Access denied. Only Admins and Managers can view department analytics.';
  END IF;

  RETURN QUERY
  SELECT 
    e.department,
    COUNT(e.id) as headcount,
    AVG(ep.performance_score) as avg_performance,
    SUM(ep.salary) as total_payroll
  FROM public.employees e
  LEFT JOIN public.employee_private_details ep ON e.id = ep.employee_id
  GROUP BY e.department;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_analytics_department_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_analytics_department_stats() TO authenticated, service_role;