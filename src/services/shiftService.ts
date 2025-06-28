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
    orderBy
} from 'firebase/firestore';
import { Shift } from '../types';

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
    // ... לוגיקה זהה ...
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


export const getAllUsers = async () => {
    const usersCollectionRef = collection(db, 'users'); // ודא ששם האוסף הוא 'users'
    const usersSnapshot = await getDocs(usersCollectionRef);
    
    // --- ודא שמילת המפתח 'return' נמצאת כאן ---
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};