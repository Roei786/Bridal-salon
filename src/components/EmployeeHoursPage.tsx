import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllUsers, setSingleManager, softDeleteUser } from '@/services/shiftService';
import UserShiftsDetail from '@/components/UserShiftsDetail';
import AddUserForm from '@/components/AddUserForm';
import { Loader2, Users, UserPlus, ShieldCheck, UserCog, Trash2 } from 'lucide-react';
import Avatar from '@mui/material/Avatar';
import { User } from '@/types';

// פונקציות עזר לאוואטר
function stringToColor(string: string): string {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name: string) {
  const nameParts = name.split(' ');
  const children = nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[1][0]}`
    : name.substring(0, 2);

  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 56,
      height: 56,
      fontSize: '1.25rem',
    },
    children: children.toUpperCase(),
  };
}

const EmployeeHoursPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToPromote, setUserToPromote] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      const userList = await getAllUsers();
      const sortedList = userList.sort((a, b) => {
        if (a.role === 'manager') return -1;
        if (b.role === 'manager') return 1;
        return a.fullName.localeCompare(b.fullName);
      });
      setUsers(sortedList);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };
  
  useEffect(() => {
    setIsLoading(true);
    fetchUsers().finally(() => setIsLoading(false));
  }, []);

  const handleUserAdded = () => {
    setIsAddUserModalOpen(false);
    fetchUsers();
  };

  const handleSetManager = async () => {
    if (!userToPromote) return;
    setIsProcessing(true);
    try {
      await setSingleManager(userToPromote.id);
      alert('המנהל עודכן בהצלחה');
      setUserToPromote(null);
      fetchUsers();
    } catch (error) {
      console.error("Error setting manager:", error);
      alert('שגיאה בעדכון המנהל.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!userToDelete) return;
    setIsProcessing(true);
    try {
      await softDeleteUser(userToDelete.id);
      alert('המשתמש הוסר מהרשימה בהצלחה.');
      setUserToDelete(null);
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      fetchUsers();
    } catch (error) {
      console.error("Error during soft delete:", error);
      alert('שגיאה בהסרת המשתמש.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <>
      <div className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <Users className="h-6 w-6" />
                צוות העובדים
              </CardTitle>
              <Button onClick={() => setIsAddUserModalOpen(true)}>
                <UserPlus className="ml-2 h-5 w-5" />
                הוספה
              </Button>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <ul className="space-y-1">
                {users.map((user) => (
                  <li key={user.id} className={`p-3 rounded-lg flex items-center gap-4 transition-colors ${selectedUser?.id === user.id ? 'bg-amber-100' : ''}`}>
                    <div className="flex-1 flex items-center gap-4 cursor-pointer" onClick={() => setSelectedUser(user)}>
                        <Avatar {...stringAvatar(user.fullName || '??')} />
                        <div className="flex-1">
                            <p className="text-xl font-bold text-gray-800">{user.fullName || 'אין שם'}</p>
                            <p className="text-base text-gray-600">{user.email}</p>
                            <div className={`flex items-center gap-1.5 mt-1 text-sm ${user.role === 'manager' ? 'font-bold text-red-600' : 'text-amber-700'}`}>
                                <ShieldCheck className="h-4 w-4"/>
                                <span>{user.role === 'manager' ? 'מנהל/ת' : 'עובד/ת'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => setUserToPromote(user)}
                            disabled={user.role === 'manager'}
                            title="הפוך למנהל"
                        >
                            <UserCog className="h-5 w-5" />
                        </Button>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-gray-500 hover:text-red-600 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => setUserToDelete(user)}
                            disabled={user.role === 'manager'}
                            title="הסר משתמש"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="xl:col-span-2">
            {selectedUser ? (
                <UserShiftsDetail userId={selectedUser.id} userName={selectedUser.fullName} />
            ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed">
                    <p className="text-gray-500 text-lg">בחר/י עובד/ת כדי להציג את דוח השעות</p>
                </div>
            )}
        </div>
      </div>
      
      {isAddUserModalOpen && (
        <AddUserForm 
          isOpen={isAddUserModalOpen} 
          onClose={() => setIsAddUserModalOpen(false)}
          onUserAdded={handleUserAdded} 
        />
      )}

      <AlertDialog open={!!userToPromote} onOpenChange={() => setUserToPromote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>אישור קידום למנהל/ת</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך להפוך את {userToPromote?.fullName} למנהל/ת? המנהל/ת הנוכחי/ת (אם קיים/ת) י/תהפוך לעובד/ת.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleSetManager} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : "כן, קדם למנהל/ת"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>אישור הסרת משתמש</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך להסיר את {userToDelete?.fullName} מרשימת העובדים? פעולה זו תמחק גם את כל דוחות השעות שלו. ניתן יהיה למחוק את חשבונו לצמיתות דרך המערכת של Firebase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoftDelete} disabled={isProcessing} className="bg-red-600 hover:bg-red-700">
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : "כן, הסר"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmployeeHoursPage;