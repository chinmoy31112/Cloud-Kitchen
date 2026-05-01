import React from 'react';
import Navbar from '../common/Navbar';

const BaseLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="page-container">
        {children}
      </main>

    </>
  );
};

export default BaseLayout;
