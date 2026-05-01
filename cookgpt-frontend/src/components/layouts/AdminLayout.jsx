import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logoutUser } = useContext(AuthContext);
  const location = useLocation();

  const getLinkStyle = (path) => ({
    display: 'block',
    padding: '1rem 1.5rem',
    textDecoration: 'none',
    color: location.pathname === path ? 'var(--primary-color)' : 'var(--text-secondary)',
    background: location.pathname === path ? '#fff3e0' : 'transparent',
    borderLeft: `4px solid ${location.pathname === path ? 'var(--primary-color)' : 'transparent'}`,
    fontWeight: location.pathname === path ? '600' : '500',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '3rem 2rem', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0, fontFamily: 'Playfair Display, serif' }}>
            Bespoke
            <span style={{fontSize: '0.8rem', color: 'var(--primary-color)', display: 'block', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '5px'}}>Kitchen Admin</span>
          </h1>
        </div>
        
        <nav style={{ flex: 1, padding: '2rem 1rem' }}>
          <Link to="/admin" style={getLinkStyle('/admin')}>Dashboard</Link>
          <Link to="/admin/orders" style={getLinkStyle('/admin/orders')}>Live Orders (KDS)</Link>
          <Link to="/admin/menu" style={getLinkStyle('/admin/menu')}>Menu Management</Link>
        </nav>

        <div style={{ padding: '2rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{ marginBottom: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            CHEF ON DUTY<br/>
            <b style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{user?.first_name} {user?.last_name}</b>
          </div>
          <button onClick={logoutUser} className="glass-panel" style={{ width: '100%', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.8rem', fontSize: '0.8rem' }}>
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ background: 'var(--surface-color)', padding: '1.2rem 3rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
             <Link to="/" className="btn glass-panel" style={{ padding: '0.6rem 1.5rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', textTransform: 'none', fontSize: '0.9rem' }}>Customer Portal</Link>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '3rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
