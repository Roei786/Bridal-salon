// src/services/shiftService.ts

import { db } from '../firebase';
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp,
    orderBy,
    writeBatch,
    deleteDoc
} from 'firebase/firestore';
import { Shift } from '../types';
import { User } from '../types';

const shiftsCollectionRef = collection(db, 'shifts');

// ... פונקציות clockIn ו-clockOut נשארות זהות ...
export const clockIn = async (userId: string, userName?: string): Promise<string> => {
    const newShiftDoc = {
        userId: userId,
        userName: userName || 'N/A',
        clockInTime: serverTimestamp(),
        clockOutTime: null,
        durationHours: 0,
        date: new Date().toISOString().split('T')[0],
    };
    const docRef = await addDoc(shiftsCollectionRef, newShiftDoc);
    return docRef.id;
};

export const clockOut = async (shiftId: string, clockInTime: Date): Promise<void> => {
  // ודא שהפרמטרים תקינים
  if (!shiftId || !clockInTime) {
    throw new Error("Shift ID and Clock-in time are required.");
  }

  const shiftDocRef = doc(db, 'shifts', shiftId);
  const clockOutTime = new Date();

  // חישוב משך המשמרת בשעות
  const durationMilliseconds = clockOutTime.getTime() - clockInTime.getTime();
  const durationHours = parseFloat((durationMilliseconds / (1000 * 60 * 60)).toFixed(2));
  
  // בדיקה למקרה שהחישוב נכשל
  if (isNaN(durationHours)) {
    console.error("Failed to calculate shift duration. Invalid clockInTime:", clockInTime);
    throw new Error("Could not calculate shift duration.");
  }

  // עדכון המסמך ב-Firestore
  await updateDoc(shiftDocRef, {
    clockOutTime: Timestamp.fromDate(clockOutTime),
    durationHours: durationHours,
  });
};


// פונקציה לבדוק אם יש משמרת פעילה לעובד
export const getActiveShift = async (userId: string): Promise<Shift | null> => {
    const q = query(
        shiftsCollectionRef,
        where('userId', '==', userId),
        where('clockOutTime', '==', null)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const shiftDoc = querySnapshot.docs[0];
        const data = shiftDoc.data();
        // --- כאן מבצעים את התיקון ---
        // ממירים את ה-Timestamp ל-Date כדי להתאים לטיפוס Shift החדש
        return {
            id: shiftDoc.id,
            userId: data.userId,
            userName: data.userName,
            clockInTime: (data.clockInTime as Timestamp).toDate(), // <-- המרה ל-Date
            clockOutTime: null, // במשמרת פעילה זה תמיד null
            durationHours: data.durationHours,
            date: data.date,
        };
    }
    return null;
};

// פונקציה לשליפת כל המשמרות של עובד בחודש נתון
export const getShiftsForUserByMonth = async (userId: string, year: number, month: number): Promise<Shift[]> => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const q = query(
        shiftsCollectionRef,
        where('userId', '==', userId),
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr),
        orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);

    // קוד זה תקין עכשיו, כי הוא מחזיר אובייקטים עם Date, בדיוק כמו שהטיפוס Shift מצפה
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            clockInTime: (data.clockInTime as Timestamp).toDate(),
            clockOutTime: data.clockOutTime ? (data.clockOutTime as Timestamp).toDate() : null,
            durationHours: data.durationHours,
            date: data.date,
        };
    });
};


export const getAllUsers = async (): Promise<User[]> => {
    const usersCollectionRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    
    return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as User));
};
export const setSingleManager = async (newManagerId: string) => {
  const usersRef = collection(db, "users");
  const batch = writeBatch(db);

  // 1. מצא את המנהל הנוכחי
  const managerQuery = query(usersRef, where("role", "==", "manager"));
  const currentManagerSnapshot = await getDocs(managerQuery);

  // 2. אם קיים מנהל, הוסף לפעולת האצווה את הורדתו לתפקיד עובד
  if (!currentManagerSnapshot.empty) {
    const oldManagerDoc = currentManagerSnapshot.docs[0];
    batch.update(oldManagerDoc.ref, { role: "employee" });
  }

  // 3. הוסף לפעולת האצווה את קידום העובד הנבחר לתפקיד מנהל
  const newManagerRef = doc(db, "users", newManagerId);
  batch.update(newManagerRef, { role: "manager" });

  // 4. בצע את כל הפעולות יחד
  await batch.commit();
};
export const softDeleteUser = async (userId: string): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required for deletion.");
  }
  
  // שלב 1: מחק את מסמך המשתמש מהקולקציה 'users'
  const userDocRef = doc(db, "users", userId);
  await deleteDoc(userDocRef);

  // שלב 2 (בונוס, אבל מומלץ): מחק את כל המשמרות המשויכות למשתמש
  // זה שומר על בסיס הנתונים נקי
  const shiftsQuery = query(collection(db, 'shifts'), where('userId', '==', userId));
  const shiftsSnapshot = await getDocs(shiftsQuery);

  if (!shiftsSnapshot.empty) {
    const batch = writeBatch(db);
    shiftsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
};