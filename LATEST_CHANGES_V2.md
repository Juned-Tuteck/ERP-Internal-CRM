# Latest Changes - Payment Terms Section Update

## Date
Latest Update

## Changes Made

### Material Type & Payment Term Type Moved to Payment Terms Section

Previously, Material Type and Payment Term Type were:
- ❌ Material Type: Single dropdown in "Material Type Cost" section (fetched from API)
- ❌ Payment Term Type: Dropdown in Payment Terms table (fetched from API)

Now they are:
- ✅ Material Type: Column in Payment Terms table with hardcoded values
- ✅ Payment Term Type: Column in Payment Terms table with hardcoded values

---

## Detailed Changes

### 1. Removed from Material Type Cost Section
**Before:**
```
Material Type Cost
├── Material Type (dropdown - from API)  ❌ REMOVED
└── Table with GST, Amount columns
```

**After:**
```
Material Type Cost
└── Table with GST, Amount columns only
```

### 2. Added to Payment Terms Section
**Before:**
```
Payment Terms Table
├── Description
├── Term Type (from API)
├── Percentage
├── Amount
└── Action
```

**After:**
```
Payment Terms Table
├── Description
├── Material Type (hardcoded dropdown) ✅ NEW
├── Term Type (hardcoded dropdown) ✅ UPDATED
├── Percentage
├── Amount
└── Action
```

---

## Hardcoded Values

### Material Type Options
1. High Side Supply
2. Low Side Supply

### Payment Term Type Options
1. After Commissioning
2. after DP
3. after handing over
4. after installation
5. before dispatch against PI

---

## Code Changes

### File: `src/pages/SalesOrders/components/CreateSalesOrderModal.tsx`

#### 1. Removed API Imports
```typescript
// BEFORE
import { getMaterialTypes, getPaymentTermTypes, createSalesOrder, MaterialType, PaymentTermType } from '../../../utils/salesOrderApi';

// AFTER
import { createSalesOrder } from '../../../utils/salesOrderApi';
```

#### 2. Removed useState for API Data
```typescript
// BEFORE
const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
const [paymentTermTypes, setPaymentTermTypes] = useState<PaymentTermType[]>([]);

// AFTER
// Removed - using hardcoded arrays instead
```

#### 3. Removed useEffect for API Fetching
```typescript
// BEFORE
useEffect(() => {
  const fetchDropdownData = async () => {
    const [materialTypesData, paymentTermTypesData] = await Promise.all([
      getMaterialTypes(),
      getPaymentTermTypes()
    ]);
    setMaterialTypes(materialTypesData);
    setPaymentTermTypes(paymentTermTypesData);
  };
  fetchDropdownData();
}, [isOpen]);

// AFTER
// Removed completely
```

#### 4. Added Hardcoded Arrays
```typescript
const materialTypes = ['High Side Supply', 'Low Side Supply'];
const paymentTermTypes = ['After Commissioning', 'after DP', 'after handing over', 'after installation', 'before dispatch against PI'];
```

#### 5. Updated PaymentTerm Interface
```typescript
// BEFORE
interface PaymentTerm {
  id: string;
  description: string;
  termType: string;
  percentage: number;
  amount: number;
}

// AFTER
interface PaymentTerm {
  id: string;
  description: string;
  termType: string;
  materialType: string;  // ✅ NEW FIELD
  percentage: number;
  amount: number;
}
```

#### 6. Updated addPaymentTerm Function
```typescript
// BEFORE
const newTerm: PaymentTerm = {
  id: Date.now().toString(),
  description: '',
  termType: '',
  percentage: 0,
  amount: 0
};

// AFTER
const newTerm: PaymentTerm = {
  id: Date.now().toString(),
  description: '',
  termType: '',
  materialType: '',  // ✅ NEW FIELD
  percentage: 0,
  amount: 0
};
```

#### 7. Removed Material Type Section
```tsx
// BEFORE
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
  <div>
    <label>Material Type *</label>
    <select name="materialTypeId">
      {materialTypes.map(type => (
        <option key={type.id} value={type.id}>{type.name}</option>
      ))}
    </select>
  </div>
</div>

// AFTER
// Removed completely
```

#### 8. Updated Payment Terms Table Header
```tsx
// BEFORE
<thead>
  <tr>
    <th>Description</th>
    <th>Term Type</th>
    <th>Percentage</th>
    <th>Amount</th>
    <th>Action</th>
  </tr>
</thead>

// AFTER
<thead>
  <tr>
    <th>Description</th>
    <th>Material Type</th>  {/* ✅ NEW COLUMN */}
    <th>Term Type</th>
    <th>Percentage</th>
    <th>Amount</th>
    <th>Action</th>
  </tr>
</thead>
```

#### 9. Added Material Type Column in Table Body
```tsx
// NEW COLUMN ADDED
<td className="whitespace-nowrap px-3 py-4 text-sm">
  <select
    value={term.materialType}
    onChange={(e) => updatePaymentTerm(term.id, 'materialType', e.target.value)}
    className="w-full px-2 py-1 border border-gray-300 rounded-md"
  >
    <option value="">Select Material Type</option>
    {materialTypes.map(type => (
      <option key={type} value={type}>{type}</option>
    ))}
  </select>
</td>
```

#### 10. Updated Term Type Dropdown
```tsx
// BEFORE
<select value={term.termType}>
  <option value="">Select Term Type</option>
  {paymentTermTypes.map(type => (
    <option key={type.id} value={type.id}>{type.name}</option>
  ))}
</select>

// AFTER
<select value={term.termType}>
  <option value="">Select Term Type</option>
  {paymentTermTypes.map(type => (
    <option key={type} value={type}>{type}</option>
  ))}
</select>
```

#### 11. Updated Footer Colspan
```tsx
// BEFORE
<td colSpan={2}>Total:</td>

// AFTER
<td colSpan={3}>Total:</td>  {/* Updated for new column */}
```

#### 12. Updated Form Submit Data Mapping
```tsx
// BEFORE
materialCosts: formData.materialCosts.map(cost => ({
  material_type_id: formData.materialTypeId,  // Used single dropdown value
  gst_percentage: cost.gstPercentage,
  amount_basic: cost.amountBasic,
  amount_with_gst: cost.amountWithGst,
})),
paymentTerms: formData.paymentTerms.map(term => ({
  payment_term_type_id: term.termType,
  description: term.description,
  percentage: term.percentage,
  amount: term.amount,
}))

// AFTER
materialCosts: formData.materialCosts.map(cost => ({
  gst_percentage: cost.gstPercentage,
  amount_basic: cost.amountBasic,
  amount_with_gst: cost.amountWithGst,
})),
paymentTerms: formData.paymentTerms.map(term => ({
  payment_term_type: term.termType,  // Changed field name
  material_type: term.materialType,   // ✅ NEW FIELD
  description: term.description,
  percentage: term.percentage,
  amount: term.amount,
}))
```

#### 13. Removed materialTypeId from Form State
```typescript
// BEFORE
const [formData, setFormData] = useState({
  // ... other fields
  materialTypeId: '',
  materialCosts: [...]
});

// AFTER
const [formData, setFormData] = useState({
  // ... other fields
  materialCosts: [...]  // materialTypeId removed
});
```

---

## UI Layout Changes

### Before
```
┌─ Material Type Cost ──────────────────┐
│ Material Type: [Dropdown from API]    │
│ ┌─────────────────────────────────┐  │
│ │ Material Type │ GST % │ Amount  │  │
│ │ High Side     │  18   │ 10000   │  │
│ │ Low Side      │  18   │ 5000    │  │
│ └─────────────────────────────────┘  │
└───────────────────────────────────────┘

┌─ Payment Terms ───────────────────────┐
│ [+ Add Payment Term]                  │
│ ┌────────────────────────────────┐   │
│ │ Desc │ Term Type │ % │ Amount │   │
│ │ ...  │ [from API]│...│ ...    │   │
│ └────────────────────────────────┘   │
└───────────────────────────────────────┘
```

### After
```
┌─ Material Type Cost ──────────────────┐
│ ┌─────────────────────────────────┐  │
│ │ Material Type │ GST % │ Amount  │  │
│ │ High Side     │  18   │ 10000   │  │
│ │ Low Side      │  18   │ 5000    │  │
│ └─────────────────────────────────┘  │
└───────────────────────────────────────┘

┌─ Payment Terms ──────────────────────────────┐
│ [+ Add Payment Term]                         │
│ ┌──────────────────────────────────────┐    │
│ │ Desc │ Material │ Term Type │ % │ ₹ │    │
│ │ ...  │ [HC]     │ [HC]      │...│...│    │
│ └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘

[HC] = Hardcoded dropdown values
```

---

## Impact Summary

### What Changed
✅ Material Type moved from separate section to Payment Terms table
✅ Payment Term Type values now hardcoded (was from API)
✅ Material Type values now hardcoded (was from API)
✅ Each payment term can have its own material type
✅ Removed API dependencies for dropdown data
✅ Simplified component code (removed useEffect, API state)

### What Stayed the Same
✅ Material Type Cost table structure unchanged
✅ Payment Terms calculation logic unchanged
✅ Other form fields unchanged
✅ API integration for create/read/update/delete unchanged

### Benefits
✅ Faster load time (no API calls for dropdowns)
✅ More flexible (each payment term has its own material type)
✅ Simpler code (no async loading, no loading states)
✅ No API dependency for static dropdown data

---

## Build Status
✅ **Build Successful** - No compilation errors
- All TypeScript types updated correctly
- Interface changes propagated properly
- No ESLint warnings

---

## Testing Notes

### Test Material Type in Payment Terms
1. Click "Add Payment Term"
2. Material Type dropdown should show:
   - High Side Supply
   - Low Side Supply
3. Select a material type for each payment term

### Test Payment Term Type
1. In Payment Terms row
2. Term Type dropdown should show:
   - After Commissioning
   - after DP
   - after handing over
   - after installation
   - before dispatch against PI

### Verify Material Type Cost Section
1. Should NOT have Material Type dropdown anymore
2. Should only show the table with:
   - Material Type (text, not editable)
   - GST %
   - Amount (Basic)
   - Amount with GST

---

## Backend API Impact

### API Endpoints No Longer Used
- ❌ `/sales-order-material-type-details` (GET) - Not called anymore
- ❌ `/sales-order-payment-terms` (GET) - Not called anymore

### API Payload Changes for Create Sales Order
```json
{
  "paymentTerms": [
    {
      "payment_term_type": "After Commissioning",  // Changed from payment_term_type_id
      "material_type": "High Side Supply",         // NEW FIELD
      "description": "Initial Payment",
      "percentage": 30,
      "amount": 30000
    }
  ],
  "materialCosts": [
    {
      // material_type_id removed from here
      "gst_percentage": 18,
      "amount_basic": 10000,
      "amount_with_gst": 11800
    }
  ]
}
```

**Note:** Backend may need to be updated to accept these new field names if currently expecting IDs.

---

## Migration Notes

### If Backend Needs IDs
If the backend API still expects `payment_term_type_id` and `material_type_id`, you have two options:

**Option 1:** Update backend to accept string values
**Option 2:** Add a mapping function in frontend:

```typescript
const materialTypeMap = {
  'High Side Supply': 1,
  'Low Side Supply': 2
};

const paymentTermTypeMap = {
  'After Commissioning': 1,
  'after DP': 2,
  // ... etc
};

// Then in submit:
materialCosts: formData.materialCosts.map(cost => ({
  material_type_id: materialTypeMap[cost.type],
  // ...
}))
```

---

## Completed Date
All changes completed and build verified successfully.
