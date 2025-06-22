import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';
import { deleteBride } from '@/services/brideService';
import { toast } from '@/components/ui/use-toast';

interface DeleteBrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBrideDeleted: () => void;
  brideId: string | null;
  brideName: string;
}

const DeleteBrideDialog: React.FC<DeleteBrideDialogProps> = ({
  open,
  onOpenChange,
  onBrideDeleted,
  brideId,
  brideName
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!brideId) return;
    
    setLoading(true);
    try {
      await deleteBride(brideId);
      toast({
        title: 'כלה נמחקה בהצלחה',
        description: `${brideName} נמחקה מהמערכת`,
      });
      onBrideDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete bride:', error);
      toast({
        title: 'שגיאה במחיקת כלה',
        description: 'אירעה שגיאה בעת הניסיון למחוק את הכלה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>האם את בטוחה שברצונך למחוק כלה זו?</AlertDialogTitle>
          <AlertDialogDescription>
            פעולה זו תמחק לצמיתות את הכלה "{brideName}" מהמערכת. פעולה זו לא ניתנת לביטול.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>ביטול</AlertDialogCancel>
          <AlertDialogAction 
            disabled={loading} 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                מוחק...
              </>
            ) : (
              'כן, מחק'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBrideDialog;
