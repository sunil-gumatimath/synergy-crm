import React, { useState, useEffect, useCallback } from "react";
import {
    Clock,
    Play,
    Square,
    Coffee,
    Calendar,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Timer,
    TrendingUp,
    AlertCircle,
} from "../../lib/icons";
import { timeTrackingService } from "../../services/timeTrackingService.js";
import { useAuth } from "../../contexts/AuthContext";
import { SkeletonTimeEntry, SkeletonStatCard, Skeleton } from "../../components/common/Skeleton";
import Toast from "../../components/common/Toast";
import "./timetracking-styles.css";

const TimeTracking = () => {
    const { user } = useAuth();
    const employeeId = user?.employeeId;

    // State
    const [loading, setLoading] = useState(true);
    const [todayEntry, setTodayEntry] = useState(null);
    const [weeklySummary, setWeeklySummary] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [toast, setToast] = useState(null);
    const [isClocking, setIsClocking] = useState(false);

    // Fetch data
    const fetchData = useCallback(async () => {
        if (!employeeId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [todayRes] = await Promise.all([
                timeTrackingService.getTodayEntry(employeeId),
            ]);

            setTodayEntry(todayRes.data);
            await fetchWeeklySummary();
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast("error", "Failed to load time tracking data");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId]);

    const fetchWeeklySummary = async () => {
        if (!employeeId) return;

        // Calculate week start based on offset
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + mondayOffset + weekOffset * 7);
        const weekStartStr = weekStart.toISOString().split("T")[0];

        const { data } = await timeTrackingService.getWeeklySummary(employeeId, weekStartStr);
        setWeeklySummary(data);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchWeeklySummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekOffset, employeeId]);

    // Update elapsed time every minute while clocked in
    useEffect(() => {
        if (todayEntry?.clock_in && !todayEntry?.clock_out) {
            const interval = setInterval(() => {
                const elapsed = timeTrackingService.getElapsedTime(todayEntry.clock_in);
                setElapsedTime(elapsed);
            }, 1000);

            // Initial calculation
            setElapsedTime(timeTrackingService.getElapsedTime(todayEntry.clock_in));

            return () => clearInterval(interval);
        } else {
            setElapsedTime(0);
        }
    }, [todayEntry]);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleClockIn = async () => {
        setIsClocking(true);
        try {
            const { data, error } = await timeTrackingService.clockIn(employeeId);
            if (error) throw error;
            setTodayEntry(data);
            showToast("success", "Clocked in successfully!");
            fetchWeeklySummary();
        } catch (error) {
            showToast("error", error.message || "Failed to clock in");
        } finally {
            setIsClocking(false);
        }
    };

    const handleClockOut = async () => {
        setIsClocking(true);
        try {
            const { data, error } = await timeTrackingService.clockOut(employeeId);
            if (error) throw error;
            setTodayEntry(data);
            showToast("success", "Clocked out successfully!");
            fetchWeeklySummary();
        } catch (error) {
            showToast("error", error.message || "Failed to clock out");
        } finally {
            setIsClocking(false);
        }
    };

    const formatElapsedTime = (hours) => {
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60);
        const s = Math.floor(((hours - h) * 60 - m) * 60);
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const isClockedIn = todayEntry?.clock_in && !todayEntry?.clock_out;

    if (loading) {
        return (
            <div className="timetracking">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Skeleton width="180px" height="32px" />
                        <Skeleton width="250px" height="14px" className="mt-2" />
                    </div>
                </div>

                {/* Clock Card Skeleton */}
                <div className="card clock-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <Skeleton width="200px" height="48px" />
                        <Skeleton width="280px" height="16px" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                        <Skeleton width="100px" height="28px" borderRadius="14px" />
                        <Skeleton width="120px" height="16px" />
                    </div>
                    <div style={{ marginTop: '24px' }}>
                        <Skeleton width="140px" height="44px" borderRadius="22px" />
                    </div>
                </div>

                {/* Weekly Summary Skeleton */}
                <div className="card weekly-section" style={{ marginTop: '24px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Skeleton width="20px" height="20px" borderRadius="4px" />
                            <Skeleton width="150px" height="20px" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Skeleton width="32px" height="32px" borderRadius="6px" />
                            <Skeleton width="120px" height="16px" />
                            <Skeleton width="32px" height="32px" borderRadius="6px" />
                        </div>
                    </div>

                    {/* Weekly Stats Skeleton */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonStatCard key={i} hasIcon={true} />
                        ))}
                    </div>

                    {/* Daily Breakdown Skeleton */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} style={{ padding: '16px', background: 'var(--bg-muted)', borderRadius: '8px' }}>
                                <Skeleton width="30px" height="14px" />
                                <Skeleton width="20px" height="20px" className="mt-2" />
                                <Skeleton width="40px" height="24px" className="mt-3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!employeeId) {
        return (
            <div className="timetracking-no-employee">
                <AlertCircle size={48} />
                <h2>Employee Profile Required</h2>
                <p>Your account is not linked to an employee profile. Please contact your administrator.</p>
            </div>
        );
    }


    return (
        <div className="timetracking">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-main flex items-center gap-2">
                        <Clock size={28} className="text-primary" />
                        Time Tracking
                    </h1>
                    <p className="text-muted text-sm">Track your work hours and view timesheets</p>
                </div>
            </div>

            {/* Clock In/Out Card */}
            <div className="card clock-card">
                <div className="clock-display">
                    <div className="current-time">
                        {new Date().toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </div>
                    <div className="current-date">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </div>
                </div>

                <div className="clock-status">
                    {isClockedIn ? (
                        <>
                            <div className="status-indicator active">
                                <span className="pulse"></span>
                                Working
                            </div>
                            <div className="elapsed-time">
                                <Timer size={20} />
                                <span>{formatElapsedTime(elapsedTime)}</span>
                            </div>
                            <p className="clock-in-time">
                                Clocked in at {timeTrackingService.formatTime(todayEntry.clock_in)}
                            </p>
                        </>
                    ) : todayEntry?.clock_out ? (
                        <>
                            <div className="status-indicator completed">
                                <Square size={16} />
                                Day Complete
                            </div>
                            <div className="day-summary">
                                <span>{timeTrackingService.formatTime(todayEntry.clock_in)}</span>
                                <span className="separator">→</span>
                                <span>{timeTrackingService.formatTime(todayEntry.clock_out)}</span>
                            </div>
                            <p className="total-hours">
                                Total: {timeTrackingService.formatDuration(todayEntry.total_hours)}
                            </p>
                        </>
                    ) : (
                        <div className="status-indicator idle">
                            <Coffee size={16} />
                            Not clocked in
                        </div>
                    )}
                </div>

                <div className="clock-actions">
                    {!isClockedIn && !todayEntry?.clock_out && (
                        <button
                            className="clock-btn clock-in"
                            onClick={handleClockIn}
                            disabled={isClocking}
                        >
                            <Play size={20} />
                            {isClocking ? "Clocking in..." : "Clock In"}
                        </button>
                    )}

                    {isClockedIn && (
                        <button
                            className="clock-btn clock-out"
                            onClick={handleClockOut}
                            disabled={isClocking}
                        >
                            <Square size={20} />
                            {isClocking ? "Clocking out..." : "Clock Out"}
                        </button>
                    )}
                </div>
            </div>

            {/* Weekly Summary */}
            {weeklySummary && (
                <div className="card weekly-section">
                    <div className="section-header">
                        <h2>
                            <Calendar size={20} />
                            Weekly Timesheet
                        </h2>
                        <div className="week-navigator">
                            <button onClick={() => setWeekOffset((prev) => prev - 1)}>
                                <ChevronLeft size={20} />
                            </button>
                            <span>
                                {new Date(weeklySummary.weekStart).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                                {" - "}
                                {new Date(weeklySummary.weekEnd).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                            <button
                                onClick={() => setWeekOffset((prev) => prev + 1)}
                                disabled={weekOffset >= 0}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Weekly Stats */}
                    <div className="weekly-stats">
                        <div className="weekly-stat">
                            <Clock size={20} />
                            <div className="stat-info">
                                <span className="stat-value">{weeklySummary.totalHours}h</span>
                                <span className="stat-label">Total Hours</span>
                            </div>
                        </div>
                        <div className="weekly-stat">
                            <Calendar size={20} />
                            <div className="stat-info">
                                <span className="stat-value">{weeklySummary.workingDays}</span>
                                <span className="stat-label">Days Worked</span>
                            </div>
                        </div>
                        <div className="weekly-stat">
                            <TrendingUp size={20} />
                            <div className="stat-info">
                                <span className="stat-value">{weeklySummary.averageHoursPerDay}h</span>
                                <span className="stat-label">Avg/Day</span>
                            </div>
                        </div>
                    </div>

                    {/* Daily Breakdown */}
                    <div className="daily-breakdown">
                        {weeklySummary.dailyData.map((day, index) => {
                            const isToday = day.date === new Date().toISOString().split("T")[0];
                            const isWeekend = index >= 5;
                            const percentage = Math.min((day.hours / 9) * 100, 100);

                            return (
                                <div
                                    key={day.date}
                                    className={`day-card ${isToday ? "today" : ""} ${isWeekend ? "weekend" : ""}`}
                                >
                                    <div className="day-header">
                                        <span className="day-name">{day.day}</span>
                                        <span className="day-date">
                                            {new Date(day.date).getDate()}
                                        </span>
                                    </div>
                                    <div className="day-hours">
                                        {day.hours > 0 ? (
                                            <>
                                                <span className="hours-value">{day.hours.toFixed(1)}h</span>
                                                <div className="hours-bar">
                                                    <div
                                                        className="hours-fill"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <span className="no-hours">{isWeekend ? "Off" : "--"}</span>
                                        )}
                                    </div>
                                    {day.clockIn && (
                                        <div className="day-times">
                                            <span>{timeTrackingService.formatTime(day.clockIn)}</span>
                                            {day.clockOut && (
                                                <>
                                                    <span>-</span>
                                                    <span>{timeTrackingService.formatTime(day.clockOut)}</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default TimeTracking;
