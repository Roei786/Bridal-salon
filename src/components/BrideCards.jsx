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
import { db } from '../firebase'; // Import Firebase connection
import { useNavigate } from 'react-router-dom'; // For navigating to another page

const BrideCards = () => {
    const [brides, setBrides] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch users from Firestore when the component loads
        const fetchUsers = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, 'Brides')); // Read from 'users' collection
            const bridesData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setBrides(bridesData); // Save the brides in state
          } catch (error) {
            console.error('Error fetching brides:', error);
          }
        };
    
        fetchUsers(); // Run the fetch once on component mount
      }, []);
  return (
    <TableContainer component={Paper}>
      <Table sx={{fontSize: '1.25rem'}} aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>שם מלא</TableCell>
            <TableCell>אימייל</TableCell>
            <TableCell>טלפון</TableCell>
            <TableCell>הצג</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {brides.map((bride) => (
            <TableRow key={bride.id}>
              <TableCell>{bride.fullName}</TableCell>
              <TableCell>{bride.email}</TableCell>
              <TableCell>{bride.phone}</TableCell>
              <TableCell>
                <Button variant="contained" color="primary">
                  הצג
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BrideCards;