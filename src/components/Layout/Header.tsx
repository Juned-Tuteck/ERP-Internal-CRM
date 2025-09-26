import React from 'react';
import { Menu, Search, Bell, Mail } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { searchQuery, setSearchQuery, notifications, userData } = useCRM();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0 flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search contacts, leads, customers..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative text-gray-500 hover:text-gray-700">
            <Mail className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">3</span>
            </span>
          </button>
          
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell className="h-6 w-6" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">{notifications.length}</span>
              </span>
            )}
          </button>

          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {userData?.name ? `Welcome, ${userData.name.split(' ')[0]}!` : 'Welcome back!'}
            </p>
            <p className="text-xs text-gray-700 capitalize">
              {userData?.role || new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;