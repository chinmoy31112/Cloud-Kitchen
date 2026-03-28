import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navStyles = {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease',
    padding: scrolled ? '0.8rem 2rem' : '1.2rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: scrolled ? 'var(--glass-bg)' : 'transparent',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
    borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent'
  };

  const logoStyles = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--primary-color)',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const menuStyles = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center'
  };

  const getLinkStyles = (path) => ({
    color: location.pathname === path ? 'var(--primary-color)' : 'var(--text-primary)',
    fontWeight: location.pathname === path ? '600' : '500',
    position: 'relative',
    fontSize: '1rem',
    transition: 'color 0.2s ease',
  });

  return (
    <nav style={navStyles}>
      <Link to="/" style={logoStyles}>
        <span role="img" aria-label="chef hat">🧑‍🍳</span> CookGPT
      </Link>
      
      <div style={menuStyles}>
        <Link to="/" style={getLinkStyles('/')}>Home</Link>
        <Link to="/menu" style={getLinkStyles('/menu')}>Menu</Link>
        <Link to="/cart" style={getLinkStyles('/cart')}>Cart</Link>
        <Link to="/orders" style={getLinkStyles('/orders')}>Orders</Link>
        <Link to="/cookgpt" style={{...getLinkStyles('/cookgpt'), color: 'var(--primary-color)', fontWeight: 'bold'}}>🤖 CookGPT</Link>
        
        {/* Auth Links */}
        <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem', alignItems: 'center' }}>
          {user ? (
            <Link to="/profile" className="btn glass-panel" style={{ background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
              👋 Hi, {user.first_name}
            </Link>
          ) : (
            <>
              <Link to="/login" style={{...getLinkStyles('/login'), color: 'var(--text-secondary)'}}>Login</Link>
              <Link to="/register" className="btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
