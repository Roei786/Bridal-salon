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
  Box,
  TextField
} from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('role');
  const [sortDir, setSortDir] = useState('asc');
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

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const filteredUsers = users
    .filter(user => user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'fullName') {
        return a.fullName.localeCompare(b.fullName) * dir;
      } else if (sortBy === 'role') {
        const roleValue = r => (r === 'manager' ? 0 : 1);
        return (roleValue(a.role) - roleValue(b.role)) * dir;
      }
      return 0;
    });

  const renderSortIcon = (column) => {
    if (sortBy === column) {
      return sortDir === 'asc' ? <ArrowDropUpIcon fontSize="small" /> : <ArrowDropDownIcon fontSize="small" />;
    }
    return <UnfoldMoreIcon fontSize="small" />;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(#fffbe9, #fff5d1)',
        padding: '2rem',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          textAlign: 'center',
          color: '#6d4c41',
          marginBottom: '2rem',
          fontWeight: 'bold',
          fontSize: '2rem'
        }}
      >
        רשימת משתמשים
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <TextField
          dir="rtl"
          placeholder="חפש לפי שם"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            backgroundColor: 'white',
            minWidth: '250px',
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#a67c52' },
              '&:hover fieldset': { borderColor: '#8b5e3c' },
              '&.Mui-focused fieldset': { borderColor: '#8b5e3c' },
            },
            input: {
              color: '#6d4c41',
              direction: 'rtl'
            }
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{
        maxWidth: "1000px",
        margin: "0 auto",
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <Table dir="rtl" sx={{ minWidth: 700, backgroundColor: "#fff" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e0c097" }}>
              <TableCell
                align="right"
                sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
                onClick={() => handleSort('fullName')}
              >
                שם מלא {renderSortIcon('fullName')}
              </TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>
                אימייל
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
                onClick={() => handleSort('role')}
              >
                תפקיד {renderSortIcon('role')}
              </TableCell>
              <TableCell align="right" sx={{ color: "#6d4c41", fontWeight: 'bold', fontSize: '1.1rem' }}>
                מחיקה
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#fcefd6' } }}>
                <TableCell align="right">{user.fullName}</TableCell>
                <TableCell align="right">{user.email}</TableCell>
                <TableCell
                  align="right"
                  sx={{ color: user.role === 'manager' ? '#6d4c41' : '#a67c52' }}
                >
                  {user.role}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#a67c52',
                      '&:hover': { backgroundColor: '#8b5e3c' },
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                    onClick={() => handleDelete(user.id)}
                  >
                    🗑️ מחק
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} textAlign="center">
        <Button
          variant="contained"
          onClick={() => navigate('/users/new')}
          sx={{
            backgroundColor: '#a67c52',
            '&:hover': { backgroundColor: '#8b5e3c' },
            fontWeight: 'bold',
            color: 'white',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            borderRadius: '8px'
          }}
        >
          הוסף משתמש
        </Button>
      </Box>
    </Box>
  );
};

export default UserList;
