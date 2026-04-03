import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Printer, Calendar, Users, Clock,
    ClipboardList, Umbrella, BarChart3, RefreshCw, TrendingUp,
    TrendingDown, ChevronDown, Building2
} from '../../lib/icons';
import {
    getAttendanceReport, getLeaveReport, getTaskReport,
    getTimeTrackingReport, getEmployeeSummaryReport,
    getDepartments, exportToCSV, printReport
} from '../../services/reportsService.js';
import { formatDateForInput } from '../../utils/dateUtils';
import { SkeletonStatCard, SkeletonTable, Skeleton } from '../../components/common/Skeleton';
import './ReportsView.css';

const ReportsView = () => {
    const [activeReport, setActiveReport] = useState('attendance');
    const [dateRange, setDateRange] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return {
            start: formatDateForInput(start),
            end: formatDateForInput(end)
        };
    });
    const [department, setDepartment] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reportTypes = [
        { id: 'attendance', label: 'Attendance', icon: Clock, color: '#4f46e5' },
        { id: 'leave', label: 'Leave', icon: Umbrella, color: '#10b981' },
        { id: 'tasks', label: 'Tasks', icon: ClipboardList, color: '#f59e0b' },
        { id: 'timetracking', label: 'Time Tracking', icon: BarChart3, color: '#8b5cf6' },
        { id: 'employees', label: 'Employees', icon: Users, color: '#ec4899' }
    ];

    useEffect(() => { fetchDepartments(); }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchReport(); }, [activeReport, dateRange, department]);

    const fetchDepartments = async () => {
        const result = await getDepartments();
        if (result.success) setDepartments(result.data);
    };

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            let result;
            switch (activeReport) {
                case 'attendance': result = await getAttendanceReport(dateRange.start, dateRange.end, department); break;
                case 'leave': result = await getLeaveReport(dateRange.start, dateRange.end, department); break;
                case 'tasks': result = await getTaskReport(dateRange.start, dateRange.end, department); break;
                case 'timetracking': result = await getTimeTrackingReport(dateRange.start, dateRange.end, department); break;
                case 'employees': result = await getEmployeeSummaryReport(); break;
                default: result = { success: false, error: 'Unknown report type' };
            }
            if (result.success) setReportData(result);
            else setError(result.error);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleExportCSV = () => {
        if (!reportData?.data) return;
        const flatData = reportData.data.map(item => {
            const flat = { ...item };
            if (flat.employee) {
                flat.employee_name = flat.employee.name;
                flat.employee_department = flat.employee.department;
                delete flat.employee;
            }
            if (flat.assignee) {
                flat.assignee_name = flat.assignee.name;
                delete flat.assignee;
            }
            if (flat.leave_type) {
                flat.leave_type_name = flat.leave_type.name;
                delete flat.leave_type;
            }
            return flat;
        });
        exportToCSV(flatData, `${activeReport}_report`);
    };

    // Helper to get initials from name
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const renderSummaryCards = () => {
        if (!reportData?.summary) return null;
        const s = reportData.summary;
        const cards = {
            attendance: [
                { icon: Users, bg: '#eef2ff', color: '#4f46e5', value: s.totalEmployees, label: 'Employees' },
                { icon: Calendar, bg: '#ecfdf5', color: '#10b981', value: s.totalEntries, label: 'Entries' },
                { icon: Clock, bg: '#fef3c7', color: '#f59e0b', value: `${s.avgHoursPerDay}h`, label: 'Avg Hours' }
            ],
            leave: [
                { icon: FileText, bg: '#eef2ff', color: '#4f46e5', value: s.totalRequests, label: 'Requests' },
                { icon: TrendingUp, bg: '#ecfdf5', color: '#10b981', value: s.approved, label: 'Approved' },
                { icon: Clock, bg: '#fef3c7', color: '#f59e0b', value: s.pending, label: 'Pending' },
                { icon: TrendingDown, bg: '#fef2f2', color: '#ef4444', value: s.rejected, label: 'Rejected' }
            ],
            tasks: [
                { icon: ClipboardList, bg: '#eef2ff', color: '#4f46e5', value: s.totalTasks, label: 'Total' },
                { icon: TrendingUp, bg: '#ecfdf5', color: '#10b981', value: s.completedTasks, label: 'Done' },
                { icon: BarChart3, bg: '#fef3c7', color: '#f59e0b', value: `${s.completionRate}%`, label: 'Rate' }
            ],
            timetracking: [
                { icon: Clock, bg: '#eef2ff', color: '#4f46e5', value: `${s.totalHours}h`, label: 'Hours' },
                { icon: Users, bg: '#ecfdf5', color: '#10b981', value: s.uniqueEmployees, label: 'Employees' },
                { icon: BarChart3, bg: '#fef3c7', color: '#f59e0b', value: `${s.avgHoursPerDay}h`, label: 'Avg/Day' }
            ],
            employees: [
                { icon: Users, bg: '#eef2ff', color: '#4f46e5', value: s.totalEmployees, label: 'Total' },
                { icon: TrendingUp, bg: '#ecfdf5', color: '#10b981', value: s.active, label: 'Active' },
                { icon: Building2, bg: '#f3e8ff', color: '#8b5cf6', value: s.departments, label: 'Depts' }
            ]
        };
        return (
            <div className="reports-summary-grid">
                {(cards[activeReport] || []).map((c, i) => (
                    <div key={i} className="reports-summary-card">
                        <div className="summary-icon" style={{ background: c.bg }}><c.icon size={20} color={c.color} /></div>
                        <div className="summary-content">
                            <span className="summary-value">{c.value}</span>
                            <span className="summary-label">{c.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderTable = () => {
        if (!reportData?.data?.length) return <div className="reports-empty-state"><FileText size={48} /><h3>No data</h3></div>;
        const d = reportData.data;
        if (activeReport === 'attendance') {
            return (
                <table className="reports-table"><thead><tr><th>Employee</th><th>Dept</th><th>Days</th><th>Hours</th><th>Late</th><th>OT</th></tr></thead>
                    <tbody>{d.map((r, i) => (
                        <tr key={i}><td><div className="employee-cell"><div className="employee-avatar">{getInitials(r.employee?.name)}</div><span>{r.employee?.name || 'Unknown'}</span></div></td>
                            <td>{r.employee?.department || '-'}</td><td>{r.presentDays}</td><td>{r.totalHours?.toFixed(1)}h</td><td>{r.lateDays}</td><td>{r.overtimeHours?.toFixed(1)}h</td></tr>
                    ))}</tbody></table>
            );
        }
        if (activeReport === 'leave') {
            return (
                <table className="reports-table"><thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th></tr></thead>
                    <tbody>{d.slice(0, 20).map((r, i) => (
                        <tr key={i}><td><div className="employee-cell"><div className="employee-avatar">{getInitials(r.employee?.name)}</div><span>{r.employee?.name || 'Unknown'}</span></div></td>
                            <td><span className="leave-type-badge" style={{ background: (r.leave_type?.color || '#6b7280') + '20', color: r.leave_type?.color }}>{r.leave_type?.name}</span></td>
                            <td>{new Date(r.start_date).toLocaleDateString()}</td><td>{new Date(r.end_date).toLocaleDateString()}</td><td>{r.total_days || 1}</td>
                            <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td></tr>
                    ))}</tbody></table>
            );
        }
        if (activeReport === 'tasks') {
            return (
                <table className="reports-table"><thead><tr><th>Task</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead>
                    <tbody>{d.slice(0, 20).map((r, i) => (
                        <tr key={i}><td>{r.title}</td>
                            <td>{r.assignee ? <div className="employee-cell"><div className="employee-avatar">{getInitials(r.assignee?.name)}</div><span>{r.assignee?.name}</span></div> : '-'}</td>
                            <td><span className={`priority-badge priority-${r.priority?.toLowerCase()}`}>{r.priority}</span></td>
                            <td><span className={`status-badge status-${r.status?.toLowerCase().replace(' ', '-')}`}>{r.status}</span></td>
                            <td>{r.due_date ? new Date(r.due_date).toLocaleDateString() : '-'}</td></tr>
                    ))}</tbody></table>
            );
        }
        if (activeReport === 'timetracking') {
            return (
                <table className="reports-table"><thead><tr><th>Date</th><th>Employee</th><th>Dept</th><th>In</th><th>Out</th><th>Hours</th></tr></thead>
                    <tbody>{d.slice(0, 20).map((r, i) => (
                        <tr key={i}><td>{new Date(r.date).toLocaleDateString()}</td>
                            <td><div className="employee-cell"><div className="employee-avatar">{getInitials(r.employee?.name)}</div><span>{r.employee?.name || 'Unknown'}</span></div></td>
                            <td>{r.employee?.department || '-'}</td><td>{r.clock_in || '-'}</td><td>{r.clock_out || '-'}</td><td>{r.total_hours?.toFixed(1) || 0}h</td></tr>
                    ))}</tbody></table>
            );
        }
        if (activeReport === 'employees') {
            return (
                <table className="reports-table"><thead><tr><th>Employee</th><th>Dept</th><th>Position</th><th>Status</th><th>Hired</th></tr></thead>
                    <tbody>{d.slice(0, 20).map((r, i) => (
                        <tr key={i}><td><div className="employee-cell"><div className="employee-avatar">{getInitials(r.name)}</div><div className="employee-info"><span className="employee-name">{r.name}</span><span className="employee-email">{r.email}</span></div></div></td>
                            <td>{r.department || '-'}</td><td>{r.position || r.role || '-'}</td>
                            <td><span className={`status-badge status-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                            <td>{r.join_date ? new Date(r.join_date).toLocaleDateString() : '-'}</td></tr>
                    ))}</tbody></table>
            );
        }
        return null;
    };

    const ReportIcon = reportTypes.find(r => r.id === activeReport)?.icon || FileText;

    return (
        <div className="reports-container">
            <div className="reports-header">
                <div className="reports-title-section">
                    <div className="reports-icon-wrapper"><FileText size={24} /></div>
                    <div><h1>Reports</h1><p>Generate and export detailed reports</p></div>
                </div>
                <div className="reports-actions">
                    <button className="reports-btn secondary" onClick={fetchReport} disabled={loading}><RefreshCw size={18} className={loading ? 'spin' : ''} />Refresh</button>
                    <button className="reports-btn secondary" onClick={() => printReport('report-content')} disabled={!reportData}><Printer size={18} />Print</button>
                    <button className="reports-btn primary" onClick={handleExportCSV} disabled={!reportData}><Download size={18} />Export CSV</button>
                </div>
            </div>

            <div className="reports-tabs">
                {reportTypes.map(r => <button key={r.id} className={`reports-tab ${activeReport === r.id ? 'active' : ''}`} onClick={() => setActiveReport(r.id)} style={{ '--tab-color': r.color }}><r.icon size={18} /><span>{r.label}</span></button>)}
            </div>

            <div className="reports-filters">
                <div className="filter-group"><label><Calendar size={16} />Start</label><input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} className="filter-input" /></div>
                <div className="filter-group"><label><Calendar size={16} />End</label><input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} className="filter-input" /></div>
                {activeReport !== 'employees' && <div className="filter-group"><label><Building2 size={16} />Dept</label><div className="select-wrapper"><select value={department} onChange={e => setDepartment(e.target.value)} className="filter-select"><option value="all">All</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select><ChevronDown size={16} className="select-icon" /></div></div>}
            </div>

            <div className="reports-content" id="report-content">
                {loading ? (
                    <>
                        <div className="reports-summary-grid" style={{ marginBottom: '24px' }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonStatCard key={i} hasIcon={true} />
                            ))}
                        </div>
                        <SkeletonTable rows={8} columns={5} hasAvatar={true} />
                    </>
                )
                    : error ? <div className="reports-error"><p>{error}</p><button onClick={fetchReport}>Retry</button></div>
                        : <>
                            <div className="reports-section-header"><ReportIcon size={20} /><h2>{reportTypes.find(r => r.id === activeReport)?.label} Report</h2><span className="date-range-badge">{new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}</span></div>
                            {renderSummaryCards()}
                            <div className="reports-data-section">{renderTable()}</div>
                        </>}
            </div>
        </div>
    );
};

export default ReportsView;
