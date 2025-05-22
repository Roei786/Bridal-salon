import { useAuth } from '../contexts/AuthContext';
import UserCreationForm from '../components/UserCreationForm';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="dashboard-title">!ברוכים הבאים</h2>
        <UserCreationForm />
      </div>
    </div>
  );
}
