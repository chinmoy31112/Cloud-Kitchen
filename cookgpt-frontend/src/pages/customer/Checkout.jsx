import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';
import apiClient from '../../api/apiClient';

const Checkout = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user's cart and addresses
    const fetchData = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          apiClient.get('cart/'),
          apiClient.get('users/addresses/')
        ]);
        setCart(cartRes.data.data);
        setAddresses(addrRes.data.data);
        
        // Auto-select first address if available
        if (addrRes.data.data.length > 0) {
            setSelectedAddress(addrRes.data.data[0].id);
        }
      } catch (err) {
        console.error("Setup Error", err);
      }
    };
    fetchData();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      setError("Please select a delivery address.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Create the Order
      const orderRes = await apiClient.post('orders/create/', { 
        delivery_address_id: selectedAddress,
        payment_method: paymentMethod // Might be optional based on API spec, but passing anyway
      });

      const orderData = orderRes.data.data;
      
      // 2. Create the Payment
      await apiClient.post('payments/create/', {
        order_id: orderData.id,
        amount: orderData.total_amount,
        method: paymentMethod
      });

      // 3. Mock Payment Delay if online/upi
      if (['online', 'upi'].includes(paymentMethod)) {
        await new Promise(r => setTimeout(r, 2000)); // 2-second mock gateway spin
      }

      // 4. Redirect to tracking
      navigate(`/orders/${orderData.id}/track`);

    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || "Failed to process order. Please try again.");
      setProcessing(false);
    }
  };

  if (!cart) return <BaseLayout fullScreen={true}><div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}><p>Loading secure environment...</p></div></BaseLayout>;
  
  const items = cart.items || [];
  if (items.length === 0) {
      return <BaseLayout fullScreen={true}><div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}><p>Your cart is empty. Please add items to order.</p></div></BaseLayout>;
  }

  const subtotal = items.reduce((acc, curr) => acc + (parseFloat(curr.menu_item_price) * curr.quantity), 0);
  const deliveryFee = 50.00; // Flat mock fee
  const total = subtotal + deliveryFee;

  return (
    <BaseLayout fullScreen={true}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2.5rem', color: 'var(--text-primary)', fontSize: '2rem' }}>Secure Checkout</h2>
            
            {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.9rem' }}>{error}</div>}
            
            {processing ? (
                <div className="card glass-panel" style={{ padding: '5rem', textAlign: 'center', border: '1px solid var(--primary-color)' }}>
                    <div className="loader" style={{ margin: '0 auto 2rem auto', width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(184, 144, 91, 0.1)', borderTop: '3px solid var(--primary-color)', animation: 'spin 1s linear infinite' }}></div>
                    <h3 style={{color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '1rem'}}>Processing Transaction...</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Please do not refresh or close this window.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
                
                {/* Left Column: Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* 1. Address Selection */}
                    <div className="card glass-panel" style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.8)' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem', fontSize: '1.3rem' }}>1. Delivery Destination</h3>
                        {addresses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p style={{color: '#ef4444', marginBottom: '1.5rem'}}>No saved addresses found.</p>
                                <Link to="/profile" className="btn glass-panel" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Add Address in Profile</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {addresses.map(addr => (
                                    <label key={addr.id} style={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start', 
                                        gap: '1.2rem', 
                                        padding: '1.5rem', 
                                        border: `2px solid ${selectedAddress === addr.id ? 'var(--primary-color)' : 'var(--border-color)'}`, 
                                        borderRadius: '16px', 
                                        cursor: 'pointer', 
                                        background: selectedAddress === addr.id ? 'rgba(184, 144, 91, 0.05)' : 'var(--surface-color)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <input 
                                            type="radio" 
                                            name="address" 
                                            value={addr.id} 
                                            checked={selectedAddress === addr.id} 
                                            onChange={() => setSelectedAddress(addr.id)} 
                                            style={{ marginTop: '0.4rem', accentColor: 'var(--primary-color)' }}
                                        />
                                        <div>
                                            <b style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{addr.label}</b>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem', lineHeight: '1.5' }}>
                                                {addr.street}<br/>{addr.city}, {addr.state} {addr.pincode}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Payment Method */}
                    <div className="card glass-panel" style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.8)' }}>
                        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem', fontSize: '1.3rem' }}>2. Payment Choice</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {[
                                { id: 'online', label: 'Premium Credit/Debit Card', icon: '💳' },
                                { id: 'upi', label: 'UPI (GPay / PhonePe / Instant)', icon: '⚡' },
                                { id: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵' }
                            ].map(method => (
                                <label key={method.id} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1.2rem', 
                                    cursor: 'pointer', 
                                    padding: '1.2rem 1.5rem', 
                                    background: paymentMethod === method.id ? 'rgba(184, 144, 91, 0.05)' : 'transparent',
                                    border: `1px solid ${paymentMethod === method.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <input 
                                        type="radio" 
                                        value={method.id} 
                                        checked={paymentMethod === method.id} 
                                        onChange={(e) => setPaymentMethod(e.target.value)} 
                                        style={{ accentColor: 'var(--primary-color)' }}
                                    />
                                    <span style={{ fontSize: '1.2rem' }}>{method.icon}</span>
                                    <span style={{ fontSize: '1rem', fontWeight: paymentMethod === method.id ? '600' : '400' }}>{method.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="card glass-panel" style={{ padding: '2.5rem', position: 'sticky', top: '0', border: '1px solid var(--primary-color)', boxShadow: 'var(--shadow-lg)' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', fontSize: '1.4rem' }}>Order Detail</h3>
                    
                    <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '2rem', paddingRight: '0.8rem' }}>
                        {items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.quantity}x {item.menu_item_name}</span>
                                <span style={{ fontWeight: '500' }}>₹{(parseFloat(item.menu_item_price) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <span>Delivery Fee</span>
                            <span style={{ color: '#10b981', fontWeight: '500' }}>₹{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary-color)' }}>₹{total.toFixed(2)}</span>
                        </div>
                        
                        <button 
                            onClick={handlePlaceOrder} 
                            disabled={!selectedAddress || processing}
                            style={{ 
                                width: '100%', 
                                padding: '1.2rem', 
                                fontSize: '1.1rem', 
                                opacity: (!selectedAddress || processing) ? 0.6 : 1,
                                cursor: (!selectedAddress || processing) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {processing ? 'Finalizing...' : 'Complete Reservation'}
                        </button>
                        
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1.5rem', fontStyle: 'italic' }}>
                            Secure encrypted transaction
                        </p>
                    </div>
                </div>
                
                </div>
            )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Checkout;
