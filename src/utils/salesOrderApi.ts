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

export interface LeadWonQuotation {
  lead_id: string;
  lead_number: string;
  business_name: string;
  customer_id: string;
  quotation_bom_id: string;
  customer_branch_id: string;
  contact_person: string;
  project_name: string;
  quotation_id: string;
  customer_quotation_number: string;
  final_selling_amt: string;
  grand_total_gst: string;
  latest_bom_number: string;
  customer_branch_name: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
}

export interface QuotationDetails {
  quotationId: string;
  quotationDate: string;
  expiryDate: string;
  customerQuotationNumber: string;
  finalSellingAmt: string;
  grandTotalGst: string;
  highSideGstPercentage: number;
  highSideCostWithoutGst: number;
  highSideCostWithGst: number;
  lowSideGstPercentage: number;
  lowSideCostWithoutGst: number;
  lowSideCostWithGst: number;
  installationGstPercentage: number;
  installationCostWithoutGst: number;
  installationCostWithGst: number;
  lead: {
    leadId: string;
    leadNumber: string;
    businessName: string;
    projectName: string;
    projectValue: string;
    contactNo: string;
    leadStage: string;
  };
  bomNumber: string;
  customerBranch: {
    id: string;
    name: string;
    branchNumber: string | null;
    contactNumber: string;
    email: string;
  };
  contactPerson: {
    id: string;
    name: string;
    designation: string | null;
    email: string;
    phone: string;
  };
}

export const getLeadWonQuotations = async (): Promise<LeadWonQuotation[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order/lead_won_quotations`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );
  return response.data.data;
};

export const getQuotationById = async (quotationId: string): Promise<QuotationDetails> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order/${quotationId}/quotation`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );
  return response.data.data;
};

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
  salesOrder: any;
  projectDetails: any;
  bankGuaranteeInfo?: any;
  materialCosts: any[];
  paymentTerms: any[];
  contacts: any[];
  orderComments?: string;
}): Promise<any> => {
  try {
    // Step 1: Create the main sales order with project details
    const mainPayload = {
      ...salesOrderData.salesOrder,
      ...salesOrderData.projectDetails,
      ...salesOrderData.bankGuaranteeInfo,
      approval_status: 'PENDING'
    };

    const soResponse = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/sales-order`,
      mainPayload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const createdSO = soResponse.data.data;
    const soId = createdSO.id;

    // Step 2: Create material type details
    if (salesOrderData.materialCosts && salesOrderData.materialCosts.length > 0) {
      for (const material of salesOrderData.materialCosts) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/sales-order-material-type-details`,
          {
            so_id: soId,
            material_type: material.material_type,
            gst: material.gst_percentage,
            amount_basic: material.amount_basic,
            amount_with_gst: material.amount_with_gst,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Step 3: Create payment terms
    if (salesOrderData.paymentTerms && salesOrderData.paymentTerms.length > 0) {
      for (const term of salesOrderData.paymentTerms) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/sales-order-payment-terms`,
          {
            so_id: soId,
            payment_terms_type: term.payment_term_type,
            material_type: term.material_type,
            percentage: term.percentage,
            amount: term.amount,
            term_comments: term.description,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Step 4: Create contact details
    if (salesOrderData.contacts && salesOrderData.contacts.length > 0) {
      for (const contact of salesOrderData.contacts) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/sales-order-contact-details`,
          {
            so_id: soId,
            contact_designation: contact.designation,
            contact_name: contact.name,
            contact_email: contact.email,
            contact_no: contact.phone,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Step 5: Create comments
    if (salesOrderData.orderComments && salesOrderData.orderComments.trim()) {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/sales-order-comments`,
        {
          so_id: soId,
          comments: salesOrderData.orderComments,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return soResponse.data;
  } catch (error) {
    console.error('Error creating sales order:', error);
    throw error;
  }
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

// export const updateSalesOrderStep1 = async (salesOrderId: string, data: any): Promise<any> => {
//   const response = await axios.put(
//     `${import.meta.env.VITE_API_BASE_URL}/sales-order/${salesOrderId}`,
//     data,
//     {
//       headers: { "Content-Type": "application/json" },
//     }
//   );
//   return response.data;
// };

export const updateSalesOrderStep1 = async (
  salesOrderId: string,
  payload: {
    salesOrder: any;
    materialCosts?: any[];
    paymentTerms?: any[];
  }
): Promise<any> => {
  try {
    // -------------------------------
    // 1️⃣ Update Main Sales Order
    // -------------------------------
    const mainUrl = `${import.meta.env.VITE_API_BASE_URL}/sales-order/${salesOrderId}`;
    const mainResponse = await axios.put(mainUrl, payload.salesOrder, {
      headers: { "Content-Type": "application/json" },
    });

    // -------------------------------
    // 2️⃣ Update Material Type Details
    // -------------------------------
    if (Array.isArray(payload.materialCosts) && payload.materialCosts.length > 0) {
      const materialRequests = payload.materialCosts.map((item) => {
        const formatted = {
          // ...item,
          so_id: salesOrderId,
          material_type: item.type || item.materialType || null,
          gst: Number(item.gstPercentage) || 0,
          amount_basic: Number(item.amountBasic) || 0,
          amount_with_gst: Number(item.amountWithGst) || 0,
        };

        // Check if ID is a real database ID or temporary timestamp ID
        // Temporary IDs from Date.now() are typically 13+ digits
        const isTemporaryId = item.id && item.id.toString().length > 12;
        const isExistingRecord = item.id && !isTemporaryId;

        if (isExistingRecord) {
          // Existing record — update
          return axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/sales-order-material-type-details/${item.id}`,
            formatted,
            { headers: { "Content-Type": "application/json" } }
          );
        } else {
          // New record — create
          return axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/sales-order-material-type-details`,
            formatted,
            { headers: { "Content-Type": "application/json" } }
          );
        }
      });

      await Promise.all(materialRequests);
    }

    // -------------------------------
    // 3️⃣ Update Payment Terms
    // -------------------------------
    if (Array.isArray(payload.paymentTerms) && payload.paymentTerms.length > 0) {
      const paymentRequests = payload.paymentTerms.map((item) => {
        const formatted = {
          // ...item,
          so_id: salesOrderId,
          term_comments: item.description || "",
          payment_terms_type: item.termType || "",
          material_type: item.materialType || "",
          percentage: Number(item.percentage) || 0,
          amount: Number(item.amount) || 0,
        };

        // Check if ID is a real database ID or temporary timestamp ID
        // Temporary IDs from Date.now() are typically 13+ digits
        const isTemporaryId = item.id && item.id.toString().length > 12;
        const isExistingRecord = item.id && !isTemporaryId;

        if (isExistingRecord) {
          // Existing record — update
          return axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/sales-order-payment-terms/${item.id}`,
            formatted,
            { headers: { "Content-Type": "application/json" } }
          );
        } else {
          // New record — create
          return axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/sales-order-payment-terms`,
            formatted,
            { headers: { "Content-Type": "application/json" } }
          );
        }
      });

      await Promise.all(paymentRequests);
    }

    // -------------------------------
    // ✅ Return combined result
    // -------------------------------
    return {
      success: true,
      message: "Sales order and related data updated successfully",
      data: mainResponse.data,
    };
  } catch (error: any) {
    console.error("updateSalesOrderStep1 Error:", error);
    throw new Error(
      error?.response?.data?.clientMessage ||
        error?.response?.data?.message ||
        error.message ||
        "Failed to update sales order"
    );
  }
};

// export const updateSalesOrderContacts = async (salesOrderId: string, contacts: any[]): Promise<any> => {
//   // Delete existing contacts and add new ones
//   const response = await axios.put(
//     `${import.meta.env.VITE_API_BASE_URL}/sales-order-contact-details/${salesOrderId}`,
//     { contacts },
//     {
//       headers: { "Content-Type": "application/json" },
//     }
//   );
//   return response.data;
// };

// contacts: array from formData
export interface SalesOrderContact {
  id?: string;
  name?: string;
  designation?: string;
  email?: string;
  phone?: string;
  // allow additional fields coming from form
  [key: string]: any;
}

export const updateSalesOrderContacts = async (
  salesOrderId: string,
  contacts: SalesOrderContact[]
): Promise<any[]> => {
  const promises: Promise<any>[] = contacts.map((contact) => {
    const payload = {
      ...contact,
      so_id: salesOrderId,
    };
    if (contact.id) {
      return axios.put(`${import.meta.env.VITE_API_BASE_URL}/sales-order-contact-details/${contact.id}`, payload);
    } else {
      return axios.post(`${import.meta.env.VITE_API_BASE_URL}/sales-order-contact-details`, payload);
    }
  });

  const results: any[] = await Promise.all(promises);
  return results.map((r: any) => r.data);
};


export const updateSalesOrderComments = async (salesOrderId: string, comments: string): Promise<any> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order-comments`,
    {
      so_id: salesOrderId,
      comments: comments
    },
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
      reason: reason,
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

export const submitSalesOrderForApproval = async (
  salesOrderId: string,
  approvals: Array<{
    approver_role: string;
    approval_status: string;
    approved_by?: string;
    approval_comment?: string;
  }>
): Promise<any> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/sales-order-approval/${salesOrderId}/approvals`,
    {
      approvals
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
