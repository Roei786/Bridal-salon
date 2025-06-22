// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkHVgYbVJbKe_Ess_HBsasmiTgBs72c7I",
  authDomain: "bridal-salon.firebaseapp.com",
  projectId: "bridal-salon",
  storageBucket: "bridal-salon.firebasestorage.app",
  messagingSenderId: "642364311715",
  appId: "1:642364311715:web:e7deea7ac49e5d940f1716"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };