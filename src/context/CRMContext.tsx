import React, { createContext, useContext, useState, ReactNode } from "react";
import { AccessPermission, UserData } from "../utils/accessValidationApi";

interface CRMContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  // Access control properties
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  userAccesses: AccessPermission[];
  setUserAccesses: (accesses: AccessPermission[]) => void;
  isAccessLoading: boolean;
  setIsAccessLoading: (loading: boolean) => void;
  accessError: string | null;
  setAccessError: (error: string | null) => void;
  // Helper functions for access control
  hasMenuAccess: (menuName: string) => boolean;
  hasModuleAccess: (moduleName: string) => boolean;
  hasSubmenuAccess: (submenuName: string) => boolean;
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: Date;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Access control states
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userAccesses, setUserAccesses] = useState<AccessPermission[]>([]);
  const [isAccessLoading, setIsAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Helper functions for access control - filtered for CRM module only
  const hasMenuAccess = (menuName: string): boolean => {
    return userAccesses.some(
      (access) =>
        access.level_type === "MENU" &&
        access.name.toLowerCase().includes(menuName.toLowerCase()) &&
        access.access_type === "READ" &&
        (access.parent_name === "CRM" || access.grandparent_name === "CRM")
    );
  };

  const hasModuleAccess = (moduleName: string): boolean => {
    return userAccesses.some(
      (access) =>
        access.level_type === "MODULE" &&
        access.name.toLowerCase() === moduleName.toLowerCase() &&
        access.access_type === "READ"
    );
  };

  const hasSubmenuAccess = (submenuName: string): boolean => {
    return userAccesses.some(
      (access) =>
        access.level_type === "SUBMENU" &&
        access.name.toLowerCase().includes(submenuName.toLowerCase()) &&
        access.access_type === "READ" &&
        access.grandparent_name === "CRM"
    );
  };

  return (
    <CRMContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        searchQuery,
        setSearchQuery,
        notifications,
        addNotification,
        removeNotification,
        userData,
        setUserData,
        userAccesses,
        setUserAccesses,
        isAccessLoading,
        setIsAccessLoading,
        accessError,
        setAccessError,
        hasMenuAccess,
        hasModuleAccess,
        hasSubmenuAccess,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};
