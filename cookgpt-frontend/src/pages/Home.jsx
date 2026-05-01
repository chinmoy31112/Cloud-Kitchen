import React from 'react';
import BaseLayout from '../components/layouts/BaseLayout';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <BaseLayout fullScreen={true}>
      <div style={{
        flex: 1, // Fill the BaseLayout flex container
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Ambient Premium Accents */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '30vw',
          height: '30vw',
          background: 'radial-gradient(circle, rgba(184, 144, 91, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '25vw',
          height: '25vw',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0
        }}></div>

        {/* The Notice Board Card */}
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '850px',
          padding: '4rem 3rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeSlideUp 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
          <div style={{
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontSize: '0.8rem',
            color: 'var(--primary-color)',
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}>
            Welcome to the Elite
          </div>

          <h1 style={{
            fontSize: '4.5rem',
            color: 'var(--text-primary)',
            marginBottom: '1.2rem',
            letterSpacing: '-2px',
            lineHeight: '1.1'
          }}>
            <span style={{ fontStyle: 'italic', fontWeight: '400', color: 'var(--primary-color)' }}>Bespoke</span> Kitchen
          </h1>

          <div style={{
            width: '60px',
            height: '2px',
            background: 'var(--primary-color)',
            margin: '0 auto 2.5rem auto',
            opacity: 0.6
          }}></div>
          
          <p style={{
            fontSize: '1.35rem',
            color: 'var(--text-secondary)',
            marginBottom: '3.5rem',
            maxWidth: '650px',
            lineHeight: '1.8',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: '300'
          }}>
            Experience the zenith of gastronomy. Our intelligent cloud kitchen curates personalized, Michelin-level recipes and orchestrates flawless delivery to your estate.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/menu" className="btn" style={{ 
              padding: '1.2rem 3.5rem', 
              fontSize: '1rem',
              letterSpacing: '1px'
            }}>
              Discover the Menu
            </Link>
            <Link to="/cookgpt" className="btn glass-panel" style={{
              padding: '1.2rem 3.5rem', 
              fontSize: '1rem', 
              background: 'rgba(255, 255, 255, 0.8)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              letterSpacing: '1px'
            }}>
              Bespoke AI
            </Link>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Home;

