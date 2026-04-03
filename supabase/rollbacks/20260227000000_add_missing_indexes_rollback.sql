-- ============================================
-- ROLLBACK: Remove indexes added in 20260227000000
-- ============================================

DROP INDEX IF EXISTS idx_employees_role;
DROP INDEX IF EXISTS idx_employees_join_date;
DROP INDEX IF EXISTS idx_employees_name;

DROP INDEX IF EXISTS idx_tasks_assignee_id;
DROP INDEX IF EXISTS idx_tasks_due_date;

DROP INDEX IF EXISTS idx_employee_notes_employee;
DROP INDEX IF EXISTS idx_employee_notes_created_at;

DROP INDEX IF EXISTS idx_employee_documents_employee;

DROP INDEX IF EXISTS idx_time_entries_date;

DROP INDEX IF EXISTS idx_leave_requests_emp_status;

DROP INDEX IF EXISTS idx_performance_reviews_employee;
DROP INDEX IF EXISTS idx_performance_reviews_status;

DROP INDEX IF EXISTS idx_payroll_records_employee;
DROP INDEX IF EXISTS idx_payroll_records_status;

DROP INDEX IF EXISTS idx_expenses_employee;
DROP INDEX IF EXISTS idx_expenses_status;

DROP INDEX IF EXISTS idx_training_enrollments_employee;

DROP INDEX IF EXISTS idx_assets_assigned_to;
DROP INDEX IF EXISTS idx_assets_status;

DROP INDEX IF EXISTS idx_announcements_published_at;
DROP INDEX IF EXISTS idx_announcements_is_pinned;

DROP INDEX IF EXISTS idx_onboarding_tasks_employee;
DROP INDEX IF EXISTS idx_onboarding_tasks_status;
