export const getVendorById = async (vendorId: string): Promise<any> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/vendor/${vendorId}`,
    {
      headers: { "Cache-Control": "no-cache" },
    }
  );

  const data = response.data?.data || {};
  const v = data.vendor || {};

  return {
    id: v.vendor_id,
    name: v.business_name,
    category: v.vendor_category || v.vendor_type || "",
    type: v.vendor_type || "",
    location: [v.city, v.state].filter(Boolean).join(", "),
    contactPerson: data.contacts?.[0]?.name || "",
    phone: v.contact_no,
    email: v.email,
    joinDate: v.created_at,
    status:
      v.approval_status === "approved"
        ? "active"
        : v.approval_status === "rejected"
        ? "inactive"
        : "pending",
    avatar: v.business_name
      ? v.business_name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "",

    // Bank Details
    panNumber: v.pan_number || "",
    tanNumber: v.tan_number || "",
    gstNumber: v.gst_number || "",
    bankName: v.bank_name || "",
    bankAccountNumber: v.bank_account_number || "",
    branchName: v.branch_name || "",
    ifscCode: v.ifsc_code || "",

    // Contact Persons (from contacts array)
    contactPersons: Array.isArray(data.contacts)
      ? data.contacts.map((cp: any) => ({
          id: cp.id || cp.contact_id || "",
          name: cp.name || "",
          phone: cp.phone || "",
          email: cp.email || "",
          designation: cp.designation || "",
          photo: cp.photo || "",
        }))
      : [],

    // Step 2: Branch Information
    branches: Array.isArray(data.branches)
      ? data.branches.filter(
          (branch, index, self) =>
            index ===
            self.findIndex(
              (b) =>
                b.branch_name === branch.branch_name &&
                b.city === branch.city &&
                b.state === branch.state
            )
        )
      : [],

    // Step 3: Upload Files
    uploadedFiles: data.files || [],

    // Include raw vendor if needed
    ...v,
  };
};

import axios from "axios";
import { Vendor } from "../pages/Vendors/components/VendorList";

// Delete vendor by ID
export const deleteVendor = async (vendorId: string): Promise<any> => {
  const response = await axios.delete(
    `${import.meta.env.VITE_API_BASE_URL}/vendor/${vendorId}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

// Deactivate vendor by ID (set is_active to false)
export const deactivateVendor = async (vendorId: string): Promise<any> => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/vendor/${vendorId}`,
    { is_active: false },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

export const getAllVendors = async (): Promise<Vendor[]> => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/vendor`, {
    headers: { "Cache-Control": "no-cache" },
  });
  // Map backend fields to frontend Vendor interface
  const backendVendors = response.data?.data || [];
  return backendVendors.map((v: any) => ({
    id: v.vendor_id,
    name: v.business_name,
    vendorNumber: v.vendor_number || "",
    category: v.vendor_type || "",
    type: v.vendor_type || "",
    location: [v.city, v.state].filter(Boolean).join(", "),
    contactPerson: "", // No field in backend response
    phone: v.contact_no,
    email: v.email,
    joinDate: v.created_at,
    status:
      v.approval_status === "approved"
        ? "active"
        : v.approval_status === "rejected"
        ? "inactive"
        : "pending",
    avatar: v.business_name
      ? v.business_name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "",
  }));
};
