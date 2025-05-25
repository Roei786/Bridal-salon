import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { fullName, role } = useAuth(); 
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const timeStr = currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
   <AppBar
  position="fixed"
  sx={{
    backgroundColor: 'rgba(92, 39, 93, 0.6)', 
    color: '#fff',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 1100
  }}
>



      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div" sx={{ color: '#fff' }}>
         {fullName || 'משתמש'}
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ color: '#fff' }}>{role === 'manager' ? 'מנהל' : 'עובד'}</Typography>
          <Typography sx={{ color: '#fff' }}>{timeStr}</Typography>
          <IconButton onClick={handleLogout} color="inherit">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
