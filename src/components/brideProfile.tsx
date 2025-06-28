import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Mail, MessageCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import emailjs from 'emailjs-com';


const BrideProfile = () => {
  const { id } = useParams();
  const [bride, setBride] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBride = async () => {
      const docRef = doc(db, 'Brides', id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBride({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast({ title: 'שגיאה', description: 'לא נמצאה כלה', variant: 'destructive' });
      }
    };
    fetchBride();
  }, [id]);

  const handleSendReminder = () => {
    toast({ title: 'נשלחה תזכורת', description: 'הודעה נשלחה לתורים הקיימים' });
  };

const handleSendMeasurementsForm = async () => {
  if (!bride?.email || !bride?.fullName || !id) {
    toast({ title: 'שגיאה', description: 'פרטי הכלה חסרים', variant: 'destructive' });
    return;
  }

const formUrl = `https://bridal-salon.web.app/measurements/${id}/form`;


  const templateParams = {
    to_name: bride.fullName,
    to_email: bride.email,
    link: formUrl,
    salon_logo: 'https://i.ibb.co/d0mL1RVq/logo.png',
  };

  try {
    await emailjs.send(
      'service_idzn0fs',           // 🟣 service ID
      'template_2lzl58u',          // 🟣 template ID
      templateParams,
      '0fzSnZp44MnYc6afv'          // 🟣 public key (user ID)
    );

    toast({ title: 'טופס נשלח', description: 'טופס מדידות נשלח למייל הכלה 💌' });
  } catch (error) {
    console.error('EmailJS Error:', error);
    toast({ title: 'שגיאה בשליחה', description: 'לא ניתן לשלוח את הטופס', variant: 'destructive' });
  }
};

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'beforeImages' | 'afterImages'
  ) => {
    const files = event.target.files;
    if (!files || !id) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      const result: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      newUrls.push(result);
    }

    const docRef = doc(db, 'Brides', id);
    const current = bride?.[field] || [];
    const updated = [...current, ...newUrls];

    await updateDoc(docRef, { [field]: updated });
    setBride((prev: any) => ({ ...prev, [field]: updated }));
    setUploading(false);

    toast({ title: 'העלאה הושלמה', description: 'התמונות נוספו בהצלחה' });
  };

  const handleDeleteImage = async (field: 'beforeImages' | 'afterImages', index: number) => {
    const current = bride?.[field] || [];
    const updated = current.filter((_: any, i: number) => i !== index);
    const docRef = doc(db, 'Brides', id!);
    await updateDoc(docRef, { [field]: updated });
    setBride((prev: any) => ({ ...prev, [field]: updated }));
    toast({ title: 'התמונה נמחקה', variant: 'default' });
  };

  if (!bride) return <div className="p-6">טוען פרטי כלה...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* מידע ופעולות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* כרטיס פרטי כלה */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-pink-600">כרטיס כלה: {bride.fullName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700 text-base">
            <p><strong>טלפון:</strong> {bride.phoneNumber}</p>
            <p><strong>אימייל:</strong> {bride.email}</p>
            <p><strong>תופרת:</strong> {bride.assignedSeamstress || 'לא הוקצתה'}</p>
            <p><strong>סטטוס:</strong> {bride.historyStatus}</p>
            <p><strong>תשלום:</strong> {bride.paymentStatus ? 'שולם' : 'לא שולם'}</p>
          </CardContent>
        </Card>

        {/* כרטיס פעולות */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">פעולות</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={handleSendReminder} className="bg-blue-600 hover:bg-blue-700 text-white">
              <MessageCircle className="h-4 w-4 mr-1" />
              שליחת תזכורת לתורים
            </Button>
            <Button onClick={handleSendMeasurementsForm} className="bg-green-600 hover:bg-green-700 text-white">
              <Mail className="h-4 w-4 mr-1" />
              שליחת טופס מדידות למילוי
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* תמונות לפני ואחרי */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['beforeImages', 'afterImages'] as const).map((field) => (
          <Card key={field}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {field === 'beforeImages' ? 'תמונות לפני תיקונים' : 'תמונות אחרי תיקונים'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(bride[field] || []).map((url: string, index: number) => (
                  <div key={index} className="relative group">
                    <img src={url} alt={field} className="rounded-md shadow max-h-40 object-cover w-full" />
                    <button
                      onClick={() => handleDeleteImage(field, index)}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-red-100 opacity-0 group-hover:opacity-100 transition"
                      title="מחק תמונה"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>

              {/* העלאת תמונות */}
              <div className="mt-2">
                <label className="text-sm font-semibold block mb-1">
                  העלאת תמונות {field === 'beforeImages' ? 'תמונות לפני תיקונים' : 'תמונות אחרי תיקונים'}:
                </label>
                <label className="block w-fit border border-pink-500 px-4 py-1 text-sm text-pink-700 font-medium rounded-md cursor-pointer bg-pink-50 hover:bg-pink-100 transition">
                  בחירת קבצים
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, field)}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrideProfile;
