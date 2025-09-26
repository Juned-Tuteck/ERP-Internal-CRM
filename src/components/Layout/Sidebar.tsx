import React from "react";
import { Link, useLocation } from "react-router-dom";
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
  X,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";

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
    { name: "Vendors", href: "/vendors", icon: Truck, accessKey: "Vendors" },
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
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      accessKey: "Reports",
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">CRM Pro</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-gray-700"
                      }
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
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
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {userData?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userData?.role || "Member"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
