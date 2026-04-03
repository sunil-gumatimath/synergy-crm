import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  IndianRupee,
  LayoutDashboard,
  RefreshCw,
  Clock,
  CalendarCheck,
  UserPlus,
  UserMinus,
  Briefcase,
  Activity,
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "../../lib/icons";
import { employeeService } from "../../services/employeeService";
import { taskService } from "../../services/taskService";
import "./analytics-styles.css";

// Extended color palette for departments (15 colors)
const CHART_COLORS = [
  "#4f46e5", // Indigo
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo variant
  "#14b8a6", // Teal
  "#a855f7", // Purple
  "#22c55e", // Green
  "#e11d48", // Rose
];

// Skeleton Loading Components
const SkeletonCard = () => (
  <div className="card analytics-stat-card skeleton-card">
    <div className="analytics-stat-content">
      <div className="skeleton skeleton-text-sm"></div>
      <div className="skeleton skeleton-text-lg"></div>
      <div className="skeleton skeleton-text-xs"></div>
    </div>
    <div className="skeleton skeleton-icon"></div>
  </div>
);

const SkeletonChart = () => (
  <div className="card analytics-chart-card">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-chart"></div>
  </div>
);

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="card analytics-stat-card">
    <div className="analytics-stat-content">
      <p className="analytics-stat-label">{title}</p>
      <h3 className="analytics-stat-value">{value}</h3>
      {change !== undefined && (
        <p className={`analytics-stat-change ${change >= 0 ? "positive" : "negative"}`}>
          {change >= 0 ? (
            <ArrowUpRight size={14} className="inline" />
          ) : (
            <ArrowDownRight size={14} className="inline" />
          )}
          {Math.abs(change)}% from last month
        </p>
      )}
    </div>
    <div
      className="analytics-stat-icon"
      style={{ backgroundColor: `${color}20`, color: color }}
    >
      <Icon size={24} />
    </div>
  </div>
);

// Activity Timeline Item
const ActivityItem = ({ icon: Icon, title, time, color, description }) => (
  <div className="analytics-activity-item">
    <div className="analytics-activity-icon" style={{ backgroundColor: `${color}15`, color }}>
      <Icon size={16} />
    </div>
    <div className="analytics-activity-content">
      <p className="analytics-activity-title">{title}</p>
      {description && <p className="analytics-activity-desc">{description}</p>}
      <span className="analytics-activity-time">{time}</span>
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [empRes, taskRes] = await Promise.all([
        employeeService.getAll(),
        taskService.getAll()
      ]);

      if (empRes.data) setEmployees(empRes.data);
      if (taskRes.data) setTasks(taskRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchData(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  // Calculate Statistics with dynamic month-over-month changes
  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeTasks = tasks.filter(t => t.status !== 'done').length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;

    // Calculate month-over-month employee change
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const employeesThisMonth = employees.filter(emp => {
      const joinDate = new Date(emp.join_date);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;

    const employeesLastMonth = employees.filter(emp => {
      const joinDate = new Date(emp.join_date);
      return joinDate.getMonth() === lastMonth && joinDate.getFullYear() === lastMonthYear;
    }).length;

    // Calculate percentage change (avoid division by zero)
    const employeeChange = employeesLastMonth > 0
      ? Math.round(((employeesThisMonth - employeesLastMonth) / employeesLastMonth) * 100)
      : employeesThisMonth > 0 ? 100 : 0;

    // Department Distribution with extended colors
    const deptCounts = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});

    const departmentData = Object.entries(deptCounts).map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));

    // Employee Growth (cumulative)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const growthData = months.map((month, index) => {
      const count = employees.filter(emp => {
        const joinDate = new Date(emp.join_date);
        return joinDate.getFullYear() < currentYear ||
          (joinDate.getFullYear() === currentYear && joinDate.getMonth() <= index);
      }).length;

      return { month, employees: count };
    }).slice(0, currentMonth + 1);

    // Calculate Average Performance
    const avgPerformance = totalEmployees > 0
      ? Math.round(employees.reduce((acc, emp) => acc + (emp.performance_score || 0), 0) / totalEmployees)
      : 0;

    // Calculate Total Payroll
    const totalPayroll = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);

    // Calculate Performance by Department
    const performanceByDept = Object.keys(deptCounts).map((dept) => {
      const deptEmployees = employees.filter((e) => e.department === dept);
      const avg = deptEmployees.reduce((acc, e) => acc + (e.performance_score || 0), 0) / deptEmployees.length;
      return {
        name: dept,
        performance: Math.round(avg),
      };
    });

    // Task completion rate
    const taskCompletionRate = tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

    // Status distribution for employees
    const statusCounts = employees.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {});

    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = employees.filter(emp => new Date(emp.join_date) >= thirtyDaysAgo);

    // Generate recent activity from employees and tasks
    const recentActivity = [
      ...employees.slice(0, 3).map(emp => ({
        type: 'hire',
        icon: UserPlus,
        title: `${emp.first_name} ${emp.last_name} joined`,
        description: emp.department,
        time: new Date(emp.join_date).toLocaleDateString(),
        color: '#10b981'
      })),
      ...tasks.filter(t => t.status === 'done').slice(0, 2).map(task => ({
        type: 'task',
        icon: CheckCircle2,
        title: task.title,
        description: 'Task completed',
        time: 'Recently',
        color: '#4f46e5'
      }))
    ].slice(0, 5);

    return {
      totalEmployees,
      employeeChange,
      activeTasks,
      completedTasks,
      taskCompletionRate,
      departmentData,
      growthData: growthData.length > 0 ? growthData : [{ month: "Jan", employees: 0 }],
      avgPerformance,
      totalPayroll,
      performanceByDept,
      statusCounts,
      recentHires: recentHires.length,
      recentActivity,
    };
  }, [employees, tasks]);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="analytics-container">
        {/* Header Skeleton */}
        <div className="analytics-header">
          <div>
            <div className="skeleton skeleton-title-lg"></div>
            <div className="skeleton skeleton-text-sm" style={{ width: '200px', marginTop: '8px' }}></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="analytics-stats-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Charts Skeleton */}
        <div className="analytics-charts-row">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1 className="analytics-main-title">
            <LayoutDashboard size={28} className="text-primary" />
            {getGreeting()}, Admin
          </h1>
          <p className="analytics-subtitle">
            Here's what's happening with your organization today
          </p>
        </div>
        <div className="analytics-header-actions">
          {lastUpdated && (
            <span className="analytics-last-updated">
              <Clock size={14} />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            className={`btn btn-secondary analytics-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="analytics-stats-grid">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          change={stats.employeeChange}
          icon={Users}
          color="#4f46e5"
        />
        <StatCard
          title="Avg. Performance"
          value={`${stats.avgPerformance}%`}
          icon={Award}
          color="#f59e0b"
        />
        <StatCard
          title="Total Payroll"
          value={`₹${(stats.totalPayroll / 100000).toFixed(1)}L`}
          icon={IndianRupee}
          color="#10b981"
        />
        <StatCard
          title="Active Tasks"
          value={stats.activeTasks}
          icon={TrendingUp}
          color="#ec4899"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="analytics-quick-stats">
        <div className="analytics-quick-stat-item">
          <div className="analytics-quick-stat-icon" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
            <UserPlus size={18} />
          </div>
          <div>
            <span className="analytics-quick-stat-value">{stats.recentHires}</span>
            <span className="analytics-quick-stat-label">New Hires (30d)</span>
          </div>
        </div>
        <div className="analytics-quick-stat-item">
          <div className="analytics-quick-stat-icon" style={{ backgroundColor: '#dcfce7', color: '#22c55e' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="analytics-quick-stat-value">{stats.completedTasks}</span>
            <span className="analytics-quick-stat-label">Completed Tasks</span>
          </div>
        </div>
        <div className="analytics-quick-stat-item">
          <div className="analytics-quick-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <Target size={18} />
          </div>
          <div>
            <span className="analytics-quick-stat-value">{stats.taskCompletionRate}%</span>
            <span className="analytics-quick-stat-label">Completion Rate</span>
          </div>
        </div>
        <div className="analytics-quick-stat-item">
          <div className="analytics-quick-stat-icon" style={{ backgroundColor: '#fce7f3', color: '#ec4899' }}>
            <Briefcase size={18} />
          </div>
          <div>
            <span className="analytics-quick-stat-value">{stats.departmentData.length}</span>
            <span className="analytics-quick-stat-label">Departments</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="analytics-charts-row">
        {/* Growth Chart */}
        <div className="card analytics-chart-card">
          <div className="analytics-chart-header">
            <h3 className="analytics-chart-title">Employee Growth</h3>
            <span className="analytics-chart-badge">
              <TrendingUp size={14} />
              YTD
            </span>
          </div>
          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
              <AreaChart data={stats.growthData}>
                <defs>
                  <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    padding: "12px",
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="employees"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEmployees)"
                  dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#4f46e5", strokeWidth: 2, fill: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="card analytics-chart-card">
          <div className="analytics-chart-header">
            <h3 className="analytics-chart-title">Department Distribution</h3>
            <span className="analytics-chart-badge">
              <Users size={14} />
              By Headcount
            </span>
          </div>
          <div className="analytics-chart-container">
            <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
              <PieChart>
                <Pie
                  data={stats.departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="analytics-performance-row">
        {/* Performance by Department */}
        <div className="card analytics-chart-card">
          <div className="analytics-chart-header">
            <h3 className="analytics-chart-title">Performance by Department</h3>
            <span className="analytics-chart-badge">
              <Award size={14} />
              Average Score
            </span>
          </div>
          <div className="analytics-performance-chart">
            <ResponsiveContainer width="100%" height="100%" minHeight={280} minWidth={0}>
              <BarChart data={stats.performanceByDept} barSize={36}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  formatter={(value) => [`${value}%`, 'Performance']}
                />
                <Bar dataKey="performance" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="card analytics-insights-card">
          <h3 className="analytics-chart-title">Quick Insights</h3>
          <div className="analytics-insights-list">
            <div className="analytics-insight-item primary">
              <div className="analytics-insight-header">
                <p className="analytics-insight-label">Top Performing</p>
                <span className="analytics-insight-badge">Department</span>
              </div>
              <p className="analytics-insight-value">
                {[...stats.performanceByDept].sort((a, b) => b.performance - a.performance)[0]?.name || "N/A"}
              </p>
              <div className="analytics-insight-footer">
                <Award size={14} />
                {[...stats.performanceByDept].sort((a, b) => b.performance - a.performance)[0]?.performance || 0}% avg score
              </div>
            </div>
            <div className="analytics-insight-item purple">
              <div className="analytics-insight-header">
                <p className="analytics-insight-label">Largest Dept</p>
                <span className="analytics-insight-badge">Headcount</span>
              </div>
              <p className="analytics-insight-value">
                {[...stats.departmentData].sort((a, b) => b.value - a.value)[0]?.name || "N/A"}
              </p>
              <div className="analytics-insight-footer">
                <Users size={14} />
                {[...stats.departmentData].sort((a, b) => b.value - a.value)[0]?.value || 0} employees
              </div>
            </div>
            <div className="analytics-insight-item orange">
              <div className="analytics-insight-header">
                <p className="analytics-insight-label">Avg Salary</p>
                <span className="analytics-insight-badge">Company Wide</span>
              </div>
              <p className="analytics-insight-value">
                ₹{stats.totalEmployees > 0
                  ? Math.round(stats.totalPayroll / stats.totalEmployees).toLocaleString()
                  : 0}
              </p>
              <div className="analytics-insight-footer">
                <IndianRupee size={14} />
                Per employee
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card analytics-activity-card">
        <div className="analytics-chart-header">
          <h3 className="analytics-chart-title">Recent Activity</h3>
          <span className="analytics-chart-badge">
            <Activity size={14} />
            Live
          </span>
        </div>
        <div className="analytics-activity-list">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <ActivityItem
                key={index}
                icon={activity.icon}
                title={activity.title}
                description={activity.description}
                time={activity.time}
                color={activity.color}
              />
            ))
          ) : (
            <div className="analytics-empty-activity">
              <AlertCircle size={24} />
              <p>No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
