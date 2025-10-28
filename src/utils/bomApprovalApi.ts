// BOM Approval API functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface BOMApprovalDetail {
  approval_id: string;
  approver_role: string;
  approval_status: string;
  approved_by: string | null;
  approval_comment: string | null;
  approval_created_at: string;
  approval_updated_at: string | null;
}

export interface BOMData {
  id: string;
  name: string;
  lead_id: string;
  project_id?: string;
  work_type: string;
  total_items: number;
  total_price: number;
  created_by: string;
  created_at: string;
  approval_status: string;
  business_name?: string;
  project_name?: string;
  lead_type?: string;
  lead_number?: string;
  approvals: BOMApprovalDetail[];
  approval_history?: BOMApprovalDetail[];
}

// Get BOMs by approver role with approval details
export const getBOMsByApproverRole = async (params: {
  approver_role: string;
  approval_status?: string;
  lead_id?: string;
  project_id?: string;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await fetch(
    `${API_BASE_URL}/bom-approval/boms/by-role?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch BOMs by approver role: ${response.statusText}`);
  }

  return response.json();
};

// Update BOM approval decision
export const updateBOMApprovalDecision = async (
  approvalId: string,
  status: "APPROVED" | "REJECTED" | "REVISIT",
  approvedBy: string,
  comment?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/bom-approval/${approvalId}/decision`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify({
        status: status.toLowerCase(),
        approved_by: approvedBy,
        approval_comment: comment,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update BOM approval decision: ${response.statusText}`);
  }

  return response.json();
};

// Update main BOM table (if needed for final approval)
export const updateBOM = async (bomId: string, data: { 
  approval_status?: string;
  updated_by?: string;
}) => {
  const response = await fetch(
    `${API_BASE_URL}/bom/${bomId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update BOM: ${response.statusText}`);
  }

  return response.json();
};

// Get all BOM approvals with filters
export const getBOMApprovals = async (params?: {
  bom_id?: string;
  approval_status?: string;
  approved_by?: string;
  approver_role?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
  }

  const response = await fetch(
    `${API_BASE_URL}/bom-approval?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch BOM approvals: ${response.statusText}`);
  }

  return response.json();
};

// Create BOM approval
export const createBOMApproval = async (data: {
  bom_id: string;
  approver_role: string;
  approval_status?: string;
  approved_by?: string;
  approval_comment?: string;
}) => {
  const response = await fetch(
    `${API_BASE_URL}/bom-approval`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create BOM approval: ${response.statusText}`);
  }

  return response.json();
};

// Bulk create BOM approvals
export const createBulkBOMApprovals = async (data: {
  approvals: Array<{
    bom_id: string;
    approver_role: string;
    approval_status?: string;
    approved_by?: string;
    approval_comment?: string;
  }>;
}) => {
  const response = await fetch(
    `${API_BASE_URL}/bom-approval/bulk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create bulk BOM approvals: ${response.statusText}`);
  }

  return response.json();
};