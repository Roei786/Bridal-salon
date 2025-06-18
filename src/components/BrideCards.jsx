import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Checkbox, IconButton, Box
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc, getDocs as getSubDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const BrideCards = () => {
  const [brides, setBrides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterHistory, setFilterHistory] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBrides, setSelectedBrides] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    assignedSeamstress: '',
    weddingDate: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchBrides();
  }, []);

  const fetchBrides = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Brides'));
      const bridesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBrides(bridesData);
    } catch (error) {
      console.error('Error fetching brides:', error);
    }
  };

  const deleteSubcollections = async (brideId) => {
    const subcollections = ['appointments', 'measurements', 'preparationForm'];
    await Promise.all(subcollections.map(async (subCol) => {
      const subColRef = collection(db, `Brides/${brideId}/${subCol}`);
      const subDocsSnap = await getSubDocs(subColRef);
      await Promise.all(subDocsSnap.docs.map(docSnap => deleteDoc(docSnap.ref)));
    }));
  };

  const handleAddBride = async () => {
    try {
      const newBride = {
        ...formData,
        paymentStatus: false,
        historyStatus: 'In Progress',
        createdAt: new Date(),
        weddingDate: formData.weddingDate ? new Date(formData.weddingDate) : null,
        beforeImages: [],
        afterImages: []
      };

      const docRef = await addDoc(collection(db, 'Brides'), newBride);

      await setDoc(doc(db, `Brides/${docRef.id}/appointments/init`), { created: true });

      await setDoc(doc(db, `Brides/${docRef.id}/preparationForm/form`), {
        makeupConfirmed: false,
        hairStylingConfirmed: false,
        breakfastOrdered: false,
        salonCleaningConfirmed: false,
        notes: '',
        created: true
      });

      await setDoc(doc(db, `Brides/${docRef.id}/measurements/${docRef.id}`), {
        brideName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        weddingDate: formData.weddingDate ? new Date(formData.weddingDate) : null,
        seamstressName: formData.assignedSeamstress,
        measurementDate: null,
        measurementNumber: 1,
        bust: null,
        waist: null,
        hips: null,
        dressLength: null,
        sleeveLength: null,
        shoulderWidth: null,
        armCircumference: null,
        depositPaid: 0,
        depositCheck: false,
        fixCost: 0,
        fixDescription: '',
        finalPaymentCompleted: false
      });

      setBrides(prev => [...prev, { id: docRef.id, ...newBride }]);
      setOpenDialog(false);
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        assignedSeamstress: '',
        weddingDate: ''
      });
    } catch (error) {
      console.error('שגיאה בהוספת כלה:', error);
    }
  };

  const handleSelectBride = (id) => {
    setSelectedBrides(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleDeleteBride = async (id) => {
    try {
      await deleteSubcollections(id);
      await deleteDoc(doc(db, 'Brides', id));
      setBrides(prev => prev.filter(bride => bride.id !== id));
    } catch (error) {
      console.error('שגיאה במחיקת כלה:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedBrides.map(async (id) => {
        await deleteSubcollections(id);
        await deleteDoc(doc(db, 'Brides', id));
      }));
      setBrides(prev => prev.filter(bride => !selectedBrides.includes(bride.id)));
      setSelectedBrides([]);
    } catch (error) {
      console.error('שגיאה במחיקת כלות נבחרות:', error);
    }
  };
  
  const filteredBrides = brides.filter(bride =>
    bride.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterPayment === '' || (filterPayment === 'paid' && bride.paymentStatus === true) || (filterPayment === 'unpaid' && bride.paymentStatus === false)) &&
    (filterHistory === '' || bride.historyStatus === filterHistory)
  );

return (
  <div style={{
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: 'linear-gradient(#fffbe9, #fff5d1)',
    padding: '2rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <h2 style={{ textAlign: 'center', color: '#6d4c41', marginBottom: '2rem', fontSize: '2rem' }}>רשימת כלות</h2>

    {/* חיפוש */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <button onClick={() => setSearchTerm(searchTerm.trim())}
        style={{
          backgroundColor: '#a67c52', color: 'white', fontWeight: 'bold',
          border: 'none', borderRadius: '8px', padding: '0.75rem 1.25rem', fontSize: '1rem', cursor: 'pointer'
        }}>
        חפש
      </button>
      <input type="text" placeholder="חפש לפי שם כלה" value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)} dir="rtl"
        style={{
          backgroundColor: 'white', color: '#6d4c41',
          padding: '0.75rem', fontSize: '1rem',
          border: '2px solid #a67c52', borderRadius: '8px', minWidth: '200px'
        }} />
    </div>

    {/* סינון */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}
        style={{
          backgroundColor: '#6d4c41', padding: '0.75rem',
          fontSize: '1rem', borderRadius: '8px', border: '2px solid #a67c52'
        }}>
        <option value="">סטטוס תשלום</option>
        <option value="paid">שילמו</option>
        <option value="unpaid">לא שילמו</option>
      </select>
      <select value={filterHistory} onChange={(e) => setFilterHistory(e.target.value)}
        style={{
          backgroundColor: '#6d4c41', padding: '0.75rem',
          fontSize: '1rem', borderRadius: '8px', border: '2px solid #a67c52'
        }}>
        <option value="">סטטוס כלה</option>
        <option value="In Progress">בתהליך</option>
        <option value="Completed">סיימו</option>
      </select>
    </div>

   {/* כפתורי פעולה */}
<Box sx={{ maxWidth: '1000px', width: '100%', margin: '0 auto 1rem auto' }}>
  {/* כפתור הוספה - ממורכז */}
  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
    <Button
      variant="contained"
      onClick={() => setOpenDialog(true)}
      sx={{
        backgroundColor: '#6d4c41',
        '&:hover': { backgroundColor: '#4e342e' },
        fontWeight: 'bold',
        color: 'white',
        fontSize: '1rem',
        borderRadius: '8px',
        padding: '0.75rem 1.5rem'
      }}
    >
      ➕ הוספת כלה
    </Button>
  </Box>

  {/* כפתור מחיקה - יישור לימין מוחלט */}
  {selectedBrides.length > 0 && (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={handleDeleteSelected}
        sx={{
          fontWeight: 'bold',
          px: 1.5,
          py: 0.5,
          fontSize: '0.875rem'
        }}
      >
        🗑️ מחיקת כלות נבחרות
      </Button>
    </Box>
  )}
</Box>


    {/* סיכום כמות כלות */}
    <div style={{
      textAlign: 'right',
      fontSize: '0.9rem',
      color: '#6d4c41',
      margin: '0 auto 0.25rem auto',
      maxWidth: '1000px',
      paddingInline: '1rem'
    }}>
      מספר כלות: {filteredBrides.length}
    </div>

      {/* טבלה בתוך Box עם scrollbar מעוצב */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          borderRadius: '16px',
          overflowY: 'scroll',
          maxHeight: '500px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c0a98f',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#a67c52',
          }
        }}
      >
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table dir="rtl" sx={{ minWidth: 700, backgroundColor: "#fff" }} aria-label="bride table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e0c097" }}>
                <TableCell />
                <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>שם מלא</TableCell>
                <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>אימייל</TableCell>
                <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>טלפון</TableCell>
                <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>סטטוס תהליך</TableCell>
                <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>סטטוס תשלום</TableCell>
                <TableCell align="right" />
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBrides.map((bride) => (
                <TableRow key={bride.id} sx={{ '&:hover': { backgroundColor: '#fcefd6' } }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedBrides.includes(bride.id)}
                      onChange={() => handleSelectBride(bride.id)}
                    />
                  </TableCell>
                  <TableCell align="right">{bride.fullName}</TableCell>
                  <TableCell align="right">{bride.email}</TableCell>
                  <TableCell align="right">{bride.phoneNumber}</TableCell>
                  <TableCell align="right">{bride.historyStatus === 'Completed' ? 'סיימה' : 'בתהליך'}</TableCell>
                  <TableCell align="right">{bride.paymentStatus ? 'שילמה' : 'לא שילמה'}</TableCell>
                  <TableCell align="right">
                    <Button variant="contained" sx={{
                      backgroundColor: "#a67c52", '&:hover': { backgroundColor: "#8b5e3c" },
                      fontWeight: 'bold'
                    }}
                      onClick={() => navigate(`/brides/${bride.id}`)}>הצג</Button>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleDeleteBride(bride.id)}><DeleteIcon color="error" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* דיאלוג הוספה */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} dir="rtl">
        <DialogTitle>הוספת כלה חדשה</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="שם מלא" variant="outlined" margin="dense"
            value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          <TextField fullWidth label="אימייל" variant="outlined" margin="dense"
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <TextField fullWidth label="טלפון" variant="outlined" margin="dense"
            value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
          <TextField fullWidth label="תופרת מלווה" variant="outlined" margin="dense"
            value={formData.assignedSeamstress} onChange={(e) => setFormData({ ...formData, assignedSeamstress: e.target.value })} />
          <TextField fullWidth label="תאריך חתונה" variant="outlined" margin="dense" type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.weddingDate}
            onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleAddBride}>הוספה</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BrideCards;