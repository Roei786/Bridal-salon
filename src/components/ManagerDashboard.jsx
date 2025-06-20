import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './ManagerDashboard.css';

export default function ManagerDashboard() {
  const { fullName } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [bridesInProgress, setBridesInProgress] = useState([]);
  const [filter, setFilter] = useState('day');
  const [dialogOpen, setDialogOpen] = useState(false);
  const now = new Date();

  useEffect(() => {
    const fetchAppointments = async () => {
      const snapshot = await getDocs(collection(db, 'appointments'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    };

    const fetchBrides = async () => {
      const snapshot = await getDocs(collection(db, 'Brides'));
      const inProgress = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(b => b.historyStatus === 'In Progress');
      setBridesInProgress(inProgress);
    };

    fetchAppointments();
    fetchBrides();
  }, []);

  const filteredAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    if (filter === 'day') {
      return appDate.toDateString() === now.toDateString();
    } else if (filter === 'week') {
      const weekLater = new Date();
      weekLater.setDate(now.getDate() + 7);
      return appDate >= now && appDate <= weekLater;
    } else if (filter === 'month') {
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        padding: '3rem',
        background: 'linear-gradient(to bottom, #f9f3ff, #efe2d5)',
        fontFamily: 'Heebo, sans-serif',
        direction: 'rtl'
      }}
    >
      <Typography variant="h3" align="center" sx={{ color: '#5d3c75', mb: 5 }}>
        שלום {fullName || 'משתמש'} 👋
      </Typography>

      <Box display="flex" gap={6} flexWrap="wrap" justifyContent="center">
        {/* כלות בתהליך */}
        <Paper elevation={4} sx={{ width: '400px', minHeight: '330px', borderRadius: 5, p: 4, backgroundColor: '#ffffff' }}>
          <Typography variant="h5" sx={{ color: '#5d3c75', mb: 2 }}>כלות בתהליך</Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>סה"כ: {bridesInProgress.length}</Typography>
          <Box display="flex" gap={2} flexDirection="column">
            <Button
              variant="contained"
              sx={{ backgroundColor: '#8b5e3c', fontWeight: 'bold' }}
              onClick={() => navigate('/brides')}
            >
              לרשימת הכלות
            </Button>
            <Button
              variant="outlined"
              sx={{ color: '#5d3c75', borderColor: '#5d3c75' }}
              onClick={() => setDialogOpen(true)}
            >
              הצג רשימה
            </Button>
          </Box>
        </Paper>

        {/* פגישות */}
        <Paper elevation={4} sx={{ width: '500px', minHeight: '330px', borderRadius: 5, p: 4, backgroundColor: '#ffffff' }}>
          <Typography variant="h5" sx={{ color: '#5d3c75', mb: 2 }}>פגישות ליום זה</Typography>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, val) => val && setFilter(val)}
            sx={{ mb: 3, direction: 'ltr' }}
          >
            <ToggleButton value="day">היום</ToggleButton>
            <ToggleButton value="week">שבוע</ToggleButton>
            <ToggleButton value="month">חודש</ToggleButton>
          </ToggleButtonGroup>

          {filteredAppointments.map(app => (
            <Box key={app.id} sx={{ mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{app.time} - {new Date(app.date).toLocaleDateString()}</Typography>
              <Typography variant="body2">{app.name} - {app.title}</Typography>
            </Box>
          ))}

          <Button
            variant="contained"
            sx={{ mt: 3, backgroundColor: '#8b5e3c', fontWeight: 'bold' }}
            onClick={() => navigate('/calendar')}
          >
            לצפייה ביומן
          </Button>
        </Paper>
      </Box>

      {/* Dialog להצגת כלות בתהליך */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm" dir="rtl">
        <DialogTitle>כלות בתהליך</DialogTitle>
        <DialogContent>
          <List>
            {bridesInProgress.map(bride => (
              <ListItem key={bride.id}>
                <ListItemText primary={bride.fullName} secondary={bride.phoneNumber} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}