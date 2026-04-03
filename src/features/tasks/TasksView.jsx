import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus, Search, Filter, MoreHorizontal, Calendar, User, Flag,
    Clock, CheckCircle2, Circle, Timer, AlertCircle, ChevronDown,
    X, Trash2, Edit3, Eye, Tag, GripVertical
} from '../../lib/icons';
import { taskService } from '../../services/taskService.js';
import { employeeService } from '../../services/employeeService.js';

import { SkeletonTaskCard, SkeletonStatCard, Skeleton } from '../../components/common/Skeleton';
import './TasksView.css';

const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const TasksView = () => {

    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: 'all', priority: 'all' });
    const [stats, setStats] = useState(null);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        const [tasksRes, employeesRes, statsRes] = await Promise.all([
            taskService.getAll(),
            employeeService.getAll(),
            taskService.getStats()
        ]);
        setTasks(tasksRes.data || []);
        setEmployees(employeesRes.data || []);
        setStats(statsRes.data);
        setLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = !searchQuery ||
                task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filters.status === 'all' || task.status === filters.status;
            const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, searchQuery, filters]);

    const tasksByStatus = useMemo(() => {
        const grouped = {};
        STATUSES.forEach(status => {
            grouped[status] = filteredTasks.filter(t => t.status === status);
        });
        return grouped;
    }, [filteredTasks]);

    const handleCreateTask = async (taskData) => {
        const result = await taskService.create(taskData);
        if (result.data) {
            setTasks(prev => [result.data, ...prev]);
            setShowModal(false);
            loadData(); // Refresh stats
        }
    };

    const handleUpdateTask = async (taskId, updates) => {
        const result = await taskService.update(taskId, updates);
        if (result.data) {
            setTasks(prev => prev.map(t => t.id === taskId ? result.data : t));
            setEditingTask(null);
            setShowModal(false);
            loadData();
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        const result = await taskService.delete(taskId);
        if (result.success) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setSelectedTask(null);
            loadData();
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        await handleUpdateTask(taskId, { status: newStatus });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'To Do': return <Circle size={16} />;
            case 'In Progress': return <Timer size={16} />;
            case 'Review': return <Eye size={16} />;
            case 'Done': return <CheckCircle2 size={16} />;
            default: return <Circle size={16} />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Low': return '#6b7280';
            case 'Medium': return '#f59e0b';
            case 'High': return '#ef4444';
            case 'Urgent': return '#dc2626';
            default: return '#6b7280';
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isOverdue = (date) => {
        if (!date) return false;
        return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
    };

    if (loading) {
        return (
            <div className="tasks-container">
                {/* Header Skeleton */}
                <div className="tasks-header">
                    <div className="tasks-title-section">
                        <Skeleton width="100px" height="32px" />
                        <Skeleton width="200px" height="14px" />
                    </div>
                    <Skeleton width="120px" height="40px" borderRadius="8px" />
                </div>

                {/* Stats Skeleton */}
                <div className="tasks-stats">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonStatCard key={i} hasIcon={true} />
                    ))}
                </div>

                {/* Toolbar Skeleton */}
                <div className="tasks-toolbar">
                    <Skeleton width="280px" height="40px" borderRadius="8px" />
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Skeleton width="120px" height="36px" borderRadius="6px" />
                        <Skeleton width="120px" height="36px" borderRadius="6px" />
                    </div>
                </div>

                {/* Board Skeleton */}
                <div className="tasks-board">
                    {STATUSES.map((status) => (
                        <div key={status} className="task-column">
                            <div className="column-header">
                                <div className="column-title">
                                    <Skeleton width="16px" height="16px" borderRadius="4px" />
                                    <Skeleton width="80px" height="14px" />
                                    <Skeleton width="24px" height="20px" borderRadius="10px" />
                                </div>
                            </div>
                            <div className="column-content skeleton-stagger">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <SkeletonTaskCard key={i} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="tasks-container">
            {/* Header */}
            <div className="tasks-header">
                <div className="tasks-title-section">
                    <h1>Tasks</h1>
                    <p>Manage and track your team's work</p>
                </div>
                <button className="tasks-add-btn" onClick={() => { setEditingTask(null); setShowModal(true); }}>
                    <Plus size={20} />
                    <span>New Task</span>
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="tasks-stats">
                    <div className="task-stat-card">
                        <div className="stat-icon total"><CheckCircle2 size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Tasks</span>
                        </div>
                    </div>
                    <div className="task-stat-card">
                        <div className="stat-icon todo"><Circle size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.byStatus['To Do']}</span>
                            <span className="stat-label">To Do</span>
                        </div>
                    </div>
                    <div className="task-stat-card">
                        <div className="stat-icon progress"><Timer size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.byStatus['In Progress']}</span>
                            <span className="stat-label">In Progress</span>
                        </div>
                    </div>
                    <div className="task-stat-card">
                        <div className="stat-icon done"><CheckCircle2 size={20} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.byStatus['Done']}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="tasks-toolbar">
                <div className="tasks-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="tasks-filters">
                    <div className="filter-group">
                        <Filter size={16} />
                        <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
                            <option value="all">All Status</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <Flag size={16} />
                        <select value={filters.priority} onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}>
                            <option value="all">All Priority</option>
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div className="view-toggle">
                    <button className={viewMode === 'board' ? 'active' : ''} onClick={() => setViewMode('board')}>
                        <GripVertical size={18} />
                    </button>
                    <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'board' ? (
                <div className="tasks-board">
                    {STATUSES.map(status => (
                        <div key={status} className="task-column">
                            <div className="column-header">
                                <div className="column-title">
                                    {getStatusIcon(status)}
                                    <span>{status}</span>
                                    <span className="column-count">{tasksByStatus[status]?.length || 0}</span>
                                </div>
                            </div>
                            <div className="column-content">
                                {tasksByStatus[status]?.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onEdit={() => { setEditingTask(task); setShowModal(true); }}
                                        onDelete={() => handleDeleteTask(task.id)}
                                        onStatusChange={handleStatusChange}
                                        onClick={() => setSelectedTask(task)}
                                        getInitials={getInitials}
                                        getPriorityColor={getPriorityColor}
                                        formatDate={formatDate}
                                        isOverdue={isOverdue}
                                    />
                                ))}
                                {tasksByStatus[status]?.length === 0 && (
                                    <div className="column-empty">No tasks</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="tasks-list">
                    <table className="tasks-table">
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Assignee</th>
                                <th>Due Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map(task => (
                                <tr key={task.id} onClick={() => setSelectedTask(task)}>
                                    <td>
                                        <div className="task-title-cell">
                                            <span className="task-title">{task.title}</span>
                                            {task.description && <span className="task-desc">{task.description}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${task.status?.toLowerCase().replace(' ', '-')}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="priority-indicator" style={{ background: getPriorityColor(task.priority) }}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td>
                                        {task.assignee ? (
                                            <div className="assignee-cell">
                                                <div className="assignee-avatar">{getInitials(task.assignee.name)}</div>
                                                <span>{task.assignee.name}</span>
                                            </div>
                                        ) : (
                                            <span className="unassigned">Unassigned</span>
                                        )}
                                    </td>
                                    <td>
                                        {task.due_date ? (
                                            <span className={`due-date ${isOverdue(task.due_date) ? 'overdue' : ''}`}>
                                                {formatDate(task.due_date)}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <button onClick={(e) => { e.stopPropagation(); setEditingTask(task); setShowModal(true); }}>
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTasks.length === 0 && (
                        <div className="empty-state">
                            <CheckCircle2 size={48} />
                            <h3>No tasks found</h3>
                            <p>Create a new task to get started</p>
                        </div>
                    )}
                </div>
            )}

            {/* Task Modal */}
            {showModal && (
                <TaskModal
                    task={editingTask}
                    employees={employees}
                    onClose={() => { setShowModal(false); setEditingTask(null); }}
                    onSubmit={editingTask ? (data) => handleUpdateTask(editingTask.id, data) : handleCreateTask}
                />
            )}

            {/* Task Detail Sidebar */}
            {selectedTask && (
                <TaskDetail
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onEdit={() => { setEditingTask(selectedTask); setShowModal(true); setSelectedTask(null); }}
                    onDelete={() => { handleDeleteTask(selectedTask.id); }}
                    onStatusChange={(status) => handleStatusChange(selectedTask.id, status)}
                    getInitials={getInitials}
                    getPriorityColor={getPriorityColor}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
};

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete, onStatusChange: _onStatusChange, onClick, getInitials, getPriorityColor, formatDate, isOverdue }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="task-card" onClick={onClick}>
            <div className="card-header">
                <span className="priority-dot" style={{ background: getPriorityColor(task.priority) }} title={task.priority} />
                <button className="card-menu" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>
                    <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                    <div className="card-dropdown">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false); }}>
                            <Edit3 size={14} /> Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }} className="delete">
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                )}
            </div>
            <h3 className="card-title">{task.title}</h3>
            {task.description && <p className="card-desc">{task.description}</p>}
            <div className="card-footer">
                {task.due_date && (
                    <span className={`card-due ${isOverdue(task.due_date) ? 'overdue' : ''}`}>
                        <Calendar size={14} /> {formatDate(task.due_date)}
                    </span>
                )}
                {task.assignee && (
                    <div className="card-assignee" title={task.assignee.name}>
                        {getInitials(task.assignee.name)}
                    </div>
                )}
            </div>
        </div>
    );
};

// Task Modal Component
const TaskModal = ({ task, employees, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'To Do',
        priority: task?.priority || 'Medium',
        assignee_id: task?.assignee_id || '',
        due_date: task?.due_date ? task.due_date.split('T')[0] : ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        setSubmitting(true);
        await onSubmit({
            ...formData,
            assignee_id: formData.assignee_id || null,
            due_date: formData.due_date || null
        });
        setSubmitting(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                            placeholder="Enter task title"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                            placeholder="Add a description..."
                            rows={3}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select value={formData.priority} onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))}>
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Assignee</label>
                            <select value={formData.assignee_id} onChange={e => setFormData(f => ({ ...f, assignee_id: e.target.value }))}>
                                <option value="">Unassigned</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Due Date</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={e => setFormData(f => ({ ...f, due_date: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Task Detail Sidebar
const TaskDetail = ({ task, onClose, onEdit, onDelete, onStatusChange, getInitials, getPriorityColor, formatDate }) => {
    return (
        <div className="task-detail-overlay" onClick={onClose}>
            <div className="task-detail-sidebar" onClick={e => e.stopPropagation()}>
                <div className="detail-header">
                    <h2>Task Details</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="detail-content">
                    <div className="detail-title-section">
                        <span className="priority-dot large" style={{ background: getPriorityColor(task.priority) }} />
                        <h3>{task.title}</h3>
                    </div>
                    {task.description && <p className="detail-description">{task.description}</p>}

                    <div className="detail-meta">
                        <div className="meta-item">
                            <span className="meta-label">Status</span>
                            <select value={task.status} onChange={e => onStatusChange(e.target.value)}>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Priority</span>
                            <span className="priority-badge" style={{ background: getPriorityColor(task.priority) + '20', color: getPriorityColor(task.priority) }}>
                                {task.priority}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Assignee</span>
                            {task.assignee ? (
                                <div className="detail-assignee">
                                    <div className="assignee-avatar">{getInitials(task.assignee.name)}</div>
                                    <span>{task.assignee.name}</span>
                                </div>
                            ) : (
                                <span className="unassigned">Unassigned</span>
                            )}
                        </div>
                        {task.due_date && (
                            <div className="meta-item">
                                <span className="meta-label">Due Date</span>
                                <span className="detail-date">
                                    <Calendar size={16} /> {formatDate(task.due_date)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="detail-actions">
                    <button className="btn-secondary" onClick={onEdit}><Edit3 size={16} /> Edit</button>
                    <button className="btn-danger" onClick={onDelete}><Trash2 size={16} /> Delete</button>
                </div>
            </div>
        </div>
    );
};

export default TasksView;
