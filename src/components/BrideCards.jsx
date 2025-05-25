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

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="חפש לפי שם כלה"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #a67c52',
            borderRadius: '8px',
            minWidth: '200px'
          }}
        />
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
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '2px solid #a67c52'
          }}
        >
          <option value="">כל התשלומים</option>
          <option value="paid">שילמו</option>
          <option value="unpaid">לא שילמו</option>
        </select>
        <select
          value={filterHistory}
          onChange={(e) => setFilterHistory(e.target.value)}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '2px solid #a67c52'
          }}
        >
          <option value="">כל הכלות</option>
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
      }}>
        <Table sx={{ minWidth: 700, backgroundColor: "#fff" }} aria-label="bride table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e0c097" }}>
              <TableCell sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>שם מלא</TableCell>
              <TableCell sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>אימייל</TableCell>
              <TableCell sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>טלפון</TableCell>
              <TableCell sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>הצג</TableCell>
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
                  <TableCell>{bride.fullName}</TableCell>
                  <TableCell>{bride.email}</TableCell>
                  <TableCell>{bride.phone}</TableCell>
                  <TableCell>
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
