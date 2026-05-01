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
      <BaseLayout fullScreen={true}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Oops! You need to be logged in to view your cart.</h2>
            <Link to="/login" className="btn">Login Now</Link>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (loading) return <BaseLayout fullScreen={true}><div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}><p>Loading cart...</p></div></BaseLayout>;

  const items = cartData?.items || [];
  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = items.reduce((acc, curr) => acc + (parseFloat(curr.menu_item_price) * curr.quantity), 0);

  return (
    <BaseLayout fullScreen={true}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 4rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0 }}>Your Shopping Cart <span style={{fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>({totalItems} items)</span></h2>
            {items.length > 0 && (
              <button onClick={clearCart} style={{ background: '#ef4444', padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}>Empty Cart</button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="card glass-panel" style={{ padding: '4rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.8)' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your cart is empty</h3>
              <Link to="/menu" className="btn">Browse Menu</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'start' }}>
              <div className="card glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.8)' }}>
                {items.map((item, index) => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.5rem', 
                    padding: '1.2rem 0', 
                    borderBottom: index === items.length - 1 ? 'none' : '1px solid var(--border-color)' 
                  }}>
                    <div style={{ width: '90px', height: '90px', background: '#f8f8f8', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      {item.menu_item_image ? (
                          <img src={item.menu_item_image} alt={item.menu_item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>Pic</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{item.menu_item_name}</h4>
                      <div style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '1.05rem' }}>₹{item.menu_item_price}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f5f5f5', padding: '0.3rem', borderRadius: '30px' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'white', color:'var(--text-primary)', border:'1px solid var(--border-color)', boxShadow:'none', padding:0 }}>-</button>
                      <span style={{ width: '25px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'white', color:'var(--text-primary)', border:'1px solid var(--border-color)', boxShadow:'none', padding:0 }}>+</button>
                    </div>
                    <div style={{ fontWeight: '600', width: '90px', textAlign: 'right', fontSize: '1.05rem' }}>
                      ₹{(parseFloat(item.menu_item_price) * item.quantity).toFixed(2)}
                    </div>
                    <button onClick={() => removeItem(item.id)} style={{ background: 'transparent', color: '#ef4444', padding: '0.5rem', boxShadow: 'none', marginLeft: '1rem' }} title="Remove item">
                      <span style={{ fontSize: '1.2rem' }}>×</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="card glass-panel" style={{ padding: '2rem', border: '1px solid var(--primary-color)', position: 'sticky', top: '0' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', fontSize: '1.3rem' }}>Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '0.95rem' }}>Subtotal</span>
                  <span style={{ fontWeight: '500' }}>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '0.95rem' }}>Service Fee</span>
                  <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>Calculated next</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', fontSize: '1.3rem', fontWeight: 'bold', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary-color)' }}>₹{totalPrice.toFixed(2)}</span>
                </div>
                <Link to="/checkout" className="btn" style={{ width: '100%', padding: '1.2rem', fontSize: '1rem', textAlign: 'center' }}>
                  Checkout
                </Link>
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link to="/menu" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>Add more items</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Cart;
