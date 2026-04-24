// place for user to go after they log in
// layout contains sidebar and top navbar

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ClipboardList, 
  Settings, 
  LogOut,
  TrendingUp // Added for Deals
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link, useLocation } from 'react-router-dom'; // Use Link for SPA navigation

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Building2, label: 'Properties', path: '/properties' },
    { icon: ClipboardList, label: 'Tasks', path: '/tasks' },
    { icon: TrendingUp, label: 'Deals', path: '/deals' }, // ADDED DEALS HERE
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-purple-600 flex items-center gap-2">
          <Building2 size={24} />
          <span>RE-CRM</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path 
                ? 'bg-purple-50 text-purple-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;