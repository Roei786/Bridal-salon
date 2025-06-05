// src/components/BrideHistory.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const BrideHistory = () => {
  const [brides, setBrides] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrides = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Brides"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // סינון רק כלות שסיימו תהליך
        const completedBrides = data.filter(b => b.historyStatus === "Completed");
        setBrides(completedBrides);
      } catch (err) {
        console.error("שגיאה בשליפת כלות:", err);
      }
    };
    fetchBrides();
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
      }}>היסטוריית כלות</h2>

      <TableContainer component={Paper} sx={{
        maxWidth: "1000px",
        margin: "0 auto",
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }} dir="rtl">
        <Table sx={{ minWidth: 700, backgroundColor: "#fff" }} aria-label="bride history table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e0c097" }}>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>שם מלא</TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>אימייל</TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>טלפון</TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>הצג</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brides.map((bride) => (
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
                      fontWeight: 'bold',
                      color: 'white'
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

export default BrideHistory;
