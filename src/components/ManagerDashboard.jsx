import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
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
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { fullName } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');

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

  const now = new Date();

  const filteredAppointments = appointments.filter(app => {
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
  }).filter(app => {
    const name = app.name?.toLowerCase() || '';
    const title = app.title?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase()) || title.includes(searchQuery.toLowerCase());
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="manager-dashboard" dir="rtl">
      <Navbar onToggleMenu={() => setIsSidebarOpen(prev => !prev)} />

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>תפריט מנהלת</h2>
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

      <div className="dashboard-content">
        <Typography variant="h4" gutterBottom>
          שלום {fullName || 'משתמש'} 👋
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ marginBottom: '1rem', fontWeight: 'bold' }}
        >
          הפגישות שלי
        </Button>

        <Box display="flex" gap={2} mb={2}>
          <TextField
            placeholder="חפש לפי שם או כותרת"
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
              <ListItem key={app.id} sx={{ backgroundColor: '#fdf6ec', borderRadius: '8px', mb: 1 }}>
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
