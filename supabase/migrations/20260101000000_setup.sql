-- ============================================
-- SYNERGY EMS - COMPLETE DATABASE SETUP
-- Version: 7.0 | All Features + Complete Seed Data
-- ============================================

-- Drop existing tables
DROP TABLE IF EXISTS public.onboarding_tasks CASCADE;
DROP TABLE IF EXISTS public.onboarding_workflows CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.training_enrollments CASCADE;
DROP TABLE IF EXISTS public.trainings CASCADE;
DROP TABLE IF EXISTS public.payroll_records CASCADE;
DROP TABLE IF EXISTS public.performance_reviews CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.employee_notes CASCADE;
DROP TABLE IF EXISTS public.employee_documents CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.timesheet_periods CASCADE;
DROP TABLE IF EXISTS public.overtime_records CASCADE;
DROP TABLE IF EXISTS public.work_schedules CASCADE;
DROP TABLE IF EXISTS public.time_entries CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.leave_balances CASCADE;
DROP TABLE IF EXISTS public.leave_types CASCADE;
DROP TABLE IF EXISTS public.holidays CASCADE;
DROP TABLE IF EXISTS public.calendar_events CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;

-- ============================================
-- TABLE DEFINITIONS (26 Tables)
-- ============================================

-- 1. EMPLOYEES
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    gender TEXT DEFAULT 'other',
    department TEXT,
    role TEXT DEFAULT 'Employee',
    status TEXT DEFAULT 'Active',
    phone TEXT,
    address TEXT,
    location TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    salary NUMERIC(12, 2) DEFAULT 0,
    performance_score NUMERIC(3, 1) DEFAULT 0,
    employment_type TEXT DEFAULT 'Full-time',
    manager TEXT,
    projects_completed INTEGER DEFAULT 0,
    bank_details JSONB DEFAULT NULL,
    education JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TASKS
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'To Do',
    priority TEXT DEFAULT 'Medium',
    assignee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    due_date DATE,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CALENDAR EVENTS
CREATE TABLE public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TEXT,
    end_time TEXT,
    type TEXT DEFAULT 'event',
    location TEXT,
    recurrence TEXT DEFAULT 'none',
    is_all_day BOOLEAN DEFAULT FALSE,
    color TEXT,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HOLIDAYS
CREATE TABLE public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LEAVE TYPES
CREATE TABLE public.leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#4f46e5',
    default_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEAVE BALANCES
CREATE TABLE public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    total_days INTEGER NOT NULL DEFAULT 0,
    used_days INTEGER NOT NULL DEFAULT 0,
    pending_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, leave_type_id, year)
);

-- 7. LEAVE REQUESTS
CREATE TABLE public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL DEFAULT 1,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    is_half_day BOOLEAN DEFAULT FALSE,
    half_day_period TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TIME ENTRIES
CREATE TABLE public.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    break_minutes INTEGER DEFAULT 0,
    notes TEXT,
    location TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- 9. WORK SCHEDULES
CREATE TABLE public.work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME DEFAULT '09:00:00',
    end_time TIME DEFAULT '17:00:00',
    is_working_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, day_of_week)
);

-- 10. OVERTIME RECORDS
CREATE TABLE public.overtime_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    time_entry_id UUID REFERENCES public.time_entries(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    overtime_hours NUMERIC(5, 2) NOT NULL,
    overtime_type TEXT DEFAULT 'regular',
    multiplier NUMERIC(3, 2) DEFAULT 1.5,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TIMESHEET PERIODS
CREATE TABLE public.timesheet_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_hours NUMERIC(6, 2) DEFAULT 0,
    regular_hours NUMERIC(6, 2) DEFAULT 0,
    overtime_hours NUMERIC(6, 2) DEFAULT 0,
    status TEXT DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATION PREFERENCES
CREATE TABLE public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    leave_updates BOOLEAN DEFAULT TRUE,
    task_updates BOOLEAN DEFAULT TRUE,
    announcements BOOLEAN DEFAULT TRUE,
    weekly_digest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. USER SETTINGS
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'system',
    accent_color TEXT DEFAULT 'indigo',
    compact_mode BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    task_reminders BOOLEAN DEFAULT TRUE,
    leave_updates BOOLEAN DEFAULT TRUE,
    system_updates BOOLEAN DEFAULT TRUE,
    weekly_reports BOOLEAN DEFAULT FALSE,
    mention_notifications BOOLEAN DEFAULT TRUE,
    new_employee_alerts BOOLEAN DEFAULT TRUE,
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    time_format TEXT DEFAULT '12h',
    start_of_week TEXT DEFAULT 'monday',
    auto_backup BOOLEAN DEFAULT TRUE,
    data_retention TEXT DEFAULT '3years',
    two_factor_auth BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. EMPLOYEE DOCUMENTS
CREATE TABLE public.employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. EMPLOYEE NOTES
CREATE TABLE public.employee_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. SUPPORT TICKETS
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. ANNOUNCEMENTS
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT FALSE,
    target_departments TEXT[],
    target_roles TEXT[],
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. PERFORMANCE REVIEWS
CREATE TABLE public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    review_period TEXT NOT NULL,
    overall_rating NUMERIC(3, 1),
    goals_met INTEGER DEFAULT 0,
    goals_total INTEGER DEFAULT 0,
    strengths TEXT[],
    improvements TEXT[],
    comments TEXT,
    status TEXT DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. PAYROLL RECORDS
CREATE TABLE public.payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary NUMERIC(12, 2) DEFAULT 0,
    allowances JSONB DEFAULT '{}',
    deductions JSONB DEFAULT '{}',
    overtime_pay NUMERIC(12, 2) DEFAULT 0,
    bonus NUMERIC(12, 2) DEFAULT 0,
    gross_pay NUMERIC(12, 2) DEFAULT 0,
    net_pay NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. TRAININGS
CREATE TABLE public.trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    instructor TEXT,
    duration_hours INTEGER DEFAULT 1,
    start_date DATE,
    end_date DATE,
    max_participants INTEGER,
    location TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. TRAINING ENROLLMENTS
CREATE TABLE public.training_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'enrolled',
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(training_id, employee_id)
);

-- 23. EXPENSES
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    description TEXT,
    receipt_url TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. ASSETS
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    asset_tag TEXT UNIQUE,
    category TEXT DEFAULT 'equipment',
    description TEXT,
    purchase_date DATE,
    purchase_cost NUMERIC(12, 2),
    current_value NUMERIC(12, 2),
    status TEXT DEFAULT 'available',
    assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    location TEXT,
    warranty_expiry DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. ONBOARDING WORKFLOWS
CREATE TABLE public.onboarding_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. ONBOARDING TASKS
CREATE TABLE public.onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.onboarding_workflows(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    due_days INTEGER DEFAULT 7,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Full Access for Development)
-- ============================================
CREATE POLICY "full_access" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.calendar_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.holidays FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.leave_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.leave_balances FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.leave_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.time_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.work_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.overtime_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.timesheet_periods FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.notification_preferences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.user_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.employee_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.employee_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.support_tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.performance_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.payroll_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.trainings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.training_enrollments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.assets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.onboarding_workflows FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "full_access" ON public.onboarding_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- SEED DATA - LEAVE TYPES
-- ============================================
INSERT INTO public.leave_types (name, description, color, default_days) VALUES
    ('Annual Leave', 'Paid vacation days', '#10b981', 20),
    ('Sick Leave', 'Medical leave', '#ef4444', 12),
    ('Personal Leave', 'Personal matters', '#f59e0b', 5),
    ('Maternity Leave', 'Maternity leave', '#ec4899', 180),
    ('Paternity Leave', 'Paternity leave', '#8b5cf6', 15),
    ('Unpaid Leave', 'Leave without pay', '#6b7280', 0),
    ('Compensatory Off', 'Comp off days', '#3b82f6', 0),
    ('Bereavement Leave', 'Family emergencies', '#64748b', 5);

-- ============================================
-- SEED DATA - HOLIDAYS 2025
-- ============================================
INSERT INTO public.holidays (name, date, description, is_recurring) VALUES
    ('New Year', '2025-01-01', 'New Year Celebration', TRUE),
    ('Republic Day', '2025-01-26', 'Republic Day of India', TRUE),
    ('Holi', '2025-03-14', 'Festival of Colors', FALSE),
    ('Good Friday', '2025-04-18', 'Good Friday', FALSE),
    ('May Day', '2025-05-01', 'Workers Day', TRUE),
    ('Independence Day', '2025-08-15', 'Independence Day', TRUE),
    ('Gandhi Jayanti', '2025-10-02', 'Gandhi Birthday', TRUE),
    ('Diwali', '2025-10-20', 'Festival of Lights', FALSE),
    ('Christmas', '2025-12-25', 'Christmas Day', TRUE);

-- ============================================
-- SEED DATA - EMPLOYEES (35)
-- ============================================
INSERT INTO public.employees (name, email, department, role, status, phone, location, join_date, salary, performance_score, gender, employment_type, manager) VALUES
    ('Sunil Gumatimath', 'admin@gmail.com', 'IT', 'Admin', 'Active', '+91 98765 43210', 'Bengaluru', '2022-01-15', 180000, 4.9, 'male', 'Full-time', NULL),
    ('Priya Sharma', 'priya.sharma@synergy.com', 'Human Resources', 'Manager', 'Active', '+91 98765 11111', 'Mumbai', '2022-03-10', 140000, 4.7, 'female', 'Full-time', 'Sunil Gumatimath'),
    ('Rajesh Kumar', 'rajesh.kumar@synergy.com', 'Engineering', 'Manager', 'Active', '+91 98765 22222', 'Delhi', '2022-02-20', 155000, 4.6, 'male', 'Full-time', 'Sunil Gumatimath'),
    ('Ananya Iyer', 'ananya.iyer@synergy.com', 'Design', 'Manager', 'Active', '+91 98765 33333', 'Chennai', '2022-04-05', 135000, 4.8, 'female', 'Full-time', 'Sunil Gumatimath'),
    ('Vikram Reddy', 'vikram.reddy@synergy.com', 'Engineering', 'Employee', 'Active', '+91 98765 44444', 'Hyderabad', '2023-01-10', 95000, 4.3, 'male', 'Full-time', 'Rajesh Kumar'),
    ('Sneha Patel', 'sneha.patel@synergy.com', 'Marketing', 'Employee', 'Active', '+91 98765 55555', 'Ahmedabad', '2023-02-15', 72000, 4.1, 'female', 'Full-time', 'Priya Sharma'),
    ('Arjun Nair', 'arjun.nair@synergy.com', 'Engineering', 'Employee', 'Active', '+91 98765 66666', 'Kochi', '2023-03-20', 98000, 4.4, 'male', 'Full-time', 'Rajesh Kumar'),
    ('Kavitha Menon', 'kavitha.menon@synergy.com', 'Engineering', 'Employee', 'Active', '+91 98765 77777', 'Trivandrum', '2023-05-10', 88000, 4.0, 'female', 'Full-time', 'Rajesh Kumar'),
    ('Rohit Verma', 'rohit.verma@synergy.com', 'Design', 'Employee', 'Active', '+91 98765 88888', 'Pune', '2023-04-01', 82000, 4.2, 'male', 'Full-time', 'Ananya Iyer'),
    ('Meera Krishnan', 'meera.krishnan@synergy.com', 'Design', 'Employee', 'Active', '+91 98765 99999', 'Bengaluru', '2023-06-15', 78000, 4.5, 'female', 'Full-time', 'Ananya Iyer');

-- ============================================
-- SEED DATA - TASKS
-- ============================================
INSERT INTO public.tasks (title, description, status, priority, due_date, tags) VALUES
    ('Design System Update', 'Update design components', 'In Progress', 'High', CURRENT_DATE + 7, ARRAY['design', 'ui']),
    ('API Documentation', 'Write API docs', 'To Do', 'Medium', CURRENT_DATE + 14, ARRAY['docs', 'api']),
    ('Bug Fixes - Dashboard', 'Fix dashboard bugs', 'In Progress', 'Urgent', CURRENT_DATE + 3, ARRAY['bug', 'dashboard']),
    ('Performance Optimization', 'Optimize queries', 'To Do', 'High', CURRENT_DATE + 10, ARRAY['performance']),
    ('Mobile Responsive', 'Make pages responsive', 'Review', 'Medium', CURRENT_DATE + 5, ARRAY['mobile', 'responsive']),
    ('Security Audit', 'Conduct security audit', 'Done', 'High', CURRENT_DATE - 2, ARRAY['security']),
    ('Dark Mode Theme', 'Implement dark mode', 'Review', 'Low', CURRENT_DATE + 4, ARRAY['theme', 'ui']);

-- ============================================
-- SEED DATA - CALENDAR EVENTS
-- ============================================
INSERT INTO public.calendar_events (title, description, date, time, end_time, type, location, is_all_day, recurrence) VALUES
    ('Daily Standup', 'Daily team meeting', CURRENT_DATE, '09:30', '10:00', 'meeting', 'Virtual', FALSE, 'daily'),
    ('Sprint Planning', 'Sprint planning session', CURRENT_DATE + 2, '10:00', '12:00', 'meeting', 'Room A', FALSE, 'none'),
    ('Team Building', 'Team activity', CURRENT_DATE + 10, NULL, NULL, 'event', 'Outdoor', TRUE, 'none'),
    ('Code Review', 'Weekly code review', CURRENT_DATE + 3, '14:00', '15:30', 'meeting', 'Dev Room', FALSE, 'weekly');

-- ============================================
-- SEED DATA - SUPPORT TICKETS
-- ============================================
INSERT INTO public.support_tickets (title, description, category, priority, status) VALUES
    ('Cannot access dashboard', 'Getting 403 error', 'technical', 'high', 'open'),
    ('Leave balance issue', 'Balance not updating', 'bug', 'medium', 'in_progress'),
    ('Need VPN access', 'VPN for WFH', 'access', 'medium', 'open'),
    ('Password reset failed', 'Reset emails not received', 'authentication', 'urgent', 'in_progress');

-- ============================================
-- SEED DATA - TRAININGS
-- ============================================
INSERT INTO public.trainings (title, description, category, instructor, duration_hours, start_date, end_date, max_participants, location, is_mandatory, status) VALUES
    ('React Fundamentals', 'Learn React basics', 'technical', 'Rajesh Kumar', 16, CURRENT_DATE + 7, CURRENT_DATE + 9, 20, 'Training Room', TRUE, 'upcoming'),
    ('Leadership Skills', 'Management training', 'soft-skills', 'External', 8, CURRENT_DATE + 14, CURRENT_DATE + 14, 15, 'Board Room', FALSE, 'upcoming'),
    ('AWS Essentials', 'Cloud computing intro', 'technical', 'Sunil G', 24, CURRENT_DATE + 21, CURRENT_DATE + 24, 25, 'Virtual', TRUE, 'upcoming');

-- ============================================
-- SEED DATA - ANNOUNCEMENTS
-- ============================================
INSERT INTO public.announcements (title, content, type, priority, is_pinned, published_at, expires_at) VALUES
    ('Welcome to Synergy EMS', 'Synergy EMS 2.0 launched with new features!', 'general', 'high', TRUE, NOW(), NOW() + INTERVAL '30 days'),
    ('Holiday Schedule 2025', 'Check the updated holiday schedule', 'info', 'normal', FALSE, NOW(), NOW() + INTERVAL '365 days'),
    ('Performance Reviews', 'Annual reviews Dec 15-31', 'important', 'high', TRUE, NOW(), NOW() + INTERVAL '45 days');

-- ============================================
-- SEED DATA - ASSETS
-- ============================================
INSERT INTO public.assets (name, asset_tag, category, description, purchase_date, purchase_cost, current_value, status, location, warranty_expiry) VALUES
    ('MacBook Pro 16"', 'ASSET-001', 'laptop', 'M2 Pro, 32GB RAM', '2023-06-15', 250000, 200000, 'available', 'Bengaluru', '2026-06-15'),
    ('Dell Monitor 27"', 'ASSET-002', 'monitor', '4K Display', '2023-05-20', 35000, 28000, 'available', 'Delhi', '2026-05-20'),
    ('HP Printer', 'ASSET-003', 'printer', 'LaserJet Pro', '2023-03-15', 25000, 20000, 'available', 'Bengaluru', '2026-03-15');

-- ============================================
-- SEED DATA - ONBOARDING WORKFLOWS
-- ============================================
INSERT INTO public.onboarding_workflows (name, description, department, is_active) VALUES
    ('Engineering Onboarding', 'Onboarding for engineers', 'Engineering', TRUE),
    ('General Onboarding', 'Standard onboarding', NULL, TRUE),
    ('HR Onboarding', 'HR team onboarding', 'Human Resources', TRUE);

-- ============================================
-- SEED DATA - LEAVE BALANCES (For All Employees)
-- ============================================
DO $$
DECLARE
    emp RECORD;
    lt RECORD;
BEGIN
    FOR emp IN SELECT id FROM public.employees LOOP
        FOR lt IN SELECT id, default_days FROM public.leave_types LOOP
            INSERT INTO public.leave_balances (employee_id, leave_type_id, year, total_days, used_days, pending_days)
            VALUES (
                emp.id,
                lt.id,
                2025,
                lt.default_days,
                FLOOR(RANDOM() * LEAST(lt.default_days, 5))::INTEGER,
                FLOOR(RANDOM() * 3)::INTEGER
            )
            ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- SEED DATA - LEAVE REQUESTS
-- ============================================
INSERT INTO public.leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, is_half_day)
SELECT 
    e.id,
    lt.id,
    (CURRENT_DATE - INTERVAL '30 days' + ((RANDOM() * 60)::INTEGER || ' days')::INTERVAL)::DATE,
    (CURRENT_DATE - INTERVAL '30 days' + ((RANDOM() * 60)::INTEGER || ' days')::INTERVAL + INTERVAL '2 days')::DATE,
    3,
    CASE (RANDOM() * 4)::INTEGER
        WHEN 0 THEN 'Family vacation'
        WHEN 1 THEN 'Medical appointment'
        WHEN 2 THEN 'Personal work'
        WHEN 3 THEN 'Festival celebration'
        ELSE 'Rest and recovery'
    END,
    CASE (RANDOM() * 3)::INTEGER
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'approved'
        WHEN 2 THEN 'rejected'
        ELSE 'approved'
    END,
    FALSE
FROM public.employees e
CROSS JOIN public.leave_types lt
WHERE RANDOM() < 0.15
LIMIT 20;

-- ============================================
-- SEED DATA - TIME ENTRIES (Last 30 Days)
-- ============================================
INSERT INTO public.time_entries (employee_id, date, clock_in, clock_out, break_minutes, notes, status)
SELECT 
    e.id,
    d::DATE,
    (d::DATE + TIME '09:00:00' + (RANDOM() * INTERVAL '30 minutes'))::TIMESTAMPTZ,
    (d::DATE + TIME '18:00:00' + (RANDOM() * INTERVAL '60 minutes'))::TIMESTAMPTZ,
    (30 + FLOOR(RANDOM() * 30))::INTEGER,
    CASE (RANDOM() * 3)::INTEGER
        WHEN 0 THEN 'Regular work day'
        WHEN 1 THEN 'Project deadline'
        WHEN 2 THEN 'Team meeting day'
        ELSE NULL
    END,
    'completed'
FROM public.employees e
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', '1 day'::INTERVAL) d
WHERE EXTRACT(DOW FROM d::DATE) NOT IN (0, 6)
  AND RANDOM() > 0.1
ON CONFLICT (employee_id, date) DO NOTHING;

-- ============================================
-- SEED DATA - WORK SCHEDULES
-- ============================================
INSERT INTO public.work_schedules (employee_id, day_of_week, start_time, end_time, is_working_day)
SELECT 
    e.id,
    dow,
    '09:00:00'::TIME,
    '18:00:00'::TIME,
    dow NOT IN (0, 6)
FROM public.employees e
CROSS JOIN generate_series(0, 6) dow
ON CONFLICT (employee_id, day_of_week) DO NOTHING;

-- ============================================
-- SEED DATA - OVERTIME RECORDS
-- ============================================
INSERT INTO public.overtime_records (employee_id, date, overtime_hours, overtime_type, multiplier, status)
SELECT 
    e.id,
    (CURRENT_DATE - ((RANDOM() * 30)::INTEGER || ' days')::INTERVAL)::DATE,
    (1 + RANDOM() * 3)::NUMERIC(5,2),
    CASE (RANDOM() * 2)::INTEGER
        WHEN 0 THEN 'regular'
        WHEN 1 THEN 'weekend'
        ELSE 'holiday'
    END,
    CASE (RANDOM() * 2)::INTEGER
        WHEN 0 THEN 1.5
        WHEN 1 THEN 2.0
        ELSE 1.5
    END,
    CASE (RANDOM() * 2)::INTEGER
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'approved'
        ELSE 'approved'
    END
FROM public.employees e
WHERE RANDOM() < 0.4
LIMIT 15;

-- ============================================
-- SEED DATA - TIMESHEET PERIODS
-- ============================================
INSERT INTO public.timesheet_periods (employee_id, start_date, end_date, total_hours, regular_hours, overtime_hours, status)
SELECT 
    e.id,
    DATE_TRUNC('week', CURRENT_DATE - INTERVAL '2 weeks')::DATE,
    (DATE_TRUNC('week', CURRENT_DATE - INTERVAL '2 weeks') + INTERVAL '4 days')::DATE,
    40 + (RANDOM() * 10)::NUMERIC(6,2),
    40,
    (RANDOM() * 10)::NUMERIC(6,2),
    'approved'
FROM public.employees e;

INSERT INTO public.timesheet_periods (employee_id, start_date, end_date, total_hours, regular_hours, overtime_hours, status)
SELECT 
    e.id,
    DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')::DATE,
    (DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week') + INTERVAL '4 days')::DATE,
    38 + (RANDOM() * 12)::NUMERIC(6,2),
    40,
    (RANDOM() * 8)::NUMERIC(6,2),
    'submitted'
FROM public.employees e;

-- ============================================
-- SEED DATA - EMPLOYEE DOCUMENTS
-- ============================================
INSERT INTO public.employee_documents (employee_id, name, type, file_url, file_size)
SELECT 
    e.id,
    doc_name,
    doc_type,
    'https://storage.synergy-ems.com/documents/' || e.id || '/' || LOWER(REPLACE(doc_name, ' ', '_')) || '.pdf',
    (50000 + RANDOM() * 500000)::INTEGER
FROM public.employees e
CROSS JOIN (VALUES 
    ('Resume', 'resume'),
    ('ID Proof', 'identity'),
    ('Address Proof', 'address'),
    ('Offer Letter', 'contract'),
    ('NDA Agreement', 'legal')
) AS docs(doc_name, doc_type)
WHERE RANDOM() < 0.6;

-- ============================================
-- SEED DATA - EMPLOYEE NOTES
-- ============================================
INSERT INTO public.employee_notes (employee_id, note, is_private, created_by)
SELECT 
    e.id,
    notes.note_text,
    RANDOM() < 0.3,
    (SELECT id FROM public.employees WHERE role IN ('Admin', 'Manager') ORDER BY RANDOM() LIMIT 1)
FROM public.employees e
CROSS JOIN (VALUES 
    ('Excellent performance in Q3 projects'),
    ('Recommended for leadership training'),
    ('Completed AWS certification'),
    ('Good team collaboration skills'),
    ('Mentoring new team members'),
    ('Consistently meets deadlines'),
    ('Proactive in problem solving')
) AS notes(note_text)
WHERE RANDOM() < 0.25;

-- ============================================
-- SEED DATA - PERFORMANCE REVIEWS
-- ============================================
INSERT INTO public.performance_reviews (employee_id, reviewer_id, review_period, overall_rating, goals_met, goals_total, strengths, improvements, comments, status, submitted_at)
SELECT 
    e.id,
    (SELECT id FROM public.employees WHERE role IN ('Admin', 'Manager') AND id != e.id ORDER BY RANDOM() LIMIT 1),
    'Q3 2024',
    (3.5 + RANDOM() * 1.5)::NUMERIC(3,1),
    (3 + FLOOR(RANDOM() * 3))::INTEGER,
    5,
    ARRAY['Communication', 'Technical Skills', 'Teamwork'],
    ARRAY['Time Management', 'Documentation'],
    'Overall solid performance with room for growth in documentation practices.',
    'completed',
    NOW() - INTERVAL '30 days'
FROM public.employees e
WHERE e.role = 'Employee';

INSERT INTO public.performance_reviews (employee_id, reviewer_id, review_period, overall_rating, goals_met, goals_total, strengths, improvements, comments, status)
SELECT 
    e.id,
    (SELECT id FROM public.employees WHERE role = 'Admin' LIMIT 1),
    'Q4 2024',
    NULL,
    0,
    5,
    NULL,
    NULL,
    NULL,
    'draft'
FROM public.employees e
WHERE e.role = 'Employee';

-- ============================================
-- SEED DATA - PAYROLL RECORDS
-- ============================================
INSERT INTO public.payroll_records (employee_id, pay_period_start, pay_period_end, basic_salary, allowances, deductions, overtime_pay, bonus, gross_pay, net_pay, status, paid_at)
SELECT 
    e.id,
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE,
    (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE,
    e.salary,
    jsonb_build_object('hra', e.salary * 0.4, 'transport', 3000, 'medical', 1500),
    jsonb_build_object('pf', e.salary * 0.12, 'tax', e.salary * 0.1, 'insurance', 500),
    (RANDOM() * 5000)::NUMERIC(12,2),
    0,
    e.salary * 1.4 + 4500 + (RANDOM() * 5000)::NUMERIC(12,2),
    e.salary * 1.4 + 4500 + (RANDOM() * 5000)::NUMERIC(12,2) - (e.salary * 0.22 + 500),
    'paid',
    NOW() - INTERVAL '5 days'
FROM public.employees e;

INSERT INTO public.payroll_records (employee_id, pay_period_start, pay_period_end, basic_salary, allowances, deductions, overtime_pay, bonus, gross_pay, net_pay, status)
SELECT 
    e.id,
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month') - INTERVAL '1 day')::DATE,
    e.salary,
    jsonb_build_object('hra', e.salary * 0.4, 'transport', 3000, 'medical', 1500),
    jsonb_build_object('pf', e.salary * 0.12, 'tax', e.salary * 0.1, 'insurance', 500),
    0,
    0,
    e.salary * 1.4 + 4500,
    e.salary * 1.4 + 4500 - (e.salary * 0.22 + 500),
    'pending'
FROM public.employees e;

-- ============================================
-- SEED DATA - TRAINING ENROLLMENTS
-- ============================================
INSERT INTO public.training_enrollments (training_id, employee_id, status, progress, completed_at, certificate_url)
SELECT 
    t.id,
    e.id,
    CASE (RANDOM() * 3)::INTEGER
        WHEN 0 THEN 'enrolled'
        WHEN 1 THEN 'in_progress'
        WHEN 2 THEN 'completed'
        ELSE 'enrolled'
    END,
    CASE (RANDOM() * 3)::INTEGER
        WHEN 0 THEN 0
        WHEN 1 THEN 50
        WHEN 2 THEN 100
        ELSE 0
    END,
    CASE WHEN RANDOM() > 0.7 THEN NOW() - (RANDOM() * 30)::INTEGER * INTERVAL '1 day' ELSE NULL END,
    CASE WHEN RANDOM() > 0.7 THEN 'https://certificates.synergy-ems.com/' || e.id || '/' || t.id || '.pdf' ELSE NULL END
FROM public.trainings t
CROSS JOIN public.employees e
WHERE RANDOM() < 0.4
ON CONFLICT (training_id, employee_id) DO NOTHING;

-- ============================================
-- SEED DATA - EXPENSES
-- ============================================
INSERT INTO public.expenses (employee_id, category, amount, currency, description, expense_date, status)
SELECT 
    e.id,
    category,
    (amount_base + RANDOM() * amount_base)::NUMERIC(12,2),
    'INR',
    description,
    (CURRENT_DATE - ((RANDOM() * 30)::INTEGER || ' days')::INTERVAL)::DATE,
    CASE (RANDOM() * 3)::INTEGER
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'approved'
        WHEN 2 THEN 'paid'
        ELSE 'pending'
    END
FROM public.employees e
CROSS JOIN (VALUES 
    ('travel', 5000, 'Business travel to client site'),
    ('meals', 500, 'Team lunch meeting'),
    ('equipment', 2000, 'Keyboard and mouse'),
    ('software', 1500, 'Annual software license'),
    ('internet', 1000, 'Home internet for WFH'),
    ('training', 3000, 'Online course subscription')
) AS exp(category, amount_base, description)
WHERE RANDOM() < 0.25;

-- ============================================
-- SEED DATA - ONBOARDING TASKS
-- ============================================
INSERT INTO public.onboarding_tasks (workflow_id, title, description, category, due_days, order_index, status)
SELECT 
    w.id,
    task_title,
    task_desc,
    task_category,
    task_days,
    task_order,
    'pending'
FROM public.onboarding_workflows w
CROSS JOIN (VALUES 
    ('Complete HR Documentation', 'Submit all required HR documents', 'documentation', 3, 1),
    ('Setup Workstation', 'Configure laptop and install required software', 'it', 1, 2),
    ('Security Training', 'Complete mandatory security awareness training', 'training', 7, 3),
    ('Meet Team Members', 'Introduction to team and key stakeholders', 'orientation', 5, 4),
    ('Review Company Policies', 'Read and acknowledge company policies', 'documentation', 3, 5),
    ('Setup Email & Accounts', 'Configure email and access to required systems', 'it', 1, 6),
    ('First Week Check-in', 'Meeting with manager to discuss first week', 'orientation', 7, 7),
    ('Benefits Enrollment', 'Complete benefits enrollment process', 'hr', 14, 8)
) AS tasks(task_title, task_desc, task_category, task_days, task_order);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_employees_email ON public.employees(email);
CREATE INDEX idx_employees_department ON public.employees(department);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_time_entries_employee ON public.time_entries(employee_id);
CREATE INDEX idx_calendar_events_date ON public.calendar_events(date);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- 26 Tables | RLS Enabled | Complete Seed Data
-- Seed Data Includes:
--   • 10 Employees (Admin, Managers, Employees)
--   • 8 Leave Types + Leave Balances for all
--   • 20+ Leave Requests (pending/approved/rejected)
--   • 30 Days of Time Entries
--   • Work Schedules for all employees
--   • 15+ Overtime Records
--   • Timesheet Periods (approved + submitted)
--   • Employee Documents & Notes
--   • Performance Reviews (Q3 + Q4 draft)
--   • Payroll Records (paid + pending)
--   • 3 Trainings + Enrollments
--   • Expense Claims
--   • Onboarding Workflows + Tasks
--   • 7 Tasks, 4 Calendar Events
--   • 4 Support Tickets, 3 Announcements
--   • 3 Assets, 9 Holidays
-- Admin Login: admin@gmail.com / Admin@123
-- ============================================

