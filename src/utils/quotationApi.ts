import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Get all quotations
export const getQuotations = async () => {
  const response = await axios.get(`${API_BASE_URL}/customer-quotation/`);
  return response.data;
};

// Get quotation by ID
export const getQuotationById = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/customer-quotation/${id}`);
  return response.data;
};

// Get quotations by approver role with approval details
export const getQuotationsByApproverRole = async (params: {
  approver_role: string;
  approval_status?: string;
  lead_id?: string;
  bom_id?: string;
}) => {
  const response = await axios.get(`${API_BASE_URL}/customer-quotation-approval/quotations/by-role`, {
    params
  });
  return response.data;
};

// Get leads
export const getLeads = async () => {
  const response = await axios.get(`${API_BASE_URL}/lead/`);
  return response.data;
};

// Get BOM by lead ID
export const getBOMByLeadId = async (leadId: string) => {
  const response = await axios.get(`${API_BASE_URL}/bom/`, {
    params: { lead_id: leadId },
  });
  return response.data;
};

// Get BOM details by ID
export const getBOMDetailsById = async (bomId: string) => {
  const response = await axios.get(`${API_BASE_URL}/bom/${bomId}`);
  return response.data;
};

// Create quotation
export const createQuotation = async (quotationData: any) => {
  const response = await axios.post(
    `${API_BASE_URL}/customer-quotation/`,
    quotationData
  );
  return response.data;
};

// Create quotation specs in bulk
export const createQuotationSpecs = async (specsData: any[]) => {
  const response = await axios.post(
    `${API_BASE_URL}/customer-quotation-bom-spec/bulk`,
    specsData
  );
  return response.data;
};

// Create quotation item details in bulk
export const createQuotationItemDetails = async (itemsData: any[]) => {
  const response = await axios.post(
    `${API_BASE_URL}/customer-quotation-bom-item-details/bulk`,
    itemsData
  );
  return response.data;
};

// Create POC expenses in bulk
export const createPOCExpenses = async (pocData: any[]) => {
  const response = await axios.post(
    `${API_BASE_URL}/customer-quotation-poc-expense/bulk`,
    pocData
  );
  return response.data;
};

// Update quotation
export const updateQuotation = async (id: string, updateData: any) => {
  const response = await axios.put(
    `${API_BASE_URL}/customer-quotation/${id}`,
    updateData
  );
  return response.data;
};

// Create cost margins in bulk
export const createCostMargins = async (marginsData: any[]) => {
  const response = await axios.post(
    `${API_BASE_URL}/customer-quotation-cost-margin/bulk`,
    marginsData
  );
  return response.data;
};

// Create quotation comment
export const createQuotationComment = async (commentData: any) => {
  const response = await axios.post(
    `${API_BASE_URL}/customer-quotation-comment/`,
    commentData
  );
  return response.data;
};

// Update customer quotation approval
export const updateCustomerQuotationApproval = async (
  id: string,
  updates: Record<string, any>,
  updatedBy: string
) => {
  const response = await axios.put(
    `${API_BASE_URL}/customer-quotation-approval/${id}`,
    { ...updates, updated_by: updatedBy }
  );
  return response.data;
};

// Update customer quotation BOM item detail
export const updateQuotationBOMItemDetail = async (
  id: string,
  updateData: Record<string, any>
) => {
  const response = await axios.put(
    `${API_BASE_URL}/customer-quotation-bom-item-details/${id}`,
    updateData
  );
  return response.data;
};

// Update customer quotation BOM spec
export const updateQuotationBOMSpec = async (
  id: string,
  updateData: Record<string, any>
) => {
  const response = await axios.put(
    `${API_BASE_URL}/customer-quotation-bom-spec/${id}`,
    updateData
  );
  return response.data;
};

// Update customer quotation comment
export const updateQuotationComment = async (
  id: string,
  updateData: Partial<{
    customer_quotation_id: string;
    comment: string;
    updated_by: string;
  }>
) => {
  const response = await axios.put(
    `${API_BASE_URL}/customer-quotation-comment/${id}`,
    updateData
  );
  return response.data;
};

// Update customer quotation cost margin with dynamic fields
export const updateQuotationCostMargin = async (
  id: string,
  updateData: Record<string, any>
) => {
  const response = await axios.put(
    `${API_BASE_URL}/customer-quotation-cost-margin/${id}`,
    updateData
  );
  return response.data;
};

// Update customer quotation POC expense
export const updateQuotationPOCExpense = async (
  id: string,
  updateData: Record<string, any>
) => {
  const response = await axios.put(
    `${API_BASE_URL}/customer-quotation-poc-expense/${id}`,
    updateData
  );
  return response.data;
};


// Update quotation approval status (approve/reject)
export const updateQuotationDecision = async (
  id: string,
  status: "APPROVED" | "REJECTED"
) => {
  const response = await axios.patch(
    `${API_BASE_URL}/customer-quotation-approval/${id}/decision?status=${status}`
  );
  return response.data;
};

// Increment quotation step
export const incrementQuotationStep = async (id: string) => {
  const response = await axios.put(`${API_BASE_URL}/customer-quotation/increment-step/${id}`);
  return response.data;
};

// Call role variances API
export const callRoleVariances = async () => {
  const token = localStorage.getItem('auth_token');
  const response = await axios.get(
    `${import.meta.env.VITE_AUTH_BASE_URL}/role-variances`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Create bulk customer quotation approvals
export const createBulkCustomerQuotationApprovals = async (payload: {
  approvals: {
    customer_quotation_id: string;
    approver_role: string;
    approval_status: string;
  }[];
}) => {
  const token = localStorage.getItem('auth_token');
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/customer-quotation-approval/bulk`,
    payload,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Delete quotation by ID
export const deleteQuotation = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/customer-quotation/${id}`);
  return response.data;
};

// Update customer quotation status to PENDING_FOR_APPROVAL
export const updateQuotationStatus = async (id: string, status: string) => {
  const response = await axios.put(`${API_BASE_URL}/customer-quotation/${id}`, {
    approval_status: status
  });
  return response.data;
};
