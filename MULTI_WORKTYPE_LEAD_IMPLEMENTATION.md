# Multi-Worktype Lead Creation - Implementation Summary

## Overview
Refactored `AddLeadModal` to support multi-worktype lead creation in CREATE mode while keeping EDIT mode completely unchanged.

---

## Key Changes

### 1. **Unified Multi-Worktype State (CREATE Mode Only)**

Added new state structure to track multiple worktypes:

```typescript
const [multiWorktypeState, setMultiWorktypeState] = useState<{
  step1: any;
  step2: { documents: { [worktype: string]: File[] } };
  step3: { comments: { [worktype: string]: string } };
  leads: {
    [worktype: string]: {
      leadId: string | null;
      status: "pending" | "success" | "failed";
      error?: string;
    };
  };
}>({
  step1: null,
  step2: { documents: {} },
  step3: { comments: {} },
  leads: {},
});
```

**Purpose:**
- Tracks documents per worktype
- Tracks comments per worktype
- Tracks lead creation status per worktype
- Enables per-worktype error handling

---

### 2. **Multi-Select Work Type Field (CREATE Mode Only)**

#### EDIT Mode (Unchanged):
- Single-select dropdown
- Single worktype value

#### CREATE Mode (New):
- Multi-select dropdown (Hold Ctrl/Cmd to select multiple)
- Array of worktype values
- Visual indicator: "(Multi-select for CREATE)"

**Code Location:** Lines 1805-1843

```typescript
{isEditMode ? (
  <select name="workType" value={formData.workType} onChange={handleInputChange}>
    // Single select for EDIT mode
  </select>
) : (
  <select name="workType" multiple value={Array.isArray(formData.workType) ? formData.workType : []} onChange={handleInputChange}>
    // Multi-select for CREATE mode
  </select>
)}
```

---

### 3. **Per-Worktype Document Upload (CREATE Mode Only)**

#### EDIT Mode (Unchanged):
- Single file upload section
- All files stored in `uploadedFiles` state

#### CREATE Mode (New):
- Separate upload section for each selected worktype
- Files stored per worktype in `multiWorktypeState.step2.documents[worktype]`
- Visual grouping by worktype

**Code Location:** Lines 2137-2284

**Example UI:**
```
Documents for: AMC
[Upload files button]
- file1.pdf [X]
- file2.jpg [X]

Documents for: CHILLER
[Upload files button]
- drawing.dwg [X]
```

---

### 4. **Per-Worktype Follow-up Comments (CREATE Mode Only)**

#### EDIT Mode (Unchanged):
- Single comment input
- Comment stored in `newComment` state

#### CREATE Mode (New):
- Separate comment textarea for each worktype
- Comments stored per worktype in `multiWorktypeState.step3.comments[worktype]`
- Visual grouping by worktype

**Code Location:** Lines 2287-2403

**Example UI:**
```
Follow-up for: AMC
[Textarea for AMC comments]

Follow-up for: CHILLER
[Textarea for CHILLER comments]
```

---

### 5. **"Complete Registration" Button (CREATE Mode Only)**

**Location:** Step 1 footer (only visible when multi-worktype selected)

**Functionality:**
1. **Validates Step 1 mandatory fields**
   - Shows alert if validation fails: "Please fill all mandatory fields in Step 1 before continuing."
   - No API calls made if validation fails

2. **Validates worktype selection**
   - Shows alert if no worktype selected: "Please select at least one work type."

3. **Sequential lead creation per worktype**
   ```
   For each selected worktype:
     → POST /lead with worktype
     → Receive leadId
     → Store in multiWorktypeState.leads[worktype]
   ```

4. **Document upload per worktype**
   ```
   For each worktype with documents:
     → POST /lead-file/{leadId}/files
     → Update lead_stage to "Enquiry"
   ```

5. **Comment upload per worktype**
   ```
   For each worktype with comment:
     → POST /lead-follow-up with leadId
   ```

6. **Error handling per worktype**
   - Errors are isolated per worktype
   - Other worktypes continue processing
   - Final summary shows success/failure counts
   - Detailed error messages for failed worktypes

7. **Results summary alert**
   ```
   Registration Complete!

   Successful: 2
   Failed: 1

   Failed worktypes:
   - VRF: Network error
   ```

**Code Location:** Lines 1223-1415

---

### 6. **Enhanced Input Handling**

Added multi-select handler for workType field in CREATE mode:

```typescript
// Handle multi-select workType in CREATE mode
if (name === "workType" && !isEditMode) {
  const selectElement = e.target as HTMLSelectElement;
  const selectedOptions = Array.from(selectElement.selectedOptions).map(
    (option) => option.value
  );
  setFormData((prev: any) => ({
    ...prev,
    workType: selectedOptions,
  }));
  return;
}
```

**Code Location:** Lines 818-829

---

### 7. **Enhanced File Upload Handler**

Modified to support per-worktype file storage in CREATE mode:

```typescript
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, worktype?: string) => {
  // ... validation logic ...

  if (!isEditMode && worktype) {
    // Multi-worktype mode: store files per worktype
    setMultiWorktypeState((prev) => ({
      ...prev,
      step2: {
        documents: {
          ...prev.step2.documents,
          [worktype]: [...(prev.step2.documents[worktype] || []), ...validFiles],
        },
      },
    }));
  } else {
    // Edit mode: use existing state
    setUploadedFiles((prev) => [...prev, ...validFiles]);
  }
}
```

**Code Location:** Lines 931-972

---

## Mode Comparison

### CREATE Mode (Multi-Worktype)

| Feature | Behavior |
|---------|----------|
| Work Type Field | Multi-select dropdown |
| Step 1 Actions | "Complete Registration" button + "Next" button |
| Step 2 | Per-worktype document upload sections |
| Step 3 | Per-worktype comment textareas |
| Lead Creation | One lead per selected worktype |
| State Management | `multiWorktypeState` for per-worktype data |

### EDIT Mode (Single-Worktype) - UNCHANGED

| Feature | Behavior |
|---------|----------|
| Work Type Field | Single-select dropdown |
| Step 1 Actions | "Next" button only |
| Step 2 | Single document upload section |
| Step 3 | Single comment textarea |
| Lead Update | Update existing lead |
| State Management | Original `formData`, `uploadedFiles`, `newComment` |

---

## Validation Rules

### Step 1 Validation (enforced by "Complete Registration"):
- ✅ Customer (businessName) - required
- ✅ Contact No - required, format validation
- ✅ Lead Generated Date - required
- ✅ Project Name - required, 2-200 chars
- ✅ Project Value - required, positive number
- ✅ Lead Type - required
- ✅ Lead Criticality - required
- ✅ Lead Source - required
- ✅ Lead Stage - required (auto-filled)
- ✅ Approximate Response Time - required, 1-365 days
- ✅ At least one Work Type - required

### No Validation Failures = No API Calls

---

## API Call Flow

### CREATE Mode - "Complete Registration" Flow:

```
1. Validate Step 1 fields
   ↓
2. FOR EACH selected worktype:
   ├─ POST /lead (with worktype)
   │  ↓
   ├─ Store leadId in state
   │  ↓
   ├─ IF documents exist for worktype:
   │  ├─ POST /lead-file/{leadId}/files
   │  └─ PUT /lead/{leadId} (update stage to "Enquiry")
   │  ↓
   ├─ IF comment exists for worktype:
   │  └─ POST /lead-follow-up
   │  ↓
   └─ IF associates exist:
      └─ POST /lead-associate/bulk
   ↓
3. PUT /customer/{customerId} (set is_lead_generated=true)
   ↓
4. POST notification
   ↓
5. Show results summary
   ↓
6. Close modal and refresh
```

### EDIT Mode - Original Flow (UNCHANGED):

```
1. Step 1: PUT /lead/{id} → Step 2
2. Step 2: POST /lead-file/{id}/files → Step 3
3. Step 3: POST /lead-follow-up → Complete
```

---

## Error Handling

### Multi-Worktype Error Isolation:
- Each worktype's lead creation is wrapped in try-catch
- Errors are stored per worktype: `multiWorktypeState.leads[worktype].error`
- Failed worktypes don't block successful ones
- Final alert shows detailed per-worktype status

**Example Error Scenario:**
```
User selects: AMC, CHILLER, VRF
- AMC: Success ✅
- CHILLER: Success ✅
- VRF: Failed ❌ (network error)

Alert shows:
"Registration Complete!
Successful: 2
Failed: 1

Failed worktypes:
- VRF: Network error"
```

---

## UI/UX Enhancements

1. **Visual Indicators:**
   - "(Multi-select for CREATE)" label on Work Type field
   - "Hold Ctrl/Cmd to select multiple work types" helper text
   - Grouped sections per worktype in Steps 2 & 3

2. **Button Visibility:**
   - "Complete Registration" button only shows in CREATE mode when worktypes are selected
   - "Next" button still available for step-by-step flow

3. **Loading States:**
   - Button text changes to "Processing..." during multi-lead creation
   - Prevents duplicate submissions

4. **File Management:**
   - Per-worktype file lists with remove buttons
   - Clear visual separation between worktypes

---

## Backward Compatibility

✅ **EDIT Mode:** Zero changes to existing logic
- Single worktype selection
- Single lead update
- Original state management
- Original API flow
- Original UI layout

✅ **CREATE Mode - Single Worktype:** Still works with original flow
- User can use "Next" button for step-by-step
- "Complete Registration" only shows when multiple worktypes selected

---

## Testing Checklist

### CREATE Mode - Multi-Worktype:
- [ ] Select multiple worktypes (e.g., AMC, CHILLER)
- [ ] Fill all mandatory Step 1 fields
- [ ] Click "Complete Registration"
- [ ] Verify leads created for each worktype
- [ ] Upload different documents per worktype
- [ ] Add different comments per worktype
- [ ] Verify documents uploaded to correct lead
- [ ] Verify comments uploaded to correct lead
- [ ] Test validation failure (empty fields)
- [ ] Test error handling (network failure for one worktype)
- [ ] Verify results summary shows correct counts

### EDIT Mode (Regression):
- [ ] Open existing lead
- [ ] Verify single-select worktype dropdown
- [ ] Update lead details
- [ ] Upload files (single section)
- [ ] Add comment (single textarea)
- [ ] Verify update successful
- [ ] Verify no UI/behavior changes

### CREATE Mode - Single Worktype:
- [ ] Select single worktype
- [ ] Use step-by-step "Next" flow
- [ ] Verify original behavior preserved

---

## Files Modified

1. **AddLeadModal.tsx** - Main modal component
   - Added multi-worktype state
   - Modified UI for multi-worktype support
   - Added `handleCompleteRegistration` function
   - Enhanced input handlers for multi-select
   - Conditional rendering based on `isEditMode`

---

## Technical Debt / Future Enhancements

1. **Progress Indicator:** Consider adding a progress bar during multi-lead creation
2. **Parallel Processing:** Currently sequential - could optimize with parallel API calls
3. **Retry Logic:** Add retry for failed worktypes
4. **Draft Saving:** Allow saving partial progress
5. **Bulk Edit:** Consider adding multi-lead edit in future

---

## Summary

This implementation successfully adds multi-worktype lead creation capability to CREATE mode while maintaining 100% backward compatibility with EDIT mode. The solution:

- ✅ Validates Step 1 before any API calls
- ✅ Creates separate leads per worktype
- ✅ Handles documents per worktype
- ✅ Handles comments per worktype
- ✅ Provides per-worktype error handling
- ✅ Shows clear results summary
- ✅ Zero impact on EDIT mode
- ✅ Maintains existing code structure
- ✅ No breaking changes to APIs
- ✅ Build passes successfully

---

## Developer Notes

**IMPORTANT:**
- `isEditMode` flag determines all conditional logic
- Multi-worktype state is ONLY used in CREATE mode
- EDIT mode uses original state variables
- Validation is enforced before "Complete Registration"
- Errors are isolated per worktype for resilience
