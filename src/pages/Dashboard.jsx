import { useAuth } from '../contexts/AuthContext';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import './Dashboard.css';

export default function Dashboard() {
  const { role } = useAuth();

  if (!role) return <p>טוען תפקיד...</p>;

  return (
    <div className="dashboard-container">
      {role === 'manager' && <ManagerDashboard />}
      {role === 'employee' && <EmployeeDashboard />}
      {role !== 'manager' && role !== 'employee' && (
        <p style={{ color: 'red' }}>אין תפקיד מתאים להצגה</p>
      )}
    </div>
  );
}
