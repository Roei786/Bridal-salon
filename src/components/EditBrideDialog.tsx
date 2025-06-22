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
import { updateBride } from '@/services/brideService';
import { Bride } from '@/services/brideService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { getActiveWorkers, Worker } from '@/services/workerService';

interface EditBrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBrideUpdated: () => void;
  bride: Bride | null;
}

const EditBrideDialog: React.FC<EditBrideDialogProps> = ({ 
  open, 
  onOpenChange,
  onBrideUpdated,
  bride
}) => {
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [formData, setFormData] = useState<Bride>({
    id: '',
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

  // Fetch active workers when dialog opens
  useEffect(() => {
    if (open) {
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
    }
  }, [open]);

  // Update form data when bride changes
  useEffect(() => {
    if (bride) {
      setFormData({
        ...bride,
        // Ensure dates are Date objects
        weddingDate: bride.weddingDate instanceof Date ? bride.weddingDate : 
                      (bride.weddingDate && 'toDate' in bride.weddingDate ? bride.weddingDate.toDate() : new Date()),
        createdAt: bride.createdAt instanceof Date ? bride.createdAt : 
                      (bride.createdAt && 'toDate' in bride.createdAt ? bride.createdAt.toDate() : new Date())
      });
    }
  }, [bride]);

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
    
    // Basic validation
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      toast({
        title: 'שגיאה',
        description: 'אנא מלא את כל השדות הנדרשים',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      if (formData.id) {
        await updateBride(formData.id, {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          weddingDate: formData.weddingDate,
          historyStatus: formData.historyStatus,
          paymentStatus: formData.paymentStatus,
          assignedSeamstress: formData.assignedSeamstress,
        });
        
        toast({
          title: 'כלה עודכנה בהצלחה',
          description: `הפרטים של ${formData.fullName} עודכנו במערכת`,
        });
        onBrideUpdated();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to update bride:', error);
      toast({
        title: 'שגיאה בעדכון כלה',
        description: 'אירעה שגיאה בעת הניסיון לעדכן את פרטי הכלה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bride) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>עריכת פרטי כלה</DialogTitle>
          <DialogDescription>
            עדכני את פרטי הכלה כאן. לחצי על שמור כשתסיימי.
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
                      format(
                        formData.weddingDate instanceof Date ? formData.weddingDate : 
                          ('toDate' in formData.weddingDate ? formData.weddingDate.toDate() : new Date()),
                        "P", 
                        { locale: he }
                      )
                    ) : (
                      <span>בחר תאריך חתונה</span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.weddingDate instanceof Date ? formData.weddingDate : 
                      ('toDate' in formData.weddingDate ? formData.weddingDate.toDate() : new Date())}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="historyStatus">סטטוס טיפול</Label>
              <Select 
                value={formData.historyStatus}
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
              <Select 
                value={formData.assignedSeamstress || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedSeamstress: value }))}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר תופרת" />
                </SelectTrigger>
                <SelectContent>
                  {loadingWorkers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>טוען תופרות...</span>
                    </div>
                  ) : workers.length > 0 ? (
                    workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.fullName}>
                        {worker.fullName}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-muted-foreground text-center text-sm">
                      לא נמצאו תופרות
                    </div>
                  )}
                </SelectContent>
              </Select>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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

export default EditBrideDialog;
