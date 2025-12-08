# Multi-Worktype Lead Creation - Quick Guide

## What's New?

You can now create multiple leads (one per worktype) in a single registration flow in **CREATE mode**.

---

## How to Use

### Option 1: Complete Registration (New - Multi-Worktype)

**Step 1: Fill Basic Details**
1. Fill all mandatory fields (marked with *)
2. In "Work Type" field, select **multiple worktypes** (Hold Ctrl/Cmd to select multiple)
   - Example: Select AMC, CHILLER, and VRF
3. Click **"Complete Registration"** button (purple button)

**What Happens:**
- System validates all fields
- Creates 3 separate leads (one for AMC, one for CHILLER, one for VRF)
- Each lead shares the same basic details but has unique worktype
- Modal closes and shows success summary

**When to Use:**
- You need to create multiple leads for the same customer/project with different worktypes
- You want to register everything at once

---

### Option 2: Step-by-Step Registration (Original)

**Step 1: Fill Basic Details**
1. Fill all mandatory fields
2. Select **one or multiple worktypes**
3. Click **"Next"** button (blue button)
   - Creates lead for first worktype
   - Moves to Step 2

**Step 2: Upload Documents**
- **Single worktype selected:** One upload section
- **Multiple worktypes selected:** Separate upload section per worktype
- Click "Next"

**Step 3: Add Comments**
- **Single worktype selected:** One comment box
- **Multiple worktypes selected:** Separate comment box per worktype
- Click "Complete"

**When to Use:**
- You want to review/upload documents per worktype
- You want to add specific comments per worktype
- You prefer step-by-step approach

---

## Key Differences

### CREATE Mode - Multi-Worktype

| Feature | Behavior |
|---------|----------|
| Work Type | Multi-select dropdown |
| Buttons | "Complete Registration" + "Next" |
| Documents | Per-worktype sections |
| Comments | Per-worktype textareas |
| Result | Multiple leads created |

### EDIT Mode - Unchanged

| Feature | Behavior |
|---------|----------|
| Work Type | Single-select dropdown |
| Buttons | "Next" only |
| Documents | Single upload section |
| Comments | Single textarea |
| Result | Single lead updated |

---

## Validation

**"Complete Registration" will NOT execute if:**
- ❌ Any mandatory field is empty
- ❌ No worktype is selected
- ❌ Phone number format is invalid
- ❌ Project value is invalid
- ❌ Approximate response time is invalid

**Alert shown:** "Please fill all mandatory fields in Step 1 before continuing."

---

## Error Handling

If one worktype fails, others continue:

```
Example:
Selected: AMC, CHILLER, VRF

Results:
✅ AMC: Lead created successfully
✅ CHILLER: Lead created successfully
❌ VRF: Network error

Alert shows:
"Registration Complete!
Successful: 2
Failed: 1

Failed worktypes:
- VRF: Network error"
```

---

## Examples

### Example 1: Quick Multi-Lead Creation

**Scenario:** Customer needs AMC and SERVICE leads

**Steps:**
1. Open "Add Lead" modal
2. Fill customer, project details
3. Hold Ctrl/Cmd and select "AMC" and "SERVICE"
4. Click "Complete Registration"
5. Done! 2 leads created instantly

---

### Example 2: Per-Worktype Documents

**Scenario:** Different documents for each worktype

**Steps:**
1. Open "Add Lead" modal
2. Fill customer, project details
3. Select "AMC", "CHILLER", "VRF"
4. Click "Next" (not "Complete Registration")
5. **Step 2:** Upload:
   - AMC: service_contract.pdf
   - CHILLER: specifications.pdf, drawings.dwg
   - VRF: quote_request.pdf
6. Click "Next"
7. **Step 3:** Add comments per worktype
8. Click "Complete"

---

## Tips

1. **Use "Complete Registration" when:**
   - Creating multiple simple leads
   - No documents/comments needed
   - Want fastest workflow

2. **Use "Next" step-by-step when:**
   - Uploading different documents per worktype
   - Adding specific comments per worktype
   - Want to review each step

3. **Multi-select tips:**
   - Windows/Linux: Hold Ctrl + Click
   - Mac: Hold Cmd + Click
   - Select All: Ctrl+A / Cmd+A (in dropdown)

---

## FAQ

**Q: Does EDIT mode change?**
A: No. EDIT mode remains exactly the same - single worktype, single lead.

**Q: Can I still create single-worktype leads?**
A: Yes. Select one worktype and use either button.

**Q: What if I select 5 worktypes but only want documents for 2?**
A: No problem. Leave document sections empty for worktypes that don't need files.

**Q: Can I edit multiple leads after creation?**
A: No. Each lead must be edited separately in EDIT mode.

**Q: What happens to lead stage?**
A: All leads start as "Information Stage". If you upload documents in Step 2, they auto-update to "Enquiry".

---

## Visual Indicator

Look for this label in CREATE mode:
```
Work Type (Multi-select for CREATE)
[Dropdown with multiple selection]
Hold Ctrl/Cmd to select multiple work types
```

In EDIT mode, no such label appears.

---

## Support

If you encounter issues:
1. Check all mandatory fields are filled
2. Verify worktypes are selected
3. Check console for detailed error messages
4. Review the detailed implementation doc: `MULTI_WORKTYPE_LEAD_IMPLEMENTATION.md`
