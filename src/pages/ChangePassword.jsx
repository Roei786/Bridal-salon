
import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { auth } from '../firebase';
import { updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('אין משתמש מחובר');
      await updatePassword(user, newPassword);
      setMessage('✅ הסיסמה עודכנה בהצלחה!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setMessage('❌ שגיאה: ' + error.message);
    }
  };

  return (
    <Box sx={{ padding: 4, maxWidth: 400, margin: 'auto', marginTop: 8 }}>
      <Typography variant="h5" gutterBottom>החלפת סיסמה</Typography>
      <TextField
        label="סיסמה חדשה"
        type="password"
        fullWidth
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleChangePassword}>
        עדכן סיסמה
      </Button>
      <Typography sx={{ mt: 2 }}>{message}</Typography>
    </Box>
  );
}
