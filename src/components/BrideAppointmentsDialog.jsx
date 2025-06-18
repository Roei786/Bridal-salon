import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const BrideAppointmentsDialog = ({ brideId, open, onClose }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const snapshot = await getDocs(collection(db, `Brides/${brideId}/appointments`));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAppointments(data);
      } catch (err) {
        console.error('שגיאה בשליפת פגישות:', err);
      }
    };

    if (open) fetchAppointments();
  }, [brideId, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
      <DialogTitle
        sx={{
          background: '#5d3c75',
          color: '#fff',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        📖 פגישות של הכלה
      </DialogTitle>

      <DialogContent
        sx={{
          background: '#f7f3ff',
          minHeight: 200,
          textAlign: 'right', // ✅ יישור לימין כללי
        }}
      >
        {appointments.length === 0 ? (
          <Typography align="center" sx={{ mt: 3, color: '#8b5e3c', fontWeight: 500 }}>
            אין פגישות להצגה
          </Typography>
        ) : (
          <List>
            {appointments.map((appt, index) => (
              <Box key={appt.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    sx={{ textAlign: 'right' }} // ✅ מיישר את הטקסט בתוך התאים
                    primary={
                      <Typography sx={{ fontWeight: 'bold', color: '#5d3c75', textAlign: 'right' }}>
                        📅 {appt.date} בשעה {appt.time}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: '#444', textAlign: 'right' }}>
                        📝 {appt.title || 'ללא כותרת'}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < appointments.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          background: '#f2e9fc',
          justifyContent: 'center'
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#8b5e3c',
            color: '#fff',
            fontWeight: 'bold',
            px: 4,
            '&:hover': { backgroundColor: '#6f472f' }
          }}
        >
          סגור
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrideAppointmentsDialog;
