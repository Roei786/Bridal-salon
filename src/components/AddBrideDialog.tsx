// AddBrideDialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { getActiveWorkers, Worker, addWorkerIfNotExists } from '@/services/workerService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Bride, addBride } from '@/services/brideService';

interface AddBrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBrideAdded: () => void;
}

const AddBrideDialog: React.FC<AddBrideDialogProps> = ({ 
  open, 
  onOpenChange,
  onBrideAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [formData, setFormData] = useState<Omit<Bride, 'id'>>({
    fullName: '',
    email: '',
    phoneNumber: '',
    weddingDate: new Date(),
    createdAt: new Date(),
    historyStatus: 'In Progress',
    paymentStatus: false,
    assignedSeamstress: '',
    beforeImages: [],
    afterImages: []
  });
  // Fetch the list of active workers when the component loads
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoadingWorkers(true);
      try {
        const activeWorkers = await getActiveWorkers();
        setWorkers(activeWorkers);
      } catch (error) {
        console.error('Error fetching workers:', error);
        toast({
          title: 'שגיאה בטעינת רשימת תופרות',
          description: 'לא ניתן לטעון את רשימת התופרות. אנא נסה שוב מאוחר יותר.',
          variant: 'destructive',
        });
      } finally {
        setLoadingWorkers(false);
      }
    };
    
    fetchWorkers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, weddingDate: date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      toast({
        title: 'שגיאה',
        description: 'אנא מלאי את כל השדות הנדרשים',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (formData.assignedSeamstress) {
        await addWorkerIfNotExists(formData.assignedSeamstress);
      }

      const brideId = await addBride(formData);

      const now = new Date();

      await setDoc(doc(db, `Brides/${brideId}/appointments/placeholder`), {
        createdAt: now,
      });

      await setDoc(doc(db, `Brides/${brideId}/measurements/initial`), {
        bust: '',
        waist: '',
        hips: '',
        height: '',
        notes: '',
        createdAt: now,
      });

      await setDoc(doc(db, `Brides/${brideId}/preparationForm/form`), {
        makeup: '',
        hair: '',
        dressReady: false,
        notes: '',
        createdAt: now,
      });

      toast({
        title: 'כלה נוספה בהצלחה',
        description: `${formData.fullName} נוספה למערכת`,
      });

      onBrideAdded();
      onOpenChange(false);

      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        weddingDate: new Date(),
        createdAt: new Date(),
        historyStatus: 'In Progress',
        paymentStatus: false,
        assignedSeamstress: '',
        beforeImages: [],
        afterImages: [],
      });

    } catch (error) {
      console.error('❌ Failed to add bride:', error);
      toast({
        title: 'שגיאה בהוספת כלה',
        description: 'אירעה שגיאה בעת הניסיון להוסיף כלה חדשה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הוספת כלה חדשה</DialogTitle>
          <DialogDescription>
            הכניסי את פרטי הכלה החדשה כאן. לחצי על שמור כשתסיימי.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input 
                id="fullName" 
                name="fullName"
                placeholder="הכניסי שם מלא" 
                value={formData.fullName}
                onChange={handleInputChange}
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">דואר אלקטרוני</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="דוא״ל" 
                value={formData.email}
                onChange={handleInputChange}
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">מספר טלפון</Label>
              <Input 
                id="phoneNumber" 
                name="phoneNumber" 
                placeholder="מספר טלפון" 
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weddingDate">תאריך חתונה</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-right"
                    id="weddingDate"
                  >
                    {formData.weddingDate ? (
                      // Ensure we're dealing with a Date object
                      format(formData.weddingDate instanceof Date ? formData.weddingDate : new Date(), "P", { locale: he })
                    ) : (
                      <span>בחר תאריך חתונה</span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.weddingDate instanceof Date ? formData.weddingDate : new Date()}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="historyStatus">סטטוס טיפול</Label>
              <Select 
                defaultValue={formData.historyStatus}
                onValueChange={(value) => setFormData(prev => ({ ...prev, historyStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Progress">בתהליך</SelectItem>
                  <SelectItem value="Completed">הושלם</SelectItem>
                  <SelectItem value="Cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedSeamstress">תופרת אחראית</Label>
              {loadingWorkers ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>טוען תופרות...</span>
                </div>
              ) : (
                <>
                  <Input
                    list="seamstresses-list"
                    placeholder="בחרי או הזיני שם תופרת"
                    value={formData.assignedSeamstress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignedSeamstress: e.target.value,
                      }))
                    }
                    className="text-right"
                  />
                  <datalist id="seamstresses-list">
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.fullName} />
                    ))}
                  </datalist>
                </>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="paymentStatus">תשלום בוצע?</Label>
              <Switch 
                id="paymentStatus" 
                checked={formData.paymentStatus}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, paymentStatus: checked }))}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between bg-white sticky bottom-0 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button className='text-white' type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mx-2 h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                'שמור כלה'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBrideDialog;


