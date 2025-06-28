import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, Timestamp, DocumentData } from 'firebase/firestore';
import { db } from '../firebase-config.ts';
import { Bride } from './brideService';

export interface Measurement {
  id?: string;
  brideID: string;
  brideName: string;
  fullName: string;
  phoneNumber: string;
  seamstressName?: string;
  weddingDate: Date | Timestamp;
  bust?: number;
  waist?: number;
  hips?: number;
  shoulderWidth?: number;
  armCircumference?: number;
  sleeveLength?: number;
  dressLength?: number;
  measurementNumber: number;
  date?: Date | Timestamp;
}

// Convert Firestore timestamp to Date object for frontend use
const convertMeasurementFromFirestore = (doc: DocumentData): Measurement => {
  const data = doc.data();
  return {
    id: doc.id,
    brideID: data.brideID,
    brideName: data.brideName,
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    seamstressName: data.seamstressName,
    weddingDate: data.weddingDate instanceof Timestamp ? data.weddingDate.toDate() : data.weddingDate,
    bust: data.bust,
    waist: data.waist,
    hips: data.hips,
    shoulderWidth: data.shoulderWidth,
    armCircumference: data.armCircumference,
    sleeveLength: data.sleeveLength,
    dressLength: data.dressLength,
    measurementNumber: data.measurementNumber || 1,
    date: data.date instanceof Timestamp ? data.date.toDate() : data.date || new Date()
  };
};

// Convert Date objects to Firestore Timestamp for storage
const convertMeasurementForFirestore = (measurement: Measurement) => {
  return {
    brideID: measurement.brideID,
    brideName: measurement.brideName,
    fullName: measurement.fullName,
    phoneNumber: measurement.phoneNumber,
    seamstressName: measurement.seamstressName || "",
    weddingDate: measurement.weddingDate instanceof Date ? Timestamp.fromDate(measurement.weddingDate) : measurement.weddingDate,
    bust: measurement.bust,
    waist: measurement.waist,
    hips: measurement.hips,
    shoulderWidth: measurement.shoulderWidth,
    armCircumference: measurement.armCircumference,
    sleeveLength: measurement.sleeveLength,
    dressLength: measurement.dressLength,
    measurementNumber: measurement.measurementNumber || 1,
    date: measurement.date instanceof Date ? Timestamp.fromDate(measurement.date) : measurement.date || Timestamp.now()
  };
};

// Get all measurements for a bride (from the main collection)
export const getMeasurementsByBrideId = async (brideId: string): Promise<Measurement[]> => {
  try {
    const measurementsQuery = query(
      collection(db, 'measurements'), // ✅ חזרה לאוסף הראשי
      where('brideID', '==', brideId)
    );
    const snapshot = await getDocs(measurementsQuery);
    return snapshot.docs.map(convertMeasurementFromFirestore);
  } catch (error) {
    console.error(`Error fetching measurements for bride ${brideId}:`, error);
    throw error;
  }
};

// Get the latest measurement for a bride
export const getLatestMeasurement = async (brideId: string): Promise<Measurement | null> => {
  try {
    const measurements = await getMeasurementsByBrideId(brideId);
    if (measurements.length === 0) return null;
    
    // Sort by measurementNumber in descending order to get latest
    measurements.sort((a, b) => (b.measurementNumber || 0) - (a.measurementNumber || 0));
    return measurements[0];
  } catch (error) {
    console.error(`Error fetching latest measurement for bride ${brideId}:`, error);
    throw error;
  }
};

// Add a new measurement
export const addMeasurement = async (measurement: Omit<Measurement, 'id'>): Promise<string> => {
  try {
    const measurementData = convertMeasurementForFirestore(measurement as Measurement);
    const docRef = await addDoc(collection(db, 'measurements'), measurementData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding measurement:", error);
    throw error;
  }
};

// Update an existing measurement
export const updateMeasurement = async (id: string, measurementData: Partial<Measurement>): Promise<void> => {
  try {
    const measurementRef = doc(db, 'measurements', id);
    
    // Convert any Date objects to Firestore Timestamps
    const data = { ...measurementData };
    if (data.weddingDate instanceof Date) {
      data.weddingDate = Timestamp.fromDate(data.weddingDate);
    }
    if (data.date instanceof Date) {
      data.date = Timestamp.fromDate(data.date);
    }
    
    await updateDoc(measurementRef, data);
  } catch (error) {
    console.error(`Error updating measurement with ID ${id}:`, error);
    throw error;
  }
};

// Delete a measurement
export const deleteMeasurement = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'measurements', id));
  } catch (error) {
    console.error(`Error deleting measurement with ID ${id}:`, error);
    throw error;
  }
};

// Create a measurement from a bride
export const createMeasurementFromBride = (bride: Bride, measurementNumber: number = 1): Measurement => {
  return {
    brideID: bride.id || '',
    brideName: bride.fullName,
    fullName: bride.fullName,
    phoneNumber: bride.phoneNumber,
    seamstressName: bride.assignedSeamstress,
    weddingDate: bride.weddingDate,
    measurementNumber: measurementNumber,
    date: new Date()
  };
};
