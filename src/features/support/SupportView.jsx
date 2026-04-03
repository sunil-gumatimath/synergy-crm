import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, LifeBuoy, X, Trash2 } from "../../lib/icons";
import { supportService } from "../../services/supportService";
import CreateTicketModal from "./CreateTicketModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { SkeletonStatCard, SkeletonTable, Skeleton } from "../../components/common/Skeleton";
import Toast from "../../components/common/Toast";
import { useAuth } from "../../contexts/AuthContext";

const SupportView = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [toast, setToast] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

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

    useEffect(() => {
        fetchTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const getStatusColor = (status) => {
        switch (status) {
            case "resolved": return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/15 dark:border-green-500/30";
            case "in_progress": return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/15 dark:border-blue-500/30";
            case "closed": return "text-gray-600 bg-gray-100 border-gray-300 dark:text-gray-400 dark:bg-gray-500/15 dark:border-gray-500/30";
            default: return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/15 dark:border-orange-500/30";
        }
    };

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

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-main flex items-center gap-2">
                        <LifeBuoy size={28} className="text-primary" />
                        Help Desk & Support
                    </h1>
                    <p className="text-muted text-sm">Raise tickets and track your requests</p>
                </div>
                <div className="flex gap-3">
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
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}</p>
                        <p className="text-sm text-muted">Open Tickets</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 flex items-center justify-center">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}</p>
                        <p className="text-sm text-muted">Resolved</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">N/A</p>
                        <p className="text-sm text-muted">Avg. Response Time</p>
                    </div>
                </div>
            </div>

            {/* Ticket List */}
            <div className="card flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="font-semibold">My Tickets</h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-1 border border-[var(--border)] rounded-[var(--radius-md)] text-sm w-52 h-8 focus:outline-none focus:border-[var(--primary)]"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button className="btn btn-ghost">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '24px' }}>
                        <SkeletonTable rows={6} columns={6} hasCheckbox={false} />
                    </div>
                ) : tickets.length > 0 ? (
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[var(--bg-body)] text-xs uppercase text-muted font-semibold sticky top-0">
                                <tr>
                                    <th className="p-4">Ticket ID</th>
                                    <th className="p-4">Subject</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Last Updated</th>
                                    <th className="p-4">Priority</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {tickets.filter((ticket) => {
                                    // Apply search filter
                                    if (!searchTerm) return true;
                                    const term = searchTerm.toLowerCase();
                                    return (
                                        ticket.title.toLowerCase().includes(term) ||
                                        (ticket.category && ticket.category.toLowerCase().includes(term)) ||
                                        (ticket.priority && ticket.priority.toLowerCase().includes(term)) ||
                                        ticket.id.toString().includes(term)
                                    );
                                }).map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="hover:bg-[var(--bg-body)] transition-colors cursor-pointer group"
                                        onClick={() => openEditModal(ticket)}
                                    >
                                        <td className="p-4 font-mono text-xs text-muted">#{ticket.id}</td>
                                        <td className="p-4 font-medium">{ticket.title}</td>
                                        <td className="p-4 text-sm text-muted">{ticket.category || 'General'}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                                {getStatusIcon(ticket.status)}
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-muted">
                                            {new Date(ticket.created_at || new Date()).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-semibold uppercase ${ticket.priority === 'high' ? 'text-red-600' :
                                                ticket.priority === 'medium' ? 'text-orange-600' : 'text-green-600'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                onClick={(e) => openDeleteModal(e, ticket)}
                                                title="Delete Ticket"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted p-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={32} className="opacity-50" />
                        </div>
                        <p>No tickets found. Raise a new ticket to get started.</p>
                    </div>
                )}
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
