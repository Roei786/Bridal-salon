// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './ManagerDashboard.css'; // סגנונות של sidebar

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    console.log('🔁 toggleMenu called');
    setIsSidebarOpen(prev => !prev);
  };

  const buttons = [
    { label: 'ניהול משתמשים', icon: '👤', path: '/users' },
    { label: 'כרטיסיות כלות', icon: '👰', path: '/brides' },
    { label: 'טופס התארגנות', icon: '📝', path: '/preparation-form' },
    { label: 'יומן פגישות', icon: '📅', path: '/calendar' },
    { label: 'היסטוריית כלות', icon: '📖', path: '/bride-history' },
    { label: 'כניסה/יציאה', icon: '🔐', path: '/attendance' },
    { label: 'הפקת דוחות', icon: '📊', path: '/reports' },
    { label: 'שליחת טופס מדידה', icon: '✉️', path: '/send-measurement' },
    { label: 'שלח תזכורת', icon: '📨', path: '/send-reminder' },
  ];

  return (
    <>
      <Navbar onToggleMenu={toggleMenu} />

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>תפריט מנהלת</h2>
        </div>
        <ul className="sidebar-list">
          {buttons.map((btn, idx) => (
            <li key={idx} onClick={() => {
              navigate(btn.path);
              setIsSidebarOpen(false);
            }}>
              <span className="sidebar-icon">{btn.icon}</span> {btn.label}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ paddingTop: '100px' }}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
