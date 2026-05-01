import React from 'react';
import BaseLayout from '../components/layouts/BaseLayout';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <BaseLayout>
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #faf9f6 0%, #eae5d9 100%)',
        borderRadius: '30px',
        margin: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Subtle decorative background elements */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(184, 144, 91, 0.05)',
          filter: 'blur(80px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.6)',
          filter: 'blur(60px)'
        }}></div>

        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}>
          
          <div style={{
            display: 'inline-block',
            padding: '0.4rem 1.5rem',
            border: '1px solid var(--primary-color)',
            borderRadius: '30px',
            color: 'var(--primary-color)',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '2rem',
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            A Culinary Masterpiece
          </div>

          <h1 style={{
            fontSize: '5rem',
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            letterSpacing: '-1.5px',
            lineHeight: '1.1'
          }}>
            <span style={{ fontStyle: 'italic', fontWeight: '400', color: 'var(--primary-color)' }}>Cook</span>GPT
          </h1>
          
          <p style={{
            fontSize: '1.3rem',
            color: 'var(--text-secondary)',
            marginBottom: '4rem',
            maxWidth: '700px',
            margin: '0 auto 4rem auto',
            lineHeight: '1.8',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: '300'
          }}>
            Experience the zenith of gastronomy. Our intelligent cloud kitchen curates personalized, Michelin-level recipes and orchestrates flawless delivery to your estate.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/menu" className="btn" style={{ 
              padding: '1.2rem 3rem', 
              fontSize: '1rem',
              letterSpacing: '1px'
            }}>
              Discover the Menu
            </Link>
            <Link to="/login" className="btn glass-panel" style={{
              padding: '1.2rem 3rem', 
              fontSize: '1rem', 
              background: 'rgba(255, 255, 255, 0.8)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              letterSpacing: '1px'
            }}>
              Exclusive Access
            </Link>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Home;

