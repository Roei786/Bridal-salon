// NOTE: Using Base64 instead of Firebase Storage
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Button, Typography, Box, Paper, Divider, TextField, IconButton, MenuItem, FormControlLabel, Switch
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import BrideAppointmentsDialog from './BrideAppointmentsDialog';

const TheBrideCard = () => {
  const { brideId } = useParams();
  const navigate = useNavigate();
  const [bride, setBride] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedBride, setEditedBride] = useState({});
  const [hoveredType, setHoveredType] = useState(null);
  const [appointmentsOpen, setAppointmentsOpen] = useState(false);

  useEffect(() => {
    const fetchBride = async () => {
      try {
        const brideRef = doc(db, 'Brides', brideId);
        const docSnap = await getDoc(brideRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBride(data);
          setEditedBride({
            fullName: data.fullName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            assignedSeamstress: data.assignedSeamstress || '',
            weddingDate: data.weddingDate?.seconds ? new Date(data.weddingDate.seconds * 1000) : '',
            historyStatus: data.historyStatus || 'In Progress',
            paymentStatus: data.paymentStatus ?? false
          });
        }
      } catch (error) {
        console.error('Error fetching bride:', error);
      }
    };
    fetchBride();
  }, [brideId]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          await updateDoc(doc(db, 'Brides', brideId), {
            [`${type}Images`]: [base64Image]
          });
          const updatedSnap = await getDoc(doc(db, 'Brides', brideId));
          setBride(updatedSnap.data());
        } catch (err) {
          console.error('Error saving image as base64:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async (type) => {
    try {
      await updateDoc(doc(db, 'Brides', brideId), {
        [`${type}Images`]: []
      });
      const updatedSnap = await getDoc(doc(db, 'Brides', brideId));
      setBride(updatedSnap.data());
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleEditChange = (field, value) => {
    setEditedBride(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const brideRef = doc(db, 'Brides', brideId);
      await updateDoc(brideRef, {
        ...editedBride,
        weddingDate: editedBride.weddingDate instanceof Date && !isNaN(editedBride.weddingDate)
          ? Timestamp.fromDate(editedBride.weddingDate)
          : editedBride.weddingDate
      });
      const updatedSnap = await getDoc(brideRef);
      setBride(updatedSnap.data());
      setEditMode(false);
    } catch (error) {
      console.error('Error updating bride:', error);
    }
  };

  if (!bride) return <Typography align="center">טוען...</Typography>;

  return (
    <Box sx={{ minHeight: '90vh', width: '95vw', background: 'linear-gradient(to bottom, #e6d5f7, #f9f3ff)', padding: '2rem', fontFamily: 'Heebo, sans-serif', direction: 'rtl' }}>
      {editMode ? (
        <TextField
          label="שם כלה"
          value={editedBride.fullName || ''}
          onChange={(e) => handleEditChange('fullName', e.target.value)}
          fullWidth
          sx={{ maxWidth: 400, mx: 'auto', mb: 3, '& .MuiInputBase-input': { fontSize: '2rem', textAlign: 'center' }, '& .MuiInputLabel-root': { fontSize: '1.2rem' } }}
          InputLabelProps={{ shrink: true }}
        />
      ) : (
        <Typography variant="h3" align="center" sx={{ color: '#5d3c75', mb: 3 }}>
          {bride.fullName} 💍
        </Typography>
      )}

      <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
        {/* מידע על הכלה */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: '20px', width: '400px', height: '300px', background: '#fffefc', position: 'relative' }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: '1.2rem' }}>מידע על הכלה</Typography>
          <Divider sx={{ mb: 2 }} />

          {editMode ? (
            <Box sx={{ fontSize: '1rem', maxHeight: '220px', overflowY: 'auto' }}>
              <TextField label="אימייל" fullWidth margin="dense" value={editedBride.email || ''} onChange={(e) => handleEditChange('email', e.target.value)} />
              <TextField label="טלפון" fullWidth margin="dense" value={editedBride.phoneNumber || ''} onChange={(e) => handleEditChange('phoneNumber', e.target.value)} />
              <TextField label="תופרת" fullWidth margin="dense" value={editedBride.assignedSeamstress || ''} onChange={(e) => handleEditChange('assignedSeamstress', e.target.value)} />
              <TextField
                label="תאריך חתונה"
                type="date"
                fullWidth
                margin="dense"
                InputLabelProps={{ shrink: true }}
                value={editedBride.weddingDate instanceof Date ? editedBride.weddingDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleEditChange('weddingDate', new Date(e.target.value))}
              />
              <TextField
                select
                label="סטטוס כלה"
                fullWidth
                margin="dense"
                value={editedBride.historyStatus || ''}
                onChange={(e) => handleEditChange('historyStatus', e.target.value)}
              >
                <MenuItem value="In Progress">בתהליך</MenuItem>
                <MenuItem value="Completed">הושלם</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(editedBride.paymentStatus)}
                    onChange={(e) => handleEditChange('paymentStatus', e.target.checked)}
                    color="success"
                  />
                }
                label="שילמה"
                labelPlacement="start"
                sx={{ mt: 1 }}
              />
            </Box>
          ) : (
            <Box sx={{ fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Typography sx={{ fontSize: '1.1rem' }}><b>שם כלה:</b> {bride.fullName}</Typography>
              <Typography sx={{ fontSize: '1.1rem' }}><b>אימייל:</b> {bride.email}</Typography>
              <Typography sx={{ fontSize: '1.1rem' }}><b>טלפון:</b> {bride.phoneNumber}</Typography>
              <Typography sx={{ fontSize: '1.1rem' }}><b>תופרת:</b> {bride.assignedSeamstress}</Typography>
              <Typography sx={{ fontSize: '1.1rem' }}><b>תאריך חתונה:</b> {bride.weddingDate?.seconds ? new Date(bride.weddingDate.seconds * 1000).toLocaleDateString('he-IL') : 'לא הוזן'}</Typography>
              <Typography sx={{ fontSize: '1.1rem' }}><b>סטטוס כלה:</b> {bride.historyStatus === 'In Progress' ? 'בתהליך' : 'הושלם'}</Typography>
              <Typography sx={{ fontSize: '1.1rem' }}><b>תשלום:</b> {bride.paymentStatus ? '✔️ שילמה' : '❌ לא שילמה'}</Typography>
            </Box>
          )}

          <IconButton
            sx={{ position: 'absolute', top: 10, left: 10 }}
            color="primary"
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
          >
            {editMode ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </Paper>

        {/* קופסת לפני ואחרי */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: '20px', background: '#fffefc', width: 400, height: '300px' }}>
          <Typography variant="h6" align="center" gutterBottom>לפני ואחרי</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" flexDirection="row" justifyContent="space-around" gap={2}>
            {['before', 'after'].map((type) => (
              <Box key={type} textAlign="center">
                <Typography sx={{ mb: 1 }}>{type === 'before' ? 'לפני' : 'אחרי'}</Typography>
                {(bride[`${type}Images`] && bride[`${type}Images`][0]) ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: 160,
                      height: 160,
                      mb: 2,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '2px solid #ddd'
                    }}
                    onMouseEnter={() => setHoveredType(`${type}-0`)}
                    onMouseLeave={() => setHoveredType(null)}
                  >
                    <img
                      src={bride[`${type}Images`][0]}
                      alt={`${type}-0`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {hoveredType === `${type}-0` && (
                      <IconButton
                        onClick={() => handleDeleteImage(type)}
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          backgroundColor: 'rgba(255,255,255,0.7)'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ) : (
                  <Box
                    component="label"
                    sx={{
                      width: 160,
                      height: 160,
                      borderRadius: 2,
                      border: '2px dashed #ccc',
                      cursor: 'pointer',
                      backgroundColor: '#f9f9f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography color="textSecondary">➕</Typography>
                    <input type="file" hidden onChange={(e) => handleImageUpload(e, type)} />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* כפתורים */}
      <Paper elevation={3} sx={{ mt: 4, p: 2, borderRadius: '20px', background: '#fffefc' }}>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          <Button variant="contained" sx={{ background: '#8b5e3c', color: '#fff', fontWeight: 'bold' }} onClick={() => navigate(`/measurements/${brideId}`)}>טופס מדידות</Button>
          <Button variant="contained" sx={{ background: '#8b5e3c', color: '#fff', fontWeight: 'bold' }} onClick={() => navigate(`/bride-preparation/${brideId}`)}>טופס התארגנות</Button>
          <Button variant="contained" sx={{ background: '#8b5e3c', color: '#fff', fontWeight: 'bold' }} onClick={() => setAppointmentsOpen(true)}>פגישות</Button>
          <Button variant="contained" sx={{ background: '#5d3c75', color: '#fff', fontWeight: 'bold' }}>שלח תזכורת</Button>
        </Box>
      </Paper>

      <BrideAppointmentsDialog brideId={brideId} open={appointmentsOpen} onClose={() => setAppointmentsOpen(false)} />
    </Box>
  );
};

export default TheBrideCard;
