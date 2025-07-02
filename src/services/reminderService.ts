// File: src/services/reminderService.ts
import emailjs from 'emailjs-com'; 
import { getAppointments } from './appointmentService';
import { getBrideById } from './brideService';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';

export const checkAndSendReminders = async () => {
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(now.getDate() + 7);

  console.log("🚀 Starting checkAndSendReminders...");

  const appointments = await getAppointments();
  console.log(`📋 Found ${appointments.length} total appointments.`);

  const sentTo = new Set();

  const upcoming = appointments.filter(app => {
    const appDate = convertToDate(app.date);
    const diffInDays = Math.floor((appDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return (diffInDays >= 0 && diffInDays < 2) || (diffInDays >= 5 && diffInDays < 9);
  });

  console.log(`📅 ${upcoming.length} appointments are in the target range (1 or 7 days ahead).`);

  for (const app of upcoming) {
    console.log(`➡️ Processing appointment for brideId: ${app.brideId}`);

    if (sentTo.has(app.brideId)) {
      console.log(`⏩ Skipping duplicate brideId: ${app.brideId}`);
      continue;
    }
    sentTo.add(app.brideId);

    const bride = await getBrideById(app.brideId);
    if (!bride) {
      console.log(`❌ Bride not found for id: ${app.brideId}`);
      continue;
    }

    const brideDocRef = doc(db, 'Brides', app.brideId);
    const brideSnapshot = await getDoc(brideDocRef);
    const brideData = brideSnapshot.data();

    // 🔍 בדיקה אם כבר נשלח היום
    if (brideData?.lastReminderSent) {
      const last = convertToDate(brideData.lastReminderSent);
      const sameDay = last.toDateString() === now.toDateString();
      if (sameDay) {
        console.log(`⏭️ Skipping ${bride.fullName}, already reminded today.`);
        continue;
      }
    }

    try {
      const snapshot = await getDocs(collection(db, `Brides/${app.brideId}/appointments`));
      console.log(`📁 Loaded ${snapshot.docs.length} appointments for ${bride.fullName}`);

      const upcomingAppointments = snapshot.docs
        .map((doc) => {
          const data = doc.data() as { date: any; type?: string };
          let appDate: Date;

          if (data.date instanceof Date) appDate = data.date;
          else if (data.date?.toDate) appDate = data.date.toDate();
          else appDate = new Date(data.date);

          return {
            type: data.type ?? 'לא צויין סוג',
            date: appDate,
          };
        })
        .filter((app) => {
          const diff = app.date.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          return (days >= 0 && days < 2) || (days >= 5 && days < 9);
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      console.log(`🔍 ${upcomingAppointments.length} upcoming appointments found for ${bride.fullName}`);

      if (upcomingAppointments.length === 0) {
        console.log(`🚫 No appointments in 1 or 7 days for ${bride.fullName}`);
        continue;
      }

      const messageArray = upcomingAppointments.map((app, index) => {
        const dateStr = format(app.date, 'dd/MM/yyyy HH:mm');
        return `${index + 1}. ${app.type} - ${dateStr}`;
      });

      const appointmentsText = messageArray.join('\n');

      const templateParams = {
        to_name: bride.fullName,
        to_email: bride.email,
        appointments: appointmentsText,
        salon_logo: 'https://i.ibb.co/d0mL1RVq/logo.png'
      };

      await emailjs.send(
        'service_idzn0fs',
        'template_m8sytlg',
        templateParams,
        '0fzSnZp44MnYc6afv'
      );

      console.log(`✅ Reminder sent to ${bride.fullName}`);

      await updateDoc(brideDocRef, {
        lastReminderSent: Timestamp.fromDate(now),
      });

      console.log(`📝 Updated lastReminderSent for ${bride.fullName}`);
    } catch (error) {
      console.error(`❌ Failed to process reminder for ${bride.fullName}:`, error);
    }
  }

  console.log("🏁 Finished checkAndSendReminders.");
};

function convertToDate(value: string | Date | Timestamp): Date {
  let date: Date;

  if (value instanceof Date) date = value;
  else if (typeof value === 'string') date = new Date(value);
  else if (value instanceof Timestamp) date = value.toDate();
  else throw new Error("Invalid date format");

  if (isNaN(date.getTime())) throw new Error("Invalid date value");

  return date;
}
