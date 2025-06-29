// src/components/UserShiftsDetail.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { getShiftsForUserByMonth } from '@/services/shiftService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Shift } from '@/types';

// פונקציות עזר לפורמט תאריך ושעה
const formatTime = (date: Date | null): string => {
    if (!date) return '---';
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date | null): string => {
    if (!date) return '---';
    return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface UserShiftsDetailProps {
  userId: string;
  userName: string;
}

const UserShiftsDetail: React.FC<UserShiftsDetailProps> = ({ userId, userName }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    if (!userId) return;
    
    const fetchShifts = async () => {
      setIsLoading(true);
      try {
        const userShifts = await getShiftsForUserByMonth(userId, year, month);
        setShifts(userShifts);
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShifts();
  }, [userId, year, month]);

  const totalMonthHours = useMemo(() => {
    return shifts.reduce((total, shift) => total + (shift.durationHours || 0), 0);
  }, [shifts]);
  
  const changeMonth = (amount: number) => {
      setCurrentDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setMonth(newDate.getMonth() + amount);
          return newDate;
      });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">דוח שעות עבור: {userName}</CardTitle>
        <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="text-2xl font-bold text-gray-700">
                {currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
            </div>
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="h-5 w-5" />
            </Button>
        </div>
        <CardDescription className="pt-6 text-center text-lg text-gray-600">
          סה"כ שעות לחודש זה: 
          <span className="block text-3xl font-black text-amber-700 mt-1">{totalMonthHours.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-100/50">
                <TableHead className="text-right font-semibold text-gray-700 text-base py-3">תאריך</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 text-base py-3">שעת כניסה</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 text-base py-3">שעת יציאה</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 text-base py-3">סה"כ שעות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.length > 0 ? (
                shifts.map(shift => (
                  <TableRow key={shift.id} className="text-base">
                    <TableCell className="py-4">{formatDate(shift.clockInTime)}</TableCell>
                    <TableCell className="py-4">{formatTime(shift.clockInTime)}</TableCell>
                    <TableCell className="py-4">{formatTime(shift.clockOutTime)}</TableCell>
                    <TableCell className="py-4 font-bold text-gray-800">{shift.durationHours?.toFixed(2) || 'פתוחה'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    {/* --- התיקון כאן: שימוש ב-{4} במקום "4" --- */}
                    <TableCell colSpan={4} className="text-center py-10 text-gray-500 text-base">לא נמצאו משמרות לחודש זה.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UserShiftsDetail;