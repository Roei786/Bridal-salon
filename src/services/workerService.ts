import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase.ts';

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

// ✅ Get all active workers (from 'workers' collection)
export const getActiveWorkers = async (): Promise<Worker[]> => {
  try {
    const workersQuery = query(
      collection(db, 'workers'),
      where('deleted', '==', false)
    );

    const querySnapshot = await getDocs(workersQuery);

    const workers: Worker[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      workers.push({
        id: doc.id,
        fullName: data.fullName || '',
        email: data.email || '',
        role: data.role || 'employee',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        deleted: data.deleted || false,
        mustChangePassword: data.mustChangePassword || false
      });
    });

    return workers;
  } catch (error) {
    console.error('Error getting workers:', error);
    throw error;
  }
};

// ✅ Add worker to 'workers' collection if not exists
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
