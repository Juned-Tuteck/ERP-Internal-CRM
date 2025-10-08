import axios from "axios";
import { API_ENDPOINTS } from "./apiEndpoints";

export interface AccessPermission {
  access_id: string;
  name: string;
  level_type: "MODULE" | "MENU" | "SUBMENU" | "ACTION";
  access_type: "READ" | "WRITE" | "DELETE";
  assigned_at: string;
  description: string | null;
  parent_name: string | null;
  grandparent_name: string | null;
  grand_grandparent_name: string | null;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  tokenVersion: number;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

export interface AccessValidationResponse {
  success: boolean;
  statusCode: number;
  data: {
    decoded: UserData & {
      accesses: AccessPermission[];
    };
  };
  clientMessage: string;
  devMessage: string;
}

export const validateUserAccessWithCRM =
  async (): Promise<AccessValidationResponse> => {
    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post<AccessValidationResponse>(
        `${import.meta.env.VITE_API_BASE_URL}${
          API_ENDPOINTS.USER_ACCESS_VALIDATE
        }`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Access validation failed:", error);
      throw error;
    }
  };

// Helper function to check if user has access to a specific menu within CRM module
export const hasMenuAccess = (
  accesses: AccessPermission[],
  menuName: string
): boolean => {
  return accesses.some(
    (access) =>
      access.level_type === "MENU" &&
      access.name.toLowerCase().includes(menuName.toLowerCase()) &&
      access.access_type === "READ" &&
      (access.parent_name === "CRM" || access.grandparent_name === "CRM")
  );
};

// Helper function to check if user has access to a specific module
export const hasModuleAccess = (
  accesses: AccessPermission[],
  moduleName: string
): boolean => {
  return accesses.some(
    (access) =>
      access.level_type === "MODULE" &&
      access.name.toLowerCase() === moduleName.toLowerCase() &&
      access.access_type === "READ"
  );
};

// Helper function to check if user has access to a specific submenu within CRM module
export const hasSubmenuAccess = (
  accesses: AccessPermission[],
  submenuName: string
): boolean => {
  return accesses.some(
    (access) =>
      access.level_type === "SUBMENU" &&
      access.name.toLowerCase().includes(submenuName.toLowerCase()) &&
      access.access_type === "READ" &&
      access.grandparent_name === "CRM"
  );
};

// Helper function to get all accessible menus for a user within CRM module
export const getAccessibleMenus = (accesses: AccessPermission[]): string[] => {
  return accesses
    .filter(
      (access) =>
        access.level_type === "MENU" &&
        access.access_type === "READ" &&
        (access.parent_name === "CRM" || access.grandparent_name === "CRM")
    )
    .map((access) => access.name);
};

// Helper function to get all accessible submenus for a user within CRM module
export const getAccessibleSubmenus = (
  accesses: AccessPermission[]
): string[] => {
  return accesses
    .filter(
      (access) =>
        access.level_type === "SUBMENU" &&
        access.access_type === "READ" &&
        access.grandparent_name === "CRM"
    )
    .map((access) => access.name);
};

// Helper function to get all accessible modules for a user
export const getAccessibleModules = (
  accesses: AccessPermission[]
): string[] => {
  return accesses
    .filter(
      (access) =>
        access.level_type === "MODULE" && access.access_type === "READ"
    )
    .map((access) => access.name);
};

// Helper function to check if user has CRM module access
export const hasCRMAccess = (accesses: AccessPermission[]): boolean => {
  return accesses.some(
    (access) =>
      access.level_type === "MODULE" &&
      access.name === "CRM" &&
      access.access_type === "READ"
  );
};

// Debug helper function to log all CRM-related access permissions
export const getCRMAccessDebugInfo = (accesses: AccessPermission[]) => {
  const crmMenus = accesses.filter(
    (access) =>
      access.level_type === "MENU" &&
      (access.parent_name === "CRM" || access.grandparent_name === "CRM")
  );

  const crmSubmenus = accesses.filter(
    (access) =>
      access.level_type === "SUBMENU" && access.grandparent_name === "CRM"
  );

  const crmModule = accesses.filter(
    (access) => access.level_type === "MODULE" && access.name === "CRM"
  );

  return {
    crmModule,
    crmMenus,
    crmSubmenus,
    summary: {
      hasCRMModule: crmModule.length > 0,
      crmMenuCount: crmMenus.length,
      crmSubmenuCount: crmSubmenus.length,
    },
  };
};
