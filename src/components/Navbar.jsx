// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Navbar({ onToggleMenu }) {
  const { fullName, role } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("👋 התנתקת בהצלחה", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
    });

    setTimeout(() => {
      navigate('/');
    }, 2000);
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

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'rgba(92, 39, 93, 0.6)',
        color: '#fff',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1100,
        direction: 'rtl',
        paddingX: 2
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* ☰ תפריט צד */}
        <IconButton
          onClick={() => {
            console.log('☰ clicked!');
            if (typeof onToggleMenu === 'function') {
              onToggleMenu();
            } else {
              console.warn('❗ onToggleMenu is not defined');
            }
          }}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>

        {/* אמצע – תפקיד ושעה */}
        <Box textAlign="center">
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
  {role === 'manager' ? '🟢 מנהלת חדשה' : '🟢 עובד חדש'}
</Typography>

          <Typography sx={{ fontSize: '1rem' }}>{timeStr}</Typography>
        </Box>

        {/* צד שמאל – שם וכפתור יציאה */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            {fullName || 'משתמש'}
          </Typography>
          <IconButton onClick={handleLogout} color="inherit">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>

      <ToastContainer />
    </AppBar>
  );
}
