import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
  
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }
  
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid)); // ← קודם כל זה!
  
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('📥 role נטען מ-Firestore:', data.role); // ← עכשיו זה בטוח
          setRole(data.role || null);
        } else {
          console.warn('⚠️ אין מסמך ב-users עבור המשתמש');
          setRole(null);
        }
      } catch (err) {
        console.error('⚠️ שגיאה בקריאת role:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  return (
    <AuthContext.Provider value={{ currentUser, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
