import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/he';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AppointmentSchedule.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import dayjs from 'dayjs';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';

moment.locale('he');
const localizer = momentLocalizer(moment);

const AppointmentSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: ''
  });

  const fetchAppointments = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAppointments(data.map(app => ({
      ...app,
      start: new Date(app.date + ' ' + app.time),
      end: new Date(dayjs(app.date + ' ' + app.time).add(1, 'hour'))
    })));
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: dayjs(start).format('YYYY-MM-DD'),
      time: dayjs(start).format('HH:mm')
    });
    setSelectedEvent(null);
    setOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      name: event.name,
      email: event.email,
      phone: event.phone,
      date: dayjs(event.start).format('YYYY-MM-DD'),
      time: dayjs(event.start).format('HH:mm')
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    const { name, email, phone, date, time } = formData;
    if (selectedEvent) {
      const ref = doc(db, 'appointments', selectedEvent.id);
      await updateDoc(ref, { name, email, phone, date, time });
    } else {
      await addDoc(collection(db, 'appointments'), { name, email, phone, date, time });
    }
    fetchAppointments();
    handleClose();
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteDoc(doc(db, 'appointments', selectedEvent.id));
      fetchAppointments();
      handleClose();
    }
  };

  return (
    <div className="appointment-schedule" dir="rtl">
      <div className="schedule-header">
        <h2>יומן פגישות</h2>
      </div>
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="name"
          style={{ height: '75vh', minHeight: 650 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          defaultView="month"
          culture="he"
        />
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle>{selectedEvent ? 'עריכת פגישה' : 'פגישה חדשה'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="שם"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="אימייל"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="טלפון"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="תאריך"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
         <TextField
            margin="dense"
            label="שעה"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          {selectedEvent && (
            <Button onClick={handleDelete} color="error">
              מחק
            </Button>
          )}
          <Button onClick={handleClose}>ביטול</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedEvent ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AppointmentSchedule;
