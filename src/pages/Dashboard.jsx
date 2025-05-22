import { useAuth } from '../contexts/AuthContext';
import UserCreationForm from '../components/UserCreationForm';
import './Dashboard.css';

export default function Dashboard() {
  const { role } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="dashboard-title">!ברוכים הבאים</h2>

        {role === 'manager' && (
          <>
            <p>זהו דשבורד מנהלת</p>
            <UserCreationForm />
          </>
        )}

        {role === 'employee' && (
          <>
            <p>זהו דשבורד עובד</p>
            {/* כאן תוכל להוסיף את רכיבי העובד כמו טפסים, שעות עבודה וכו */}
          </>
        )}
      </div>
    </div>
  );
}