import { supabase } from '../lib/supabase.js';

/**
 * Reports Service - Aggregates data for various report types
 */

// Get attendance report data
export const getAttendanceReport = async (startDate, endDate, departmentFilter = null) => {
    try {
        let query = supabase
            .from('time_entries')
            .select(`
        *,
        employee:employees (
          id,
          name,
          email,
          department
        )
      `)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        // Filter by department if specified
        let filteredData = data || [];
        if (departmentFilter && departmentFilter !== 'all') {
            filteredData = filteredData.filter(entry =>
                entry.employee?.department === departmentFilter
            );
        }

        // Aggregate by employee
        const employeeMap = new Map();

        filteredData.forEach(entry => {
            const empId = entry.employee_id;
            if (!employeeMap.has(empId)) {
                employeeMap.set(empId, {
                    employee: entry.employee,
                    totalDays: 0,
                    totalHours: 0,
                    presentDays: 0,
                    lateDays: 0,
                    overtimeHours: 0,
                    entries: []
                });
            }

            const emp = employeeMap.get(empId);
            emp.entries.push(entry);
            emp.totalDays++;
            emp.totalHours += entry.total_hours || 0;

            // Consider late if clocked in after 9:30 AM
            if (entry.clock_in) {
                const clockInTime = new Date(`2000-01-01T${entry.clock_in}`);
                const lateThreshold = new Date(`2000-01-01T09:30:00`);
                if (clockInTime > lateThreshold) {
                    emp.lateDays++;
                }
            }

            // Calculate overtime (hours over 8)
            if (entry.total_hours > 8) {
                emp.overtimeHours += entry.total_hours - 8;
            }

            emp.presentDays++;
        });

        return {
            success: true,
            data: Array.from(employeeMap.values()),
            summary: {
                totalEmployees: employeeMap.size,
                totalEntries: filteredData.length,
                avgHoursPerDay: filteredData.length > 0
                    ? (filteredData.reduce((sum, e) => sum + (e.total_hours || 0), 0) / filteredData.length).toFixed(1)
                    : 0
            }
        };
    } catch (error) {
        console.error('Error fetching attendance report:', error);
        return { success: false, error: error.message };
    }
};

// Get leave report data
export const getLeaveReport = async (startDate, endDate, departmentFilter = null) => {
    try {
        let query = supabase
            .from('leave_requests')
            .select(`
        *,
        employee:employees (
          id,
          name,
          email,
          department
        ),
        leave_type:leave_types (
          id,
          name,
          color
        )
      `)
            .gte('start_date', startDate)
            .lte('end_date', endDate)
            .order('start_date', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        let filteredData = data || [];
        if (departmentFilter && departmentFilter !== 'all') {
            filteredData = filteredData.filter(entry =>
                entry.employee?.department === departmentFilter
            );
        }

        // Aggregate by leave type
        const leaveTypeMap = new Map();
        const statusCounts = { approved: 0, pending: 0, rejected: 0 };

        filteredData.forEach(entry => {
            const typeName = entry.leave_type?.name || 'Unknown';
            if (!leaveTypeMap.has(typeName)) {
                leaveTypeMap.set(typeName, {
                    type: typeName,
                    color: entry.leave_type?.color || '#6b7280',
                    count: 0,
                    totalDays: 0
                });
            }

            const type = leaveTypeMap.get(typeName);
            type.count++;
            type.totalDays += entry.total_days || 1;

            // Count by status
            if (entry.status) {
                statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
            }
        });

        return {
            success: true,
            data: filteredData,
            byType: Array.from(leaveTypeMap.values()),
            summary: {
                totalRequests: filteredData.length,
                ...statusCounts,
                totalDays: filteredData.reduce((sum, e) => sum + (e.total_days || 1), 0)
            }
        };
    } catch (error) {
        console.error('Error fetching leave report:', error);
        return { success: false, error: error.message };
    }
};

// Get task report data
export const getTaskReport = async (startDate, endDate, departmentFilter = null) => {
    try {
        let query = supabase
            .from('tasks')
            .select(`
        *,
        assignee:employees (
          id,
          name,
          email,
          department
        )
      `)
            .gte('created_at', startDate)
            .lte('created_at', endDate + 'T23:59:59')
            .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        let filteredData = data || [];
        if (departmentFilter && departmentFilter !== 'all') {
            filteredData = filteredData.filter(entry =>
                entry.assignee?.department === departmentFilter
            );
        }

        // Aggregate by status
        const statusCounts = {
            'To Do': 0,
            'In Progress': 0,
            'Review': 0,
            'Done': 0
        };

        // Aggregate by priority
        const priorityCounts = {
            'Low': 0,
            'Medium': 0,
            'High': 0,
            'Urgent': 0
        };

        filteredData.forEach(task => {
            if (task.status && Object.hasOwn(statusCounts, task.status)) {
                statusCounts[task.status]++;
            }
            if (task.priority && Object.hasOwn(priorityCounts, task.priority)) {
                priorityCounts[task.priority]++;
            }
        });

        const completedTasks = statusCounts['Done'];
        const totalTasks = filteredData.length;
        const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

        return {
            success: true,
            data: filteredData,
            byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
            byPriority: Object.entries(priorityCounts).map(([priority, count]) => ({ priority, count })),
            summary: {
                totalTasks,
                completedTasks,
                completionRate,
                inProgress: statusCounts['In Progress'],
                pending: statusCounts['To Do']
            }
        };
    } catch (error) {
        console.error('Error fetching task report:', error);
        return { success: false, error: error.message };
    }
};

// Get time tracking report data
export const getTimeTrackingReport = async (startDate, endDate, departmentFilter = null) => {
    try {
        let query = supabase
            .from('time_entries')
            .select(`
        *,
        employee:employees (
          id,
          name,
          email,
          department
        )
      `)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        let filteredData = data || [];
        if (departmentFilter && departmentFilter !== 'all') {
            filteredData = filteredData.filter(entry =>
                entry.employee?.department === departmentFilter
            );
        }

        // Aggregate by department
        const deptMap = new Map();

        filteredData.forEach(entry => {
            const dept = entry.employee?.department || 'Unknown';
            if (!deptMap.has(dept)) {
                deptMap.set(dept, {
                    department: dept,
                    totalHours: 0,
                    employees: new Set(),
                    entries: 0
                });
            }

            const d = deptMap.get(dept);
            d.totalHours += entry.total_hours || 0;
            d.employees.add(entry.employee_id);
            d.entries++;
        });

        const byDepartment = Array.from(deptMap.values()).map(d => ({
            ...d,
            employeeCount: d.employees.size,
            avgHoursPerEmployee: d.employees.size > 0 ? (d.totalHours / d.employees.size).toFixed(1) : 0
        }));

        const totalHours = filteredData.reduce((sum, e) => sum + (e.total_hours || 0), 0);
        const uniqueEmployees = new Set(filteredData.map(e => e.employee_id)).size;

        return {
            success: true,
            data: filteredData,
            byDepartment,
            summary: {
                totalHours: totalHours.toFixed(1),
                totalEntries: filteredData.length,
                uniqueEmployees,
                avgHoursPerDay: filteredData.length > 0 ? (totalHours / filteredData.length).toFixed(1) : 0
            }
        };
    } catch (error) {
        console.error('Error fetching time tracking report:', error);
        return { success: false, error: error.message };
    }
};

// Get employee summary report
export const getEmployeeSummaryReport = async () => {
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('department');

        if (error) throw error;

        // Aggregate by department
        const deptMap = new Map();
        const statusCounts = { active: 0, 'on-leave': 0, inactive: 0 };

        (data || []).forEach(emp => {
            const dept = emp.department || 'Unknown';
            if (!deptMap.has(dept)) {
                deptMap.set(dept, {
                    department: dept,
                    count: 0,
                    totalSalary: 0,
                    avgPerformance: 0,
                    performanceSum: 0
                });
            }

            const d = deptMap.get(dept);
            d.count++;
            d.totalSalary += emp.salary || 0;
            d.performanceSum += emp.performance_score || 0;

            if (emp.status) {
                statusCounts[emp.status] = (statusCounts[emp.status] || 0) + 1;
            }
        });

        const byDepartment = Array.from(deptMap.values()).map(d => ({
            ...d,
            avgSalary: d.count > 0 ? (d.totalSalary / d.count).toFixed(0) : 0,
            avgPerformance: d.count > 0 ? (d.performanceSum / d.count).toFixed(1) : 0
        }));

        return {
            success: true,
            data: data || [],
            byDepartment,
            summary: {
                totalEmployees: data?.length || 0,
                ...statusCounts,
                departments: deptMap.size
            }
        };
    } catch (error) {
        console.error('Error fetching employee summary report:', error);
        return { success: false, error: error.message };
    }
};

// Get all departments
export const getDepartments = async () => {
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('department')
            .not('department', 'is', null);

        if (error) throw error;

        const departments = [...new Set(data?.map(e => e.department) || [])];
        return { success: true, data: departments };
    } catch (error) {
        console.error('Error fetching departments:', error);
        return { success: false, error: error.message };
    }
};

// Export data to CSV
export const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Convert data to CSV format
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                let cell = row[header];
                // Handle nested objects
                if (typeof cell === 'object' && cell !== null) {
                    cell = JSON.stringify(cell);
                }
                // Escape commas and quotes
                if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                    cell = `"${cell.replace(/"/g, '""')}"`;
                }
                return cell ?? '';
            }).join(',')
        )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Print report
export const printReport = (elementId) => {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
    <html>
      <head>
        <title>Synergy EMS - Report</title>
        <style>
          body { 
            font-family: 'Inter', system-ui, sans-serif; 
            padding: 20px;
            color: #111827;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            text-align: left;
          }
          th { 
            background: #f3f4f6; 
            font-weight: 600;
          }
          .report-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .report-header h1 {
            color: #4f46e5;
            margin-bottom: 5px;
          }
          .summary-card {
            display: inline-block;
            padding: 15px 25px;
            margin: 10px;
            background: #f3f4f6;
            border-radius: 8px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>Synergy EMS</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        ${printContent.innerHTML}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.print();
};
