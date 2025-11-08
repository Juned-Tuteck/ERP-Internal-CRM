# Quotation Auto-Fill Feature - Implementation Summary

## Overview
Implemented dynamic quotation loading and auto-fill functionality in the Sales Order creation modal. When users select a quotation, the system now fetches details from the API and automatically populates related fields.

---

## Changes Made

### 1. API Functions Added

#### File: `src/utils/salesOrderApi.ts`

**New Interfaces:**
```typescript
export interface LeadWonQuotation {
  lead_id: string;
  lead_number: string;
  business_name: string;
  customer_id: string;
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
```

**New API Functions:**

1. **`getLeadWonQuotations()`**
   - Endpoint: `GET /sales-order/lead_won_quotations`
   - Returns: List of quotations from won leads
   - Used to populate the quotation dropdown

2. **`getQuotationById(quotationId)`**
   - Endpoint: `GET /sales-order/:quotation_id/quotation`
   - Returns: Complete quotation details including lead, customer branch, and contact person info
   - Used to auto-fill form fields when a quotation is selected

---

### 2. Modal Component Updates

#### File: `src/pages/SalesOrders/components/CreateSalesOrderModal.tsx`

**State Management:**
```typescript
const [quotations, setQuotations] = useState<LeadWonQuotation[]>([]);
const [loadingQuotations, setLoadingQuotations] = useState(false);
```

**Fetch Quotations on Modal Open:**
```typescript
useEffect(() => {
  if (isOpen) {
    fetchQuotations();
  }
}, [isOpen]);

const fetchQuotations = async () => {
  try {
    setLoadingQuotations(true);
    const data = await getLeadWonQuotations();
    setQuotations(data);
  } catch (error) {
    console.error('Error fetching quotations:', error);
  } finally {
    setLoadingQuotations(false);
  }
};
```

**Auto-Fill Handler:**
```typescript
const handleQuotationChange = async (quotationId: string) => {
  if (!quotationId) return;

  try {
    setLoading(true);
    const details = await getQuotationById(quotationId);

    setFormData(prev => ({
      ...prev,
      quotationId: details.quotationId,
      quotationNumber: details.customerQuotationNumber,
      leadNumber: details.lead.leadNumber,
      businessName: details.lead.businessName,
      customerBranch: details.customerBranch.name,
      contactPerson: details.contactPerson.name,
      bomNumber: details.bomNumber,
      totalCost: details.grandTotalGst,
      projectName: details.lead.projectName,
    }));
  } catch (error) {
    console.error('Error fetching quotation details:', error);
    alert('Error loading quotation details. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**Input Change Handler Update:**
```typescript
const handleInputChange = (e: React.ChangeEvent<...>) => {
  const { name, value, type } = e.target;

  if (name === 'quotationId') {
    handleQuotationChange(value);  // Triggers auto-fill
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  }
};
```

---

### 3. UI Field Reordering

**Before:**
```
1. Sales Order Type
2. Lead Number
3. Quotation
```

**After:**
```
1. Quotation  ← First field (user selects this)
2. Sales Order Type
3. Lead Number  ← Auto-filled (read-only)
```

**Quotation Dropdown:**
```tsx
<select
  name="quotationId"
  value={formData.quotationId}
  onChange={handleInputChange}
  required
  disabled={loadingQuotations}
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
>
  <option value="">
    {loadingQuotations ? 'Loading quotations...' : 'Select Quotation'}
  </option>
  {quotations.map(quotation => (
    <option key={quotation.quotation_id} value={quotation.quotation_id}>
      {quotation.customer_quotation_number}
    </option>
  ))}
</select>
```

**Shows only `customer_quotation_number` in dropdown** (e.g., "QUOTE-0015")

---

### 4. Auto-Filled Fields (Made Read-Only)

The following fields are now auto-populated and made read-only:

1. **Lead Number** - From `details.lead.leadNumber`
2. **Business Name** - From `details.lead.businessName`
3. **Customer Branch** - From `details.customerBranch.name`
4. **Contact Person** - From `details.contactPerson.name`
5. **BOM Number** - From `details.bomNumber`
6. **Total Cost** - From `details.grandTotalGst`
7. **Project Name** - From `details.lead.projectName`

All these fields display with:
```tsx
readOnly
className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
```

---

## Data Flow

### 1. Modal Opens
```
User clicks "Create Sales Order"
    ↓
Modal opens (isOpen = true)
    ↓
useEffect triggers
    ↓
fetchQuotations() called
    ↓
API: GET /sales-order/lead_won_quotations
    ↓
Quotation dropdown populated with customer_quotation_number
```

### 2. User Selects Quotation
```
User selects quotation from dropdown
    ↓
handleInputChange triggered
    ↓
Detects name === 'quotationId'
    ↓
handleQuotationChange(quotationId) called
    ↓
API: GET /sales-order/{quotationId}/quotation
    ↓
Response received with full details
    ↓
setFormData updates with auto-filled values
    ↓
UI shows populated fields (read-only)
```

---

## API Request/Response Examples

### Request 1: Get Lead Won Quotations
```http
GET /sales-order/lead_won_quotations
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "quotation_id": "da5ec2ac-83dc-4da1-ae0a-a80a968995e4",
      "customer_quotation_number": "QUOTE-0015",
      "business_name": "FrostLine HVAC Solutions Pvt. Ltd",
      "lead_number": "LEAD-0004",
      "project_name": "Frost Line Project",
      ...
    }
  ]
}
```

### Request 2: Get Quotation Details
```http
GET /sales-order/da5ec2ac-83dc-4da1-ae0a-a80a968995e4/quotation
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quotationId": "da5ec2ac-83dc-4da1-ae0a-a80a968995e4",
    "customerQuotationNumber": "QUOTE-0015",
    "grandTotalGst": "66268.26999999999",
    "lead": {
      "leadNumber": "LEAD-0004",
      "businessName": "FrostLine HVAC Solutions Pvt. Ltd",
      "projectName": "Frost Line Project"
    },
    "bomNumber": "BOM-0001",
    "customerBranch": {
      "name": "FrostLine HVAC – Coimbatore Branch"
    },
    "contactPerson": {
      "name": "Rajesh Kumar"
    }
  }
}
```

---

## UI Behavior

### Loading States

1. **On Modal Open:**
   - Quotation dropdown shows "Loading quotations..." while fetching
   - Dropdown is disabled during loading

2. **On Quotation Selection:**
   - Loading indicator shown (via `setLoading(true)`)
   - Form fields populate once data is fetched
   - User can see the transition from empty → filled

### Field States

| Field | Before Selection | After Selection | Editable |
|-------|-----------------|-----------------|----------|
| Quotation | Empty dropdown | Selected value | Yes |
| SO Type | "Sales Order" (default) | Unchanged | Yes |
| Lead Number | Empty placeholder | Auto-filled | No |
| Business Name | Hidden | Auto-filled | No |
| Customer Branch | Hidden | Auto-filled | No |
| Contact Person | Hidden | Auto-filled | No |
| BOM Number | Hidden | Auto-filled | No |
| Total Cost | Hidden | Auto-filled | Yes |
| Project Name | Empty | Auto-filled | Yes |

---

## Error Handling

1. **Quotation List Fetch Fails:**
   - Error logged to console
   - Dropdown remains empty with "Select Quotation" option
   - User can try refreshing the modal

2. **Quotation Details Fetch Fails:**
   - Error logged to console
   - Alert shown: "Error loading quotation details. Please try again."
   - Form fields remain unchanged
   - User can try selecting a different quotation

---

## Benefits

### User Experience
✅ Faster data entry - no manual typing of lead/customer details
✅ Reduced errors - data comes directly from approved quotations
✅ Clear visual feedback - read-only fields are visually distinct (gray background)
✅ Smart field ordering - user starts with quotation selection

### Data Integrity
✅ Ensures sales orders are linked to approved quotations
✅ Prevents typos in customer/lead information
✅ Maintains consistency between quotations and sales orders

### Developer Experience
✅ Clean separation of concerns (API layer, UI logic, state management)
✅ Type-safe with TypeScript interfaces
✅ Reusable API functions
✅ Easy to test and maintain

---

## Testing Checklist

### Manual Testing

1. **Modal Opening**
   - [ ] Modal opens successfully
   - [ ] "Loading quotations..." shows while fetching
   - [ ] Quotation dropdown populates after load

2. **Quotation Selection**
   - [ ] Selecting a quotation triggers API call
   - [ ] All fields auto-populate correctly
   - [ ] Read-only fields have gray background
   - [ ] Lead Number shows correct value
   - [ ] Business Name appears
   - [ ] Customer Branch appears
   - [ ] Contact Person appears
   - [ ] BOM Number appears
   - [ ] Total Cost shows grand total with GST
   - [ ] Project Name appears

3. **Field Ordering**
   - [ ] Quotation is first field (left side)
   - [ ] Sales Order Type is second
   - [ ] Lead Number is third

4. **Error Scenarios**
   - [ ] API error shows alert message
   - [ ] User can retry by selecting another quotation
   - [ ] Form doesn't break on error

---

## Build Status
✅ **Build Successful** - No compilation errors
- All TypeScript interfaces properly defined
- API functions correctly implemented
- Component state management working
- No ESLint warnings

---

## Files Modified

1. ✅ `src/utils/salesOrderApi.ts`
   - Added `LeadWonQuotation` interface
   - Added `QuotationDetails` interface
   - Added `getLeadWonQuotations()` function
   - Added `getQuotationById()` function

2. ✅ `src/pages/SalesOrders/components/CreateSalesOrderModal.tsx`
   - Added quotations state management
   - Added useEffect to fetch quotations on modal open
   - Added `handleQuotationChange()` for auto-fill
   - Updated `handleInputChange()` to trigger auto-fill
   - Reordered UI fields (Quotation → SO Type → Lead Number)
   - Made auto-filled fields read-only
   - Updated dropdown to show only `customer_quotation_number`

---

## Next Steps (Optional Enhancements)

1. **Add Loading Spinner** - Visual spinner during quotation details fetch
2. **Cache Quotations** - Store in state to avoid re-fetching on modal close/open
3. **Add Refresh Button** - Allow manual refresh of quotation list
4. **Show More Info** - Display business name in tooltip on hover over quotation number
5. **Validation** - Ensure quotation is valid/not expired before allowing SO creation

---

## Completed Date
All changes completed and build verified successfully.
