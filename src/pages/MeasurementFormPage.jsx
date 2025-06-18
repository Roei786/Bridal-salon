import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from 'emailjs-com';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Paper,
  Divider
} from '@mui/material';

const MeasurementFormPage = () => {
  const { brideId } = useParams();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const measurementDoc = await getDoc(doc(db, 'Measurements', brideId));
        const brideDoc = await getDoc(doc(db, 'Brides', brideId));

        let newData = {};
        if (brideDoc.exists()) {
          const brideData = brideDoc.data();
          newData = {
            brideName: brideData.fullName || '',
            phoneNumber: brideData.phoneNumber || '',
            weddingDate: brideData.weddingDate || '',
            seamstressName: brideData.assignedSeamstress || '',
          };
        }

        if (measurementDoc.exists()) {
          setFormData({ ...measurementDoc.data(), ...newData });
        } else {
          setFormData(newData);
        }
      } catch (error) {
        console.error('שגיאה בטעינת הנתונים:', error);
      }
    };

    fetchData();
  }, [brideId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'Measurements', brideId), formData);
      alert('נשמר בהצלחה');
    } catch (error) {
      console.error('שגיאה בשמירה:', error);
    }
  };

  const handleSendForm = async () => {
    try {
      const brideDoc = await getDoc(doc(db, 'Brides', brideId));
      const brideEmail = brideDoc.exists() ? brideDoc.data().email : null;

      if (!brideEmail) {
        alert('לא נמצא אימייל של הכלה');
        return;
      }

      const formLink = `https://bridal-salon.web.app/bride-measurements/${brideId}`;

      const templateParams = {
        to_email: brideEmail,
        bride_name: formData.brideName || 'כלה יקרה',
        form_link: formLink,
      };

      await emailjs.send(
        'service_idzn0fs',
        'template_2lzl58u',
        templateParams,
        '0fzSnZp44MnYc6afv'
      );

      alert('הטופס נשלח בהצלחה!');
    } catch (err) {
      console.error('שגיאה בשליחת הטופס:', err);
      alert('אירעה שגיאה בשליחה');
    }
  };

  const fields = [
    { label: 'שם כלה', field: 'fullName' },
    { label: 'טלפון', field: 'phoneNumber' },
    { label: 'תאריך חתונה', field: 'weddingDate', type: 'date' },
    { label: 'תאריך מדידה', field: 'measurementDate', type: 'date' },
    { label: 'מספר מדידה', field: 'measurementNumber', type: 'number' },
    { label: 'תופרת', field: 'seamstressName' },
    { label: 'היקף חזה', field: 'bust', type: 'number' },
    { label: 'היקף מותניים', field: 'waist', type: 'number' },
    { label: 'היקף ירכיים', field: 'hips', type: 'number' },
    { label: 'אורך שמלה', field: 'dressLength', type: 'number' },
    { label: 'אורך שרוול', field: 'sleeveLength', type: 'number' },
    { label: 'רוחב כתפיים', field: 'shoulderWidth', type: 'number' },
    { label: 'היקף זרוע', field: 'armCircumference', type: 'number' },
    { label: 'תשלום מקדמה', field: 'depositPaid', type: 'number' },
    { label: 'האם נמסר צ\'ק מקדמה', field: 'depositCheck', type: 'boolean', labelPlacement: 'start' },
    { label: 'עלות תיקונים', field: 'fixCost', type: 'number' },
    { label: 'פירוט תיקונים', field: 'fixDescription' },
    { label: 'תשלום סופי הושלם', field: 'finalPaymentCompleted', type: 'boolean', labelPlacement: 'start' },
  ];

  return (
    <Box dir="rtl" sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #e6d5f7, #f9f3ff)', p: '3rem', fontFamily: 'Heebo, sans-serif' }}>
      <Paper elevation={3} sx={{ maxWidth: '900px', margin: '0 auto', p: 4, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          טופס מדידות
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {fields.map(({ label, field, type }) => (
          type === 'boolean' ? (
            <FormControlLabel
              key={field}
              control={
                <Switch
                  checked={Boolean(formData[field])}
                  onChange={(e) => handleChange(field, e.target.checked)}
                  color="primary"
                />
              }
              label={label}
              sx={{ display: 'block', mb: 2 }}
            />
          ) : (
            <Box key={field} sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {label}
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                type={type || 'text'}
                value={
                  type === 'date' && formData[field]?.seconds
                    ? new Date(formData[field].seconds * 1000).toISOString().split('T')[0]
                    : formData[field] || ''
                }
                onChange={(e) =>
                  handleChange(
                    field,
                    type === 'number'
                      ? Number(e.target.value)
                      : type === 'date'
                      ? new Date(e.target.value)
                      : e.target.value
                  )
                }
                inputProps={{ style: { textAlign: 'center' } }}
              />
            </Box>
          )
        ))}

        <Box mt={4} display="flex" flexDirection="row-reverse" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={handleSave}>
            שמור
          </Button>
          <Button
            variant="contained"
            onClick={handleSendForm}
            sx={{
              backgroundColor: '#9c27b0',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#7b1fa2' }
            }}
          >
            שלחי טופס לכלה
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MeasurementFormPage;
