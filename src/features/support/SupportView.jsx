import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, LifeBuoy, X, Trash2 } from "../../lib/icons";
import { supportService } from "../../services/supportService";
import CreateTicketModal from "./CreateTicketModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { SupportViewSkeleton } from "../../components/common/PageSkeletons";
import Toast from "../../components/common/Toast";
import { useAuth } from "../../contexts/AuthContext";
import "./support-styles.css";

const SupportView = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [toast, setToast] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Edit/Delete State
    const [editingTicket, setEditingTicket] = useState(null);
    const [deletingTicket, setDeletingTicket] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchTickets = async () => {
        setIsLoading(true);
        // Fetch tickets from support_tickets table, optionally filter by user
        const { data, error } = await supportService.getAll({ userId: user?.employeeId });
        if (!error) {
            setTickets(data || []);
        }
        setIsLoading(false);
    };
  /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        fetchTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

    const handleCreateTicket = async (ticketData) => {
        // Add user info to the ticket
        const newTicket = {
            ...ticketData,
            createdBy: user?.employeeId
        };

        const { error } = await supportService.create(newTicket);

        if (error) {
            setToast({ type: "error", message: "Failed to create ticket" });
        } else {
            setToast({ type: "success", message: "Ticket created successfully" });
            setShowCreateModal(false);
            fetchTickets();
        }
    };

    const handleUpdateTicket = async (ticketData) => {
        if (!editingTicket) return;

        const { error } = await supportService.update(editingTicket.id, ticketData);

        if (error) {
            setToast({ type: "error", message: "Failed to update ticket" });
        } else {
            setToast({ type: "success", message: "Ticket updated successfully" });
            setShowCreateModal(false);
            setEditingTicket(null);
            fetchTickets();
        }
    };

    const handleDeleteTicket = async () => {
        if (!deletingTicket) return;

        const { error } = await supportService.delete(deletingTicket.id);

        if (error) {
            setToast({ type: "error", message: "Failed to delete ticket" });
        } else {
            setToast({ type: "success", message: "Ticket deleted successfully" });
            setShowDeleteModal(false);
            setDeletingTicket(null);
            fetchTickets();
        }
    };

    const openEditModal = (ticket) => {
        setEditingTicket(ticket);
        setShowCreateModal(true);
    };

    const openDeleteModal = (e, ticket) => {
        e.stopPropagation(); // Prevent row click
        setDeletingTicket(ticket);
        setShowDeleteModal(true);
    };

    const getStatusClass = (status) => `status-${status || "open"}`;

    const getStatusIcon = (status) => {
        switch (status) {
            case "resolved": return <CheckCircle size={14} />;
            case "in_progress": return <Clock size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "resolved": return "Resolved";
            case "in_progress": return "In Progress";
            case "closed": return "Closed";
            default: return "Open";
        }
    };

    const getPriorityClass = (priority) => `priority-${priority || "low"}`;

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    };

    const abbreviateTicketId = (id) => id?.toString().slice(0, 8) || "--------";

    const formatCategory = (category) =>
        category ? category.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "General";

    const filteredTickets = tickets.filter((ticket) => {
        if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            ticket.title.toLowerCase().includes(term) ||
            (ticket.category && ticket.category.toLowerCase().includes(term)) ||
            (ticket.priority && ticket.priority.toLowerCase().includes(term)) ||
            ticket.id.toString().includes(term)
        );
    });

    if (isLoading) {
        return <SupportViewSkeleton />;
    }

    return (
        <div className="support-container">
            {/* Header */}
            <div className="support-header">
                <div className="support-title-section">
                    <h1>
                        <LifeBuoy size={26} />
                        Help Desk &amp; Support
                    </h1>
                    <p>Raise tickets and track your requests</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingTicket(null);
                        setShowCreateModal(true);
                    }}
                >
                    <Plus size={18} />
                    Raise Ticket
                </button>
            </div>

            {/* Stats Overview */}
            <div className="support-stats">
                <div className="support-stat-card">
                    <div className="support-stat-icon open">
                        <Clock size={22} />
                    </div>
                    <div className="support-stat-info">
                        <span className="support-stat-value">
                            {tickets.filter((t) => t.status === "open" || t.status === "in_progress").length}
                        </span>
                        <span className="support-stat-label">Open Tickets</span>
                    </div>
                    <p className="support-stat-desc">Issues currently active or awaiting a support response.</p>
                </div>
                <div className="support-stat-card">
                    <div className="support-stat-icon resolved">
                        <CheckCircle size={22} />
                    </div>
                    <div className="support-stat-info">
                        <span className="support-stat-value">
                            {tickets.filter((t) => t.status === "resolved" || t.status === "closed").length}
                        </span>
                        <span className="support-stat-label">Resolved</span>
                    </div>
                    <p className="support-stat-desc">Requests closed successfully in the help desk workflow.</p>
                </div>
                <div className="support-stat-card">
                    <div className="support-stat-icon response">
                        <MessageSquare size={22} />
                    </div>
                    <div className="support-stat-info">
                        <span className="support-stat-value">N/A</span>
                        <span className="support-stat-label">Avg. Response</span>
                    </div>
                    <p className="support-stat-desc">Response time tracking will appear here once available.</p>
                </div>
            </div>

            {/* Ticket List */}
            <div className="support-list-panel">
                <div className="support-panel-head">
                    <div>
                        <h2>My Tickets</h2>
                        <p>Search, filter, and manage your support requests at a glance.</p>
                    </div>
                    <div className="support-toolbar">
                        <div className="support-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search tickets"
                            />
                            {searchTerm && (
                                <button
                                    className="support-search-clear"
                                    onClick={() => setSearchTerm("")}
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <div className="filter-group">
                            <Filter size={16} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label="Filter by status"
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="support-ticket-grid">
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket) => (
                            <button
                                key={ticket.id}
                                type="button"
                                className="ticket-card"
                                onClick={() => openEditModal(ticket)}
                            >
                                <div className="ticket-card-top">
                                    <div className="ticket-meta-tags">
                                        <span className="ticket-tag">#{abbreviateTicketId(ticket.id)}</span>
                                        <span className="ticket-tag">{formatCategory(ticket.category)}</span>
                                    </div>
                                    <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                                        {getStatusIcon(ticket.status)}
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="ticket-title">{ticket.title}</h3>
                                    <p className="ticket-desc">
                                        {ticket.description || "No additional details provided."}
                                    </p>
                                </div>

                                <div className="ticket-card-bottom">
                                    <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                    <div className="ticket-updated">
                                        <span>Updated</span>
                                        <span className="ticket-updated-date">
                                            {formatDate(ticket.updated_at || ticket.created_at)}
                                        </span>
                                    </div>
                                    <span
                                        className="ticket-delete-btn"
                                        role="button"
                                        tabIndex={-1}
                                        onClick={(e) => openDeleteModal(e, ticket)}
                                        title="Delete Ticket"
                                    >
                                        <Trash2 size={18} />
                                    </span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="support-empty">
                            <div className="support-empty-icon">
                                <MessageSquare size={28} />
                            </div>
                            <h3>No tickets to display yet</h3>
                            <p>
                                Use the raise ticket button to submit a new request, and we&rsquo;ll show
                                it here once it&rsquo;s created.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <CreateTicketModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingTicket(null);
                }}
                onSubmit={editingTicket ? handleUpdateTicket : handleCreateTicket}
                isLoading={false}
                ticketToEdit={editingTicket}
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteTicket}
                title="Delete Ticket"
                message={`Are you sure you want to delete ticket #${deletingTicket?.id} "${deletingTicket?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
            />

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default SupportView;
