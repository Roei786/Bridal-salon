import React,{useState,useEffect} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const BrideCards = () => {
  const [brides, setBrides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterHistory, setFilterHistory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
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

    fetchUsers();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(#fffbe9, #fff5d1)',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#6d4c41',
        marginBottom: '2rem',
        fontSize: '2rem'
      }}>רשימת כלות</h2>

      {/* שורת חיפוש */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSearchTerm(searchTerm.trim())}
          style={{
            backgroundColor: '#a67c52',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          חפש
        </button>
        <input
          type="text"
          placeholder="חפש לפי שם כלה"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          dir="rtl"
          style={{
            backgroundColor: 'white',        
            color: '#6d4c41',               
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #a67c52',
            borderRadius: '8px',
            minWidth: '200px'
          }}
        />
      </div>

      {/* סרגל סינונים */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          style={{
            backgroundColor:'#6d4c41',  
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '2px solid #a67c52'
          }}
        >
          <option value="">סטטוס תשלום</option>
          <option value="paid">שילמו</option>
          <option value="unpaid">לא שילמו</option>
        </select>
        <select
          value={filterHistory}
          onChange={(e) => setFilterHistory(e.target.value)}
          style={{
            backgroundColor: '#6d4c41',
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '2px solid #a67c52'
          }}
        >
          <option value="">סטטוס כלה</option>
          <option value="In Progress">בתהליך</option>
          <option value="Completed">סיימו</option>
        </select>
      </div>

      <TableContainer component={Paper} sx={{
        maxWidth: "1000px",
        margin: "0 auto",
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}dir="rtl">
        <Table dir="rtl" sx={{ minWidth: 700, backgroundColor: "#fff" }} aria-label="bride table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e0c097" }}>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>שם מלא</TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>אימייל</TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>טלפון</TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>הצג</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brides
              .filter(bride =>
                bride.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (filterPayment === '' || (filterPayment === 'paid' && bride.paymentStatus === true) || (filterPayment === 'unpaid' && bride.paymentStatus === false)) &&
                (filterHistory === '' || bride.historyStatus === filterHistory)
              )
              .map((bride) => (
                <TableRow key={bride.id} sx={{ '&:hover': { backgroundColor: '#fcefd6' } }}>
                  <TableCell align="right">{bride.fullName}</TableCell>
                  <TableCell align="right">{bride.email}</TableCell>
                  <TableCell align="right">{bride.phoneNumber}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#a67c52",
                        '&:hover': { backgroundColor: "#8b5e3c" },
                        fontWeight: 'bold'
                      }}
                      onClick={() => navigate(`/brides/${bride.id}`)}
                    >
                      הצג
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default BrideCards;
