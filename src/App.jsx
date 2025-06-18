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
import MeasurementFormPage from './pages/MeasurementFormPage';
import BrideMeasurementForm from './pages/BrideMeasurementForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* דפים ציבוריים ללא תפריט */}
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bride-measurements/:brideId" element={<BrideMeasurementForm />} />
        <Route path="/bride-preparation/:brideId" element={<BridePreparationPage />} />

        {/* דפים עם Layout (תפריט וכו') */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><AppointmentSchedule /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
          <Route path="/brides" element={<ProtectedRoute><BrideCards /></ProtectedRoute>} />
          <Route path="/brides/:brideId" element={<ProtectedRoute><TheBrideCard /></ProtectedRoute>} />
          <Route path="/users/new" element={<ProtectedRoute><UserCreationForm /></ProtectedRoute>} />
          <Route path="/bride-history" element={<ProtectedRoute><BrideHistory /></ProtectedRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/bride-preparation/:brideId" element={<BridePreparationPage />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/measurements/:brideId" element={<ProtectedRoute><MeasurementFormPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
