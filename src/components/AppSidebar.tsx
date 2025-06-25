import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Crown, LayoutDashboard, Users, Calendar, LogOut, ShieldCheck, Clock, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FileText } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActiveShift, clockIn, clockOut } from '@/services/shiftService';
import logo from '../../public/files/logo.png';

const AppSidebar = () => {
  const { logout, currentUser, userData } = useAuth();
  
  // Attendance Clock State
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [isProcessingClockAction, setIsProcessingClockAction] = useState(false);

  const navItems = [
    {
      to: '/',
      label: 'לוח מחוונים',
      icon: LayoutDashboard
    },
    {
      to: '/brides',
      label: 'ניהול כלות',
      icon: Crown
    },
    {
      to: '/calendar',
      label: 'לוח זמנים',
      icon: Calendar
    },
    {
      to: '/forms',
      label: 'טפסים',
      icon: FileText
    }
  ];

  // useEffect for the live clock display
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  // useEffect to check for active shift when user changes
  useEffect(() => {
    const checkActiveShift = async () => {
      if (!currentUser) {
        setIsClockedIn(false);
        setShiftStartTime(null);
        setActiveShiftId(null);
        return;
      }

      try {
        const activeShift = await getActiveShift(currentUser.uid);
        if (activeShift && activeShift.clockInTime && !activeShift.clockOutTime) {
          setIsClockedIn(true);
          setShiftStartTime(activeShift.clockInTime.toDate());
          setActiveShiftId(activeShift.id);
        } else {
          setIsClockedIn(false);
          setShiftStartTime(null);
          setActiveShiftId(null);
        }
      } catch (error) {
        console.error('Error fetching active shift:', error);
      }
    };

    checkActiveShift();
  }, [currentUser]);

  // Handlers for clocking in and out
  const handleClockIn = async () => {
    if (!currentUser) return;
    setIsProcessingClockAction(true);
    try {
      const newShiftId = await clockIn(currentUser.uid);
      setActiveShiftId(newShiftId);
      setIsClockedIn(true);
      setShiftStartTime(new Date());
    } catch (error) {
      console.error('Error clocking in:', error);
    } finally {
      setIsProcessingClockAction(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeShiftId || !shiftStartTime) return;
    setIsProcessingClockAction(true);
    try {
      await clockOut(activeShiftId, shiftStartTime);
      setIsClockedIn(false);
      setShiftStartTime(null);
      setActiveShiftId(null);
    } catch (error) {
      console.error('Error clocking out:', error);
    } finally {
      setIsProcessingClockAction(false);
    }
  };

  return (
    <Sidebar side="right" className="border-l border-amber-200">
      <SidebarHeader className="p-6 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
            <img 
              src={logo}
              alt="הודיה לוגו" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-bold text-gray-900">הודיה</h1>
            <p className="text-sm text-amber-700">סלון כלות חברתי</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
      

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-5 my-4 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to} className="relative">
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => {
                        return `flex items-center gap-4 w-full p-4 transition-all duration-300 ${
                          isActive
                            ? 'bg-amber-100 text-amber-800 rounded-md font-bold shadow-md relative z-10 border-r-4 border-amber-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`absolute top-0 left-0 w-full h-full rounded-md ${isActive ? 'bg-amber-50 animate-pulse opacity-40' : 'opacity-0'}`}></div>
                          <div className={`absolute right-0 top-0 h-full w-2 ${isActive ? 'bg-amber-500' : ''}`}></div>
                          <item.icon className={`h-7 w-7 ${isActive ? 'text-amber-700' : ''} transition-colors duration-300`} />
                          <span className={`text- font-medium ${isActive ? 'scale-105 transform text-amber-800' : ''} transition-transform duration-300`}>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
                
      <SidebarFooter className="p-4 border-t border-amber-200">
        <div>
          {/* Attendance Clock Section */}
        {currentUser && (
          <div className="p-4 border-b border-amber-200">
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-amber-700" />
                  שעון נוכחות
                </CardTitle>
                <CardDescription className="text-xs">
                  {isClockedIn && shiftStartTime
                    ? `נכנסת ב-${shiftStartTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
                    : 'מחוץ למשמרת'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center mb-3">
                  <p className="text-2xl font-bold font-mono text-gray-800">
                    {currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-600">
                    {currentTime.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleClockIn}
                    disabled={isClockedIn || isProcessingClockAction}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white flex-1 text-xs"
                  >
                    {isProcessingClockAction && !isClockedIn ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <LogIn className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    onClick={handleClockOut}
                    disabled={!isClockedIn || isProcessingClockAction}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white flex-1 text-xs"
                  >
                    {isProcessingClockAction && isClockedIn ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <LogOut className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
        <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-amber-600" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-medium text-gray-900">{userData?.fullName || currentUser?.displayName || 'משתמש'}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-gray-600">{userData?.email || currentUser?.email}</p>
            </div>
            {userData?.role && (
              <div className="flex items-center mt-1 gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-medium bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">
                  {userData.role === 'manager' ? 'מנהל/ת' : userData.role}
                </span>
              </div>
            )}
          </div>
        </div>
        <SidebarMenuButton 
          onClick={logout}
          className="flex items-center gap-2 w-full text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors group-data-[collapsible=icon]:justify-center"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">יציאה</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;