import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const result = await loginUser(formData.email, formData.password);
    if (!result.success) {
      setError(result.error?.detail || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <BaseLayout fullScreen={true}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card glass-panel" style={{ padding: '3.5rem 3rem', width: '100%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '2.2rem' }}>Welcome Back</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Enter your credentials to access the kitchen.</p>
          
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(185, 28, 28, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="chef@bespokekitchen.com"
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontSize: '1rem' }} 
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
              <input 
                type="password" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontSize: '1rem' }} 
              />
            </div>
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', letterSpacing: '0.5px' }}>
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            New to Bespoke Kitchen? <Link to="/register" style={{ fontWeight: '600', color: 'var(--primary-color)', textDecoration: 'underline' }}>Create an account</Link>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Login;
