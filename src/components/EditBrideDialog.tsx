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
            description: 'לא ניתן לטעון את רשימת התופרות.',
            variant: 'destructive',
          });
        } finally {
          setLoadingWorkers(false);
        }
      };
      fetchWorkers();
    }
  }, [open]);

  useEffect(() => {
    if (bride) {
      setFormData({
        ...bride,
        weddingDate: bride.weddingDate instanceof Date
          ? bride.weddingDate
          : ('toDate' in bride.weddingDate ? bride.weddingDate.toDate() : new Date()),
        createdAt: bride.createdAt instanceof Date
          ? bride.createdAt
          : ('toDate' in bride.createdAt ? bride.createdAt.toDate() : new Date())
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
          title: 'הצלחה',
          description: `הפרטים של ${formData.fullName} עודכנו בהצלחה`,
        });

        onBrideUpdated();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to update bride:', error);
      toast({
        title: 'שגיאה',
        description: 'לא הצלחנו לעדכן את פרטי הכלה',
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
          <DialogTitle>עריכת כלה</DialogTitle>
          <DialogDescription>עדכני את הפרטים של הכלה</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">טלפון</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weddingDate">תאריך חתונה</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-right">
                    {formData.weddingDate
                      ? format(formData.weddingDate, 'P', { locale: he })
                      : 'בחרי תאריך'}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.weddingDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="historyStatus">סטטוס טיפול</Label>
              <select
                value={formData.historyStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, historyStatus: e.target.value }))}
                className="w-full border rounded p-2 text-right"
              >
                <option value="In Progress">בתהליך</option>
                <option value="Completed">הושלם</option>
                <option value="Cancelled">בוטל</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedSeamstress">תופרת אחראית</Label>
              <Input
                list="seamstresses-list"
                placeholder="בחרי או הזיני שם תופרת"
                value={formData.assignedSeamstress}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedSeamstress: e.target.value }))}
                className="text-right"
              />
              <datalist id="seamstresses-list">
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.fullName} />
                ))}
              </datalist>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="paymentStatus">תשלום בוצע?</Label>
              <Switch
                id="paymentStatus"
                checked={formData.paymentStatus}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, paymentStatus: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading} className="text-white">
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
