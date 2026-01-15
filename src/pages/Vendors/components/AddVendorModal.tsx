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

import useNotifications from '../../../hook/useNotifications';
import { useCRM } from '../../../context/CRMContext';
import axios from "axios";

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

// Unified State Structure
interface VendorRegistrationState {
  vendor: {
    id : string;
    vendorCategory: string;
    vendorType: string;
    businessName: string;
    contactNo: string;
    email: string;
    country: string;
    currency: string[];
    state: string;
    district: string;
    city: string;
    pincode: string;
    is_active: boolean;
    panNumber: string;
    tanNumber: string;
    gstNumber: string;
    bankName: string;
    bankAccountNumber: string;
    branchName: string;
    ifscCode: string;
    contactPersons: ContactPerson[];
  };
  branches: Branch[];
  documents: File[];
}

const AddVendorModal: React.FC<AddVendorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  onRefresh,
}) => {
  const token = localStorage.getItem('auth_token') || '';
  const { userData } = useCRM();
  const userRole = userData?.role || '';
  const { sendNotification } = useNotifications(userRole, token);

  const [currentStep, setCurrentStep] = useState(1);

  // Unified State Structure
  const [registrationData, setRegistrationData] = useState<VendorRegistrationState>({
    vendor: {
      id : "",
      vendorCategory: "",
      vendorType: "",
      businessName: "",
      contactNo: "",
      email: "",
      country: "India",
      currency: [],
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
    },
    branches: [],
    documents: [],
  });

  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [initialFiles, setInitialFiles] = useState<any[]>([]);
  const [activeFileTab, setActiveFileTab] = useState<number>(0);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [contactPersonErrors, setContactPersonErrors] = useState<{
    [key: string]: ValidationErrors;
  }>({});
  const [branchErrors, setBranchErrors] = useState<{
    [key: string]: ValidationErrors;
  }>({});
  const [branchContactErrors, setBranchContactErrors] = useState<{
    [key: string]: { [key: string]: ValidationErrors };
  }>({});
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

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

  const vendorCategories = [
    "Electronics",
    "Raw Materials",
    "Automotive",
    "Chemicals",
    "Furniture",
    "IT Services",
    "Office Supplies",
    "Manufacturer"
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
  const districts: { [key: string]: string[] } = {
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    Delhi: ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    Karnataka: ["Bangalore Urban", "Mysore", "Hubli-Dharwad", "Mangalore", "Belgaum"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Durgapur"],
  };
  const cities: { [key: string]: string[] } = {
    Mumbai: ["Mumbai", "Navi Mumbai", "Thane", "Kalyan", "Vasai-Virar"],
    Pune: ["Pune", "Pimpri-Chinchwad", "Wakad", "Hinjewadi", "Kharadi"],
    "Bangalore Urban": ["Bangalore", "Electronic City", "Whitefield", "Koramangala"],
    Kolkata: ["Kolkata", "Salt Lake", "New Town", "Behala", "Dumdum"],
  };

  // Initialize form data from initialData (Edit Mode)
  // useEffect(() => {
  //   console.log("Initial Data:", typeof initialData);
  //   if (initialData) {
  //     setRegistrationData({
  //       vendor: {
  //         vendorCategory: initialData.category || "",
  //         vendorType: initialData.type || "",
  //         businessName: initialData.name || "",
  //         contactNo: initialData.phone || "",
  //         email: initialData.email || "",
  //         country: initialData.country || "India",
  //         currency: Array.isArray(initialData.currency) ? initialData.currency : [],
  //         state: initialData.state || "",
  //         district: initialData.district || "",
  //         city: initialData.city || "",
  //         pincode: initialData.pincode || "",
  //         is_active: initialData.is_active !== false,
  //         panNumber: initialData.panNumber || "",
  //         tanNumber: initialData.tanNumber || "",
  //         gstNumber: initialData.gstNumber || "",
  //         bankName: initialData.bankName || "",
  //         bankAccountNumber: initialData.bankAccountNumber || "",
  //         branchName: initialData.branchName || "",
  //         ifscCode: initialData.ifscCode || "",
  //         contactPersons: Array.isArray(initialData.contactPersons)
  //           ? initialData.contactPersons
  //           : [],
  //       },
  //       branches: Array.isArray(initialData.branches)
  //         ? initialData.branches.map((b: any) => ({
  //             id: b.id || b.branch_id || Date.now().toString(),
  //             branchName: b.branch_name || b.branchName || "",
  //             contactNumber: b.contact_number || b.contactNumber || "",
  //             email: b.email_id || b.email || "",
  //             country: b.country || "India",
  //             currency: b.currency || "",
  //             state: b.state || "",
  //             district: b.district || "",
  //             city: b.city || "",
  //             pincode: b.pincode || "",
  //             contactPersons: Array.isArray(b.contacts)
  //               ? b.contacts.map((c: any) => ({
  //                   id: c.id || c.contact_id || Date.now().toString(),
  //                   name: c.name || "",
  //                   phone: c.phone || "",
  //                   email: c.email || "",
  //                   designation: c.designation || "",
  //                   photo: c.photo || "",
  //                 }))
  //               : [],
  //           }))
  //         : [],
  //       documents: [],
  //     });
  //     setInitialFiles(initialData.uploadedFiles || []);
  //   }
  // }, [initialData]);

  useEffect(() => {
  if (!initialData) return;

  console.log("Initial Data function received:", initialData);

  const data = typeof initialData === "function" ? initialData() : initialData;

  console.log("Resolved Initial Data:", data);

  if (!data) return;

  setRegistrationData({
    vendor: {
      id : data.id,
      vendorCategory: data.vendorCategory || "",
      vendorType: data.vendorType || "",
      businessName: data.businessName || "",
      contactNo: data.contactNo || "",
      email: data.email || "",
      country: data.country || "India",
      currency: Array.isArray(data.currency) ? data.currency : [],
      state: data.state || "",
      district: data.district || "",
      city: data.city || "",
      pincode: data.pincode || "",
      is_active: data.is_active !== false,
      panNumber: data.panNumber || "",
      tanNumber: data.tanNumber || "",
      gstNumber: data.gstNumber || "",
      bankName: data.bankName || "",
      bankAccountNumber: data.bankAccountNumber || "",
      branchName: data.branchName || "",
      ifscCode: data.ifscCode || "",
      contactPersons: Array.isArray(data.contactPersons)
        ? data.contactPersons
        : [],
    },
    branches: Array.isArray(data.branches)
      ? data.branches.map((b: any) => ({
          id: b.id || b.branch_id || Date.now().toString(),
          branchName: b.branch_name || b.branchName || "",
          contactNumber: b.contact_number || b.contactNumber || "",
          email: b.email_id || b.email || "",
          country: b.country || "India",
          currency: b.currency || "",
          state: b.state || "",
          district: b.district || "",
          city: b.city || "",
          pincode: b.pincode || "",
          contactPersons: Array.isArray(b.contacts)
            ? b.contacts.map((c: any) => ({
                id: c.id || c.contact_id || Date.now().toString(),
                name: c.name || "",
                phone: c.phone || "",
                email: c.email || "",
                designation: c.designation || "",
                photo: c.photo || "",
              }))
            : [],
        }))
      : [],
    documents: [],
  });

  setInitialFiles(data.uploadedFiles || []);
}, [initialData]);


  const isEditMode = Boolean(initialData);

  // Clear modal state function
  const clearModalState = () => {
    setRegistrationData({
      vendor: {
        id:"",
        vendorCategory: "",
        vendorType: "",
        businessName: "",
        contactNo: "",
        email: "",
        country: "India",
        currency: [],
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
      },
      branches: [],
      documents: [],
    });
    setValidationErrors({});
    setContactPersonErrors({});
    setBranchErrors({});
    setBranchContactErrors({});
    setInitialFiles([]);
    setActiveFileTab(0);
    setFileErrors([]);
    setIsLoading(false);
    setCurrentStep(1);
  };

  const handleBreadcrumbClick = (stepId: number) => {
    if (isEditMode) {
      setCurrentStep(stepId);
    } else {
      if (stepId > currentStep) {
        if (currentStep === 1) {
          const vendorValidationErrors = validateVendor(registrationData.vendor);
          const contactPersonValidationErrors: { [key: string]: ValidationErrors } = {};
          let hasContactPersonErrors = false;

          registrationData.vendor.contactPersons.forEach((cp: ContactPerson) => {
            const cpErrors = validateContactPerson(cp);
            if (Object.keys(cpErrors).length > 0) {
              contactPersonValidationErrors[cp.id] = cpErrors;
              hasContactPersonErrors = true;
            }
          });

          setValidationErrors(vendorValidationErrors);
          setContactPersonErrors(contactPersonValidationErrors);

          if (hasErrors(vendorValidationErrors) || hasContactPersonErrors) {
            alert("Please fix all validation errors in Step 1 before proceeding.");
            return;
          }
        } else if (currentStep === 2 && stepId === 3) {
          const branchValidationErrors: { [key: string]: ValidationErrors } = {};
          const branchContactValidationErrors: { [key: string]: { [key: string]: ValidationErrors } } = {};
          let hasBranchErrors = false;
          let hasBranchContactErrors = false;

          registrationData.branches.forEach((branch: Branch) => {
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
            alert("Please fix all validation errors in Step 2 before proceeding.");
            return;
          }
        }
      }
      setCurrentStep(stepId);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setRegistrationData((prev) => {
      const updated = {
        ...prev,
        vendor: {
          ...prev.vendor,
          [name]: newValue,
        },
      };

      if (name === "state") {
        updated.vendor.district = "";
        updated.vendor.city = "";
      } else if (name === "district") {
        updated.vendor.city = "";
      }

      return updated;
    });

    const vendorErrors = validateVendor({ ...registrationData.vendor, [name]: newValue });
    setValidationErrors(vendorErrors);
  };

  const handleToggle = (name: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      vendor: {
        ...prev.vendor,
        [name]: !(prev.vendor as any)[name],
      },
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showCurrencyDropdown && !target.closest('.relative')) {
        setShowCurrencyDropdown(false);
      }
    };

    if (showCurrencyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCurrencyDropdown]);

  const handleCurrencyToggle = (currency: string) => {
    const selectedCurrencies = [...registrationData.vendor.currency];
    const index = selectedCurrencies.indexOf(currency);

    if (index > -1) {
      selectedCurrencies.splice(index, 1);
    } else {
      selectedCurrencies.push(currency);
    }

    setRegistrationData((prev) => ({
      ...prev,
      vendor: {
        ...prev.vendor,
        currency: selectedCurrencies,
      },
    }));

    const vendorErrors = validateVendor({ ...registrationData.vendor, currency: selectedCurrencies });
    setValidationErrors(vendorErrors);
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
    setRegistrationData((prev) => ({
      ...prev,
      vendor: {
        ...prev.vendor,
        contactPersons: [...prev.vendor.contactPersons, newContactPerson],
      },
    }));
  };

  const updateContactPerson = (id: string, field: string, value: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      vendor: {
        ...prev.vendor,
        contactPersons: prev.vendor.contactPersons.map((cp) =>
          cp.id === id ? { ...cp, [field]: value } : cp
        ),
      },
    }));

    const updatedContactPerson = registrationData.vendor.contactPersons.find((cp) => cp.id === id);
    if (updatedContactPerson) {
      const contactPerson = { ...updatedContactPerson, [field]: value };
      const errors = validateContactPerson(contactPerson);
      setContactPersonErrors((prev) => ({
        ...prev,
        [id]: errors,
      }));
    }
  };

  const saveContactPerson = async (person: any) => {
    try {
      await updateVendorContact(person.id, {
        name: person.name,
        phone: person.phone,
        email: person.email,
        designation: person.designation,
      });
      setEditingContactId(null);
      if (typeof onRefresh === "function") await onRefresh();
    } catch (err) {
      alert("Failed to update contact person.");
    }
  };

  const removeContactPerson = (id: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      vendor: {
        ...prev.vendor,
        contactPersons: prev.vendor.contactPersons.filter((cp) => cp.id !== id),
      },
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
      currency: "",
      state: "",
      district: "",
      city: "",
      pincode: "",
      contactPersons: [],
    };
    setRegistrationData((prev) => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));
  };

  const copyFromVendorDetails = (branchId: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      branches: prev.branches.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              contactNumber: prev.vendor.contactNo,
              email: prev.vendor.email,
              country: prev.vendor.country,
              currency: prev.vendor.currency.length > 0 ? prev.vendor.currency[0] : "",
              state: prev.vendor.state,
              district: prev.vendor.district,
              city: prev.vendor.city,
              pincode: prev.vendor.pincode,
              contactPersons: [...prev.vendor.contactPersons],
            }
          : branch
      ),
    }));
  };

  const updateBranch = (id: string, field: string, value: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      branches: prev.branches.map((branch) =>
        branch.id === id
          ? {
              ...branch,
              [field]: value,
              ...(field === "state" && { district: "", city: "" }),
              ...(field === "district" && { city: "" }),
            }
          : branch
      ),
    }));

    const updatedBranch = registrationData.branches.find((branch) => branch.id === id);
    if (updatedBranch) {
      const branch = {
        ...updatedBranch,
        [field]: value,
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
    setRegistrationData((prev) => ({
      ...prev,
      branches: prev.branches.filter((branch) => branch.id !== id),
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
    setRegistrationData((prev) => ({
      ...prev,
      branches: prev.branches.map((branch) =>
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
    setRegistrationData((prev) => ({
      ...prev,
      branches: prev.branches.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              contactPersons: branch.contactPersons.map((cp) =>
                cp.id === contactId ? { ...cp, [field]: value } : cp
              ),
            }
          : branch
      ),
    }));

    const branch = registrationData.branches.find((branch) => branch.id === branchId);
    if (branch) {
      const updatedContactPerson = branch.contactPersons.find((cp) => cp.id === contactId);
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
    setRegistrationData((prev) => ({
      ...prev,
      branches: prev.branches.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              contactPersons: branch.contactPersons.filter((cp) => cp.id !== contactId),
            }
          : branch
      ),
    }));
  };

  // File Management
  const validateFileType = (file: File): boolean => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".xls", ".xlsx", ".dwg"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension);
  };

  const validateFileSize = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024;
    return file.size <= maxSize;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFileErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      if (!validateFileType(file)) {
        newFileErrors.push(
          `${file.name}: Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG, DWG, XLS, XLSX`
        );
        return;
      }

      if (!validateFileSize(file)) {
        newFileErrors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      validFiles.push(file);
    });

    setFileErrors(newFileErrors);
    if (validFiles.length > 0) {
      setRegistrationData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...validFiles],
      }));
    }
  };

  const uploadFilesForVendor = async (
    vendorId: string,
    files: File[],
    onProgress?: (percent: number) => void
  ) => {
    if (!vendorId || files.length === 0) return;

    const formDataObj = new FormData();
    files.forEach((file) => formDataObj.append("files", file));
    formDataObj.append("upload_by", userData?.id || "");

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/vendor-file/${vendorId}/files`,
      formDataObj,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        onUploadProgress: (event) => {
          if (!onProgress) return;
          const total = event.total ?? 0;
          const percent = total ? Math.round((event.loaded * 100) / total) : 0;
          onProgress(percent);
        },
      }
    );

    return response.data;
  };

  const removeFile = (index: number) => {
    setRegistrationData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const removeInitialFile = (index: number) => {
    setInitialFiles((prev) => prev.filter((_, i) => i !== index));
    setActiveFileTab((prev) => (prev > 0 ? prev - 1 : 0));
  };

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

  // STEP 1 & 2: Only validate and navigate (NO API CALLS)
  const handleNext = () => {
    if (currentStep === 1) {
      const vendorValidationErrors = validateVendor(registrationData.vendor);
      const contactPersonValidationErrors: { [key: string]: ValidationErrors } = {};
      let hasContactPersonErrors = false;

      registrationData.vendor.contactPersons.forEach((cp: ContactPerson) => {
        const cpErrors = validateContactPerson(cp);
        if (Object.keys(cpErrors).length > 0) {
          contactPersonValidationErrors[cp.id] = cpErrors;
          hasContactPersonErrors = true;
        }
      });

      setValidationErrors(vendorValidationErrors);
      setContactPersonErrors(contactPersonValidationErrors);

      if (hasErrors(vendorValidationErrors) || hasContactPersonErrors) {
        alert("Please fix all validation errors before proceeding to the next step.");
        return;
      }

      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      const branchValidationErrors: { [key: string]: ValidationErrors } = {};
      const branchContactValidationErrors: { [key: string]: { [key: string]: ValidationErrors } } = {};
      let hasBranchErrors = false;
      let hasBranchContactErrors = false;

      registrationData.branches.forEach((branch: Branch) => {
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
        alert("Please fix all validation errors in branches before proceeding to the next step.");
        return;
      }

      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // COMPLETE REGISTRATION: Validate all steps and submit all APIs
  const handleCompleteRegistration = async () => {
    // Step 1: Validate all mandatory fields
    const vendorValidationErrors = validateVendor(registrationData.vendor);
    const contactPersonValidationErrors: { [key: string]: ValidationErrors } = {};
    let hasContactPersonErrors = false;

    registrationData.vendor.contactPersons.forEach((cp: ContactPerson) => {
      const cpErrors = validateContactPerson(cp);
      if (Object.keys(cpErrors).length > 0) {
        contactPersonValidationErrors[cp.id] = cpErrors;
        hasContactPersonErrors = true;
      }
    });

    setValidationErrors(vendorValidationErrors);
    setContactPersonErrors(contactPersonValidationErrors);

    // Check Step 1 validation
    if (hasErrors(vendorValidationErrors) || hasContactPersonErrors) {
      alert("Please fix all validation errors in Step 1 (General Information) before completing registration.");
      setCurrentStep(1);
      return;
    }

    // Validate Step 3: At least one document must be uploaded
    if (registrationData.documents.length === 0 && initialFiles.length === 0) {
      alert("Please upload at least one document in Step 3 before completing registration.");
      setCurrentStep(3);
      return;
    }

    // All validations passed, proceed with API calls
    setIsLoading(true);
    try {
      // 1. Register Vendor (Step 1)
      const vendorPayload = toSnakeCase(registrationData.vendor);
      const vendorRes = await registerVendor(vendorPayload);
      const vendorId = vendorRes?.data?.vendor_id || vendorRes?.vendor_id || vendorRes?.id;

      if (!vendorId) throw new Error("Vendor ID not returned");

      // 2. Bulk upload vendor contacts
      const contacts = registrationData.vendor.contactPersons.map((cp: ContactPerson) => ({
        vendor_id: vendorId,
        name: cp.name,
        designation: cp.designation || "",
        email: cp.email,
        phone: cp.phone,
      }));

      if (contacts.length > 0) {
        await bulkUpload(contacts);
      }

      // 3. Register branches and branch contacts (Step 2)
      for (let i = 0; i < registrationData.branches.length; i++) {
        const branch = registrationData.branches[i];
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
        const branchId = branchRes?.data?.id || branchRes?.data?.branch_id || branchRes?.branch_id || branchRes?.id;

        // Upload branch contacts
        if (branchId && branch.contactPersons.length > 0) {
          const branchContacts = branch.contactPersons.map((cp: ContactPerson) => ({
            vendor_branch_id: branchId,
            name: cp.name,
            designation: cp.designation || "",
            email: cp.email,
            phone: cp.phone,
          }));

          await vendorBranchContactBulkUpload(branchContacts);
        }
      }

      // 4. Upload documents (Step 3)
      if (registrationData.documents.length > 0) {
        await uploadFilesForVendor(vendorId, registrationData.documents, (percent) => {
          console.log("Upload progress:", percent);
        });
      }

      // 5. Send notification
      try {
        await sendNotification({
          receiver_ids: ['admin'],
          title: `CRM - New Vendor Registration : ${registrationData.vendor.businessName || 'Vendor'}`,
          message: `Vendor ${registrationData.vendor.businessName || 'Vendor'} registered successfully and sent for approval by ${userData?.name || 'a user'}`,
          service_type: 'CRM',
          link: '/vendors',
          sender_id: userRole || 'user',
          access: {
            module: "CRM",
            menu: "Vendors",
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      // 6. Success - Close modal and refresh
      if (typeof onRefresh === "function") await onRefresh();
      alert("Vendor registered successfully!");
      handleClose();
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Failed to complete vendor registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // EDIT MODE: Update vendor details
  const handleUpdateVendor = async () => {
    if (!registrationData.vendor.id) return;

    setIsLoading(true);
    try {
      const { id,vendorCategory,contactPersons,  ...vendorWithoutId } = registrationData.vendor;
      const vendorPayload = toSnakeCase(vendorWithoutId);
      await updateVendor(registrationData.vendor.id, vendorPayload);

      // Update branches if needed
      for (const branch of registrationData.branches) {
        if (branch.id) {
          const branchPayload = {
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
          await updateVendorBranch(branch.id, branchPayload);

          // Update branch contacts
          for (const contact of branch.contactPersons) {
            if (contact.id) {
              await updateVendorBranchContact(contact.id, {
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
                designation: contact.designation || "",
              });
            }
          }
        }
      }

      // Upload new documents if any
      if (registrationData.documents.length > 0) {
        await uploadFilesForVendor(registrationData.vendor.id, registrationData.documents);
      }

      if (typeof onRefresh === "function") await onRefresh();
      alert("Vendor updated successfully!");
      handleClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update vendor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              {isEditMode ? "Edit Vendor" : "Register New Vendor"}
            </h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 3</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(step.id)}
                  className={`flex items-center ${
                    currentStep === step.id
                      ? "text-blue-600 font-semibold"
                      : currentStep > step.id
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center h-8 w-8 rounded-full border-2 ${
                      currentStep === step.id
                        ? "border-blue-600 bg-blue-50"
                        : currentStep > step.id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-300"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{step.id}</span>
                    )}
                  </span>
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Form Content - Will be rendered based on currentStep */}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 250px)" }}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Vendor Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="vendorCategory"
                        value={registrationData.vendor.vendorCategory}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          validationErrors.vendorCategory ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select Category</option>
                        {vendorCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {validationErrors.vendorCategory && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.vendorCategory}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="vendorType"
                        value={registrationData.vendor.vendorType}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          validationErrors.vendorType ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select Type</option>
                        {vendorTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {validationErrors.vendorType && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.vendorType}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={registrationData.vendor.businessName}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          validationErrors.businessName ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {validationErrors.businessName && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.businessName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactNo"
                        value={registrationData.vendor.contactNo}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          validationErrors.contactNo ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {validationErrors.contactNo && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.contactNo}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={registrationData.vendor.email}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          validationErrors.email ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country"
                        value={registrationData.vendor.country}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency <span className="text-red-500">*</span>
                      </label>
                      <div
                        onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                        className={`w-full border ${
                          validationErrors.currency ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm cursor-pointer bg-white`}
                      >
                        {registrationData.vendor.currency.length > 0
                          ? registrationData.vendor.currency.join(", ")
                          : "Select Currencies"}
                      </div>
                      {showCurrencyDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                          {currencies.map((currency) => (
                            <div
                              key={currency}
                              onClick={() => handleCurrencyToggle(currency)}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                            >
                              <input
                                type="checkbox"
                                checked={registrationData.vendor.currency.includes(currency)}
                                onChange={() => {}}
                                className="mr-2"
                              />
                              {currency}
                            </div>
                          ))}
                        </div>
                      )}
                      {validationErrors.currency && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.currency}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="state"
                        value={registrationData.vendor.state}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          validationErrors.state ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {validationErrors.state && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="district"
                        value={registrationData.vendor.district}
                        onChange={handleInputChange}
                        disabled={!registrationData.vendor.state}
                        className={`w-full border ${
                          validationErrors.district ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select District</option>
                        {registrationData.vendor.state &&
                          districts[registrationData.vendor.state]?.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                      </select>
                      {validationErrors.district && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.district}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="city"
                        value={registrationData.vendor.city}
                        onChange={handleInputChange}
                        disabled={!registrationData.vendor.district}
                        className={`w-full border ${
                          validationErrors.city ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select City</option>
                        {registrationData.vendor.district &&
                          cities[registrationData.vendor.district]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                      </select>
                      {validationErrors.city && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={registrationData.vendor.pincode}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          validationErrors.pincode ? "border-red-500" : "border-gray-300"
                        } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {validationErrors.pincode && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                      <input
                        type="text"
                        name="panNumber"
                        value={registrationData.vendor.panNumber}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TAN Number</label>
                      <input
                        type="text"
                        name="tanNumber"
                        value={registrationData.vendor.tanNumber}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={registrationData.vendor.gstNumber}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        name="bankName"
                        value={registrationData.vendor.bankName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={registrationData.vendor.bankAccountNumber}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                      <input
                        type="text"
                        name="branchName"
                        value={registrationData.vendor.branchName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={registrationData.vendor.ifscCode}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Persons */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-gray-900">Contact Persons</h4>
                    <button
                      type="button"
                      onClick={addContactPerson}
                      className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Contact
                    </button>
                  </div>

                  {registrationData.vendor.contactPersons.map((contact, index) => (
                    <div key={contact.id} className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-semibold text-gray-700">Contact {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeContactPerson(contact.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => updateContactPerson(contact.id, "name", e.target.value)}
                            className={`w-full border ${
                              contactPersonErrors[contact.id]?.name ? "border-red-500" : "border-gray-300"
                            } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {contactPersonErrors[contact.id]?.name && (
                            <p className="text-red-500 text-xs mt-1">{contactPersonErrors[contact.id].name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="text"
                            value={contact.phone}
                            onChange={(e) => updateContactPerson(contact.id, "phone", e.target.value)}
                            className={`w-full border ${
                              contactPersonErrors[contact.id]?.phone ? "border-red-500" : "border-gray-300"
                            } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {contactPersonErrors[contact.id]?.phone && (
                            <p className="text-red-500 text-xs mt-1">{contactPersonErrors[contact.id].phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateContactPerson(contact.id, "email", e.target.value)}
                            className={`w-full border ${
                              contactPersonErrors[contact.id]?.email ? "border-red-500" : "border-gray-300"
                            } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {contactPersonErrors[contact.id]?.email && (
                            <p className="text-red-500 text-xs mt-1">{contactPersonErrors[contact.id].email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                          <input
                            type="text"
                            value={contact.designation || ""}
                            onChange={(e) => updateContactPerson(contact.id, "designation", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {registrationData.vendor.contactPersons.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No contact persons added yet.</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">Branch Information</h4>
                  <button
                    type="button"
                    onClick={addBranch}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Branch
                  </button>
                </div>

                {registrationData.branches.map((branch, branchIndex) => (
                  <div key={branch.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-sm font-semibold text-gray-700">Branch {branchIndex + 1}</h5>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => copyFromVendorDetails(branch.id)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy from Vendor
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBranch(branch.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Branch Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branch Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={branch.branchName}
                          onChange={(e) => updateBranch(branch.id, "branchName", e.target.value)}
                          className={`w-full border ${
                            branchErrors[branch.id]?.branchName ? "border-red-500" : "border-gray-300"
                          } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {branchErrors[branch.id]?.branchName && (
                          <p className="text-red-500 text-xs mt-1">{branchErrors[branch.id].branchName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={branch.contactNumber}
                          onChange={(e) => updateBranch(branch.id, "contactNumber", e.target.value)}
                          className={`w-full border ${
                            branchErrors[branch.id]?.contactNumber ? "border-red-500" : "border-gray-300"
                          } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {branchErrors[branch.id]?.contactNumber && (
                          <p className="text-red-500 text-xs mt-1">{branchErrors[branch.id].contactNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={branch.email}
                          onChange={(e) => updateBranch(branch.id, "email", e.target.value)}
                          className={`w-full border ${
                            branchErrors[branch.id]?.email ? "border-red-500" : "border-gray-300"
                          } rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {branchErrors[branch.id]?.email && (
                          <p className="text-red-500 text-xs mt-1">{branchErrors[branch.id].email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select
                          value={branch.state}
                          onChange={(e) => updateBranch(branch.id, "state", e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <select
                          value={branch.district}
                          onChange={(e) => updateBranch(branch.id, "district", e.target.value)}
                          disabled={!branch.state}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select District</option>
                          {branch.state &&
                            districts[branch.state]?.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <select
                          value={branch.city}
                          onChange={(e) => updateBranch(branch.id, "city", e.target.value)}
                          disabled={!branch.district}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select City</option>
                          {branch.district &&
                            cities[branch.district]?.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={branch.pincode}
                          onChange={(e) => updateBranch(branch.id, "pincode", e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Branch Contact Persons */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="text-sm font-medium text-gray-700">Branch Contacts</h6>
                        <button
                          type="button"
                          onClick={() => addBranchContactPerson(branch.id)}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Contact
                        </button>
                      </div>

                      {branch.contactPersons.map((contact, contactIndex) => (
                        <div key={contact.id} className="mb-3 p-3 bg-white rounded-md border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Contact {contactIndex + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeBranchContactPerson(branch.id, contact.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <input
                                type="text"
                                placeholder="Name"
                                value={contact.name}
                                onChange={(e) =>
                                  updateBranchContactPerson(branch.id, contact.id, "name", e.target.value)
                                }
                                className={`w-full border ${
                                  branchContactErrors[branch.id]?.[contact.id]?.name
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              />
                              {branchContactErrors[branch.id]?.[contact.id]?.name && (
                                <p className="text-red-500 text-xs mt-1">
                                  {branchContactErrors[branch.id][contact.id].name}
                                </p>
                              )}
                            </div>

                            <div>
                              <input
                                type="text"
                                placeholder="Phone"
                                value={contact.phone}
                                onChange={(e) =>
                                  updateBranchContactPerson(branch.id, contact.id, "phone", e.target.value)
                                }
                                className={`w-full border ${
                                  branchContactErrors[branch.id]?.[contact.id]?.phone
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              />
                              {branchContactErrors[branch.id]?.[contact.id]?.phone && (
                                <p className="text-red-500 text-xs mt-1">
                                  {branchContactErrors[branch.id][contact.id].phone}
                                </p>
                              )}
                            </div>

                            <div>
                              <input
                                type="email"
                                placeholder="Email"
                                value={contact.email}
                                onChange={(e) =>
                                  updateBranchContactPerson(branch.id, contact.id, "email", e.target.value)
                                }
                                className={`w-full border ${
                                  branchContactErrors[branch.id]?.[contact.id]?.email
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              />
                              {branchContactErrors[branch.id]?.[contact.id]?.email && (
                                <p className="text-red-500 text-xs mt-1">
                                  {branchContactErrors[branch.id][contact.id].email}
                                </p>
                              )}
                            </div>

                            <div>
                              <input
                                type="text"
                                placeholder="Designation"
                                value={contact.designation || ""}
                                onChange={(e) =>
                                  updateBranchContactPerson(branch.id, contact.id, "designation", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {branch.contactPersons.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-2">No contacts added for this branch.</p>
                      )}
                    </div>
                  </div>
                ))}

                {registrationData.branches.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-4">No branches added yet.</p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                    Upload Documents <span className="text-red-500">*</span>
                  </h4>

                  <div className="mb-4">
                    <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                      <span className="flex items-center space-x-2">
                        <Upload className="w-6 h-6 text-gray-600" />
                        <span className="font-medium text-gray-600">
                          Drop files to attach, or <span className="text-blue-600 underline">browse</span>
                        </span>
                      </span>
                      <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      Allowed types: PDF, DOC, DOCX, JPG, PNG, DWG, XLS, XLSX (Max 10MB per file)
                    </p>
                  </div>

                  {fileErrors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-semibold text-red-800 mb-2">File Upload Errors:</p>
                      <ul className="list-disc list-inside text-xs text-red-700">
                        {fileErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* New Documents */}
                  {registrationData.documents.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">New Documents to Upload</h5>
                      <div className="space-y-2">
                        {registrationData.documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md border">
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Initial Files (Edit Mode) */}
                  {initialFiles.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Existing Documents</h5>
                      <div className="space-y-2">
                        {initialFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md border">
                            <span className="text-sm text-gray-700">{file.name || `Document ${index + 1}`}</span>
                            <button
                              type="button"
                              onClick={() => removeInitialFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {registrationData.documents.length === 0 && initialFiles.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No documents uploaded yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer with navigation buttons */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="flex items-center space-x-2">
              {isEditMode ? (
                <button
                  type="button"
                  onClick={handleUpdateVendor}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              ) : currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Complete Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;
