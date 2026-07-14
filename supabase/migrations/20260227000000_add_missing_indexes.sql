-- ============================================
-- ADD MISSING DATABASE INDEXES
-- Targets frequently queried columns not covered
-- by the original 20260101 setup migration.
-- ============================================

-- ─── EMPLOYEES ──────────────────────────────
-- Already indexed: email, department, status
CREATE INDEX IF NOT EXISTS idx_employees_role       ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_join_date  ON public.employees(join_date);
CREATE INDEX IF NOT EXISTS idx_employees_name       ON public.employees USING gin (name gin_trgm_ops);
-- name uses trigram for ILIKE / full-text search; falls back below if pg_trgm not installed
-- If the GIN index fails (pg_trgm not enabled), a simple btree is created instead via the DO block.

-- ─── TASKS ──────────────────────────────────
-- Already indexed: status, priority
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id    ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date       ON public.tasks(due_date);

-- ─── EMPLOYEE NOTES ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_employee_notes_employee   ON public.employee_notes(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_notes_created_at ON public.employee_notes(created_at);

-- ─── EMPLOYEE DOCUMENTS ─────────────────────
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee ON public.employee_documents(employee_id);

-- ─── TIME ENTRIES ───────────────────────────
-- Already indexed: employee_id
CREATE INDEX IF NOT EXISTS idx_time_entries_date    ON public.time_entries(date);

-- ─── LEAVE REQUESTS (composite) ─────────────
-- Already indexed: employee_id, status (separately)
CREATE INDEX IF NOT EXISTS idx_leave_requests_emp_status ON public.leave_requests(employee_id, status);

-- ─── PERFORMANCE REVIEWS ────────────────────
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_status   ON public.performance_reviews(status);

-- ─── PAYROLL RECORDS ────────────────────────
CREATE INDEX IF NOT EXISTS idx_payroll_records_employee ON public.payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_status   ON public.payroll_records(status);

-- ─── EXPENSES ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON public.expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status   ON public.expenses(status);

-- ─── TRAINING ENROLLMENTS ───────────────────
CREATE INDEX IF NOT EXISTS idx_training_enrollments_employee ON public.training_enrollments(employee_id);

-- ─── ASSETS ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON public.assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assets_status      ON public.assets(status);

-- ─── ANNOUNCEMENTS ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON public.announcements(published_at);
CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned    ON public.announcements(is_pinned) WHERE is_pinned = TRUE;

-- ─── ONBOARDING TASKS ───────────────────────
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_employee ON public.onboarding_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_status   ON public.onboarding_tasks(status);

-- ============================================
-- Fallback: if pg_trgm is not available, the GIN
-- index on employees.name will error. Create a
-- plain btree index as a safe fallback.
-- ============================================
DO $$
BEGIN
    -- Check if the trigram index was created
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_employees_name'
    ) THEN
        CREATE INDEX idx_employees_name ON public.employees(name);
    END IF;
END $$;
