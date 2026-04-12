import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Users, RefreshCw, Download, Search, X, LayoutGrid, List } from "../../lib/icons";
import { useVirtualizer } from "@tanstack/react-virtual";
import "./employees-styles.css";
import { employeeService } from "../../services/employeeService";
import { supabase } from "../../lib/supabase";
import Toast from "../../components/common/Toast";
import EmployeeCard from "../../components/EmployeeCard";
import Pagination from "../../components/common/Pagination";
import { SkeletonEmployeeCard, SkeletonFilterBar, Skeleton } from "../../components/common/Skeleton";
import FilterPanel from "../../components/FilterPanel";
import SortControls from "../../components/SortControls";
import BulkActionToolbar from "../../components/BulkActionToolbar";
import EmployeesByRole from "./EmployeesByRole";
import { useAuth } from "../../contexts/AuthContext";
import { isAdminRole } from "../../utils/roles";
import { EmployeeListSkeleton } from "../../components/common/PageSkeletons";



// Lazy load modals for better performance
const AddEmployeeModal = lazy(
  () => import("../../components/AddEmployeeModal"),
);
const EditEmployeeModal = lazy(
  () => import("../../components/EditEmployeeModal"),
);
const ConfirmModal = lazy(() => import("../../components/ui/ConfirmModal"));

const DEFAULT_PAGE_SIZE = 20;

const EmployeeList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "byRole"
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Filter and sort states
  const [filters, setFilters] = useState({
    department: "",
    role: "",
    status: "",
  });
  const [sortBy, setSortBy] = useState("join_date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Debounce search term to reduce re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ─── Server-Side Paginated Query ──────────────────────
  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearchTerm,
      department: filters.department,
      role: filters.role,
      status: filters.status,
      sortBy,
      sortOrder,
    }),
    [page, pageSize, debouncedSearchTerm, filters, sortBy, sortOrder],
  );

  const {
    data: queryResult = { data: [], count: 0 },
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["employees", queryParams],
    queryFn: async () => {
      const result = await employeeService.getAll(queryParams);
      if (result.error) throw result.error;
      return { data: result.data || [], count: result.count ?? 0 };
    },
    keepPreviousData: true, // keep stale data visible while loading next page
  });

  const employees = queryResult.data;
  const totalCount = queryResult.count;
  const isRefreshing = isFetching && !isLoading;

  // We also need a lightweight "all employees" list for the FilterPanel dropdown
  // options (department/role/status lists). This is a separate, un-paginated count-only
  // call, but we can simply use the totalCount + the available options from the
  // current page. For simplicity we'll fetch all employees once for filter options.
  const { data: allEmployees = [] } = useQuery({
    queryKey: ["employees-options"],
    queryFn: async () => {
      const { data } = await employeeService.getAll({ page: 1, pageSize: 1000 });
      return data || [];
    },
    staleTime: 60_000, // revalidate every minute
  });

  // Toast state
  const [toast, setToast] = useState(null);

  // React Query error handling
  useEffect(() => {
    let timeoutId;
    if (isError) {
      timeoutId = setTimeout(() => {
        setToast({
          type: "error",
          message: "Failed to load employees. Please try again.",
        });
      }, 0);
    }
    return () => clearTimeout(timeoutId);
  }, [isError]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Bulk selection state
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Refactored to trigger React Query invalidation
  const fetchEmployees = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    queryClient.invalidateQueries({ queryKey: ["employees-options"] });
  }, [queryClient]);

  // Supabase Realtime subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel("employees-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "employees",
        },
        (payload) => {
          fetchEmployees();

          if (payload.eventType === "INSERT") {
            setToast({
              type: "info",
              message: "New employee added by another user",
            });
          } else if (payload.eventType === "UPDATE") {
            setToast({
              type: "info",
              message: "Employee data updated",
            });
          } else if (payload.eventType === "DELETE") {
            setToast({
              type: "info",
              message: "Employee removed",
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEmployees]);

  // Add employee
  const handleAddEmployee = useCallback(
    async (employeeData) => {
      setActionLoading(true);

      const { data, error } = await employeeService.create(employeeData);

      if (error) {
        setToast({
          type: "error",
          message: error.message || "Failed to add employee. Please try again.",
        });
      } else {
        setToast({
          type: "success",
          message: `${data?.name || employeeData.name} has been added successfully!`,
        });
        setShowAddModal(false);
        fetchEmployees();
      }

      setActionLoading(false);
    },
    [fetchEmployees],
  );

  // Edit employee
  const handleEditEmployee = useCallback(
    async (id, updates) => {
      setActionLoading(true);

      const { data, error } = await employeeService.update(id, updates);

      if (error) {
        setToast({
          type: "error",
          message:
            error.message || "Failed to update employee. Please try again.",
        });
      } else {
        setToast({
          type: "success",
          message: `${data?.name || "Employee"} has been updated successfully!`,
        });
        setShowEditModal(false);
        setSelectedEmployee(null);
        fetchEmployees();
      }

      setActionLoading(false);
    },
    [fetchEmployees],
  );

  // Delete employee
  const handleDeleteEmployee = useCallback(async () => {
    if (!selectedEmployee) return;

    setActionLoading(true);

    const { error } = await employeeService.delete(selectedEmployee.id);

    if (error) {
      setToast({
        type: "error",
        message:
          error.message || "Failed to delete employee. Please try again.",
      });
    } else {
      setToast({
        type: "success",
        message: `${selectedEmployee.name} has been removed from the system.`,
      });
      setShowDeleteModal(false);
      setSelectedEmployee(null);
      fetchEmployees();
    }

    setActionLoading(false);
  }, [selectedEmployee, fetchEmployees]);

  const openEditModal = useCallback((employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  }, []);

  const openDeleteModal = useCallback((employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  }, []);

  // Handle employee selection
  const handleToggleSelect = useCallback((employeeId) => {
    setSelectedEmployeeIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = new Set(employees.map((emp) => emp.id));
    setSelectedEmployeeIds(allIds);
  }, [employees]);

  const handleClearSelection = useCallback(() => {
    setSelectedEmployeeIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(() => {
    setShowBulkDeleteModal(true);
  }, []);

  const confirmBulkDelete = useCallback(async () => {
    setActionLoading(true);

    const selectedEmployees = employees.filter((emp) =>
      selectedEmployeeIds.has(emp.id),
    );

    const deletePromises = selectedEmployees.map((emp) =>
      employeeService.delete(emp.id),
    );

    try {
      await Promise.all(deletePromises);
      setToast({
        type: "success",
        message: `Successfully deleted ${selectedEmployeeIds.size} employee(s)`,
      });
      setSelectedEmployeeIds(new Set());
      setShowBulkDeleteModal(false);
      fetchEmployees();
    } catch {
      setToast({
        type: "error",
        message: "Failed to delete some employees",
      });
    }

    setActionLoading(false);
  }, [selectedEmployeeIds, employees, fetchEmployees]);

  const handleBulkStatusChange = useCallback(
    async (newStatus) => {
      setActionLoading(true);

      const selectedEmployees = employees.filter((emp) =>
        selectedEmployeeIds.has(emp.id),
      );

      const updatePromises = selectedEmployees.map((emp) =>
        employeeService.update(emp.id, { status: newStatus }),
      );

      try {
        await Promise.all(updatePromises);
        setToast({
          type: "success",
          message: `Successfully updated ${selectedEmployeeIds.size} employee(s) to ${newStatus}`,
        });
        setSelectedEmployeeIds(new Set());
        fetchEmployees();
      } catch {
        setToast({
          type: "error",
          message: "Failed to update some employees",
        });
      }

      setActionLoading(false);
    },
    [selectedEmployeeIds, employees, fetchEmployees],
  );

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setSelectedEmployeeIds(new Set());
  }, []);

  const handleSortChange = useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  // CSV export uses current page data
  const handleExportCSV = useCallback(() => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Department",
      "Status",
      "Join Date",
    ];
    const csvContent = [
      headers.join(","),
      ...employees.map((emp) =>
        [
          emp.id,
          `"${emp.name}"`,
          emp.email,
          emp.role,
          emp.department,
          emp.status,
          emp.join_date,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [employees]);

  if (isLoading) {
    return <EmployeeListSkeleton />;
  }

  return (
    <div className="employees-container">
      {/* Header Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-main flex items-center gap-2">
            <Users size={28} className="text-primary" />
            Employees
          </h1>
          <p className="text-muted text-sm">Manage your team members</p>
        </div>
        {/* View Mode Toggle */}
        <div className="employees-view-toggle">
          <button
            type="button"
            className={`employees-view-btn ${viewMode === "cards" ? "active" : ""}`}
            onClick={() => setViewMode("cards")}
            title="Card View"
          >
            <LayoutGrid size={16} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={`employees-view-btn ${viewMode === "byRole" ? "active" : ""}`}
            onClick={() => setViewMode("byRole")}
            title="View by Role"
          >
            <List size={16} />
            <span>By Role</span>
          </button>
        </div>
      </div>

      {/* By Role View */}
      {viewMode === "byRole" && <EmployeesByRole />}

      {/* Card View */}
      {viewMode === "cards" && (
        <>
          {/* Bulk Action Toolbar */}
          {isAdmin && (
            <BulkActionToolbar
              selectedCount={selectedEmployeeIds.size}
              onClearSelection={handleClearSelection}
              onBulkDelete={handleBulkDelete}
              onBulkStatusChange={handleBulkStatusChange}
            />
          )}

          <div className="employees-header">
            <div className="employees-search-wrapper">
              <Search className="employees-search-icon" size={20} />
              <input
                type="text"
                placeholder="Search employees by name, role, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="employees-search-input"
              />
              {searchTerm && (
                <button
                  className="employees-search-clear"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleExportCSV}
                title="Export to CSV"
              >
                <Download size={18} />
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => fetchEmployees()}
                disabled={isRefreshing}
                title="Refresh employee list"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <UserPlus size={18} />
                  <span>Add Employee</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="employees-controls">
            <FilterPanel
              employees={allEmployees}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <SortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Results Count & Select All */}
          {totalCount > 0 && (
            <div className="employees-results">
              <p>
                Showing <strong>{employees.length}</strong> of{" "}
                <strong>{totalCount}</strong> employees
                {isRefreshing && (
                  <span style={{ marginLeft: 8, opacity: 0.6, fontSize: "0.75rem" }}>
                    updating…
                  </span>
                )}
              </p>
              {employees.length > 0 && isAdmin && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleSelectAll}
                >
                  {selectedEmployeeIds.size === employees.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              )}
            </div>
          )}

          {employees.length > 0 ? (
            <>
              <VirtualizedEmployeeGrid
                employees={employees}
                selectedEmployeeIds={selectedEmployeeIds}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onToggleSelect={handleToggleSelect}
                isAdmin={isAdmin}
              />

              {/* Server-side Pagination */}
              <Pagination
                currentPage={page}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          ) : (
            <div className="card employees-empty">
              <Users size={64} className="employees-empty-icon" />
              <h3 className="employees-empty-title">No employees found</h3>
              <p className="employees-empty-description">
                {searchTerm || filters.department || filters.role || filters.status
                  ? `No employees match your search and filter criteria. Try adjusting your filters.`
                  : "No employees in the system yet. Add your first employee to get started."}
              </p>
            </div>
          )}

          {/* Add Employee Modal */}
          <Suspense fallback={null}>
            <AddEmployeeModal
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSubmit={handleAddEmployee}
              isLoading={actionLoading}
            />
          </Suspense>

          {/* Edit Employee Modal */}
          <Suspense fallback={null}>
            <EditEmployeeModal
              isOpen={showEditModal}
              employee={selectedEmployee}
              onClose={() => {
                setShowEditModal(false);
                setSelectedEmployee(null);
              }}
              onSubmit={handleEditEmployee}
              isLoading={actionLoading}
            />
          </Suspense>

          {/* Delete Confirmation Modal */}
          <Suspense fallback={null}>
            <ConfirmModal
              isOpen={showDeleteModal}
              title="Delete Employee"
              message={`Are you sure you want to delete ${selectedEmployee?.name}? This action cannot be undone.`}
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={handleDeleteEmployee}
              onCancel={() => {
                setShowDeleteModal(false);
                setSelectedEmployee(null);
              }}
              isLoading={actionLoading}
              type="danger"
            />
          </Suspense>

          {/* Bulk Delete Confirmation Modal */}
          <Suspense fallback={null}>
            <ConfirmModal
              isOpen={showBulkDeleteModal}
              title="Delete Multiple Employees"
              message={`Are you sure you want to delete ${selectedEmployeeIds.size} employee(s)? This action cannot be undone.`}
              confirmText="Delete All"
              cancelText="Cancel"
              onConfirm={confirmBulkDelete}
              onCancel={() => setShowBulkDeleteModal(false)}
              isLoading={actionLoading}
              type="danger"
            />
          </Suspense>

          {/* Toast Notifications */}
          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </>
      )}
      </div>
  );
};

/**
 * VirtualizedEmployeeGrid — renders employee cards with virtual scrolling
 * for large datasets (>50). For small lists, renders normally.
 */
const VIRTUAL_THRESHOLD = 50;
const ROW_HEIGHT = 260;
const COLUMNS = 3;

const VirtualizedEmployeeGrid = React.memo(
  ({ employees, selectedEmployeeIds, onEdit, onDelete, onToggleSelect, isAdmin }) => {
    const parentRef = useRef(null);
    const useVirtual = employees.length > VIRTUAL_THRESHOLD;

    const rows = useMemo(() => {
      if (!useVirtual) return [];
      const result = [];
      for (let i = 0; i < employees.length; i += COLUMNS) {
        result.push(employees.slice(i, i + COLUMNS));
      }
      return result;
    }, [employees, useVirtual]);

    const virtualizer = useVirtualizer({
      count: useVirtual ? rows.length : 0,
      getScrollElement: () => parentRef.current,
      estimateSize: () => ROW_HEIGHT,
      overscan: 3,
    });

    if (!useVirtual) {
      return (
        <div className="employees-grid">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={onEdit}
              onDelete={onDelete}
              isSelected={selectedEmployeeIds.has(employee.id)}
              onToggleSelect={onToggleSelect}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={parentRef}
        className="employees-virtual-scroll"
        style={{
          height: "calc(100vh - 340px)",
          overflow: "auto",
          contain: "strict",
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              className="employees-grid"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rows[virtualRow.index].map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isSelected={selectedEmployeeIds.has(employee.id)}
                  onToggleSelect={onToggleSelect}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
VirtualizedEmployeeGrid.displayName = "VirtualizedEmployeeGrid";

export default React.memo(EmployeeList);
