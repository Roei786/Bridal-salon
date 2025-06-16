// src/App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';
import UserList from './components/UserList';
import UserCreationForm from './components/UserCreationForm';
import BrideCards from './components/BrideCards';
import AppointmentSchedule from './pages/AppointmentSchedule';
import BrideHistory from './components/BrideHistory';
import BridePreparationPage from './pages/BridePreparationPage';
import TheBrideCard from './components/TheBrideCard';
import Layout from './components/Layout';
import ManagerDashboard from './components/ManagerDashboard';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* דפים בלי תפריט */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* דפים עם Layout (כוללים Sidebar ו־Navbar) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><AppointmentSchedule /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
          <Route path="/brides" element={<ProtectedRoute><BrideCards /></ProtectedRoute>} />
          <Route path="/brides/:brideId" element={<ProtectedRoute><TheBrideCard /></ProtectedRoute>} />
          <Route path="/users/new" element={<ProtectedRoute><UserCreationForm /></ProtectedRoute>} />
          <Route path="/bride-history" element={<ProtectedRoute><BrideHistory /></ProtectedRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/brides/preparation" element={<ProtectedRoute><BridePreparationPage /></ProtectedRoute>} />
          <Route path="/preparation-form" element={<ProtectedRoute><BridePreparationPage /></ProtectedRoute>} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
