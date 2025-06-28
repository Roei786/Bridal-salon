import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from '../firebase.ts';
import { doc, getDoc } from "firebase/firestore";

// Add user data type to include role and other fields
export type UserData = {
  deleted?: boolean;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
};

type AuthContextType = {
  currentUser: User | null;
  userData: UserData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data from Firestore when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user data from the users collection
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);
          } else {
            console.log("User document doesn't exist in Firestore");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => userCredential.user);
  };

  const logout = () => {
    return signOut(auth);
  };

  const signup = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => userCredential.user);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    userData,
    isLoading,
    login,
    logout,
    signup,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
