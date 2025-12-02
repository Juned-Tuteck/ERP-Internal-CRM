import React, { useState } from "react";
import { deleteVendor, deactivateVendor } from "../../../utils/vendorApi";
import { getVendorBranchById } from "../../../utils/vendorBranchApi";
import {
  Truck,
  MapPin,
  DollarSign,
  Calendar,
  Tag,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Globe,
  Building2,
  Trash2,
  Power,
  SquarePen,
  FileSpreadsheet,
  Download
} from "lucide-react";
import AddVendorModal from "./AddVendorModal";
import { useCRM } from "../../../context/CRMContext";

interface VendorDetailsProps {
  data: {
    vendor: any;
    branches: any[];
    contacts: any[];
    files: any[];
  };
}

const VendorDetails: React.FC<
  VendorDetailsProps & { onVendorDeleted?: () => void }
> = ({ data, onVendorDeleted }) => {
  console.log("Rendering VendorDetails component"); // Add debug logs to trace modal visibility
  // Debug log to inspect data.vendor
  console.log("Vendor data:", data.vendor);

  // Debug log to inspect the data prop
  console.log("VendorDetails data prop:", data);

  if (!data || !data.vendor) {
    console.log("No vendor data available");
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <Truck className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a vendor</h3>
          <p className="text-sm">
            Choose a vendor from the list to view their details
          </p>
        </div>
      </div>
    );
  }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [branchDetails, setBranchDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("general");
  const { hasActionAccess } = useCRM();

  // No enhancedVendor, use vendor, branches, contacts, files directly
  const vendor = data?.vendor || null;
  const branches = data?.branches || [];
  const contacts = data?.contacts || [];
  const files = data?.files || [];
  // Fetch branch details when selectedBranch changes
  React.useEffect(() => {
    if (selectedBranch) {
      // Debug: log the selected branch object and branchId
      console.log("Selected branch (effect):", selectedBranch);
      const branchId = selectedBranch.branchId || selectedBranch.id;
      console.log("BranchId to fetch:", branchId);
      if (branchId) {
        getVendorBranchById(branchId)
          .then((data) => {
            console.log("Fetched branch details:", data);
            setBranchDetails(data);
          })
          .catch((err) => {
            console.log("Error fetching branch details:", err);
            setBranchDetails(null);
          });
      } else {
        setBranchDetails(null);
      }
    } else {
      setBranchDetails(null);
    }
  }, [selectedBranch]);
  // Transform vendor data for edit modal (if needed)
  // Map all fields required by AddVendorModal's formData
  const transformToFormData = (vendor: any) => ({
    id: vendor.id || vendor.vendor_id || vendor.vendorId || "",
    vendorCategory: vendor.vendor_type || "",
    vendorType: vendor.vendor_type || "",
    businessName: vendor.business_name || "",
    contactNo: vendor.contact_no || "",
    email: vendor.email || "",
    tanNumber: vendor.tan_number || vendor.tanNumber || "",
    country: vendor.country || "India",
    currency: typeof vendor.currency === 'string' 
              ? vendor.currency.replace(/["{}\[\]]/g, '').split(',').map((c: string) => c.trim())
              : [],
    state: vendor.state || "",
    district: vendor.district || "",
    city: vendor.city || "",
    pincode: vendor.pincode || "",
    active: typeof vendor.is_active === "boolean" ? vendor.is_active : true,
    panNumber: vendor.pan_number || "",
    gstNumber: vendor.gst_number || "",
    bankName: vendor.bank_name || "",
    bankAccountNumber: vendor.bank_account_number || "",
    branchName: vendor.branch_name || "",
    ifscCode: vendor.ifsc_code || "",
    // Ensure contactPersons have id, name, phone, email, designation, photo
    contactPersons: (vendor.contacts || []).map((cp: any, idx: number) => ({
      id: cp.id?.toString() || cp.contact_person_id?.toString() || `cp-${idx}`,
      name: cp.name || "",
      phone: cp.phone || "",
      email: cp.email || "",
      designation: cp.designation || "",
      photo: cp.photo || "",
    })),
    // Ensure branches and their contactPersons have correct structure
    branches: (vendor.branches || []).map((b: any, bidx: number) => ({
      id: b.id?.toString() || b.branch_id?.toString() || `branch-${bidx}`,
      branchName: b.branchName || b.branch_name || "",
      contactNumber: b.contactNumber || b.contact_number || "",
      email: b.email || b.email_id || "",
      country: b.country || "",
      currency: b.currency || "",
      state: b.state || "",
      district: b.district || "",
      city: b.city || "",
      pincode: b.pincode || "",
      contactPersons: (b.contactPersons || b.branchContacts || []).map(
        (cp: any, cidx: number) => ({
          id:
            cp.id?.toString() ||
            cp.contact_person_id?.toString() ||
            `b${bidx}-cp${cidx}`,
          name: cp.name || "",
          phone: cp.phone || "",
          email: cp.email || "",
          designation: cp.designation || "",
          photo: cp.photo || "",
        })
      ),
    })),
    uploadedFiles: vendor.files || [],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  function getIconByMime(mime?: string | null, filename?: string) {
    const ext = filename?.split(".").pop()?.toLowerCase() ?? "";
    if (!mime && !ext) return File;
    if (mime?.includes("pdf") || ext === "pdf") return FileText;
    if (mime?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext))
      return Image;
    if (
      mime?.includes("spreadsheet") ||
      ["xls", "xlsx", "csv"].includes(ext) ||
      mime === "application/vnd.ms-excel" ||
      mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
      return FileSpreadsheet;
    if (
      ["doc", "docx", "rtf", "msword"].some((t) => mime?.includes(t)) ||
      ["doc", "docx"].includes(ext)
    )
      return FileText;
    // fallback
    return File;
  }

  function formatBytes(bytes?: string | number | null) {
    if (bytes == null || isNaN(Number(bytes))) return "-";
    const b = Number(bytes);
    if (b === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  {
    vendor.ifsc_code || "";
  }

  // Debug: log when branches tab is rendered and log branches array
  React.useEffect(() => {
    if (activeTab === "branches") {
      console.log("Rendering Branches tab", branches);
      if (!branches || branches.length === 0) {
        console.log("No branches found for this vendor.");
      }
    }
  }, [activeTab, branches]);

  // Reset branch selection when switching to Branches tab
  const handleTabChange = (tabId: string) => {
    if (tabId === "branches") {
      setSelectedBranch(null);
      setBranchDetails(null);
      console.log("Switched to Branches tab, reset branch selection");
    }
    setActiveTab(tabId);
  };

  const tabs = [
    { id: "general", name: "General Information", icon: Truck },
    { id: "branches", name: "Branch Information", icon: Building2 },
    { id: "documents", name: "Documents", icon: FileText },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Vendor Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">
                {vendor.avatar}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {vendor.name}
              </h2>
              <div className="mt-1">
                <p className="text-sm font-bold text-blue-600">
                  Vendor : {vendor.vendorNumber || vendor.vendor_number || "-"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">{vendor.type}</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      vendor.status
                    )}`}
                  >
                    {vendor.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
            <div className="flex flex-col items-right">
              <p className="text-sm text-gray-500">Vendor since</p>
              <span className="text-sm font-medium text-gray-900">
                {new Date(vendor.joinDate).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {vendor.status === "PENDING" && hasActionAccess('Edit', 'All vendors', 'Vendors') && (
                <button
                  onClick={() => {
                    console.log("Edit button clicked");
                    setIsEditModalOpen(true);
                  }}
                  className="rounded-full p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                  title="Edit Vendor"
                >
                  <SquarePen className="h-5 w-5" />
                </button>
              )}
              {vendor.status === "PENDING" && hasActionAccess('Deactivate', 'All vendors', 'Vendors') && (
                <button
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition"
                  title="Deactivate Vendor"
                >
                  <Power className="h-5 w-5" />
                </button>
              )}
              {/* {vendor.status === "PENDING" && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete Vendor"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )} */}
            </div>
            {/* Edit Vendor Modal (AddVendorModal in edit mode) */}
            {isEditModalOpen &&
              (console.log("Rendering AddVendorModal"),
                (
                  <AddVendorModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                      console.log("Closing modal");
                      setIsEditModalOpen(false);
                    }}
                    onSubmit={(updatedVendorData) => {
                      console.log("Updated Vendor:", updatedVendorData);
                      setIsEditModalOpen(false);
                    }}
                    initialData={() => {
                      // Use contacts and branches from the data prop, not vendor.contacts/branches
                      const formData = transformToFormData({
                        ...vendor,
                        contacts: contacts,
                        branches: branches,
                        files: files,
                      });
                      console.log("Initial data for modal:", formData);
                      return formData;
                    }}
                  />
                ))}
          </div>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Vendor
              </h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold text-red-600">
                permanently delete
              </span>{" "}
              this vendor? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  try {
                    await deleteVendor(vendor.vendor_id || vendor.id);
                    setIsDeleteModalOpen(false);
                    if (typeof onVendorDeleted === "function") {
                      onVendorDeleted();
                    }
                  } catch (err) {
                    alert("Failed to delete vendor. Please try again.");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <Power className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Deactivate Vendor
              </h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold text-yellow-600">deactivate</span>{" "}
              this vendor? You can reactivate them later.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setIsDeactivateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700"
                onClick={async () => {
                  try {
                    await deactivateVendor(vendor.vendor_id || vendor.id);
                    setIsDeactivateModalOpen(false);
                    if (typeof onVendorDeleted === "function") {
                      onVendorDeleted();
                    }
                  } catch (err) {
                    alert("Failed to deactivate vendor. Please try again.");
                  }
                }}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "general" && (
          <div className="space-y-8">
            {/* Vendor Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vendor Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.category || vendor.vendorCategory || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.type || vendor.vendorType || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.location ||
                        [vendor.city, vendor.state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.phone || vendor.contactNo || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.email || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="text-sm font-medium text-gray-900">
                      www.
                      {(vendor.name || "").toLowerCase().replace(/\s+/g, "")}
                      .com
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Bank Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.pan_number || vendor.panNumber || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">TAN Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.tan_number || vendor.tanNumber || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.gst_number || vendor.gstNumber || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.bank_name || vendor.bankName || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.bank_account_number ||
                        vendor.bankAccountNumber ||
                        ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vendor.ifsc_code || vendor.ifscCode || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Persons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Persons
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(contacts || vendor.contacts || []).map(
                  (person: any, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {person.name
                              ? person.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                              : ""}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {person.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {person.designation}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {person.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {person.email}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "branches" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Branch Information
            </h3>
            {branches && branches.length > 0 ? (
              branches.map((branch: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 mb-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {branch.branchName || branch.branch_name || ""}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="text-sm font-medium text-gray-900">
                          {branch.contactNumber || branch.contact_number || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {branch.email || branch.email_id || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {branch.address ||
                            [
                              branch.city,
                              branch.district,
                              branch.state,
                              branch.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">
                      Branch Contact Persons
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(
                        branch.contactPersons ||
                        branch.branchContacts ||
                        []
                      ).map((person: any, personIndex: number) => (
                        <div
                          key={personIndex}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {person.name
                                ? person.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                : ""}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {person.name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {person.phone}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Mail className="h-3 w-3 mr-1" />
                              {person.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-red-500">
                No branches found for this vendor.
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vendor Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(files || vendor.files || []).map((file: any, index: number) => {
                const Icon = getIconByMime(file.mime, file.original_name);
                const sizeLabel = formatBytes(file.size);

                return (
                  <a
                    key={file.id}
                    href={`${import.meta.env.VITE_API_BASE_URL}/vendor-file/${file.vendor_id}/files/${file.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Icon className="h-8 w-8 text-blue-600 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate" title={file.original_name}>
                        {file.original_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sizeLabel} • {file.mime ?? "unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.created_at ? new Date(file.created_at).toLocaleDateString("en-IN") : "-"}
                      </p>
                    </div>

                    <Download className="h-4 w-4 text-gray-400 ml-3" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetails;
