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
    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
    padding: scrolled ? '1rem 4rem' : '1.5rem 4rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: scrolled ? 'rgba(250, 249, 246, 0.95)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.03)' : 'none',
    borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent'
  };

  const logoStyles = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.6rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none'
  };

  const logoAccent = {
    color: 'var(--primary-color)',
    fontStyle: 'italic',
    fontWeight: '400'
  };

  const menuStyles = {
    display: 'flex',
    gap: '2.5rem',
    alignItems: 'center',
    fontFamily: "'Outfit', sans-serif"
  };

  const getLinkStyles = (path) => ({
    color: location.pathname === path ? 'var(--primary-color)' : 'var(--text-secondary)',
    fontWeight: location.pathname === path ? '500' : '400',
    position: 'relative',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    transition: 'color 0.3s ease',
    textDecoration: 'none'
  });

  return (
    <nav style={navStyles}>
      <Link to="/" style={logoStyles}>
        <span style={logoAccent}>Cook</span>GPT
      </Link>
      
      <div style={menuStyles}>
        <Link to="/" style={getLinkStyles('/')}>Home</Link>
        <Link to="/menu" style={getLinkStyles('/menu')}>The Menu</Link>
        <Link to="/cart" style={getLinkStyles('/cart')}>Cart</Link>
        <Link to="/orders" style={getLinkStyles('/orders')}>Orders</Link>
        <Link to="/cookgpt" style={{
          ...getLinkStyles('/cookgpt'), 
          color: 'var(--primary-color)', 
          fontWeight: '500',
          borderBottom: '1px solid var(--primary-color)',
          paddingBottom: '2px'
        }}>
          Bespoke AI
        </Link>
        
        {/* Auth Links */}
        <div style={{ display: 'flex', gap: '1.5rem', marginLeft: '1rem', alignItems: 'center' }}>
          {user ? (
            <Link to="/profile" className="btn glass-panel" style={{ 
              background: 'transparent', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)',
              boxShadow: 'none',
              padding: '0.6rem 1.5rem',
              fontSize: '0.8rem'
            }}>
              Welcome, {user.first_name}
            </Link>
          ) : (
            <>
              <Link to="/login" style={{...getLinkStyles('/login'), textTransform: 'none', letterSpacing: '0.5px'}}>Sign In</Link>
              <Link to="/register" className="btn" style={{ padding: '0.6rem 1.8rem', fontSize: '0.8rem' }}>Reserve</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
