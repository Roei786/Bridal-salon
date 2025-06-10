// src/components/EmployeeDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './ManagerDashboard.css'; // עדיין משתמשים באותו עיצוב

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const buttons = [
    { label: 'כרטיסיות כלות', icon: '👰', path: '/brides' },
    { label: 'טופס התארגנות', icon: '📝', path: '/preparation-form' },
    { label: 'יומן פגישות', icon: '📅', path: '/calendar' },
    { label: 'היסטוריית כלות', icon: '📖', path: '/bride-history' },
    { label: 'כניסה/יציאה', icon: '🔐', path: '/attendance' },
    { label: 'שליחת טופס מדידה', icon: '✉️', path: '/send-measurement' },
    { label: 'שלח תזכורת', icon: '📨', path: '/send-reminder' },
  ];

  return (
    <div className="manager-dashboard" dir="rtl">
      <Navbar onToggleMenu={() => setIsSidebarOpen(prev => !prev)} />

      {/* רקע כהה בלחיצה על תפריט במובייל */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>תפריט עובד</h2>
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

      {/* תוכן ראשי */}
      <div className="dashboard-content">
        <h1>שלום עובד 👋</h1>
        <p>בחר פעולה מהתפריט הצדדי ☰</p>
      </div>
    </div>
  );
}
