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
