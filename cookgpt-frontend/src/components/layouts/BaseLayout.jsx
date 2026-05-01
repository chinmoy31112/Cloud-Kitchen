import React from 'react';
import Navbar from '../common/Navbar';

const BaseLayout = ({ children, fullScreen = false }) => {
  return (
    <>
      <Navbar />
      <main 
        className={fullScreen ? "" : "page-container"} 
        style={fullScreen ? { 
          height: 'calc(100vh - 80px)', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-color)'
        } : {}}
      >
        {children}
      </main>
    </>
  );
};

export default BaseLayout;
