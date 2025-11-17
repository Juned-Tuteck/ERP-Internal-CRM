# Sales Order API Integration - Quick Reference Card

## 🎯 What You Need to Do

### 1. Import the API Functions
```typescript
import {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  approveSalesOrder,
  rejectSalesOrder,
  getMaterialTypes,
  getPaymentTermTypes,
  getSalesOrderContactDetails,
  getSalesOrderComments,
  addSalesOrderComment
} from '../../utils/salesOrderApi';
```

### 2. Add These New Fields to CreateSalesOrderModal

| Section | Field Name | Type | Required | Options |
|---------|-----------|------|----------|---------|
| Sales Order Details | `salesOrderType` | dropdown | Yes | "Sales Order", "Work Order" |
| Sales Order Details | `leadNumber` | text | No | - |
| Project Details | `workOrderTenureMonths` | number | No | - |
| Project Details | `projectName` | text | No | - |
| BG Information | `issueDate` | date | No | - |
| BG Information | `guaranteeType` | dropdown | No | "ADVANCE PAYMENT GUARANTEE", "BID BOND", "FINANCIAL GUARANTEE", "PERFORMANCE GUARANTEE" |
| Material Section | `materialTypeId` | dropdown | Yes | From API |

### 3. Remove This Field
- ❌ **Delete:** `manpowerServiceQuotation` from Project Details section

### 4. Replace Dropdown Data Source

**Payment Term Type:**
- ❌ **Old:** Hardcoded array `['On Order', 'On Delivery', ...]`
- ✅ **New:** `getPaymentTermTypes()` API call

---

## 📋 Quick Copy-Paste Code

### Fetch Dropdown Data (useEffect)
```typescript
const [materialTypes, setMaterialTypes] = useState([]);
const [paymentTermTypes, setPaymentTermTypes] = useState([]);

useEffect(() => {
  const fetchDropdownData = async () => {
    try {
      const [materials, payments] = await Promise.all([
        getMaterialTypes(),
        getPaymentTermTypes()
      ]);
      setMaterialTypes(materials);
      setPaymentTermTypes(payments);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  if (isOpen) {
    fetchDropdownData();
  }
}, [isOpen]);
```

### Fetch Sales Orders (SalesOrderList.tsx)
```typescript
const [salesOrders, setSalesOrders] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllSalesOrders();
      setSalesOrders(data);
    } catch (error) {
      console.error('Error fetching sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchSalesOrders();
}, []);
```

### Create Sales Order (handleSubmit)
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const salesOrderData = {
      salesOrder: {
        sales_order_type: formData.salesOrderType,
        lead_number: formData.leadNumber,
        // ... map all fields
      },
      projectDetails: {
        work_order_tenure_months: formData.workOrderTenureMonths,
        project_name: formData.projectName,
        // ... map all fields
      },
      // ... other sections
    };

    await createSalesOrder(salesOrderData);
    onSubmit(salesOrderData);
  } catch (error) {
    console.error('Error creating sales order:', error);
  }
};
```

### Approve/Reject Sales Order
```typescript
const handleApprove = async (id, reason) => {
  try {
    await approveSalesOrder(id, reason);
    // Refresh list
  } catch (error) {
    console.error('Error approving:', error);
  }
};

const handleReject = async (id, reason) => {
  try {
    await rejectSalesOrder(id, reason);
    // Refresh list
  } catch (error) {
    console.error('Error rejecting:', error);
  }
};
```

---

## 🔗 API Endpoints Reference

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Get all sales orders | `/sales-order` | GET |
| Get single sales order | `/sales-order/:id` | GET |
| Create sales order | `/sales-order` | POST |
| Update sales order | `/sales-order/:id` | PUT |
| Delete sales order | `/sales-order/:id` | DELETE |
| Approve sales order | `/sales-order/:id/approve` | PATCH |
| Reject sales order | `/sales-order/:id/reject` | PATCH |
| Get material types | `/sales-order-material-type-details` | GET |
| Get payment terms | `/sales-order-payment-terms` | GET |
| Get contacts | `/sales-order-contact-details/:id` | GET |
| Get comments | `/sales-order-comments/:id` | GET |
| Add comment | `/sales-order-comments` | POST |

---

## 🎨 New JSX Field Examples

### Sales Order Type
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Sales Order Type *
  </label>
  <select
    name="salesOrderType"
    value={formData.salesOrderType}
    onChange={handleInputChange}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="Sales Order">Sales Order</option>
    <option value="Work Order">Work Order</option>
  </select>
</div>
```

### Guarantee Type (replaces Exemption Type)
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Guarantee Type
  </label>
  <select
    name="guaranteeType"
    value={formData.guaranteeType}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Guarantee Type</option>
    <option value="ADVANCE PAYMENT GUARANTEE">ADVANCE PAYMENT GUARANTEE</option>
    <option value="BID BOND">BID BOND</option>
    <option value="FINANCIAL GUARANTEE">FINANCIAL GUARANTEE</option>
    <option value="PERFORMANCE GUARANTEE">PERFORMANCE GUARANTEE</option>
  </select>
</div>
```

### Material Type (dynamic)
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Material Type *
  </label>
  <select
    name="materialTypeId"
    value={formData.materialTypeId}
    onChange={handleInputChange}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Material Type</option>
    {materialTypes.map(type => (
      <option key={type.id} value={type.id}>{type.name}</option>
    ))}
  </select>
</div>
```

### Payment Term Type (dynamic)
```tsx
<select
  value={term.termType}
  onChange={(e) => updatePaymentTerm(term.id, 'termType', e.target.value)}
  className="w-full px-2 py-1 border border-gray-300 rounded-md"
>
  <option value="">Select Term Type</option>
  {paymentTermTypes.map(type => (
    <option key={type.id} value={type.id}>{type.name}</option>
  ))}
</select>
```

---

## 📊 Field Mapping (Frontend → Backend)

### Sales Order Section
```
salesOrderType → sales_order_type
leadNumber → lead_number
quotationId → quotation_id
businessName → business_name
customerBranch → customer_branch
```

### Project Section
```
workOrderTenureMonths → work_order_tenure_months
projectName → project_name
workOrderAmount → work_order_amount
projectCategory → project_category
```

### BG Section
```
issueDate → issue_date
guaranteeType → guarantee_type
beneficiaryName → beneficiary_name
```

### Material/Payment
```
materialTypeId → material_type_id
gstPercentage → gst_percentage
termType → payment_term_type_id
```

---

## ✅ Testing Checklist

- [ ] Material types load in dropdown
- [ ] Payment term types load in dropdown
- [ ] Can create sales order with new fields
- [ ] Sales Order Type dropdown works
- [ ] Lead Number field saves
- [ ] Work Order Tenure saves as number
- [ ] Project Name field saves
- [ ] Issue Date field works
- [ ] Guarantee Type dropdown works
- [ ] Can approve sales order
- [ ] Can reject sales order
- [ ] Error messages display correctly
- [ ] Loading states show properly

---

## 📁 Files to Modify

1. ✅ `src/utils/salesOrderApi.ts` - Already created
2. ✅ `src/utils/apiEndpoints.ts` - Already updated
3. ✅ `.env` - Already updated
4. 📋 `src/pages/SalesOrders/components/CreateSalesOrderModal.tsx` - **You need to update**
5. 📋 `src/pages/SalesOrders/components/SalesOrderList.tsx` - **You need to update**
6. 📋 `src/pages/SalesOrders/components/SalesOrderDetails.tsx` - **You need to update**
7. 📋 `src/pages/SalesOrders/components/SalesOrderApproval.tsx` - **You need to update**

---

## 🚀 Build Command

```bash
npm run build
```

---

## 📚 Documentation Files

- `SALES_ORDER_API_INTEGRATION_PLAN.md` - Complete detailed guide
- `IMPLEMENTATION_SUMMARY.md` - What was done and what's left
- `QUICK_REFERENCE.md` - This file (quick copy-paste snippets)

---

**Remember:** Only the Sales Order section is affected. No changes to other modules!
