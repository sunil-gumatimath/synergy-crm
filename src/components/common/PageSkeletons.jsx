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
    <div className="leave-management p-6">
        <div className="leave-header flex justify-between items-center mb-8">
            <div>
                <Skeleton width="220px" height="32px" />
                <Skeleton width="300px" height="16px" className="mt-2" />
            </div>
            <Skeleton width="160px" height="42px" borderRadius="10px" />
        </div>

        <div className="leave-stats-grid grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} height="100px" borderRadius="16px" />
            ))}
        </div>

        <div className="leave-section mb-8">
            <Skeleton width="150px" height="24px" className="mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} height="80px" borderRadius="12px" />
                ))}
            </div>
        </div>

        <div className="leave-section">
            <div className="flex gap-4 mb-6">
                <Skeleton width="120px" height="36px" borderRadius="8px" />
                <Skeleton width="120px" height="36px" borderRadius="8px" />
            </div>
            <Skeleton height="300px" borderRadius="16px" />
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
