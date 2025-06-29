import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateDoc, doc, getDocs, collection, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { useToast } from '@/components/ui/use-toast';

interface EditBrideDialogProps {
  bride: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditBrideDialog: React.FC<EditBrideDialogProps> = ({ bride, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(bride);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(bride);
  }, [bride]);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoadingWorkers(true);
      try {
        const workersSnapshot = await getDocs(collection(db, 'workers'));
        const workersList = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWorkers(workersList);
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setLoadingWorkers(false);
      }
    };

    fetchWorkers();
  }, []);

  const handleSave = async () => {
    try {
      const brideRef = doc(db, 'Brides', bride.id);

      // אם תופרת חדשה - נוסיף לקולקשן workers
      const seamstressExists = workers.some(w => w.fullName === formData.assignedSeamstress);
      if (formData.assignedSeamstress && !seamstressExists) {
        await addDoc(collection(db, 'workers'), {
          fullName: formData.assignedSeamstress
        });
      }

      await updateDoc(brideRef, formData);
      toast({ title: 'הכלה עודכנה בהצלחה 🎉' });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating bride:', error);
      toast({ title: 'שגיאה בעדכון הכלה', description: 'נסי שוב מאוחר יותר', variant: 'destructive' });
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>עריכת כלה</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">שם מלא</Label>
            <Input
              id="fullName"
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">טלפון</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="assignedSeamstress">תופרת אחראית</Label>
            <Input
              list="seamstresses-list"
              placeholder="בחרי או הזיני שם תופרת"
              value={formData.assignedSeamstress || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, assignedSeamstress: e.target.value }))
              }
              className="text-right"
            />
            <datalist id="seamstresses-list">
              {workers.map((worker) => (
                <option key={worker.id} value={worker.fullName} />
              ))}
            </datalist>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={onClose}>ביטול</Button>
            <Button onClick={handleSave} className="bg-green-600 text-white hover:bg-green-700">
              שמירה
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBrideDialog;
