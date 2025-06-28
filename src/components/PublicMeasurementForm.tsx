import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const PublicMeasurementForm = () => {
  const { brideId } = useParams();
  const [loading, setLoading] = useState(false);
  const [bride, setBride] = useState<any>(null);

  const [measurements, setMeasurements] = useState({
    measurementNumber: '', // הכלה תמלא את זה
    bust: '',
    waist: '',
    hips: '',
    shoulderWidth: '',
    armCircumference: '',
    sleeveLength: '',
    dressLength: ''
  });

  useEffect(() => {
    const fetchBride = async () => {
      if (!brideId) return;
      try {
        const brideRef = doc(db, 'Brides', brideId);
        const snapshot = await getDoc(brideRef);
        if (snapshot.exists()) {
          setBride(snapshot.data());
        } else {
          toast({
            title: 'כלה לא נמצאה',
            description: 'לא נמצאה כלה לפי מזהה הקישור',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('שגיאה בטעינה:', error);
      }
    };
    fetchBride();
  }, [brideId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeasurements({
      ...measurements,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!brideId || !bride) return;

    const trimmedMeasurementNumber = measurements.measurementNumber.trim();
    if (!trimmedMeasurementNumber) {
      toast({
        title: 'מספר מדידה נדרש',
        description: 'יש להזין מספר מדידה לפני השליחה',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { measurementNumber, ...rest } = measurements;

      const fullMeasurement = {
        ...rest,
        measurementNumber,
        brideID: brideId,
        brideName: bride.fullName || '',
        fullName: bride.fullName || '',
        phoneNumber: bride.phoneNumber || '',
        seamstressName: bride.assignedSeamstress || '',
        weddingDate: bride.weddingDate || null,
        date: Timestamp.now()
      };

      // ✅ שמירה ב-subcollection של הכלה לפי מספר מדידה
      const subRef = doc(db, 'Brides', brideId, 'measurements', measurementNumber);
      await setDoc(subRef, fullMeasurement);

      // ✅ שמירה גם באוסף הראשי measurements עם מזהה ייחודי
      const mainId = `${brideId}_${measurementNumber}`;
      const mainRef = doc(db, 'measurements', mainId);
      await setDoc(mainRef, fullMeasurement);

      toast({
        title: 'הטופס נשלח בהצלחה',
        description: 'המידות נשמרו במסד הנתונים'
      });
    } catch (err) {
      console.error('שגיאה בשליחה:', err);
      toast({
        title: 'שגיאה בשליחת הטופס',
        description: 'נא לנסות שוב',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">טופס מדידות</h2>

      {Object.entries(measurements).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{getHebrewLabel(key)}</Label>
          <Input
            id={key}
            name={key}
            type={key === 'measurementNumber' ? 'text' : 'number'}
            value={value}
            onChange={handleChange}
          />
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-pink-600 hover:bg-pink-700 text-white w-full"
      >
        {loading ? 'שולח...' : 'שלח טופס'}
      </Button>
    </div>
  );
};

const getHebrewLabel = (key: string) => {
  const map: Record<string, string> = {
    measurementNumber: 'מספר מדידה',
    bust: 'חזה (ס״מ)',
    waist: 'מותניים (ס״מ)',
    hips: 'ירכיים (ס״מ)',
    shoulderWidth: 'רוחב כתפיים (ס״מ)',
    armCircumference: 'היקף זרוע (ס״מ)',
    sleeveLength: 'אורך שרוול (ס״מ)',
    dressLength: 'אורך שמלה (ס״מ)'
  };
  return map[key] || key;
};

export default PublicMeasurementForm;
