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
    <BaseLayout>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <div className="card glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Create an Account</h2>
          
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Username</label>
              <input type="text" name="username" required value={formData.username} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Phone Number</label>
              <input type="text" name="phone" required value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} style={inputStyle} />
            </div>
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}>
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Log in</Link>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Register;
