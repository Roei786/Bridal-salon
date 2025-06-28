import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  Image,
  Scissors,
  ClipboardEdit,
  Trash2,
  Ruler,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { Bride } from '@/services/brideService';

interface BrideCardProps {
  bride: Bride;
  onEdit: (bride: Bride) => void;
  onDelete: (id: string) => void;
  onViewMeasurements: (bride: Bride) => void;
  onViewBride: (bride: Bride) => void; // ✅ נוספה תמיכה בכפתור "הצג"
}

const BrideCard: React.FC<BrideCardProps> = ({
  bride,
  onEdit,
  onDelete,
  onViewMeasurements,
  onViewBride,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-bold text-gray-900">{bride.fullName}</CardTitle>
        <Crown className="h-5 w-5 text-pink-600" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{bride.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{bride.email}</span>
          </div>
        </div>

        {/* Wedding Date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-pink-600 flex-shrink-0" />
          <span className="font-medium">תאריך חתונה:</span>
          <span>
            {format(
              bride.weddingDate instanceof Date ? bride.weddingDate : new Date(),
              'dd/MM/yyyy'
            )}
          </span>
        </div>

        {/* Assigned Seamstress */}
        {bride.assignedSeamstress && (
          <div className="flex items-center gap-2 text-sm">
            <Scissors className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <span className="font-medium">תופרת:</span>
            <span>{bride.assignedSeamstress}</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex justify-between items-center pt-2">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">סטטוס טיפול</p>
            <StatusBadge status={bride.historyStatus} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">סטטוס תשלום</p>
            <PaymentBadge paid={bride.paymentStatus} />
          </div>
        </div>

        {/* Images Counter */}
        <div className="flex justify-between mt-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {(bride.beforeImages?.length || 0) + (bride.afterImages?.length || 0)} תמונות
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {format(
              bride.createdAt instanceof Date ? bride.createdAt : new Date(),
              'dd/MM/yyyy'
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t pt-4">
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(bride.id!)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            מחק
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
            onClick={() => onEdit(bride)}
          >
            <ClipboardEdit className="h-4 w-4 mr-1" />
            ערוך
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => onViewMeasurements(bride)}
        >
          <Ruler className="h-4 w-4 mr-1" />
          מידות הכלה
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-gray-600 border-gray-200 hover:bg-gray-50"
          onClick={() => onViewBride(bride)}
        >
          <Eye className="h-4 w-4 mr-1" />
          הצג כרטיס כלה
        </Button>
      </CardFooter>
    </Card>
  );
};

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          הושלם
        </Badge>
      );
    case 'In Progress':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          בתהליך
        </Badge>
      );
    case 'Cancelled':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          בוטל
        </Badge>
      );
    default:
      return <Badge variant="outline" className="bg-gray-100">לא ידוע</Badge>;
  }
};

// Payment Badge
const PaymentBadge = ({ paid }: { paid: boolean }) => {
  return paid ? (
    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
      שולם
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
      ממתין לתשלום
    </Badge>
  );
};

export default BrideCard;
