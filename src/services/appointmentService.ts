import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase.ts';

export interface Appointment {
  id?: string;
  brideId: string;
  date: Date | Timestamp | string;
  notes: string;
  status: string;
  type: string;
}

// Convert Firestore timestamp to Date object
const convertAppointmentFromFirestore = (doc: any): Appointment => {
  const data = doc.data();
  
  // Parse date and time
  let dateObj: Date;
  if (data.date instanceof Timestamp) {
    dateObj = data.date.toDate();
  } else if (typeof data.date === 'string') {
    // Check if the date string includes time
    if (data.date.includes(' ')) {
      // Format is "YYYY-MM-DD HH:MM"
      const [datePart, timePart] = data.date.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      dateObj = new Date(year, month - 1, day, hours, minutes);
    } else {
      // Simple format without time
      dateObj = new Date(data.date);
    }
  } else {
    dateObj = new Date();
  }
  
  return {
    id: doc.id,
    brideId: data.brideId,
    date: dateObj,
    notes: data.notes || '',
    status: data.status,
    type: data.type
  };
};

// Convert Date objects to string format for Firestore
const convertAppointmentForFirestore = (appointment: Appointment) => {
  // Get the date object
  let dateObj: Date;
  if (appointment.date instanceof Date) {
    dateObj = appointment.date;
  } else if (appointment.date instanceof Timestamp) {
    dateObj = appointment.date.toDate();
  } else if (typeof appointment.date === 'string') {
    dateObj = new Date(appointment.date);
  } else {
    dateObj = new Date();
  }

  // Format date as YYYY-MM-DD
  const dateString = dateObj.toISOString().split('T')[0];
  
  // Extract time as HH:MM
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  // Format full date-time for storage
  const fullDateString = `${dateString} ${timeString}`;
  
  return {
    brideId: appointment.brideId,
    date: fullDateString,
    notes: appointment.notes || '',
    status: appointment.status,
    type: appointment.type
  };
};

// Get all appointments
export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const appointmentsQuery = query(
      collection(db, 'Appointments'),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(appointmentsQuery);
    return snapshot.docs.map(convertAppointmentFromFirestore);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

// Get appointments for a specific day
export const getAppointmentsByDate = async (startDate: Date, endDate: Date): Promise<Appointment[]> => {
  try {
    // Format dates to match the string format in Firestore
    // For date strings with time, we use YYYY-MM-DD HH:MM format
    // But for querying by date range, we only need the date part (YYYY-MM-DD)
    const startDateString = startDate.toISOString().split('T')[0]; // e.g., 2025-06-01
    const endDateString = endDate.toISOString().split('T')[0]; // e.g., 2025-07-01
    
    // Add a space to make sure we're matching the start of date strings with time (YYYY-MM-DD HH:MM)
    // and also pure date strings (YYYY-MM-DD)
    const startOfDayString = startDateString; // e.g., 2025-06-01
    const endOfNextDayString = endDateString + " 23:59"; // e.g., 2025-07-01 23:59
    
    const appointmentsQuery = query(
      collection(db, 'Appointments'),
      where('date', '>=', startOfDayString),
      where('date', '<=', endOfNextDayString),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(appointmentsQuery);
    return snapshot.docs.map(convertAppointmentFromFirestore);
  } catch (error) {
    console.error("Error fetching appointments by date:", error);
    throw error;
  }
};

// Get appointments for a specific bride
export const getAppointmentsByBride = async (brideId: string): Promise<Appointment[]> => {
  try {
    const appointmentsQuery = query(
      collection(db, 'Appointments'),
      where('brideId', '==', brideId),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(appointmentsQuery);
    return snapshot.docs.map(convertAppointmentFromFirestore);
  } catch (error) {
    console.error(`Error fetching appointments for bride ${brideId}:`, error);
    throw error;
  }
};

// Get a single appointment by ID
export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  try {
    const appointmentDoc = await getDoc(doc(db, 'Appointments', id));
    if (appointmentDoc.exists()) {
      return convertAppointmentFromFirestore(appointmentDoc);
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching appointment with ID ${id}:`, error);
    throw error;
  }
};

// Add a new appointment
export const addAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<string> => {
  try {
    const appointmentData = convertAppointmentForFirestore(appointment as Appointment);
    const docRef = await addDoc(collection(db, 'Appointments'), appointmentData);

    return docRef.id;
  } catch (error) {
    console.error("Error adding appointment:", error);
    throw error;
  }
};

// Update an existing appointment
export const updateAppointment = async (id: string, appointmentData: Partial<Appointment>): Promise<void> => {
  try {
    const appointmentRef = doc(db, 'Appointments', id);
    
    // Convert any Date objects to string format with time
    const data = { ...appointmentData };
    if (data.date instanceof Date) {
      // Format as "YYYY-MM-DD HH:MM"
      const dateString = data.date.toISOString().split('T')[0];
      const hours = String(data.date.getHours()).padStart(2, '0');
      const minutes = String(data.date.getMinutes()).padStart(2, '0');
      data.date = `${dateString} ${hours}:${minutes}`;
    } else if (data.date instanceof Timestamp) {
      const dateObj = data.date.toDate();
      const dateString = dateObj.toISOString().split('T')[0];
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      data.date = `${dateString} ${hours}:${minutes}`;
    }
    
    await updateDoc(appointmentRef, data);
  } catch (error) {
    console.error(`Error updating appointment with ID ${id}:`, error);
    throw error;
  }
};

// Delete an appointment
export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'Appointments', id));
  } catch (error) {
    console.error(`Error deleting appointment with ID ${id}:`, error);
    throw error;
  }
};
