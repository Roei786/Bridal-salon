// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
// הגדרת טיפוס עבור המידע שנקבל ממסמך ההזמנה
interface InvitationData {
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'employee' | 'manager';
  status: 'pending' | 'completed';
  createdAt: Timestamp;
}

const RegisterPage = () => {
  const { token } = useParams<{ token: string }>(); // הגדרה שהטוקן הוא string
  const navigate = useNavigate();
  
  // הגדרת טיפוס למשתנה המצב
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('טוקן הזמנה לא חוקי.');
        setIsLoading(false);
        return;
      }
      const invitationRef = doc(db, 'invitations', token);
      const docSnap = await getDoc(invitationRef);

      if (docSnap.exists() && docSnap.data().status === 'pending') {
        setInvitation(docSnap.data() as InvitationData);
      } else {
        setError('הזמנה לא קיימת או שכבר נעשה בה שימוש.');
      }
      setIsLoading(false);
    };
    verifyToken();
  }, [token]);

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!invitation) return; // הגנה נוספת

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, invitation.email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: invitation.fullName });
      
      await setDoc(doc(db, 'users', user.uid), {
        fullName: invitation.fullName,
        email: invitation.email,
        phoneNumber: invitation.phoneNumber,
        role: invitation.role,
        createdAt: new Date(), // שימוש ב-Date רגיל כי אין לנו serverTimestamp בצד הלקוח
      });

      await updateDoc(doc(db, 'invitations', token!), { status: 'completed' });

      alert('ההרשמה הושלמה בהצלחה! כעת תועבר לעמוד ההתחברות.');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500 text-xl">{error}</div>;

  return (
     <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">השלמת הרשמה</CardTitle>
          <CardDescription>
            שלום {invitation?.fullName}, ברוך הבא! אנא בחר/י סיסמה כדי להפעיל את חשבונך.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegistration}>
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label>אימייל</Label>
                <Input type="email" value={invitation?.email} disabled className="bg-gray-100" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">בחר/י סיסמה</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" disabled={isLoading} className="w-full mt-2">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'יוצר חשבון...' : 'סיים הרשמה'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;