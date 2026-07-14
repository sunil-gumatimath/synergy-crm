-- Migration: resolve_backend_issues

-- B1: Create missing tables for performance module
CREATE TABLE IF NOT EXISTS public.performance_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  progress integer DEFAULT 0,
  due_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY performance_goals_select ON public.performance_goals FOR SELECT TO authenticated USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY performance_goals_insert ON public.performance_goals FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY performance_goals_update ON public.performance_goals FOR UPDATE TO authenticated USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY performance_goals_delete ON public.performance_goals FOR DELETE TO authenticated USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());

CREATE TABLE IF NOT EXISTS public.skills_assessment (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  proficiency_level integer DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  last_assessed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.skills_assessment ENABLE ROW LEVEL SECURITY;
CREATE POLICY skills_assessment_select ON public.skills_assessment FOR SELECT TO authenticated USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id());
CREATE POLICY skills_assessment_manage ON public.skills_assessment FOR ALL TO authenticated USING (public.is_admin_or_manager());

CREATE TABLE IF NOT EXISTS public.performance_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  feedback_text text NOT NULL,
  type text DEFAULT 'general',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.performance_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY performance_feedback_select ON public.performance_feedback FOR SELECT TO authenticated USING (public.is_admin_or_manager() OR employee_id = public.get_my_employee_id() OR reviewer_id = public.get_my_employee_id());
CREATE POLICY performance_feedback_insert ON public.performance_feedback FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_manager() OR reviewer_id = public.get_my_employee_id());
CREATE POLICY performance_feedback_update ON public.performance_feedback FOR UPDATE TO authenticated USING (public.is_admin_or_manager() OR reviewer_id = public.get_my_employee_id());
CREATE POLICY performance_feedback_delete ON public.performance_feedback FOR DELETE TO authenticated USING (public.is_admin_or_manager());

-- B2: Update Schema for performance_reviews
ALTER TABLE public.performance_reviews RENAME COLUMN overall_rating TO overall_score;
ALTER TABLE public.performance_reviews RENAME COLUMN submitted_at TO completed_at;

-- B3: Add manager_id foreign key
ALTER TABLE public.employees ADD COLUMN manager_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;

-- B4: Expose aggregate view for Department Analytics (run with security_invoker=false by default, so it bypasses RLS)
CREATE OR REPLACE VIEW public.analytics_department_stats AS
SELECT 
  e.department,
  COUNT(e.id) as headcount,
  AVG(ep.performance_score) as avg_performance,
  SUM(ep.salary) as total_payroll
FROM public.employees e
LEFT JOIN public.employee_private_details ep ON e.id = ep.employee_id
GROUP BY e.department;

GRANT SELECT ON public.analytics_department_stats TO authenticated;

-- B5: Add replacement policy for reviewers to see performance reviews
CREATE POLICY performance_reviews_select_reviewer 
ON public.performance_reviews 
FOR SELECT 
TO authenticated 
USING (reviewer_id = public.get_my_employee_id());

-- B6: Fix scale ambiguity (Overall Score)
ALTER TABLE public.performance_reviews ALTER COLUMN overall_score TYPE numeric(5,2);
ALTER TABLE public.performance_reviews ADD CONSTRAINT check_overall_score_range CHECK (overall_score >= 0 AND overall_score <= 100);
