import { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid'; 
import { useSearchParams } from 'react-router-dom';
import { auth, db } from '../firebase';
import { firebaseConfig } from '../firebase.js';
import { initializeApp, deleteApp } from 'firebase/app';
import emailjs from 'emailjs-com';



export default function UserCreationForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get('invite');
  
  const sendEmailWithPassword = async ( email, tempPassword) => {
  try {
    console.log('🔍 מייל נשלח ל:', email);

    await emailjs.send(
  'service_3svuzga',         
  'template_m2xwgis',      
  {
      to_email: email,              
    TEMP_PASSWORD: tempPassword,
      
  },
  '4b9wNL-th6VR4bpFE'      
);
    console.log('📧 מייל נשלח בהצלחה');
  } catch (err) {
    console.error('שגיאה בשליחת מייל:', err);
  }
};

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setTempPassword('');

    const tempPassword = nanoid(10);

try {
  const secondaryApp = initializeApp(firebaseConfig, 'Secondary');

  const secondaryAuth = getAuth(secondaryApp);
  const userCredential = await createUserWithEmailAndPassword(
    secondaryAuth,
    email,
    tempPassword
  );

  const user = userCredential.user;

  await setDoc(doc(db, 'users', user.uid), {
    fullName,
    email,
    role,
    mustChangePassword: true,
    createdAt: new Date()
  });

   
  
  await deleteApp(secondaryApp);


  setMessage(`המשתמש נוצר עם סיסמה זמנית: ${tempPassword}`);
  setTempPassword(tempPassword);
  setFullName('');
  setEmail('');
  setRole('employee');
  await sendEmailWithPassword( email, tempPassword);

  } catch (err) {
    console.error(err);
    setError('שגיאה ביצירת המשתמש: ' + err.message);
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
        <button type="submit">צור משתמש</button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {tempPassword && (
        <div style={{ marginTop: '1rem' }}>
          <p><strong>סיסמה זמנית:</strong> <code>{tempPassword}</code></p>
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            מסור לעובד את הסיסמה – הוא יתבקש לשנות אותה בהתחברות הראשונה.
          </p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}