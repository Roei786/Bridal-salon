// EditAppointmentDialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { updateAppointment, Appointment } from '@/services/appointmentService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Bride, getBrides } from '@/services/brideService';
import { Timestamp } from 'firebase/firestore';
interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentUpdated: () => void;
  appointment: Appointment | null;
}

const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({ 
  open, 
  onOpenChange,
  onAppointmentUpdated,
  appointment
}) => {
  const [loading, setLoading] = useState(false);
  const [brides, setBrides] = useState<Bride[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  const [formData, setFormData] = useState<Appointment>({
    id: '',
    brideId: '',
    date: new Date(),
    notes: '',
    status: 'מתוכנן',
    type: 'מדידה ראשונה'
  });

  useEffect(() => {
    // Load brides for the dropdown
    const loadBrides = async () => {
      try {
        const bridesData = await getBrides();
        setBrides(bridesData);
      } catch (error) {
        console.error("Error loading brides:", error);
        toast({
          title: "שגיאה בטעינת נתונים",
          description: "אירעה שגיאה בעת טעינת רשימת הכלות",
          variant: "destructive",
        });
      }
    };

    loadBrides();
  }, []);

  useEffect(() => {
  // Update form data when appointment changes
  if (appointment && appointment.date) {
    let finalDate: Date;

    // --- התיקון כאן: הוספנו לוגיקה לטיפול בכל סוגי התאריכים ---

    // מקרה 1: הערך הוא כבר אובייקט Date של JavaScript
    if (appointment.date instanceof Date) {
      finalDate = appointment.date;
    }
    // מקרה 2: הערך הוא אובייקט Timestamp של Firebase
    else if (
      typeof appointment.date === 'object' &&
      appointment.date !== null &&
      'toDate' in appointment.date &&
      typeof (appointment.date as Timestamp).toDate === 'function'
    ) {
      finalDate = (appointment.date as Timestamp).toDate();
    }
    // מקרה 3: הערך הוא מחרוזת טקסט או מספר
    else {
      finalDate = new Date(appointment.date as string | number);
    }

    setFormData({
      ...appointment,
      date: finalDate
    });
    
    // Set the selected time based on the final converted date
    setSelectedTime(`${String(finalDate.getHours()).padStart(2, '0')}:${String(finalDate.getMinutes()).padStart(2, '0')}`);
  }
}, [appointment]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Keep the time component when changing the date
      const currentDate = formData.date instanceof Date ? formData.date : new Date();
      const newDate = new Date(date);
      newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
      
      setFormData(prev => ({ ...prev, date: newDate }));
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    
    // Update the appointment date with the selected time
    const [hours, minutes] = time.split(':').map(Number);
    const currentDate = formData.date instanceof Date ? formData.date : new Date();
    
    const newDate = new Date(currentDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    
    setFormData(prev => ({ ...prev, date: newDate }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.brideId || !formData.id) {
      toast({
        title: 'שגיאה',
        description: 'אנא בחר כלה',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      await updateAppointment(formData.id, {
        brideId: formData.brideId,
        date: formData.date,
        notes: formData.notes,
        status: formData.status,
        type: formData.type
      });
      
      toast({
        title: 'תור עודכן בהצלחה',
        description: `תור עודכן ל-${format(formData.date instanceof Date ? formData.date : new Date(), 'dd/MM/yyyy HH:mm')}`,
      });
      onAppointmentUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast({
        title: 'שגיאה בעדכון תור',
        description: 'אירעה שגיאה בעת הניסיון לעדכן את התור',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>עריכת תור</DialogTitle>
          <DialogDescription>
            עדכני את פרטי התור כאן. לחצי על שמור כשתסיימי.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brideId">בחר כלה</Label>
              <Select
                value={formData.brideId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, brideId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר כלה" />
                </SelectTrigger>
                <SelectContent>
                  {brides.map((bride) => (
                    <SelectItem key={bride.id} value={bride.id || ''}>
                      {bride.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">תאריך תור</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-right"
                    id="date"
                  >
                    {formData.date ? (
                      format(formData.date instanceof Date ? formData.date : new Date(), "P", { locale: he })
                    ) : (
                      <span>בחר תאריך</span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date instanceof Date ? formData.date : new Date()}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">שעת תור</Label>
              <Select
                value={selectedTime}
                onValueChange={handleTimeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר שעה" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, hour) => {
                    return [0, 30].map(minute => {
                      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                      return (
                        <SelectItem key={timeString} value={timeString}>
                          {timeString}
                        </SelectItem>
                      );
                    });
                  }).flat()}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">סוג תור</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג תור" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מדידה ראשונה">מדידה ראשונה</SelectItem>
                  <SelectItem value="תיקון">תיקון</SelectItem>
                  <SelectItem value="מדידה סופית">מדידה סופית</SelectItem>
                  <SelectItem value="איפור וראש">איפור וראש</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מתוכנן">מתוכנן</SelectItem>
                  <SelectItem value="מאושר">מאושר</SelectItem>
                  <SelectItem value="בוטל">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Textarea
                id="notes"
                placeholder="הכנס הערות לתור"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="text-right resize-none h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button  type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading} className='text-white'>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                'שמור שינויים'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentDialog;