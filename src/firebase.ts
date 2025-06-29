import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkHVgYbVJbKe_Ess_HBsasmiTgBs72c7I",
  authDomain: "bridal-salon.firebaseapp.com",
  projectId: "bridal-salon",
  storageBucket: "bridal-salon.firebasestorage.app",
  messagingSenderId: "642364311715",
  appId: "1:642364311715:web:e7deea7ac49e5d940f1716"
};

// Use existing app if it exists, otherwise initialize
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
