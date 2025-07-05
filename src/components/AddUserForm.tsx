// src/components/AddUserForm.tsx
import React, { useState } from 'react';
import { db } from '@/firebase.ts';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const EMAILJS_SERVICE_ID = 'service_3svuzga';
const EMAILJS_TEMPLATE_ID = 'template_m2xwgis';
const EMAILJS_PUBLIC_KEY = '4b9wNL-th6VR4bpFE';

// הגדרת טיפוסים עבור ה-props של הקומפוננטה
interface AddUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const invitationToken = crypto.randomUUID();
      const registrationLink = `${window.location.origin}/register/${invitationToken}`;

      const invitationRef = doc(db, 'invitations', invitationToken);
      await setDoc(invitationRef, {
        email: email,
        fullName: fullName,
        phoneNumber: phoneNumber,
        role: 'employee',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_name: fullName,
          to_email: email,
          registration_link: registrationLink,
        },
        EMAILJS_PUBLIC_KEY
      );

      alert('הזמנה נשלחה בהצלחה לאימייל של העובד/ת!');
      onUserAdded();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'אירעה שגיאה בשליחת ההזמנה.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הוספת עובד/ת חדש/ה</DialogTitle>
          <DialogDescription>
            לאחר ההוספה, תישלח סיסמה זמנית לאימייל של העובד/ת.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {/* ה-JSX של הטופס נשאר זהה לחלוטין */}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">שם מלא</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">אימייל</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">טלפון</Label>
              <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="col-span-3" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'שולח הזמנה...' : 'שלח הזמנה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserForm;