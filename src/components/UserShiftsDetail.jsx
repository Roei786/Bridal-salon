// src/components/UserShiftsDetail.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getShiftsForUserByMonth } from '@/services/shiftService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

// פונקציית עזר לפורמט שעה
const formatTime = (date) => {
    if (!date) return '---';
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
};

// פונקציית עזר לפורמט תאריך
const formatDate = (date) => {
    if (!date) return '---';
    return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const UserShiftsDetail = ({ userId, userName }) => {
  const [shifts, setShifts] = useState([]);
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
          console.log('Shifts fetched from service:', userShifts);
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
  
  const changeMonth = (amount) => {
      setCurrentDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setMonth(newDate.getMonth() + amount);
          return newDate;
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>דוח שעות עבור: {userName}</CardTitle>
        <div className="flex justify-between items-center mt-2">
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold">
                {currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
            </div>
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
        </div>
        <CardDescription className="pt-4 text-center text-base">
          סה"כ שעות לחודש זה: <span className="font-bold text-amber-700">{totalMonthHours.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">תאריך</TableHead>
                <TableHead className="text-right">שעת כניסה</TableHead>
                <TableHead className="text-right">שעת יציאה</TableHead>
                <TableHead className="text-right">סה"כ שעות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.length > 0 ? (
                shifts.map(shift => (
                  <TableRow key={shift.id}>
                    <TableCell>{formatDate(shift.clockInTime)}</TableCell>
                    <TableCell>{formatTime(shift.clockInTime)}</TableCell>
                    <TableCell>{formatTime(shift.clockOutTime)}</TableCell>
                    <TableCell className="font-medium">{shift.durationHours?.toFixed(2) || 'פתוחה'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan="4" className="text-center">לא נמצאו משמרות לחודש זה.</TableCell>
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