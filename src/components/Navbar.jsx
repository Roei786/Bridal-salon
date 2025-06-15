// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  const parts = name.split(' ');
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`,
  };
}

export default function Navbar({ onToggleMenu }) {
  const { fullName, role } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
    setTimeout(() => navigate('/'), 2000);
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('he-IL', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(to left, #c89ddc, #7e57c2)',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1100,
        direction: 'rtl',
        paddingX: 2
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        {/* Right Side – Logo & Sidebar Toggle */}
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={onToggleMenu} color="inherit">
            <MenuIcon />
          </IconButton>
          <IconButton onClick={() => navigate('/dashboard')} color="inherit">
            <HomeIcon fontSize="medium" />
          </IconButton>
        </Box>

        {/* Middle – Role and Time */}
        <Box textAlign="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {fullName}
          </Typography>
          <Typography sx={{ fontSize: '1rem' }}>{timeStr}</Typography>
        </Box>

        {/* Left Side – Avatar & Menu */}
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={handleAvatarClick} color="inherit">
            <Avatar {...stringAvatar(fullName || 'משתמש')} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleLogout}>התנתק</MenuItem>
            {/* ניתן להוסיף כאן אופציות נוספות */}
          </Menu>
        </Box>
      </Toolbar>
      <ToastContainer />
    </AppBar>
  );
}
