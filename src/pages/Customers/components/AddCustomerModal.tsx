import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Trash2,
  Copy,
  Edit,
} from "lucide-react";
import axios from "axios";
import {
  validateForm,
  validateContactPerson,
  validateBranch,
  validationRules,
  ValidationErrors,
  hasErrors,
  getFirstError,
} from "../../../utils/validationUtils";

import useNotifications from '../../../hook/useNotifications';
import { useCRM } from '../../../context/CRMContext';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerData: any) => void;
  initialData?: any;
}

interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  designation?: string;
  isEditing?: boolean;
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
  isEditing?: boolean;
  gstNumber?: string;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  //----------------------------------------------------------------------------------- For Notification
  const token = localStorage.getItem('auth_token') || '';
  const { userData } = useCRM();
  const userRole = userData?.role || '';
  const { sendNotification } = useNotifications(userRole, token);
  //------------------------------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(
    initialData || {
      // Step 1: General Information
      businessName: "",
      contactNo: "",
      email: "",
      country: "India",
      currency: [] as string[],
      state: "",
      district: "",
      city: "",
      customerType: "",
      customerPotential: "",
      pincode: "",
      active: true,
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
    }
  );

  // If initialData has files, use them as initial uploaded files (for edit mode)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [initialFiles, setInitialFiles] = useState<any[]>(
    initialData?.uploadedFiles || []
  );
  const [activeFileTab, setActiveFileTab] = useState<number>(0);

  const [fieldChanges, setFieldChanges] = useState<Record<string, any>>({});
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(
    null
  );
  const [createdBranches, setCreatedBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [contactPersonErrors, setContactPersonErrors] = useState<
    Record<string, ValidationErrors>
  >({});
  const [branchErrors, setBranchErrors] = useState<
    Record<string, ValidationErrors>
  >({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  // Clear modal state function
  const clearModalState = () => {
    if (!isEditMode) {
      setCurrentStep(1);
      setFormData({
        businessName: "",
        contactNo: "",
        email: "",
        country: "India",
        currency: [],
        state: "",
        district: "",
        city: "",
        customerType: "",
        customerPotential: "",
        pincode: "",
        active: true,
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
      });
      setUploadedFiles([]);
      setInitialFiles([]);
      setFieldChanges({});
    }
    setValidationErrors({});
    setContactPersonErrors({});
    setBranchErrors({});
    setTouched({});
    setFileErrors([]);
    setActiveFileTab(0);
    setIsLoading(false);
  };

  // Enhanced close handler
  const handleClose = () => {
    clearModalState();
    onClose();
  };

  const keymap = {
    businessName: "business_name",
    contactNo: "contact_number",
    email: "email",
    country: "country",
    currency: "currency",
    state: "state",
    district: "district",
    city: "city",
    customerType: "customer_type",
    customerPotential: "customer_potential",
    pincode: "pincode",
    active: "active",
    panNumber: "pan_number",
    tanNumber: "tan_number",
    gstNumber: "gst_number",
    bankName: "bank_name",
    bankAccountNumber: "bank_account_number",
    branchName: "branch_name",
    ifscCode: "ifsc_code",
    approvalStatus: "approval_status",
    approvedBy: "approved_by",
  };

  const branchKeymap = {
    id: "id",
    branchName: "branch_name",
    contactNumber: "contact_number",
    email: "email_id",
    country: "country",
    currency: "currency",
    state: "state",
    district: "district",
    city: "city",
    pincode: "pincode",
    gstNumber: "gst_number",
  };

  const branchContactKeymap = {
    id: "id",
    name: "name",
    phone: "phone",
    email: "email",
  };

  useEffect(() => {
    console.log("changed fields", fieldChanges);
  });

  const steps = [
    {
      id: 1,
      name: "General Information",
      description: "Business and bank details",
    },
    {
      id: 2,
      name: "Branch Information",
      description: "Branch locations and contacts",
    },
    { id: 3, name: "Upload Files", description: "Supporting documents" },
  ];

  // Mock data for dropdowns
  const countries = ["India", "USA", "UK", "Canada", "Australia"];
  const currencies = ["INR", "USD", "EUR", "GBP", "AUD"];
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
  const customerTypes = ["Enterprise", "SME", "Startup", "Government", "NGO"];
  const customerPotentials = ["High", "Medium", "Low"];

  useEffect(() => {
    if (initialData) {
      // Ensure all branches start with isEditing: false in edit mode
      const updatedInitialData = {
        ...initialData,
        branches: (initialData.branches || []).map((branch: Branch) => ({
          ...branch,
          isEditing: false,
        })),
      };
      setFormData(updatedInitialData);
      setInitialFiles(initialData.uploadedFiles || []);
      setUploadedFiles([]); // Reset uploaded files for edit mode
      // Store original contact persons for comparison
      setOriginalContactPersons(initialData.contactPersons || []);
      // Store original branches for comparison
      setOriginalBranches(initialData.branches || []);
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev: typeof formData) => {
      const updatedFormData = {
        ...prev,
        [name]: newValue,
      };

      // Handle cascade updates for location fields
      if (name === "state") {
        // When state changes, reset district and city
        updatedFormData.district = "";
        updatedFormData.city = "";
      } else if (name === "district") {
        // When district changes, reset city
        updatedFormData.city = "";
      }

      return updatedFormData;
    });

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field
    const rule = validationRules[name as keyof typeof validationRules];
    if (rule) {
      const fieldError = validateField(name, newValue, rule);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (fieldError) {
          newErrors[name] = fieldError;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }

    if (initialData && initialData[name] !== newValue) {
      setFieldChanges((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setFieldChanges((prev) => {
        const updatedChanges = { ...prev };
        delete updatedChanges[name];
        return updatedChanges;
      });
    }
  };

  // Add validateField function for single field validation
  const validateField = (
    fieldName: string,
    value: any,
    rule: any
  ): string | null => {
    // Handle required validation for arrays (like currency)
    if (rule.required && Array.isArray(value) && value.length === 0) {
      return `${getFieldDisplayName(fieldName)} is required`;
    }

    // Handle required validation for strings
    if (
      rule.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      return `${getFieldDisplayName(fieldName)} is required`;
    }

    // If field is empty and not required, skip other validations
    if (!value || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0)) {
      return null;
    }

    // Handle string-based validations
    if (typeof value === "string") {
      // Min length validation
      if (rule.minLength && value.length < rule.minLength) {
        return `${getFieldDisplayName(fieldName)} must be at least ${rule.minLength
          } characters`;
      }

      // Max length validation
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${getFieldDisplayName(fieldName)} must not exceed ${rule.maxLength
          } characters`;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return getPatternErrorMessage(fieldName);
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  };

  // Helper function to get field display names
  const getFieldDisplayName = (fieldName: string): string => {
    const fieldNames: Record<string, string> = {
      businessName: "Business Name",
      contactNo: "Contact Number",
      email: "Email",
      country: "Country",
      currency: "Currency",
      state: "State",
      district: "District",
      city: "City",
      customerType: "Customer Type",
      customerPotential: "Customer Potential",
      pincode: "Pincode",
      panNumber: "PAN Number",
      tanNumber: "TAN Number",
      gstNumber: "GST Number",
      bankName: "Bank Name",
      bankAccountNumber: "Bank Account Number",
      branchName: "Branch Name",
      ifscCode: "IFSC Code",
    };

    return fieldNames[fieldName] || fieldName;
  };

  // Helper function to get pattern error messages
  const getPatternErrorMessage = (fieldName: string): string => {
    const patternMessages: Record<string, string> = {
      contactNo: "Please enter a valid phone number",
      email: "Please enter a valid email address",
      panNumber: "Please enter a valid PAN number (e.g., ABCDE1234F)",
      tanNumber: "Please enter a valid TAN number (e.g., ABCD12345E)",
      gstNumber: "Please enter a valid GST number (e.g., 27ABCDE1234F1Z5)",
      ifscCode: "Please enter a valid IFSC code (e.g., SBIN0001234)",
      pincode: "Please enter a valid pincode (6 digits, not starting with 0)",
      bankAccountNumber:
        "Please enter a valid bank account number (6-18 digits)",
    };

    return (
      patternMessages[fieldName] ||
      `Please enter a valid ${getFieldDisplayName(fieldName)}`
    );
  };

  const handleToggle = (name: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedCurrencies: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCurrencies.push(options[i].value);
      }
    }

    setFormData((prev: typeof formData) => ({
      ...prev,
      currency: selectedCurrencies,
    }));

    setTouched((prev) => ({
      ...prev,
      currency: true,
    }));

    const rule = validationRules.currency;
    if (rule) {
      const fieldError = validateField("currency", selectedCurrencies, rule);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (fieldError) {
          newErrors.currency = fieldError;
        } else {
          delete newErrors.currency;
        }
        return newErrors;
      });
    }

    if (initialData && JSON.stringify(initialData.currency) !== JSON.stringify(selectedCurrencies)) {
      setFieldChanges((prev) => ({
        ...prev,
        currency: selectedCurrencies,
      }));
    } else {
      setFieldChanges((prev) => {
        const updatedChanges = { ...prev };
        delete updatedChanges.currency;
        return updatedChanges;
      });
    }
  };

  // Contact Person Management
  const [newContactPersons, setNewContactPersons] = useState<ContactPerson[]>(
    []
  );
  const [originalContactPersons, setOriginalContactPersons] = useState<
    ContactPerson[]
  >([]);

  // Branch Management
  const [originalBranches, setOriginalBranches] = useState<Branch[]>([]);

  const editContactPerson = (id: string) => {
    setFormData((prevFormData: typeof formData) => ({
      ...prevFormData,
      contactPersons: prevFormData.contactPersons.map((person: ContactPerson) =>
        person.id === id
          ? { ...person, isEditing: true }
          : { ...person, isEditing: false }
      ),
    }));
  };

  const saveContactPerson = async (id: string) => {
    if (!isEditMode) {
      // In non-edit mode, just toggle isEditing
      setFormData((prevFormData: typeof formData) => ({
        ...prevFormData,
        contactPersons: prevFormData.contactPersons.map(
          (person: ContactPerson) =>
            person.id === id ? { ...person, isEditing: false } : person
        ),
      }));
      return;
    }

    try {
      const contactPerson = formData.contactPersons.find(
        (cp: ContactPerson) => cp.id === id
      );
      if (!contactPerson) return;

      // Check if this is a new contact person (has temp ID from Date.now())
      const isNewContact = !originalContactPersons.some(
        (originalCP) => originalCP.id === id
      );

      if (isNewContact) {
        // POST request for new contact person
        const payload = {
          name: contactPerson.name,
          phone: contactPerson.phone,
          email: contactPerson.email,
          designation: contactPerson.designation || "",
          customer_id: formData.id,
        };

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/customer-contact`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200 && response.status !== 201) {
          throw new Error("Failed to create contact person");
        }

        console.log("Contact person created successfully:", response.data);
      } else {
        // PUT request for existing contact person
        const originalContact = originalContactPersons.find(
          (cp) => cp.id === id
        );
        const changedFields: Record<string, any> = {};

        // Compare fields and build changed fields object
        if (originalContact) {
          if (contactPerson.name !== originalContact.name)
            changedFields.name = contactPerson.name;
          if (contactPerson.phone !== originalContact.phone)
            changedFields.phone = contactPerson.phone;
          if (contactPerson.email !== originalContact.email)
            changedFields.email = contactPerson.email;
          if (contactPerson.designation !== originalContact.designation)
            changedFields.designation = contactPerson.designation || "";
        }

        // Only make API call if there are changes
        if (Object.keys(changedFields).length > 0) {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/customer-contact/${id}`,
            changedFields,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status !== 200) {
            throw new Error("Failed to update contact person");
          }

          console.log("Contact person updated successfully:", response.data);
        }
      }

      // Update UI state
      setFormData((prevFormData: typeof formData) => ({
        ...prevFormData,
        contactPersons: prevFormData.contactPersons.map(
          (person: ContactPerson) =>
            person.id === id ? { ...person, isEditing: false } : person
        ),
      }));
    } catch (error) {
      console.error("Error saving contact person:", error);
      // You might want to show a toast notification or error message here
    }
  };

  const addContactPerson = () => {
    const newPerson = {
      id: Date.now().toString(),
      name: "",
      phone: "",
      email: "",
      designation: "",
      isEditing: true,
    };
    setFormData((prevFormData: typeof formData) => ({
      ...prevFormData,
      contactPersons: prevFormData.contactPersons
        .map((person: ContactPerson) => ({
          ...person,
          isEditing: false,
        }))
        .concat(newPerson),
    }));
  };

  useEffect(() => {
    console.log("New contact persons:", newContactPersons);
  });

  const updateContactPerson = (id: string, field: string, value: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      contactPersons: prev.contactPersons.map((cp: ContactPerson) =>
        cp.id === id ? { ...cp, [field]: value } : cp
      ),
    }));

    // Validate contact person field
    const fieldRules: Record<string, any> = {
      name: validationRules.contactPersonName,
      phone: validationRules.contactPersonPhone,
      email: validationRules.contactPersonEmail,
      designation: validationRules.contactPersonDesignation,
    };

    const rule = fieldRules[field];
    if (rule) {
      const fieldError = validateField(
        `contactPerson${field.charAt(0).toUpperCase() + field.slice(1)}`,
        value,
        rule
      );
      setContactPersonErrors((prev) => {
        const newErrors = { ...prev };
        if (!newErrors[id]) {
          newErrors[id] = {};
        }
        if (fieldError) {
          newErrors[id][field] = fieldError;
        } else {
          delete newErrors[id][field];
          if (Object.keys(newErrors[id]).length === 0) {
            delete newErrors[id];
          }
        }
        return newErrors;
      });
    }
  };

  const removeContactPerson = async (id: string) => {
    if (!isEditMode) {
      // In non-edit mode, just remove from state
      setFormData((prev: typeof formData) => ({
        ...prev,
        contactPersons: prev.contactPersons.filter(
          (cp: ContactPerson) => cp.id !== id
        ),
      }));
      return;
    }

    try {
      // Check if this is an existing contact person (not a new one with temp ID)
      const isExistingContact = originalContactPersons.some(
        (originalCP) => originalCP.id === id
      );

      if (isExistingContact) {
        // DELETE request for existing contact person
        const response = await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/customer-contact/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200 && response.status !== 204) {
          throw new Error("Failed to delete contact person");
        }

        console.log("Contact person deleted successfully:", id);
      }

      // Remove from UI state (both for existing and new contact persons)
      setFormData((prev: typeof formData) => ({
        ...prev,
        contactPersons: prev.contactPersons.filter(
          (cp: ContactPerson) => cp.id !== id
        ),
      }));
    } catch (error) {
      console.error("Error removing contact person:", error);
      // You might want to show a toast notification or error message here
      // For now, we'll still remove from UI even if API call fails
      setFormData((prev: typeof formData) => ({
        ...prev,
        contactPersons: prev.contactPersons.filter(
          (cp: ContactPerson) => cp.id !== id
        ),
      }));
    }
  };

  // Branch Management
  const addBranch = () => {
    const newBranch: Branch = {
      id: "",
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
      isEditing: true,
      gstNumber: "",
    };
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: [
        ...prev.branches.map((branch: Branch) => ({
          ...branch,
          isEditing: false,
        })),
        newBranch,
      ],
    }));
  };

  const copyFromCustomerDetails = (branchId: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) =>
        branch.id === branchId
          ? {
            ...branch,
            contactNumber: prev.contactNo,
            email: prev.email,
            country: prev.country,
            currency: prev.currency.length > 0 ? prev.currency[0] : "",
            state: prev.state,
            district: prev.district,
            city: prev.city,
            pincode: prev.pincode,
            contactPersons: [...prev.contactPersons],
            gstNumber: prev.gstNumber || branch.gstNumber || "",
          }
          : branch
      ),
    }));
  };

  const updateBranch = (id: string, field: string, value: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) => {
        if (branch.id === id) {
          const updatedBranch = { ...branch, [field]: value };

          // Handle cascade updates
          if (field === "state") {
            // When state changes, reset district and city
            updatedBranch.district = "";
            updatedBranch.city = "";
          } else if (field === "district") {
            // When district changes, reset city
            updatedBranch.city = "";
          }

          return updatedBranch;
        }
        return branch;
      }),
    }));

    // Validate branch field
    const fieldRules: Record<string, any> = {
      branchName: validationRules.branchBranchName,
      contactNumber: validationRules.branchContactNumber,
      email: validationRules.branchEmail,
      country: validationRules.branchCountry,
      currency: validationRules.branchCurrency,
      state: validationRules.branchState,
      district: validationRules.branchDistrict,
      city: validationRules.branchCity,
      pincode: validationRules.branchPincode,
    };

    const rule = fieldRules[field];
    if (rule) {
      const fieldError = validateField(
        `branch${field.charAt(0).toUpperCase() + field.slice(1)}`,
        value,
        rule
      );
      setBranchErrors((prev) => {
        const newErrors = { ...prev };
        if (!newErrors[id]) {
          newErrors[id] = {};
        }
        if (fieldError) {
          newErrors[id][field] = fieldError;
        } else {
          delete newErrors[id][field];
          if (Object.keys(newErrors[id]).length === 0) {
            delete newErrors[id];
          }
        }
        return newErrors;
      });
    }
  };

  const removeBranch = async (id: string) => {
    if (!isEditMode) {
      // In non-edit mode, just remove from state
      setFormData((prev: typeof formData) => ({
        ...prev,
        branches: prev.branches.filter((branch: Branch) => branch.id !== id),
      }));
      return;
    }

    try {
      // Check if this is an existing branch (not a new one with temp ID)
      console.log("Removing branch:", originalBranches);
      const isExistingBranch = originalBranches.some(
        (originalBranch) => originalBranch.id === id
      );

      if (isExistingBranch) {
        // DELETE request for existing branch
        const response = await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/customer-branch/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200 && response.status !== 204) {
          throw new Error("Failed to delete branch");
        }

        console.log("Branch deleted successfully:", id);
      }

      // Remove from UI state (both for existing and new branches)
      setFormData((prev: typeof formData) => ({
        ...prev,
        branches: prev.branches.filter((branch: Branch) => branch.id !== id),
      }));
    } catch (error) {
      console.error("Error removing branch:", error);
      // You might want to show a toast notification or error message here
      // For now, we'll still remove from UI even if API call fails
      setFormData((prev: typeof formData) => ({
        ...prev,
        branches: prev.branches.filter((branch: Branch) => branch.id !== id),
      }));
    }
  };

  const editBranch = (id: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) =>
        branch.id === id
          ? { ...branch, isEditing: true }
          : { ...branch, isEditing: false }
      ),
    }));
  };

  const saveBranch = async (id: string) => {
    if (!isEditMode) {
      // In non-edit mode, just toggle isEditing
      setFormData((prev: typeof formData) => ({
        ...prev,
        branches: prev.branches.map((branch: Branch) =>
          branch.id === id ? { ...branch, isEditing: false } : branch
        ),
      }));
      return;
    }

    try {
      const branch = formData.branches.find((b: Branch) => b.id === id);
      if (!branch) return;

      // Check if this is a new branch (has temp ID from Date.now())
      const isNewBranch = !originalBranches.some(
        (originalBranch) => originalBranch.id === id
      );

      if (isNewBranch) {
        // POST request for new branch - use branch key map
        const payload: Record<string, any> = {
          customer_id: formData.id,
        };

        // Map UI fields to backend fields using branchKeymap
        Object.keys(branchKeymap).forEach((uiKey) => {
          if (uiKey !== "id" && branch[uiKey as keyof Branch] !== undefined) {
            const backendKey = branchKeymap[uiKey as keyof typeof branchKeymap];
            payload[backendKey] = branch[uiKey as keyof Branch];
          }
        });

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/customer-branch`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200 && response.status !== 201) {
          throw new Error("Failed to create branch");
        }

        // console.log("Branch created successfully:", response.data);
        // get actual backend branch id (adapt key based on response shape)
        const actualBranchId = response.data.data?.customer_branch_id || response.data.data?.id;

        // update branch id inside formData so future contact person POST uses actual id
        setFormData((prev: any) => ({
          ...prev,
          branches: prev.branches.map((b: any) =>
            b.id === id ? { ...b, id: actualBranchId } : b
          ),
        }));

        console.log("Branch ID replaced (temp → actual):", id, "→", actualBranchId);

      } else {
        // PUT request for existing branch
        const originalBranch = originalBranches.find((b) => b.id === id);
        const changedFields: Record<string, any> = {};

        // Compare fields and build changed fields object using branchKeymap
        if (originalBranch) {
          Object.keys(branchKeymap).forEach((uiKey) => {
            if (
              uiKey !== "id" &&
              branch[uiKey as keyof Branch] !==
              originalBranch[uiKey as keyof Branch]
            ) {
              const backendKey =
                branchKeymap[uiKey as keyof typeof branchKeymap];
              changedFields[backendKey] = branch[uiKey as keyof Branch];
            }
          });
        }

        // Only make API call if there are changes
        if (Object.keys(changedFields).length > 0) {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/customer-branch/${id}`,
            changedFields,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status !== 200) {
            throw new Error("Failed to update branch");
          }

          console.log("Branch updated successfully:", response.data);
        }
      }

      // Update UI state
      setFormData((prev: typeof formData) => ({
        ...prev,
        branches: prev.branches.map((branch: Branch) =>
          branch.id === id ? { ...branch, isEditing: false } : branch
        ),
      }));
    } catch (error) {
      console.error("Error saving branch:", error);
      // You might want to show a toast notification or error message here
    }
  };

  const addBranchContactPerson = (branchId: string) => {
    const newContactPerson: ContactPerson = {
      id: Date.now().toString(),
      name: "",
      phone: "",
      email: "",
      designation: "",
      isEditing: true,
    };
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) =>
        branch.id === branchId
          ? {
            ...branch,
            contactPersons: [
              ...branch.contactPersons.map((person: ContactPerson) => ({
                ...person,
                isEditing: false,
              })),
              newContactPerson,
            ],
          }
          : branch
      ),
    }));
  };

  const editBranchContactPerson = (branchId: string, contactId: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) =>
        branch.id === branchId
          ? {
            ...branch,
            contactPersons: branch.contactPersons.map(
              (person: ContactPerson) =>
                person.id === contactId
                  ? { ...person, isEditing: true }
                  : { ...person, isEditing: false }
            ),
          }
          : branch
      ),
    }));
  };

  const saveBranchContactPerson = async (
    branchId: string,
    contactId: string
  ) => {
    if (!isEditMode) {
      // In non-edit mode, just toggle isEditing
      setFormData((prev: typeof formData) => ({
        ...prev,
        branches: prev.branches.map((branch: Branch) =>
          branch.id === branchId
            ? {
              ...branch,
              contactPersons: branch.contactPersons.map(
                (person: ContactPerson) =>
                  person.id === contactId
                    ? { ...person, isEditing: false }
                    : person
              ),
            }
            : branch
        ),
      }));
      return;
    }

    try {
      const branch = formData.branches.find((b: Branch) => b.id === branchId);
      if (!branch) return;

      const contactPerson = branch.contactPersons.find(
        (cp: ContactPerson) => cp.id === contactId
      );
      if (!contactPerson) return;

      // Check if this is a new contact person (has temp ID from Date.now())
      // Compare with original branches to see if this contact person existed
      const originalBranch = originalBranches.find((ob) => ob.id === branchId);
      const isNewContact = !originalBranch?.contactPersons?.some(
        (originalCP) => originalCP.id === contactId
      );

      if (isNewContact) {
        // POST request for new branch contact person
        const payload: Record<string, any> = {
          customer_branch_id: branchId,
        };

        // Map UI fields to backend fields using branchContactKeymap
        Object.keys(branchContactKeymap).forEach((uiKey) => {
          if (
            uiKey !== "id" &&
            contactPerson[uiKey as keyof ContactPerson] !== undefined
          ) {
            const backendKey =
              branchContactKeymap[uiKey as keyof typeof branchContactKeymap];
            payload[backendKey] = contactPerson[uiKey as keyof ContactPerson];
          }
        });

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/customer-branch-contact`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200 && response.status !== 201) {
          throw new Error("Failed to create branch contact person");
        }

        console.log(
          "Branch contact person created successfully:",
          response.data
        );
      } else {
        // PUT request for existing branch contact person
        const originalContact = originalBranch?.contactPersons?.find(
          (cp) => cp.id === contactId
        );
        const changedFields: Record<string, any> = {};

        // Compare fields and build changed fields object using branchContactKeymap
        if (originalContact) {
          Object.keys(branchContactKeymap).forEach((uiKey) => {
            if (
              uiKey !== "id" &&
              contactPerson[uiKey as keyof ContactPerson] !==
              originalContact[uiKey as keyof ContactPerson]
            ) {
              const backendKey =
                branchContactKeymap[uiKey as keyof typeof branchContactKeymap];
              changedFields[backendKey] =
                contactPerson[uiKey as keyof ContactPerson];
            }
          });
        }

        // Only make API call if there are changes
        if (Object.keys(changedFields).length > 0) {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL
            }/customer-branch-contact/${contactId}`,
            changedFields,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status !== 200) {
            throw new Error("Failed to update branch contact person");
          }

          console.log(
            "Branch contact person updated successfully:",
            response.data
          );
        }
      }

      // Update UI state
      setFormData((prev: typeof formData) => ({
        ...prev,
        branches: prev.branches.map((branch: Branch) =>
          branch.id === branchId
            ? {
              ...branch,
              contactPersons: branch.contactPersons.map(
                (person: ContactPerson) =>
                  person.id === contactId
                    ? { ...person, isEditing: false }
                    : person
              ),
            }
            : branch
        ),
      }));
    } catch (error) {
      console.error("Error saving branch contact person:", error);
      // You might want to show a toast notification or error message here
    }
  };

  const updateBranchContactPerson = (
    branchId: string,
    contactId: string,
    field: string,
    value: string
  ) => {
    setFormData((prev: typeof formData) => ({
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

    // Validate branch contact person field
    const fieldRules: Record<string, any> = {
      name: validationRules.contactPersonName,
      phone: validationRules.contactPersonPhone,
      email: validationRules.contactPersonEmail,
      designation: validationRules.contactPersonDesignation,
    };

    const rule = fieldRules[field];
    if (rule) {
      const fieldError = validateField(
        `contactPerson${field.charAt(0).toUpperCase() + field.slice(1)}`,
        value,
        rule
      );
      setBranchErrors((prev) => {
        const newErrors = { ...prev };
        if (!newErrors[branchId]) {
          newErrors[branchId] = {};
        }
        const contactKey = `contactPerson_${contactId}_${field}`;
        if (fieldError) {
          newErrors[branchId][contactKey] = fieldError;
        } else {
          delete newErrors[branchId][contactKey];
          if (Object.keys(newErrors[branchId]).length === 0) {
            delete newErrors[branchId];
          }
        }
        return newErrors;
      });
    }
  };

  const removeBranchContactPerson = async (
    branchId: string,
    contactId: string
  ) => {
    if (!isEditMode) {
      // In non-edit mode, just remove from state
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
      return;
    }

    try {
      // Check if this is an existing branch contact person (not a new one with temp ID)
      const originalBranch = originalBranches.find((ob) => ob.id === branchId);
      const isExistingContact = originalBranch?.contactPersons?.some(
        (originalCP) => originalCP.id === contactId
      );

      if (isExistingContact) {
        // DELETE request for existing branch contact person
        const response = await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL
          }/customer-branch-contact/${contactId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200 && response.status !== 204) {
          throw new Error("Failed to delete branch contact person");
        }

        console.log("Branch contact person deleted successfully:", contactId);
      }

      // Remove from UI state (both for existing and new branch contact persons)
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
    } catch (error) {
      console.error("Error removing branch contact person:", error);
      // You might want to show a toast notification or error message here
      // For now, we'll still remove from UI even if API call fails
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
    }
  };

  // File validation functions
  const validateFileSize = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  };

  const validateFileType = (file: File): boolean => {
    const allowedTypes = [
      ".pdf",
      ".doc",
      ".docx",
      ".jpg",
      ".jpeg",
      ".png",
      ".dwg",
      ".xls",
      ".xlsx",
    ];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension);
  };

  // File Management
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFileErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      // Validate file type
      if (!validateFileType(file)) {
        newFileErrors.push(
          `${file.name}: Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG, DWG, XLS, XLSX`
        );
        return;
      }

      // Validate file size
      if (!validateFileSize(file)) {
        newFileErrors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      validFiles.push(file);
    });

    setFileErrors(newFileErrors);
    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // Upload files for customer
  const uploadFilesForCustomer = async (
    customerId: string,
    files: File[],
    onProgress?: (percent: number) => void
  ) => {
    if (!customerId || files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/customer-file/${customerId}/files`,
      formData,
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

  // Remove uploaded file (newly added in this session)
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove file from initial files (already uploaded in edit mode)
  const removeInitialFile = (index: number) => {
    setInitialFiles((prev) => prev.filter((_, i) => i !== index));
    // If the active tab is deleted, move to previous tab if possible
    setActiveFileTab((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const isEditMode = Boolean(initialData);

  const handleNext = async () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      // Validate main form fields
      const currentErrors: ValidationErrors = {};

      // Validate required fields for step 1
      const step1Fields = [
        "businessName",
        "contactNo",
        "email",
        "country",
        "currency",
        "state",
        "district",
        "city",
        "customerType",
        "customerPotential",
        "pincode",
      ];

      step1Fields.forEach((fieldName) => {
        const rule = validationRules[fieldName as keyof typeof validationRules];
        if (rule) {
          const error = validateField(
            fieldName,
            formData[fieldName as keyof typeof formData],
            rule
          );
          if (error) {
            currentErrors[fieldName] = error;
          }
        }
      });

      // Validate optional bank fields if provided
      const bankFields = [
        "panNumber",
        "tanNumber",
        "gstNumber",
        "bankName",
        "bankAccountNumber",
        "branchName",
        "ifscCode",
      ];
      bankFields.forEach((fieldName) => {
        const rule = validationRules[fieldName as keyof typeof validationRules];
        const value = formData[fieldName as keyof typeof formData];
        if (rule && value) {
          // Only validate if value is provided
          const error = validateField(fieldName, value, rule);
          if (error) {
            currentErrors[fieldName] = error;
          }
        }
      });

      if (formData.contactPersons.length === 0) {
        alert("Please add at least one contact person before proceeding.");
        return;
      }

      // Validate contact persons
      const contactPersonValidationErrors: Record<string, ValidationErrors> =
        {};
      formData.contactPersons.forEach((contactPerson: ContactPerson) => {
        const contactErrors = validateContactPerson(contactPerson);
        if (hasErrors(contactErrors)) {
          contactPersonValidationErrors[contactPerson.id] = contactErrors;
        }
      });

      // Update validation state
      setValidationErrors(currentErrors);
      setContactPersonErrors(contactPersonValidationErrors);

      // Check if there are any validation errors
      if (
        hasErrors(currentErrors) ||
        Object.keys(contactPersonValidationErrors).length > 0
      ) {
        const firstError =
          getFirstError(currentErrors) ||
          (Object.keys(contactPersonValidationErrors).length > 0
            ? "Please fix contact person validation errors"
            : null);

        if (firstError) {
          alert(`Validation Error: ${firstError}`);
        }
        return;
      }
    } else if (currentStep === 2) {
      // Validate branches
      const branchValidationErrors: Record<string, ValidationErrors> = {};
      formData.branches.forEach((branch: Branch) => {
        const branchFieldErrors = validateBranch(branch);

        // Validate branch contact persons
        branch.contactPersons.forEach((contactPerson: ContactPerson) => {
          const contactErrors = validateContactPerson(contactPerson);
          Object.keys(contactErrors).forEach((field) => {
            const contactKey = `contactPerson_${contactPerson.id}_${field}`;
            branchFieldErrors[contactKey] = contactErrors[field];
          });
        });

        if (hasErrors(branchFieldErrors)) {
          branchValidationErrors[branch.id] = branchFieldErrors;
        }
      });

      setBranchErrors(branchValidationErrors);

      if (Object.keys(branchValidationErrors).length > 0) {
        alert("Please fix branch validation errors before proceeding");
        return;
      }
    }

    // If we're in register mode (not edit mode) and on step 1
    if (!isEditMode && currentStep === 1) {
      setIsLoading(true);
      try {
        // Step 1: Create customer with all fields except contact persons
        const customerPayload: Record<string, any> = {};

        // Map UI fields to backend fields using keymap (excluding contact persons)
        Object.keys(keymap).forEach((uiKey) => {
          if (formData[uiKey as keyof typeof formData] !== undefined) {
            const backendKey = keymap[uiKey as keyof typeof keymap];
            customerPayload[backendKey] =
              formData[uiKey as keyof typeof formData];
          }
        });

        // Set approval_status to DRAFT if branches are not completed, otherwise use default (PENDING)
        if (formData.branches.length === 0) {
          customerPayload.approval_status = "DRAFT";
        }

        // Call POST API for customer
        const customerResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/customer`,
          customerPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (
          customerResponse.status !== 200 &&
          customerResponse.status !== 201
        ) {
          throw new Error("Failed to create customer");
        }

        // ------------------------------------------------------------------------------------------For notifications
        try {
          await sendNotification({
            receiver_ids: ['admin'],
            title: `CRM - New Customer Registration : ${formData.business_name || 'Customer'}`,
            message: `Customer ${formData.business_name || 'Customer'} registered successfully and sent for approval!by ${userData?.name || 'a user'}`,
            service_type: 'CRM',
            link: '/customers',
            sender_id: userRole || 'user',
            access: {
              module: "CRM",
              menu: "customers",
            }
          });
          console.log(`Notification sent for CRM Customer ${formData.business_name || 'Customer'}`);
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
          // Continue with the flow even if notification fails
        }
        // ----------------------------------------------------------------------------------------

        console.log("Customer created successfully:", customerResponse.data);

        // Store the customer ID from the response
        const customerId = customerResponse.data.data.customer_id;
        setCreatedCustomerId(customerId);

        // Update formData with the customer ID
        setFormData((prev: typeof formData) => ({ ...prev, id: customerId }));

        // Step 2: Create contact persons in bulk if any exist
        if (formData.contactPersons.length > 0) {
          const contactPersonsPayload = formData.contactPersons.map(
            (contact: any) => ({
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              designation: contact.designation || "",
              customer_id: customerId,
            })
          );
          console.log("Creating contact persons:", contactPersonsPayload);

          const contactResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/customer-contact/bulk`,
            contactPersonsPayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (
            contactResponse.status !== 200 &&
            contactResponse.status !== 201
          ) {
            throw new Error("Failed to create contact persons");
          }

          console.log(
            "Contact persons created successfully:",
            contactResponse.data
          );
        }

        // Move to next step
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error in step 1 API calls:", error);
        // You might want to show a toast notification or error message here
        // For now, we'll prevent moving to the next step
      } finally {
        setIsLoading(false);
      }
    } else if (!isEditMode && currentStep === 2) {
      // Step 2: Create branches and branch contact persons
      setIsLoading(true);
      try {
        // Step 1: Create branches in bulk if any exist
        if (formData.branches.length > 0) {
          const branchesPayload = formData.branches.map((branch: Branch) => {
            const payload: Record<string, any> = {
              customer_id: formData.id,
            };

            // Map UI fields to backend fields using branchKeymap (excluding contact persons)
            Object.keys(branchKeymap).forEach((uiKey) => {
              if (
                uiKey !== "id" &&
                branch[uiKey as keyof Branch] !== undefined
              ) {
                const backendKey =
                  branchKeymap[uiKey as keyof typeof branchKeymap];
                payload[backendKey] = branch[uiKey as keyof Branch];
              }
            });

            return payload;
          });

          console.log("Creating branches:", branchesPayload);

          const branchResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/customer-branch/bulk`,
            branchesPayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (branchResponse.status !== 200 && branchResponse.status !== 201) {
            throw new Error("Failed to create branches");
          }

          console.log("Branches created successfully:", branchResponse.data);

          // Store the created branches
          const createdBranchesData =
            branchResponse.data.data || branchResponse.data;
          setCreatedBranches(createdBranchesData);

          // Update customer status from DRAFT to PENDING since branches are now completed
          if (createdCustomerId) {
            try {
              await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/customer/${createdCustomerId}`,
                { approval_status: "PENDING" },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log("Customer status updated to PENDING");
            } catch (updateError) {
              console.error("Failed to update customer status:", updateError);
            }
          }

          // Step 2: Create branch contact persons in bulk if any exist
          const allBranchContactPersons: any[] = [];

          formData.branches.forEach((branch: Branch, branchIndex: number) => {
            if (branch.contactPersons && branch.contactPersons.length > 0) {
              // Get the corresponding created branch ID
              const createdBranchId =
                createdBranchesData[branchIndex]?.id ||
                createdBranchesData[branchIndex]?.customer_branch_id;

              branch.contactPersons.forEach((contact: ContactPerson) => {
                const contactPayload: Record<string, any> = {
                  customer_branch_id: createdBranchId,
                };

                // Map UI fields to backend fields using branchContactKeymap
                Object.keys(branchContactKeymap).forEach((uiKey) => {
                  if (
                    uiKey !== "id" &&
                    contact[uiKey as keyof ContactPerson] !== undefined
                  ) {
                    const backendKey =
                      branchContactKeymap[
                      uiKey as keyof typeof branchContactKeymap
                      ];
                    contactPayload[backendKey] =
                      contact[uiKey as keyof ContactPerson];
                  }
                });

                allBranchContactPersons.push(contactPayload);
              });
            }
          });

          if (allBranchContactPersons.length > 0) {
            console.log(
              "Creating branch contact persons:",
              allBranchContactPersons
            );

            const branchContactResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL
              }/customer-branch-contact/bulk`,
              allBranchContactPersons,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (
              branchContactResponse.status !== 200 &&
              branchContactResponse.status !== 201
            ) {
              throw new Error("Failed to create branch contact persons");
            }

            console.log(
              "Branch contact persons created successfully:",
              branchContactResponse.data
            );
          }
        }

        // Move to next step
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error in step 2 API calls:", error);
        // You might want to show a toast notification or error message here
        // For now, we'll prevent moving to the next step
      } finally {
        setIsLoading(false);
      }
    } else if ( currentStep === 3) {
      // Step 3: Upload files
      console.log("Uploading files for customer...");
      const customerId = createdCustomerId || formData.id;

      if (!customerId) {
        console.error("No customerId found. Cannot upload files.");
        return;
      }

      if (uploadedFiles.length === 0) {
        // No files to upload, just close the modal
        // handleSubmit();
        return;
      }

      setIsLoading(true);
      try {
        await uploadFilesForCustomer(customerId, uploadedFiles, (percent) => {
          console.log("Upload progress:", percent);
        });

        console.log("Files uploaded successfully");
        // Close modal after successful upload
        // handleSubmit();
        onClose();
      } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload files. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // For edit mode or other steps, just move to next step
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Breadcrumb navigation handler
  const handleBreadcrumbClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const handleEditSubmit = async () => {
    try {
      const backendPayload = (
        Object.keys(fieldChanges) as Array<keyof typeof keymap>
      ).reduce((acc: Record<string, any>, key) => {
        const backendKey = keymap[key];
        if (backendKey) {
          acc[backendKey] = fieldChanges[key];
        }
        return acc;
      }, {});

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/customer/${formData.id}`,
        backendPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update customer");
      }

      console.log("Customer updated successfully:", response.data);
      handleClose();
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Perform final validation before submission
    const currentErrors: ValidationErrors = {};

    // Validate all main form fields
    Object.keys(validationRules).forEach((fieldName) => {
      const rule = validationRules[fieldName as keyof typeof validationRules];
      const value = formData[fieldName as keyof typeof formData];

      // Skip contact person and branch specific validations here as they're handled separately
      if (
        !fieldName.startsWith("contactPerson") &&
        !fieldName.startsWith("branch")
      ) {
        const error = validateField(fieldName, value, rule);
        if (error) {
          currentErrors[fieldName] = error;
        }
      }
    });

    // Validate contact persons
    const contactPersonValidationErrors: Record<string, ValidationErrors> = {};
    formData.contactPersons.forEach((contactPerson: ContactPerson) => {
      const contactErrors = validateContactPerson(contactPerson);
      if (hasErrors(contactErrors)) {
        contactPersonValidationErrors[contactPerson.id] = contactErrors;
      }
    });

    // Validate branches
    const branchValidationErrors: Record<string, ValidationErrors> = {};
    formData.branches.forEach((branch: Branch) => {
      const branchFieldErrors = validateBranch(branch);

      // Validate branch contact persons
      branch.contactPersons.forEach((contactPerson: ContactPerson) => {
        const contactErrors = validateContactPerson(contactPerson);
        Object.keys(contactErrors).forEach((field) => {
          const contactKey = `contactPerson_${contactPerson.id}_${field}`;
          branchFieldErrors[contactKey] = contactErrors[field];
        });
      });

      if (hasErrors(branchFieldErrors)) {
        branchValidationErrors[branch.id] = branchFieldErrors;
      }
    });

    // Update validation states
    setValidationErrors(currentErrors);
    setContactPersonErrors(contactPersonValidationErrors);
    setBranchErrors(branchValidationErrors);

    // Check if there are any validation errors
    const hasMainErrors = hasErrors(currentErrors);
    const hasContactErrors =
      Object.keys(contactPersonValidationErrors).length > 0;
    const hasBranchErrors = Object.keys(branchValidationErrors).length > 0;

    if (hasMainErrors || hasContactErrors || hasBranchErrors) {
      const firstError =
        getFirstError(currentErrors) ||
        (hasContactErrors
          ? "Please fix contact person validation errors"
          : null) ||
        (hasBranchErrors ? "Please fix branch validation errors" : null);

      if (firstError) {
        alert(`Validation Error: ${firstError}`);
      }
      return;
    }

    const finalData = {
      ...formData,
      uploadedFiles: [
        ...initialFiles,
        ...uploadedFiles.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      ],
      status: "Pending Approval",
      registrationDate: new Date().toISOString(),
    };
    onSubmit(finalData);
    // Reset form only if not in edit mode
    if (!isEditMode) {
      setCurrentStep(1);
      setFormData({
        businessName: "",
        contactNo: "",
        email: "",
        country: "India",
        currency: [],
        state: "",
        district: "",
        city: "",
        customerType: "",
        customerPotential: "",
        pincode: "",
        active: true,
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
      });
      setUploadedFiles([]);
      setInitialFiles([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Register New Customer
            </h3>
            <p className="text-sm text-gray-500">Step {currentStep} of 3</p>
          </div>
          <button
            onClick={() => {
              handleClose();
              setNewContactPersons([]);
            }}
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
                <button
                  type="button"
                  disabled={!isEditMode}
                  onClick={() => isEditMode && handleBreadcrumbClick(step.id)}
                  className={`flex items-center space-x-2 focus:outline-none ${currentStep === step.id
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step.id
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
                {/* Business Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Business Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.businessName
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                        placeholder="Enter business name"
                      />
                      {validationErrors.businessName && (
                        <p className="text-red-500 text-xs mt-1">
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.contactNo
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                        placeholder="+91 98765 43210"
                      />
                      {validationErrors.contactNo && (
                        <p className="text-red-500 text-xs mt-1">
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.email
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                        placeholder="business@company.com"
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency * (Hold Ctrl/Cmd to select multiple)
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleCurrencyChange}
                        multiple
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                      >
                        {currencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                      {formData.currency.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Selected: {formData.currency.join(", ")}
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.state
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                        <p className="text-red-500 text-xs mt-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Type *
                      </label>
                      <select
                        name="customerType"
                        value={formData.customerType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Type</option>
                        {customerTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Potential *
                      </label>
                      <select
                        name="customerPotential"
                        value={formData.customerPotential}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Potential</option>
                        {customerPotentials.map((potential) => (
                          <option key={potential} value={potential}>
                            {potential}
                          </option>
                        ))}
                      </select>
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.pincode
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                        placeholder="400001"
                      />
                      {validationErrors.pincode && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors.pincode}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={() => handleToggle("active")}
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
                        PAN Number
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.panNumber
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          }`}
                        placeholder="ABCDE1234F"
                      />
                      {validationErrors.panNumber && (
                        <p className="text-red-500 text-xs mt-1">
                          {validationErrors.panNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TAN Number
                      </label>
                      <input
                        type="text"
                        name="tanNumber"
                        value={formData.tanNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ABCD12345E"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="27ABCDE1234F1Z5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="State Bank of India"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1234567890123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mumbai Main Branch"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="SBIN0001234"
                      />
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
                      disabled={formData.contactPersons.some(
                        (person: ContactPerson) => person.isEditing
                      )}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => removeContactPerson(person.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {person.isEditing ? (
                              <button
                                type="button"
                                onClick={() => saveContactPerson(person.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => editContactPerson(person.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
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
                              disabled={!person.isEditing}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                                ? "bg-gray-50 cursor-not-allowed border-gray-300"
                                : contactPersonErrors[person.id]?.name
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                }`}
                              placeholder="Contact person name"
                            />
                            {contactPersonErrors[person.id]?.name && (
                              <p className="text-red-500 text-xs mt-1">
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
                              disabled={!person.isEditing}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                                ? "bg-gray-50 cursor-not-allowed border-gray-300"
                                : contactPersonErrors[person.id]?.phone
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                }`}
                              placeholder="+91 98765 43210"
                            />
                            {contactPersonErrors[person.id]?.phone && (
                              <p className="text-red-500 text-xs mt-1">
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
                              disabled={!person.isEditing}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                                ? "bg-gray-50 cursor-not-allowed border-gray-300"
                                : contactPersonErrors[person.id]?.email
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                }`}
                              placeholder="contact@company.com"
                            />
                            {contactPersonErrors[person.id]?.email && (
                              <p className="text-red-500 text-xs mt-1">
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
                              value={person.designation}
                              onChange={(e) =>
                                updateContactPerson(
                                  person.id,
                                  "designation",
                                  e.target.value
                                )
                              }
                              disabled={!person.isEditing}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                                ? "bg-gray-50 cursor-not-allowed border-gray-300"
                                : contactPersonErrors[person.id]?.designation
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                }`}
                              placeholder="Manager, CEO, etc."
                            />
                            {contactPersonErrors[person.id]?.designation && (
                              <p className="text-red-500 text-xs mt-1">
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
                    disabled={formData.branches.some(
                      (branch: Branch) => branch.isEditing
                    )}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Branch
                  </button>
                </div>

                {formData.branches.map((branch: Branch, index: number) => (
                  console.log("branch", branch),
                  <div
                    key={branch.id}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-lg font-medium text-gray-900">
                        Branch {index + 1}
                      </h5>
                      <div className="flex space-x-2">
                        {!isEditMode && (
                          <button
                            type="button"
                            onClick={() => copyFromCustomerDetails(branch.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy from Customer Details
                          </button>
                        )}
                        {branch.isEditing ? (
                          <button
                            type="button"
                            onClick={() => saveBranch(branch.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => editBranch(branch.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
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
                          disabled={!branch.isEditing}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!branch.isEditing
                            ? "bg-gray-50 cursor-not-allowed border-gray-300"
                            : branchErrors[branch.id]?.branchName
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          placeholder="Branch name"
                        />
                        {branchErrors[branch.id]?.branchName && (
                          <p className="text-red-500 text-xs mt-1">
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
                          disabled={!branch.isEditing}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!branch.isEditing
                            ? "bg-gray-50 cursor-not-allowed border-gray-300"
                            : branchErrors[branch.id]?.contactNumber
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          placeholder="+91 98765 43210"
                        />
                        {branchErrors[branch.id]?.contactNumber && (
                          <p className="text-red-500 text-xs mt-1">
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
                          disabled={!branch.isEditing}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!branch.isEditing
                            ? "bg-gray-50 cursor-not-allowed border-gray-300"
                            : branchErrors[branch.id]?.email
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          placeholder="branch@company.com"
                        />
                        {branchErrors[branch.id]?.email && (
                          <p className="text-red-500 text-xs mt-1">
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
                          disabled={!branch.isEditing}
                          required
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!branch.isEditing
                            ? "bg-gray-50 cursor-not-allowed"
                            : ""
                            }`}
                        >
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
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
                          disabled={!branch.isEditing || formData.currency.length === 0}
                          required
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!branch.isEditing || formData.currency.length === 0
                            ? "bg-gray-50 cursor-not-allowed"
                            : ""
                            }`}
                        >
                          <option value="">Select Currency</option>
                          {formData.currency.map((currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ))}
                        </select>
                        {formData.currency.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Please select currencies in Step 1 first
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GST Number *
                        </label>
                        <input
                          name="gstNumber"
                          value={branch.gstNumber || ""}
                          onChange={(e) => updateBranch(branch.id, "gstNumber", e.target.value)}
                          placeholder="GST Number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
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
                          disabled={!branch.isEditing}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!branch.isEditing
                            ? "bg-gray-50 cursor-not-allowed border-gray-300"
                            : branchErrors[branch.id]?.state
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                          <p className="text-red-500 text-xs mt-1">
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
                          disabled={!branch.state || !branch.isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!branch.state || !branch.isEditing
                            ? "bg-gray-100 cursor-not-allowed border-gray-300"
                            : branchErrors[branch.id]?.district
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                          <p className="text-red-500 text-xs mt-1">
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
                          disabled={!branch.district || !branch.isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!branch.district || !branch.isEditing
                            ? "bg-gray-100 cursor-not-allowed border-gray-300"
                            : branchErrors[branch.id]?.city
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                          <p className="text-red-500 text-xs mt-1">
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
                          disabled={!branch.isEditing}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!branch.isEditing
                            ? "bg-gray-50 cursor-not-allowed border-gray-300"
                            : branchErrors[branch.id]?.pincode
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          placeholder="400001"
                        />
                        {branchErrors[branch.id]?.pincode && (
                          <p className="text-red-500 text-xs mt-1">
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
                          disabled={
                            !branch.isEditing ||
                            branch.contactPersons.some(
                              (person: ContactPerson) => person.isEditing
                            ) ||
                            (isEditMode && !originalBranches.some(
                              (originalBranch) => originalBranch.id === branch.id
                            ))
                          }
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Contact
                        </button>
                      </div>

                      {branch.contactPersons.map(
                        (person: ContactPerson, personIndex: number) => (
                          <div
                            key={person.id}
                            className="border border-gray-100 rounded p-3 mb-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">
                                Contact {personIndex + 1}
                              </span>
                              <div className="flex space-x-2">
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
                                {person.isEditing ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      saveBranchContactPerson(
                                        branch.id,
                                        person.id
                                      )
                                    }
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <Save className="h-3 w-3" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      editBranchContactPerson(
                                        branch.id,
                                        person.id
                                      )
                                    }
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                )}
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
                                  disabled={!person.isEditing}
                                  className={`w-full px-2 py-1 border rounded text-sm ${!person.isEditing
                                    ? "bg-gray-50 cursor-not-allowed border-gray-300"
                                    : branchErrors[branch.id]?.[
                                      `contactPerson_${person.id}_name`
                                    ]
                                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    }`}
                                  placeholder="Name"
                                />
                                {branchErrors[branch.id]?.[
                                  `contactPerson_${person.id}_name`
                                ] && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {
                                        branchErrors[branch.id][
                                        `contactPerson_${person.id}_name`
                                        ]
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
                                  disabled={!person.isEditing}
                                  className={`w-full px-2 py-1 border rounded text-sm ${!person.isEditing
                                    ? "bg-gray-50 cursor-not-allowed border-gray-300"
                                    : branchErrors[branch.id]?.[
                                      `contactPerson_${person.id}_phone`
                                    ]
                                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    }`}
                                  placeholder="Phone"
                                />
                                {branchErrors[branch.id]?.[
                                  `contactPerson_${person.id}_phone`
                                ] && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {
                                        branchErrors[branch.id][
                                        `contactPerson_${person.id}_phone`
                                        ]
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
                                  disabled={!person.isEditing}
                                  className={`w-full px-2 py-1 border rounded text-sm ${!person.isEditing
                                    ? "bg-gray-50 cursor-not-allowed border-gray-300"
                                    : branchErrors[branch.id]?.[
                                      `contactPerson_${person.id}_email`
                                    ]
                                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    }`}
                                  placeholder="Email"
                                />
                                {branchErrors[branch.id]?.[
                                  `contactPerson_${person.id}_email`
                                ] && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {
                                        branchErrors[branch.id][
                                        `contactPerson_${person.id}_email`
                                        ]
                                      }
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>
                        )
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
                    Upload Customer Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload business registration, tax certificates, and other
                      relevant documents
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supported formats: DOC, DOCX, PDF, JPG, JPEG, PNG, DWG, XLS, XLSX (Max
                      10MB per file)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.dwg,.xls,.xlsx"
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

                  {/* Display file validation errors */}
                  {fileErrors.length > 0 && (
                    <div className="mt-2">
                      {fileErrors.map((error, index) => (
                        <p
                          key={index}
                          className="text-red-500 text-xs mt-1 flex items-center"
                        >
                          <span className="mr-1">⚠</span>
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tabs for initial files (edit mode) and newly uploaded files */}
                {(initialFiles.length > 0 || uploadedFiles.length > 0) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Files
                    </h4>
                    <div className="border-b border-gray-200 mb-2 flex flex-wrap">
                      {initialFiles.map((file, idx) => (
                        console.log("Initial file:", file),
                        console.log("Active file tab:", uploadedFiles),
                        <div
                          key={file.original_name + idx}
                          className={`flex items-center px-3 py-1 mr-2 mb-2 rounded-t cursor-pointer ${activeFileTab === idx
                            ? "bg-blue-100 border-t-2 border-blue-500"
                            : "bg-gray-100"
                            }`}
                          onClick={() => setActiveFileTab(idx)}
                        >
                          <span className="text-xs font-medium text-gray-800 mr-2">
                            {file.original_name}
                          </span>
                          <button
                            type="button"
                            className="ml-1 text-gray-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeInitialFile(idx);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={file.name + idx + initialFiles.length}
                          className={`flex items-center px-3 py-1 mr-2 mb-2 rounded-t cursor-pointer ${activeFileTab === idx + initialFiles.length
                            ? "bg-blue-100 border-t-2 border-blue-500"
                            : "bg-gray-100"
                            }`}
                          onClick={() =>
                            setActiveFileTab(idx + initialFiles.length)
                          }
                        >
                          <span className="text-xs font-medium text-gray-800 mr-2">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            className="ml-1 text-gray-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* File preview/info for the active tab */}
                    <div className="p-4 bg-gray-50 rounded-b">
                      {activeFileTab < initialFiles.length &&
                        initialFiles[activeFileTab] && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {initialFiles[activeFileTab].name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(
                                initialFiles[activeFileTab].size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                            <p className="text-xs text-gray-500">
                              {initialFiles[activeFileTab].type}
                            </p>
                            {/* Optionally, add a download/view link if you have a URL */}
                          </div>
                        )}
                      {activeFileTab >= initialFiles.length &&
                        uploadedFiles[activeFileTab - initialFiles.length] && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {
                                uploadedFiles[
                                  activeFileTab - initialFiles.length
                                ].name
                              }
                            </p>
                            <p className="text-xs text-gray-500">
                              {(
                                uploadedFiles[
                                  activeFileTab - initialFiles.length
                                ].size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                            <p className="text-xs text-gray-500">
                              {
                                uploadedFiles[
                                  activeFileTab - initialFiles.length
                                ].type
                              }
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer with navigation buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div></div>
          {/* <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button> */}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            {/* If in edit mode, show Save button always, else show Next/Save as per step */}
            {isEditMode ? (
              <button
                type="submit"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            ) : currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : (currentStep == 1 ? "Register and Next" : "Next")}
                {!isLoading && <ChevronRight className="h-4 w-4 ml-2" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
