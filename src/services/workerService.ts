// File: src/services/workerService.ts
import { db } from '@/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { User } from '../types'; 
export interface Worker {
  id?: string;
  fullName: string;
  email?: string;
  role?: string;
  createdAt: Date;
  updatedAt?: Date;
  deleted: boolean;
  mustChangePassword?: boolean;
}


export const getActiveWorkers = async (): Promise<User[]> => {

  const q = query(collection(db, "users"), where("role", "==", "employee"));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as User)); 
};


export const addWorkerIfNotExists = async (fullName: string) => {
  try {
    if (!fullName.trim()) return;

    const q = query(
      collection(db, 'workers'),
      where('fullName', '==', fullName)
    );
    const snapshot = await getDocs(q);

    // If a worker with the same fullName already exists, do not add
    if (!snapshot.empty) return;

    await addDoc(collection(db, 'workers'), {
      fullName,
      email: '',
      role: 'employee',
      createdAt: new Date(),
      deleted: false
    });

    console.log(`נוספה תופרת חדשה: ${fullName}`);
  } catch (error) {
    console.error('שגיאה בהוספת תופרת:', error);
  }
};
