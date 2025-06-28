import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Search, Plus, Loader2, List, LayoutGrid } from 'lucide-react';
import { getBrides, Bride } from '@/services/brideService';
import AddBrideDialog from '@/components/AddBrideDialog';
import EditBrideDialog from '@/components/EditBrideDialog';
import DeleteBrideDialog from '@/components/DeleteBrideDialog';
import BrideMeasurementsDialog from '@/components/BrideMeasurementsDialog';
import BrideCard from './BrideCard';
import { useToast } from '@/components/ui/use-toast';

const Brides = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brides, setBrides] = useState<Bride[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [measurementsDialogOpen, setMeasurementsDialogOpen] = useState(false);
  const [selectedBride, setSelectedBride] = useState<Bride | null>(null);
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadBrides = async () => {
    try {
      setLoading(true);
      const bridesData = await getBrides();
      setBrides(bridesData);
    } catch (error) {
      console.error("Error loading brides:", error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בעת טעינת רשימת הכלות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrides();
  }, []);

  const handleAddBride = () => setAddDialogOpen(true);

  const handleEditBride = (bride: Bride) => {
    setSelectedBride(bride);
    setEditDialogOpen(true);
  };

  const handleDeleteBride = (id: string) => {
    const bride = brides.find(b => b.id === id);
    if (bride) {
      setSelectedBride(bride);
      setDeleteDialogOpen(true);
    }
  };

  const handleViewMeasurements = (bride: Bride) => {
    setSelectedBride(bride);
    setMeasurementsDialogOpen(true);
  };

  const handleViewBride = (bride: Bride) => {
    navigate(`/brides/${bride.id}`);
  };

  const filteredBrides = brides.filter(bride =>
    bride.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bride.phoneNumber.includes(searchTerm) ||
    bride.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bride.assignedSeamstress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-8 w-8 text-pink-600" />
            ניהול כלות
          </h1>
          <p className="text-gray-700 text-base mt-1">רשימת כל הכלות והסטטוס שלהן</p>
        </div>
        <div className="flex gap-2">
          <Button variant={viewType === 'cards' ? 'default' : 'outline'} onClick={() => setViewType('cards')}>
            <LayoutGrid className="h-4 w-4 ml-1" />
            כרטיסיות
          </Button>
          <Button variant={viewType === 'table' ? 'default' : 'outline'} onClick={() => setViewType('table')}>
            <List className="h-4 w-4 ml-1" />
            טבלה
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleAddBride}>
            <Plus className="h-4 w-4 ml-2" />
            הוסף כלה חדשה
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="חפש לפי שם, טלפון, אימייל או תופרת..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
          <span className="text-lg text-gray-600 mr-3">טוען כלות...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredBrides.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Crown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">לא נמצאו כלות</h3>
            <p className="text-gray-600 text-base">נסה לשנות את מונחי החיפוש או הוסף כלה חדשה</p>
          </CardContent>
        </Card>
      )}

      {/* Views */}
      {!loading && filteredBrides.length > 0 && (
        viewType === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBrides.map((bride) => (
              <BrideCard
                key={bride.id}
                bride={bride}
                onEdit={handleEditBride}
                onDelete={handleDeleteBride}
                onViewMeasurements={handleViewMeasurements}
                onViewBride={handleViewBride}
                editButtonClass="bg-green-600 hover:bg-green-700 text-white"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full table-auto border-collapse text-base">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-right">שם</th>
                  <th className="p-3 text-right">טלפון</th>
                  <th className="p-3 text-right">אימייל</th>
                  <th className="p-3 text-right">תופרת</th>
                  <th className="p-3 text-right">סטטוס טיפול</th>
                  <th className="p-3 text-right">סטטוס תשלום</th>
                  <th className="p-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrides.map((bride) => (
                  <tr key={bride.id} className="border-t">
                    <td className="p-3">{bride.fullName}</td>
                    <td className="p-3">{bride.phoneNumber}</td>
                    <td className="p-3">{bride.email}</td>
                    <td className="p-3">{bride.assignedSeamstress || '-'}</td>
                    <td className="p-3"><StatusBadge status={bride.historyStatus} /></td>
                    <td className="p-3"><PaymentBadge paid={bride.paymentStatus} /></td>
                    <td className="p-3 space-x-2 space-x-reverse">
                      <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => handleEditBride(bride)}>ערוך</Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewMeasurements(bride)}>מידות</Button>
                      <Button variant="secondary" size="sm" onClick={() => handleViewBride(bride)}>הצג</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteBride(bride.id)}>מחק</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Dialogs */}
      <AddBrideDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onBrideAdded={loadBrides} />
      <EditBrideDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} onBrideUpdated={loadBrides} bride={selectedBride} />
      <DeleteBrideDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onBrideDeleted={loadBrides} brideId={selectedBride?.id || null} brideName={selectedBride?.fullName || ''} />
      <BrideMeasurementsDialog open={measurementsDialogOpen} onOpenChange={setMeasurementsDialogOpen} bride={selectedBride} onMeasurementsUpdated={loadBrides} />
    </div>
  );
};

// Helper components
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed':
      return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 border border-green-200">הושלם</span>;
    case 'In Progress':
      return <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 border border-blue-200">בתהליך</span>;
    case 'Cancelled':
      return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 border border-red-200">בוטל</span>;
    default:
      return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 border border-gray-200">לא ידוע</span>;
  }
};

const PaymentBadge = ({ paid }: { paid: boolean }) => {
  return paid
    ? <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 border border-green-200">שולם</span>
    : <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 border border-red-200">ממתין לתשלום</span>;
};

export default Brides;
