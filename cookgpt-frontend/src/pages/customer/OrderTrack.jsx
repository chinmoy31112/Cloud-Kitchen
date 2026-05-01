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

  if (loading && !order) return <BaseLayout fullScreen={true}><div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}><p>Locating your order...</p></div></BaseLayout>;

  if (!order) return (
    <BaseLayout fullScreen={true}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div>
          <h2>Order Not Found</h2>
          <Link to="/orders" className="btn" style={{marginTop:'1.5rem'}}>Back to Orders</Link>
        </div>
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
        <BaseLayout fullScreen={true}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
            <div className="card glass-panel" style={{ padding: '4rem', border: '1px solid #ef4444', maxWidth: '600px' }}>
                <h2 style={{color: '#ef4444', marginBottom: '1.5rem', fontSize: '2.5rem'}}>Order Cancelled</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>We are sorry to inform you that order #{order.id} was cancelled.</p>
                <Link to="/menu" className="btn" style={{marginTop:'2.5rem'}}>Browse Menu</Link>
            </div>
          </div>
        </BaseLayout>
      );
  }

  // Cap at 0 if not found
  if (currentIndex < 0) currentIndex = 0;

  return (
    <BaseLayout fullScreen={true}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '2rem' }}>Track Order #{order.id}</h2>
                <Link to="/orders" style={{color: 'var(--text-secondary)', textDecoration: 'underline', fontSize: '0.9rem'}}>Back to List</Link>
            </div>

            <div className="card glass-panel" style={{ padding: '4rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Progress Bar Container */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '4rem' }}>
                
                {/* The literal Line */}
                <div style={{ position: 'absolute', top: '18px', left: '10%', right: '10%', height: '4px', background: 'var(--border-color)', zIndex: 0 }}></div>
                <div style={{ 
                    position: 'absolute', top: '18px', left: '10%', height: '4px', background: 'var(--primary-color)', zIndex: 1, 
                    width: `${(currentIndex / (steps.length - 1)) * 80}%`, transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}></div>

                {/* The Dots */}
                {steps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isActive = index === currentIndex;
                return (
                    <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '120px' }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        background: isCompleted ? 'var(--primary-color)' : 'white', 
                        border: `4px solid ${isCompleted ? 'var(--primary-color)' : 'var(--border-color)'}`,
                        marginBottom: '1rem', transition: 'all 0.6s ease',
                        boxShadow: isActive ? '0 0 0 8px rgba(184, 144, 91, 0.15)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isCompleted ? 'white' : 'var(--text-secondary)',
                        fontSize: '1rem'
                    }}>
                        {isCompleted && index < currentIndex ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: isActive ? '700' : '400', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {step.label}
                    </span>
                    </div>
                );
                })}
            </div>

            <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(184, 144, 91, 0.05)', borderRadius: '16px', border: '1px solid var(--primary-color)' }}>
                <h3 style={{color: 'var(--text-primary)', fontSize: '1.6rem', marginBottom: '0.5rem', letterSpacing: '-0.5px'}}>
                    {steps[currentIndex].label.toUpperCase()}
                </h3>
                {order.estimated_delivery_time && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        ETA: {new Date(order.estimated_delivery_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                )}
            </div>
            </div>

            {/* Delivery Details */}
            {delivery && delivery.agent_name && (
                <div className="card glass-panel" style={{ padding: '2rem 3rem', marginBottom: '3rem', display: 'flex', gap: '2.5rem', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
                        🤵
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Your Sommelier Partner</p>
                                <h3 style={{margin: 0, fontSize: '1.8rem'}}>{delivery.agent_name}</h3>
                            </div>
                            <a href={`tel:${delivery.agent_phone}`} className="btn glass-panel" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.8rem 1.5rem', fontSize: '0.9rem', textTransform: 'none' }}>
                                Contact Agent
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default OrderTrack;
