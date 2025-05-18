import { useAuth } from '../contexts/AuthContext';
import UserCreationForm from '../components/UserCreationForm';
export default function Dashboard() {
  return (
    <div>
      <h2>דאשבורד מנהלת</h2>
      <UserCreationForm />
    </div>
  );
}