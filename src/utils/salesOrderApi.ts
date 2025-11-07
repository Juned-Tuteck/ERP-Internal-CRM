import axios from "axios";

export interface SalesOrder {
  sales_order_id: string;
  sales_order_number: string;
  sales_order_type: "Sales Order" | "Work Order";
  lead_number?: string;
  quotation_id: string;
  quotation_number: string;
  business_name: string;
  customer_branch: string;
  contact_person: string;
  bom_number: string;
  total_cost: string;
  currency: string;
  so_date: string;
  comments?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  approval_status: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT";
  status: "draft" | "pending_approval" | "approved" | "rejected" | "in_progress" | "completed";
}

export interface ProjectDetails {
  work_order_number?: string;
  work_order_tenure_months?: number;
  project_name?: string;
  work_order_amount: string;
  work_order_date: string;
  project_start_date: string;
  project_end_date: string;
  project_category: string;
  project_template?: string;
  project_address: string;
}

export interface BankGuaranteeInfo {
  is_government: boolean;
  issue_date?: string;
  guarantee_type?: "ADVANCE PAYMENT GUARANTEE" | "BID BOND" | "FINANCIAL GUARANTEE" | "PERFORMANCE GUARANTEE";
  beneficiary_name?: string;
  beneficiary_address?: string;
  beneficiary_contact_number?: string;
  beneficiary_email?: string;
  applicant_name?: string;
  applicant_address?: string;
  applicant_contact_number?: string;
  applicant_email?: string;
  bank_name?: string;
  bank_address?: string;
  bank_contact_number?: string;
  bank_email?: string;
  guarantee_number?: string;
  guarantee_currency?: string;
  guarantee_amount?: string;
  effective_date?: string;
  expiry_date?: string;
  purpose?: string;
}

export interface MaterialTypeCost {
  material_type_id: string;
  gst_percentage: number;
  amount_basic: number;
  amount_with_gst: number;
}

export interface PaymentTerm {
  payment_term_type_id: string;
  description: string;
  percentage: number;
  amount: number;
}

export interface ContactDetail {
  name: string;
  designation?: string;
  email: string;
  phone: string;
}

export interface MaterialType {
  id: string;
  name: string;
}

export interface PaymentTermType {
  id: string;
  name: string;
  description?: string;
}

export const getAllSalesOrders = async (): Promise<SalesOrder[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );
  return response.data?.data || [];
};

export const getSalesOrderById = async (salesOrderId: string): Promise<any> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order/${salesOrderId}`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );
  return response.data?.data || {};
};

export const createSalesOrder = async (salesOrderData: {
  salesOrder: Partial<SalesOrder>;
  projectDetails: ProjectDetails;
  bankGuaranteeInfo?: BankGuaranteeInfo;
  materialCosts: MaterialTypeCost[];
  paymentTerms: PaymentTerm[];
  contacts: ContactDetail[];
  orderComments?: string;
}): Promise<any> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order`,
    salesOrderData,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

export const updateSalesOrder = async (
  salesOrderId: string,
  salesOrderData: {
    salesOrder?: Partial<SalesOrder>;
    projectDetails?: ProjectDetails;
    bankGuaranteeInfo?: BankGuaranteeInfo;
    materialCosts?: MaterialTypeCost[];
    paymentTerms?: PaymentTerm[];
    contacts?: ContactDetail[];
    orderComments?: string;
  }
): Promise<any> => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order/${salesOrderId}`,
    salesOrderData,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

export const deleteSalesOrder = async (salesOrderId: string): Promise<any> => {
  const response = await axios.delete(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order/${salesOrderId}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

export const approveSalesOrder = async (
  salesOrderId: string,
  reason?: string
): Promise<any> => {
  const response = await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order/${salesOrderId}/approve`,
    {
      approval_status: "APPROVED",
      notes: reason,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

export const rejectSalesOrder = async (
  salesOrderId: string,
  reason: string
): Promise<any> => {
  const response = await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order/${salesOrderId}/reject`,
    {
      approval_status: "REJECTED",
      rejection_reason: reason,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

export const getMaterialTypes = async (): Promise<MaterialType[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order-material-type-details`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );
  return response.data?.data || [];
};

export const getPaymentTermTypes = async (): Promise<PaymentTermType[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order-payment-terms`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );
  return response.data?.data || [];
};

export const getSalesOrderContactDetails = async (
  salesOrderId: string
): Promise<ContactDetail[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order-contact-details/${salesOrderId}`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );
  return response.data?.data || [];
};

export const getSalesOrderComments = async (
  salesOrderId: string
): Promise<any[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order-comments/${salesOrderId}`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );
  return response.data?.data || [];
};

export const addSalesOrderComment = async (
  salesOrderId: string,
  comment: string
): Promise<any> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order-comments`,
    {
      sales_order_id: salesOrderId,
      comment,
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};
