import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Ruler, Scissors, Loader2, Pencil, Save, Plus } from 'lucide-react';
import { Bride } from '@/services/brideService';
import { 
  Measurement, 
  getMeasurementsByBrideId, 
  updateMeasurement, 
  createMeasurementFromBride, 
  addMeasurement
} from '@/services/measurementService';

interface MeasurementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bride: Bride | null;
  onMeasurementsUpdated: () => void;
}

const BrideMeasurementsDialog: React.FC<MeasurementsDialogProps> = ({
  open,
  onOpenChange,
  bride,
  onMeasurementsUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Measurement | null>(null);
  const [showNewMeasurementForm, setShowNewMeasurementForm] = useState(false);

  // Load measurements when bride changes
  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!bride?.id) return;

      setLoadingMeasurements(true);
      try {
        const fetchedMeasurements = await getMeasurementsByBrideId(bride.id);
        setMeasurements(fetchedMeasurements.sort((a, b) => 
          (b.measurementNumber || 0) - (a.measurementNumber || 0)
        ));
        
        if (fetchedMeasurements.length > 0) {
          setCurrentMeasurement(fetchedMeasurements[0]);
        } else {
          // Create an empty measurement object if none exists
          const newMeasurement = createMeasurementFromBride(bride);
          setCurrentMeasurement(newMeasurement);
          setShowNewMeasurementForm(true);
        }
      } catch (error) {
        console.error('Error fetching measurements:', error);
        toast({
          title: 'שגיאה בטעינת נתונים',
          description: 'אירעה שגיאה בעת טעינת מידות הכלה',
          variant: 'destructive',
        });
      } finally {
        setLoadingMeasurements(false);
      }
    };

    if (open && bride) {
      fetchMeasurements();
    }
  }, [bride, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Convert to number if it's a numeric input
    const numericValue = !isNaN(parseFloat(value)) ? parseFloat(value) : undefined;
    
    if (currentMeasurement) {
      setCurrentMeasurement({
        ...currentMeasurement,
        [name]: numericValue
      });
    }
  };

  const handleSave = async () => {
    if (!bride?.id || !currentMeasurement) return;

    setLoading(true);
    try {
      if (currentMeasurement.id) {
        // Update existing measurement
        await updateMeasurement(currentMeasurement.id, {
          bust: currentMeasurement.bust,
          waist: currentMeasurement.waist,
          hips: currentMeasurement.hips,
          shoulderWidth: currentMeasurement.shoulderWidth,
          armCircumference: currentMeasurement.armCircumference,
          sleeveLength: currentMeasurement.sleeveLength,
          dressLength: currentMeasurement.dressLength,
        });
      } else {
        // Add new measurement
        const newMeasurementData = {
          ...currentMeasurement,
          brideID: bride.id,
          brideName: bride.fullName,
          fullName: bride.fullName,
          phoneNumber: bride.phoneNumber,
          seamstressName: bride.assignedSeamstress,
          weddingDate: bride.weddingDate,
          measurementNumber: Math.max(...measurements.map(m => m.measurementNumber || 0), 0) + 1,
          date: new Date()
        };
        await addMeasurement(newMeasurementData);
      }
      
      toast({
        title: 'המידות עודכנו בהצלחה',
        description: 'מידות הכלה עודכנו במערכת',
      });
      
      setIsEditing(false);
      setShowNewMeasurementForm(false);
      onMeasurementsUpdated();
      
      // Reload the measurements
      if (bride.id) {
        const updatedMeasurements = await getMeasurementsByBrideId(bride.id);
        setMeasurements(updatedMeasurements.sort((a, b) => 
          (b.measurementNumber || 0) - (a.measurementNumber || 0)
        ));
        if (updatedMeasurements.length > 0) {
          setCurrentMeasurement(updatedMeasurements[0]);
        }
      }
    } catch (error) {
      console.error('Failed to update measurements:', error);
      toast({
        title: 'שגיאה בעדכון מידות',
        description: 'אירעה שגיאה בעת הניסיון לעדכן את מידות הכלה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddNewMeasurement = () => {
    if (!bride) return;
    
    const newMeasurement = createMeasurementFromBride(bride, 
      Math.max(...measurements.map(m => m.measurementNumber || 0), 0) + 1);
      
    setCurrentMeasurement(newMeasurement);
    setShowNewMeasurementForm(true);
    setIsEditing(true);
  };
  
  const selectMeasurement = (measurement: Measurement) => {
    setCurrentMeasurement(measurement);
    setShowNewMeasurementForm(false);
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-pink-600" />
            מידות הכלה - {bride?.fullName}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'ערוך את מידות הכלה' : 'צפייה במידות הכלה'}
          </DialogDescription>
        </DialogHeader>

        {loadingMeasurements ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
            <span className="mr-2">טוען מידות...</span>
          </div>
        ) : (
          <>
            {/* Measurement History Navigation */}
            {measurements.length > 0 && !showNewMeasurementForm && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">היסטוריית מדידות:</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddNewMeasurement}
                    className="text-pink-600 border-pink-200 hover:bg-pink-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    מדידה חדשה
                  </Button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {measurements.map((m) => (
                    <Button
                        key={m.id || m.measurementNumber}
                        variant={currentMeasurement?.id === m.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectMeasurement(m)}
                        className={
                            currentMeasurement?.id === m.id
                                ? "bg-pink-600 text-white"
                                : ""
                        }
                    >
                        מדידה {m.measurementNumber}
                        {m.date && (
                            <span className="text-xs mr-1 text-white">
                                ({new Date(m.date instanceof Date ? m.date : m.date.toDate()).toLocaleDateString()})
                            </span>
                        )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Measurement View */}
            <div className="space-y-4 py-4">
              {(isEditing || showNewMeasurementForm) ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bust">חזה (ס״מ)</Label>
                    <Input
                      id="bust"
                      name="bust"
                      type="number"
                      value={currentMeasurement?.bust || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist">מותניים (ס״מ)</Label>
                    <Input
                      id="waist"
                      name="waist"
                      type="number"
                      value={currentMeasurement?.waist || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hips">ירכיים (ס״מ)</Label>
                    <Input
                      id="hips"
                      name="hips"
                      type="number"
                      value={currentMeasurement?.hips || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shoulderWidth">רוחב כתפיים (ס״מ)</Label>
                    <Input
                      id="shoulderWidth"
                      name="shoulderWidth"
                      type="number"
                      value={currentMeasurement?.shoulderWidth || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="armCircumference">היקף זרוע (ס״מ)</Label>
                    <Input
                      id="armCircumference"
                      name="armCircumference"
                      type="number"
                      value={currentMeasurement?.armCircumference || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleeveLength">אורך שרוול (ס״מ)</Label>
                    <Input
                      id="sleeveLength"
                      name="sleeveLength"
                      type="number"
                      value={currentMeasurement?.sleeveLength || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dressLength">אורך שמלה (ס״מ)</Label>
                    <Input
                      id="dressLength"
                      name="dressLength"
                      type="number"
                      value={currentMeasurement?.dressLength || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  {showNewMeasurementForm && (
                    <div className="col-span-2 text-sm text-gray-500 italic">
                      * מספר המדידה יוקצה אוטומטית בעת השמירה
                    </div>
                  )}
                </div>
              ) : currentMeasurement ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <div className="text-sm text-gray-500">חזה</div>
                        <div className="font-medium">{currentMeasurement.bust || '-'} ס״מ</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">מותניים</div>
                        <div className="font-medium">{currentMeasurement.waist || '-'} ס״מ</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">ירכיים</div>
                        <div className="font-medium">{currentMeasurement.hips || '-'} ס״מ</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">רוחב כתפיים</div>
                        <div className="font-medium">{currentMeasurement.shoulderWidth || '-'} ס״מ</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">היקף זרוע</div>
                        <div className="font-medium">{currentMeasurement.armCircumference || '-'} ס״מ</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">אורך שרוול</div>
                        <div className="font-medium">{currentMeasurement.sleeveLength || '-'} ס״מ</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">אורך שמלה</div>
                        <div className="font-medium">{currentMeasurement.dressLength || '-'} ס״מ</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">מספר מדידה</div>
                        <div className="font-medium">{currentMeasurement.measurementNumber || 1}</div>
                      </div>
                      {currentMeasurement.date && (
                        <div>
                          <div className="text-sm text-gray-500">תאריך מדידה</div>
                          <div className="font-medium">
                            {new Date(currentMeasurement.date instanceof Date ? 
                              currentMeasurement.date : 
                              currentMeasurement.date.toDate()).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {currentMeasurement.seamstressName && (
                        <div>
                          <div className="text-sm text-gray-500">תופרת</div>
                          <div className="font-medium">{currentMeasurement.seamstressName}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">לא נמצאו מדידות לכלה זו</div>
                  <Button 
                    onClick={handleAddNewMeasurement}
                    className="mt-4 bg-pink-600 hover:bg-pink-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף מדידה ראשונה
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              {!isEditing && !showNewMeasurementForm ? (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    סגור
                  </Button>
                  {currentMeasurement && (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      ערוך מידות
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (showNewMeasurementForm && measurements.length > 0) {
                        setShowNewMeasurementForm(false);
                        setCurrentMeasurement(measurements[0]);
                      }
                      setIsEditing(false);
                    }}
                    disabled={loading}
                  >
                    ביטול
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        שומר...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        שמור מידות
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BrideMeasurementsDialog;