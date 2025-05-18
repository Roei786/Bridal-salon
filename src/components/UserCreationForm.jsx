import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { nanoid } from 'nanoid'; 
import { useSearchParams } from 'react-router-dom';

export default function UserCreationForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get('invite');
  const handleCreateInvite = async (e) => {
    const inviteId = nanoid(12); // לדוגמה: '4X9qaBfjkZt2'

  await setDoc(doc(db, 'invitations', inviteId), {
    role: 'employee',
    used: false,
    createdAt: new Date()
  });

  const link = `${window.location.origin}/register?invite=${inviteId}`;
  console.log('העתק את הקישור:', link);
  
    const inviteLink = `https://your-site.com/register?invite=${inviteId}`;

  };
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
  
    try {
      // נניח שהמייל לא קיים עדיין ב־Auth
      const fakeId = email.replace(/[^a-zA-Z0-9]/g, '_'); // ID זמני
  
      await setDoc(doc(db, 'invitations', fakeId), {
        fullName,
        email,
        role,
        invited: true,
        createdAt: new Date()
      });
  
      setMessage(`המשתמש "${fullName}" הוזמן בהצלחה!`);
      setFullName('');
      setEmail('');
      setRole('employee');
    } catch (err) {
      console.error(err);
      setError('שגיאה ביצירת ההזמנה: ' + err.message);
    }
  };
  

  return (
    <div className="user-creation-form">
      <h3>הוספת משתמש חדש</h3>
      <form onSubmit={handleCreateUser}>
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
        
        <button type="submit" onClick={handleCreateInvite}>צור משתמש</button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
