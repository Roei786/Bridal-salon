// Calendar.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Crown, 
  Plus,
  Loader2,
  Edit,
  Info
} from 'lucide-react';
import { getAppointmentsByDate, Appointment } from '@/services/appointmentService';
import AddAppointmentDialog from './AddAppointmentDialog';
import EditAppointmentDialog from './EditAppointmentDialog';
import AppointmentDetailsDialog from './AppointmentDetailsDialog';
import { format, isToday, isSameDay, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { getBrideById } from '@/services/brideService';
import { useToast } from '@/components/ui/use-toast';
import { Timestamp } from 'firebase/firestore';
import { deletePastAppointments } from '@/services/appointmentService';

interface AppointmentWithBride extends Appointment {
  brideName?: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithBride[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithBride | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const { toast } = useToast();

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      // שלב 1: טען את כל הפגישות הרלוונטיות
      const start = startOfMonth(currentDate);
      const end = addDays(endOfMonth(currentDate), 1); // כולל סוף חודש

      const appointmentsData = await getAppointmentsByDate(start, end);

      // שלב 2: העשר עם שמות הכלות
      const appointmentsWithBrides: AppointmentWithBride[] = [];

      for (const appointment of appointmentsData) {
        try {
          const bride = await getBrideById(appointment.brideId);
          appointmentsWithBrides.push({
            ...appointment,
            brideName: bride?.fullName || 'כלה לא ידועה'
          });
        } catch {
          appointmentsWithBrides.push({
            ...appointment,
            brideName: 'כלה לא ידועה'
          });
        }
      }

      // שלב 3: שמור את כל הפגישות ביומן (כולל אלו שעברו!)
      setAppointments(appointmentsWithBrides);

    } catch (error) {
      console.error("Error loading appointments:", error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בעת טעינת התורים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hebrewDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  const hebrewMonths = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getAppointmentsForDate = (day: number | null) => {
    if (!day) return [];
    
    const dateToCheck = new Date(currentDate);
    dateToCheck.setDate(day);
    
    return appointments.filter(appointment => {
      // Handle different date types (Date, Timestamp, or string)
      let appointmentDate: Date;
      if (appointment.date instanceof Date) {
        appointmentDate = appointment.date;
      } else if (appointment.date instanceof Timestamp) {
        appointmentDate = appointment.date.toDate();
      } else if (typeof appointment.date === 'string') {
        // For string dates like "2025-06-01", create a date object
        appointmentDate = new Date(appointment.date);
      } else {
        appointmentDate = new Date();
      }
      return isSameDay(appointmentDate, dateToCheck);
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDayClick = (day: number | null) => {
    if (day !== null) {
      setSelectedDay(day);
      
      // Create a date object for the selected day
      const dayDate = new Date(currentDate);
      dayDate.setDate(day);
      setSelectedDate(dayDate);
    }
  };

  const handleAddAppointment = (day?: number) => {
    if (day) {
      const dateForAppointment = new Date(currentDate);
      dateForAppointment.setDate(day);
      dateForAppointment.setHours(10, 0, 0, 0); // Default time 10:00 AM
      setSelectedDate(dateForAppointment);
    } else {
      setSelectedDate(new Date());
    }
    setAddDialogOpen(true);
  };

  const handleEditAppointment = (appointment: AppointmentWithBride) => {
    setSelectedAppointment(appointment);
    setEditDialogOpen(true);
  };
  
  const handleViewAppointmentDetails = (appointment: AppointmentWithBride) => {
    setSelectedAppointment(appointment);
    setDetailsDialogOpen(true);
  };

  // Get appointments for the selected day or today if no day is selected
  const selectedDayAppointments = (() => {
    if (selectedDay === null) {
      // Show today's appointments if no day is selected
      return appointments.filter(appointment => {
        let appointmentDate: Date;
        if (appointment.date instanceof Date) {
          appointmentDate = appointment.date;
        } else if (appointment.date instanceof Timestamp) {
          appointmentDate = appointment.date.toDate();
        } else if (typeof appointment.date === 'string') {
          appointmentDate = new Date(appointment.date);
        } else {
          appointmentDate = new Date();
        }
        return isToday(appointmentDate);
      });
    }
    
    // Otherwise, return appointments for the selected day
    return getAppointmentsForDate(selectedDay);
  })();

  return (
    <div className="p-2 md:p-4 space-y-4 w-full max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-pink-600" />
            לוח זמנים
          </h1>
          <p className="text-gray-600 mt-1">ניהול תורים ותזמון</p>
        </div>
        <Button 
          className="bg-pink-600 hover:bg-pink-700 text-white"
          onClick={() => handleAddAppointment()}
        >
          <Plus className="h-4 w-4 ml-2" />
          הוסף תור חדש
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
          <span className="text-lg text-gray-600 mr-3">טוען תורים...</span>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Calendar */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  {hebrewMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {hebrewDays.map((day) => (
                  <div key={day} className="py-3 text-center font-bold text-gray-700 bg-gray-100 rounded text-lg">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentDate).map((day, index) => {
                  const dayAppointments = getAppointmentsForDate(day);
                  const isCurrentDay = day && 
                    currentDate.getFullYear() === new Date().getFullYear() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    day === new Date().getDate();

                  return (
                    <div
                      key={index}
                      onClick={(e) => {
                        if (day) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDayClick(day); // Only update the side panel, don't open the add dialog
                        }
                      }}
                      className={`
                        min-h-[100px] md:min-h-[120px] p-2 md:p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group
                        ${day ? 'bg-white' : 'bg-gray-100'}
                        ${isCurrentDay ? 'ring-2 ring-pink-500 bg-pink-50' : ''}
                        ${day && day === selectedDay ? 'ring-2 ring-blue-500' : ''}
                      `}
                    >
                      {day && (
                        <>
                          <div className="flex justify-between items-center mb-1">
                            <div className={`text-sm font-medium ${isCurrentDay ? 'text-pink-700' : 'text-gray-900'}`}>
                              {day}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 hover:bg-pink-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddAppointment(day);
                                }}
                              >
                                <Plus className="h-4 w-4 text-pink-600" />
                            </Button>

                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => {
                              // Handle different date types
                              let appointmentDate: Date;
                              if (apt.date instanceof Date) {
                                appointmentDate = apt.date;
                              } else if (apt.date instanceof Timestamp) {
                                appointmentDate = apt.date.toDate();
                              } else if (typeof apt.date === 'string') {
                                appointmentDate = new Date(apt.date);
                              } else {
                                appointmentDate = new Date();
                              }
                              
                              return (
                                <div
                                  key={apt.id}
                                  className={`text-xs p-1 rounded text-white truncate ${
                                    apt.status === 'מאושר' ? 'bg-green-500' : 
                                    apt.status === 'בוטל' ? 'bg-red-500' : 'bg-yellow-500'
                                  }`}
                                  title={`${format(appointmentDate, 'HH:mm')} - ${apt.brideName}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewAppointmentDetails(apt); // Show details instead of edit
                                  }}
                                >
                                  {format(appointmentDate, 'HH:mm')} {apt.brideName}
                                </div>
                              );
                            })}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayAppointments.length - 2} נוספים
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-pink-600" />
                {selectedDay ? (
                  <>
                    תורים ליום {selectedDay} {hebrewMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
                    <span className="text-sm text-gray-500 font-normal mr-1">
                      ({selectedDayAppointments.length} תורים)
                    </span>
                  </>
                ) : (
                  <>
                    תורים להיום
                    <span className="text-sm text-gray-500 font-normal mr-1">
                      ({selectedDayAppointments.length} תורים)
                    </span>
                  </>
                )}
              </CardTitle>
              {selectedDay && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleAddAppointment(selectedDay)}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף תור חדש
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedDayAppointments.length > 0 ? (
                  selectedDayAppointments.map((appointment) => {
                    // Handle different date types
                    let appointmentDate: Date;
                    if (appointment.date instanceof Date) {
                      appointmentDate = appointment.date;
                    } else if (appointment.date instanceof Timestamp) {
                      appointmentDate = appointment.date.toDate();
                    } else if (typeof appointment.date === 'string') {
                      appointmentDate = new Date(appointment.date);
                    } else {
                      appointmentDate = new Date();
                    }

                    const isPast = appointmentDate < new Date();

                    return (
                      <div 
                        key={appointment.id} 
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          isPast ? 'bg-gray-100 opacity-50' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handleViewAppointmentDetails(appointment)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{format(appointmentDate, 'HH:mm')}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              appointment.status === 'מאושר' ? 'bg-green-100 text-green-800' : 
                              appointment.status === 'בוטל' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }>
                              {appointment.status}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={(e) => {
                                e.stopPropagation(); 
                                handleEditAppointment(appointment);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-pink-600" />
                            <span className="font-medium">{appointment.brideName}</span>
                          </div>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                          {appointment.notes && appointment.notes.length > 30 ? (
                            <p className="text-xs bg-gray-100 p-2 rounded mt-1">
                              {appointment.notes.slice(0, 30)}...
                            </p>
                          ) : appointment.notes ? (
                            <p className="text-xs bg-gray-100 p-2 rounded mt-1">{appointment.notes}</p>
                          ) : null}
                          {isPast && (
                            <p className="text-xs text-red-600 font-medium mt-1">פגישה שעברה</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {selectedDay ? (
                        <>אין תורים בתאריך זה</>
                      ) : (
                        <>אין תורים היום</>
                      )}
                    </p>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => handleAddAppointment(selectedDay || undefined)}
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      הוסף תור חדש
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}

      {/* Add Appointment Dialog */}
      <AddAppointmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAppointmentAdded={loadAppointments}
        selectedDate={selectedDate}
      />

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onAppointmentUpdated={loadAppointments}
        appointment={selectedAppointment}
      />

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onDelete={loadAppointments}
      />
    </div>
  );
};

export default Calendar;
