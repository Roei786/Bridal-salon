// src/components/ManagerDashboard.jsx
import React from 'react';
import '../pages/Dashboard.css';;
import { useNavigate } from 'react-router-dom';

export default function ManagerDashboard() {
  const navigate = useNavigate();

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
    <div className="dashboard-container">
      
      
      
   
      <div className="dashboard-card dashboard-wrapper">
        <h2 className="dashboard-title dashboard-header">👋 שלום מנהלת</h2>

        <div className="dashboard-grid">
          {buttons.map((btn, idx) => (
            <button key={idx} onClick={() => navigate(btn.path)} className="dashboard-main-button">
              <span className="button-icon">{btn.icon}</span><br />
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}