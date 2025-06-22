import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Search, Plus, Loader2 } from 'lucide-react';
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
  
  const { toast } = useToast();

  // Load brides from Firestore
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddBride = () => {
    setAddDialogOpen(true);
  };

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

  const filteredBrides = brides.filter(bride =>
    bride.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bride.phoneNumber.includes(searchTerm) ||
    bride.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-gray-600 mt-1">רשימת כל הכלות והסטטוס שלהן</p>
        </div>
        <Button 
          className="bg-pink-600 hover:bg-pink-700 text-white"
          onClick={handleAddBride}
        >
          <Plus className="h-4 w-4 ml-2" />
          הוסף כלה חדשה
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="חפש לפי שם, טלפון או אימייל..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
          <span className="text-lg text-gray-600 mr-3">טוען כלות...</span>
        </div>
      )}

      {/* Brides Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBrides.map((bride) => (
            <BrideCard 
              key={bride.id} 
              bride={bride} 
              onEdit={handleEditBride} 
              onDelete={handleDeleteBride}
              onViewMeasurements={handleViewMeasurements}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBrides.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Crown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">לא נמצאו כלות</h3>
            <p className="text-gray-600">נסה לשנות את מונחי החיפוש או הוסף כלה חדשה</p>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddBrideDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onBrideAdded={loadBrides} 
      />
      
      <EditBrideDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        onBrideUpdated={loadBrides} 
        bride={selectedBride} 
      />
      
      <DeleteBrideDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        onBrideDeleted={loadBrides} 
        brideId={selectedBride?.id || null}
        brideName={selectedBride?.fullName || ''}
      />
      
      <BrideMeasurementsDialog
        open={measurementsDialogOpen}
        onOpenChange={setMeasurementsDialogOpen}
        bride={selectedBride}
        onMeasurementsUpdated={loadBrides}
      />
    </div>
  );
};

export default Brides;
