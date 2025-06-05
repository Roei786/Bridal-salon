import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Button, Typography, Box, Paper } from '@mui/material';

const TheBrideCard = () => {
  const { brideId } = useParams();
  const [bride, setBride] = useState(null);

  useEffect(() => {
    const fetchBride = async () => {
      try {
        const brideRef = doc(db, 'Brides', brideId);
        const docSnap = await getDoc(brideRef);
        if (docSnap.exists()) {
          setBride(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching bride:', error);
      }
    };
    fetchBride();
  }, [brideId]);

  if (!bride) return <Typography align="center">טוען...</Typography>;

  return (
    <Box
      sx={{
        minHeight: '90vh',
        width: '95vw',
        background: 'linear-gradient(#fffbe9, #fff5d1)',
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        direction: 'rtl'
      }}
    >
      <Typography variant="h4" align="center" sx={{ color: '#6d4c41', marginBottom: '2rem' }}>
        כרטיסיית כלה
      </Typography>

      {/* פרטי כלה */}
      <Paper sx={{
        padding: 2,
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#ffffff',
        marginBottom: '2rem'
      }}>
        <Typography sx={{ color: '#6d4c41', fontWeight: 'bold', marginBottom: '0.5rem' }}>👰 שם: {bride.fullName}</Typography>
        <Typography sx={{ color: '#6d4c41', fontWeight: 'bold', marginBottom: '0.5rem' }}>📧 אימייל: {bride.email}</Typography>
        <Typography sx={{ color: '#6d4c41', fontWeight: 'bold', marginBottom: '0.5rem' }}>📞 טלפון: {bride.phoneNumber}</Typography>
        <Typography sx={{ color: '#6d4c41', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          📅 תאריך חתונה: {bride.weddingDate?.seconds ? new Date(bride.weddingDate.seconds * 1000).toLocaleDateString('he-IL') : 'לא הוזן'}
        </Typography>
        <Typography sx={{ color: '#6d4c41', fontWeight: 'bold', marginBottom: '0.5rem' }}>✂️ תופרת מלווה: {bride.assignedSeamstress}</Typography>
        <Typography sx={{ color: '#6d4c41', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          סטטוס: {bride.historyStatus === 'In Progress' ? 'בתהליך' : 'הושלם'}
        </Typography>
        <Typography sx={{ color: '#6d4c41', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          תשלום: {bride.paymentStatus ? '✔️ שילמה' : '❌ לא שילמה'}
        </Typography>
      </Paper>

      {/* תמונות */}
      <Paper sx={{
        padding: 2,
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#ffffff',
        marginBottom: '2rem'
      }}>
        <Typography sx={{ color: '#6d4c41', fontWeight: 'bold', marginBottom: 1 }}>תמונות לפני:</Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {bride.beforeImages?.map((url, idx) => (
            <img key={idx} src={url} alt="before" width="100" style={{ borderRadius: '8px' }} />
          ))}
        </Box>
        <Typography sx={{ color: '#6d4c41', fontWeight: 'bold', marginTop: 2, marginBottom: 1 }}>תמונות אחרי:</Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {bride.afterImages?.map((url, idx) => (
            <img key={idx} src={url} alt="after" width="100" style={{ borderRadius: '8px' }} />
          ))}
        </Box>
      </Paper>

      {/* כפתורים */}
      <Paper sx={{
        padding: 2,
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#ffffff'
      }}>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#a67c52',
              '&:hover': { backgroundColor: '#8b5e3c' },
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            טופס מדידות
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#a67c52',
              '&:hover': { backgroundColor: '#8b5e3c' },
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            טופס התארגנות
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#a67c52',
              '&:hover': { backgroundColor: '#8b5e3c' },
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            פגישות
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#6d4c41', // חום כהה
              '&:hover': { backgroundColor: '#4e342e' },
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            שלח תזכורת
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TheBrideCard;
