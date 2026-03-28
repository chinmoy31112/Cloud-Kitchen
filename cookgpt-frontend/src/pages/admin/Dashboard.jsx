import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import apiClient from '../../api/apiClient';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('dashboard/stats/');
                setStats(res.data.data);
            } catch (err) {
                if (err.response?.status === 403) {
                    setError("Access Denied: You do not have Kitchen Admin privileges.");
                } else {
                    setError("Failed to load dashboard metrics.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <AdminLayout><p>Loading analytics engine...</p></AdminLayout>;
    
    if (error) return (
        <AdminLayout>
            <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center', borderColor: '#fee2e2' }}>
                <h2 style={{color: '#ef4444', marginBottom: '1rem'}}>⛔ Access Forbidden</h2>
                <p>{error}</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <h2 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>Business Overview</h2>
            
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    
                    <div className="card glass-panel" style={{ padding: '2rem' }}>
                        <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Total Revenue</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
                            ₹{stats.total_revenue || '0.00'}
                        </div>
                    </div>

                    <div className="card glass-panel" style={{ padding: '2rem' }}>
                        <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Total Orders</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {stats.total_orders || 0}
                        </div>
                    </div>

                    <div className="card glass-panel" style={{ padding: '2rem' }}>
                        <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Active Pending Orders</h4>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                            {stats.pending_orders || 0}
                        </div>
                    </div>

                </div>
            )}

            <h3 style={{ marginBottom: '1.5rem' }}>Popular Ingredients (AI Analysis)</h3>
            <div className="card glass-panel" style={{ padding: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Connect the AI recommendation service to populate this chart.</p>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
