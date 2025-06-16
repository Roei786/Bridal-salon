import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LockIcon from '@mui/icons-material/Lock';

function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  if (!name) return { children: '?' };
  const parts = name.split(' ');
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  return {
    sx: { bgcolor: stringToColor(name), cursor: 'pointer' },
    children: initials
  };
}

export default function Navbar({ onToggleMenu }) {
  const { fullName, role } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);

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

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('he-IL', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(-45deg, #c89ddc, #7e57c2, #a18cd1, #6a1b9a)',
        backgroundSize: '400% 400%',
        animation: 'gradientMove 20s ease infinite',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1100,
        direction: 'rtl',
        '@keyframes gradientMove': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => typeof onToggleMenu === 'function' && onToggleMenu()} color="inherit">
            <MenuIcon />
          </IconButton>
          <IconButton onClick={() => navigate('/dashboard')} color="inherit">
            <HomeIcon />
          </IconButton>
        </Box>

        {/* אמצע – שם ושעה */}
        <Box textAlign="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{fullName}</Typography>
          <Typography sx={{ fontSize: '1rem' }}>{timeStr}</Typography>
        </Box>

        {/* אוואטר ותפריט */}
        <Box>
          <Tooltip title="אפשרויות">
            <Avatar {...stringAvatar(fullName || 'משתמש')} onClick={handleAvatarClick} />
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>{fullName || 'משתמש'}</MenuItem>
            <MenuItem onClick={() => {
              handleMenuClose();
              navigate('/change-password'); 
            }}>
              <LockIcon fontSize="small" style={{ marginLeft: 8 }} /> החלפת סיסמה
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
              <LogoutIcon fontSize="small" style={{ marginLeft: 8 }} /> התנתק
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <Box sx={{
        height: '5px',
        width: '100vw',
        background: 'linear-gradient(270deg,rgba(255, 217, 0, 0.64),rgba(244, 226, 133, 0.7),rgba(255, 217, 0, 0.87))',
        backgroundSize: '200% 200%',
        animation: 'shimmerBorder 4s linear infinite',
        '@keyframes shimmerBorder': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' }
        }
      }} />

      <ToastContainer />
    </AppBar>
  );
}
