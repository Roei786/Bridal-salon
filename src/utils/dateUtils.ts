
import { Timestamp } from 'firebase/firestore';

export const convertToDate = (dateValue: Date | Timestamp | string): Date => {
  if (dateValue instanceof Date) {
    return dateValue;
  } else if (dateValue instanceof Timestamp) {
    return dateValue.toDate();
  } else if (typeof dateValue === 'string') {
    return new Date(dateValue);
  } else {
    return new Date();
  }
};

export const formatDateForInput = (dateValue: Date | Timestamp | string): string => {
  const date = convertToDate(dateValue);
  return date.toISOString().split('T')[0];
};
