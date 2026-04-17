import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';
import { getAnalyticsDepartmentStats } from './reportsService';

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
    supabase: {
        rpc: vi.fn(),
    },
}));

describe('reportsService - Analytics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully fetch and map department stats for an Admin/Manager', async () => {
        const mockData = [
            {
                department: 'Engineering',
                headcount: 5,
                avg_performance: 85.5,
                total_payroll: 500000,
            }
        ];

        supabase.rpc.mockResolvedValue({ data: mockData, error: null });

        const result = await getAnalyticsDepartmentStats();

        expect(supabase.rpc).toHaveBeenCalledWith('get_analytics_department_stats');
        expect(result.success).toBe(true);
        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
            department: 'Engineering',
            headcount: 5,
            avgPerformance: 85.5,
            totalPayroll: 500000,
        });
    });

    it('should handle RPC access denied gracefully for regular employees', async () => {
        const mockError = new Error('Access denied. Only Admins and Managers can view department analytics.');
        
        supabase.rpc.mockResolvedValue({ data: null, error: mockError });

        const result = await getAnalyticsDepartmentStats();

        expect(supabase.rpc).toHaveBeenCalledWith('get_analytics_department_stats');
        expect(result.success).toBe(false);
        expect(result.data).toEqual([]);
        expect(result.error).toBe(mockError);
    });

    it('should handle empty data safely', async () => {
        supabase.rpc.mockResolvedValue({ data: null, error: null });

        const result = await getAnalyticsDepartmentStats();

        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
        expect(result.error).toBeNull();
    });
});
