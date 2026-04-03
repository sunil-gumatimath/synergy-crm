import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Skeleton } from '../components/common/Skeleton';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.email) {
                setLoading(false);
                return;
            }

            try {
                const { data, error: _error } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('email', user.email)
                    .single();

                if (data) {
                    navigate(`/employees/${data.id}`, { replace: true });
                } else {
                    setLoading(false);
                }
            } catch (_err) {
                console.error('Error fetching profile:', _err);
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, navigate]);

    if (loading) {
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
};

export default ProfilePage;
