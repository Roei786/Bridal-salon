// src/pages/EmployeeHoursPage.tsx - גרסה עם הגדלת פונטים וכפתור

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllUsers } from '@/services/shiftService';
import UserShiftsDetail from '@/components/UserShiftsDetail';
import AddUserForm from '@/components/AddUserForm';
import { Loader2, Users, UserPlus, ShieldCheck } from 'lucide-react';
import Avatar from '@mui/material/Avatar';

// פונקציות עזר לאוואטר
function stringToColor(string: string) {
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
      // --- הגדלת האוואטר ---
      width: 56,
      height: 56,
      fontSize: '1.25rem', // הגדלת הפונט של ראשי התיבות
    },
    children: children.toUpperCase(),
  };
}


const EmployeeHoursPage = () => {
  const [users, setUsers] = useState<Array<any>>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const userList = await getAllUsers();
      setUsers(userList);
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
              {/* --- הגדלת הכפתור (הסרנו את size="sm") --- */}
              <Button onClick={() => setIsAddUserModalOpen(true)}>
                <UserPlus className="ml-2 h-5 w-5" />
                הוספה
              </Button>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <ul className="space-y-1">
                {users.map((user) => (
                  <li key={user.id}>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className={`w-full text-right p-3 rounded-lg transition-colors flex items-center gap-4 ${
                        selectedUser?.id === user.id
                          ? 'bg-amber-100'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Avatar {...stringAvatar(user.fullName || '??')} />
                      
                      <div className="flex-1">
                        {/* --- הגדלת הטקסטים --- */}
                        <p className="text-xl font-bold text-gray-800">{user.fullName || 'אין שם'}</p>
                        <p className="text-base text-gray-600">{user.email}</p>
                        {user.role && (
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-amber-700">
                             <ShieldCheck className="h-4 w-4"/>
                             <span>{user.role === 'manager' ? 'מנהל/ת' : 'עובד/ת'}</span>
                          </div>
                        )}
                      </div>
                    </button>
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
    </>
  );
};

export default EmployeeHoursPage;