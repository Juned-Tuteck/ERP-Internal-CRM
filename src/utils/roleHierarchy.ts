// Role Hierarchy for Sales Order Approvals
export const roleHierarchy = {
  level1: "gm",
  level2: "salesmanager",
  level3: "financemanager"
};

// Get all roles in hierarchy order
export const getAllRolesInOrder = (): string[] => {
  return [
    roleHierarchy.level1,
    roleHierarchy.level2,
    roleHierarchy.level3
  ];
};

// Get role display name
export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    gm: "General Manager",
    salesmanager: "Sales Manager",
    financemanager: "Finance Manager"
  };
  return roleNames[role.toLowerCase()] || role;
};
