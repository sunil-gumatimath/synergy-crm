import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Skeleton } from '../components/common/Skeleton';
import EmployeeDetailPage from './EmployeeDetailPage';

const ProfilePage = () => {
    const { user } = useAuth();

    // Resolve the current user's own employee record by email and render the
    // detail view as a self-page. Employees have no admin access to
    // /employees/:id, so this is their profile entry point. RLS still
    // restricts private fields to self/admin.
    const { data: employeeId, isLoading } = useQuery({
        queryKey: ['my-employee-id', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('employees')
                .select('id')
                .eq('email', user.email)
                .single();
            if (error) throw error;
            return data?.id ?? null;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Skeleton width="80px" height="80px" borderRadius="50%" />
                    <Skeleton width="200px" height="20px" />
                    <Skeleton width="160px" height="14px" />
                </div>
            </div>
        );
    }

    if (!employeeId) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
                <p className="text-muted mb-6">
                    We couldn't find an employee record associated with your email ({user?.email}).
                </p>
                <p className="text-sm text-muted">
                    Please contact your administrator to link your account.
                </p>
            </div>
        );
    }

    return <EmployeeDetailPage employeeId={employeeId} />;
};

export default ProfilePage;
