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
import './UserList.css';

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
    <Box className="userlist-container">
      <div className="table-wrapper">
        <Typography variant="h4" className="userlist-title" gutterBottom>
          רשימת משתמשים
        </Typography>

        {/* 🔍 שדה חיפוש */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="חפש לפי שם"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="right" onClick={() => handleSort('fullName')} style={{ cursor: 'pointer' }}>
                  שם מלא {renderSortIcon('fullName')}
                </TableCell>
                <TableCell align="right">אימייל</TableCell>
                <TableCell align="right" onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                  תפקיד {renderSortIcon('role')}
                </TableCell>
                <TableCell align="right">מחיקה</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell align="right">{user.fullName}</TableCell>
                  <TableCell align="right">{user.email}</TableCell>
                  <TableCell
                    align="right"
                    style={{ color: user.role === 'manager' ? 'green' : 'crimson' }}
                  >
                    {user.role}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
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

        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/users/new')}
          >
            הוסף משתמש
          </Button>
        </Box>
      </div>
    </Box>
  );
};

export default UserList;
