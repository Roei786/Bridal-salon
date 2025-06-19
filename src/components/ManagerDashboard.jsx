import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './ManagerDashboard.css';

export default function ManagerDashboard() {
  const { fullName } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const now = new Date();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'appointments'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAppointments(data);
      } catch (err) {
        console.error('שגיאה בשליפת פגישות:', err);
      }
    };
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments
    .filter(app => {
      const appDate = new Date(app.date);
      if (filter === 'day') {
        return appDate.toDateString() === now.toDateString();
      } else if (filter === 'week') {
        const oneWeekLater = new Date();
        oneWeekLater.setDate(now.getDate() + 7);
        return appDate >= now && appDate <= oneWeekLater;
      } else if (filter === 'month') {
        return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
      }
      return true;
    })
    .filter(app => {
      const name = app.name?.toLowerCase() || '';
      const title = app.title?.toLowerCase() || '';
      return name.includes(searchQuery.toLowerCase()) || title.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="manager-dashboard" dir="rtl">
       <div className="greeting-box">
      <h1 className="greeting">שלום {fullName || 'משתמש'} 👋</h1>
        <img
          src="/gold-ribbon.png"
          alt="סרט זהב"
          className="gold-ribbon"
        />
      </div>
      <div className="content-box">
        <Box display="flex" gap={2} mb={2}>
          <TextField
            placeholder="חיפוש לפי שם או כותרת"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ backgroundColor: 'white', flexGrow: 1 }}
          />
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, val) => val && setFilter(val)}
            size="small"
            sx={{ direction: 'ltr' }}
          >
            <ToggleButton value="day">היום</ToggleButton>
            <ToggleButton value="week">שבוע</ToggleButton>
            <ToggleButton value="month">חודש</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box className="meeting-list">
          <Typography variant="h6" gutterBottom>פגישות</Typography>
          <List>
            {filteredAppointments.map(app => (
              <ListItem key={app.id}>
                <ListItemText
                  primary={`${new Date(app.date).toLocaleDateString()} - ${app.time || ''}`}
                  secondary={`${app.name || 'לא ידוע'} - ${app.title || ''}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </div>
    </div>
  );
}
