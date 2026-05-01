import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const { registerUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'customer'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Convert role to standard string if needed.
    const result = await registerUser(formData);
    if (!result.success) {
      if (typeof result.error === 'object') {
        const errStrings = Object.entries(result.error).map(([k, v]) => `${k}: ${v}`);
        setError(errStrings.join(' | '));
      } else {
        setError(result.error || 'Registration failed');
      }
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' };

  return (
    <BaseLayout fullScreen={true}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
        <div className="card glass-panel" style={{ padding: '3.5rem 3rem', width: '100%', maxWidth: '550px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-lg)', margin: 'auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '2.2rem' }}>Create Account</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Join the Bespoke Kitchen culinary circle.</p>
          
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(185, 28, 28, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>First Name</label>
                <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} placeholder="John" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Last Name</label>
                <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} placeholder="Doe" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
                <input type="text" name="username" required value={formData.username} onChange={handleChange} placeholder="johndoe" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</label>
                <input type="text" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="chef@bespoke.com" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }} />
            </div>
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', letterSpacing: '0.5px' }}>
              {loading ? 'REGISTERING...' : 'SIGN UP'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already part of the kitchen? <Link to="/login" style={{ fontWeight: '600', color: 'var(--primary-color)', textDecoration: 'underline' }}>Log in</Link>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Register;
