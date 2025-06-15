// src/components/EmployeeDashboard.jsx
import React from 'react';
import './ManagerDashboard.css';

export default function EmployeeDashboard() {
  return (
    <div className="manager-dashboard" dir="rtl">
      <div className="dashboard-content">
        <h1>שלום עובד 👋</h1>
        <p>בחר פעולה מהתפריט הצדדי ☰</p>
      </div>
    </div>
  );
}
