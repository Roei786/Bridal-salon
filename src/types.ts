// src/types.ts
import { Timestamp } from 'firebase/firestore'; // אנחנו עדיין צריכים את זה לייבוא בקבצים אחרים

// שים לב לשינוי מ-Timestamp ל-Date
export type Shift = {
  id: string;
  userId: string;
  userName: string;
  clockInTime: Date; // <-- שונה מ-Timestamp ל-Date
  clockOutTime: Date | null; // <-- שונה מ-Timestamp ל-Date
  durationHours: number;
  date: string;
};