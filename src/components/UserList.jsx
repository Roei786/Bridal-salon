import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box
} from '@mui/material';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmed = window.confirm('האם אתה בטוח שברצונך למחוק את המשתמש?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('שגיאה במחיקת המשתמש:', error);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>רשימת משתמשים</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="right">שם מלא</TableCell>
              <TableCell align="right">אימייל</TableCell>
              <TableCell align="right">תפקיד</TableCell>
              <TableCell align="right">מחיקה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell align="right">{user.fullName}</TableCell>
                <TableCell align="right">{user.email}</TableCell>
                <TableCell align="right" style={{ color: user.role === 'manager' ? 'green' : 'crimson' }}>
                  {user.role}
                </TableCell>
                <TableCell align="right">
                  <Button variant="outlined" color="error" onClick={() => handleDelete(user.id)}>
                    🗑️ מחק
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/users/new')}
        >
          הוסף משתמש
        </Button>
      </Box>
    </Box>
  );
};

export default UserList;
