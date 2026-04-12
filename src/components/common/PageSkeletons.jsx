import { Skeleton } from './Skeleton';
import { ChevronRight } from '../../lib/icons';

// Stats Skeleton (used in EmployeeList and Dashboard)
export const SkeletonStats = () => (
    <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        ))}
    </div>
);

// Employee Dashboard Skeleton
export const DashboardSkeleton = () => (
    <div className="emp-dash-container p-6">
        <div className="emp-dash-welcome mb-8 p-8 rounded-2xl bg-gray-50 border border-gray-100">
            <Skeleton width="300px" height="36px" />
            <Skeleton width="450px" height="20px" className="mt-4" />
            <Skeleton width="200px" height="16px" className="mt-2" />
        </div>

        <div className="emp-dash-stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton height="120px" borderRadius="16px" />
            <Skeleton height="120px" borderRadius="16px" />
            <Skeleton height="120px" borderRadius="16px" />
        </div>

        <div className="emp-dash-content-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="emp-dash-tasks-section">
                <Skeleton width="180px" height="28px" className="mb-6" />
                <div className="flex flex-col gap-4">
                    <Skeleton height="80px" borderRadius="12px" />
                    <Skeleton height="80px" borderRadius="12px" />
                    <Skeleton height="80px" borderRadius="12px" />
                </div>
            </div>
            <div className="emp-dash-events-section">
                <Skeleton width="180px" height="28px" className="mb-6" />
                <Skeleton height="300px" borderRadius="16px" />
            </div>
        </div>
    </div>
);

// Employee List Skeleton
export const EmployeeListSkeleton = () => (
    <div className="employees-container p-6">
        <div className="flex items-center justify-between mb-8">
            <div>
                <Skeleton width="200px" height="32px" />
                <Skeleton width="180px" height="16px" className="mt-2" />
            </div>
            <div className="flex gap-3">
                <Skeleton width="120px" height="40px" borderRadius="8px" />
                <Skeleton width="120px" height="40px" borderRadius="8px" />
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <Skeleton width="56px" height="56px" borderRadius="12px" />
                        <div>
                            <Skeleton width="120px" height="18px" />
                            <Skeleton width="80px" height="14px" className="mt-1" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton width="100%" height="12px" />
                        <Skeleton width="90%" height="12px" />
                        <Skeleton width="40%" height="24px" borderRadius="12px" className="mt-4" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Employee Detail Skeleton
export const EmployeeDetailSkeleton = () => (
    <div className="emp-detail">
        <div className="emp-detail__wrapper">
            {/* Breadcrumb Skeleton */}
            <nav className="emp-detail__breadcrumb px-6 py-4">
                <div className="flex items-center gap-2">
                    <Skeleton width="80px" height="14px" />
                    <ChevronRight size={14} className="text-gray-300" />
                    <Skeleton width="120px" height="14px" />
                </div>
            </nav>

            {/* Hero Card Skeleton */}
            <div className="emp-detail__hero mx-6 mb-8 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                <div className="h-32 bg-gray-50" />
                <div className="px-8 pb-8 -mt-12 flex flex-col md:flex-row items-end md:items-center gap-6">
                    <Skeleton width="140px" height="140px" borderRadius="24px" className="border-4 border-white shadow-md" />
                    <div className="flex-1">
                        <Skeleton width="250px" height="32px" />
                        <div className="flex gap-4 mt-3">
                            <Skeleton width="100px" height="16px" />
                            <Skeleton width="100px" height="16px" />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Skeleton width="80px" height="24px" borderRadius="12px" />
                            <Skeleton width="80px" height="24px" borderRadius="12px" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Skeleton width="100px" height="40px" borderRadius="10px" />
                        <Skeleton width="100px" height="40px" borderRadius="10px" />
                    </div>
                </div>
            </div>

            {/* Main Grid Skeleton */}
            <div className="emp-detail__grid px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1 space-y-6">
                    <div className="card p-6 bg-white rounded-2xl border border-gray-100">
                        <Skeleton width="120px" height="24px" className="mb-6" />
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton width="40px" height="40px" borderRadius="10px" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton width="60px" height="12px" />
                                        <Skeleton width="100%" height="16px" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
                <main className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="card p-4 bg-white rounded-xl border border-gray-100">
                                <Skeleton width="32px" height="32px" borderRadius="8px" className="mb-3" />
                                <Skeleton width="60px" height="12px" className="mb-2" />
                                <Skeleton width="80px" height="20px" />
                            </div>
                        ))}
                    </div>
                    <div className="card p-8 bg-white rounded-2xl border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton width="44px" height="44px" borderRadius="12px" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton width="80px" height="12px" />
                                        <Skeleton width="100%" height="16px" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>
);

// Leave Management Skeleton
export const LeaveManagementSkeleton = () => (
    <div className="leave-management">
        {/* Header */}
        <div className="leave-header">
            <div className="leave-header-left">
                <Skeleton width="280px" height="32px" />
                <Skeleton width="350px" height="16px" className="mt-2" />
            </div>
            <Skeleton width="160px" height="42px" borderRadius="10px" />
        </div>

        {/* Stats Cards */}
        <div className="leave-stats-grid">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="leave-stat-card">
                    <Skeleton width="48px" height="48px" borderRadius="12px" />
                    <div className="leave-stat-info">
                        <Skeleton width="40px" height="24px" />
                        <Skeleton width="100px" height="14px" className="mt-1" />
                    </div>
                </div>
            ))}
        </div>

        {/* Leave Balances */}
        <div className="leave-section">
            <Skeleton width="180px" height="28px" className="mb-4" />
            <div className="leave-balances-grid">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="leave-balance-card">
                        <Skeleton width="8px" height="60px" borderRadius="4px" />
                        <div className="leave-balance-info">
                            <Skeleton width="120px" height="18px" />
                            <div className="leave-balance-numbers flex gap-2 mt-2">
                                <Skeleton width="30px" height="20px" />
                                <Skeleton width="10px" height="20px" />
                                <Skeleton width="30px" height="20px" />
                                <Skeleton width="40px" height="14px" />
                            </div>
                            <div className="leave-balance-bar mt-3">
                                <Skeleton width="60%" height="8px" borderRadius="4px" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Tabs & Filters */}
        <div className="leave-tabs-section">
            <div className="leave-tabs">
                <Skeleton width="180px" height="40px" borderRadius="8px" />
                <Skeleton width="120px" height="40px" borderRadius="8px" />
                <Skeleton width="140px" height="40px" borderRadius="8px" />
            </div>
            <div className="leave-filters">
                <Skeleton width="140px" height="40px" borderRadius="8px" />
            </div>
        </div>

        {/* Leave Requests Table */}
        <div className="leave-requests-section">
            <div className="leave-requests-table">
                <table>
                    <thead>
                        <tr>
                            <th><Skeleton width="80px" height="16px" /></th>
                            <th><Skeleton width="80px" height="16px" /></th>
                            <th><Skeleton width="80px" height="16px" /></th>
                            <th><Skeleton width="60px" height="16px" /></th>
                            <th><Skeleton width="80px" height="16px" /></th>
                            <th><Skeleton width="80px" height="16px" /></th>
                            <th><Skeleton width="80px" height="16px" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map(i => (
                            <tr key={i}>
                                <td>
                                    <div className="leave-employee flex items-center gap-3">
                                        <Skeleton width="36px" height="36px" borderRadius="50%" />
                                        <div>
                                            <Skeleton width="100px" height="14px" />
                                            <Skeleton width="80px" height="12px" className="mt-1" />
                                        </div>
                                    </div>
                                </td>
                                <td><Skeleton width="80px" height="24px" borderRadius="12px" /></td>
                                <td>
                                    <div className="leave-dates flex items-center gap-1">
                                        <Skeleton width="80px" height="14px" />
                                        <Skeleton width="12px" height="12px" borderRadius="4px" />
                                        <Skeleton width="80px" height="14px" />
                                    </div>
                                </td>
                                <td><Skeleton width="60px" height="16px" /></td>
                                <td><Skeleton width="100px" height="14px" /></td>
                                <td><Skeleton width="80px" height="24px" borderRadius="12px" /></td>
                                <td>
                                    <div className="leave-actions flex gap-2">
                                        <Skeleton width="32px" height="32px" borderRadius="6px" />
                                        <Skeleton width="32px" height="32px" borderRadius="6px" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="leave-section">
            <Skeleton width="180px" height="28px" className="mb-4" />
            <div className="holidays-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="holiday-card">
                        <div className="holiday-date">
                            <Skeleton width="32px" height="32px" borderRadius="8px" />
                        </div>
                        <div className="holiday-info">
                            <Skeleton width="100px" height="18px" />
                            <Skeleton width="60px" height="14px" className="mt-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Analytics Skeleton
export const AnalyticsSkeleton = () => (
    <div className="analytics-container p-6">
        <div className="analytics-header mb-8">
            <Skeleton width="280px" height="36px" />
            <Skeleton width="400px" height="18px" className="mt-2" />
        </div>
        <div className="analytics-stats-grid grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} height="120px" borderRadius="16px" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Skeleton height="350px" borderRadius="20px" />
            <Skeleton height="350px" borderRadius="20px" />
        </div>
        <Skeleton height="200px" borderRadius="20px" />
    </div>
);

// Tasks Skeleton
export const TasksSkeleton = () => (
    <div className="tasks-container p-6">
        <div className="tasks-header flex justify-between items-center mb-8">
            <div>
                <Skeleton width="120px" height="32px" />
                <Skeleton width="250px" height="16px" className="mt-2" />
            </div>
            <Skeleton width="140px" height="42px" borderRadius="10px" />
        </div>
        <div className="tasks-stats grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} height="90px" borderRadius="16px" />
            ))}
        </div>
        <div className="tasks-board grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="task-column space-y-4">
                    <Skeleton width="100px" height="24px" className="mb-4" />
                    {[1, 2, 3].map(j => (
                        <Skeleton key={j} height="140px" borderRadius="12px" />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

// Calendar Skeleton
export const CalendarSkeleton = () => (
    <div className="calendar-view p-6">
        <div className="calendar-header flex justify-between items-center mb-8">
            <Skeleton width="200px" height="32px" />
            <div className="flex gap-4">
                <Skeleton width="120px" height="40px" borderRadius="8px" />
                <Skeleton width="40px" height="40px" borderRadius="8px" />
            </div>
        </div>
        <div className="calendar-grid border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-7 border-b">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <Skeleton key={i} height="50px" />
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="border p-2">
                        <Skeleton width="24px" height="24px" borderRadius="4px" className="mb-8" />
                        <Skeleton width="80%" height="12px" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Generic View Skeleton (for simpler pages like Support, Reports, etc.)
export const GenericViewSkeleton = ({ title = "Loading Page" }) => (
    <div className="generic-view p-8">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            <Skeleton width="400px" height="20px" className="mt-2" />
        </div>
        <div className="space-y-6">
            <Skeleton height="150px" borderRadius="16px" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton height="300px" borderRadius="16px" />
                <Skeleton height="300px" borderRadius="16px" />
            </div>
            <Skeleton height="250px" borderRadius="16px" />
        </div>
    </div>
);

// Time Tracking Skeleton - matches the actual TimeTracking component structure
export const TimeTrackingSkeleton = () => (
    <div className="timetracking">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <div>
                <Skeleton width="200px" height="32px" />
                <Skeleton width="300px" height="16px" className="mt-2" />
            </div>
        </div>

        {/* Clock In/Out Card */}
        <div className="card clock-card">
            <div className="clock-display">
                <Skeleton width="180px" height="48px" borderRadius="8px" />
                <Skeleton width="280px" height="20px" borderRadius="8px" className="mt-2" />
            </div>

            <div className="clock-status">
                <div className="flex items-center gap-2 mb-3">
                    <Skeleton width="24px" height="24px" borderRadius="12px" />
                    <Skeleton width="80px" height="16px" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <Skeleton width="20px" height="20px" borderRadius="8px" />
                    <Skeleton width="100px" height="18px" />
                </div>
                <Skeleton width="200px" height="14px" />
            </div>

            <div className="clock-actions">
                <Skeleton width="140px" height="48px" borderRadius="12px" />
            </div>
        </div>

        {/* Weekly Summary */}
        <div className="card weekly-section mt-6">
            <div className="section-header">
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton width="24px" height="24px" borderRadius="8px" />
                    <Skeleton width="180px" height="24px" />
                </div>
                <div className="week-navigator flex items-center gap-3">
                    <Skeleton width="36px" height="36px" borderRadius="8px" />
                    <Skeleton width="140px" height="18px" />
                    <Skeleton width="36px" height="36px" borderRadius="8px" />
                </div>
            </div>

            {/* Weekly Stats */}
            <div className="weekly-stats flex gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="weekly-stat flex items-center gap-3">
                        <Skeleton width="24px" height="24px" borderRadius="8px" />
                        <div className="stat-info">
                            <Skeleton width="50px" height="18px" />
                            <Skeleton width="60px" height="12px" className="mt-1" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily Breakdown */}
            <div className="daily-breakdown grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="day-card p-3">
                        <div className="day-header flex flex-col gap-1 mb-3">
                            <Skeleton width="30px" height="14px" />
                            <Skeleton width="24px" height="14px" />
                        </div>
                        <div className="day-hours">
                            <Skeleton width="40px" height="16px" />
                            <Skeleton width="100%" height="8px" borderRadius="4px" className="mt-2" />
                        </div>
                        <div className="day-times flex gap-1 mt-2">
                            <Skeleton width="35px" height="12px" />
                            <Skeleton width="35px" height="12px" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Team Chat Skeleton - matches sidebar + main chat area
export const TeamChatSkeleton = () => (
    <div className="chat-container">
        {/* Sidebar */}
        <aside className="chat-sidebar">
            <div className="chat-sidebar-header">
                <div className="chat-header-top">
                    <Skeleton width="200px" height="28px" />
                    <Skeleton width="40px" height="40px" borderRadius="8px" />
                </div>
                <div className="chat-search">
                    <Skeleton width="24px" height="24px" borderRadius="4px" />
                    <Skeleton width="100%" height="40px" borderRadius="8px" />
                </div>
            </div>
            <div className="chat-conversations">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="chat-conversation-item">
                        <Skeleton width="40px" height="40px" borderRadius="50%" />
                        <div className="chat-conversation-info">
                            <Skeleton width="120px" height="16px" />
                            <Skeleton width="180px" height="12px" className="mt-1" />
                        </div>
                    </div>
                ))}
            </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
            <div className="chat-main-header">
                <Skeleton width="40px" height="40px" borderRadius="8px" />
                <div className="chat-contact-info">
                    <Skeleton width="40px" height="40px" borderRadius="50%" />
                    <div>
                        <Skeleton width="120px" height="16px" />
                        <Skeleton width="60px" height="12px" className="mt-1" />
                    </div>
                </div>
                <div className="chat-header-actions">
                    <Skeleton width="40px" height="40px" borderRadius="8px" />
                    <Skeleton width="40px" height="40px" borderRadius="8px" />
                    <Skeleton width="40px" height="40px" borderRadius="8px" />
                </div>
            </div>
            <div className="chat-messages">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="chat-message">
                        <Skeleton width="40px" height="40px" borderRadius="50%" />
                        <div className="chat-message-content">
                            <Skeleton width="100px" height="14px" />
                            <div className="chat-message-bubble">
                                <Skeleton width="200px" height="16px" />
                                <Skeleton width="150px" height="16px" className="mt-1" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <form className="chat-input-area">
                <Skeleton width="40px" height="40px" borderRadius="8px" />
                <Skeleton width="100%" height="40px" borderRadius="8px" />
                <Skeleton width="40px" height="40px" borderRadius="8px" />
            </form>
        </main>
    </div>
);

// Support View Skeleton - matches header + stats + table
export const SupportViewSkeleton = () => (
    <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <div>
                <Skeleton width="280px" height="32px" />
                <Skeleton width="300px" height="16px" className="mt-2" />
            </div>
            <Skeleton width="140px" height="42px" borderRadius="10px" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="card p-4 flex items-center gap-4">
                    <Skeleton width="40px" height="40px" borderRadius="50%" />
                    <div>
                        <Skeleton width="40px" height="24px" />
                        <Skeleton width="80px" height="14px" className="mt-1" />
                    </div>
                </div>
            ))}
        </div>

        {/* Ticket List */}
        <div className="card flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <Skeleton width="100px" height="20px" />
                <div className="flex gap-2">
                    <Skeleton width="200px" height="32px" borderRadius="8px" />
                    <Skeleton width="80px" height="32px" borderRadius="8px" />
                </div>
            </div>
            <div className="overflow-y-auto flex-1">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-4"><Skeleton width="80px" height="16px" /></th>
                            <th className="p-4"><Skeleton width="80px" height="16px" /></th>
                            <th className="p-4"><Skeleton width="80px" height="16px" /></th>
                            <th className="p-4"><Skeleton width="80px" height="16px" /></th>
                            <th className="p-4"><Skeleton width="100px" height="16px" /></th>
                            <th className="p-4"><Skeleton width="60px" height="16px" /></th>
                            <th className="p-4"><Skeleton width="40px" height="16px" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                <td className="p-4"><Skeleton width="60px" height="14px" /></td>
                                <td className="p-4"><Skeleton width="150px" height="16px" /></td>
                                <td className="p-4"><Skeleton width="80px" height="14px" /></td>
                                <td className="p-4"><Skeleton width="80px" height="24px" borderRadius="12px" /></td>
                                <td className="p-4"><Skeleton width="100px" height="14px" /></td>
                                <td className="p-4"><Skeleton width="60px" height="14px" /></td>
                                <td className="p-4"><Skeleton width="32px" height="32px" borderRadius="6px" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

// Performance Reviews Skeleton - matches header + stats + tabs + content
export const PerformanceReviewsSkeleton = () => (
    <div className="perf-container">
        {/* Header */}
        <div className="perf-header">
            <div className="perf-header-content">
                <div className="perf-header-icon">
                    <Skeleton width="48px" height="48px" borderRadius="12px" />
                </div>
                <div>
                    <Skeleton width="220px" height="32px" />
                    <Skeleton width="280px" height="16px" className="mt-2" />
                </div>
            </div>
            <div className="perf-header-actions">
                <Skeleton width="120px" height="42px" borderRadius="10px" />
                <Skeleton width="140px" height="42px" borderRadius="10px" />
            </div>
        </div>

        {/* Stats */}
        <div className="perf-stats-grid">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="perf-stat-card">
                    <div className="perf-stat-icon">
                        <Skeleton width="32px" height="32px" borderRadius="8px" />
                    </div>
                    <div>
                        <Skeleton width="40px" height="24px" />
                        <Skeleton width="80px" height="14px" className="mt-1" />
                    </div>
                </div>
            ))}
        </div>

        {/* Tabs */}
        <div className="perf-tabs">
            {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} width="100px" height="40px" borderRadius="8px" />
            ))}
        </div>

        {/* Content */}
        <div className="perf-content">
            <div className="perf-reviews-tab">
                <div className="perf-filters">
                    <div className="perf-search">
                        <Skeleton width="24px" height="24px" borderRadius="4px" />
                        <Skeleton width="200px" height="40px" borderRadius="8px" />
                    </div>
                    <div className="perf-filter-buttons">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} width="80px" height="36px" borderRadius="8px" />
                        ))}
                    </div>
                </div>
                <div className="perf-reviews-list">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="perf-review-card">
                            <div className="perf-review-left">
                                <Skeleton width="36px" height="36px" borderRadius="50%" />
                                <div>
                                    <Skeleton width="120px" height="16px" />
                                    <Skeleton width="100px" height="12px" className="mt-1" />
                                </div>
                            </div>
                            <div className="perf-review-middle">
                                <Skeleton width="80px" height="20px" />
                            </div>
                            <div className="perf-review-right">
                                <Skeleton width="80px" height="24px" borderRadius="12px" />
                                <Skeleton width="24px" height="24px" borderRadius="4px" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// Reports View Skeleton - matches header + tabs + summary + table
export const ReportsViewSkeleton = () => (
    <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
            <div className="reports-title-section">
                <div className="reports-icon-wrapper">
                    <Skeleton width="40px" height="40px" borderRadius="12px" />
                </div>
                <div>
                    <Skeleton width="120px" height="32px" />
                    <Skeleton width="200px" height="16px" className="mt-2" />
                </div>
            </div>
            <div className="reports-actions">
                <Skeleton width="120px" height="42px" borderRadius="10px" />
                <Skeleton width="100px" height="42px" borderRadius="10px" />
                <Skeleton width="140px" height="42px" borderRadius="10px" />
            </div>
        </div>

        {/* Tabs */}
        <div className="reports-tabs">
            {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} width="100px" height="44px" borderRadius="8px" />
            ))}
        </div>

        {/* Summary Cards */}
        <div className="reports-summary-grid">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="reports-summary-card">
                    <div className="summary-icon">
                        <Skeleton width="32px" height="32px" borderRadius="8px" />
                    </div>
                    <div className="summary-content">
                        <Skeleton width="60px" height="24px" />
                        <Skeleton width="80px" height="14px" className="mt-1" />
                    </div>
                </div>
            ))}
        </div>

        {/* Table */}
        <table className="reports-table">
            <thead>
                <tr>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <th key={i}><Skeleton width="80px" height="16px" /></th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                        {[1, 2, 3, 4, 5, 6].map(j => (
                            <td key={j}><Skeleton width="100px" height="16px" /></td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
