// src/components/EditBrideDialog.tsx

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Bride, updateBride } from '@/services/brideService';

export interface EditBrideDialogProps {
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
  const [formData, setFormData] = useState<Partial<Bride>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // אתחול הטופס עם נתוני הכלה כשהדיאלוג נפתח
    if (bride) {
      setFormData({
        fullName: bride.fullName || '',
        phoneNumber: bride.phoneNumber || '',
        email: bride.email || '',
        assignedSeamstress: bride.assignedSeamstress || '',
      });
    }
  }, [bride]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bride) return;
    
    setIsLoading(true);
    try {
      // עדכון המסמך ב-Firestore רק עם השדות שהשתנו
      await updateBride(bride.id, formData);
      onBrideUpdated(); // רענון רשימת הכלות בעמוד הקודם
      onOpenChange(false); // סגירת הדיאלוג
    } catch (error) {
      console.error('Error updating bride:', error);
      alert('שגיאה בעדכון פרטי הכלה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>עריכת פרטי כלה: {bride?.fullName}</DialogTitle>
          <DialogDescription>
            עדכן את פרטי הכלה ולחץ על שמירה בסיום.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="fullName" className="text-right">שם מלא</Label>
            <Input id="fullName" value={formData.fullName || ''} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="phoneNumber" className="text-right">מספר טלפון</Label>
            <Input id="phoneNumber" value={formData.phoneNumber || ''} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="email" className="text-right">אימייל</Label>
            <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
          </div>
          
          {/* --- החזרנו את שדה התופרת להיות שדה טקסט חופשי --- */}
          <div>
            <Label htmlFor="assignedSeamstress">שם התופרת</Label>
            <Input
              id="assignedSeamstress"
              value={formData.assignedSeamstress || ''}
              onChange={handleInputChange}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-amber-500 text-white hover:bg-amber-600">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBrideDialog;