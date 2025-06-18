import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  MenuItem // ✅ הוספת MenuItem
} from '@mui/material';

const BrideMeasurementForm = () => {
  const { brideId } = useParams();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'Measurements', brideId);
        const snap = await getDoc(docRef);
        if (snap.exists()) setFormData(snap.data());
      } catch (err) {
        console.error('שגיאה בטעינת נתונים:', err);
      }
    };
    fetchData();
  }, [brideId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? '' : Number(value) || prev[field] || ''
    }));
  };

  const handleSubmit = async () => {
    try {
      await setDoc(doc(db, 'Measurements', brideId), formData, { merge: true });
      alert('הטופס נשלח בהצלחה!');
    } catch (err) {
      console.error('שגיאה בשמירה:', err);
      alert('אירעה שגיאה בשליחה');
    }
  };

  return (
    <Box dir="rtl" sx={{ p: 4, background: '#f5f0ff', minHeight: '100vh', fontFamily: 'Heebo, sans-serif' }}>
      <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', p: 4, borderRadius: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          טופס מדידות לכלה
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* שדה בחירה מספר מדידה */}
        <TextField
          select
          label="מספר מדידה"
          fullWidth
          margin="normal"
          value={formData.measurementNumber || ''}
          onChange={(e) => handleChange('measurementNumber', e.target.value)}
          inputProps={{ dir: 'rtl', style: { textAlign: 'center' } }}
          InputLabelProps={{ shrink: true }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <MenuItem key={num} value={num}>
              מדידה #{num}
            </MenuItem>
          ))}
        </TextField>

        {/* שאר השדות */}
        {[
          { label: 'היקף חזה', field: 'bust' },
          { label: 'היקף מותניים', field: 'waist' },
          { label: 'היקף ירכיים', field: 'hips' },
          { label: 'אורך שמלה', field: 'dressLength' },
          { label: 'אורך שרוול', field: 'sleeveLength' },
          { label: 'רוחב כתפיים', field: 'shoulderWidth' },
          { label: 'היקף זרוע', field: 'armCircumference' }
        ].map(({ label, field }) => (
          <TextField
            key={field}
            label={label}
            fullWidth
            margin="normal"
            type="number"
            value={formData[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            inputProps={{ dir: 'rtl', style: { textAlign: 'center' } }}
            InputLabelProps={{ shrink: true }}
          />
        ))}

        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#8e44ad', color: 'white', '&:hover': { backgroundColor: '#732d91' } }}
            onClick={handleSubmit}
          >
            שלחי
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BrideMeasurementForm;
