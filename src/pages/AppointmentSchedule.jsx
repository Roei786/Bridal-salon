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
  doc
} from 'firebase/firestore';
import { db } from '../firebase';


moment.locale('he');
const localizer = momentLocalizer(moment);

const AppointmentSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [brides, setBrides] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', // This will hold bride.fullName
    title: '', // Added for appointment title
    email: '',
    date: '',
    time: ''
  });

  // Fetches appointments from Firebase and formats them for react-big-calendar
  const fetchAppointments = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAppointments(data.map(app => ({
      ...app,
      start: new Date(app.date + ' ' + app.time),
      end: new Date(dayjs(app.date + ' ' + app.time).add(1, 'hour')),
    })));
  }, []);

  // Fetches brides from Firebase
  const fetchBrides = useCallback(async () => {
    // IMPORTANT: Ensure 'Brides' matches your Firestore collection name exactly (case-sensitive)
    const snapshot = await getDocs(collection(db, 'Brides'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBrides(data);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchAppointments();
    fetchBrides();
  }, [fetchAppointments, fetchBrides]);

  // Handles clicking on an empty slot in the calendar to create a new appointment
  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setFormData({
      name: '', // Initialize with empty bride selection
      title: '',
      email: '',
      date: dayjs(start).format('YYYY-MM-DD'), // Pre-fill date from selected slot
      time: dayjs(start).format('HH:mm')      // Pre-fill time from selected slot (e.g., 00:00 or specific hour)
    });
    setSelectedEvent(null); // Clear any previously selected event
    setOpen(true); // Open the dialog
  };

  // Handles clicking on an existing event in the calendar to edit it
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    // Try to find the bride object from the fetched brides list
    // This helps ensure the email is consistent with the currently available bride data
    const brideForEvent = brides.find(b => b.fullName === event.name);

    setFormData({
      name: event.name, // The name stored in the appointment (should match a bride.fullName)
      title: event.title || '', // Use existing title or empty string
      // Use email from found bride, otherwise fall back to the event's stored email
      email: brideForEvent ? brideForEvent.email : event.email,
      date: dayjs(event.start).format('YYYY-MM-DD'), // Extract date from event start
      time: dayjs(event.start).format('HH:mm')      // Extract time from event start
    });
    setOpen(true); // Open the dialog
  };

  // Closes the appointment dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null); // Clear selected event on close
  };

  // Handles changes in form fields (for both text inputs and the select dropdown)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      // If the 'name' (bride) field is changed, find the selected bride
      const selectedBride = brides.find(b => b.fullName === value);
      setFormData(prev => ({
        ...prev,
        name: value, // Update the selected bride's full name
        email: selectedBride?.email || '' // Auto-fill email if bride found, otherwise clear
      }));
    } else {
      // For other fields, update directly
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handles submitting the form (add new or update existing appointment)
  const handleSubmit = async () => {
    const { name, title, email, date, time } = formData;

    // Basic client-side validation
    if (!name || !date || !time) {
      alert('יש למלא את כל השדות הנדרשים.');
      return;
    }

    if (selectedEvent) {
      // Update existing appointment
      const ref = doc(db, 'appointments', selectedEvent.id);
      await updateDoc(ref, { name, title, email, date, time });
    } else {
      // Add new appointment
      await addDoc(collection(db, 'appointments'), { name, title, email, date, time });
    }
    fetchAppointments(); // Re-fetch appointments to update the calendar display
    handleClose(); // Close the dialog
  };

  // Handles deleting an appointment
  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteDoc(doc(db, 'appointments', selectedEvent.id));
      fetchAppointments(); // Re-fetch appointments to update the calendar display
      handleClose(); // Close the dialog
    }
  };

  return (
    <div className="appointment-schedule" dir="rtl">
      <div className="schedule-header">
        <h2>יומן פגישות</h2> {/* Appointment Calendar heading */}
      </div>
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          // Custom title accessor to display time and bride name
          titleAccessor={(event) => {
            const displayTime = event.time ? event.time : '';
            return `${displayTime} - ${event.name}`; // Example: "14:30 - Jane Doe"
          }}
          style={{ height: '75vh', minHeight: 650 }}
          selectable // Allows selecting time slots
          onSelectSlot={handleSelectSlot} // Handler for selecting empty slots
          onSelectEvent={handleSelectEvent} // Handler for selecting existing events
          views={['month', 'week', 'day']} // Available calendar views
          defaultView="month" // Default view when calendar loads
          culture="he" // Set calendar culture to Hebrew
          messages={{
            allDay: 'כל היום',       // "All Day" label for events
            previous: 'הקודם',       // "Previous" navigation button
            next: 'הבא',             // "Next" navigation button
            today: 'נוכחי',         // "Current" navigation button
            month: 'חודש',         // "Month" view button
            week: 'שבוע',          // "Week" view button
            day: 'יום',            // "Day" view button
            agenda: 'סדר יום',      // "Agenda" view button (if enabled in 'views')
            date: 'תאריך',         // Column header for date in Agenda view
            time: 'שעה',           // Column header for time in Agenda view
            event: 'אירוע',         // Column header for event in Agenda view
            noEventsInRange: 'אין פגישות בטווח תאריכים זה.', // Message for no events
            showMore: total => `+ ${total} עוד` // Text for "show more" events in month view
          }}
        />
      </div>

      {/* Appointment Dialog (for New or Edit) */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth dir="rtl">
        <DialogTitle>{selectedEvent ? 'עריכת פגישה' : 'פגישה חדשה'}</DialogTitle> {/* Edit or New Appointment title */}
        <DialogContent>
          {/* Bride Name Selection (Dropdown) */}
          <TextField
            select // Makes it a select dropdown
            margin="dense"
            label="שם הכלה" // Label: Bride Name
            name="name"
            value={formData.name} // Binds to formData.name state
            onChange={handleChange} // Calls handleChange on selection
            fullWidth
            required // Mark as required
            InputLabelProps={{ shrink: true }} // Helps prevent label overlap
          >
            {/* Optional: Add a blank option for better UX */}
            <MenuItem value="">
              <em>בחר כלה...</em> {/* Select a bride... */}
            </MenuItem>
            {brides.map((bride) => (
              <MenuItem key={bride.id} value={bride.fullName}>
                {bride.fullName}
              </MenuItem>
            ))}
          </TextField>

          {/* Appointment Title Text Field */}
          <TextField
            margin="dense"
            label="כותרת" // Label: Title
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* Email Text Field (can be auto-filled from bride selection) */}
          <TextField
            margin="dense"
            label="אימייל" // Label: Email
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            // You can make this readOnly if it should always be tied to the selected bride:
            // InputProps={{ readOnly: !!formData.name }}
          />

          {/* Date Picker Field */}
          <TextField
            margin="dense"
            label="תאריך" // Label: Date
            name="date"
            type="date" // HTML5 date input type
            value={formData.date}
            onChange={handleChange}
            fullWidth
            required // Mark as required
            InputLabelProps={{ shrink: true }} // Ensures label is always visible for date/time types
          />

          {/* Time Picker Field */}
          <TextField
            margin="dense"
            label="שעה" // Label: Time
            name="time"
            type="time" // HTML5 time input type
            value={formData.time}
            onChange={handleChange}
            fullWidth
            required // Mark as required
            InputLabelProps={{ shrink: true }} // Ensures label is always visible for date/time types
          />
        </DialogContent>
        <DialogActions>
          {selectedEvent && ( // Show delete button only if editing an existing event
            <Button onClick={handleDelete} color="error">
              מחיקה {/* Delete */}
            </Button>
          )}
          <Button onClick={handleClose}>ביטול</Button> {/* Cancel */}
          <Button onClick={handleSubmit} variant="contained">
            {selectedEvent ? 'עדכון' : 'הוספה'} {/* Update or Add */}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AppointmentSchedule;