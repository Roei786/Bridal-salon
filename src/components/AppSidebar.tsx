// קובץ: AppSidebar.tsx - גרסה עם תיקון לוגיקת שעון הנוכחות

import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Crown, LayoutDashboard, Users, Calendar, LogOut, Clock, LogIn,
  Loader2, FileText, Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActiveShift, clockIn, clockOut } from '@/services/shiftService';
import logo from '/files/logo.png';

const AppSidebar = () => {
  const { logout, currentUser, userData } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [isProcessingClockAction, setIsProcessingClockAction] = useState(false);

  const getNavItems = () => {
    const baseItems = [
      { to: '/', label: 'לוח מחוונים', icon: LayoutDashboard },
      { to: '/brides', label: 'ניהול כלות', icon: Crown },
      { to: '/calendar', label: 'לוח זמנים', icon: Calendar },
      { to: '/forms', label: 'טפסים', icon: FileText },
      { to: '/data', label: 'נתונים', icon: FileText },
    ];
    if (userData?.role === 'manager') {
      baseItems.push({ to: '/employee-hours', label: 'ניהול עובדים', icon: Briefcase });
    }
    return baseItems;
  };

  const navItems = getNavItems();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- ה-useEffect המתוקן והמלא ---
  useEffect(() => {
    const checkActiveShift = async () => {
      // 1. אם אין משתמש, אפס הכל וחזור
      if (!currentUser) {
        setIsClockedIn(false);
        setShiftStartTime(null);
        setActiveShiftId(null);
        return;
      }
      try {
        const shift = await getActiveShift(currentUser.uid);
        
        // 2. אם נמצאה משמרת פעילה
        if (shift) {
          setIsClockedIn(true);
          // 3. התיקון המרכזי: הסרת .toDate()
          setShiftStartTime(shift.clockInTime);
          setActiveShiftId(shift.id);
        } else {
          // 4. אם לא נמצאה משמרת פעילה, אפס הכל
          setIsClockedIn(false);
          setShiftStartTime(null);
          setActiveShiftId(null);
        }
      } catch (e) {
        console.error('Shift error:', e);
        // 5. במקרה של שגיאה, אפס הכל
        setIsClockedIn(false);
        setShiftStartTime(null);
        setActiveShiftId(null);
      }
    };
    checkActiveShift();
  }, [currentUser]);

  const handleClockIn = async () => {
    if (!currentUser) return;
    setIsProcessingClockAction(true);
    try {
      const id = await clockIn(currentUser.uid, userData?.fullName);
      setActiveShiftId(id);
      setIsClockedIn(true);
      setShiftStartTime(new Date());
    } catch(e) {
        console.error('Error clocking in:', e);
    } finally {
      setIsProcessingClockAction(false);
    }
  };

  // AppSidebar.tsx -> החלף את הפונקציה הקיימת בזו
const handleClockOut = async () => {
  console.log('--- ניסיון לבצע יציאה ---');
  console.log('מנסה לצאת עם מזהה משמרת (activeShiftId):', activeShiftId);
  console.log('משתמש בזמן כניסה (shiftStartTime):', shiftStartTime);

  if (!activeShiftId || !shiftStartTime) {
    console.error('היציאה נכשלה: מזהה משמרת או זמן כניסה חסרים.');
    alert('שגיאה: לא ניתן לבצע יציאה. נסה לרענן את הדף.');
    return;
  }

  setIsProcessingClockAction(true);
  try {
    await clockOut(activeShiftId, shiftStartTime);
    console.log('היציאה בוצעה בהצלחה בצד הלקוח, מאפס את המצב.');
    // איפוס המצב המקומי
    setIsClockedIn(false);
    setShiftStartTime(null);
    setActiveShiftId(null);
  } catch (e) {
    console.error('שגיאה מהשירות בעת ניסיון יציאה:', e);
    alert('אירעה שגיאה בעת ניסיון היציאה. בדוק את הקונסול.');
  } finally {
    setIsProcessingClockAction(false);
  }
};
  
  return (
    <Sidebar side="right" className="w-[270px] border-l border-amber-200 bg-white">
      <SidebarHeader className="p-6 border-b border-amber-200">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg shadow-lg flex-shrink-0">
            <img src={logo} alt="הודיה לוגו" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">הודיה</h1>
            <p className="text-base text-amber-700">סלון כלות חברתי</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 my-4 px-4">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 text-base ${
                          isActive
                            ? 'bg-amber-100 text-amber-900 font-semibold shadow-inner'
                            : 'text-gray-600 hover:bg-amber-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="h-6 w-6 flex-shrink-0" />
                      <span className="truncate text-lg">{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-amber-200 space-y-4">
        {currentUser && (
          <Card className="bg-amber-50/50 border-amber-200">
            <CardHeader className="pb-2 pt-2.5 px-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Clock className="h-4 w-4 text-amber-700" /> שעון נוכחות
              </CardTitle>
              <CardDescription className="text-sm pt-0.5">
                {isClockedIn && shiftStartTime
                  ? `נכנסת ב-${shiftStartTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
                  : 'מחוץ למשמרת'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 pb-3">
              <div className="text-center mb-2.5">
                <p className="text-2xl font-bold font-mono text-gray-800 leading-tight">
                  {currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-gray-600">
                  {currentTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleClockIn} disabled={isClockedIn || isProcessingClockAction} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white flex-1 h-8">
                  {isProcessingClockAction && !isClockedIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                </Button>
                <Button size="sm" onClick={handleClockOut} disabled={!isClockedIn || isProcessingClockAction} className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white flex-1 h-8">
                  {isProcessingClockAction && isClockedIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="h-5 w-5 text-amber-600" />
          </div>
          <div className="truncate flex-1">
            <p className="font-semibold text-gray-800 truncate text-base">{userData?.fullName || currentUser?.displayName || 'משתמש'}</p>
            <p className="text-sm text-gray-500 truncate">{userData?.email || currentUser?.email}</p>
          </div>
          <SidebarMenuButton
            onClick={logout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full"
            title="יציאה"
          >
            <LogOut className="h-5 w-5" />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;