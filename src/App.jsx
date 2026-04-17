import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Stats from "./components/Stats";
import { DashboardSkeleton, EmployeeListSkeleton, EmployeeDetailSkeleton, LeaveManagementSkeleton, AnalyticsSkeleton, TasksSkeleton, CalendarSkeleton, GenericViewSkeleton } from "./components/common/PageSkeletons";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Header from "./components/layout/Header";
import LoadingSpinner from "./components/common/LoadingSpinner";

const EmployeeList = React.lazy(() => import("./features/employees/EmployeeList"));
const EmployeeDetailPage = React.lazy(() => import("./pages/EmployeeDetailPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const SettingsView = React.lazy(() => import("./features/settings/SettingsView"));
import { useAuth } from "./contexts/AuthContext";
import { useUIStore } from "./store/uiStore";
import "./components/common/Avatar.css";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { isAdminOrManagerRole } from "./utils/roles";

const AnalyticsDashboard = React.lazy(
  () => import("./features/analytics/AnalyticsDashboard"),
);
const CalendarView = React.lazy(
  () => import("./features/calendar/CalendarView"),
);

const TasksView = React.lazy(
  () => import("./features/tasks/TasksView"),
);
const SupportView = React.lazy(
  () => import("./features/support/SupportView"),
);
const EmployeeDashboard = React.lazy(
  () => import("./features/dashboard/EmployeeDashboard"),
);
const LeaveManagement = React.lazy(
  () => import("./features/leave/LeaveManagement"),
);
const TimeTracking = React.lazy(
  () => import("./features/timetracking/TimeTracking"),
);
const ReportsView = React.lazy(
  () => import("./features/reports/ReportsView"),
);
const TeamChat = React.lazy(
  () => import("./features/chat/TeamChat"),
);
const PerformanceReviews = React.lazy(
  () => import("./features/performance/PerformanceReviews"),
);

const HomeRedirect = () => {
  const { user, profileLoaded } = useAuth();
  // Wait until the DB-backed role is loaded before deciding where to land -
  // user_metadata.role can be stale/missing and would otherwise send an admin
  // to /dashboard first and never auto-correct.
  if (!profileLoaded) {
    return <LoadingSpinner />;
  }
  if (isAdminOrManagerRole(user?.role)) {
    return <Navigate to="/analytics" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};


function App() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);

  // Check if current route is a public route (no auth required)
  const isPublicRoute = location.pathname === "/login" ||
    location.pathname === "/reset-password" ||
    location.pathname.startsWith("/reset-password");

  // Determine active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/employees")) return "employees";
    if (path.startsWith("/tasks")) return "tasks";
    if (path.startsWith("/timetracking")) return "timetracking";
    if (path.startsWith("/leave")) return "leave";
    if (path.startsWith("/support")) return "support";
    if (path.startsWith("/analytics")) return "analytics";
    if (path.startsWith("/calendar")) return "calendar";
    if (path.startsWith("/reports")) return "reports";
    if (path.startsWith("/chat")) return "chat";
    if (path.startsWith("/performance")) return "performance";
    if (path.startsWith("/settings")) return "settings";
    return "dashboard"; // Default fallback
  };

  const activeTab = getActiveTab();

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle public routes
  if (isPublicRoute) {
    // If user is logged in and tries to access login page, redirect to home
    if (user && location.pathname === "/login") {
      return <Navigate to="/" replace />;
    }

    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If not logged in and trying to access protected route, show login
  if (!user) {
    return <LoginPage />;
  }

  // Main authenticated app layout
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <Sidebar activeTab={activeTab} />

        <main className="main-content">
          <Header />

          <Routes>
            <Route path="/" element={<HomeRedirect />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['Employee', 'Admin', 'Manager']}>
                  <Suspense
                    fallback={
                      <DashboardSkeleton />
                    }
                  >
                    <EmployeeDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                  <Suspense
                  fallback={
                    <AnalyticsSkeleton />
                  }
                >
                  <AnalyticsDashboard />
                </Suspense>
                </ProtectedRoute>
              }
            />


            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                  <Suspense fallback={<EmployeeListSkeleton />}>
                    <>
                      <Stats />
                      <EmployeeList />
                    </>
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees/:id"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                  <Suspense fallback={<EmployeeDetailSkeleton />}>
                    <EmployeeDetailPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/calendar"
              element={
                <Suspense
                  fallback={
                    <CalendarSkeleton />
                  }
                >
                  <CalendarView />
                </Suspense>
              }
            />

            <Route
              path="/tasks"
              element={
                <Suspense
                  fallback={
                    <TasksSkeleton />
                  }
                >
                  <TasksView />
                </Suspense>
              }
            />

            <Route
              path="/support"
              element={
                <Suspense
                  fallback={
                    <GenericViewSkeleton title="Support" />
                  }
                >
                  <SupportView />
                </Suspense>
              }
            />

            <Route
              path="/leave"
              element={
                <Suspense
                  fallback={
                    <LeaveManagementSkeleton />
                  }
                >
                  <LeaveManagement />
                </Suspense>
              }
            />

            <Route
              path="/timetracking"
              element={
                <Suspense
                  fallback={
                    <GenericViewSkeleton title="Time Tracking" />
                  }
                >
                  <TimeTracking />
                </Suspense>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                  <Suspense
                    fallback={
                      <GenericViewSkeleton title="Reports" />
                    }
                  >
                    <ReportsView />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <Suspense
                  fallback={
                    <GenericViewSkeleton title="Chat" />
                  }
                >
                  <TeamChat />
                </Suspense>
              }
            />

            <Route
              path="/performance"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Employee']}>
                  <Suspense
                    fallback={
                      <GenericViewSkeleton title="Performance" />
                    }
                  >
                    <PerformanceReviews />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <Suspense fallback={<GenericViewSkeleton title="Settings" />}>
                  <SettingsView />
                </Suspense>
              }
            />

            <Route path="/profile" element={<ProfilePage />} />

            <Route
              path="*"
              element={
                <div className="flex items-center justify-center h-64 text-muted">
                  Page not found
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
