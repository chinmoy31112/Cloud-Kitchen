import React from 'react';
import Navbar from '../common/Navbar';

const BaseLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="page-container">
        {children}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-secondary)',
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)'
      }}>
        <p>&copy; 2026 CookGPT Cloud Kitchen. All rights reserved.</p>
      </footer>
    </>
  );
};

export default BaseLayout;
