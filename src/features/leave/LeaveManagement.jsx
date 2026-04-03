import React, { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    Check,
    X,
    Plus,
    Filter,
    ChevronDown,
    CalendarDays,
    Umbrella,
    Timer,
    AlertCircle,
    CheckCircle,
    XCircle,
    Trash2,
} from "../../lib/icons";
import { leaveService } from "../../services/leaveService.js";
import { useAuth } from "../../contexts/AuthContext";
import { SkeletonLeaveCard, SkeletonStatCard, SkeletonTable, Skeleton } from "../../components/common/Skeleton";
import Toast from "../../components/common/Toast";
import ApplyLeaveModal from "./ApplyLeaveModal";
import Avatar from "../../components/common/Avatar";
import "./leave-styles.css";

const LeaveManagement = () => {
    const { user } = useAuth();
    const isManager = user?.role === "Admin" || user?.role === "Manager";

    // State
    const [loading, setLoading] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [balances, setBalances] = useState([]);
    const [requests, setRequests] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [stats, setStats] = useState(null);

    // Filters
    const [activeTab, setActiveTab] = useState(isManager ? "pending" : "my-leaves");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modals
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Fetch data
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.employeeId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [typesRes, holidaysRes] = await Promise.all([
                leaveService.getLeaveTypes(),
                leaveService.getHolidays(),
            ]);

            setLeaveTypes(typesRes.data);
            setHolidays(holidaysRes.data);

            if (user?.employeeId) {
                const [balancesRes, statsRes] = await Promise.all([
                    leaveService.getLeaveBalances(user.employeeId),
                    leaveService.getLeaveStats(user.employeeId),
                ]);
                setBalances(balancesRes.data);
                setStats(statsRes.data);
            }

            await fetchRequests();
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast("error", "Failed to load leave data");
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            let res;
            if (activeTab === "pending" && isManager) {
                res = await leaveService.getPendingRequests();
            } else if (activeTab === "my-leaves" && user?.employeeId) {
                res = await leaveService.getLeaveRequests({ employeeId: user.employeeId });
            } else {
                res = await leaveService.getLeaveRequests();
            }
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    useEffect(() => {
        if (!loading) {
            fetchRequests();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleApprove = async (requestId) => {
        const { error } = await leaveService.approveRequest(requestId, user?.employeeId);
        if (error) {
            showToast("error", "Failed to approve request");
        } else {
            showToast("success", "Leave request approved");
            fetchRequests();
        }
    };

    const handleReject = async (requestId) => {
        const reason = prompt("Enter rejection reason (optional):");
        const { error } = await leaveService.rejectRequest(requestId, user?.employeeId, reason);
        if (error) {
            showToast("error", "Failed to reject request");
        } else {
            showToast("success", "Leave request rejected");
            fetchRequests();
        }
    };

    const handleCancel = async (requestId) => {
        if (!confirm("Are you sure you want to cancel this leave request?")) return;
        const { error } = await leaveService.cancelRequest(requestId);
        if (error) {
            showToast("error", "Failed to cancel request");
        } else {
            showToast("success", "Leave request cancelled");
            fetchRequests();
            fetchData();
        }
    };

    const handleLeaveApplied = (newRequest) => {
        setRequests((prev) => [newRequest, ...prev]);
        fetchData();
        showToast("success", "Leave request submitted successfully");
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { icon: Clock, color: "warning", text: "Pending" },
            approved: { icon: CheckCircle, color: "success", text: "Approved" },
            rejected: { icon: XCircle, color: "error", text: "Rejected" },
            cancelled: { icon: X, color: "muted", text: "Cancelled" },
        };
        const { icon: Icon, color, text } = config[status] || config.pending;
        return (
            <span className={`leave-status-badge ${color}`}>
                <Icon size={14} />
                {text}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const filteredRequests = requests.filter((r) => {
        if (statusFilter === "all") return true;
        return r.status === statusFilter;
    });

    if (loading) {
        return (
            <div className="leave-management">
                {/* Header Skeleton */}
                <div className="leave-header">
                    <div className="leave-header-left">
                        <Skeleton width="200px" height="32px" />
                        <Skeleton width="280px" height="14px" />
                    </div>
                    <Skeleton width="140px" height="40px" borderRadius="8px" />
                </div>

                {/* Stats Skeleton */}
                <div className="leave-stats-grid">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonStatCard key={i} hasIcon={true} />
                    ))}
                </div>

                {/* Leave Balances Skeleton */}
                <div className="leave-section">
                    <Skeleton width="120px" height="20px" />
                    <div className="leave-balances-grid" style={{ marginTop: '16px' }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonLeaveCard key={i} />
                        ))}
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="leave-section">
                    <div className="leave-tabs-section">
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Skeleton width="140px" height="36px" borderRadius="6px" />
                            <Skeleton width="100px" height="36px" borderRadius="6px" />
                        </div>
                    </div>
                    <SkeletonTable rows={5} columns={6} hasAvatar={true} />
                </div>
            </div>
        );
    }

    return (
        <div className="leave-management">
            {/* Header */}
            <div className="leave-header">
                <div className="leave-header-left">
                    <h1>
                        <Umbrella size={24} />
                        Leave Management
                    </h1>
                    <p>Apply for leave, check balances, and manage requests</p>
                </div>
                <button className="leave-apply-btn" onClick={() => setShowApplyModal(true)}>
                    <Plus size={18} />
                    Apply for Leave
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="leave-stats-grid">
                    <div className="leave-stat-card">
                        <div className="leave-stat-icon available">
                            <CalendarDays size={24} />
                        </div>
                        <div className="leave-stat-info">
                            <span className="leave-stat-value">{stats.totalAvailable}</span>
                            <span className="leave-stat-label">Days Available</span>
                        </div>
                    </div>
                    <div className="leave-stat-card">
                        <div className="leave-stat-icon used">
                            <Check size={24} />
                        </div>
                        <div className="leave-stat-info">
                            <span className="leave-stat-value">{stats.totalUsed}</span>
                            <span className="leave-stat-label">Days Used</span>
                        </div>
                    </div>
                    <div className="leave-stat-card">
                        <div className="leave-stat-icon pending">
                            <Clock size={24} />
                        </div>
                        <div className="leave-stat-info">
                            <span className="leave-stat-value">{stats.totalPending}</span>
                            <span className="leave-stat-label">Days Pending</span>
                        </div>
                    </div>
                    <div className="leave-stat-card">
                        <div className="leave-stat-icon total">
                            <Timer size={24} />
                        </div>
                        <div className="leave-stat-info">
                            <span className="leave-stat-value">{stats.totalEntitled}</span>
                            <span className="leave-stat-label">Total Entitled</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Balances */}
            <div className="leave-section">
                <h2>Leave Balances</h2>
                <div className="leave-balances-grid">
                    {balances.map((balance) => (
                        <div key={balance.id} className="leave-balance-card">
                            <div
                                className="leave-balance-indicator"
                                style={{ backgroundColor: balance.leave_type?.color || "#3B82F6" }}
                            />
                            <div className="leave-balance-info">
                                <h4>{balance.leave_type?.name}</h4>
                                <div className="leave-balance-numbers">
                                    <span className="available">{balance.total_days - balance.used_days - balance.pending_days}</span>
                                    <span className="separator">/</span>
                                    <span className="total">{balance.total_days}</span>
                                    <span className="label">days</span>
                                </div>
                                <div className="leave-balance-bar">
                                    <div
                                        className="leave-balance-progress used"
                                        style={{
                                            width: `${(balance.used_days / balance.total_days) * 100}%`,
                                            backgroundColor: balance.leave_type?.color || "#3B82F6",
                                        }}
                                    />
                                    <div
                                        className="leave-balance-progress pending"
                                        style={{
                                            width: `${(balance.pending_days / balance.total_days) * 100}%`,
                                            left: `${(balance.used_days / balance.total_days) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs & Filters */}
            <div className="leave-tabs-section">
                <div className="leave-tabs">
                    {isManager && (
                        <button
                            className={`leave-tab ${activeTab === "pending" ? "active" : ""}`}
                            onClick={() => setActiveTab("pending")}
                        >
                            <AlertCircle size={16} />
                            Pending Approval
                            {requests.filter((r) => r.status === "pending").length > 0 && (
                                <span className="leave-tab-badge">
                                    {requests.filter((r) => r.status === "pending").length}
                                </span>
                            )}
                        </button>
                    )}
                    <button
                        className={`leave-tab ${activeTab === "my-leaves" ? "active" : ""}`}
                        onClick={() => setActiveTab("my-leaves")}
                    >
                        <Calendar size={16} />
                        My Leaves
                    </button>
                    {isManager && (
                        <button
                            className={`leave-tab ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            <Filter size={16} />
                            All Requests
                        </button>
                    )}
                </div>

                <div className="leave-filters">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="leave-filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Leave Requests Table */}
            <div className="leave-requests-section">
                {filteredRequests.length === 0 ? (
                    <div className="leave-empty">
                        <Umbrella size={48} strokeWidth={1} />
                        <h3>No leave requests found</h3>
                        <p>Click "Apply for Leave" to submit a new request</p>
                    </div>
                ) : (
                    <div className="leave-requests-table">
                        <table>
                            <thead>
                                <tr>
                                    {(activeTab !== "my-leaves" || isManager) && <th>Employee</th>}
                                    <th>Leave Type</th>
                                    <th>Dates</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((request) => (
                                    <tr key={request.id}>
                                        {(activeTab !== "my-leaves" || isManager) && (
                                            <td>
                                                <div className="leave-employee">
                                                    <Avatar
                                                        src={request.employee?.avatar}
                                                        name={request.employee?.name || 'Unknown'}
                                                        size="sm"
                                                    />
                                                    <div>
                                                        <span className="name">{request.employee?.name}</span>
                                                        <span className="dept">{request.employee?.department}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <span
                                                className="leave-type-badge"
                                                style={{ backgroundColor: request.leave_type?.color + "20", color: request.leave_type?.color }}
                                            >
                                                {request.leave_type?.name}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="leave-dates">
                                                <span>{formatDate(request.start_date)}</span>
                                                {request.start_date !== request.end_date && (
                                                    <>
                                                        <ChevronDown size={12} className="date-arrow" />
                                                        <span>{formatDate(request.end_date)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="leave-days">
                                                {request.total_days} {request.is_half_day && "(Half)"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="leave-reason" title={request.reason}>
                                                {request.reason || "-"}
                                            </span>
                                        </td>
                                        <td>{getStatusBadge(request.status)}</td>
                                        <td>
                                            <div className="leave-actions">
                                                {request.status === "pending" && isManager && request.employee_id !== user?.employeeId && (
                                                    <>
                                                        <button
                                                            className="leave-action-btn approve"
                                                            onClick={() => handleApprove(request.id)}
                                                            title="Approve"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            className="leave-action-btn reject"
                                                            onClick={() => handleReject(request.id)}
                                                            title="Reject"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {request.status === "pending" && request.employee_id === user?.employeeId && (
                                                    <button
                                                        className="leave-action-btn cancel"
                                                        onClick={() => handleCancel(request.id)}
                                                        title="Cancel"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Upcoming Holidays */}
            <div className="leave-section">
                <h2>Upcoming Holidays</h2>
                <div className="holidays-grid">
                    {holidays
                        .filter((h) => new Date(h.date) >= new Date())
                        .slice(0, 6)
                        .map((holiday) => (
                            <div key={holiday.id} className="holiday-card">
                                <div className="holiday-date">
                                    <span className="day">{new Date(holiday.date).getDate()}</span>
                                    <span className="month">
                                        {new Date(holiday.date).toLocaleDateString("en-US", { month: "short" })}
                                    </span>
                                </div>
                                <div className="holiday-info">
                                    <h4>{holiday.name}</h4>
                                    <span className={`holiday-type ${holiday.is_optional ? "optional" : "mandatory"}`}>
                                        {holiday.is_optional ? "Optional" : "Holiday"}
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Apply Leave Modal */}
            {showApplyModal && (
                <ApplyLeaveModal
                    isOpen={showApplyModal}
                    onClose={() => setShowApplyModal(false)}
                    onSuccess={handleLeaveApplied}
                    leaveTypes={leaveTypes}
                    balances={balances}
                    employeeId={user?.employeeId}
                />
            )}

            {/* Toast */}
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
};

export default LeaveManagement;
