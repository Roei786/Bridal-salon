import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

export default function Splash() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError('סיסמה שגויה');
      } else if (err.code === 'auth/user-not-found') {
        setError('משתמש לא קיים');
      } else {
        setError('שגיאה כללית בהתחברות');
      }
    }
  };

  return (
    <div className="splash-container">
    <img src="/logo.jpg" alt="logo" className="logo" style={{ width: '150px', height: 'auto' }} />

      <div className="splash-header">
        <h1 className="title">הודיה - סלון כלות חברתי</h1>
        <p className="subtitle"></p>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
  <input
    type="email"
    placeholder="אימייל"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
  <input
    type="password"
    placeholder="סיסמה"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <button type="submit" className="btn primary">התחברי</button>
  {error && <p className="error-message">{error}</p>}
</form>

    </div>
  );
}
