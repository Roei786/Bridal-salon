import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  getAuth,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  collection
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { useSearchParams } from 'react-router-dom';
import { auth, db, firebaseConfig } from '../firebase';
import { initializeApp, deleteApp, getApps, getApp } from 'firebase/app';
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

  const sendEmailWithPassword = async (email, tempPassword) => {
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
      // בדיקה אם המשתמש קיים במסד הנתונים
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);
      const userExistsInFirestore = !snapshot.empty;
      const userDoc = userExistsInFirestore ? snapshot.docs[0] : null;
      const userData = userDoc?.data();

      // אתחול אפליקציה משנית אם לא קיימת
      let secondaryApp;
      if (!getApps().some(app => app.name === 'Secondary')) {
        secondaryApp = initializeApp(firebaseConfig, 'Secondary');
      } else {
        secondaryApp = getApp('Secondary');
      }

      const secondaryAuth = getAuth(secondaryApp);
      const signInMethods = await fetchSignInMethodsForEmail(secondaryAuth, email);
      const existsInAuth = signInMethods.length > 0;

      if (userExistsInFirestore && userData.deleted) {
        if (!existsInAuth) {
          const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth,
            email,
            tempPassword
          );
        }

        await updateDoc(userDoc.ref, {
          fullName,
          role,
          deleted: false,
          mustChangePassword: true,
          updatedAt: new Date()
        });

        await sendEmailWithPassword(email, tempPassword);

        setMessage(`המשתמש שוחזר ונשלחה לו סיסמה זמנית: ${tempPassword}`);
        setTempPassword(tempPassword);
        setFullName('');
        setEmail('');
        setRole('employee');
        return;
      }

      if (userExistsInFirestore && !userData.deleted) {
        setError('משתמש עם אימייל זה כבר קיים.');
        return;
      }

      if (existsInAuth) {
        setError('האימייל כבר קיים במערכת ולא ניתן ליצור אותו מחדש.');
        return;
      }

      // יצירת משתמש חדש לגמרי
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
        createdAt: new Date(),
        deleted: false
      });

      await sendEmailWithPassword(email, tempPassword);

      setMessage(`המשתמש נוצר עם סיסמה זמנית: ${tempPassword}`);
      setTempPassword(tempPassword);
      setFullName('');
      setEmail('');
      setRole('employee');

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
