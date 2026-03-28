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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', margin: 0 }}>
            CookGPT <span style={{fontSize: '1rem', color: 'var(--text-secondary)', display: 'block'}}>Kitchen Admin</span>
          </h1>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <Link to="/admin" style={getLinkStyle('/admin')}>Dashboard</Link>
          <Link to="/admin/orders" style={getLinkStyle('/admin/orders')}>Live Orders (KDS)</Link>
          <Link to="/admin/menu" style={getLinkStyle('/admin/menu')}>Menu Management</Link>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Logged in as <b>{user?.first_name}</b>
          </div>
          <button onClick={logoutUser} style={{ width: '100%', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header style={{ background: 'var(--surface-color)', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
             <Link to="/" className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Back to Customer Portal</Link>
        </header>
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
