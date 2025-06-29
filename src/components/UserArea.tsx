import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Drawer,
  Typography,
  Divider,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { format } from 'date-fns';

function stringToColor(string: string) {
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
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initials,
  };
}

const UserAreaComponent = () => {
  const { currentUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userShifts, setUserShifts] = useState<any[]>([]);
  const [fullName, setFullName] = useState<string>('משתמש');

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

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
    const formattedStart = format(startOfMonth, 'yyyy-MM-dd');

    const q = query(
      collection(db, 'shifts'),
      where('userId', '==', currentUser.uid),
      where('date', '>=', formattedStart)
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
    const inTime = shift.clockInTime?.seconds;
    const outTime = shift.clockOutTime?.seconds;
    if (inTime && outTime) {
      const diff = (outTime - inTime) / 3600;
      return sum + diff;
    }
    return sum;
  }, 0);

  const activeShifts = userShifts.filter(s => !s.clockOutTime);

  return (
    <>
      <Box sx={{ position: 'fixed', top: 4, left: 16, zIndex: 1300 }}>
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
            width: 300,
            p: 3,
            backgroundColor: '#fffefb',
            borderRight: '1px solid #fcd34d',
            fontFamily: "'Varela Round', sans-serif",
          },
        }}
      >
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: '#78350f', fontWeight: 'bold', textAlign: 'center' }}
          >
            האזור האישי
          </Typography>
          <Divider sx={{ mb: 2, borderColor: '#fcd34d' }} />

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar {...stringAvatar(fullName)} sx={{ mx: 'auto', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ color: '#78350f', fontWeight: 'bold' }}>
              שלום, {fullName}!
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gap: 2 }}>
            {[{
              label: 'סה\"כ שעות החודש',
              value: totalHours.toFixed(1)
            }, {
              label: 'מספר משמרות',
              value: userShifts.length
            }, {
              label: 'משמרות פעילות',
              value: activeShifts.length
            }].map((stat, idx) => (
              <Paper
                key={idx}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: 2,
                  color: '#78350f',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                  {stat.value}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={openDialog}
            sx={{
              mt: 3,
              backgroundColor: '#fcd34d',
              color: '#78350f',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#fbbf24',
              },
            }}
            fullWidth
          >
            הצג את המשמרות שלי
          </Button>
        </Box>
      </Drawer>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
  <DialogTitle
    sx={{
      fontWeight: 'bold',
      color: '#78350f',
      textAlign: 'center',
      fontFamily: "'Varela Round', sans-serif",
    }}
  >
    המשמרות שלי החודש
  </DialogTitle>
  <DialogContent
    dividers
    sx={{
      fontFamily: "'Varela Round', sans-serif",
      textAlign: 'center',
    }}
  >
    {userShifts.length > 0 ? (
      <List>
        {userShifts.map((shift, index) => (
          <ListItem key={index} divider sx={{ justifyContent: 'center' }}>
            <ListItemText
              primaryTypographyProps={{
                sx: { fontWeight: 'bold', fontFamily: "'Varela Round', sans-serif", textAlign: 'center' },
              }}
              secondaryTypographyProps={{
                sx: { fontWeight: 'bold', fontFamily: "'Varela Round', sans-serif", textAlign: 'center' },
              }}
              primary={`תאריך: ${shift.date}`}
             secondary={
  shift.clockInTime && shift.clockOutTime
    ? (() => {
        const clockIn = new Date(shift.clockInTime.seconds * 1000);
        const clockOut = new Date(shift.clockOutTime.seconds * 1000);
        const diffInMs = clockOut.getTime() - clockIn.getTime();
        const hours = Math.floor(diffInMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

        return `שעות: ${format(clockIn, 'HH:mm')} - ${format(clockOut, 'HH:mm')} | משך: ${hours}:${minutes
          .toString()
          .padStart(2, '0')} שעות`;
      })()
    : 'משמרת פעילה'
}

            />
          </ListItem>
        ))}
      </List>
    ) : (
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ fontFamily: "'Varela Round', sans-serif", mt: 2 }}
      >
        אין משמרות החודש.
      </Typography>
    )}
  </DialogContent>
  <DialogActions sx={{ justifyContent: 'center' }}>
    <Button
      onClick={closeDialog}
      color="primary"
      sx={{ fontFamily: "'Varela Round', sans-serif", fontWeight: 'bold' }}
    >
      סגור
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
};

export default UserAreaComponent;
