import React, { useState, useEffect } from 'react';
import DeliveryLayout from '../../components/layouts/DeliveryLayout';
import apiClient from '../../api/apiClient';

const DeliveryDashboard = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(false);

    const fetchDeliveries = async () => {
        try {
            const res = await apiClient.get('delivery/my-deliveries/');
            // Assuming responses are nested correctly like the other views
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            // Filter to only show active ones. Backend structure assumes a 'status' field.
            setDeliveries(data.filter(d => d.status !== 'delivered' && d.status !== 'cancelled'));
            setError(null);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("Access Denied: You must be an authorized Delivery Rider.");
            } else {
                setError("Failed to fetch assigned deliveries.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
        const poll = setInterval(fetchDeliveries, 15000);
        return () => clearInterval(poll);
    }, []);

    // 1. Mock GPS Update
    const performGPSUpdate = async (id) => {
        setGpsLoading(true);
        try {
            // In a real app we'd use navigator.geolocation
            // Since this is a stationary test, mock moving coordinates visually
            const mockLat = (19.0760 + (Math.random() * 0.01)).toFixed(6);
            const mockLng = (72.8777 + (Math.random() * 0.01)).toFixed(6);

            await apiClient.patch(`delivery/${id}/location/`, {
                latitude: parseFloat(mockLat),
                longitude: parseFloat(mockLng)
            });
            alert(`📍 Location Synced: ${mockLat}, ${mockLng}`);
        } catch (err) {
            alert("Failed to sync GPS. Check network.");
        } finally {
            setGpsLoading(false);
        }
    };

    // 2. Mark Delivered
    const markAsDelivered = async (id) => {
        if (!window.confirm("Confirm drop-off completion?")) return;
        
        try {
            await apiClient.patch(`delivery/${id}/status/`, {
                status: 'delivered'
            });
            alert("✅ Order successfully delivered! Great job!");
            // Refresh to pop it off the active list
            fetchDeliveries();
        } catch (err) {
            alert("Error confirming delivery. Contact dispatch.");
        }
    };

    if (loading && deliveries.length === 0) return <DeliveryLayout><div style={{textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)'}}>Scanning for assigned blocks...</div></DeliveryLayout>;
    
    if (error && deliveries.length === 0) return (
        <DeliveryLayout>
            <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid #fee2e2' }}>
                <h3 style={{color: '#ef4444'}}>🛑 {error}</h3>
            </div>
        </DeliveryLayout>
    );

    return (
        <DeliveryLayout>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                My Drop-Offs
                <button onClick={fetchDeliveries} style={{ background: 'transparent', color: 'var(--primary-color)', border: 'none', padding: 0, boxShadow: 'none' }}>
                    🔄 Refresh
                </button>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {deliveries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
                        <h3>No Active Deliveries</h3>
                        <p>You are waiting for the kitchen to dispatch new orders to you.</p>
                    </div>
                ) : (
                    deliveries.map(job => (
                        <div key={job.id} className="card glass-panel" style={{ overflow: 'hidden' }}>
                            {/* Card Header */}
                            <div style={{ background: '#fff3e0', padding: '1rem', borderBottom: '1px solid #ffd8a8', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold', display: 'block' }}>Order #{job.order_id || job.order?.id || 'N/A'}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>Status: {job.status.replace('_', ' ')}</span>
                                </div>
                            </div>
                            
                            {/* Middle Detailed Chunk */}
                            <div style={{ padding: '1.5rem 1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '2rem' }}>📍</span>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.3rem 0' }}>Drop-off Location</h4>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                            {job.delivery_address || (job.order?.delivery_address?.street ? `${job.order.delivery_address.street}, ${job.order.delivery_address.city}` : 'Address protected by customer privacy.') }
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        onClick={() => performGPSUpdate(job.id)} 
                                        disabled={gpsLoading}
                                        style={{ flex: 1, padding: '0.8rem', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                                    >
                                        {gpsLoading ? 'Syncing...' : '📡 Sync GPS Now'}
                                    </button>
                                </div>
                            </div>

                            {/* Massive Delivery Action Button */}
                            <button 
                                onClick={() => markAsDelivered(job.id)}
                                style={{ width: '100%', padding: '1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '0', fontSize: '1.2rem', fontWeight: 'bold' }}
                            >
                                ✅ Swipe to Mark Delivered
                            </button>
                        </div>
                    ))
                )}
            </div>
        </DeliveryLayout>
    );
};

export default DeliveryDashboard;
