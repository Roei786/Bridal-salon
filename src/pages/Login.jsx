import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 
import { useNavigate } from 'react-router-dom';
import './Splash.css'; 

export default function Login() {
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
    <div className="login-container">
      <h2>התחברות</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">התחבר</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
