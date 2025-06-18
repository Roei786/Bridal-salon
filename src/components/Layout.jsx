// src/components/Layout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './ManagerDashboard.css';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { fullName, role } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const buttons = [
    { label: 'ניהול משתמשים', icon: '👤', path: '/users' },
    { label: 'כרטיסיות כלות', icon: '👰', path: '/brides' },
    { label: 'יומן פגישות', icon: '📅', path: '/calendar' },
    { label: 'כניסה/יציאה', icon: '🔐', path: '/attendance' },
    { label: 'הפקת דוחות', icon: '📊', path: '/reports' },
  ];

  return (
    <>
      {/* 🔝 בר עליון עם ☰ */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'rgba(92, 39, 93, 0.6)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
          zIndex: 1300,
          direction: 'rtl',
          paddingX: 2
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton onClick={toggleMenu} color="inherit">
            <MenuIcon />
          </IconButton>

          <Box textAlign="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {role === 'manager' ? 'מנהלת' : role === 'employee' ? 'עובד' : ''}
            </Typography>
            <Typography sx={{ fontSize: '1rem' }}>{timeStr}</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {fullName || 'משתמש'}
            </Typography>
            <IconButton onClick={handleLogout} color="inherit">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* רקע חצי שקוף */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* תפריט צד */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">{fullName?.[0] || '?'}</div>
            <div className="user-name">{fullName || 'משתמש'}</div>
          </div>
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

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>🚪 התנתקות</button>
        </div>
      </div>

      {/* תוכן */}
      <div style={{ paddingTop: '100px' }}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;



