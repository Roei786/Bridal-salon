import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../firebase-config.ts';

export interface Bride {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  weddingDate: Date | Timestamp;
  createdAt: Date | Timestamp;
  historyStatus: string;
  paymentStatus: boolean;
  assignedSeamstress?: string;
  beforeImages?: string[];
  afterImages?: string[];
}

// Convert Firestore timestamp to Date object for frontend use
const convertBrideFromFirestore = (doc: DocumentData): Bride => {
  const data = doc.data();
  return {
    id: doc.id,
    fullName: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    weddingDate: data.weddingDate instanceof Timestamp ? data.weddingDate.toDate() : data.weddingDate,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    historyStatus: data.historyStatus,
    paymentStatus: data.paymentStatus,
    assignedSeamstress: data.assignedSeamstress,
    beforeImages: data.beforeImages || [],
    afterImages: data.afterImages || []
  };
};

// Convert Date objects to Firestore Timestamp for storage
const convertBrideForFirestore = (bride: Bride) => {
  return {
    fullName: bride.fullName,
    email: bride.email,
    phoneNumber: bride.phoneNumber,
    weddingDate: bride.weddingDate instanceof Date ? Timestamp.fromDate(bride.weddingDate) : bride.weddingDate,
    createdAt: bride.createdAt instanceof Date ? Timestamp.fromDate(bride.createdAt) : bride.createdAt || Timestamp.now(),
    historyStatus: bride.historyStatus,
    paymentStatus: bride.paymentStatus,
    assignedSeamstress: bride.assignedSeamstress || "",
    beforeImages: bride.beforeImages || [],
    afterImages: bride.afterImages || []
  };
};

// Get all brides
export const getBrides = async (): Promise<Bride[]> => {
  try {
    const bridesQuery = query(
      collection(db, 'Brides'), 
      orderBy('weddingDate', 'asc')
    );
    const snapshot = await getDocs(bridesQuery);
    return snapshot.docs.map(convertBrideFromFirestore);
  } catch (error) {
    console.error("Error fetching brides:", error);
    throw error;
  }
};

// Get a single bride by ID
export const getBrideById = async (id: string): Promise<Bride | null> => {
  try {
    const brideDoc = await getDoc(doc(db, 'Brides', id));
    if (brideDoc.exists()) {
      return convertBrideFromFirestore(brideDoc);
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching bride with ID ${id}:`, error);
    throw error;
  }
};

// Add a new bride
export const addBride = async (bride: Omit<Bride, 'id'>): Promise<string> => {
  try {
    const brideData = convertBrideForFirestore(bride as Bride);
    const docRef = await addDoc(collection(db, 'Brides'), brideData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding bride:", error);
    throw error;
  }
};

// Update an existing bride
export const updateBride = async (id: string, brideData: Partial<Bride>): Promise<void> => {
  try {
    const brideRef = doc(db, 'Brides', id);
    
    // Convert any Date objects to Firestore Timestamps
    const data = { ...brideData };
    if (data.weddingDate instanceof Date) {
      data.weddingDate = Timestamp.fromDate(data.weddingDate);
    }
    if (data.createdAt instanceof Date) {
      data.createdAt = Timestamp.fromDate(data.createdAt);
    }
    
    await updateDoc(brideRef, data);
  } catch (error) {
    console.error(`Error updating bride with ID ${id}:`, error);
    throw error;
  }
};

// Delete a bride
export const deleteBride = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'Brides', id));
  } catch (error) {
    console.error(`Error deleting bride with ID ${id}:`, error);
    throw error;
  }
};

// Search for brides by name, email, or phone
export const searchBrides = async (searchTerm: string): Promise<Bride[]> => {
  try {
    // Firestore doesn't support complex text search out of the box,
    // so we'll fetch all and filter on client side
    const brides = await getBrides();
    if (!searchTerm) return brides;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return brides.filter(bride => 
      bride.fullName.toLowerCase().includes(lowerSearchTerm) ||
      bride.email.toLowerCase().includes(lowerSearchTerm) ||
      bride.phoneNumber.includes(searchTerm)
    );
  } catch (error) {
    console.error("Error searching brides:", error);
    throw error;
  }
};
