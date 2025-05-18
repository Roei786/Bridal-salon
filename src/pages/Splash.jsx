import { useNavigate } from 'react-router-dom';
import './Splash.css'; // נעצב בהמשך

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="splash-container">
        <img src="/logo.jpg" alt="logo" className="logo" />
      <div className="splash-header">
        <h1 className="title">ברוכה הבאה לעמותת כלה</h1>
        <p className="subtitle">שמלה. איפור. ליווי. באהבה.</p>
      </div>

      <div className="splash-buttons">
        <button onClick={() => navigate('/login')} className="btn primary">
          התחילי
        </button>
        <button onClick={() => navigate('/about')} className="btn secondary">
          למד עוד
        </button>
      </div>
    </div>
  );
}
