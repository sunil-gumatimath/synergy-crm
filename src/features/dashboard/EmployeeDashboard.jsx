import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { taskService } from "../../services/taskService";
import { calendarService } from "../../services/calendarService";
import {
    MdCheckCircleOutline as CheckCircle,
    MdOutlineAccessTime as Clock,
    MdOutlineCalendarToday as CalendarIcon,
    MdOutlineFormatListBulleted as ListTodo,
    MdOutlineRefresh as RefreshCw,
    MdOutlineAssignment as ClipboardList,
    MdOutlineEditCalendar as CalendarPlus,
    MdOutlineDescription as FileText,
    MdOutlineTimer as Timer,
    MdOutlineAutoAwesome as Sparkles,
    MdOutlineErrorOutline as AlertCircle,
    MdOutlineArrowForward as ArrowRight,
    MdOutlineLocalCafe as Coffee,
    MdOutlineLightMode as Sun,
    MdOutlineDarkMode as Moon,
    MdOutlineWbTwilight as Sunrise,
} from "react-icons/md";
import { Link } from "react-router-dom";
import "./employee-dashboard-styles.css";

const MOTIVATIONAL_QUOTES = [
    "The only way to do great work is to love what you do. – Steve Jobs",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
    "Believe you can and you're halfway there. – Theodore Roosevelt",
    "Quality is not an act, it is a habit. – Aristotle",
    "The future depends on what you do today. – Mahatma Gandhi",
    "Don't watch the clock; do what it does. Keep going. – Sam Levenson",
    "The secret of getting ahead is getting started. – Mark Twain",
    "It always seems impossible until it's done. – Nelson Mandela",
    "Optimism is the faith that leads to achievement. – Helen Keller",
    "Start where you are. Use what you have. Do what you can. – Arthur Ashe",
    "Productivity is never an accident. It is always the result of a commitment to excellence. – Paul J. Meyer",
    "Focus on being productive instead of busy. – Tim Ferriss",
    "Simplicity is the ultimate sophistication. – Leonardo da Vinci",
    "Whatever you do, do it well. – Walt Disney",
    "Action is the foundational key to all success. – Pablo Picasso",
    "Efficiency is doing things right; effectiveness is doing the right things. – Peter Drucker"
];

// Skeleton Components
const SkeletonStatCard = () => (
    <div className="emp-dash-stat-card skeleton-card">
        <div className="skeleton skeleton-icon-sm"></div>
        <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text-sm"></div>
            <div className="skeleton skeleton-text-lg"></div>
        </div>
    </div>
);

const SkeletonTaskCard = () => (
    <div className="emp-dash-task-card skeleton-card">
        <div className="skeleton skeleton-badge"></div>
        <div className="skeleton skeleton-text-md"></div>
        <div className="skeleton skeleton-text-sm"></div>
    </div>
);

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, to, color }) => (
    <Link to={to} className="emp-dash-quick-action" style={{ '--action-color': color }}>
        <div className="emp-dash-quick-action-icon">
            <Icon size={20} />
        </div>
        <span>{label}</span>
        <ArrowRight size={16} className="emp-dash-quick-action-arrow" />
    </Link>
);

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [quote, setQuote] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const updateQuote = () => {
            const hour = new Date().getHours();
            setQuote(MOTIVATIONAL_QUOTES[hour % MOTIVATIONAL_QUOTES.length]);
        };
        updateQuote();
        const interval = setInterval(updateQuote, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = useCallback(async (showRefresh = false) => {
        if (showRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const [tasksRes, eventsRes] = await Promise.all([
                taskService.getAll(),
                calendarService.getAll()
            ]);

            if (tasksRes.data) {
                const myTasks = tasksRes.data.filter(t => t.assignee_id === user?.employeeId);
                setTasks(myTasks);
            }

            if (eventsRes.data) {
                const futureEvents = eventsRes.data
                    .filter(e => new Date(e.date) >= new Date().setHours(0, 0, 0, 0))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5);
                setEvents(futureEvents);
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user?.employeeId]);

    useEffect(() => {
        if (user) {
            fetchData();
            // Auto-refresh every 5 minutes
            const interval = setInterval(() => fetchData(true), 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user, fetchData]);

    const handleRefresh = () => {
        fetchData(true);
    };

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: "Good morning", icon: Sunrise, color: "#f59e0b" };
        if (hour < 17) return { text: "Good afternoon", icon: Sun, color: "#f97316" };
        if (hour < 21) return { text: "Good evening", icon: Coffee, color: "#8b5cf6" };
        return { text: "Good night", icon: Moon, color: "#6366f1" };
    };

    const greeting = getGreeting();
    const pendingTasks = tasks.filter(t => t.status !== 'Done');
    const completedTasks = tasks.filter(t => t.status === 'Done');
    const todayEvents = events.filter(e => {
        const eventDate = new Date(e.date).toDateString();
        const today = new Date().toDateString();
        return eventDate === today;
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high": return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
            case "medium": return { bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
            case "low": return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
            default: return { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" };
        }
    };

    const formatRelativeDate = (date) => {
        const eventDate = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (eventDate.toDateString() === today.toDateString()) return "Today";
        if (eventDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
        return eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="emp-dash-container">
                {/* Welcome Skeleton */}
                <div className="emp-dash-welcome skeleton-welcome">
                    <div className="skeleton skeleton-title-lg"></div>
                    <div className="skeleton skeleton-text-md" style={{ width: '60%', marginTop: '8px' }}></div>
                    <div className="skeleton skeleton-quote"></div>
                </div>

                {/* Stats Skeleton */}
                <div className="emp-dash-stats-grid">
                    <SkeletonStatCard />
                    <SkeletonStatCard />
                    <SkeletonStatCard />
                </div>

                {/* Content Skeleton */}
                <div className="emp-dash-content-grid">
                    <div className="emp-dash-tasks-section">
                        <div className="skeleton skeleton-section-title"></div>
                        <SkeletonTaskCard />
                        <SkeletonTaskCard />
                        <SkeletonTaskCard />
                    </div>
                    <div className="emp-dash-events-section">
                        <div className="skeleton skeleton-section-title"></div>
                        <div className="skeleton skeleton-event-card"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="emp-dash-container">
            {/* Welcome Section */}
            <div className="emp-dash-welcome">
                <div className="emp-dash-welcome-header">
                    <div className="emp-dash-welcome-content">
                        <div className="emp-dash-greeting">
                            <greeting.icon size={28} style={{ color: greeting.color }} />
                            <h1>{greeting.text}, {user?.name?.split(' ')[0] || 'Team Member'}!</h1>
                        </div>
                        <p className="emp-dash-subtitle">Here's what's happening today • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="emp-dash-header-actions">
                        {lastUpdated && (
                            <span className="emp-dash-last-updated">
                                <Clock size={12} />
                                {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                        <button
                            className={`emp-dash-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
                        </button>
                    </div>
                </div>
                <div className="emp-dash-quote">
                    <Sparkles size={16} className="emp-dash-quote-icon" />
                    <p>"{quote}"</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="emp-dash-quick-actions">
                <QuickActionButton icon={ClipboardList} label="View Tasks" to="/tasks" color="#4f46e5" />
                <QuickActionButton icon={CalendarPlus} label="Calendar" to="/calendar" color="#10b981" />
                <QuickActionButton icon={Timer} label="Time Track" to="/timetracking" color="#f59e0b" />
                <QuickActionButton icon={FileText} label="Leave Request" to="/leave" color="#ec4899" />
            </div>

            {/* Stats Row */}
            <div className="emp-dash-stats-grid">
                <div className="emp-dash-stat-card indigo">
                    <div className="emp-dash-stat-icon">
                        <ListTodo size={22} />
                    </div>
                    <div className="emp-dash-stat-content">
                        <span className="emp-dash-stat-label">Pending Tasks</span>
                        <span className="emp-dash-stat-value">{pendingTasks.length}</span>
                    </div>
                </div>
                <div className="emp-dash-stat-card green">
                    <div className="emp-dash-stat-icon">
                        <CheckCircle size={22} />
                    </div>
                    <div className="emp-dash-stat-content">
                        <span className="emp-dash-stat-label">Completed</span>
                        <span className="emp-dash-stat-value">{completedTasks.length}</span>
                    </div>
                </div>
                <div className="emp-dash-stat-card purple">
                    <div className="emp-dash-stat-icon">
                        <CalendarIcon size={22} />
                    </div>
                    <div className="emp-dash-stat-content">
                        <span className="emp-dash-stat-label">Today's Events</span>
                        <span className="emp-dash-stat-value">{todayEvents.length}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="emp-dash-content-grid">
                {/* Tasks Section */}
                <div className="emp-dash-tasks-section">
                    <div className="emp-dash-section-header">
                        <h2>
                            <ListTodo size={20} />
                            My Active Tasks
                        </h2>
                        <Link to="/tasks" className="emp-dash-view-all">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="emp-dash-tasks-list">
                        {pendingTasks.length > 0 ? (
                            pendingTasks.slice(0, 5).map((task, index) => {
                                const priorityStyle = getPriorityColor(task.priority);
                                return (
                                    <div
                                        key={task.id}
                                        className="emp-dash-task-card"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="emp-dash-task-header">
                                            <span
                                                className="emp-dash-task-priority"
                                                style={{
                                                    backgroundColor: priorityStyle.bg,
                                                    color: priorityStyle.text,
                                                    borderColor: priorityStyle.border
                                                }}
                                            >
                                                {task.priority}
                                            </span>
                                            <span className="emp-dash-task-due">
                                                <Clock size={12} />
                                                {formatRelativeDate(task.due_date)}
                                            </span>
                                        </div>
                                        <h3 className="emp-dash-task-title">{task.title}</h3>
                                        {task.description && (
                                            <p className="emp-dash-task-desc">{task.description}</p>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="emp-dash-empty-state">
                                <div className="emp-dash-empty-icon success">
                                    <CheckCircle size={32} />
                                </div>
                                <h3>All caught up!</h3>
                                <p>No pending tasks. Great job staying on top of your work!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Events Section */}
                <div className="emp-dash-events-section">
                    <div className="emp-dash-section-header">
                        <h2>
                            <CalendarIcon size={20} />
                            Upcoming Events
                        </h2>
                        <Link to="/calendar" className="emp-dash-view-all">
                            Calendar <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="emp-dash-events-list">
                        {events.length > 0 ? (
                            events.map((event, index) => (
                                <div
                                    key={event.id}
                                    className="emp-dash-event-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="emp-dash-event-date">
                                        <span className="emp-dash-event-day">{new Date(event.date).getDate()}</span>
                                        <span className="emp-dash-event-month">
                                            {new Date(event.date).toLocaleString('default', { month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="emp-dash-event-content">
                                        <h4>{event.title}</h4>
                                        <p>
                                            <Clock size={12} />
                                            {event.time} • {event.location || 'Remote'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="emp-dash-empty-state small">
                                <div className="emp-dash-empty-icon info">
                                    <AlertCircle size={24} />
                                </div>
                                <p>No upcoming events scheduled</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
