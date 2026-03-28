import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';
import apiClient from '../../api/apiClient';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get('orders/my-orders/');
        setOrders(res.data.data);
      } catch (err) {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <BaseLayout><p style={{textAlign: 'center', marginTop: '5rem'}}>Loading order history...</p></BaseLayout>;

  return (
    <BaseLayout>
      <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>My Orders</h2>
        
        {orders.length === 0 ? (
          <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h3>You haven't placed any orders yet.</h3>
            <Link to="/menu" className="btn" style={{ marginTop: '1rem' }}>Order Some Food</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => (
              <div key={order.id} className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                    <span style={{ 
                        background: order.status === 'delivered' ? '#10b981' : (order.status === 'cancelled' ? '#ef4444' : '#f59e0b'), 
                        color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'capitalize' 
                    }}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Placed on: {new Date(order.created_at).toLocaleString()}
                  </div>
                  <b style={{ color: 'var(--text-primary)' }}>Total: ₹{parseFloat(order.total_amount).toFixed(2)}</b>
                </div>
                
                <div>
                  <Link to={`/orders/${order.id}/track`} className="btn" style={{ background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default Orders;
