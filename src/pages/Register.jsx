import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';


export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams(); 
  const inviteId = searchParams.get('invite'); 
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, 'users', user.uid), {
    fullName,
    email,
    role,
    createdAt: new Date()
  });

  console.log('✅ משתמש נוצר ונשמר במסד');

  await updateDoc(doc(db, 'invitations', inviteId), { used: true });
  console.log('✅ ההזמנה סומנה כ-used');

  setError('');
  setSuccess('ההרשמה הושלמה בהצלחה!');
  setSuccess('ההרשמה הושלמה! מועבר לדשבורד...');

setTimeout(() => {
  window.location.href = '/dashboard'; 
}, 1500);

} catch (err) {
  console.error('🔥 שגיאה:', err);
  if (err.code === 'auth/email-already-in-use') {
    setError('כתובת האימייל כבר רשומה. נסה להתחבר במקום.');
  } else {
    setError('שגיאה ברישום. נסה שוב.');
  }
}
  };
  

  return (
    <div className="register-container">
      <h2>הרשמה</h2>
      <form onSubmit={handleRegister}>
      <input
  type="text"
  placeholder="שם מלא"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  required
/>

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
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="employee">עובדת</option>
          <option value="manager">מנהלת</option>
        </select>
        <button type="submit">צור משתמש</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
