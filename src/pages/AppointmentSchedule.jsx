import React, { useEffect, useState } from "react";
import {
  Container, Typography, TextField, MenuItem, Button,
  Card, CardContent, Stack, Table, TableHead, TableRow, TableCell, TableBody, IconButton
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const types = ["התאמה", "מדידה ראשונה", "פגישה כללית"];
const statuses = ["מתוכנן", "הושלם", "בוטל"];

export default function AppointmentSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    name: "",
    type: "",
    time: dayjs(),
    notes: "",
    status: "מתוכנן",
  });

  // Track which appointment is currently being edited, store the edited data here
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchAppointments = async () => {
      const snapshot = await getDocs(collection(db, "appointments"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    };
    fetchAppointments();
  }, []);

  // Handle input change for new appointment form
  const handleChange = (field) => (event) => {
    setNewAppointment({ ...newAppointment, [field]: event.target.value });
  };

  const handleDateChange = (newValue) => {
    setNewAppointment({ ...newAppointment, time: newValue });
  };

  // Add new appointment to Firestore & local state
  const handleAddAppointment = async () => {
    const { name, type, time, notes, status } = newAppointment;

    if (name && type && time) {
      const appointmentData = {
        name,
        date: dayjs(time).format("YYYY-MM-DD"),
        type,
        notes,
        status,
      };

      try {
        const docRef = await addDoc(collection(db, "appointments"), appointmentData);
        setAppointments([...appointments, { ...appointmentData, id: docRef.id }]);
        setNewAppointment({
          name: "",
          type: "",
          time: dayjs(),
          notes: "",
          status: "מתוכנן",
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  // Start editing an appointment
  const handleEditClick = (appt) => {
    setEditId(appt.id);
    setEditData({
      name: appt.name || "",
      type: appt.type || "",
      time: dayjs(appt.date),
      notes: appt.notes || "",
      status: appt.status || "מתוכנן",
    });
  };

  // Handle changes while editing
  const handleEditChange = (field) => (event) => {
    setEditData({ ...editData, [field]: event.target.value });
  };

  const handleEditDateChange = (newValue) => {
    setEditData({ ...editData, time: newValue });
  };

  // Save edited appointment to Firestore & local state
  const handleSaveEdit = async () => {
    if (!editId) return;

    const updatedData = {
      name: editData.name,
      date: dayjs(editData.time).format("YYYY-MM-DD"),
      type: editData.type,
      notes: editData.notes,
      status: editData.status,
    };

    try {
      const docRef = doc(db, "appointments", editId);
      await updateDoc(docRef, updatedData);

      setAppointments(appointments.map(appt => appt.id === editId ? { id: editId, ...updatedData } : appt));
      setEditId(null);
      setEditData({});
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  // Delete appointment from Firestore & local state
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "appointments", id));
      setAppointments(appointments.filter(appt => appt.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ py: 4, background: 'linear-gradient(#fffbe9, #fff5d1)', borderRadius: 2 }}>
        <Typography variant="h4" color="#BC8C61" gutterBottom>
          יומן פגישות
        </Typography>

        {/* Existing Appointments Table */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" color="#BC8C61" gutterBottom>
              פגישות קיימות
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>שם</TableCell>
                  <TableCell>סוג</TableCell>
                  <TableCell>תאריך</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>הערות</TableCell>
                  <TableCell align="center">פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    {editId === appt.id ? (
                      <>
                        <TableCell>
                          <TextField
                            value={editData.name}
                            onChange={handleEditChange("name")}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            value={editData.type}
                            onChange={handleEditChange("type")}
                            size="small"
                          >
                            {types.map((type, idx) => (
                              <MenuItem key={idx} value={type}>{type}</MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <DateTimePicker
                            value={editData.time}
                            onChange={handleEditDateChange}
                            slotProps={{ textField: { size: "small" } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            value={editData.status}
                            onChange={handleEditChange("status")}
                            size="small"
                          >
                            {statuses.map((s, idx) => (
                              <MenuItem key={idx} value={s}>{s}</MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={editData.notes}
                            onChange={handleEditChange("notes")}
                            size="small"
                            multiline
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={handleSaveEdit} color="success" title="שמור">
                            <SaveIcon />
                          </IconButton>
                          <IconButton onClick={handleCancelEdit} color="error" title="בטל">
                            <CancelIcon />
                          </IconButton>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{appt.name || "-"}</TableCell>
                        <TableCell>{appt.type}</TableCell>
                        <TableCell>{appt.date}</TableCell>
                        <TableCell>{appt.status}</TableCell>
                        <TableCell>{appt.notes}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleEditClick(appt)} title="עריכת פגישה">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(appt.id)} color="error" title="מחיקת פגישה">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add New Appointment Form */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="שם הלקוחה"
                variant="outlined"
                value={newAppointment.name}
                onChange={handleChange("name")}
                fullWidth
              />
              <TextField
                select
                label="סוג פגישה"
                value={newAppointment.type}
                onChange={handleChange("type")}
                fullWidth
              >
                {types.map((type, idx) => (
                  <MenuItem key={idx} value={type}>{type}</MenuItem>
                ))}
              </TextField>
              <DateTimePicker
                label="תאריך ושעה"
                value={newAppointment.time}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TextField
                label="הערות"
                variant="outlined"
                value={newAppointment.notes}
                onChange={handleChange("notes")}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                select
                label="סטטוס"
                value={newAppointment.status}
                onChange={handleChange("status")}
                fullWidth
              >
                {statuses.map((s, idx) => (
                  <MenuItem key={idx} value={s}>{s}</MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={handleAddAppointment} sx={{ bgcolor: '#BC8C61' }}>
                הוסף פגישה
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </LocalizationProvider>
  );
}
