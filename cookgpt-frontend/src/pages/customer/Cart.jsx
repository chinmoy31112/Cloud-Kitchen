import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';
import apiClient from '../../api/apiClient';

const Cart = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await apiClient.get('cart/');
      setCartData(res.data.data);
      setAuthError(false);
    } catch (err) {
      if (err.response?.status === 401) {
        setAuthError(true);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await apiClient.put(`cart/items/${itemId}/`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiClient.delete(`cart/items/${itemId}/remove/`);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    if(!window.confirm('Are you sure you want to empty your cart?')) return;
    try {
      await apiClient.delete('cart/clear/');
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  if (authError) {
    return (
      <BaseLayout>
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
          <h2>Oops! You need to be logged in to view your cart.</h2>
          <Link to="/login" className="btn" style={{ marginTop: '1rem' }}>Login Now</Link>
        </div>
      </BaseLayout>
    );
  }

  if (loading) return <BaseLayout><p style={{textAlign: 'center', marginTop: '5rem'}}>Loading cart...</p></BaseLayout>;

  const items = cartData?.items || [];
  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = items.reduce((acc, curr) => acc + (parseFloat(curr.menu_item_price) * curr.quantity), 0);

  return (
    <BaseLayout>
      <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Your Shopping Cart <span style={{fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>({totalItems} items)</span></h2>
          {items.length > 0 && (
            <button onClick={clearCart} style={{ background: '#ef4444', padding: '0.5rem 1rem' }}>Empty Cart</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>Your cart is empty</h3>
            <Link to="/menu" className="btn" style={{ marginTop: '1.5rem' }}>Browse Menu</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
            <div className="card glass-panel" style={{ padding: '1.5rem' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '80px', height: '80px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    {item.menu_item_image ? (
                        <img src={item.menu_item_image} alt={item.menu_item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>Pic</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{item.menu_item_name}</h4>
                    <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>₹{item.menu_item_price}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '0.2rem 0.6rem', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>-</button>
                    <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '0.2rem 0.6rem', background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>+</button>
                  </div>
                  <div style={{ fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                    ₹{(parseFloat(item.menu_item_price) * item.quantity).toFixed(2)}
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'transparent', color: '#ef4444', padding: '0.5rem', boxShadow: 'none' }} title="Remove item">
                    ✖
                  </button>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: '1.5rem', alignSelf: 'start', position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                <span>Taxes & Fees</span>
                <span>Calculated at checkout</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{totalPrice.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', textAlign: 'center' }}>
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default Cart;
