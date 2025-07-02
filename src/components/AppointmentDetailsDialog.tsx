// appointment-details-dialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Crown, Calendar, Clock, FileText, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Appointment } from '@/services/appointmentService';
import { convertToDate } from '@/utils/dateUtils';
import { deleteAppointment } from '@/services/appointmentService';
import { useToast } from '@/components/ui/use-toast';

interface AppointmentWithBride extends Appointment {
  brideName?: string;
}

interface AppointmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentWithBride | null;
  onEdit: (appointment: AppointmentWithBride) => void;
  onDelete: () => void;
}

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onDelete,
}) => {
  const { toast } = useToast();

  if (!appointment) return null;

  const appointmentDate = convertToDate(appointment.date);

  const handleDelete = async () => {
    if (!appointment?.id || !appointment?.brideId) return;

    const confirmed = window.confirm("האם את בטוחה שברצונך למחוק את התור?");
    if (!confirmed) return;

    try {
      await deleteAppointment(appointment.id, appointment.brideId);
      toast({ title: "התור נמחק בהצלחה" });
      onOpenChange(false); // סגור את הדיאלוג
      onDelete(); // טען מחדש את התצוגה
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
          title: "שגיאה במחיקת פגישה",
          description: error instanceof Error ? error.message : "נסי שוב או פני למנהלת המערכת",
          variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogDescription>
            כל הפרטים של התור המבוקש
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center">
          <DialogTitle>פרטי תור</DialogTitle>
          <Badge className={
            appointment.status === 'מאושר' ? 'bg-green-100 text-green-800' : 
            appointment.status === 'בוטל' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }>
            {appointment.status}
          </Badge>
         </div>

        <div className="space-y-4 py-4">
          {/* Bride Info */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
            <Crown className="h-5 w-5 text-amber-600" />
            <div>
              <div className="font-semibold">{appointment.brideName}</div>
              <div className="text-xs text-gray-500">קוד כלה: {appointment.brideId}</div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium mb-1">תאריך</div>
                <div>
                  {format(appointmentDate, "EEEE, d בMMMM, yyyy", { locale: he })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium mb-1">שעה</div>
                <div>
                  {format(appointmentDate, "HH:mm")}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium mb-1">סוג תור</div>
                <div>
                  {appointment.type}
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">הערות</div>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    {appointment.notes}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 gap-2">
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              מחק תור
            </Button>

            <Button 
              onClick={() => onEdit(appointment)} 
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              ערוך תור
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsDialog;
