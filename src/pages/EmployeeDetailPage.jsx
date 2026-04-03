import React, { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FiBriefcase,
    FiCalendar,
    FiEdit2,
    FiTrash2,
    FiUser,
    FiTrendingUp,
    FiClock,
    FiPhone,
    FiMapPin,
    FiHash,
    FiDownload,
    FiCreditCard,
    FiChevronRight,
    FiFolder,
    FiAward,
    FiTarget,
    FiPlus,
    FiMail,
    FiArrowLeft
} from "react-icons/fi";
import { MdOutlineBusiness, MdCurrencyRupee, MdOutlineAccountBalance } from "react-icons/md";
import { FaGraduationCap } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { isAdminRole } from "../utils/roles";

import { employeeService } from "../services/employeeService";
import noteService from "../services/noteService";
import documentService from "../services/documentService";
import { SkeletonStatCard, Skeleton } from "../components/common/Skeleton";
import Toast from "../components/common/Toast";
import Avatar from "../components/common/Avatar";
import DocumentList from "../components/DocumentList";
import NotesList from "../components/NotesList";
import "./employee-detail-styles.css";

// Lazy load modals
const EditEmployeeModal = lazy(() => import("../components/EditEmployeeModal"));
const ConfirmModal = lazy(() => import("../components/ui/ConfirmModal"));
const BankDetailsModal = lazy(() => import("../components/BankDetailsModal"));
const EducationModal = lazy(() => import("../components/EducationModal"));

const EmployeeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isAdmin = isAdminRole(currentUser?.role);
    const [employee, setEmployee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [notes, setNotes] = useState([]);
    const [documentsLoading, setDocumentsLoading] = useState(true);
    const [notesLoading, setNotesLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Fetch employee data
    const fetchEmployee = async () => {
        if (!id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const queryId = !isNaN(id) && !id.includes("-") ? parseInt(id) : id;
            const { data, error } = await employeeService.getById(queryId);
            if (error) {
                setToast({ type: "error", message: "Failed to load employee details." });
                setEmployee(null);
            } else {
                setEmployee(data);
            }
        } catch {
            setToast({ type: "error", message: "An unexpected error occurred." });
            setEmployee(null);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDocuments = async () => {
        setDocumentsLoading(true);
        const { data } = await documentService.getByEmployeeId(id);
        setDocuments(data || []);
        setDocumentsLoading(false);
    };

    const fetchNotes = async () => {
        setNotesLoading(true);
        const { data } = await noteService.getByEmployeeId(id);
        setNotes(data || []);
        setNotesLoading(false);
    };

    useEffect(() => {
        fetchEmployee();
        fetchDocuments();
        fetchNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Handlers
    const handleDocumentAdded = (doc) => {
        setDocuments((prev) => [doc, ...prev]);
        setToast({ type: "success", message: "Document uploaded successfully!" });
    };

    const handleDocumentDeleted = async (docId) => {
        await documentService.delete(docId);
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        setToast({ type: "success", message: "Document deleted." });
    };

    const handleNoteAdded = (note) => {
        setNotes((prev) => [note, ...prev]);
        setToast({ type: "success", message: "Note added!" });
    };

    const handleNoteUpdated = (updated) => {
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        setToast({ type: "success", message: "Note updated!" });
    };

    const handleNoteDeleted = async (noteId) => {
        await noteService.delete(noteId);
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        setToast({ type: "success", message: "Note deleted." });
    };

    const handleEditEmployee = async (empId, updates) => {
        setActionLoading(true);
        const { data, error } = await employeeService.update(empId, updates);
        if (error) {
            setToast({ type: "error", message: error.message || "Failed to update." });
        } else {
            setToast({ type: "success", message: `${data.name} updated successfully!` });
            setShowEditModal(false);
            fetchEmployee();
        }
        setActionLoading(false);
    };

    const handleDeleteEmployee = async () => {
        if (!employee) return;
        setActionLoading(true);
        const { error } = await employeeService.delete(employee.id);
        if (error) {
            setToast({ type: "error", message: error.message || "Failed to delete." });
            setActionLoading(false);
        } else {
            setToast({ type: "success", message: `${employee.name} has been removed.` });
            setTimeout(() => navigate("/employees"), 1500);
        }
    };

    const handleUpdateBankDetails = async (empId, updates) => {
        setActionLoading(true);
        const { data, error } = await employeeService.update(empId, updates);
        if (error) {
            setToast({ type: "error", message: error.message || "Failed to update bank details." });
        } else {
            setToast({ type: "success", message: "Bank details updated successfully!" });
            setShowBankModal(false);
            setEmployee(data);
        }
        setActionLoading(false);
    };

    const handleUpdateEducation = async (empId, updates) => {
        setActionLoading(true);
        const { data, error } = await employeeService.update(empId, updates);
        if (error) {
            setToast({ type: "error", message: error.message || "Failed to update education." });
        } else {
            setToast({ type: "success", message: "Education history updated successfully!" });
            setShowEducationModal(false);
            setEmployee(data);
        }
        setActionLoading(false);
    };

    // Helpers
    const getStatusClass = (status) => {
        switch (status) {
            case "Active": return "active";
            case "On Leave": return "leave";
            default: return "inactive";
        }
    };

    const getEmploymentDuration = (joinDate) => {
        if (!joinDate) return "N/A";
        const start = new Date(joinDate);
        const now = new Date();
        const months = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30));
        const years = Math.floor(months / 12);
        const rem = months % 12;
        if (years > 0) return `${years}y ${rem}m`;
        return months === 0 ? "< 1 month" : `${months} months`;
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const exportProfile = () => {
        if (!employee) return;
        const content = `
EMPLOYEE PROFILE
================
Name: ${employee.name}
Email: ${employee.email}
Role: ${employee.role}
Department: ${employee.department}
Status: ${employee.status}
Join Date: ${formatDate(employee.join_date)}
Phone: ${employee.phone || "N/A"}
Location: ${employee.location || "N/A"}
Salary: ${employee.salary ? `₹${employee.salary.toLocaleString()}` : "N/A"}
Performance Score: ${employee.performance_score || "N/A"}%

Exported: ${new Date().toLocaleString()}
    `;
        const blob = new Blob([content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${employee.name.replace(/\s+/g, "_")}_Profile.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        setToast({ type: "success", message: "Profile exported!" });
    };

    // Tab content renderers
    const renderOverviewTab = () => (
        <>
            {/* Stats Grid */}
            <div className="emp-detail__stats-grid">
                <div className="emp-detail__stat-card">
                    <div className="emp-detail__stat-icon emp-detail__stat-icon--success">
                        <FiTrendingUp size={24} />
                    </div>
                    <div className="emp-detail__stat-info">
                        <h4>{employee.performance_score ? `${employee.performance_score}%` : "—"}</h4>
                        <p>Performance Score</p>
                    </div>
                </div>
                <div className="emp-detail__stat-card">
                    <div className="emp-detail__stat-icon emp-detail__stat-icon--primary">
                        <FiClock size={24} />
                    </div>
                    <div className="emp-detail__stat-info">
                        <h4>{getEmploymentDuration(employee.join_date)}</h4>
                        <p>Time with Company</p>
                    </div>
                </div>
                <div className="emp-detail__stat-card">
                    <div className="emp-detail__stat-icon emp-detail__stat-icon--info">
                        <MdCurrencyRupee size={24} />
                    </div>
                    <div className="emp-detail__stat-info">
                        <h4>{employee.salary ? `₹${employee.salary.toLocaleString()}` : "—"}</h4>
                        <p>Annual Salary</p>
                    </div>
                </div>
                <div className="emp-detail__stat-card">
                    <div className="emp-detail__stat-icon emp-detail__stat-icon--warning">
                        <FiTarget size={24} />
                    </div>
                    <div className="emp-detail__stat-info">
                        <h4>{employee.projects_completed ?? "—"}</h4>
                        <p>Projects Completed</p>
                    </div>
                </div>
            </div>

            {/* Employment Details */}
            <div className="emp-detail__card">
                <div className="emp-detail__card-header">
                    <h3 className="emp-detail__card-title">
                        <FiBriefcase />
                        Employment Details
                    </h3>
                </div>
                <div className="emp-detail__card-body">
                    <div className="emp-detail__info-grid">
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><FiHash size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">Employee ID</div>
                                <div className="emp-detail__info-value">EMP{String(employee.id).slice(0, 8).toUpperCase()}</div>
                            </div>
                        </div>
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><FiBriefcase size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">Job Title</div>
                                <div className="emp-detail__info-value">{employee.role}</div>
                            </div>
                        </div>
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><MdOutlineBusiness size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">Department</div>
                                <div className="emp-detail__info-value">{employee.department}</div>
                            </div>
                        </div>
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><FiCalendar size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">Join Date</div>
                                <div className="emp-detail__info-value">{formatDate(employee.join_date)}</div>
                            </div>
                        </div>
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><FiUser size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">Reporting Manager</div>
                                <div className="emp-detail__info-value">{employee.manager || "Not Assigned"}</div>
                            </div>
                        </div>
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><FiAward size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">Employment Type</div>
                                <div className="emp-detail__info-value">{employee.employment_type || "Full-time"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const renderFinanceTab = () => (
        <div className="emp-detail__card">
            <div className="emp-detail__card-header">
                <h3 className="emp-detail__card-title">
                    <MdOutlineAccountBalance />
                    Bank & Payment Details
                </h3>
                {isAdmin && (
                    <button
                        className="emp-detail__btn emp-detail__btn--secondary emp-detail__btn--sm"
                        onClick={() => setShowBankModal(true)}
                    >
                        <FiEdit2 size={14} />
                        {employee.bank_details ? "Edit" : "Add"}
                    </button>
                )}
            </div>
            <div className="emp-detail__card-body">
                {employee.bank_details ? (
                    <div className="emp-detail__info-grid">
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><MdOutlineAccountBalance size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">Bank Name</div>
                                <div className="emp-detail__info-value">{employee.bank_details.bankName || "—"}</div>
                            </div>
                        </div>
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><FiCreditCard size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">Account Number</div>
                                <div className="emp-detail__info-value">{employee.bank_details.accountNumber || "—"}</div>
                            </div>
                        </div>
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><FiHash size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">IFSC Code</div>
                                <div className="emp-detail__info-value">{employee.bank_details.ifscCode || "—"}</div>
                            </div>
                        </div>
                        <div className="emp-detail__info-item">
                            <div className="emp-detail__info-icon"><FiMapPin size={18} /></div>
                            <div className="emp-detail__info-content">
                                <div className="emp-detail__info-label">Branch</div>
                                <div className="emp-detail__info-value">{employee.bank_details.branch || "—"}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="emp-detail__empty">
                        <MdOutlineAccountBalance size={48} className="emp-detail__empty-icon" />
                        <h3>No Bank Details</h3>
                        <p>Payment information has not been added for this employee yet.</p>
                        {isAdmin && (
                            <button
                                className="emp-detail__btn emp-detail__btn--primary"
                                onClick={() => setShowBankModal(true)}
                                style={{ marginTop: '16px' }}
                            >
                                <FiPlus size={16} />
                                Add Bank Details
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderEducationTab = () => (
        <div className="emp-detail__card">
            <div className="emp-detail__card-header">
                <h3 className="emp-detail__card-title">
                    <FaGraduationCap />
                    Education History
                </h3>
                {isAdmin && (
                    <button
                        className="emp-detail__btn emp-detail__btn--secondary emp-detail__btn--sm"
                        onClick={() => setShowEducationModal(true)}
                    >
                        <FiEdit2 size={14} />
                        {employee.education && employee.education.length > 0 ? "Edit" : "Add"}
                    </button>
                )}
            </div>
            <div className="emp-detail__card-body">
                {employee.education && employee.education.length > 0 ? (
                    <div className="emp-detail__timeline">
                        {employee.education.map((edu, idx) => (
                            <div key={idx} className="emp-detail__timeline-item">
                                <div className="emp-detail__timeline-marker">
                                    <FaGraduationCap size={12} />
                                </div>
                                <div className="emp-detail__timeline-content">
                                    <h4 className="emp-detail__timeline-title">{edu.degree}</h4>
                                    <p className="emp-detail__timeline-subtitle">{edu.institution}</p>
                                    <p className="emp-detail__timeline-date">{edu.year}</p>
                                    {edu.grade && (
                                        <span className="emp-detail__timeline-badge">Grade: {edu.grade}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="emp-detail__empty">
                        <FaGraduationCap size={48} className="emp-detail__empty-icon" />
                        <h3>No Education Records</h3>
                        <p>Education history has not been added for this employee.</p>
                        {isAdmin && (
                            <button
                                className="emp-detail__btn emp-detail__btn--primary"
                                onClick={() => setShowEducationModal(true)}
                                style={{ marginTop: '16px' }}
                            >
                                <FiPlus size={16} />
                                Add Education
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderDocumentsTab = () => (
        <div className="emp-detail__docs-grid">
            <DocumentList
                employeeId={employee.id}
                documents={documents}
                onDocumentAdded={handleDocumentAdded}
                onDocumentDeleted={handleDocumentDeleted}
                isLoading={documentsLoading}
            />
            <NotesList
                employeeId={employee.id}
                notes={notes}
                onNoteAdded={handleNoteAdded}
                onNoteUpdated={handleNoteUpdated}
                onNoteDeleted={handleNoteDeleted}
                isLoading={notesLoading}
            />
        </div>
    );

    const tabs = [
        { id: "overview", label: "Overview", icon: <FiUser size={16} /> },
        { id: "finance", label: "Finance", icon: <MdCurrencyRupee size={16} /> },
        { id: "education", label: "Education", icon: <FaGraduationCap size={16} /> },
        { id: "documents", label: "Documents", icon: <FiFolder size={16} /> },
    ];

    // Loading state
    if (isLoading) {
        return (
            <div className="emp-detail">
                <div className="emp-detail__wrapper">
                    {/* Breadcrumb Skeleton */}
                    <nav className="emp-detail__breadcrumb">
                        <Skeleton width="80px" height="14px" />
                        <Skeleton width="14px" height="14px" borderRadius="2px" />
                        <Skeleton width="120px" height="14px" />
                    </nav>

                    {/* Hero Card Skeleton */}
                    <div className="emp-detail__hero">
                        <div className="emp-detail__hero-banner" />
                        <div className="emp-detail__hero-content">
                            <div className="emp-detail__avatar-container">
                                <Skeleton width="140px" height="140px" borderRadius="16px" />
                            </div>
                            <div className="emp-detail__info">
                                <Skeleton width="200px" height="28px" />
                                <Skeleton width="150px" height="16px" className="mt-2" />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <Skeleton width="70px" height="24px" borderRadius="12px" />
                                    <Skeleton width="100px" height="24px" borderRadius="12px" />
                                </div>
                            </div>
                            <div className="emp-detail__actions" style={{ display: 'flex', gap: '8px' }}>
                                <Skeleton width="80px" height="36px" borderRadius="8px" />
                                <Skeleton width="70px" height="36px" borderRadius="8px" />
                                <Skeleton width="40px" height="36px" borderRadius="8px" />
                            </div>
                        </div>
                    </div>

                    {/* Main Grid Skeleton */}
                    <div className="emp-detail__grid">
                        <aside className="emp-detail__sidebar">
                            <div className="emp-detail__card">
                                <div className="emp-detail__card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                            <Skeleton width="36px" height="36px" borderRadius="8px" />
                                            <div>
                                                <Skeleton width="60px" height="12px" />
                                                <Skeleton width="120px" height="14px" className="mt-1" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                        <main className="emp-detail__main">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <SkeletonStatCard key={i} hasIcon={true} />
                                ))}
                            </div>
                            <div className="emp-detail__card">
                                <div className="emp-detail__card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                            <Skeleton width="36px" height="36px" borderRadius="8px" />
                                            <div>
                                                <Skeleton width="80px" height="12px" />
                                                <Skeleton width="140px" height="14px" className="mt-1" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (!employee) {
        return (
            <div className="emp-detail">
                <div className="emp-detail__error">
                    <FiUser size={64} className="emp-detail__error-icon" />
                    <h3>Employee Not Found</h3>
                    <p>The employee you're looking for doesn't exist or has been removed.</p>
                    <button className="emp-detail__btn emp-detail__btn--primary" onClick={() => navigate("/employees")}>
                        <FiArrowLeft size={18} />
                        Back to Employees
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="emp-detail">
            <div className="emp-detail__wrapper">
                {/* Breadcrumb */}
                <nav className="emp-detail__breadcrumb">
                    <button className="emp-detail__breadcrumb-link" onClick={() => navigate("/employees")}>
                        Employees
                    </button>
                    <FiChevronRight size={14} className="emp-detail__breadcrumb-sep" />
                    <span className="emp-detail__breadcrumb-current">{employee.name}</span>
                </nav>

                {/* Hero Card */}
                <div className="emp-detail__hero">
                    <div className="emp-detail__hero-banner" />
                    <div className="emp-detail__hero-content">
                        <div className="emp-detail__avatar-container">
                            <Avatar
                                name={employee.name}
                                gender={employee.gender || "other"}
                                size="xl"
                                className="emp-detail__avatar"
                            />
                        </div>
                        <div className="emp-detail__info">
                            <h1 className="emp-detail__name">{employee.name}</h1>
                            <p className="emp-detail__role">
                                <FiBriefcase size={16} />
                                {employee.role}
                            </p>
                            <div className="emp-detail__badges">
                                <span className={`emp-detail__badge emp-detail__badge--status ${getStatusClass(employee.status)}`}>
                                    {employee.status}
                                </span>
                                <span className="emp-detail__badge emp-detail__badge--dept">
                                    <MdOutlineBusiness size={12} />
                                    {employee.department}
                                </span>
                            </div>
                        </div>
                        <div className="emp-detail__actions">
                            <button className="emp-detail__btn emp-detail__btn--secondary" onClick={exportProfile}>
                                <FiDownload size={16} />
                                Export
                            </button>
                            {isAdmin && (
                                <>
                                    <button className="emp-detail__btn emp-detail__btn--primary" onClick={() => setShowEditModal(true)}>
                                        <FiEdit2 size={16} />
                                        Edit
                                    </button>
                                    <button className="emp-detail__btn emp-detail__btn--danger" onClick={() => setShowDeleteModal(true)}>
                                        <FiTrash2 size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="emp-detail__grid">
                    {/* Sidebar */}
                    <aside className="emp-detail__sidebar">
                        {/* Contact Card */}
                        <div className="emp-detail__card">
                            <div className="emp-detail__card-header">
                                <h3 className="emp-detail__card-title">
                                    <FiUser />
                                    Contact Info
                                </h3>
                            </div>
                            <div className="emp-detail__card-body">
                                <div className="emp-detail__contact-list">
                                    <div className="emp-detail__contact-item">
                                        <div className="emp-detail__contact-icon"><FiMail size={16} /></div>
                                        <div className="emp-detail__contact-content">
                                            <div className="emp-detail__contact-label">Email</div>
                                            <div className="emp-detail__contact-value">{employee.email}</div>
                                        </div>
                                    </div>
                                    <div className="emp-detail__contact-item">
                                        <div className="emp-detail__contact-icon"><FiPhone size={16} /></div>
                                        <div className="emp-detail__contact-content">
                                            <div className="emp-detail__contact-label">Phone</div>
                                            <div className="emp-detail__contact-value">{employee.phone || "Not provided"}</div>
                                        </div>
                                    </div>
                                    <div className="emp-detail__contact-item">
                                        <div className="emp-detail__contact-icon"><FiMapPin size={16} /></div>
                                        <div className="emp-detail__contact-content">
                                            <div className="emp-detail__contact-label">Location</div>
                                            <div className="emp-detail__contact-value">{employee.location || "Not specified"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="emp-detail__card">
                            <div className="emp-detail__card-header">
                                <h3 className="emp-detail__card-title">
                                    <FiTrendingUp />
                                    Quick Stats
                                </h3>
                            </div>
                            <div className="emp-detail__card-body">
                                <div className="emp-detail__quick-stats">
                                    <div className="emp-detail__quick-stat">
                                        <div className="emp-detail__quick-stat-value">{documents.length}</div>
                                        <div className="emp-detail__quick-stat-label">Documents</div>
                                    </div>
                                    <div className="emp-detail__quick-stat">
                                        <div className="emp-detail__quick-stat-value">{notes.length}</div>
                                        <div className="emp-detail__quick-stat-label">Notes</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="emp-detail__main">
                        {/* Tabs */}
                        <div className="emp-detail__tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`emp-detail__tab ${activeTab === tab.id ? "emp-detail__tab--active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="emp-detail__tab-content">
                            {activeTab === "overview" && renderOverviewTab()}
                            {activeTab === "finance" && renderFinanceTab()}
                            {activeTab === "education" && renderEducationTab()}
                            {activeTab === "documents" && renderDocumentsTab()}
                        </div>
                    </main>
                </div>
            </div>

            {/* Modals */}
            <Suspense fallback={null}>
                <EditEmployeeModal
                    isOpen={showEditModal}
                    employee={employee}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={handleEditEmployee}
                    isLoading={actionLoading}
                />
            </Suspense>

            <Suspense fallback={null}>
                <ConfirmModal
                    isOpen={showDeleteModal}
                    title="Delete Employee"
                    message={`Are you sure you want to delete ${employee?.name}? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={handleDeleteEmployee}
                    onCancel={() => setShowDeleteModal(false)}
                    isLoading={actionLoading}
                    type="danger"
                />
            </Suspense>

            <Suspense fallback={null}>
                <BankDetailsModal
                    isOpen={showBankModal}
                    employee={employee}
                    onClose={() => setShowBankModal(false)}
                    onSubmit={handleUpdateBankDetails}
                    isLoading={actionLoading}
                />
            </Suspense>

            <Suspense fallback={null}>
                <EducationModal
                    isOpen={showEducationModal}
                    employee={employee}
                    onClose={() => setShowEducationModal(false)}
                    onSubmit={handleUpdateEducation}
                    isLoading={actionLoading}
                />
            </Suspense>


            {/* Toast */}
            {toast && (
                <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
            )}
        </div>
    );
};

export default EmployeeDetailPage;
