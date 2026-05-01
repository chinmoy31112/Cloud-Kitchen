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

  if (loading) return <BaseLayout fullScreen={true}><div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}><p>Loading order history...</p></div></BaseLayout>;

  return (
    <BaseLayout fullScreen={true}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '2.5rem', color: 'var(--text-primary)', fontSize: '2.2rem', textAlign: 'center' }}>My Order History</h2>
          
          {orders.length === 0 ? (
            <div className="card glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.8)' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>You haven't placed any orders yet.</h3>
              <Link to="/menu" className="btn">Order Some Food</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
              {orders.map(order => (
                <div key={order.id} className="card glass-panel" style={{ 
                  padding: '1.8rem 2rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '0.8rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Order #{order.id}</h3>
                      <span style={{ 
                          background: order.status === 'delivered' ? '#10b981' : (order.status === 'cancelled' ? '#ef4444' : '#f59e0b'), 
                          color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px'
                      }}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.6rem' }}>
                      Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                      Total: ₹{parseFloat(order.total_amount).toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <Link to={`/orders/${order.id}/track`} className="btn glass-panel" style={{ 
                      background: 'transparent', 
                      color: 'var(--text-primary)', 
                      border: '1px solid var(--border-color)',
                      padding: '0.8rem 2rem',
                      fontSize: '0.85rem'
                    }}>
                      Track Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Orders;
