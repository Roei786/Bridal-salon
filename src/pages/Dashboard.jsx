// src/pages/Dashboard.jsx
import { useAuth } from '../contexts/AuthContext';
import ManagerDashboard from '../components/ManagerDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';
import './Dashboard.css';

export default function Dashboard() {
  const { role } = useAuth();

  if (!role) return <p>טוען תפקיד...</p>;

  return (
    <div className="dashboard-container" style={{ paddingTop: '80px' }}>
      {role === 'manager' && <ManagerDashboard />}
      {role === 'employee' && <EmployeeDashboard />}
      {role !== 'manager' && role !== 'employee' && (
        <p style={{ color: 'red' }}>אין תפקיד מתאים להצגה</p>
      )}
    </div>
  );
}
