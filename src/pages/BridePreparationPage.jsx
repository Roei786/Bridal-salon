import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
  Button
} from '@mui/material';

const BridePreparationPage = () => {
  const { brideId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    makeupConfirmed: false,
    makeupName: '',
    hairStylingConfirmed: false,
    hairName: '',
    breakfastOrdered: false,
    salonCleaningConfirmed: false,
    notes: ''
  });

  const [brideName, setBrideName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brideSnap = await getDoc(doc(db, 'Brides', brideId));
        if (brideSnap.exists()) {
          setBrideName(brideSnap.data().fullName || '');
        }

        const formSnap = await getDoc(doc(db, 'PreparationForms', brideId));
        if (formSnap.exists()) {
          setFormData(formSnap.data());
        }
      } catch (err) {
        console.error('שגיאה בטעינה:', err);
      }
    };
    fetchData();
  }, [brideId]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'PreparationForms', brideId), formData, { merge: true });
      alert('הטופס נשמר בהצלחה!');
    } catch (err) {
      console.error('שגיאה בשמירה:', err);
      alert('אירעה שגיאה');
    }
  };

  return (
    <Box dir="rtl" sx={{ p: 4, background: 'linear-gradient(to bottom, #f4e9ff, #ffffff)', minHeight: '100vh', fontFamily: 'Heebo, sans-serif' }}>
      <Paper elevation={4} sx={{ maxWidth: 750, mx: 'auto', p: 5, borderRadius: 5, background: '#fffdfd' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#7a3e9d' }}>
          טופס התארגנות לכלה: {brideName}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          {/* מאפרת */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.makeupConfirmed}
                onChange={handleChange}
                name="makeupConfirmed"
                sx={{ color: '#8e44ad' }}
              />
            }
            label="מאפרת נקבעה"
            sx={{ mb: 2 }}
          />
          {formData.makeupConfirmed && (
            <TextField
              fullWidth
              margin="dense"
              label="שם המאפרת"
              name="makeupName"
              value={formData.makeupName}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />
          )}

          {/* מעצבת שיער */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hairStylingConfirmed}
                onChange={handleChange}
                name="hairStylingConfirmed"
                sx={{ color: '#8e44ad' }}
              />
            }
            label="מעצבת שיער נקבעה"
            sx={{ mb: 2 }}
          />
          {formData.hairStylingConfirmed && (
            <TextField
              fullWidth
              margin="dense"
              label="שם מעצבת השיער"
              name="hairName"
              value={formData.hairName}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />
          )}

          {/* ארוחת בוקר */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.breakfastOrdered}
                onChange={handleChange}
                name="breakfastOrdered"
                sx={{ color: '#8e44ad' }}
              />
            }
            label="ארוחת בוקר תואמה"
            sx={{ mb: 2 }}
          />

          {/* סלון נקי */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.salonCleaningConfirmed}
                onChange={handleChange}
                name="salonCleaningConfirmed"
                sx={{ color: '#8e44ad' }}
              />
            }
            label="הסלון נקי ליום ההגעה"
            sx={{ mb: 3 }}
          />

          {/* הערות */}
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            הערות נוספות:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="כאן ניתן להוסיף הערות כלליות..."
            sx={{ mb: 4 }}
          />

          {/* כפתורים */}
          <Box display="flex" justifyContent="center" gap={3}>
            <Button
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: '#8e44ad',
                color: 'white',
                fontSize: '1.1rem',
                px: 4,
                '&:hover': { backgroundColor: '#6c3483' }
              }}
            >
              שמירה
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/brides/${brideId}`)}
              sx={{
                fontSize: '1.1rem',
                px: 4,
                borderColor: '#8e44ad',
                color: '#8e44ad',
                '&:hover': { backgroundColor: '#f2e6ff' }
              }}
            >
              חזרה
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default BridePreparationPage;
