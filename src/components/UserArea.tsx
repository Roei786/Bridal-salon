import React, { useState, useEffect } from 'react';
import {
  Avatar, Box, Drawer, Typography, Divider, Paper, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { format } from 'date-fns';

function stringToColor(string: string): string {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name: string) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('');
  return {
    sx: { bgcolor: stringToColor(name) },
    children: initials.toUpperCase(),
  };
}

const UserAreaComponent = () => {
  const { currentUser, resetPassword } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userShifts, setUserShifts] = useState<any[]>([]);
  const [fullName, setFullName] = useState<string>('משתמש');

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      alert("לא ניתן לאפס סיסמה, כתובת האימייל אינה ידועה.");
      return;
    }
    try {
      await resetPassword(currentUser.email);
      alert(`נשלח מייל לאיפוס סיסמה לכתובת: ${currentUser.email}`);
      setDrawerOpen(false);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("אירעה שגיאה בשליחת המייל.");
    }
  };

  useEffect(() => {
    if (!currentUser?.uid) return;
    const fetchFullName = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFullName(data.fullName || 'משתמש');
      }
    };
    fetchFullName();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const formattedStartOfMonth = format(startOfMonth, 'yyyy-MM-dd');

    const q = query(
      collection(db, 'shifts'),
      where('userId', '==', currentUser.uid),
      where('date', '>=', formattedStartOfMonth)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const shifts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserShifts(shifts);
    });

    return () => unsub();
  }, [currentUser]);

  const totalHours = userShifts.reduce((sum, shift) => {
    if (shift.clockInTime?.seconds && shift.clockOutTime?.seconds) {
      const diff = (shift.clockOutTime.seconds - shift.clockInTime.seconds) / 3600;
      return sum + diff;
    }
    return sum;
  }, 0);

  const activeShifts = userShifts.filter(s => !s.clockOutTime);

  return (
    <>
      <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1300 }}>
        <IconButton onClick={toggleDrawer(true)} size="large">
          <Avatar {...stringAvatar(fullName)} />
        </IconButton>
      </Box>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 320,
            p: 3,
            backgroundColor: '#fffefb',
            borderRight: '1px solid #fcd34d',
            fontFamily: "'Varela Round', sans-serif",
          },
        }}
      >
        <Box>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: '#78350f', fontWeight: 'bold', textAlign: 'center' }}
          >
            האזור האישי
          </Typography>
          <Divider sx={{ mb: 2, borderColor: '#fcd34d' }} />

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar {...stringAvatar(fullName)} sx={{ width: 64, height: 64, fontSize: '2rem', mx: 'auto', mb: 1.5 }} />
            <Typography variant="h6" sx={{ color: '#78350f', fontWeight: 'bold' }}>
              שלום, {fullName}!
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {[
              { label: 'סה"כ שעות החודש', value: totalHours.toFixed(1) },
              { label: 'מספר משמרות', value: userShifts.length },
              { label: 'משמרות פעילות', value: activeShifts.length }
            ].map((stat, idx) => (
              <Paper
                key={idx}
                elevation={2}
                sx={{
                  gridColumn: idx === 0 ? 'span 2' : 'span 1',
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: 2,
                  color: '#78350f',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </Paper>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
            <Button
              variant="contained"
              onClick={openDialog}
              sx={{
                backgroundColor: '#fcd34d', color: '#78350f', fontWeight: 'bold',
                '&:hover': { backgroundColor: '#fbbf24' },
              }}
              fullWidth
            >
              הצג את המשמרות שלי
            </Button>
            
            <Button
              variant="outlined"
              onClick={handlePasswordReset}
              sx={{
                borderColor: '#fcd34d', color: '#78350f', fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#fbbf24',
                  backgroundColor: 'rgba(251, 191, 36, 0.08)',
                },
              }}
              fullWidth
            >
              החלף סיסמה
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', color: '#78350f', textAlign: 'center' }}>
          המשמרות שלי החודש
        </DialogTitle>
        <DialogContent dividers>
          {userShifts.length > 0 ? (
            <List>
              {userShifts.map((shift) => (
                <ListItem key={shift.id} divider>
                  <ListItemText
                    primary={`תאריך: ${format(new Date(shift.date), 'dd/MM/yyyy')}`}
                    secondary={
                      shift.clockInTime && shift.clockOutTime
                        ? `שעות: ${format(new Date(shift.clockInTime.seconds * 1000), 'HH:mm')} - ${format(new Date(shift.clockOutTime.seconds * 1000), 'HH:mm')} | משך: ${shift.durationHours.toFixed(2)} שעות`
                        : `נכנסת ב: ${format(new Date(shift.clockInTime.seconds * 1000), 'HH:mm')} (משמרת פעילה)`
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
              אין משמרות להציג החודש.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={closeDialog} sx={{ fontWeight: 'bold' }}>
            סגור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserAreaComponent;