import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Checkbox, IconButton
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
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

      const subCollections = ['payments', 'appointments', 'measurements'];
      await Promise.all(
        subCollections.map(col =>
          setDoc(doc(db, `Brides/${docRef.id}/${col}/init`), { created: true })
        )
      );

      await setDoc(doc(db, `Brides/${docRef.id}/preparationForm/form`), {
        makeupConfirmed: false,
        hairStylingConfirmed: false,
        breakfastOrdered: false,
        salonCleaningConfirmed: false,
        notes: '',
        created: true
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
      await deleteDoc(doc(db, 'Brides', id));
      setBrides(prev => prev.filter(bride => bride.id !== id));
    } catch (error) {
      console.error('שגיאה במחיקת כלה:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedBrides.map(id => deleteDoc(doc(db, 'Brides', id))));
      setBrides(prev => prev.filter(bride => !selectedBrides.includes(bride.id)));
      setSelectedBrides([]);
    } catch (error) {
      console.error('שגיאה במחיקת כלות נבחרות:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(#fffbe9, #fff5d1)', padding: '2rem' }}>
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
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

      {/* כפתורים מעל הטבלה */}
      <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto 2rem auto', height: '60px' }}>
        {selectedBrides.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteSelected}
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              fontWeight: 'bold'
            }}
          >
            🗑️ מחיקת כלות נבחרות
          </Button>
        )}
        <div style={{ textAlign: 'center' }}>
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
        </div>
      </div>

      {/* טבלה */}
      <TableContainer component={Paper} sx={{ maxWidth: "1000px", margin: "0 auto", borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }} dir="rtl">
        <Table sx={{ minWidth: 700, backgroundColor: "#fff" }} aria-label="bride table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e0c097" }}>
              <TableCell />
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>שם מלא</TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>אימייל</TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>טלפון</TableCell>
              <TableCell align="right" />
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {brides
              .filter(bride =>
                bride.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (filterPayment === '' || (filterPayment === 'paid' && bride.paymentStatus === true) || (filterPayment === 'unpaid' && bride.paymentStatus === false)) &&
                (filterHistory === '' || bride.historyStatus === filterHistory)
              )
              .map((bride) => (
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
