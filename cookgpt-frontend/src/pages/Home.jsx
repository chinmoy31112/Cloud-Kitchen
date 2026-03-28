import React from 'react';
import BaseLayout from '../components/layouts/BaseLayout';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <BaseLayout>
      <div style={{
        textAlign: 'center',
        padding: '5rem 1rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '4rem',
          color: 'var(--primary-color)',
          marginBottom: '1rem',
          letterSpacing: '-1px'
        }}>
          Cook<span style={{color: 'var(--text-primary)'}}>GPT</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          marginBottom: '3rem'
        }}>
          Intelligent Cloud Kitchen Management System featuring AI-driven recipe recommendations, state-of-the-art ordering, and lightning-fast delivery.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/menu" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Explore Menu
          </Link>
          <Link to="/login" className="btn glass-panel" style={{
            padding: '1rem 2rem', 
            fontSize: '1.1rem', 
            background: 'var(--surface-color)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)'
          }}>
            Sign In
          </Link>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Home;
