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
  TextField,
  MenuItem
} from '@mui/material';
import dayjs from 'dayjs';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs as getSubDocs
} from 'firebase/firestore';
import { db } from '../firebase';

moment.locale('he');
const localizer = momentLocalizer(moment);

const AppointmentSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [brides, setBrides] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState('week');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
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
      start: new Date(`${app.date}T${app.time}`),
      end: new Date(dayjs(`${app.date}T${app.time}`).add(1, 'hour').toISOString())
    })));
  }, []);

  const fetchBrides = useCallback(async () => {
    const snapshot = await getDocs(collection(db, 'Brides'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBrides(data);
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchBrides();
  }, [fetchAppointments, fetchBrides]);

  const handleSelectSlot = ({ start }) => {
    setFormData({
      name: '',
      title: '',
      email: '',
      date: dayjs(start).format('YYYY-MM-DD'),
      time: dayjs(start).format('HH:mm')
    });
    setSelectedEvent(null);
    setOpen(true);
  };

  const handleSelectEvent = (event) => {
    const bride = brides.find(b => b.fullName === event.name);
    setSelectedEvent(event);
    setFormData({
      name: event.name,
      title: event.title || '',
      email: bride?.email || event.email,
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
    const { name, value } = e.target;
    if (name === 'name') {
      const bride = brides.find(b => b.fullName === value);
      setFormData(prev => ({
        ...prev,
        name: value,
        email: bride?.email || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const { name, title, email, date, time } = formData;
    if (!name || !date || !time) {
      alert('יש למלא את כל השדות הנדרשים.');
      return;
    }
    const bride = brides.find(b => b.fullName === name);
    if (!bride) {
      alert('הכלה לא נמצאה במערכת.');
      return;
    }

    const newAppointment = { name, title, email, date, time };

    if (selectedEvent) {
      await updateDoc(doc(db, 'appointments', selectedEvent.id), newAppointment);
    } else {
      await addDoc(collection(db, 'appointments'), newAppointment);
      await addDoc(collection(db, `Brides/${bride.id}/appointments`), newAppointment);
    }

    fetchAppointments();
    handleClose();
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteDoc(doc(db, 'appointments', selectedEvent.id));

      const bride = brides.find(b => b.fullName === selectedEvent.name);
      if (bride) {
        const subQuery = query(
          collection(db, `Brides/${bride.id}/appointments`),
          where('date', '==', selectedEvent.date),
          where('time', '==', selectedEvent.time),
          where('email', '==', selectedEvent.email || '')
        );
        const snapshot = await getSubDocs(subQuery);
        snapshot.forEach(docSnap => deleteDoc(docSnap.ref));
      }

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
          titleAccessor={(event) => `${event.time} - ${event.name}`}
          style={{ height: '75vh', minHeight: 650 }}
          selectable
          view={currentView}
          onView={setCurrentView}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          defaultView="week"
          dayLayoutAlgorithm="no-overlap"
          culture="he"
          messages={{
            allDay: 'כל היום',
            previous: 'הקודם',
            next: 'הבא',
            today: 'היום',
            month: 'חודש',
            week: 'שבוע',
            day: 'יום',
            agenda: 'סדר יום',
            date: 'תאריך',
            time: 'שעה',
            event: 'אירוע',
            noEventsInRange: 'אין פגישות בטווח תאריכים זה.',
            showMore: total => `+ ${total} עוד`
          }}
        />
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle>{selectedEvent ? 'עריכת פגישה' : 'פגישה חדשה'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="שם הכלה"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value=""><em>בחר כלה...</em></MenuItem>
            {brides.map(bride => (
              <MenuItem key={bride.id} value={bride.fullName}>
                {bride.fullName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="כותרת"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="אימייל"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="תאריך"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="שעה"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          {selectedEvent && (
            <Button onClick={handleDelete} color="error">
              מחיקה
            </Button>
          )}
          <Button onClick={handleClose}>ביטול</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedEvent ? 'עדכון' : 'הוספה'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AppointmentSchedule;
