import UserCreationForm from '../components/UserCreationForm';

export default function ManagerDashboard() {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-title">ברוכה השבה מנהלת</h2>
      <p>כאן תוכלי לנהל משתמשים ולעקוב אחרי פעילות העמותה.</p>
      <UserCreationForm />
    </div>
  );
}