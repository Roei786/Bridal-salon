import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase-config.ts';

export interface Worker {
  id?: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt?: Date;
  deleted: boolean;
  mustChangePassword?: boolean;
}

// Get all active workers (employees)
export const getActiveWorkers = async (): Promise<Worker[]> => {
  try {
    const workersQuery = query(
      collection(db, 'users'),
      where('role', 'in', ['employee', 'manager'])
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
        mustChangePassword: data.mustChangePassword
      });
    });
    console.log('====================================');
    console.log(workers);
    console.log('====================================');
    return workers;
  } catch (error) {
    console.error('Error getting workers:', error);
    throw error;
  }
};
