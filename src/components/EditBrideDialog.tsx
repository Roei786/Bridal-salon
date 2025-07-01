import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Bride, updateBride } from '@/services/brideService';
import { addWorkerIfNotExists } from '@/services/workerService';
import { getActiveWorkers } from '@/services/workerService';

// Define Worker type locally if not exported from '@/types'
type Worker = {
  name: string;
};

export interface EditBrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBrideUpdated: () => Promise<void>;
  bride: Bride | null;
}

const EditBrideDialog: React.FC<EditBrideDialogProps> = ({
  open,
  onOpenChange,
  onBrideUpdated,
  bride
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [assignedSeamstress, setAssignedSeamstress] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    if (bride) {
      setFullName(bride.fullName || '');
      setPhoneNumber(bride.phoneNumber || '');
      setEmail(bride.email || '');
      setAssignedSeamstress(bride.assignedSeamstress || '');
    }
  }, [bride]);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const workersList = await getWorkers();
        setWorkers(workersList);
      } catch (error) {
        console.error('Failed to fetch workers:', error);
      }
    };
    fetchWorkers();
  }, []);

  const handleSubmit = async () => {
    if (!bride) return;

    const updatedBride: Bride = {
      ...bride,
      fullName,
      phoneNumber,
      email,
      assignedSeamstress
    };

    if (assignedSeamstress && !workers.some(w => w.name === assignedSeamstress)) {
      await addWorker({ name: assignedSeamstress });
    }

    try {
      await updateBride(updatedBride.id, updatedBride);
      await onBrideUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating bride:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>עריכת פרטי כלה</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>שם מלא</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>מספר טלפון</Label>
            <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div>
            <Label>אימייל</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>תופרת</Label>
            <Input
              list="seamstress-list"
              value={assignedSeamstress}
              onChange={(e) => setAssignedSeamstress(e.target.value)}
            />
            <datalist id="seamstress-list">
              {workers.map((worker) => (
                <option key={worker.name} value={worker.name} />
              ))}
            </datalist>
          </div>

          <Button onClick={handleSubmit} className="bg-green-600 text-white hover:bg-green-700">
            שמור שינויים
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBrideDialog;
