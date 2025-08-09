import React, { useEffect, useState } from "react";
import { registerVendorBranch } from "../../../utils/registerVendorBranchApi";
import { vendorBranchContactBulkUpload } from "../../../utils/vendorBranchContactBulkUploadApi";
import { registerVendor } from "../../../utils/registerVendorApi";
import { bulkUpload } from "../../../utils/bulkUploadApi";
import {
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Trash2,
  Copy,
  Camera,
  Edit2,
  Check,
} from "lucide-react";
import { updateVendorContact } from "../../../utils/vendorContactApi";
import { updateVendor } from "../../../utils/updateVendorApi";
import { updateVendorBranchContact } from "../../../utils/updateVendorBranchContactApi";
import { updateVendorBranch } from "../../../utils/updateVendorBranchApi";
import {
  validateVendor,
  validateContactPerson,
  validateBranch,
  ValidationErrors,
  hasErrors,
} from "../../../utils/validationUtils";

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendorData: any) => void;
  onRefresh?: () => Promise<void>;
  initialData?: any;
}

interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo?: string;
  designation?: string;
}

interface Branch {
  id: string;
  branchName: string;
  contactNumber: string;
  email: string;
  country: string;
  currency: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  contactPersons: ContactPerson[];
}

const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  onRefresh,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(
    initialData || {
      // Step 1: General Information
      vendorCategory: "",
      vendorType: "",
      businessName: "",
      contactNo: "",
      email: "",
      country: "India",
      currency: "INR",
      state: "",
      district: "",
      city: "",
      pincode: "",
      is_active: true,
      // Bank Details
      panNumber: "",
      tanNumber: "",
      gstNumber: "",
      bankName: "",
      bankAccountNumber: "",
      branchName: "",
      ifscCode: "",
      // Contact Persons
      contactPersons: [] as ContactPerson[],
      // Step 2: Branch Information
      branches: [] as Branch[],
      // Step 3: Upload Files
      uploadedFiles: [] as File[],
      // For branch creation
      vendorId: undefined,
    }
  );
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [contactPersonErrors, setContactPersonErrors] = useState<{
    [key: string]: ValidationErrors;
  }>({});
  const [branchErrors, setBranchErrors] = useState<{
    [key: string]: ValidationErrors;
  }>({});
  const [branchContactErrors, setBranchContactErrors] = useState<{
    [key: string]: { [key: string]: ValidationErrors };
  }>({});

  const steps = [
    {
      id: 1,
      name: "General Information",
      description: "Vendor and bank details",
    },
    {
      id: 2,
      name: "Branch Information",
      description: "Branch locations and contacts",
    },
    { id: 3, name: "Upload Files", description: "Supporting documents" },
  ];

  // Mock data for dropdowns
  const vendorCategories = [
    "Electronics",
    "Raw Materials",
    "Automotive",
    "Chemicals",
    "Furniture",
    "IT Services",
    "Office Supplies",
  ];
  const vendorTypes = [
    "Manufacturer",
    "Distributor",
    "Supplier",
    "Service Provider",
    "Contractor",
  ];
  const countries = ["India", "USA", "UK", "China", "Japan"];
  const currencies = ["INR", "USD", "EUR", "GBP", "JPY"];
  const states = [
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
    "West Bengal",
  ];
  const districts = {
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    Delhi: [
      "Central Delhi",
      "North Delhi",
      "South Delhi",
      "East Delhi",
      "West Delhi",
    ],
    Karnataka: [
      "Bangalore Urban",
      "Mysore",
      "Hubli-Dharwad",
      "Mangalore",
      "Belgaum",
    ],
    "Tamil Nadu": [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
    ],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "West Bengal": [
      "Kolkata",
      "Howrah",
      "Darjeeling",
      "Siliguri",
      "Durgapur",
      "Asansol",
      "Bardhaman",
      "Kharagpur",
      "Haldia",
      "Malda",
    ],
  };
  const cities = {
    Mumbai: ["Mumbai", "Navi Mumbai", "Thane", "Kalyan", "Vasai-Virar"],
    Pune: ["Pune", "Pimpri-Chinchwad", "Wakad", "Hinjewadi", "Kharadi"],
    "Bangalore Urban": [
      "Bangalore",
      "Electronic City",
      "Whitefield",
      "Koramangala",
      "Indiranagar",
    ],
    Kolkata: ["Kolkata", "Salt Lake", "New Town", "Behala", "Dumdum"],
    Howrah: ["Howrah", "Bally", "Uluberia"],
    Darjeeling: ["Darjeeling", "Kurseong", "Mirik"],
    Siliguri: ["Siliguri", "Matigara", "Bagdogra"],
    Durgapur: ["Durgapur", "Bidhannagar", "Muchipara"],
    Asansol: ["Asansol", "Burnpur", "Kulti"],
    Bardhaman: ["Bardhaman", "Kalna", "Katwa"],
    Kharagpur: ["Kharagpur", "Hijli", "Midnapore"],
    Haldia: ["Haldia", "Mahishadal", "Nandigram"],
    Malda: ["Malda", "English Bazar", "Old Malda"],
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setUploadedFiles(formData.uploadedFiles || []);
    }
  }, [initialData]);

  const isEditMode = Boolean(initialData);
  const handleBreadcrumbClick = (stepId: number) => {
    if (isEditMode) {
      // In edit mode, allow free navigation between steps
      setCurrentStep(stepId);
    } else {
      // In create mode, validate current step before allowing forward navigation
      if (stepId > currentStep) {
        // Trying to go forward, validate current step first
        if (currentStep === 1) {
          const vendorValidationErrors = validateVendor(formData);
          const contactPersonValidationErrors: {
            [key: string]: ValidationErrors;
          } = {};
          let hasContactPersonErrors = false;

          formData.contactPersons.forEach((cp: ContactPerson) => {
            const cpErrors = validateContactPerson(cp);
            if (Object.keys(cpErrors).length > 0) {
              contactPersonValidationErrors[cp.id] = cpErrors;
              hasContactPersonErrors = true;
            }
          });

          setValidationErrors(vendorValidationErrors);
          setContactPersonErrors(contactPersonValidationErrors);

          if (hasErrors(vendorValidationErrors) || hasContactPersonErrors) {
            alert(
              "Please fix all validation errors in Step 1 before proceeding."
            );
            return;
          }
        } else if (currentStep === 2 && stepId === 3) {
          const branchValidationErrors: { [key: string]: ValidationErrors } =
            {};
          const branchContactValidationErrors: {
            [key: string]: { [key: string]: ValidationErrors };
          } = {};
          let hasBranchErrors = false;
          let hasBranchContactErrors = false;

          formData.branches.forEach((branch: Branch) => {
            const branchErrors = validateBranch(branch);
            if (Object.keys(branchErrors).length > 0) {
              branchValidationErrors[branch.id] = branchErrors;
              hasBranchErrors = true;
            }

            branch.contactPersons.forEach((cp: ContactPerson) => {
              const cpErrors = validateContactPerson(cp);
              if (Object.keys(cpErrors).length > 0) {
                if (!branchContactValidationErrors[branch.id]) {
                  branchContactValidationErrors[branch.id] = {};
                }
                branchContactValidationErrors[branch.id][cp.id] = cpErrors;
                hasBranchContactErrors = true;
              }
            });
          });

          setBranchErrors(branchValidationErrors);
          setBranchContactErrors(branchContactValidationErrors);

          if (hasBranchErrors || hasBranchContactErrors) {
            alert(
              "Please fix all validation errors in Step 2 before proceeding."
            );
            return;
          }
        }
      }
      // If validation passed or going backward, allow navigation
      setCurrentStep(stepId);
    }
  };

  // Clear modal state function
  const clearModalState = () => {
    setFormData({
      vendorCategory: "",
      vendorType: "",
      businessName: "",
      contactNo: "",
      email: "",
      country: "India",
      currency: "INR",
      state: "",
      district: "",
      city: "",
      pincode: "",
      is_active: true,
      panNumber: "",
      tanNumber: "",
      gstNumber: "",
      bankName: "",
      bankAccountNumber: "",
      branchName: "",
      ifscCode: "",
      contactPersons: [],
      branches: [],
      uploadedFiles: [],
      vendorId: undefined,
    });
    setValidationErrors({});
    setContactPersonErrors({});
    setBranchErrors({});
    setBranchContactErrors({});
    setUploadedFiles([]);
    setCurrentStep(1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev: any) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };

      // Handle cascading dropdowns for location fields
      if (name === "state") {
        updated.district = "";
        updated.city = "";
      } else if (name === "district") {
        updated.city = "";
      }

      return updated;
    });

    // Real-time validation
    const vendorErrors = validateVendor({ ...formData, [name]: newValue });
    setValidationErrors(vendorErrors);
  };

  const handleToggle = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }));
  };

  // Contact Person Management
  const addContactPerson = () => {
    const newContactPerson: ContactPerson = {
      id: Date.now().toString(),
      name: "",
      phone: "",
      email: "",
      photo: "",
    };
    setFormData((prev: typeof formData) => ({
      ...prev,
      contactPersons: [...prev.contactPersons, newContactPerson],
    }));
  };

  const updateContactPerson = (id: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      contactPersons: prev.contactPersons.map((cp: any) =>
        cp.id === id ? { ...cp, [field]: value } : cp
      ),
    }));

    // Validate contact person in real-time
    const updatedContactPerson = formData.contactPersons.find(
      (cp: any) => cp.id === id
    );
    if (updatedContactPerson) {
      const contactPerson = { ...updatedContactPerson, [field]: value };
      const errors = validateContactPerson(contactPerson);
      setContactPersonErrors((prev) => ({
        ...prev,
        [id]: errors,
      }));
    }
  };

  // Save contact person update
  const saveContactPerson = async (person: any) => {
    try {
      await updateVendorContact(person.id, {
        name: person.name,
        phone: person.phone,
        email: person.email,
        designation: person.designation,
        // photo: person.photo,
      });
      setEditingContactId(null);
      if (typeof onRefresh === "function") await onRefresh();
    } catch (err) {
      alert("Failed to update contact person.");
    }
  };

  const removeContactPerson = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      contactPersons: prev.contactPersons.filter((cp: any) => cp.id !== id),
    }));
  };

  // Branch Management
  const addBranch = () => {
    const newBranch: Branch = {
      id: Date.now().toString(),
      branchName: "",
      contactNumber: "",
      email: "",
      country: "India",
      currency: "INR",
      state: "",
      district: "",
      city: "",
      pincode: "",
      contactPersons: [],
    };
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));
  };

  const copyFromVendorDetails = (branchId: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) =>
        branch.id === branchId
          ? {
              ...branch,
              contactNumber: prev.contactNo,
              email: prev.email,
              country: prev.country,
              currency: prev.currency,
              state: prev.state,
              district: prev.district,
              city: prev.city,
              pincode: prev.pincode,
              contactPersons: [...prev.contactPersons],
            }
          : branch
      ),
    }));
  };

  const updateBranch = (id: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) =>
        branch.id === id
          ? {
              ...branch,
              [field]: value,
              // Handle cascading dropdowns for branch location fields
              ...(field === "state" && { district: "", city: "" }),
              ...(field === "district" && { city: "" }),
            }
          : branch
      ),
    }));

    // Validate branch in real-time
    const updatedBranch = formData.branches.find(
      (branch: Branch) => branch.id === id
    );
    if (updatedBranch) {
      const branch = {
        ...updatedBranch,
        [field]: value,
        // Clear dependent fields for validation
        ...(field === "state" && { district: "", city: "" }),
        ...(field === "district" && { city: "" }),
      };
      const errors = validateBranch(branch);
      setBranchErrors((prev) => ({
        ...prev,
        [id]: errors,
      }));
    }
  };

  const removeBranch = (id: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.filter((branch: Branch) => branch.id !== id),
    }));
  };

  const addBranchContactPerson = (branchId: string) => {
    const newContactPerson: ContactPerson = {
      id: Date.now().toString(),
      name: "",
      phone: "",
      email: "",
      photo: "",
      designation: "",
    };
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) =>
        branch.id === branchId
          ? {
              ...branch,
              contactPersons: [...branch.contactPersons, newContactPerson],
            }
          : branch
      ),
    }));
  };

  const updateBranchContactPerson = (
    branchId: string,
    contactId: string,
    field: string,
    value: string
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) =>
        branch.id === branchId
          ? {
              ...branch,
              contactPersons: branch.contactPersons.map((cp: ContactPerson) =>
                cp.id === contactId ? { ...cp, [field]: value } : cp
              ),
            }
          : branch
      ),
    }));

    // Validate branch contact person in real-time
    const branch = formData.branches.find(
      (branch: Branch) => branch.id === branchId
    );
    if (branch) {
      const updatedContactPerson = branch.contactPersons.find(
        (cp: ContactPerson) => cp.id === contactId
      );
      if (updatedContactPerson) {
        const contactPerson = { ...updatedContactPerson, [field]: value };
        const errors = validateContactPerson(contactPerson);
        setBranchContactErrors((prev) => ({
          ...prev,
          [branchId]: {
            ...(prev[branchId] || {}),
            [contactId]: errors,
          },
        }));
      }
    }
  };

  const removeBranchContactPerson = (branchId: string, contactId: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) =>
        branch.id === branchId
          ? {
              ...branch,
              contactPersons: branch.contactPersons.filter(
                (cp: ContactPerson) => cp.id !== contactId
              ),
            }
          : branch
      ),
    }));
  };

  // File Management
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Utility to convert camelCase keys to snake_case
  const toSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(toSnakeCase);
    } else if (obj !== null && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        acc[snakeKey] = toSnakeCase(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate vendor form data before proceeding
      const vendorValidationErrors = validateVendor(formData);

      // Validate all contact persons
      const contactPersonValidationErrors: { [key: string]: ValidationErrors } =
        {};
      let hasContactPersonErrors = false;

      formData.contactPersons.forEach((cp: ContactPerson) => {
        const cpErrors = validateContactPerson(cp);
        if (Object.keys(cpErrors).length > 0) {
          contactPersonValidationErrors[cp.id] = cpErrors;
          hasContactPersonErrors = true;
        }
      });

      // Update error states
      setValidationErrors(vendorValidationErrors);
      setContactPersonErrors(contactPersonValidationErrors);

      // Check if there are any validation errors
      if (hasErrors(vendorValidationErrors) || hasContactPersonErrors) {
        alert(
          "Please fix all validation errors before proceeding to the next step."
        );
        return;
      }

      try {
        const vendorPayload = toSnakeCase(formData);
        const vendorRes = await registerVendor(vendorPayload);
        const vendorId =
          vendorRes?.data?.vendor_id || vendorRes?.vendor_id || vendorRes?.id;
        if (!vendorId) throw new Error("Vendor ID not returned");
        // Save vendorId in formData for use in branch creation
        setFormData((prev: typeof formData) => ({ ...prev, vendorId }));
        // Prepare contact persons array for bulk upload
        const contacts = (formData.contactPersons || []).map(
          (cp: ContactPerson) => ({
            vendor_id: vendorId,
            name: cp.name,
            designation: cp.designation || "",
            email: cp.email,
            phone: cp.phone,
          })
        );
        if (contacts.length > 0) {
          await bulkUpload(contacts);
        }
        setCurrentStep(currentStep + 1);
      } catch (err) {
        alert("Failed to create vendor or bulk upload. Please try again.");
      }
    } else if (currentStep === 2) {
      // Validate all branches before proceeding
      const branchValidationErrors: { [key: string]: ValidationErrors } = {};
      const branchContactValidationErrors: {
        [key: string]: { [key: string]: ValidationErrors };
      } = {};
      let hasBranchErrors = false;
      let hasBranchContactErrors = false;

      formData.branches.forEach((branch: Branch) => {
        // Validate branch fields
        const branchErrors = validateBranch(branch);
        if (Object.keys(branchErrors).length > 0) {
          branchValidationErrors[branch.id] = branchErrors;
          hasBranchErrors = true;
        }

        // Validate branch contact persons
        branch.contactPersons.forEach((cp: ContactPerson) => {
          const cpErrors = validateContactPerson(cp);
          if (Object.keys(cpErrors).length > 0) {
            if (!branchContactValidationErrors[branch.id]) {
              branchContactValidationErrors[branch.id] = {};
            }
            branchContactValidationErrors[branch.id][cp.id] = cpErrors;
            hasBranchContactErrors = true;
          }
        });
      });

      // Update error states
      setBranchErrors(branchValidationErrors);
      setBranchContactErrors(branchContactValidationErrors);

      // Check if there are any validation errors
      if (hasBranchErrors || hasBranchContactErrors) {
        alert(
          "Please fix all validation errors in branches before proceeding to the next step."
        );
        return;
      }

      try {
        // Register all branches with vendor_id (use backend field names)
        const vendorId = formData.vendorId || formData.id || formData.vendor_id;
        let updatedBranches = [...(formData.branches || [])];
        for (let i = 0; i < updatedBranches.length; i++) {
          const branch = updatedBranches[i];
          const branchPayload = {
            vendor_id: vendorId,
            branch_name: branch.branchName,
            contact_number: branch.contactNumber,
            email_id: branch.email,
            country: branch.country,
            currency: branch.currency,
            state: branch.state,
            district: branch.district,
            city: branch.city,
            pincode: branch.pincode,
          };
          const branchRes: any = await registerVendorBranch(branchPayload);
          // Accept id from branchRes.data.id (API returns id as branch id)
          const branchId =
            branchRes?.data?.id ||
            branchRes?.data?.branch_id ||
            branchRes?.branch_id ||
            branchRes?.id;
          if (branchId) {
            updatedBranches[i] = { ...branch, branchId };
          }
        }
        // Prepare all branch contacts for bulk upload (use backend field names)
        let branchContacts: any[] = [];
        updatedBranches.forEach((branch) => {
          if (
            branch &&
            branch.contactPersons &&
            branch.contactPersons.length > 0 &&
            branch.branchId
          ) {
            branch.contactPersons.forEach((cp: ContactPerson) => {
              branchContacts.push({
                vendor_branch_id: branch.branchId,
                name: cp.name,
                designation: cp.designation || "",
                email: cp.email,
                phone: cp.phone,
              });
            });
          }
        });
        if (branchContacts.length > 0) {
          await vendorBranchContactBulkUpload(branchContacts);
        }
        setCurrentStep(currentStep + 1);
      } catch (err) {
        alert("Failed to create branch or branch contacts. Please try again.");
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation before submission
    const vendorValidationErrors = validateVendor(formData);
    const contactPersonValidationErrors: { [key: string]: ValidationErrors } =
      {};
    const branchValidationErrors: { [key: string]: ValidationErrors } = {};
    const branchContactValidationErrors: {
      [key: string]: { [key: string]: ValidationErrors };
    } = {};

    let hasValidationErrors = false;

    // Validate contact persons
    formData.contactPersons.forEach((cp: ContactPerson) => {
      const cpErrors = validateContactPerson(cp);
      if (Object.keys(cpErrors).length > 0) {
        contactPersonValidationErrors[cp.id] = cpErrors;
        hasValidationErrors = true;
      }
    });

    // Validate branches and their contact persons
    formData.branches.forEach((branch: Branch) => {
      const branchErrors = validateBranch(branch);
      if (Object.keys(branchErrors).length > 0) {
        branchValidationErrors[branch.id] = branchErrors;
        hasValidationErrors = true;
      }

      branch.contactPersons.forEach((cp: ContactPerson) => {
        const cpErrors = validateContactPerson(cp);
        if (Object.keys(cpErrors).length > 0) {
          if (!branchContactValidationErrors[branch.id]) {
            branchContactValidationErrors[branch.id] = {};
          }
          branchContactValidationErrors[branch.id][cp.id] = cpErrors;
          hasValidationErrors = true;
        }
      });
    });

    // Update all error states
    setValidationErrors(vendorValidationErrors);
    setContactPersonErrors(contactPersonValidationErrors);
    setBranchErrors(branchValidationErrors);
    setBranchContactErrors(branchContactValidationErrors);

    // Check for validation errors
    if (hasErrors(vendorValidationErrors) || hasValidationErrors) {
      alert("Please fix all validation errors before submitting the form.");
      // Navigate back to the first step with errors
      if (
        hasErrors(vendorValidationErrors) ||
        Object.keys(contactPersonValidationErrors).length > 0
      ) {
        setCurrentStep(1);
      } else if (
        Object.keys(branchValidationErrors).length > 0 ||
        Object.keys(branchContactValidationErrors).length > 0
      ) {
        setCurrentStep(2);
      }
      return;
    }

    if (typeof onSubmit === "function") {
      if (onRefresh) onRefresh(); // Only trigger fetchVendors in parent, do not send vendor data
    }
    onClose();
    clearModalState();
  };

  // Handle modal close with state clearing
  const handleClose = () => {
    clearModalState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Register New Vendor
            </h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 3</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {isEditMode ? (
                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(step.id)}
                    className={`flex items-center space-x-2 focus:outline-none ${
                      currentStep === step.id
                        ? "text-blue-600"
                        : currentStep > step.id
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step.id
                          ? "bg-blue-100 text-blue-600"
                          : currentStep > step.id
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.id}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{step.name}</p>
                      <p className="text-xs">{step.description}</p>
                    </div>
                  </button>
                ) : (
                  <div
                    className={`flex items-center space-x-2 ${
                      currentStep === step.id
                        ? "text-blue-600"
                        : currentStep > step.id
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step.id
                          ? "bg-blue-100 text-blue-600"
                          : currentStep > step.id
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.id}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{step.name}</p>
                      <p className="text-xs">{step.description}</p>
                    </div>
                  </div>
                )}
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit}>
            {/* Step 1: General Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Vendor Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Vendor Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Category *
                      </label>
                      <select
                        name="vendorCategory"
                        value={formData.vendorCategory}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.vendorCategory
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Category</option>
                        {vendorCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {validationErrors.vendorCategory && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.vendorCategory}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Type *
                      </label>
                      <select
                        name="vendorType"
                        value={formData.vendorType}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.vendorType
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Type</option>
                        {vendorTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {validationErrors.vendorType && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.vendorType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.businessName
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter business name"
                      />
                      {validationErrors.businessName && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.businessName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact No *
                      </label>
                      <input
                        type="tel"
                        name="contactNo"
                        value={formData.contactNo}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.contactNo
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="+91 98765 43210"
                      />
                      {validationErrors.contactNo && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.contactNo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.email
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="business@company.com"
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.country
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      {validationErrors.country && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.country}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency *
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.currency
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        {currencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                      {validationErrors.currency && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.currency}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.state
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {validationErrors.state && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District *
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.state}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                          validationErrors.district
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select District</option>
                        {formData.state &&
                          districts[
                            formData.state as keyof typeof districts
                          ]?.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                      </select>
                      {validationErrors.district && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.district}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.district}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                          validationErrors.city
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select City</option>
                        {formData.district &&
                          cities[formData.district as keyof typeof cities]?.map(
                            (city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            )
                          )}
                      </select>
                      {validationErrors.city && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.pincode
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="400001"
                      />
                      {validationErrors.pincode && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.pincode}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={() => handleToggle("is_active")}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Bank Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number *
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.panNumber
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="ABCDE1234F"
                      />
                      {validationErrors.panNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.panNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TAN Number *
                      </label>
                      <input
                        type="text"
                        name="tanNumber"
                        value={formData.tanNumber}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.tanNumber
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="ABCD12345E"
                      />
                      {validationErrors.tanNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.tanNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number *
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.gstNumber
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="27ABCDE1234F1Z5"
                      />
                      {validationErrors.gstNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.gstNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.bankName
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="State Bank of India"
                      />
                      {validationErrors.bankName && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.bankName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Account Number *
                      </label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.bankAccountNumber
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="123456789012345"
                      />
                      {validationErrors.bankAccountNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.bankAccountNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Name *
                      </label>
                      <input
                        type="text"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.branchName
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Mumbai Main Branch"
                      />
                      {validationErrors.branchName && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.branchName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.ifscCode
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="SBIN0001234"
                      />
                      {validationErrors.ifscCode && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.ifscCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Persons */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Contact Persons
                    </h4>
                    <button
                      type="button"
                      onClick={addContactPerson}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact Person
                    </button>
                  </div>

                  {formData.contactPersons.map(
                    (person: ContactPerson, index: number) => (
                      <div
                        key={person.id}
                        className="border border-gray-200 rounded-lg p-4 mb-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-900">
                            Contact Person {index + 1}
                          </h5>
                          <div className="flex items-center gap-2">
                            {isEditMode ? (
                              editingContactId === person.id ? (
                                <button
                                  type="button"
                                  onClick={() => saveContactPerson(person)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Save"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setEditingContactId(person.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              )
                            ) : null}
                            <button
                              type="button"
                              onClick={() => removeContactPerson(person.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={person.name}
                              onChange={(e) =>
                                updateContactPerson(
                                  person.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                contactPersonErrors[person.id]?.name
                                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Contact person name"
                              disabled={
                                isEditMode && editingContactId !== person.id
                              }
                            />
                            {contactPersonErrors[person.id]?.name && (
                              <p className="mt-1 text-sm text-red-600">
                                {contactPersonErrors[person.id].name}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={person.phone}
                              onChange={(e) =>
                                updateContactPerson(
                                  person.id,
                                  "phone",
                                  e.target.value
                                )
                              }
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                contactPersonErrors[person.id]?.phone
                                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="+91 98765 43210"
                              disabled={
                                isEditMode && editingContactId !== person.id
                              }
                            />
                            {contactPersonErrors[person.id]?.phone && (
                              <p className="mt-1 text-sm text-red-600">
                                {contactPersonErrors[person.id].phone}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email ID
                            </label>
                            <input
                              type="email"
                              value={person.email}
                              onChange={(e) =>
                                updateContactPerson(
                                  person.id,
                                  "email",
                                  e.target.value
                                )
                              }
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                contactPersonErrors[person.id]?.email
                                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="contact@company.com"
                              disabled={
                                isEditMode && editingContactId !== person.id
                              }
                            />
                            {contactPersonErrors[person.id]?.email && (
                              <p className="mt-1 text-sm text-red-600">
                                {contactPersonErrors[person.id].email}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Designation
                            </label>
                            <input
                              type="text"
                              value={person.designation || ""}
                              onChange={(e) =>
                                updateContactPerson(
                                  person.id,
                                  "designation",
                                  e.target.value
                                )
                              }
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                contactPersonErrors[person.id]?.designation
                                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Designation"
                              disabled={
                                isEditMode && editingContactId !== person.id
                              }
                            />
                            {contactPersonErrors[person.id]?.designation && (
                              <p className="mt-1 text-sm text-red-600">
                                {contactPersonErrors[person.id].designation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Branch Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">
                    Branch Information
                  </h4>
                  <button
                    type="button"
                    onClick={addBranch}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Branch
                  </button>
                </div>

                {formData.branches.map((branch: Branch, index: number) => (
                  <div
                    key={branch.id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-lg font-medium text-gray-900">
                        Branch {index + 1}
                      </h5>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => copyFromVendorDetails(branch.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy from Vendor Details
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBranch(branch.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branch Name *
                        </label>
                        <input
                          type="text"
                          value={branch.branchName}
                          onChange={(e) =>
                            updateBranch(
                              branch.id,
                              "branchName",
                              e.target.value
                            )
                          }
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            branchErrors[branch.id]?.branchName
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Branch name"
                        />
                        {branchErrors[branch.id]?.branchName && (
                          <p className="mt-1 text-sm text-red-600">
                            {branchErrors[branch.id].branchName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          value={branch.contactNumber}
                          onChange={(e) =>
                            updateBranch(
                              branch.id,
                              "contactNumber",
                              e.target.value
                            )
                          }
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            branchErrors[branch.id]?.contactNumber
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="+91 98765 43210"
                        />
                        {branchErrors[branch.id]?.contactNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {branchErrors[branch.id].contactNumber}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email ID *
                        </label>
                        <input
                          type="email"
                          value={branch.email}
                          onChange={(e) =>
                            updateBranch(branch.id, "email", e.target.value)
                          }
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            branchErrors[branch.id]?.email
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="branch@company.com"
                        />
                        {branchErrors[branch.id]?.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {branchErrors[branch.id].email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <select
                          value={branch.country}
                          onChange={(e) =>
                            updateBranch(branch.id, "country", e.target.value)
                          }
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            branchErrors[branch.id]?.country
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        {branchErrors[branch.id]?.country && (
                          <p className="mt-1 text-sm text-red-600">
                            {branchErrors[branch.id].country}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Currency *
                        </label>
                        <select
                          value={branch.currency}
                          onChange={(e) =>
                            updateBranch(branch.id, "currency", e.target.value)
                          }
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            branchErrors[branch.id]?.currency
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          {currencies.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ))}
                        </select>
                        {branchErrors[branch.id]?.currency && (
                          <p className="mt-1 text-sm text-red-600">
                            {branchErrors[branch.id].currency}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <select
                          value={branch.state}
                          onChange={(e) =>
                            updateBranch(branch.id, "state", e.target.value)
                          }
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            branchErrors[branch.id]?.state
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        {branchErrors[branch.id]?.state && (
                          <p className="mt-1 text-sm text-red-600">
                            {branchErrors[branch.id].state}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          District *
                        </label>
                        <select
                          value={branch.district}
                          onChange={(e) =>
                            updateBranch(branch.id, "district", e.target.value)
                          }
                          required
                          disabled={!branch.state}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                            branchErrors[branch.id]?.district
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select District</option>
                          {branch.state &&
                            districts[
                              branch.state as keyof typeof districts
                            ]?.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                        </select>
                        {branchErrors[branch.id]?.district && (
                          <p className="mt-1 text-sm text-red-600">
                            {branchErrors[branch.id].district}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <select
                          value={branch.city}
                          onChange={(e) =>
                            updateBranch(branch.id, "city", e.target.value)
                          }
                          required
                          disabled={!branch.district}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                            branchErrors[branch.id]?.city
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select City</option>
                          {branch.district &&
                            cities[branch.district as keyof typeof cities]?.map(
                              (city) => (
                                <option key={city} value={city}>
                                  {city}
                                </option>
                              )
                            )}
                        </select>
                        {branchErrors[branch.id]?.city && (
                          <p className="mt-1 text-sm text-red-600">
                            {branchErrors[branch.id].city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={branch.pincode}
                          onChange={(e) =>
                            updateBranch(branch.id, "pincode", e.target.value)
                          }
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            branchErrors[branch.id]?.pincode
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="400001"
                        />
                        {branchErrors[branch.id]?.pincode && (
                          <p className="mt-1 text-sm text-red-600">
                            {branchErrors[branch.id].pincode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Branch Contact Persons */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="text-sm font-medium text-gray-900">
                          Branch Contact Persons
                        </h6>
                        <button
                          type="button"
                          onClick={() => addBranchContactPerson(branch.id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Contact
                        </button>
                      </div>

                      {branch.contactPersons.map(
                        (person: ContactPerson, personIndex: number) => {
                          // Only show edit/save toggle in update mode
                          const isEditing =
                            isEditMode &&
                            editingContactId === `${branch.id}-${person.id}`;
                          const handleBranchContactSave = async () => {
                            try {
                              // Remove id/branchId if needed, send only updatable fields
                              const { id, photo, ...rest } = person;
                              await updateVendorBranchContact(person.id, rest);
                              setEditingContactId(null);
                              if (typeof onRefresh === "function")
                                await onRefresh();
                            } catch (err) {
                              alert("Failed to update branch contact.");
                            }
                          };
                          return (
                            <div
                              key={person.id}
                              className="border border-gray-100 rounded p-3 mb-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-700">
                                  Contact {personIndex + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  {isEditMode ? (
                                    isEditing ? (
                                      <button
                                        type="button"
                                        onClick={handleBranchContactSave}
                                        className="text-green-600 hover:text-green-800"
                                        title="Save"
                                      >
                                        <Check className="h-4 w-4" />
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingContactId(
                                            `${branch.id}-${person.id}`
                                          )
                                        }
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Edit"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                    )
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeBranchContactPerson(
                                        branch.id,
                                        person.id
                                      )
                                    }
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <input
                                    type="text"
                                    value={person.name}
                                    onChange={(e) =>
                                      updateBranchContactPerson(
                                        branch.id,
                                        person.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    className={`w-full px-2 py-1 border rounded text-sm ${
                                      branchContactErrors[branch.id]?.[
                                        person.id
                                      ]?.name
                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder="Name"
                                    disabled={isEditMode && !isEditing}
                                  />
                                  {branchContactErrors[branch.id]?.[person.id]
                                    ?.name && (
                                    <p className="mt-1 text-xs text-red-600">
                                      {
                                        branchContactErrors[branch.id][
                                          person.id
                                        ].name
                                      }
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <input
                                    type="tel"
                                    value={person.phone}
                                    onChange={(e) =>
                                      updateBranchContactPerson(
                                        branch.id,
                                        person.id,
                                        "phone",
                                        e.target.value
                                      )
                                    }
                                    className={`w-full px-2 py-1 border rounded text-sm ${
                                      branchContactErrors[branch.id]?.[
                                        person.id
                                      ]?.phone
                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder="Phone"
                                    disabled={isEditMode && !isEditing}
                                  />
                                  {branchContactErrors[branch.id]?.[person.id]
                                    ?.phone && (
                                    <p className="mt-1 text-xs text-red-600">
                                      {
                                        branchContactErrors[branch.id][
                                          person.id
                                        ].phone
                                      }
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <input
                                    type="email"
                                    value={person.email}
                                    onChange={(e) =>
                                      updateBranchContactPerson(
                                        branch.id,
                                        person.id,
                                        "email",
                                        e.target.value
                                      )
                                    }
                                    className={`w-full px-2 py-1 border rounded text-sm ${
                                      branchContactErrors[branch.id]?.[
                                        person.id
                                      ]?.email
                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300"
                                    }`}
                                    placeholder="Email"
                                    disabled={isEditMode && !isEditing}
                                  />
                                  {branchContactErrors[branch.id]?.[person.id]
                                    ?.email && (
                                    <p className="mt-1 text-xs text-red-600">
                                      {
                                        branchContactErrors[branch.id][
                                          person.id
                                        ].email
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Upload Files */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Vendor Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload compliance certificates, company profile, and other
                      relevant documents
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supported formats: DOC, DOCX, PDF, JPG, JPEG, PNG (Max
                      15MB per file)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Files
                    </h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer with navigation buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>

            {isEditMode ? (
              <button
                type="submit"
                onClick={async (e) => {
                  e.preventDefault();
                  if (currentStep === 1) {
                    // General Info: update vendor
                    const vendorId =
                      formData.id || formData.vendorId || formData.vendor_id;
                    if (!vendorId) {
                      alert("Vendor ID is missing. Cannot update vendor.");
                      return;
                    }
                    const {
                      id,
                      vendorId: _vendorId,
                      vendor_id: _vendor_id,
                      vendorCategory,
                      active,
                      branches,
                      uploaded_files,
                      contactPersons,
                      uploadedFiles,
                      ...rest
                    } = formData;
                    const payload = toSnakeCase(rest);
                    try {
                      await updateVendor(vendorId, payload);
                      if (typeof onRefresh === "function") await onRefresh();
                      onClose();
                    } catch (err) {
                      alert("Failed to update vendor.");
                    }
                  } else if (currentStep === 2) {
                    // Branch Info: update all branches
                    try {
                      const updatePromises = formData.branches.map(
                        async (branch: any) => {
                          const { id, contactPersons, ...rest } = branch;
                          // Map 'email' to 'email_id' for backend
                          const branchPayload = { ...rest };
                          if (branchPayload.email) {
                            branchPayload.email_id = branchPayload.email;
                            delete branchPayload.email;
                          }
                          const payload = toSnakeCase(branchPayload);
                          return updateVendorBranch(branch.id, payload);
                        }
                      );
                      await Promise.all(updatePromises);
                      if (typeof onRefresh === "function") await onRefresh();
                      alert("All branches updated successfully.");
                    } catch (err) {
                      alert("Failed to update one or more branches.");
                    }
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            ) : currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Register Vendor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVendorModal;
