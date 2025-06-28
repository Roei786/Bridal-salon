
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Crown, LayoutDashboard, Users, Calendar, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logo from '/public/files/logo.png'
const Navigation = () => {
  const { logout, currentUser } = useAuth();
  const navItems = [
    {
      to: '/',
      label: 'לוח מחוונים',
      icon: LayoutDashboard
    },
    {
      to: '/brides',
      label: 'ניהול כלות',
      icon: Crown
    },
    {
      to: '/calendar',
      label: 'לוח זמנים',
      icon: Calendar
    },
    // {
    //   to: '/reports',
    //   label: 'דוחות',
    //   icon: BarChart3
    // }
  ];

  return (
    <nav className="bg-white shadow-lg border-l border-gray-200 h-screen w-64 fixed right-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
            <img 
              src={logo}
              alt="הודיה לוגו" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">הודיה</h1>
            <p className="text-sm text-amber-700">סלון כלות חברתי</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{currentUser?.displayName || 'משתמש'}</p>
            <p className="text-sm text-gray-600">{currentUser?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          יציאה
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
