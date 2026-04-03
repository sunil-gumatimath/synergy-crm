import React, { useState, useEffect, useCallback } from "react";
import { Shield, Users, UserCheck, RefreshCw, ChevronDown, ChevronUp, Mail, Building2, Calendar, Activity } from "../../lib/icons";
import { supabase } from "../../lib/supabase";
import "./employees-by-role-styles.css";

const ROLE_CONFIG = {
    Admin: {
        icon: Shield,
        gradient: "role-gradient-admin",
        badge: "role-badge-admin",
        accent: "#6366f1",
        lightBg: "rgba(99, 102, 241, 0.08)",
        description: "Full system access & control",
    },
    Manager: {
        icon: UserCheck,
        gradient: "role-gradient-manager",
        badge: "role-badge-manager",
        accent: "#0ea5e9",
        lightBg: "rgba(14, 165, 233, 0.08)",
        description: "Team oversight & management",
    },
    Employee: {
        icon: Users,
        gradient: "role-gradient-employee",
        badge: "role-badge-employee",
        accent: "#10b981",
        lightBg: "rgba(16, 185, 129, 0.08)",
        description: "Standard team member",
    },
};

const StatusDot = ({ status }) => {
    const colorMap = {
        Active: "#10b981",
        Inactive: "#6b7280",
        "On Leave": "#f59e0b",
    };
    return (
        <span
            className="status-dot"
            style={{ background: colorMap[status] || "#6b7280" }}
            title={status}
        />
    );
};

const RoleSection = ({ role, employees, isExpanded, onToggle }) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.Employee;
    const Icon = config.icon;
    const activeCount = employees.filter((e) => e.status === "Active").length;

    return (
        <div className={`role-section ${isExpanded ? "expanded" : ""}`}>
            {/* Role Header */}
            <button
                className={`role-section-header ${config.gradient}`}
                onClick={onToggle}
                aria-expanded={isExpanded}
            >
                <div className="role-header-left">
                    <div className="role-icon-wrapper">
                        <Icon size={20} />
                    </div>
                    <div className="role-header-info">
                        <h3 className="role-title">{role}</h3>
                        <p className="role-description">{config.description}</p>
                    </div>
                </div>

                <div className="role-header-right">
                    <div className="role-stats">
                        <div className="role-stat">
                            <span className="role-stat-value">{employees.length}</span>
                            <span className="role-stat-label">Total</span>
                        </div>
                        <div className="role-stat-divider" />
                        <div className="role-stat">
                            <span className="role-stat-value active">{activeCount}</span>
                            <span className="role-stat-label">Active</span>
                        </div>
                    </div>
                    <span className={`role-badge ${config.badge}`}>{role}</span>
                    <div className="role-chevron">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                </div>
            </button>

            {/* Employee Table */}
            {isExpanded && (
                <div className="role-table-wrapper">
                    <table className="role-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Email</th>
                                <th>Join Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, idx) => (
                                <tr
                                    key={emp.id}
                                    className="role-table-row"
                                    style={{ animationDelay: `${idx * 0.04}s` }}
                                >
                                    <td>
                                        <div className="emp-cell-name">
                                            <div
                                                className="emp-avatar-circle"
                                                style={{ background: config.lightBg, color: config.accent }}
                                            >
                                                {emp.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <span className="emp-name">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="emp-cell-dept">
                                            <Building2 size={13} />
                                            <span>{emp.department || "—"}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="emp-cell-email">
                                            <Mail size={13} />
                                            <span>{emp.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="emp-cell-date">
                                            <Calendar size={13} />
                                            <span>
                                                {emp.join_date
                                                    ? new Date(emp.join_date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })
                                                    : "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="emp-cell-status">
                                            <StatusDot status={emp.status} />
                                            <span
                                                className={`emp-status-text ${emp.status === "Active"
                                                    ? "status-active"
                                                    : emp.status === "On Leave"
                                                        ? "status-leave"
                                                        : "status-inactive"
                                                    }`}
                                            >
                                                {emp.status || "Unknown"}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const EmployeesByRole = () => {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [expandedRoles, setExpandedRoles] = useState(new Set(["Admin", "Manager", "Employee"]));

    const fetchEmployees = useCallback(async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);

        const { data, error: fetchError } = await supabase
            .from("employees")
            .select("id, name, email, role, department, status, join_date, avatar")
            .order("name", { ascending: true });

        if (fetchError) {
            setError("Failed to load employees. Please try again.");
            setEmployees([]);
        } else {
            setEmployees(data || []);
            setError(null);
        }

        setIsLoading(false);
        setIsRefreshing(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        fetchEmployees();
    }, [fetchEmployees]);

    const toggleRole = (role) => {
        setExpandedRoles((prev) => {
            const next = new Set(prev);
            if (next.has(role)) next.delete(role);
            else next.add(role);
            return next;
        });
    };

    // Group employees by role
    const grouped = employees.reduce((acc, emp) => {
        const role = emp.role || "Employee";
        if (!acc[role]) acc[role] = [];
        acc[role].push(emp);
        return acc;
    }, {});

    // Sort roles: Admin first, then Manager, then Employee, then others
    const roleOrder = ["Admin", "Manager", "Employee"];
    const sortedRoles = [
        ...roleOrder.filter((r) => grouped[r]),
        ...Object.keys(grouped).filter((r) => !roleOrder.includes(r)),
    ];

    // Summary stats
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === "Active").length;
    const uniqueRoles = sortedRoles.length;

    if (isLoading) {
        return (
            <div className="ebr-container">
                <div className="ebr-loading">
                    <div className="ebr-spinner" />
                    <p>Loading employees by role…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ebr-container">
            {/* Page Header */}
            <div className="ebr-header">
                <div className="ebr-header-left">
                    <div className="ebr-header-icon">
                        <Shield size={22} />
                    </div>
                    <div>
                        <h2 className="ebr-title">Employees by Role</h2>
                        <p className="ebr-subtitle">
                            View all team members organized by their access level
                        </p>
                    </div>
                </div>
                <button
                    className="btn btn-ghost ebr-refresh-btn"
                    onClick={() => fetchEmployees(true)}
                    disabled={isRefreshing}
                    title="Refresh"
                >
                    <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                    <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="ebr-summary">
                <div className="ebr-summary-card">
                    <div className="ebr-summary-icon" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                        <Users size={18} />
                    </div>
                    <div>
                        <p className="ebr-summary-value">{totalEmployees}</p>
                        <p className="ebr-summary-label">Total Employees</p>
                    </div>
                </div>
                <div className="ebr-summary-card">
                    <div className="ebr-summary-icon" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                        <Activity size={18} />
                    </div>
                    <div>
                        <p className="ebr-summary-value">{activeEmployees}</p>
                        <p className="ebr-summary-label">Active</p>
                    </div>
                </div>
                <div className="ebr-summary-card">
                    <div className="ebr-summary-icon" style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9" }}>
                        <Shield size={18} />
                    </div>
                    <div>
                        <p className="ebr-summary-value">{uniqueRoles}</p>
                        <p className="ebr-summary-label">Roles</p>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="ebr-error">
                    <p>{error}</p>
                    <button className="btn btn-primary btn-sm" onClick={() => fetchEmployees()}>
                        Retry
                    </button>
                </div>
            )}

            {/* Role Sections */}
            {!error && (
                <div className="ebr-sections">
                    {sortedRoles.length === 0 ? (
                        <div className="ebr-empty">
                            <Users size={48} />
                            <p>No employees found.</p>
                        </div>
                    ) : (
                        sortedRoles.map((role) => (
                            <RoleSection
                                key={role}
                                role={role}
                                employees={grouped[role]}
                                isExpanded={expandedRoles.has(role)}
                                onToggle={() => toggleRole(role)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeesByRole;
