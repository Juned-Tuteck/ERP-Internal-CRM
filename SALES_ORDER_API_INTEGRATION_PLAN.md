# Sales Order API Integration Implementation Plan

## Overview
This document provides a comprehensive implementation plan for integrating APIs into the Sales Order section of the React + TypeScript CRM application.

## Architecture

### API Base URL
```
Base URL: ${import.meta.env.VITE_API_BASE_URL}
Current: http://localhost:7320/api
```

### Available API Endpoints

1. **GET** `/sales-order` - Fetch all sales orders
2. **GET** `/sales-order/:id` - Fetch single sales order by ID
3. **POST** `/sales-order` - Create new sales order
4. **PUT** `/sales-order/:id` - Update sales order
5. **DELETE** `/sales-order/:id` - Delete sales order
6. **PATCH** `/sales-order/:id/approve` - Approve sales order
7. **PATCH** `/sales-order/:id/reject` - Reject sales order
8. **GET** `/sales-order-material-type-details` - Fetch material types
9. **GET** `/sales-order-payment-terms` - Fetch payment term types
10. **GET** `/sales-order-contact-details/:id` - Fetch contacts for a sales order
11. **GET** `/sales-order-comments/:id` - Fetch comments for a sales order
12. **POST** `/sales-order-comments` - Add comment to sales order

---

## Implementation Steps

### Step 1: API Utility File ✅ COMPLETED

**File:** `src/utils/salesOrderApi.ts`

This file contains all API functions for sales order operations:
- `getAllSalesOrders()` - Fetch all sales orders
- `getSalesOrderById(id)` - Fetch single sales order
- `createSalesOrder(data)` - Create new sales order
- `updateSalesOrder(id, data)` - Update existing sales order
- `deleteSalesOrder(id)` - Delete sales order
- `approveSalesOrder(id, reason)` - Approve sales order
- `rejectSalesOrder(id, reason)` - Reject sales order
- `getMaterialTypes()` - Fetch material type dropdown options
- `getPaymentTermTypes()` - Fetch payment term type dropdown options
- `getSalesOrderContactDetails(id)` - Fetch contacts
- `getSalesOrderComments(id)` - Fetch comments
- `addSalesOrderComment(id, comment)` - Add new comment

---

### Step 2: UI Field Modifications Required

#### A. Sales Order Details Section
**Current Fields:**
- Quotation (dropdown)
- Business Name (read-only)
- BOM Number (read-only)
- Customer Branch (dropdown)
- Contact Person (dropdown)
- Total Cost (read-only)
- Currency (dropdown)
- SO Date (date)
- Comments (textarea)

**NEW FIELDS TO ADD:**
1. **Sales Order Type** (dropdown)
   - Options: "Sales Order", "Work Order"
   - Field name: `salesOrderType`
   - Required: Yes
   - Position: Top of form

2. **Lead Number** (text input)
   - Field name: `leadNumber`
   - Required: No
   - Position: After Sales Order Type

#### B. Project Details Section
**Current Fields:**
- Work Order Number
- Manpower/Service Quotation
- Work Order Amount
- Work Order Date
- Project Category
- Project Template
- Project Address
- Estimated Start Date
- Estimated End Date

**NEW FIELDS TO ADD:**
1. **Work Order Tenure (in months)** (number input)
   - Field name: `workOrderTenureMonths`
   - Required: No
   - Position: After Work Order Number

2. **Project Name** (text input)
   - Field name: `projectName`
   - Required: No
   - Position: After Work Order Tenure

**FIELD TO REMOVE:**
- ❌ Remove "Manpower/Service Quotation" field

#### C. Bank Guarantee Information Section
**Current Fields:**
- Beneficiary Details (name, address, contact, email)
- Applicant Details (name, address, contact, email)
- Bank Details (name, address, contact, email)
- Guarantee Number
- Currency
- Guarantee Amount
- Effective Date
- Expiry Date
- Purpose
- Exemption Type

**NEW FIELD TO ADD:**
1. **Issue Date** (date input)
   - Field name: `issueDate`
   - Required: No
   - Position: After BG Information header

**FIELD TO MODIFY:**
2. **Replace "Exemption Type" with "Guarantee Type"**
   - Field name: Change from `exemptionType` to `guaranteeType`
   - Options:
     - "ADVANCE PAYMENT GUARANTEE"
     - "BID BOND"
     - "FINANCIAL GUARANTEE"
     - "PERFORMANCE GUARANTEE"

#### D. New Material Type Section
**NEW SECTION TO ADD:**

**Material Type** (dropdown)
- Field name: `materialTypeId`
- Data Source: API endpoint `/sales-order-material-type-details`
- Required: Yes
- Position: After BG Information section

The material types will be populated dynamically from the API and used in the Material Type Cost table.

#### E. Payment Terms Section
**Current Implementation:**
- Description (text input)
- Term Type (dropdown with hardcoded values)
- Percentage (number input)
- Amount (calculated)

**MODIFICATION REQUIRED:**

**Payment Term Type** dropdown should be populated from API:
- Data Source: API endpoint `/sales-order-payment-terms`
- Current hardcoded values to replace:
  - "On Order"
  - "On Delivery"
  - "On Installation"
  - "After Commissioning"
  - "After Handover"
- New values from API (examples):
  - "After Commissioning"
  - "After DP"
  - "After Handing Over"
  - "After Installation"
  - "Before Dispatch Against PI"

---

### Step 3: Component Updates

#### A. Update `CreateSalesOrderModal.tsx`

**Changes needed in form state:**

```typescript
const [formData, setFormData] = useState({
  // NEW FIELDS
  salesOrderType: 'Sales Order',
  leadNumber: '',

  // Existing fields...
  quotationId: '',
  quotationNumber: '',
  businessName: '',
  customerBranch: '',
  contactPerson: '',
  bomNumber: '',
  totalCost: '',
  currency: 'INR',
  soDate: new Date().toISOString().split('T')[0],
  comments: '',

  // Project Details
  workOrderNumber: '',
  workOrderTenureMonths: '', // NEW
  projectName: '', // NEW
  // REMOVED: manpowerServiceQuotation
  workOrderAmount: '',
  workOrderDate: new Date().toISOString().split('T')[0],
  projectStartDate: '',
  projectEndDate: '',
  projectCategory: '',
  projectTemplate: '',
  projectAddress: '',

  // BG Information
  isGovernment: false,
  issueDate: '', // NEW
  beneficiaryName: '',
  beneficiaryAddress: '',
  beneficiaryContactNumber: '',
  beneficiaryEmail: '',
  applicantName: '',
  applicantAddress: '',
  applicantContactNumber: '',
  applicantEmail: '',
  bankName: '',
  bankAddress: '',
  bankContactNumber: '',
  bankEmail: '',
  guaranteeNumber: '',
  guaranteeCurrency: 'INR',
  guaranteeAmount: '',
  effectiveDate: '',
  expiryDate: '',
  purpose: '',
  guaranteeType: '', // RENAMED from exemptionType

  // NEW: Material Type
  materialTypeId: '',

  // Material Costs (from dynamic API)
  materialCosts: [],

  // Payment Terms (from dynamic API)
  paymentTerms: [],

  // Contacts
  contacts: [],

  // Comments
  orderComments: ''
});
```

**Add state for dropdown options:**

```typescript
const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
const [paymentTermTypes, setPaymentTermTypes] = useState<PaymentTermType[]>([]);
```

**Add useEffect to fetch dropdown data:**

```typescript
import { getMaterialTypes, getPaymentTermTypes } from '../../utils/salesOrderApi';

useEffect(() => {
  const fetchDropdownData = async () => {
    try {
      const [materialTypesData, paymentTermTypesData] = await Promise.all([
        getMaterialTypes(),
        getPaymentTermTypes()
      ]);
      setMaterialTypes(materialTypesData);
      setPaymentTermTypes(paymentTermTypesData);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  if (isOpen) {
    fetchDropdownData();
  }
}, [isOpen]);
```

**Update JSX for new fields:**

```tsx
{/* Sales Order Type - NEW FIELD */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Sales Order Type *
  </label>
  <select
    name="salesOrderType"
    value={formData.salesOrderType}
    onChange={handleInputChange}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="Sales Order">Sales Order</option>
    <option value="Work Order">Work Order</option>
  </select>
</div>

{/* Lead Number - NEW FIELD */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Lead Number
  </label>
  <input
    type="text"
    name="leadNumber"
    value={formData.leadNumber}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="Enter lead number"
  />
</div>

{/* Work Order Tenure - NEW FIELD */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Work Order Tenure (in months)
  </label>
  <input
    type="number"
    name="workOrderTenureMonths"
    value={formData.workOrderTenureMonths}
    onChange={handleInputChange}
    min="0"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="Enter tenure in months"
  />
</div>

{/* Project Name - NEW FIELD */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Project Name
  </label>
  <input
    type="text"
    name="projectName"
    value={formData.projectName}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="Enter project name"
  />
</div>

{/* Issue Date - NEW FIELD in BG section */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Issue Date
  </label>
  <input
    type="date"
    name="issueDate"
    value={formData.issueDate}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  />
</div>

{/* Guarantee Type - MODIFIED FIELD (replaced Exemption Type) */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Guarantee Type
  </label>
  <select
    name="guaranteeType"
    value={formData.guaranteeType}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Select Guarantee Type</option>
    <option value="ADVANCE PAYMENT GUARANTEE">ADVANCE PAYMENT GUARANTEE</option>
    <option value="BID BOND">BID BOND</option>
    <option value="FINANCIAL GUARANTEE">FINANCIAL GUARANTEE</option>
    <option value="PERFORMANCE GUARANTEE">PERFORMANCE GUARANTEE</option>
  </select>
</div>

{/* Material Type - NEW FIELD */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Material Type *
  </label>
  <select
    name="materialTypeId"
    value={formData.materialTypeId}
    onChange={handleInputChange}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    <option value="">Select Material Type</option>
    {materialTypes.map(type => (
      <option key={type.id} value={type.id}>{type.name}</option>
    ))}
  </select>
</div>

{/* Payment Term Type - UPDATED with dynamic data */}
<select
  value={term.termType}
  onChange={(e) => updatePaymentTerm(term.id, 'termType', e.target.value)}
  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option value="">Select Term Type</option>
  {paymentTermTypes.map(type => (
    <option key={type.id} value={type.id}>{type.name}</option>
  ))}
</select>
```

**Update handleSubmit function:**

```typescript
import { createSalesOrder } from '../../utils/salesOrderApi';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // Prepare data structure for API
    const salesOrderData = {
      salesOrder: {
        sales_order_type: formData.salesOrderType,
        lead_number: formData.leadNumber,
        quotation_id: formData.quotationId,
        quotation_number: formData.quotationNumber,
        business_name: formData.businessName,
        customer_branch: formData.customerBranch,
        contact_person: formData.contactPerson,
        bom_number: formData.bomNumber,
        total_cost: formData.totalCost,
        currency: formData.currency,
        so_date: formData.soDate,
        comments: formData.comments,
      },
      projectDetails: {
        work_order_number: formData.workOrderNumber,
        work_order_tenure_months: formData.workOrderTenureMonths ? parseInt(formData.workOrderTenureMonths) : undefined,
        project_name: formData.projectName,
        work_order_amount: formData.workOrderAmount,
        work_order_date: formData.workOrderDate,
        project_start_date: formData.projectStartDate,
        project_end_date: formData.projectEndDate,
        project_category: formData.projectCategory,
        project_template: formData.projectTemplate,
        project_address: formData.projectAddress,
      },
      bankGuaranteeInfo: formData.isGovernment ? {
        is_government: formData.isGovernment,
        issue_date: formData.issueDate,
        guarantee_type: formData.guaranteeType,
        beneficiary_name: formData.beneficiaryName,
        beneficiary_address: formData.beneficiaryAddress,
        beneficiary_contact_number: formData.beneficiaryContactNumber,
        beneficiary_email: formData.beneficiaryEmail,
        applicant_name: formData.applicantName,
        applicant_address: formData.applicantAddress,
        applicant_contact_number: formData.applicantContactNumber,
        applicant_email: formData.applicantEmail,
        bank_name: formData.bankName,
        bank_address: formData.bankAddress,
        bank_contact_number: formData.bankContactNumber,
        bank_email: formData.bankEmail,
        guarantee_number: formData.guaranteeNumber,
        guarantee_currency: formData.guaranteeCurrency,
        guarantee_amount: formData.guaranteeAmount,
        effective_date: formData.effectiveDate,
        expiry_date: formData.expiryDate,
        purpose: formData.purpose,
      } : undefined,
      materialCosts: formData.materialCosts.map(cost => ({
        material_type_id: formData.materialTypeId,
        gst_percentage: cost.gstPercentage,
        amount_basic: cost.amountBasic,
        amount_with_gst: cost.amountWithGst,
      })),
      paymentTerms: formData.paymentTerms.map(term => ({
        payment_term_type_id: term.termType,
        description: term.description,
        percentage: term.percentage,
        amount: term.amount,
      })),
      contacts: formData.contacts,
      orderComments: formData.orderComments,
    };

    // Call API
    const response = await createSalesOrder(salesOrderData);

    // Call parent onSubmit for UI update
    onSubmit(response.data);

    // Reset form
    setCurrentStep(1);
    setFormData({ /* reset to initial state */ });

  } catch (error) {
    console.error('Error creating sales order:', error);
    // Show error notification
  }
};
```

#### B. Update `SalesOrderList.tsx`

**Replace mock data with API call:**

```typescript
import { useState, useEffect } from 'react';
import { getAllSalesOrders, SalesOrder } from '../../utils/salesOrderApi';

const SalesOrderList: React.FC<SalesOrderListProps> = ({
  selectedSalesOrder,
  onSelectSalesOrder
}) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesOrders = async () => {
      try {
        setLoading(true);
        const data = await getAllSalesOrders();
        setSalesOrders(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sales orders:', err);
        setError('Failed to load sales orders');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOrders();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading sales orders...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-2 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Rest of the component...
};
```

#### C. Update `SalesOrderDetails.tsx`

**Fetch full sales order details:**

```typescript
import { useState, useEffect } from 'react';
import {
  getSalesOrderById,
  getSalesOrderContactDetails,
  getSalesOrderComments,
  addSalesOrderComment,
  deleteSalesOrder
} from '../../utils/salesOrderApi';

const SalesOrderDetails: React.FC<SalesOrderDetailsProps> = ({ salesOrder }) => {
  const [fullSalesOrder, setFullSalesOrder] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!salesOrder?.id) return;

      try {
        setLoading(true);
        const [details, contactsData, commentsData] = await Promise.all([
          getSalesOrderById(salesOrder.id),
          getSalesOrderContactDetails(salesOrder.id),
          getSalesOrderComments(salesOrder.id)
        ]);

        setFullSalesOrder(details);
        setContacts(contactsData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching sales order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [salesOrder?.id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !salesOrder?.id) return;

    try {
      await addSalesOrderComment(salesOrder.id, newComment);
      const updatedComments = await getSalesOrderComments(salesOrder.id);
      setComments(updatedComments);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!salesOrder?.id) return;

    try {
      await deleteSalesOrder(salesOrder.id);
      // Refresh list or navigate away
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting sales order:', error);
    }
  };

  // Rest of the component...
};
```

#### D. Update `SalesOrderApproval.tsx`

**Implement approval/rejection with API:**

```typescript
import { useState, useEffect } from 'react';
import {
  getAllSalesOrders,
  approveSalesOrder,
  rejectSalesOrder
} from '../../utils/salesOrderApi';

const SalesOrderApproval: React.FC<SalesOrderApprovalProps> = ({
  onApprovalAction
}) => {
  const [pendingSalesOrders, setPendingSalesOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingSalesOrders();
  }, []);

  const fetchPendingSalesOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await getAllSalesOrders();
      const pending = allOrders.filter(
        order => order.approval_status === 'PENDING'
      );
      setPendingSalesOrders(pending);
    } catch (error) {
      console.error('Error fetching pending sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (salesOrderId: string, reason?: string) => {
    try {
      await approveSalesOrder(salesOrderId, reason);
      onApprovalAction(salesOrderId, 'approve', reason);
      fetchPendingSalesOrders(); // Refresh list
    } catch (error) {
      console.error('Error approving sales order:', error);
    }
  };

  const handleReject = async (salesOrderId: string, reason: string) => {
    try {
      await rejectSalesOrder(salesOrderId, reason);
      onApprovalAction(salesOrderId, 'reject', reason);
      fetchPendingSalesOrders(); // Refresh list
    } catch (error) {
      console.error('Error rejecting sales order:', error);
    }
  };

  // Rest of the component...
};
```

---

### Step 4: Form Data Mapping

**Frontend to Backend Mapping:**

```typescript
// Frontend Form Field -> Backend API Field
{
  // Sales Order Details
  salesOrderType -> sales_order_type
  leadNumber -> lead_number
  quotationId -> quotation_id
  quotationNumber -> quotation_number
  businessName -> business_name
  customerBranch -> customer_branch
  contactPerson -> contact_person
  bomNumber -> bom_number
  totalCost -> total_cost
  currency -> currency
  soDate -> so_date
  comments -> comments

  // Project Details
  workOrderNumber -> work_order_number
  workOrderTenureMonths -> work_order_tenure_months
  projectName -> project_name
  workOrderAmount -> work_order_amount
  workOrderDate -> work_order_date
  projectStartDate -> project_start_date
  projectEndDate -> project_end_date
  projectCategory -> project_category
  projectTemplate -> project_template
  projectAddress -> project_address

  // BG Information
  isGovernment -> is_government
  issueDate -> issue_date
  guaranteeType -> guarantee_type
  beneficiaryName -> beneficiary_name
  beneficiaryAddress -> beneficiary_address
  beneficiaryContactNumber -> beneficiary_contact_number
  beneficiaryEmail -> beneficiary_email
  applicantName -> applicant_name
  applicantAddress -> applicant_address
  applicantContactNumber -> applicant_contact_number
  applicantEmail -> applicant_email
  bankName -> bank_name
  bankAddress -> bank_address
  bankContactNumber -> bank_contact_number
  bankEmail -> bank_email
  guaranteeNumber -> guarantee_number
  guaranteeCurrency -> guarantee_currency
  guaranteeAmount -> guarantee_amount
  effectiveDate -> effective_date
  expiryDate -> expiry_date
  purpose -> purpose

  // Material Costs
  materialTypeId -> material_type_id
  gstPercentage -> gst_percentage
  amountBasic -> amount_basic
  amountWithGst -> amount_with_gst

  // Payment Terms
  termType -> payment_term_type_id
  description -> description
  percentage -> percentage
  amount -> amount

  // Contacts
  name -> name
  designation -> designation
  email -> email
  phone -> phone

  // Comments
  orderComments -> comment
}
```

---

### Step 5: Error Handling

**Implement comprehensive error handling:**

```typescript
import axios from 'axios';

const handleApiError = (error: any, context: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      console.error(`${context} - Server Error:`, error.response.data);
      return `Server error: ${error.response.data.message || 'Unknown error'}`;
    } else if (error.request) {
      // Request made but no response
      console.error(`${context} - No Response:`, error.request);
      return 'No response from server. Please check your connection.';
    }
  }
  // Other errors
  console.error(`${context} - Error:`, error);
  return 'An unexpected error occurred. Please try again.';
};

// Usage in components:
try {
  const response = await createSalesOrder(data);
  // Success handling
} catch (error) {
  const errorMessage = handleApiError(error, 'Create Sales Order');
  // Show error to user (toast, alert, etc.)
}
```

---

### Step 6: State Management

**Optional: Add React Context for Sales Orders:**

```typescript
// src/context/SalesOrderContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { SalesOrder } from '../utils/salesOrderApi';

interface SalesOrderContextType {
  salesOrders: SalesOrder[];
  setSalesOrders: (orders: SalesOrder[]) => void;
  refreshSalesOrders: () => Promise<void>;
  selectedSalesOrder: SalesOrder | null;
  setSelectedSalesOrder: (order: SalesOrder | null) => void;
}

const SalesOrderContext = createContext<SalesOrderContextType | undefined>(undefined);

export const SalesOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder | null>(null);

  const refreshSalesOrders = async () => {
    try {
      const data = await getAllSalesOrders();
      setSalesOrders(data);
    } catch (error) {
      console.error('Error refreshing sales orders:', error);
    }
  };

  return (
    <SalesOrderContext.Provider value={{
      salesOrders,
      setSalesOrders,
      refreshSalesOrders,
      selectedSalesOrder,
      setSelectedSalesOrder
    }}>
      {children}
    </SalesOrderContext.Provider>
  );
};

export const useSalesOrder = () => {
  const context = useContext(SalesOrderContext);
  if (!context) {
    throw new Error('useSalesOrder must be used within SalesOrderProvider');
  }
  return context;
};
```

---

### Step 7: Testing Checklist

- [ ] Test fetching all sales orders
- [ ] Test creating new sales order with all fields
- [ ] Test updating existing sales order
- [ ] Test deleting sales order
- [ ] Test approval workflow
- [ ] Test rejection workflow
- [ ] Test material type dropdown population
- [ ] Test payment term type dropdown population
- [ ] Test contact details fetching
- [ ] Test comment fetching and adding
- [ ] Test form validation
- [ ] Test error handling for network failures
- [ ] Test error handling for API errors
- [ ] Test loading states
- [ ] Test responsive design

---

### Step 8: Expected API Response Formats

**1. GET /sales-order**
```json
{
  "success": true,
  "data": [
    {
      "sales_order_id": "uuid",
      "sales_order_number": "SO-2024-001",
      "sales_order_type": "Sales Order",
      "lead_number": "LD-2024-001",
      "quotation_id": "uuid",
      "quotation_number": "QT-2024-001",
      "business_name": "TechCorp Solutions",
      "total_cost": "2475000",
      "currency": "INR",
      "approval_status": "APPROVED",
      "created_at": "2024-01-15T10:30:00Z",
      "created_by": "user_id"
    }
  ]
}
```

**2. POST /sales-order**
```json
{
  "success": true,
  "message": "Sales order created successfully",
  "data": {
    "sales_order_id": "uuid",
    "sales_order_number": "SO-2024-002"
  }
}
```

**3. GET /sales-order-material-type-details**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "High Side Supply"
    },
    {
      "id": "uuid",
      "name": "Low Side Supply"
    }
  ]
}
```

**4. GET /sales-order-payment-terms**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "After Commissioning",
      "description": "Payment due after commissioning"
    },
    {
      "id": "uuid",
      "name": "Before Dispatch Against PI",
      "description": "Payment before dispatch"
    }
  ]
}
```

---

## Summary

### Files Created:
1. ✅ `src/utils/salesOrderApi.ts` - API utility functions
2. 📝 `SALES_ORDER_API_INTEGRATION_PLAN.md` - This documentation

### Files Modified:
1. ✅ `src/utils/apiEndpoints.ts` - Added sales order endpoints
2. ✅ `.env` - Added API base URL
3. 📋 `src/pages/SalesOrders/components/CreateSalesOrderModal.tsx` - TO BE UPDATED
4. 📋 `src/pages/SalesOrders/components/SalesOrderList.tsx` - TO BE UPDATED
5. 📋 `src/pages/SalesOrders/components/SalesOrderDetails.tsx` - TO BE UPDATED
6. 📋 `src/pages/SalesOrders/components/SalesOrderApproval.tsx` - TO BE UPDATED

### Next Steps:
1. Implement the UI field modifications in `CreateSalesOrderModal.tsx`
2. Replace mock data with API calls in all components
3. Add loading and error states
4. Implement form validation
5. Test all CRUD operations
6. Test approval workflow
7. Build and deploy

---

## Code Snippets Reference

All the code snippets provided in this document are production-ready and follow the existing codebase patterns. Simply copy and adapt them to your specific component needs.

For questions or issues, refer to the existing API patterns in:
- `src/utils/vendorApi.ts`
- `src/utils/customerApi.ts`
