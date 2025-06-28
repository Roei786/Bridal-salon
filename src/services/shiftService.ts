import { db } from '@/firebase';
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  limit,
  doc,
  updateDoc
} from 'firebase/firestore';

// Define a type for your Shift object based on your Firestore document
export interface Shift {
  id: string;
  clockInTime: Timestamp;
  clockOutTime: Timestamp | null;
  userId: string;
  month: string;
  notes?: string;
  totalHours: number;
}

const shiftsCollectionRef = collection(db, 'shifts');

/**
 * Checks for an active shift for a given user.
 * An active shift is one that has a clockInTime but no clockOutTime.
 * @param userId - The UID of the currently logged-in user.
 * @returns The active shift document or null if none is found.
 */
export const getActiveShift = async (userId: string): Promise<Shift | null> => {
  const q = query(
    shiftsCollectionRef,
    where('userId', '==', userId),
    where('clockOutTime', '==', null),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const shiftDoc = querySnapshot.docs[0];
  return { id: shiftDoc.id, ...shiftDoc.data() } as Shift;
};

/**
 * Creates a new shift document in Firestore to clock a user in.
 * @param userId - The UID of the currently logged-in user.
 * @returns The ID of the newly created shift document.
 */
export const clockIn = async (userId: string): Promise<string> => {
  const newShift = {
    userId,
    clockInTime: Timestamp.now(),
    clockOutTime: null,
    totalHours: 0,
    month: new Date().toISOString().slice(0, 7), // Format: "YYYY-MM"
    notes: ""
  };

  const docRef = await addDoc(shiftsCollectionRef, newShift);
  return docRef.id;
};

/**
 * Updates an existing shift document to clock a user out.
 * @param shiftId - The ID of the shift document to update.
 * @param clockInTime - The start time of the shift, needed to calculate total hours.
 */
export const clockOut = async (shiftId: string, clockInTime: Date): Promise<void> => {
  const shiftDocRef = doc(db, 'shifts', shiftId);

  const clockOutTime = new Date();
  const timeDifferenceMs = clockOutTime.getTime() - clockInTime.getTime();
  const totalHours = timeDifferenceMs / (1000 * 60 * 60); // Convert ms to hours

  await updateDoc(shiftDocRef, {
    clockOutTime: Timestamp.fromDate(clockOutTime),
    totalHours: parseFloat(totalHours.toFixed(2))
  });
};
