import React, { useState, useEffect } from "react";
import {
    Target, Star, TrendingUp, Users, Calendar, Clock, ChevronRight, Plus,
    Filter, Search, BarChart3, Award, MessageSquare, CheckCircle, AlertCircle,
    XCircle, Loader2, Eye, Edit2, Send, User, Flag, ArrowUp, ArrowDown, Minus,
} from "../../lib/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { performanceService } from "../../services/performanceService";
import Avatar from "../../components/common/Avatar";
import "./performance-reviews.css";

const statusConfig = {
    pending: { label: "Pending", color: "warning", icon: Clock },
    in_progress: { label: "In Progress", color: "info", icon: Target },
    completed: { label: "Completed", color: "success", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "error", icon: XCircle },
};

const PerformanceReviews = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState("reviews");
    const [reviews, setReviews] = useState([]);
    const [goals, setGoals] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [_selectedReview, setSelectedReview] = useState(null);
    const [_showNewReviewModal, setShowNewReviewModal] = useState(false);
    const [_showNewGoalModal, setShowNewGoalModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const isManager = user?.role === "Admin" || user?.role === "Manager";

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const opts = isManager ? {} : { employeeId: user?.employeeId };
                const [r, g, a] = await Promise.all([
                    performanceService.getReviews(opts),
                    performanceService.getGoals(user?.employeeId),
                    performanceService.getPerformanceAnalytics(user?.employeeId),
                ]);
                setReviews(r.data || []);
                setGoals(g.data || []);
                setAnalytics(a.data);
            } catch (_e) {
                toast.error("Failed to load performance data");
            } finally {
                setIsLoading(false);
            }
        };
        if (user) loadData();
    }, [user, isManager, toast]);

    const filteredReviews = reviews.filter((r) => {
        if (filterStatus !== "all" && r.status !== filterStatus) return false;
        if (searchQuery) {
            return r.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const renderRating = (rating) => (
        <div className="perf-rating-stars">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className={s <= rating ? "filled" : ""} fill={s <= rating ? "#f59e0b" : "none"} />
            ))}
            <span>{rating}/5</span>
        </div>
    );

    const renderStatus = (status) => {
        const cfg = statusConfig[status] || statusConfig.pending;
        const Icon = cfg.icon;
        return <span className={`perf-status-badge ${cfg.color}`}><Icon size={14} />{cfg.label}</span>;
    };

    if (isLoading) {
        return <div className="perf-container"><div className="perf-loading"><Loader2 size={40} className="animate-spin" /><span>Loading...</span></div></div>;
    }

    const stats = [
        { title: "Active", value: reviews.filter(r => r.status === "in_progress").length, icon: Target, color: "primary" },
        { title: "Completed", value: reviews.filter(r => r.status === "completed").length, icon: CheckCircle, color: "success" },
        { title: "Pending", value: reviews.filter(r => r.status === "pending").length, icon: Clock, color: "warning" },
        { title: "Avg Rating", value: analytics?.averageRating?.toFixed(1) || "N/A", icon: Star, color: "accent" },
    ];

    return (
        <div className="perf-container">
            <div className="perf-header">
                <div className="perf-header-content">
                    <div className="perf-header-icon"><Target size={28} /></div>
                    <div><h1>Performance Reviews</h1><p>Track employee performance and growth</p></div>
                </div>
                {isManager && (
                    <div className="perf-header-actions">
                        <button className="perf-btn-secondary" onClick={() => setShowNewGoalModal(true)}><Flag size={18} />Set Goal</button>
                        <button className="perf-btn-primary" onClick={() => setShowNewReviewModal(true)}><Plus size={18} />New Review</button>
                    </div>
                )}
            </div>

            <div className="perf-stats-grid">
                {stats.map((s, i) => {
                    const Icon = s.icon; return (
                        <div key={i} className={`perf-stat-card ${s.color}`}>
                            <div className="perf-stat-icon"><Icon size={24} /></div>
                            <div><span className="perf-stat-value">{s.value}</span><span className="perf-stat-label">{s.title}</span></div>
                        </div>
                    );
                })}
            </div>

            <div className="perf-tabs">
                {["reviews", "goals", "feedback"].map(t => (
                    <button key={t} className={`perf-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                        {t === "reviews" && <BarChart3 size={18} />}
                        {t === "goals" && <Target size={18} />}
                        {t === "feedback" && <MessageSquare size={18} />}
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
                {isManager && <button className={`perf-tab ${activeTab === "team" ? "active" : ""}`} onClick={() => setActiveTab("team")}><Users size={18} />Team</button>}
            </div>

            <div className="perf-content">
                {activeTab === "reviews" && (
                    <div className="perf-reviews-tab">
                        <div className="perf-filters">
                            <div className="perf-search"><Search size={18} /><input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                            <div className="perf-filter-buttons">
                                {["all", "pending", "in_progress", "completed"].map(s => (
                                    <button key={s} className={`perf-filter-btn ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)}>
                                        {s === "all" ? "All" : statusConfig[s]?.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {filteredReviews.length === 0 ? (
                            <div className="perf-empty"><Target size={64} /><h3>No reviews found</h3></div>
                        ) : (
                            <div className="perf-reviews-list">
                                {filteredReviews.map(r => (
                                    <div key={r.id} className="perf-review-card" onClick={() => setSelectedReview(r)}>
                                        <div className="perf-review-left">
                                            <Avatar src={r.employee?.avatar} name={r.employee?.name || 'Unknown'} size="sm" />
                                            <div><span className="perf-review-name">{r.employee?.name}</span><span><Calendar size={14} />{r.period}</span></div>
                                        </div>
                                        <div className="perf-review-middle">{r.overall_rating ? renderRating(r.overall_rating) : <span className="perf-no-rating">Not rated</span>}</div>
                                        <div className="perf-review-right">{renderStatus(r.status)}<ChevronRight size={20} /></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "goals" && (
                    <div className="perf-goals-tab">
                        <div className="perf-goals-header"><h3><Target size={20} />Goals</h3></div>
                        {goals.length === 0 ? <div className="perf-empty"><Flag size={64} /><h3>No goals</h3></div> : (
                            <div className="perf-goals-list">
                                {goals.map(g => (
                                    <div key={g.id} className="perf-goal-card">
                                        <div className="perf-goal-header"><span className="perf-goal-title">{g.title}</span><span className={`perf-goal-priority ${g.priority}`}>{g.priority}</span></div>
                                        <p>{g.description}</p>
                                        <div className="perf-goal-progress">
                                            <div className="perf-progress-bar"><div className="perf-progress-fill" style={{ width: `${g.progress || 0}%` }} /></div>
                                            <span>{g.progress || 0}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "feedback" && (
                    <div className="perf-feedback-tab">
                        <div className="perf-empty"><MessageSquare size={64} /><h3>360° Feedback</h3><p>No pending feedback requests</p></div>
                    </div>
                )}

                {activeTab === "team" && isManager && (
                    <div className="perf-team-tab">
                        <div className="perf-empty"><Users size={64} /><h3>Team Overview</h3><p>Team performance data</p></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerformanceReviews;
