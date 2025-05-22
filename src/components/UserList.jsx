import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firebase connection
import { useNavigate } from 'react-router-dom'; // For navigating to another page

const UserList = () => {
  const [users, setUsers] = useState([]); // State to store users from Firestore
  const navigate = useNavigate(); // Hook to navigate between pages

  useEffect(() => {
    // Fetch users from Firestore when the component loads
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users')); // Read from 'users' collection
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData); // Save the users in state
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers(); // Run the fetch once on component mount
  }, []);

  return (
    <div>
      <h2>User List</h2>

      {/* Table showing the list of users */}
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {/* Loop through users and render each row */}
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Button to navigate to the user creation form */}
      <button
        onClick={() => navigate('src/components/UserCreationForm.jsx')}
        style={{ marginTop: '20px', padding: '10px 15px' }}
      >
        Add User
      </button>
    </div>
  );
};

export default UserList;
