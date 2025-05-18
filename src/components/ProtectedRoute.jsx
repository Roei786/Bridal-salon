
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, role, loading } = useAuth();


  if (loading || (requiredRole && role === null)) {
    return <div>טוען הרשאות...</div>;
  }

  if (!currentUser) {
    return <div>יש להתחבר כדי להיכנס</div>;
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
        <h2>אין לך הרשאה לעמוד זה</h2>
        <p>אם אתה חושב שזו טעות – פנה למנהלת</p>
      </div>
    );
  }

  return children;
}