import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import apiClient from '../../api/apiClient';

const KdsOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            // Passing ?status=pending,preparing,ready could filter, 
            // but we fetch all to show the full board
            const res = await apiClient.get('orders/all/');
            // The API returns nested success:true, data:[]
            setOrders(res.data.data.filter(o => o.status !== 'cancelled' && o.status !== 'delivered'));
        } catch (err) {
            if (err.response?.status === 403) {
                setError("Access Denied: You do not have Kitchen Admin privileges.");
            } else {
                console.error("Failed to load KDS");
                setError("Failed to fetch kitchen tickets.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 10 seconds for new tickets
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await apiClient.patch(`orders/${orderId}/status/`, { status: newStatus });
            // Re-fetch to confirm change and propagate everywhere
            fetchOrders();
        } catch (err) {
            alert("Failed to update status. Check permissions.");
        }
    };

    if (loading && orders.length === 0) return <AdminLayout><p>Loading KDS Interface...</p></AdminLayout>;
    
    if (error) return (
        <AdminLayout>
            <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center', borderColor: '#fee2e2' }}>
                <h2 style={{color: '#ef4444', marginBottom: '1rem'}}>⛔ {error}</h2>
            </div>
        </AdminLayout>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ef4444'; // Red - urgent
            case 'accepted': return '#f59e0b'; // Amber
            case 'preparing': return '#3b82f6'; // Blue
            case 'ready': return '#10b981'; // Green
            case 'out_for_delivery': return '#6366f1'; // Indigo
            default: return 'var(--text-secondary)';
        }
    };

    const statusOptions = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery'];

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--primary-color)' }}>Kitchen Display System (KDS)</h2>
                <button onClick={fetchOrders} style={{ padding: '0.4rem 1rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    🔄 Refresh
                </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {orders.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <h3>No Active Tickets 🧑‍🍳</h3>
                        <p>Waiting for orders to drop in...</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="card glass-panel" style={{ 
                            borderTop: `6px solid ${getStatusColor(order.status)}`, 
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0 }}>Ticket #{order.id}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(order.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                
                                <select 
                                    value={order.status} 
                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                    style={{ width: '100%', marginBottom: '1.5rem', background: 'var(--bg-color)', color: 'var(--text-primary)', border: `1px solid ${getStatusColor(order.status)}`, padding: '0.5rem', borderRadius: '4px', textTransform: 'capitalize', fontWeight: 'bold' }}
                                >
                                    {statusOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                                    ))}
                                </select>

                                <div>
                                    <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: '0 0 1rem 0' }}>Order Items:</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {order.items && order.items.map(item => (
                                            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                                                <span><b style={{ color: 'var(--primary-color)' }}>{item.quantity}x</b> {item.menu_item_name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            <div style={{ background: 'var(--bg-color)', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Customer ID: {order.user_id}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
};

export default KdsOrders;
