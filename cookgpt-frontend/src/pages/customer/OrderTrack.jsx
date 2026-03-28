import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';
import apiClient from '../../api/apiClient';

const OrderTrack = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTracking = async () => {
    try {
      const ordRes = await apiClient.get(`orders/${id}/`);
      setOrder(ordRes.data.data);
      
      try {
          const trkRes = await apiClient.get(`delivery/track/${id}/`);
          setDelivery(trkRes.data.data);
      } catch(err) {
          // It's possible the delivery hasn't been assigned yet (404)
          console.warn("Delivery not assigned yet", err.message);
      }
      
    } catch (err) {
      console.error("Tracking Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    // Poll every 15 seconds for live status
    const interval = setInterval(() => {
        fetchTracking();
    }, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !order) return <BaseLayout><p style={{textAlign: 'center', marginTop: '5rem'}}>Locating your order...</p></BaseLayout>;

  if (!order) return (
    <BaseLayout>
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2>Order Not Found</h2>
        <Link to="/orders" className="btn" style={{marginTop:'1rem'}}>Back to Orders</Link>
      </div>
    </BaseLayout>
  );

  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing Food' },
    { key: 'ready', label: 'Ready for Pickup' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  // Map backend status to index
  let currentIndex = steps.findIndex(s => s.key === order.status);
  if (currentIndex === -1 && order.status === 'cancelled') {
      return (
        <BaseLayout>
          <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center' }}>
            <h2 style={{color: '#ef4444', marginBottom: '1rem'}}>Order Cancelled</h2>
            <p>We are sorry to inform you that order #{order.id} was cancelled.</p>
            <Link to="/menu" className="btn" style={{marginTop:'2rem'}}>Browse Menu</Link>
          </div>
        </BaseLayout>
      );
  }

  // Cap at 0 if not found
  if (currentIndex < 0) currentIndex = 0;

  return (
    <BaseLayout>
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--primary-color)' }}>Track Order #{order.id}</h2>
            <Link to="/orders" style={{color: 'var(--text-secondary)'}}>Back to Orders</Link>
        </div>

        <div className="card glass-panel" style={{ padding: '3rem', marginBottom: '2rem' }}>
          
          {/* Progress Bar Container */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '3rem' }}>
            
            {/* The literal Line */}
            <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '4px', background: 'var(--border-color)', zIndex: 0 }}></div>
            <div style={{ 
                position: 'absolute', top: '15px', left: '10%', height: '4px', background: 'var(--primary-color)', zIndex: 1, 
                width: `${(currentIndex / (steps.length - 1)) * 80}%`, transition: 'width 1s ease' 
            }}></div>

            {/* The Dots */}
            {steps.map((step, index) => {
              const isCompleted = index <= currentIndex;
              const isActive = index === currentIndex;
              return (
                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '100px' }}>
                  <div style={{ 
                      width: '34px', height: '34px', borderRadius: '50%', 
                      background: isCompleted ? 'var(--primary-color)' : 'var(--bg-color)', 
                      border: `3px solid ${isCompleted ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      marginBottom: '0.8rem', transition: 'all 0.5s ease',
                      boxShadow: isActive ? '0 0 0 5px rgba(255, 87, 34, 0.2)' : 'none'
                  }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center' }}>
                      {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{color: 'var(--text-primary)'}}>
                  Status: {order.status.replace('_', ' ').toUpperCase()}
              </h3>
              {order.estimated_delivery_time && (
                  <p style={{marginTop: '0.5rem', color: 'var(--text-secondary)'}}>
                      Expected Delivery: {new Date(order.estimated_delivery_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
              )}
          </div>
        </div>

        {/* Delivery Details */}
        {delivery && delivery.agent_name && (
            <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    🚴
                </div>
                <div>
                    <h3 style={{marginBottom: '0.2rem'}}>{delivery.agent_name}</h3>
                    <p style={{color: 'var(--text-secondary)'}}>Your Delivery Partner</p>
                    <p style={{fontWeight: 'bold', marginTop: '0.5rem'}}>📞 {delivery.agent_phone}</p>
                </div>
            </div>
        )}

      </div>
    </BaseLayout>
  );
};

export default OrderTrack;
