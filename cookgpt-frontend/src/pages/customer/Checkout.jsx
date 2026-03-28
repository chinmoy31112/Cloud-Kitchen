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

  if (!cart) return <BaseLayout><p style={{textAlign: 'center', marginTop: '5rem'}}>Loading checkout secure environment...</p></BaseLayout>;
  
  const items = cart.items || [];
  if (items.length === 0) {
      return <BaseLayout><p style={{textAlign:'center', marginTop: '5rem'}}>Your cart is empty. Please add items to order.</p></BaseLayout>;
  }

  const subtotal = items.reduce((acc, curr) => acc + (parseFloat(curr.menu_item_price) * curr.quantity), 0);
  const deliveryFee = 50.00; // Flat mock fee
  const total = subtotal + deliveryFee;

  return (
    <BaseLayout>
      <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>Secure Checkout</h2>
        
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}
        
        {processing ? (
            <div className="card glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                <h3 style={{color: 'var(--text-secondary)'}}>Processing Transaction...</h3>
                <p>Please do not refresh or hit the back button.</p>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
            
            {/* Left Column: Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* 1. Address Selection */}
                <div className="card glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>1. Delivery Address</h3>
                    {addresses.length === 0 ? (
                        <p style={{color: '#ef4444'}}>You have no saved addresses. Please add one in your Profile first.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {addresses.map(addr => (
                                <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', border: `2px solid ${selectedAddress === addr.id ? 'var(--primary-color)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', background: selectedAddress === addr.id ? '#fff3e0' : 'transparent' }}>
                                    <input 
                                        type="radio" 
                                        name="address" 
                                        value={addr.id} 
                                        checked={selectedAddress === addr.id} 
                                        onChange={() => setSelectedAddress(addr.id)} 
                                        style={{ marginTop: '0.3rem' }}
                                    />
                                    <div>
                                        <b style={{ color: 'var(--text-primary)' }}>{addr.label}</b>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                                            {addr.street}, {addr.city}, {addr.state} {addr.pincode}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Payment Method */}
                <div className="card glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>2. Payment Method</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <input type="radio" value="online" checked={paymentMethod === 'online'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span>Credit/Debit Card (Online)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <input type="radio" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span>UPI (Google Pay, PhonePe, Paytm)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <input type="radio" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <span>Cash on Delivery</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Right Column: Summary */}
            <div className="card" style={{ padding: '1.5rem', alignSelf: 'start', position: 'sticky', top: '100px', background: 'var(--bg-color)' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Order Confirmation</h3>
                
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                    {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{item.quantity}x {item.menu_item_name}</span>
                            <span>₹{(parseFloat(item.menu_item_price) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary-color)' }}>₹{total.toFixed(2)}</span>
                </div>
                
                <button 
                    onClick={handlePlaceOrder} 
                    disabled={!selectedAddress}
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: !selectedAddress ? 0.6 : 1 }}
                >
                    Pay & Confirm Order
                </button>
            </div>
            
            </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default Checkout;
