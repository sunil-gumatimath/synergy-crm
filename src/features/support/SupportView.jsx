import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, LifeBuoy, X, Trash2 } from "../../lib/icons";
import { supportService } from "../../services/supportService";
import CreateTicketModal from "./CreateTicketModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { SupportViewSkeleton } from "../../components/common/PageSkeletons";
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

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    };

    const abbreviateTicketId = (id) => id?.toString().slice(0, 8) || "--------";

    const formatCategory = (category) =>
        category ? category.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "General";

    const filteredTickets = tickets.filter((ticket) => {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="card p-5 rounded-[1.75rem] border-white/10 bg-slate-950/90 shadow-[0_28px_80px_-45px_rgba(15,23,42,0.85)]">
                    <div className="flex items-center justify-between gap-4">
                        <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                            <Clock size={22} />
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-semibold text-main">{tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}</p>
                            <p className="text-sm text-slate-400">Open Tickets</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">Issues currently active or awaiting a support response.</p>
                </div>
                <div className="card p-5 rounded-[1.75rem] border-white/10 bg-slate-950/90 shadow-[0_28px_80px_-45px_rgba(15,23,42,0.85)]">
                    <div className="flex items-center justify-between gap-4">
                        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
                            <CheckCircle size={22} />
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-semibold text-main">{tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}</p>
                            <p className="text-sm text-slate-400">Resolved</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">Requests closed successfully in the help desk workflow.</p>
                </div>
                <div className="card p-5 rounded-[1.75rem] border-white/10 bg-slate-950/90 shadow-[0_28px_80px_-45px_rgba(15,23,42,0.85)]">
                    <div className="flex items-center justify-between gap-4">
                        <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-300">
                            <MessageSquare size={22} />
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-semibold text-main">N/A</p>
                            <p className="text-sm text-slate-400">Avg. Response Time</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">Response time tracking will appear here once available.</p>
                </div>
            </div>

            {/* Ticket List */}
            <div className="card flex-1 overflow-hidden flex flex-col rounded-[2rem] border border-white/10 bg-[var(--bg-panel)] shadow-[0_24px_100px_-50px_rgba(15,23,42,0.9)]">
                <div className="p-4 border-b border-white/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-semibold text-lg">My Tickets</h2>
                        <p className="text-sm text-muted mt-1">Search, filter, and manage your support requests at a glance.</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-72">
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-full border border-white/10 bg-[var(--bg-body)] px-4 py-2 text-sm text-main outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
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
                        <button className="btn btn-ghost h-10 gap-2 self-start">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {filteredTickets.length > 0 ? (
                        <div className="grid gap-4 xl:grid-cols-2">
                            {filteredTickets.map((ticket) => {
                                const priorityClasses = ticket.priority === 'high'
                                    ? 'bg-red-500/10 text-red-300 border-red-500/15'
                                    : ticket.priority === 'medium'
                                        ? 'bg-orange-500/10 text-orange-300 border-orange-500/15'
                                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/15';

                                return (
                                    <div
                                        key={ticket.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => openEditModal(ticket)}
                                        className="group rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.85)] transition duration-200 hover:-translate-y-0.5 hover:bg-slate-900/95 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between min-w-0">
                                            <div className="space-y-3 min-w-0 w-full">
                                                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                                                    <span className="inline-flex min-w-0 break-words items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">#{abbreviateTicketId(ticket.id)}</span>
                                                    <span className="inline-flex min-w-0 break-words items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">{formatCategory(ticket.category)}</span>
                                                </div>
                                                <h3 className="text-xl font-semibold text-main break-words max-w-full">{ticket.title}</h3>
                                                <p className="text-sm leading-6 text-slate-400 break-words max-w-full">{ticket.description || "No additional details provided."}</p>
                                            </div>
                                            <div className="flex flex-col gap-3 sm:items-end min-w-0 w-full sm:w-auto">
                                                <span className={`inline-flex max-w-full break-words items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(ticket.status)}`}>
                                                    {getStatusIcon(ticket.status)}
                                                    {getStatusLabel(ticket.status)}
                                                </span>
                                                <span className={`inline-flex max-w-full break-words items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${priorityClasses}`}>
                                                    {ticket.priority}
                                                </span>
                                                <div className="text-right text-xs uppercase tracking-[0.18em] text-slate-500">Updated</div>
                                                <div className="text-sm font-medium text-slate-300">{formatDate(ticket.updated_at || ticket.created_at)}</div>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-slate-400">
                                            <span className="text-slate-400">Click to open ticket details</span>
                                            <button
                                                className="text-muted hover:text-red-500 transition-colors p-2"
                                                onClick={(e) => openDeleteModal(e, ticket)}
                                                title="Delete Ticket"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-slate-950/70 p-10 text-center text-slate-400">
                            <div className="mb-4 rounded-full bg-slate-900 p-4">
                                <MessageSquare size={28} className="text-slate-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-main">No tickets to display yet</h3>
                            <p className="max-w-xl text-sm text-slate-400">Use the raise ticket button to submit a new request, and we’ll show it here once it’s created.</p>
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
