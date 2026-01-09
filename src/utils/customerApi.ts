import axios from "axios";

// Define the Customer interface based on the API response
export interface Customer {
  customer_id: string;
  customer_number: string;
  business_name: string;
  contact_number: string;
  email: string;
  country: string;
  currency: string;
  state: string;
  district: string;
  city: string;
  customer_type: string;
  customer_potential: string;
  pincode: string;
  active: boolean;
  pan_number: string;
  tan_number?: string;
  gst_number: string;
  bank_name: string;
  bank_account_number?: string;
  branch_name?: string;
  ifsc_code?: string;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  approved_by?: string | null;
  created_at: string;
  created_by: string;
  updated_at?: string | null;
  updated_by?: string | null;
  is_active: boolean;
  is_deleted: boolean;
}

// Fetch all customers from the API
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/customer/`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );

  return response.data || [];
};

// Get pending customers (not APPROVED or REJECTED)
export const getPendingCustomers = async (): Promise<Customer[]> => {
  const customers = await getCustomers();
  return customers.filter(
    (customer) =>
      customer.approval_status !== "APPROVED" &&
      customer.approval_status !== "REJECTED"
  );
};

// Approve a customer
export const approveCustomer = async (
  customerId: string,
  reason?: string
): Promise<any> => {
  const response = await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}/customer/${customerId}/approve`,
    {
      approval_status: "APPROVED",
      notes: reason,
    },
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );

  return response.data;
};

// Reject a customer
export const rejectCustomer = async (
  customerId: string,
  reason: string
): Promise<any> => {
  const response = await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}/customer/${customerId}/reject`,
    {
      approval_status: "REJECTED",
      rejection_reason: reason,
    },
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );

  return response.data;
};

// Update arbitrary customer fields using PUT /customer/:id
export const updateCustomer = async (
  customerId: string,
  fields: Record<string, unknown>
): Promise<unknown> => {
  if (!customerId) throw new Error('customerId is required');

  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/customer/${customerId}`,
    fields,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );

  return response.data;
};

// Compliance File Upload APIs

/**
 * Upload a compliance file for a customer
 * @param customerId - Customer ID
 * @param file - File to upload
 * @param documentType - Type of document (PAN, TAN, GST, BANK)
 * @param entityLevel - Entity level (HO or BRANCH)
 * @param customerBranchId - Branch ID (required for BRANCH level)
 * @param uploadBy - User ID who is uploading
 * @returns Upload response data
 */
export const uploadComplianceFile = async (
  customerId: string,
  file: File,
  documentType: string,
  entityLevel: string,
  customerBranchId: string | null,
  uploadBy: string
): Promise<any> => {
  const formData = new FormData();
  console.log("clicked upload compliance file")
  formData.append('file', file);
  formData.append('document_type', documentType);
  formData.append('entity_level', entityLevel);
  formData.append('upload_by', uploadBy);

  if (entityLevel === 'BRANCH' && customerBranchId) {
    formData.append('customer_branch_id', customerBranchId);
  }

  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/customer-compliance-file/${customerId}/compliance-files`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Get all compliance files for a customer
 * @param customerId - Customer ID
 * @returns Array of compliance files
 */
export const getComplianceFiles = async (customerId: string): Promise<any[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/customer-compliance-file/${customerId}/compliance-files`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );

  return response.data.data || [];
};

/**
 * Download a compliance file
 * @param customerId - Customer ID
 * @param fileId - File ID
 * @returns Blob data for download
 */
export const downloadComplianceFile = async (
  customerId: string,
  fileId: string
): Promise<Blob> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/customer-compliance-file/${customerId}/compliance-files/${fileId}/download`,
    {
      responseType: 'blob',
      headers: { "Cache-Control": "no-cache" },
    }
  );

  return response.data;
};

/**
 * Get all temporary customers
 * @returns Array of temporary customers
 */
export const getTempCustomers = async (): Promise<any[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/customer/temp-customers`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );

  return response.data.data || [];
};

