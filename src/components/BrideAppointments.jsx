// src/components/BrideAppointments.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../firebase";

function BrideAppointments({ brideId }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchAppointments() {
      const appointmentsRef = collection(db, 'brides', brideId, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    }

    if (brideId) {
      fetchAppointments();
    }
  }, [brideId]);

  return (
    <div>
      <h2>פגישות של הכלה</h2>
      {appointments.length === 0 ? (
        <p>אין פגישות</p>
      ) : (
        <ul>
          {appointments.map((appt) => (
            <li key={appt.id}>
              {appt.date} - {appt.type}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BrideAppointments ;
