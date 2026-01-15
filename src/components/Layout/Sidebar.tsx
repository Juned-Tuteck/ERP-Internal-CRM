import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import {
  Home,
  UserPlus,
  NotebookPen,
  NotepadText,
  ScrollText,
  Building2,
  Truck,
  ShoppingCart,
  BarChart3,
  Settings,
  FileClock,
  X,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import logo from "../../assets/Contromoist_logo_icon.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { hasMenuAccess, userData } = useCRM();

  // Define all navigation items with their access requirements
  const allNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      accessKey: "Dashboard",
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Building2,
      accessKey: "customers",
    },
    {
      name: "Competitors",
      href: "/competitors",
      icon: Building2,
      accessKey: "competitors",
    },
    { name: "Leads", href: "/leads", icon: UserPlus, accessKey: "Lead" },
    { name: "BOM", href: "/bom", icon: NotebookPen, accessKey: "BOM" },
    {
      name: "Quotations",
      href: "/quotations",
      icon: ScrollText,
      accessKey: "Quotations",
    },
    {
      name: "Sales Orders",
      href: "/sales-orders",
      icon: ShoppingCart,
      accessKey: "Sales Order",
    },
    {
      name: "Projects",
      href: "/projects",
      icon: NotepadText,
      accessKey: "Projects",
    },
    { name: "Vendors", href: "/vendors", icon: Truck, accessKey: "Vendors" },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      accessKey: "Reports",
    },
    {
      name: 'Audit Logs',
      href: '/audit',
      icon: FileClock,
      accessKey: 'Audit Logs'
    },
    {
      name: "Temp Lead",
      href: "/temp-lead",
      icon: UserPlus,
      accessKey: "Temp Lead",
    },
    {
      name: "Associates",
      href: "/associates",
      icon: UserPlus,
      accessKey: "Associates",
    },
    // { name: 'Settings', href: '/settings', icon: Settings, accessKey: 'Settings' },
  ];

  // Filter navigation based on user access permissions
  const navigation = allNavigation.filter((item) => {
    // Check if user has access to this menu (including Dashboard)
    return hasMenuAccess(item.accessKey);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-structural-900 bg-opacity-75 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Tiled Design with Structural Black Background */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-structural-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo Area - Darker tile */}
        <div className="flex items-center justify-between h-16 px-6 bg-structural-900 border-b border-structural-700">
          <h1 className="flex items-center text-xl font-bold text-white gap-2">
            <img src={logo} alt="Contromoist logo" className="h-6 object-contain" />
            Contromoist
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden text-structural-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive
                      ? "text-white shadow-md border-l-3"
                      : "text-structural-300 hover:bg-structural-700 hover:text-white"
                    }
                  `}
                  style={isActive ? { backgroundColor: '#0091A2', borderLeftColor: '#00B8CC' } : {}}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0 transition-colors
                      ${isActive
                        ? "text-white"
                        : "text-structural-400"
                      }
                    `}
                    style={!isActive ? { transition: 'color 0.2s' } : {}}
                    onMouseEnter={(e) => !isActive && (e.currentTarget.style.color = '#0091A2')}
                    onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = '')}
                  />
                  {item.name == 'BOM' ? 'CRM BOM' : item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section - Bottom tile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-structural-900 border-t border-structural-700">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-structural-900" style={{ backgroundColor: '#0091A2', borderColor: '#00B8CC' }}>
                <span className="text-sm font-semibold text-white">
                  {userData?.name
                    ? userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                    : "U"}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userData?.name || "User"}
              </p>
              <p className="text-xs text-structural-400 capitalize truncate">
                {userData?.role || "Member"}
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("auth_token");
                window.location.href = `${import.meta.env.VITE_AUTH_UI_BASE_URL}/signin`;
              }}
              className="p-2 text-structural-400 hover:text-error-500 hover:bg-structural-800 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
