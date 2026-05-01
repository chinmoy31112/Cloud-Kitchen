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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-color)' }}>
      {/* Top Mobile Header */}
      <header style={{ 
          background: '#1c1c1e', 
          color: 'white', 
          padding: '1.2rem 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.8rem', fontFamily: 'Playfair Display, serif' }}>
          <span style={{color: 'var(--primary-color)'}}>🛵</span> <span style={{letterSpacing: '1px'}}>Rider Console</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>{user?.first_name}</span>
          <button onClick={handleLogout} className="glass-panel" style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none' }}>
            SIGN OUT
          </button>
        </div>
      </header>

      {/* Main Content Area optimized for Mobile Width */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', paddingBottom: '7rem', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
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
          padding: '1rem 0',
          boxShadow: '0 -8px 20px rgba(0,0,0,0.1)',
          zIndex: 100
      }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary-color)' }}>
              <span style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>📦</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>ACTIVE JOBS</span>
          </div>
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.6rem', marginBottom: '0.3rem', filter: 'grayscale(100%)' }}>🧑‍🍳</span>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>EXIT PORTAL</span>
          </Link>
      </nav>
    </div>
  );
};

export default DeliveryLayout;
