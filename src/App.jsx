
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import UserList from './components/UserList';
import UserCreationForm from './components/UserCreationForm';
import BrideCards from './components/BrideCards';
import AppointmentSchedule from './pages/AppointmentSchedule';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard"element={ <ProtectedRoute>  <Dashboard /> </ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><AppointmentSchedule /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
        <Route path="/brides" element={<ProtectedRoute><BrideCards /></ProtectedRoute>} />
        <Route path="/users/new" element={<ProtectedRoute><UserCreationForm /></ProtectedRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />   
      </Routes>
    </Router>
  );
}

export default App

// authenticaTION
// USERS COLLECTION WITH ROLES (EMAIL = ID)
// USE pROTECTEWDrOUTES
