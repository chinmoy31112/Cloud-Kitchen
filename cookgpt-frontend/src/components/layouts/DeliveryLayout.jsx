import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DeliveryLayout = ({ children }) => {
  const { user, logoutUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Top Mobile Header */}
      <header style={{ 
          background: 'var(--primary-color)', 
          color: 'white', 
          padding: '1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)',
          position: 'sticky',
          top: 0,
          zIndex: 100
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛵 <span style={{letterSpacing: '1px'}}>Rider App</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{user?.first_name}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area optimized for Mobile Width */}
      <main style={{ flex: 1, padding: '1rem', paddingBottom: '5rem', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>

      {/* Persistent Bottom Mobile Nav */}
      <nav style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: 'var(--surface-color)', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex', 
          justifyContent: 'space-around', 
          padding: '0.8rem 0',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)',
          zIndex: 100
      }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary-color)' }}>
              <span style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>📦</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Active Jobs</span>
          </div>
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.5rem', marginBottom: '0.2rem', filter: 'grayscale(100%)' }}>🧑‍🍳</span>
              <span style={{ fontSize: '0.75rem' }}>Exit Portal</span>
          </Link>
      </nav>
    </div>
  );
};

export default DeliveryLayout;
