import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Users,
  DollarSign,
  Clock,
  Crown,
  Heart,
  AlertCircle,
  Loader2,
  TrendingUp,
  Scissors,
  Calendar,
  Ruler,
  ArrowUp,
  ArrowDown,
  LinkIcon,
  ExternalLink,
  ChevronLeft,
  LayoutDashboard,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, isWithinInterval, addDays, differenceInDays, isBefore } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';


import { getBrides, Bride } from '@/services/brideService';
import { getAppointments, Appointment } from '@/services/appointmentService';
import { getMeasurementsByBrideId, Measurement } from '@/services/measurementService';
import { getActiveShift, clockIn, clockOut } from '@/services/shiftService';
import { useAuth } from '@/contexts/AuthContext';




interface FormattedAppointment {
  id: string;
  name: string;
  time: string;
  date: string;
  service: string;
  status: string;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [brides, setBrides] = useState<Bride[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  // Stats state
  const [totalBrides, setTotalBrides] = useState(0);
  const [weeklyAppointments, setWeeklyAppointments] = useState(0);
  const [unpaidBrides, setUnpaidBrides] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [upcomingWeddings, setUpcomingWeddings] = useState(0);
  const [averageMeasurements, setAverageMeasurements] = useState(0);
  const [measurementsThisMonth, setMeasurementsThisMonth] = useState(0);
  const { userData } = useAuth();
  // State for the Attendance Clock and Authentication
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProcessingClockAction, setIsProcessingClockAction] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Helper function to get a proper Date object
  const getDateFromAppointment = (dateInput: Date | Timestamp | string): Date => {
    if (dateInput instanceof Date) {
      return dateInput;
    } else if (dateInput instanceof Timestamp) {
      return dateInput.toDate();
    } else if (typeof dateInput === 'string') {
      // Special handling for date strings with time
      if (dateInput.includes(' ')) {
        const [datePart, timePart] = dateInput.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
      }
      return new Date(dateInput);
    } else {
      return new Date();
    }
  };

  // useEffect for the live clock display
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  // useEffect to listen for authentication changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (!user) {
        // Reset state if user logs out
        setIsClockedIn(false);
        setShiftStartTime(null);
        setActiveShiftId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Main data fetching useEffect, dependent on the current user
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return; // Don't fetch if no user is logged in
      }
      setLoading(true);

      try {
        // Date range for this week
        const today = new Date();
        const weekStart = startOfWeek(today);
        const weekEnd = endOfWeek(today);

        // 2. Fetch brides
        const bridesData = await getBrides();
        setBrides(bridesData);
        setTotalBrides(bridesData.length);

        // Count unpaid brides
        const unpaidCount = bridesData.filter(bride => !bride.paymentStatus).length;
        setUnpaidBrides(unpaidCount);

        // Count upcoming weddings (within the next 30 days)
        const thirtyDaysFromNow = addDays(today, 30);
        const weddingsCount = bridesData.filter(bride => {
          const weddingDate = getDateFromAppointment(bride.weddingDate);
          return isBefore(weddingDate, thirtyDaysFromNow) && isBefore(today, weddingDate);
        }).length;
        setUpcomingWeddings(weddingsCount);

        // 3. Fetch appointments
        const appointmentsData = await getAppointments();
        setAppointments(appointmentsData);

        // Count appointments for this week
        const thisWeekAppointments = appointmentsData.filter(appointment => {
          const appointmentDate = getDateFromAppointment(appointment.date);
          return isWithinInterval(appointmentDate, { start: weekStart, end: weekEnd });
        });
        setWeeklyAppointments(thisWeekAppointments.length);

        // Count completed services this week
        const completedThisWeek = appointmentsData.filter(appointment => {
          const appointmentDate = getDateFromAppointment(appointment.date);
          return isWithinInterval(appointmentDate, { start: weekStart, end: weekEnd }) &&
            appointment.status === 'Completed';
        });
        setCompletedServices(completedThisWeek.length);

        // 4. Fetch all measurements for analytics
        let allMeasurements: Measurement[] = [];
        for (const bride of bridesData) {
          if (bride.id) {
            try {
              const brideMeasurements = await getMeasurementsByBrideId(bride.id);
              allMeasurements = [...allMeasurements, ...brideMeasurements];
            } catch (error) {
              console.error(`Error fetching measurements for bride ${bride.id}:`, error);
            }
          }
        }

        setMeasurements(allMeasurements);

        // Calculate average measurements per bride
        const uniqueBrideIds = new Set(allMeasurements.map(m => m.brideID)).size;
        const avgMeasurements = uniqueBrideIds > 0 ?
          Math.round((allMeasurements.length / uniqueBrideIds) * 10) / 10 : 0;
        setAverageMeasurements(avgMeasurements);

        // Count measurements this month
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const measurementsCount = allMeasurements.filter(measurement => {
          const measurementDate = getDateFromAppointment(measurement.date);
          return measurementDate >= firstDayOfMonth;
        }).length;
        setMeasurementsThisMonth(measurementsCount);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Dashboard stats configuration
  const stats = [
    {
      title: 'סה"כ כלות רשומות',
      value: totalBrides.toString(),
      icon: Crown,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'תורים השבוע',
      value: weeklyAppointments.toString(),
      icon: CalendarDays,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'כלות שטרם שילמו',
      value: unpaidBrides.toString(),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'תסרוקות בוצעו השבוע',
      value: completedServices.toString(),
      icon: Heart,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    }
  ];

  const extraStats = [
    {
      title: 'חתונות ב-30 יום הקרובים',
      value: upcomingWeddings.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'מדידות החודש',
      value: measurementsThisMonth.toString(),
      icon: Ruler,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'מדידות לכל כלה בממוצע',
      value: averageMeasurements.toString(),
      icon: Scissors,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
  ];

  // Format upcoming appointments
  const getFormattedDate = (date: Date | Timestamp | string): string => {
    const dateObj = getDateFromAppointment(date);
    const todayDate = new Date();
    const tomorrowDate = addDays(todayDate, 1);

    // Format the date as dd/MM/yyyy
    const formattedFullDate = format(dateObj, 'dd/MM/yyyy');

    // Create copies of the dates for comparison without modifying the original
    const dateObjCopy = new Date(dateObj);
    const todayCopy = new Date(todayDate);
    const tomorrowCopy = new Date(tomorrowDate);

    // Hebrew days of week
    const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];
    const dayName = days[dateObj.getDay()];

    // Compare only the date part, not the time
    if (dateObjCopy.setHours(0, 0, 0, 0) === todayCopy.setHours(0, 0, 0, 0)) {
      return `היום - ${formattedFullDate}`;
    } else if (dateObjCopy.setHours(0, 0, 0, 0) === tomorrowCopy.setHours(0, 0, 0, 0)) {
      return `מחר - ${formattedFullDate}`;
    } else {
      // Return day of week in Hebrew with the date
      return `${dayName} - ${formattedFullDate}`;
    }
  };

  const upcomingAppointments: FormattedAppointment[] = appointments
    .filter(appointment => {
      const appointmentDate = getDateFromAppointment(appointment.date);
      const now = new Date();
      return appointmentDate >= now;
    })
    .sort((a, b) => {
      const dateA = getDateFromAppointment(a.date);
      const dateB = getDateFromAppointment(b.date);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5) // Get the nearest 5 appointments
    .map(appointment => {
      // Find the bride for this appointment
      const bride = brides.find(b => b.id === appointment.brideId);
      const appointmentDate = getDateFromAppointment(appointment.date);

      return {
        id: appointment.id || '',
        name: bride?.fullName || 'לקוחה לא מזוהה',
        time: format(appointmentDate, 'HH:mm'),
        date: getFormattedDate(appointment.date),
        service: appointment.type || 'פגישת ייעוץ',
        status: appointment.status === 'Pending' ? 'ממתין לאישור' :
          appointment.status === 'Completed' ? 'הושלם' : 'מאושר'
      };
    });

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 text-amber-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600">טוען...</p>
      </div>
    );
  }

  // Show login required message if no user is authenticated
  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-3xl font-semibold text-gray-900 mb-2">נדרשת התחברות</h3>
          <p className="text-xl text-gray-600 mb-6">יש להתחבר למערכת כדי לראות את לוח המחוונים.</p>
          <Link to="/login">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              עבור להתחברות
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with background image */}
      <div
        className="text-center mb-8 p-10 rounded-lg shadow-xl"
        style={{
          backgroundImage: `url('/files/background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'white', // Ensure text is visible over the image
          textShadow: '4px 4px 4px rgba(0,0,0,0.7)', // Add text shadow for better readability
          minHeight: '200px', // Ensure enough height for the background image to show
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1 className="text-4xl font-bold mb-2">הודיה - סלון כלות חברתי</h1>
        {userData && (<p className="text-lg">שלום, {userData.fullName}</p>)}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-amber-600 animate-spin mb-4" />
          <p className="text-lg text-gray-600">טוען נתונים...</p>
        </div>
      ) : (
        <>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-amber-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  תורים קרובים
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                        <div>
                          <h4 className="font-semibold text-gray-900">{appointment.name}</h4>
                          <p className="text-sm text-gray-600">{appointment.service}</p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3.5 w-3.5 text-amber-600 mr-1.5" />
                            <p className="text-xs font-medium text-amber-700">
                              {appointment.date} בשעה {appointment.time}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'מאושר'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'הושלם'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                    <p className="text-gray-600">אין תורים קרובים</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  לוח זמנים חתונות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {brides.length > 0 ? (
                    <>
                      {(() => {
                        // Get upcoming weddings sorted by date
                        const upcomingWeddingsData = brides
                          .filter(bride => {
                            const weddingDate = getDateFromAppointment(bride.weddingDate);
                            return weddingDate >= new Date();
                          })
                          .sort((a, b) => {
                            const dateA = getDateFromAppointment(a.weddingDate);
                            const dateB = getDateFromAppointment(b.weddingDate);
                            return dateA.getTime() - dateB.getTime();
                          })
                          .slice(0, 4);

                        return upcomingWeddingsData.length > 0 ? (
                          <div className="space-y-3">
                            {upcomingWeddingsData.map((bride) => {
                              const weddingDate = getDateFromAppointment(bride.weddingDate);
                              const daysUntil = differenceInDays(weddingDate, new Date());
                              let badgeColor = 'bg-gray-100 text-gray-800';

                              if (daysUntil < 7) badgeColor = 'bg-red-100 text-red-800';
                              else if (daysUntil < 30) badgeColor = 'bg-amber-100 text-amber-800';
                              else badgeColor = 'bg-green-100 text-green-800';

                              return (
                                <div key={bride.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{bride.fullName}</h4>
                                    <p className="text-xs text-gray-500">{format(weddingDate, 'dd/MM/yyyy')}</p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                                    {daysUntil === 0 ? 'היום!' : daysUntil === 1 ? 'מחר' : `${daysUntil} ימים`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500">אין חתונות מתוכננות בקרוב</p>
                        );
                      })()}

                      <div className="grid grid-cols-1 mt-3">
                        <div className="p-4 bg-amber-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-amber-800 mb-1">סטטיסטיקה</p>
                              <p className="text-sm text-gray-600">חתונות בחודש הקרוב: <span className="font-bold">{upcomingWeddings}</span></p>
                              <p className="text-sm text-gray-600">סך הכל לקוחות: <span className="font-bold">{totalBrides}</span></p>
                            </div>
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
                              <Crown className="h-6 w-6 text-amber-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                      <p className="text-gray-600">אין נתוני כלות זמינים</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>


        </>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {extraStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>


  );
};
export default Dashboard;