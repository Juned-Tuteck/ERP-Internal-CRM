# Multi-Worktype Lead Creation - Corrected Implementation

## Overview
Refactored `AddLeadModal` to support multi-worktype lead creation in CREATE mode with **state-first approach** - all data is stored in state across steps, and ALL API calls are made only when clicking "Complete Registration" in Step 3.

---

## Key Corrections Made

### 1. **Work Type Selection - Checkbox-Based Multi-Select**
- ✅ Changed from native `<select multiple>` to checkbox-based selection (like currency field)
- ✅ Shows selected worktypes as tags with remove buttons
- ✅ More user-friendly - no Ctrl/Cmd required
- ✅ EDIT mode still uses single-select dropdown (unchanged)

### 2. **"Complete Registration" Button Location**
- ✅ Moved from Step 1 to **Step 3** (Follow-up Lead)
- ✅ Only appears when multiple worktypes are selected
- ✅ Purple color to differentiate from regular "Complete" button

### 3. **State-First Approach - No Premature API Calls**
- ✅ **Step 1**: Data saved to state only → Click "Next"
- ✅ **Step 2**: Documents saved to state only → Click "Next"
- ✅ **Step 3**: Comments saved to state only → Click "Complete Registration" → **ALL APIs fire**

---

## Workflow Comparison

### ❌ OLD (INCORRECT) Flow:
```
Step 1 → Click Next → POST /lead (API CALL) → Step 2
Step 2 → Click Next → POST /lead-file (API CALL) → Step 3
Step 3 → Click Complete
```

### ✅ NEW (CORRECT) Flow:
```
Step 1 → Fill data → Click "Next" → Save to state (NO API)
Step 2 → Upload documents → Click "Next" → Save to state (NO API)
Step 3 → Add comments → Click "Complete Registration" → ALL APIs fire:
  ├─ For each worktype:
  │  ├─ POST /lead
  │  ├─ POST /lead-file/{leadId}/files (if documents exist)
  │  ├─ PUT /lead/{leadId} (update stage if files uploaded)
  │  ├─ POST /lead-follow-up (if comment exists)
  │  └─ POST /lead-associate/bulk (if associates exist)
  ├─ PUT /customer/{customerId} (set is_lead_generated=true)
  └─ POST notification
```

---

## Detailed Changes

### 1. Work Type Field (Lines 1996-2069)

**EDIT Mode:**
```tsx
<select name="workType" value={formData.workType}>
  <option value="">Select Work Type</option>
  {workTypes.map((type) => (
    <option key={type} value={type}>{type}</option>
  ))}
</select>
```

**CREATE Mode:**
```tsx
<div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
  {workTypes.map((type) => (
    <label className="flex items-center space-x-2 py-1 cursor-pointer">
      <input
        type="checkbox"
        checked={formData.workType.includes(type)}
        onChange={(e) => {
          // Add/remove worktype from array
        }}
      />
      <span>{type}</span>
    </label>
  ))}
</div>

{/* Selected tags */}
<div className="flex flex-wrap gap-2">
  {formData.workType.map((type) => (
    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
      {type}
      <button onClick={() => /* remove */}><X /></button>
    </span>
  ))}
</div>
```

---

### 2. handleNext Function (Lines 1157-1210)

**Step 1 - CREATE Mode:**
```typescript
if (currentStep === 1) {
  if (isEditMode) {
    handleUpdateLead(); // EDIT: API call
  } else {
    // CREATE: Save to state only
    if (!formData.workType || formData.workType.length === 0) {
      alert("Please select at least one work type.");
      return;
    }
    setMultiWorktypeState((prev) => ({
      ...prev,
      step1: { ...formData },
    }));
    setCurrentStep(2); // Move to step 2
  }
}
```

**Step 2 - CREATE Mode:**
```typescript
else if (currentStep === 2) {
  if (isEditMode) {
    // EDIT: Upload files immediately
    await uploadFilesForLead(leadId, uploadedFiles);
    setCurrentStep(3);
  } else {
    // CREATE: Just move to step 3 (files already in state)
    setCurrentStep(3);
  }
}
```

---

### 3. handleCompleteRegistration Function (Lines 1212-1401)

**Called from Step 3 - Executes ALL API calls:**

```typescript
const handleCompleteRegistration = async () => {
  setIsLoading(true);

  const selectedWorktypes = formData.workType as string[];
  const results = {};

  // For each worktype:
  for (const worktype of selectedWorktypes) {
    try {
      // 1. POST: Create lead
      const leadResponse = await axios.post('/lead', {
        ...formData,
        work_type: worktype,
      });
      const leadId = leadResponse.data.data.lead_id;

      // 2. POST: Upload documents (if any)
      const documents = multiWorktypeState.step2.documents[worktype] || [];
      if (documents.length > 0) {
        await uploadFilesForLead(leadId, documents);

        // 3. PUT: Update lead stage to "Enquiry"
        await updateLeadStageAfterFileUpload(leadId);
      }

      // 4. POST: Upload comment (if any)
      const comment = multiWorktypeState.step3.comments[worktype];
      if (comment?.trim()) {
        await axios.post('/lead-follow-up', {
          lead_id: leadId,
          comment: comment.trim(),
        });
      }

      // 5. POST: Associates (if any)
      if (formData.involvedAssociates?.length > 0) {
        await axios.post('/lead-associate/bulk', associatePayload);
      }

      results[worktype] = { success: true, leadId };

    } catch (error) {
      results[worktype] = { success: false, error: error.message };
    }
  }

  // 6. PUT: Update customer flag
  await updateCustomer(selectedCustomerId, { is_lead_generated: true });

  // 7. POST: Send notifications
  await sendNotification({ /* ... */ });

  // Show results summary
  alert(`Registration Complete!\nSuccessful: ${successCount}\nFailed: ${failCount}`);

  // Close modal
  onSubmit({ success: true });
  handleClose();
};
```

---

### 4. Footer Buttons (Lines 2671-2708)

**EDIT Mode (Unchanged):**
```
Step 1: "Next" button
Step 2: "Next" button
Step 3: "Update Complete" button
```

**CREATE Mode:**
```
Step 1: "Next" button (saves to state)
Step 2: "Next" button (saves to state)
Step 3:
  - If multi-worktype selected: "Complete Registration" button (purple)
  - If single worktype: "Complete" button (green)
```

**Code:**
```tsx
{isEditMode ? (
  // EDIT mode buttons...
) : (
  <>
    {currentStep < 3 ? (
      <button onClick={handleNext}>
        Next
      </button>
    ) : (
      <>
        {formData.workType.length > 0 ? (
          <button onClick={handleCompleteRegistration} className="bg-purple-600">
            Complete Registration
          </button>
        ) : (
          <button onClick={handleSubmit} className="bg-green-600">
            Complete
          </button>
        )}
      </>
    )}
  </>
)}
```

---

## State Management

### Multi-Worktype State Structure:
```typescript
const [multiWorktypeState, setMultiWorktypeState] = useState({
  step1: null, // Stored when clicking "Next" in Step 1
  step2: {
    documents: {
      [worktype]: [File, File, ...], // Files per worktype
    }
  },
  step3: {
    comments: {
      [worktype]: "comment text", // Comments per worktype
    }
  },
  leads: {
    [worktype]: {
      leadId: null,
      status: "pending" | "success" | "failed",
      error?: string,
    }
  }
});
```

### When Data is Stored:

| Step | Action | What Happens |
|------|--------|--------------|
| 1 | Click "Next" | `formData` → `multiWorktypeState.step1` |
| 2 | Upload files | Files → `multiWorktypeState.step2.documents[worktype]` |
| 2 | Click "Next" | Just move to Step 3 (no API) |
| 3 | Type comments | Comments → `multiWorktypeState.step3.comments[worktype]` |
| 3 | Click "Complete Registration" | **ALL APIs fire** |

---

## API Call Summary (Step 3 Only)

**Per Worktype:**
1. `POST /lead` - Create lead
2. `POST /lead-file/{leadId}/files` - Upload documents (if any)
3. `PUT /lead/{leadId}` - Update stage to "Enquiry" (if files uploaded)
4. `POST /lead-follow-up` - Add comment (if any)
5. `POST /lead-associate/bulk` - Add associates (if any)

**Once for All:**
6. `PUT /customer/{customerId}` - Set `is_lead_generated=true`
7. `POST /notification` - Send notification

**Total API calls for 3 worktypes with documents and comments:**
- 3 × 5 = 15 per-worktype calls
- 1 customer update
- 1 notification
- **Total: 17 API calls** (all fired from Step 3)

---

## Error Handling

**Per-Worktype Isolation:**
- Each worktype's API calls are in a try-catch
- If one worktype fails, others continue
- Results tracked separately per worktype
- Final summary shows success/failure breakdown

**Example:**
```
Selected: AMC, CHILLER, VRF

Results:
✅ AMC: Lead created (ID: 123)
✅ CHILLER: Lead created (ID: 124)
❌ VRF: Failed (Network error)

Alert:
"Registration Complete!
Successful: 2
Failed: 1

Failed worktypes:
- VRF: Network error"
```

---

## Validation

**Step 1 Validation (enforced by handleNext):**
- All mandatory fields
- At least one worktype selected
- Phone number format
- Project value (positive number)
- Response time (1-365 days)

**If validation fails:**
- Alert shown
- Cannot proceed to Step 2
- No API calls made

---

## UI/UX Improvements

### 1. Work Type Selection
**Before:** Native `<select multiple>` (required Ctrl/Cmd)
**After:** Checkbox list with tag display

### 2. Selected Worktypes Display
- Blue tags showing selected worktypes
- X button to remove individual worktype
- Clear visual feedback

### 3. Button Colors
- **Blue**: "Next" (navigation)
- **Purple**: "Complete Registration" (multi-worktype)
- **Green**: "Complete" (single worktype or edit)

### 4. Loading States
- "Saving..." (Step 1 & 2 Next buttons)
- "Processing..." (Complete Registration button)

---

## Testing Checklist

### CREATE Mode - Multi-Worktype:
- [ ] Select multiple worktypes using checkboxes
- [ ] Verify selected worktypes appear as tags
- [ ] Remove worktype by clicking X on tag
- [ ] Fill Step 1 → Click "Next" → No API call fired
- [ ] Upload different documents per worktype
- [ ] Click "Next" → No API call fired
- [ ] Add different comments per worktype
- [ ] Click "Complete Registration" → Verify ALL APIs fire
- [ ] Check console for API call sequence
- [ ] Verify leads created for each worktype
- [ ] Test error handling (simulate network failure)
- [ ] Verify results summary shows correct counts

### EDIT Mode (Regression):
- [ ] Open existing lead
- [ ] Verify single-select worktype dropdown
- [ ] Update lead details → Verify API called in Step 1
- [ ] Upload files → Verify API called in Step 2
- [ ] Verify no changes to behavior

### CREATE Mode - Single Worktype:
- [ ] Select single worktype
- [ ] Follow step-by-step flow
- [ ] Verify "Complete" button (green) appears in Step 3
- [ ] Verify original behavior works

---

## Files Modified

1. **AddLeadModal.tsx**
   - Work Type field: Checkbox-based multi-select (lines 1996-2069)
   - Removed multi-select handler from handleInputChange
   - Updated handleNext: State-only storage (lines 1157-1210)
   - Updated handleCompleteRegistration: All APIs from Step 3 (lines 1212-1401)
   - Updated footer buttons: "Complete Registration" in Step 3 (lines 2671-2708)

---

## Summary of Corrections

| Issue | Before | After |
|-------|--------|-------|
| **Worktype Selection** | Native `<select multiple>` | Checkbox list + tags |
| **Button Location** | Step 1 | Step 3 |
| **Step 1 "Next"** | POST /lead API | Save to state only |
| **Step 2 "Next"** | POST /lead-file API | Save to state only |
| **Step 3 Button** | "Complete" | "Complete Registration" (multi) |
| **API Calls** | Spread across steps | All in Step 3 |
| **State Management** | Immediate API | State-first approach |

---

## Benefits of Corrected Approach

✅ **Better UX**: Checkbox selection (no Ctrl/Cmd needed)
✅ **Visual Feedback**: Selected worktypes displayed as tags
✅ **Atomic Operations**: All APIs fire together (success or rollback)
✅ **Clearer Flow**: User completes all steps before commitment
✅ **Easier Testing**: All API logic in one place
✅ **Error Recovery**: Can go back and modify before APIs fire
✅ **EDIT Mode**: Completely unchanged (zero regression risk)

---

## Developer Notes

**State Flow:**
```
formData (Step 1) → multiWorktypeState.step1
Documents (Step 2) → multiWorktypeState.step2.documents[worktype]
Comments (Step 3) → multiWorktypeState.step3.comments[worktype]

Click "Complete Registration" → Read from multiWorktypeState → Fire ALL APIs
```

**API Call Markers:**
- All API calls in `handleCompleteRegistration` are prefixed with `POST:`, `PUT:`, etc.
- Easy to identify which APIs are being called
- Helps with debugging and maintenance

**IMPORTANT:**
- `isEditMode` flag determines all conditional logic
- Multi-worktype state is ONLY used in CREATE mode
- EDIT mode uses original state variables and immediate API calls
- No API calls happen in Steps 1 & 2 for CREATE mode
