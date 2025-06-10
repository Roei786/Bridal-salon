import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px' }}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
