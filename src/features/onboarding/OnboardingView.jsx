import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Plus,
    Search,
    X,
    Trash2,
    Edit3,
    CheckCircle2,
    Circle,
    Timer,
    ClipboardList,
    Briefcase,
    Building2,
    MoreHorizontal,
    AlertCircle,
} from "../../lib/icons";
import { onboardingService } from "../../services/onboardingService.js";
import { employeeService } from "../../services/employeeService.js";
import { OnboardingSkeleton } from "../../components/common/PageSkeletons";
import Avatar from "../../components/common/Avatar";
import "./OnboardingView.css";

const TASK_STATUSES = ["pending", "in_progress", "completed"];
const TASK_CATEGORIES = ["general", "documentation", "it", "training", "orientation", "hr"];

const WorkflowCard = ({ workflow, active, onSelect, onEdit, onDelete }) => {
    const tasks = workflow.tasks || [];
    const completed = tasks.filter(t => t.status === "completed").length;
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    return (
        <div className={`onb-workflow-card ${active ? "active" : ""}`} onClick={onSelect}>
            <div className="onb-workflow-card-top">
                <div className="onb-workflow-icon">
                    <Briefcase size={20} />
                </div>
                <div className="onb-workflow-info">
                    <h3 className="onb-workflow-name">{workflow.name}</h3>
                    <span className="onb-workflow-desc">{workflow.description || "No description"}</span>
                </div>
                <div className="onb-workflow-actions">
                    <button
                        className="onb-icon-btn"
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        title="Edit workflow"
                    >
                        <Edit3 size={15} />
                    </button>
                    <button
                        className="onb-icon-btn danger"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        title="Delete workflow"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            <div className="onb-workflow-meta">
                {workflow.department && (
                    <span className="onb-badge onb-badge-dept"><Building2 size={12} /> {workflow.department}</span>
                )}
                <span className={`onb-badge ${workflow.is_active ? "onb-badge-active" : "onb-badge-inactive"}`}>
                    {workflow.is_active ? "Active" : "Inactive"}
                </span>
                <span className="onb-task-count">{tasks.length} tasks</span>
            </div>

            <div className="onb-progress">
                <div className="onb-progress-track">
                    <div className="onb-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="onb-progress-label">{progress}% complete</span>
            </div>
        </div>
    );
};

const TaskRow = ({ task, onEdit, onDelete, onToggle }) => {
    const statusLabel = task.status === "completed" ? "Completed" : task.status === "in_progress" ? "In Progress" : "Pending";
    const assignee = task.assigned || task.employee;

    return (
        <div className={`onb-task-row onb-task-${task.status}`}>
            <div className="onb-task-check">
                <button
                    className={`onb-check-btn ${task.status === "completed" ? "checked" : ""}`}
                    onClick={() => onToggle(task)}
                    title={task.status === "completed" ? "Mark as pending" : "Mark as completed"}
                >
                    {task.status === "completed" ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
            </div>

            <div className="onb-task-main">
                <div className="onb-task-title-row">
                    <span className="onb-task-title">{task.title}</span>
                    <span className={`onb-badge onb-badge-status onb-status-${task.status}`}>{statusLabel}</span>
                </div>
                {task.description && <span className="onb-task-desc">{task.description}</span>}
                <div className="onb-task-meta">
                    <span className="onb-badge onb-badge-cat">{task.category}</span>
                    {task.due_days != null && (
                        <span className="onb-task-due"><Timer size={12} /> Due in {task.due_days} day{task.due_days === 1 ? "" : "s"}</span>
                    )}
                    {assignee ? (
                        <div className="onb-task-assignee">
                            <Avatar name={assignee.name} size="xs" className="avatar-bordered" />
                            <span>{assignee.name}</span>
                        </div>
                    ) : (
                        <span className="onb-task-unassigned">Unassigned</span>
                    )}
                </div>
            </div>

            <div className="onb-task-row-actions">
                <button className="onb-icon-btn" onClick={() => onEdit(task)} title="Edit task"><Edit3 size={15} /></button>
                <button className="onb-icon-btn danger" onClick={() => onDelete(task)} title="Delete task"><Trash2 size={15} /></button>
            </div>
        </div>
    );
};

const WorkflowModal = ({ workflow, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: workflow?.name || "",
        description: workflow?.description || "",
        department: workflow?.department || "",
        is_active: workflow?.is_active ?? true,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        setSubmitting(true);
        await onSubmit({
            ...formData,
            department: formData.department || null,
        });
        setSubmitting(false);
    };

    return (
        <div className="onb-modal-overlay" onClick={onClose}>
            <div className="onb-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="onb-modal-header">
                    <h2>{workflow ? "Edit Workflow" : "New Workflow"}</h2>
                    <button className="onb-modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Workflow Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Engineering Onboarding"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                            placeholder="What does this onboarding cover?"
                            rows={3}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Department (optional)</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData(f => ({ ...f, department: e.target.value }))}
                                placeholder="e.g. Engineering"
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={formData.is_active} onChange={(e) => setFormData(f => ({ ...f, is_active: e.target.value === "true" }))}>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="onb-modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? "Saving..." : (workflow ? "Update Workflow" : "Create Workflow")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TaskModal = ({ workflowName, task, employees, onClose, onSubmit, nextOrder }) => {
    const [formData, setFormData] = useState({
        title: task?.title || "",
        description: task?.description || "",
        category: task?.category || "general",
        assigned_to: task?.assigned_to || "",
        due_days: task?.due_days ?? 7,
        status: task?.status || "pending",
        order_index: task?.order_index ?? nextOrder ?? 0,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        setSubmitting(true);
        await onSubmit({
            ...formData,
            assigned_to: formData.assigned_to || null,
        });
        setSubmitting(false);
    };

    return (
        <div className="onb-modal-overlay" onClick={onClose}>
            <div className="onb-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="onb-modal-header">
                    <h2>{task ? "Edit Task" : `Add Task — ${workflowName || ""}`}</h2>
                    <button className="onb-modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Task Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Complete HR Documentation"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                            placeholder="What should the new hire do?"
                            rows={2}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select value={formData.category} onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}>
                                {TASK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Due In (days)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.due_days}
                                onChange={(e) => setFormData(f => ({ ...f, due_days: Number(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Assignee</label>
                            <select value={formData.assigned_to} onChange={(e) => setFormData(f => ({ ...f, assigned_to: e.target.value }))}>
                                <option value="">Unassigned</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}>
                                {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="onb-modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? "Saving..." : (task ? "Update Task" : "Add Task")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const OnboardingView = () => {
    const [workflows, setWorkflows] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        const [workflowsRes, employeesRes] = await Promise.all([
            onboardingService.getWorkflows(),
            employeeService.getAll(),
        ]);
        setWorkflows(workflowsRes.data || []);
        setEmployees(employeesRes.data || []);
        setLoading(false);
    }, []);

    const loadTasks = useCallback(async (workflowId) => {
        const res = await onboardingService.getTasks(workflowId);
        setTasks(res.data || []);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    const selectWorkflow = async (workflow) => {
        if (selectedWorkflow?.id === workflow.id) {
            setSelectedWorkflow(null);
            setTasks([]);
            return;
        }
        setSelectedWorkflow(workflow);
        await loadTasks(workflow.id);
    };

    const filteredWorkflows = useMemo(() => {
        if (!searchQuery) return workflows;
        const q = searchQuery.toLowerCase();
        return workflows.filter(w =>
            w.name?.toLowerCase().includes(q) ||
            w.description?.toLowerCase().includes(q) ||
            w.department?.toLowerCase().includes(q)
        );
    }, [workflows, searchQuery]);

    const stats = useMemo(() => {
        const allTasks = workflows.reduce((acc, w) => acc.concat(w.tasks || []), []);
        return {
            activeWorkflows: workflows.filter(w => w.is_active).length,
            totalWorkflows: workflows.length,
            totalTasks: allTasks.length,
            completed: allTasks.filter(t => t.status === "completed").length,
        };
    }, [workflows]);

    const handleCreateWorkflow = async (data) => {
        const result = await onboardingService.createWorkflow(data);
        if (result.data) {
            await loadData();
            setShowWorkflowModal(false);
        }
    };

    const handleUpdateWorkflow = async (workflowId, updates) => {
        const result = await onboardingService.updateWorkflow(workflowId, updates);
        if (result.data) {
            await loadData();
            if (selectedWorkflow?.id === workflowId) setSelectedWorkflow(result.data);
            setShowWorkflowModal(false);
        }
    };

    const handleDeleteWorkflow = async (workflow) => {
        if (!confirm(`Delete "${workflow.name}" and all its tasks?`)) return;
        const result = await onboardingService.deleteWorkflow(workflow.id);
        if (result.success) {
            if (selectedWorkflow?.id === workflow.id) {
                setSelectedWorkflow(null);
                setTasks([]);
            }
            await loadData();
        }
    };

    const handleCreateTask = async (data) => {
        const result = await onboardingService.createTask({ ...data, workflow_id: selectedWorkflow.id });
        if (result.data) {
            setTasks(prev => [...prev, result.data]);
            await loadData();
        }
    };

    const handleUpdateTask = async (taskId, updates) => {
        const result = await onboardingService.updateTask(taskId, updates);
        if (result.data) {
            setTasks(prev => prev.map(t => t.id === taskId ? result.data : t));
            await loadData();
        }
    };

    const handleToggleTask = async (task) => {
        await handleUpdateTask(task.id, {
            status: task.status === "completed" ? "pending" : "completed",
            completed_at: task.status === "completed" ? null : new Date().toISOString(),
        });
    };

    const handleDeleteTask = async (task) => {
        if (!confirm("Delete this task?")) return;
        const result = await onboardingService.deleteTask(task.id);
        if (result.success) {
            setTasks(prev => prev.filter(t => t.id !== task.id));
            await loadData();
        }
    };

    if (loading) {
        return <OnboardingSkeleton />;
    }

    return (
        <div className="onb-container">
            {/* Header */}
            <div className="onb-header">
                <div className="onb-title-section">
                    <h1>Onboarding</h1>
                    <p>Manage workflows and tasks for new hires</p>
                </div>
                <button className="onb-add-btn" onClick={() => { setEditingWorkflow(null); setShowWorkflowModal(true); }}>
                    <Plus size={20} />
                    <span>New Workflow</span>
                </button>
            </div>

            {/* Stats */}
            <div className="onb-stats">
                <div className="onb-stat-card">
                    <div className="onb-stat-icon active"><Briefcase size={20} /></div>
                    <div className="onb-stat-info">
                        <span className="onb-stat-value">{stats.activeWorkflows}</span>
                        <span className="onb-stat-label">Active Workflows</span>
                    </div>
                </div>
                <div className="onb-stat-card">
                    <div className="onb-stat-icon total"><ClipboardList size={20} /></div>
                    <div className="onb-stat-info">
                        <span className="onb-stat-value">{stats.totalWorkflows}</span>
                        <span className="onb-stat-label">Total Workflows</span>
                    </div>
                </div>
                <div className="onb-stat-card">
                    <div className="onb-stat-icon progress"><Timer size={20} /></div>
                    <div className="onb-stat-info">
                        <span className="onb-stat-value">{stats.totalTasks}</span>
                        <span className="onb-stat-label">Total Tasks</span>
                    </div>
                </div>
                <div className="onb-stat-card">
                    <div className="onb-stat-icon done"><CheckCircle2 size={20} /></div>
                    <div className="onb-stat-info">
                        <span className="onb-stat-value">{stats.completed}</span>
                        <span className="onb-stat-label">Completed</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="onb-toolbar">
                <div className="onb-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search workflows..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery("")}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Layout */}
            <div className="onb-layout">
                {/* Workflows */}
                <div className="onb-workflows-column">
                    {filteredWorkflows.length === 0 ? (
                        <div className="onb-empty-state">
                            <ClipboardList size={48} />
                            <h3>No workflows found</h3>
                            <p>Create a new onboarding workflow to get started</p>
                        </div>
                    ) : (
                        filteredWorkflows.map(workflow => (
                            <WorkflowCard
                                key={workflow.id}
                                workflow={workflow}
                                active={selectedWorkflow?.id === workflow.id}
                                onSelect={() => selectWorkflow(workflow)}
                                onEdit={() => { setEditingWorkflow(workflow); setShowWorkflowModal(true); }}
                                onDelete={() => handleDeleteWorkflow(workflow)}
                            />
                        ))
                    )}
                </div>

                {/* Tasks */}
                <div className="onb-tasks-column">
                    {selectedWorkflow ? (
                        <>
                            <div className="onb-tasks-header">
                                <div className="onb-tasks-title-wrap">
                                    <h2 className="onb-tasks-title">{selectedWorkflow.name}</h2>
                                    <span className="onb-tasks-subtitle">
                                        {selectedWorkflow.department || "All departments"}
                                    </span>
                                </div>
                                <button className="onb-add-btn small" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
                                    <Plus size={18} />
                                    <span>Add Task</span>
                                </button>
                            </div>

                            {tasks.length === 0 ? (
                                <div className="onb-empty-state tasks">
                                    <AlertCircle size={40} />
                                    <h3>No tasks yet</h3>
                                    <p>Add tasks to this workflow</p>
                                </div>
                            ) : (
                                <div className="onb-task-list">
                                    {tasks.map(task => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            onToggle={() => handleToggleTask(task)}
                                            onEdit={() => { setEditingTask(task); setShowTaskModal(true); }}
                                            onDelete={() => handleDeleteTask(task)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="onb-empty-state tasks">
                            <MoreHorizontal size={40} />
                            <h3>Select a workflow</h3>
                            <p>Choose a workflow on the left to view its onboarding tasks</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Workflow Modal */}
            {showWorkflowModal && (
                <WorkflowModal
                    workflow={editingWorkflow}
                    onClose={() => { setShowWorkflowModal(false); setEditingWorkflow(null); }}
                    onSubmit={editingWorkflow
                        ? (data) => handleUpdateWorkflow(editingWorkflow.id, data)
                        : handleCreateWorkflow}
                />
            )}

            {/* Task Modal */}
            {showTaskModal && selectedWorkflow && (
                <TaskModal
                    workflowName={selectedWorkflow.name}
                    task={editingTask}
                    employees={employees}
                    nextOrder={tasks.length + 1}
                    onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
                    onSubmit={editingTask
                        ? (data) => handleUpdateTask(editingTask.id, data)
                        : handleCreateTask}
                />
            )}
        </div>
    );
};

export default OnboardingView;