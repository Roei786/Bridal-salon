// src/pages/EmployeeHoursPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getAllUsers } from '@/services/shiftService';
import UserShiftsDetail from '@/components/UserShiftsDetail';
import { Loader2, Users } from 'lucide-react';

const EmployeeHoursPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getAllUsers();
        setUsers(userList);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <Users className="h-6 w-6" />
              רשימת עובדים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-right p-4 text-base rounded-md transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-amber-100 text-amber-800 font-semibold'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {user.fullName || user.email}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        {selectedUser ? (
          <UserShiftsDetail userId={selectedUser.id} userName={selectedUser.fullName} />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-500 text-lg">בחר/י עובד/ת כדי להציג את דוח השעות</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeHoursPage;