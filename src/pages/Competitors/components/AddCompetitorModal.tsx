import React, { useState, useEffect, useRef } from "react";
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
import { log } from "console";
import ComplianceFileUploadForCompetitor from '../../../components/ComplianceFileUploadForCompetitor';

interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (CompetitorData: any) => void;
  initialData?: any;
}

interface ContactPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  designation?: string;
  alternativeNumber?: string;
  dateOfBirth?: string;
  anniversaryDate?: string;
  communicationMode?: string[];
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
  zone?: string;
  city: string;
  pincode: string;
  street?: string;
  googleLocation?: string;
  addressType?: string;
  currentStatus?: string;
  blacklistReason?: string;
  CompetitorCategory?: string;
  riskLevel?: string;
  creditDays?: string;
  contactPersons: ContactPerson[];
  isEditing?: boolean;
  gstNumber?: string;
  panNumber?: string;
  tanNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  nameOfBranchProject?: string;
}

const AddCompetitorModal: React.FC<AddCompetitorModalProps> = ({
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
  const currentUserId = userData?.id || "";
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
      zone: "",
      district: "",
      city: "",
      CompetitorType: "",
      CompetitorPotential: "",
      pincode: "",
      street: "",
      googleLocation: "",
      addressType: "HO",
      currentStatus: "Active",
      blacklistReason: "",
      CompetitorCategory: "",
      riskLevel: "",
      creditDays: "",
      experienceYears: "",
      active: true,
      CompetitorGroup: "",
      CompetitorSubGroup: "",
      alternateNumber: "",
      CompetitorClassification: "",
      msmeRegistered: "No",
      udyamRegistrationNumber: "",
      nameOfBranchProject: "",
      hoContactNumber: "",
      hoEmailId: "",
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

  const [createdCompetitorId, setCreatedCompetitorId] = useState<string | null>(
    initialData?.Competitor_id || initialData?.id || null
  );
  const [createdBranches, setCreatedBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // File queue for HO level compliance documents (General Information section)
  const [pendingFiles, setPendingFiles] = useState<{
    PAN: File | null;
    TAN: File | null;
    GST: File | null;
    BANK: File | null;
  }>({
    PAN: null,
    TAN: null,
    GST: null,
    BANK: null,
  });

  // File queue for Branch level compliance documents (Branch Information section)
  // Structure: { branchTempId: { PAN: File, TAN: File, GST: File, BANK: File } }
  const [pendingBranchFiles, setPendingBranchFiles] = useState<
    Record<string, {
      PAN: File | null;
      TAN: File | null;
      GST: File | null;
      BANK: File | null;
    }>
  >({});

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
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // API-driven dropdown states
  const [zones, setZones] = useState<Array<{ id: string; name: string }>>([]);
  const [states, setStates] = useState<Array<{ id: string; name: string; zone_id: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ id: string; name: string; state_id: string }>>([]);

  // Competitor autocomplete states
  const [CompetitorSuggestions, setCompetitorSuggestions] = useState<Array<{ id: string, name: string }>>([]);
  const [showCompetitorPopup, setShowCompetitorPopup] = useState(false);
  const CompetitorInputRef = useRef<HTMLDivElement>(null);

  // All competitors for dropdown
  const [allCompetitors, setAllCompetitors] = useState<Array<{ id: string, name: string }>>([]);

  // Competitor details modal states
  const [showCompetitorDetailsModal, setShowCompetitorDetailsModal] = useState(false);
  const [selectedCompetitorDetails, setSelectedCompetitorDetails] = useState<any>(null);
  const [loadingCompetitorDetails, setLoadingCompetitorDetails] = useState(false);

  // Removed: Temporary Competitors functionality

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
        CompetitorType: "",
        CompetitorPotential: "",
        pincode: "",
        street: "",
        googleLocation: "",
        addressType: "HO",
        zone: "",
        nameOfBranchProject: "",
        hoContactNumber: "",
        hoEmailId: "",
        currentStatus: "Active",
        blacklistReason: "",
        CompetitorCategory: "",
        riskLevel: "",
        creditDays: "",
        experienceYears: "",
        active: true,
        CompetitorGroup: "",
        CompetitorSubGroup: "",
        alternateNumber: "",
        CompetitorClassification: "",
        msmeRegistered: "No",
        udyamRegistrationNumber: "",
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
    setOriginalContactPersons([]);
  };

  // Enhanced close handler
  const handleClose = () => {
    clearModalState();
    onClose();
  };

  const keymap = {
    businessName: "company_name",
    contactNo: "contact_number",
    email: "email_id",
    country: "country",
    currency: "currency",
    state: "state_id",
    district: "district_id",
    city: "city",
    CompetitorType: "industry_type",
    CompetitorPotential: "associate_potential",
    pincode: "pincode",
    street: "street",
    googleLocation: "location",
    addressType: "address_type",
    currentStatus: "current_status",
    blacklistReason: "blacklist_reason",
    CompetitorCategory: "commission_percentage",
    riskLevel: "risk_level",
    creditDays: "credit_days",
    experienceYears: "experience_years",
    active: "active",
    panNumber: "pan_number",
    tanNumber: "tan_number",
    gstNumber: "gst_number",
    bankName: "bank_name",
    bankAccountNumber: "bank_account_no",
    branchName: "bank_branch_name",
    ifscCode: "ifsc_code",
    approvalStatus: "approval_status",
    approvedBy: "approved_by",
    CompetitorGroup: "competitor_group",
    CompetitorSubGroup: "competitor_sub_group",
    alternateNumber: "alternate_number",
    CompetitorClassification: "competitor_classification",
    msmeRegistered: "msme_status",
    udyamRegistrationNumber: "udyam_registration_number",
    nameOfBranchProject: "branch_project_name",
    zone: "zone_id",
    hoContactNumber: "ho_contact_number",
    hoEmailId: "ho_email_id",
  };

  const branchKeymap = {
    id: "id",
    contactNumber: "contact_number",
    email: "email_id",
    country: "country",
    currency: "currency",
    state: "state_id",
    district: "district_id",
    city: "city",
    pincode: "pincode",
    street: "street",
    googleLocation: "location",
    addressType: "address_type",
    currentStatus: "current_status",
    blacklistReason: "blacklist_reason",
    CompetitorCategory: "Competitor_category",
    riskLevel: "risk_level",
    creditDays: "credit_days",
    gstNumber: "gst_number",
    panNumber: "pan_number",
    tanNumber: "tan_number",
    bankName: "banck_name",
    branchName: "bank_branch_name",
    bankAccountNumber: "bank_account_no",
    ifscCode: "ifsc_code",
    zone: "zone_id",
    nameOfBranchProject: "branch_project_name",
  };

  const branchContactKeymap = {
    id: "id",
    name: "name",
    phone: "phone",
    email: "email",
    designation: "designation",
    alternativeNumber: "alternative_number",
    dateOfBirth: "date_of_birth",
    anniversaryDate: "anniversary_date",
    communicationMode: "communication_mode",
  };

  useEffect(() => {
    console.log("changed fields", fieldChanges);
  });

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

  // Static/dummy city data as per requirements
  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai",
    "Hyderabad", "Pune", "Ahmedabad", "Surat", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara"
  ];
  const CompetitorTypes = ["Industrial", "Hospital", "It", "Commercial", "Residential"];
  const CompetitorPotentials = ["High", "Medium", "Low"];

  // New dropdown values
  const CompetitorGroups = ["Individual", "Enduser", "Contractor", "Architect", "Interior", "Consultant", "Government", "Other"];
  const CompetitorSubGroups = ["Sub Group A", "Sub Group B", "Sub Group C"];
  const CompetitorClassifications = ["A-High Value", "B-Medium Value", "C-Low Value"];
  const addressTypes = ["HO", "Branch", "Project"];
  const statusOptions = ["Active", "Inactive", "Blacklisted"];
  const riskLevels = ["Low", "Mid", "High"];
  const creditDaysOptions = ["0", "10", "20", "30", "45"];
  const communicationModes = ["WhatsApp", "Email", "Call", "VC", "Physical"];
  // const msmeOptions = ["Yes", "No"];

  useEffect(() => {
    if (initialData) {
      // Helper function to parse currency from API format to array
      const parseCurrencyToArray = (currencyValue: any): string[] => {
        console.log("currencyValue", currencyValue);
        if (!currencyValue) return [];

        // If it's already an array, return it
        if (Array.isArray(currencyValue)) {
          return currencyValue;
        }

        // If it's a string, parse it
        if (typeof currencyValue === 'string') {
          try {
            // Remove extra quotes, braces, and brackets, then split by comma
            const cleaned = currencyValue.replace(/["{}\\[\]]/g, '');
            console.log("cleaned", cleaned);
            const currencies = cleaned.split(',').map((c: string) => c.trim()).filter(Boolean);
            return currencies;
          } catch (e) {
            console.error('Error parsing currency:', e);
            return [];
          }
        }

        return [];
      };

      // Parse currency for main form data
      const parsedCurrency = parseCurrencyToArray(initialData.currency);

      console.log("parsedCurrency", parsedCurrency);
      // Ensure all branches start with isEditing: false in edit mode and parse their currency
      const updatedInitialData = {
        ...initialData,
        currency: parsedCurrency,
        branches: (initialData.branches || []).map((branch: Branch) => ({
          ...branch,
          currency: parseCurrencyToArray(branch.currency),
          isEditing: false,
        })),
      };
      console.log("updatedInitialData", updatedInitialData);
      setFormData(updatedInitialData);
      setInitialFiles(initialData.uploadedFiles || []);
      setUploadedFiles([]); // Reset uploaded files for edit mode
      // Store original contact persons for comparison
      setOriginalContactPersons(initialData.contactPersons || []);
      // Store original branches for comparison
      setOriginalBranches(initialData.branches || []);
    }
  }, [initialData]);

  // Fetch and filter Competitors when businessName changes
  useEffect(() => {
    const fetchAndFilterCompetitors = async () => {
      if (formData.businessName.length > 2) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/Competitor`
          );
          const CompetitorData = response.data.data;

          const filteredCompetitors = CompetitorData
            .filter((Competitor: any) =>
              Competitor.company_name.trim()
                .toLowerCase()
                .includes(formData.businessName.toLowerCase())
            )
            .map((Competitor: any) => ({
              id: Competitor.id,
              name: Competitor.company_name
            }));

          setCompetitorSuggestions(filteredCompetitors);
          setShowCompetitorPopup(filteredCompetitors.length > 0);
        } catch (error) {
          console.error("Error fetching Competitors:", error);
          setCompetitorSuggestions([]);
          setShowCompetitorPopup(false);
        }
      } else {
        setCompetitorSuggestions([]);
        setShowCompetitorPopup(false);
      }
    };

    fetchAndFilterCompetitors();
  }, [formData.businessName]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        CompetitorInputRef.current &&
        !CompetitorInputRef.current.contains(event.target as Node)
      ) {
        setShowCompetitorPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch zones from API
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_AUTH_BASE_URL}/zones`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
        setZones(response.data.data || response.data || []);
      } catch (error) {
        console.error('Error fetching zones:', error);
        setZones([]);
      }
    };
    fetchZones();
  }, []);

  // Fetch states from API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_AUTH_BASE_URL}/states`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
        setStates(response.data.data || response.data || []);
      } catch (error) {
        console.error('Error fetching states:', error);
        setStates([]);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts from API
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_AUTH_BASE_URL}/districts`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
        setDistricts(response.data.data || response.data || []);
      } catch (error) {
        console.error('Error fetching districts:', error);
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, []);

  // Fetch Competitor details
  const fetchCompetitorDetails = async (CompetitorId: string) => {
    setLoadingCompetitorDetails(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/Competitor/${CompetitorId}`
      );
      if (response.data.success) {
        setSelectedCompetitorDetails(response.data.data);
        setShowCompetitorDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching Competitor details:", error);
      alert("Failed to fetch Competitor details. Please try again.");
    } finally {
      setLoadingCompetitorDetails(false);
    }
  };

  // Removed: Temporary Competitor functionality

  // Helper function to parse currency from API response
  const parseCurrency = (currencyValue: any): string => {
    if (!currencyValue) return '-';

    // If it's already an array, join it
    if (Array.isArray(currencyValue)) {
      return currencyValue.join(', ');
    }

    // If it's a string, try to parse it
    if (typeof currencyValue === 'string') {
      try {
        // Remove extra quotes and braces, then split by comma
        const cleaned = currencyValue.replace(/["{}\[\]]/g, '');
        const currencies = cleaned.split(',').map((c: string) => c.trim()).filter(Boolean);
        return currencies.join(', ') || '-';
      } catch (e) {
        return currencyValue;
      }
    }

    return String(currencyValue);
  };

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
      if (name === "zone" || name === "zoneName") {
        // When zone changes, reset state, district and city
        updatedFormData.state = "";
        updatedFormData.stateName = "";
        updatedFormData.district = "";
        updatedFormData.districtName = "";
        updatedFormData.city = "";
      } else if (name === "state" || name === "stateName") {
        // When state changes, reset district and city
        updatedFormData.district = "";
        updatedFormData.districtName = "";
        updatedFormData.city = "";
      } else if (name === "district" || name === "districtName") {
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
      const Competitorror = rule.custom(value);
      if (Competitorror) {
        return Competitorror;
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
      CompetitorType: "Competitor Type",
      CompetitorPotential: "Competitor Potential",
      pincode: "Pincode",
      panNumber: "PAN Number",
      tanNumber: "TAN Number",
      gstNumber: "GST Number",
      bankName: "Bank Name",
      bankAccountNumber: "Bank Account Number",
      branchName: "Branch Name",
      ifscCode: "IFSC Code",
      CompetitorGroup: "Competitor Group",
      CompetitorSubGroup: "Competitor Sub Group",
      alternateNumber: "Alternate Number",
      CompetitorClassification: "Competitor Classification",
      msmeRegistered: "MSME Registered",
      udyamRegistrationNumber: "Udyam Registration Number",
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

  const handleCurrencyToggle = (currency: string) => {
    const selectedCurrencies = [...formData.currency];
    const index = selectedCurrencies.indexOf(currency);

    if (index > -1) {
      selectedCurrencies.splice(index, 1);
    } else {
      selectedCurrencies.push(currency);
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
          alternative_number: contactPerson.alternativeNumber || "",
          date_of_birth: contactPerson.dateOfBirth || "",
          anniversary_date: contactPerson.anniversaryDate || "",
          communication_mode: contactPerson.communicationMode || [],
          Competitor_id: formData.id,
          created_by: currentUserId
        };

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/Competitor-contact`,
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
          if (contactPerson.alternativeNumber !== originalContact.alternativeNumber)
            changedFields.alternative_number = contactPerson.alternativeNumber || "";
          if (contactPerson.dateOfBirth !== originalContact.dateOfBirth)
            changedFields.date_of_birth = contactPerson.dateOfBirth || "";
          if (contactPerson.anniversaryDate !== originalContact.anniversaryDate)
            changedFields.anniversary_date = contactPerson.anniversaryDate || "";
          if (JSON.stringify(contactPerson.communicationMode) !== JSON.stringify(originalContact.communicationMode))
            changedFields.communication_mode = contactPerson.communicationMode || [];
        }

        if (currentUserId) changedFields.updated_by = currentUserId;

        // Only make API call if there are changes
        if (Object.keys(changedFields).length > 0) {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/Competitor-contact/${id}`,
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
      alternativeNumber: "",
      dateOfBirth: "",
      anniversaryDate: "",
      communicationMode: [] as string[],
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
          `${import.meta.env.VITE_API_BASE_URL}/Competitor-contact/${id}`,
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
      id: Date.now().toString(),
      branchName: "",
      contactNumber: "",
      email: "",
      country: "India",
      currency: "",
      state: "",
      zone: "",
      district: "",
      city: "",
      pincode: "",
      street: "",
      googleLocation: "",
      addressType: "HO",
      currentStatus: "Active",
      blacklistReason: "",
      CompetitorCategory: "",
      riskLevel: "",
      creditDays: "",
      contactPersons: [],
      isEditing: true,
      gstNumber: "",
      panNumber: "",
      tanNumber: "",
      bankName: "",
      bankAccountNumber: "",
      ifscCode: "",
      nameOfBranchProject: "",
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

  // const copyFromCompetitorDetails = (branchId: string) => {
  //   setFormData((prev: typeof formData) => ({
  //     ...prev,
  //     branches: prev.branches.map((branch: Branch) =>
  //       branch.id === branchId
  //         ? {
  //           ...branch,
  //           contactNumber: prev.contactNo,
  //           email: prev.email,
  //           country: prev.country,
  //           currency: prev.currency.length > 0 ? prev.currency[0] : "",
  //           state: prev.state,
  //           zone: prev.zone,
  //           district: prev.district,
  //           city: prev.city,
  //           pincode: prev.pincode,
  //           contactPersons: [...prev.contactPersons],
  //           gstNumber: prev.gstNumber || branch.gstNumber || "",
  //           panNumber: prev.panNumber || branch.panNumber || "",
  //           tanNumber: prev.tanNumber || branch.tanNumber || "",
  //           bankName: prev.bankName || branch.bankName || "",
  //           bankAccountNumber: prev.bankAccountNumber || branch.bankAccountNumber || "",
  //           ifscCode: prev.ifscCode || branch.ifscCode || "",
  //         }
  //         : branch
  //     ),
  //   }));
  // };

  const updateBranch = (id: string, field: string, value: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      branches: prev.branches.map((branch: Branch) => {
        if (branch.id === id) {
          const updatedBranch = { ...branch, [field]: value };

          // Handle cascade updates
          if (field === "zone") {
            // When zone changes, reset state, district and city
            updatedBranch.state = "";
            updatedBranch.district = "";
            updatedBranch.city = "";
          } else if (field === "state") {
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
      zone: validationRules.branchZone,
      district: validationRules.branchDistrict,
      city: validationRules.branchCity,
      pincode: validationRules.branchPincode,
      panNumber: validationRules.branchPanNumber,
      tanNumber: validationRules.branchTanNumber,
      gstNumber: validationRules.branchGstNumber,
      bankName: validationRules.branchBankName,
      bankAccountNumber: validationRules.branchBankAccountNumber,
      ifscCode: validationRules.branchIfscCode,
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
          `${import.meta.env.VITE_API_BASE_URL}/Competitor-branch/${id}`,
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

      console.log("branch", branch);

      // Check if this is a new branch (has temp ID from Date.now())
      const isNewBranch = !originalBranches.some(
        (originalBranch) => originalBranch.id === id
      );

      if (isNewBranch) {
        // POST request for new branch - use branch key map
        const payload: Record<string, any> = {
          competitor_id: formData.id,
        };

        // Map UI fields to backend fields using branchKeymap
        Object.keys(branchKeymap).forEach((uiKey) => {
          if (uiKey !== "id" && branch[uiKey as keyof Branch] !== undefined) {
            const backendKey = branchKeymap[uiKey as keyof typeof branchKeymap];
            payload[backendKey] = branch[uiKey as keyof Branch];
          }
        });

        if (currentUserId) payload.created_by = currentUserId;

        // Convert zone/state/district names to IDs for bulk post
        if (branch.zoneName) {
          const zone = zones.find(z => z.name === branch.zoneName);
          payload.zone_id = zone?.id || null;
        }
        if (branch.stateName) {
          const state = states.find(s => s.name === branch.stateName);
          payload.state_id = state?.id || null;
        }
        if (branch.districtName) {
          const district = districts.find(d => d.name === branch.districtName);
          payload.district_id = district?.id || null;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/Competitor-branch`,
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
        const actualBranchId = response.data.data?.Competitor_branch_id || response.data.data?.id;

        // update branch id inside formData so future contact person POST uses actual id
        setFormData((prev: any) => ({
          ...prev,
          branches: prev.branches.map((b: any) =>
            b.id === id ? { ...b, id: actualBranchId, isEditing: false } : b
          ),
        }));

        // Add the newly created branch to originalBranches so it's recognized as existing

        setOriginalBranches((prev) => [

          ...prev,

          { ...branch, id: actualBranchId, isEditing: false }

        ]);

        console.log("Branch ID replaced (temp â†’ actual):", id, "â†’", actualBranchId);

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

        if (currentUserId) changedFields.created_by = currentUserId;

        // Only make API call if there are changes
        if (Object.keys(changedFields).length > 0) {

          if (initialData?.status === "approved" || initialData?.approvalStatus === "approved") {
            await axios.put(
              `${import.meta.env.VITE_API_BASE_URL}/Competitor/${formData.id}`,
              { approval_status: "REVISIT" },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }

          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/Competitor-branch/${id}`,
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
        // Update UI state for existing branch

        setFormData((prev: typeof formData) => ({

          ...prev,

          branches: prev.branches.map((branch: Branch) =>

            branch.id === id ? { ...branch, isEditing: false } : branch

          ),

        }));
      }

      // Update UI state
      // setFormData((prev: typeof formData) => ({
      //   ...prev,
      //   branches: prev.branches.map((branch: Branch) =>
      //     branch.id === id ? { ...branch, isEditing: false } : branch
      //   ),
      // }));
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
          competitor_branch_id: branchId,
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

        if (currentUserId) payload.created_by = currentUserId;
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/Competitor-branch-contact`,
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

        if (currentUserId) changedFields.updated_by = currentUserId;

        // Only make API call if there are changes
        if (Object.keys(changedFields).length > 0) {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL
            }/Competitor-branch-contact/${contactId}`,
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
          }/Competitor-branch-contact/${contactId}`,
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

  // Upload files for Competitor
  const uploadFilesForCompetitor = async (
    CompetitorId: string,
    files: File[],
    onProgress?: (percent: number) => void
  ) => {
    if (!CompetitorId || files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("upload_by", userData?.id || "");
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/Competitor-file/${CompetitorId}/files`,
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

  // Upload pending files after Competitor creation (File Queue System)
  const uploadPendingFiles = async (CompetitorId: string) => {
    const uploadPromises: Promise<any>[] = [];

    try {
      // Import the upload function
      const { uploadCompetitorComplianceFile } = await import('../../../utils/competitorApi');

      // Upload PAN if selected
      if (pendingFiles.PAN) {
        console.log('Uploading pending PAN file...');
        uploadPromises.push(
          uploadCompetitorComplianceFile(
            CompetitorId,
            pendingFiles.PAN,
            'PAN',
            'HO',
            null,
            currentUserId
          )
        );
      }

      // Upload TAN if selected
      if (pendingFiles.TAN) {
        console.log('Uploading pending TAN file...');
        uploadPromises.push(
          uploadCompetitorComplianceFile(
            CompetitorId,
            pendingFiles.TAN,
            'TAN',
            'HO',
            null,
            currentUserId
          )
        );
      }

      // Upload GST if selected
      if (pendingFiles.GST) {
        console.log('Uploading pending GST file...');
        uploadPromises.push(
          uploadCompetitorComplianceFile(
            CompetitorId,
            pendingFiles.GST,
            'GST',
            'HO',
            null,
            currentUserId
          )
        );
      }

      // Upload BANK if selected
      if (pendingFiles.BANK) {
        console.log('Uploading pending BANK file...');
        uploadPromises.push(
          uploadCompetitorComplianceFile(
            CompetitorId,
            pendingFiles.BANK,
            'BANK',
            'HO',
            null,
            currentUserId
          )
        );
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        console.log('All pending files uploaded successfully');



        // Clear pending files after successful upload
        setPendingFiles({
          PAN: null,
          TAN: null,
          GST: null,
          BANK: null,
        });
      }
    } catch (error) {
      console.error('Error uploading pending files:', error);
      // Don't throw error - allow user to continue even if upload fails
      // They can upload manually later
    }
  };

  // Upload pending branch files after branch creation (File Queue System for Branches)
  const uploadPendingBranchFiles = async (branchTempId: string, createdBranchId: string) => {
    console.log('Uploading pending branch files...', branchTempId, createdBranchId);
    const branchPendingFiles = pendingBranchFiles[branchTempId];
    if (!branchPendingFiles) return;

    const uploadPromises: Promise<any>[] = [];

    try {
      // Import the upload function
      const { uploadCompetitorComplianceFile } = await import('../../../utils/competitorApi');

      // Upload PAN if selected
      if (branchPendingFiles.PAN) {
        console.log(`Uploading pending PAN file for branch ${createdBranchId}...`);
        uploadPromises.push(
          uploadCompetitorComplianceFile(
            createdCompetitorId!,
            branchPendingFiles.PAN,
            'PAN',
            'BRANCH',
            createdBranchId,
            currentUserId
          )
        );
      }

      // Upload TAN if selected
      if (branchPendingFiles.TAN) {
        console.log(`Uploading pending TAN file for branch ${createdBranchId}...`);
        uploadPromises.push(
          uploadCompetitorComplianceFile(
            createdCompetitorId!,
            branchPendingFiles.TAN,
            'TAN',
            'BRANCH',
            createdBranchId,
            currentUserId
          )
        );
      }

      // Upload GST if selected
      if (branchPendingFiles.GST) {
        console.log(`Uploading pending GST file for branch ${createdBranchId}...`);
        uploadPromises.push(
          uploadCompetitorComplianceFile(
            createdCompetitorId!,
            branchPendingFiles.GST,
            'GST',
            'BRANCH',
            createdBranchId,
            currentUserId
          )
        );
      }

      // Upload BANK if selected
      if (branchPendingFiles.BANK) {
        console.log(`Uploading pending BANK file for branch ${createdBranchId}...`);
        uploadPromises.push(
          uploadCompetitorComplianceFile(
            createdCompetitorId!,
            branchPendingFiles.BANK,
            'BANK',
            'BRANCH',
            createdBranchId,
            currentUserId
          )
        );
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        console.log(`All pending files uploaded successfully for branch ${createdBranchId}`);

        // Clear pending files for this branch after successful upload
        setPendingBranchFiles(prev => {
          const updated = { ...prev };
          delete updated[branchTempId];
          return updated;
        });
      }
    } catch (error) {
      console.error(`Error uploading pending files for branch ${createdBranchId}:`, error);
      // Don't throw error - allow user to continue even if upload fails
    }
  };

  // Copy Billing Address, Compliance, and Bank Details from Competitor (HO) to Branch
  const copyFromCompetitorDetails = (branchId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      branches: prev.branches.map((branch: any) =>
        branch.id === branchId
          ? {
            ...branch,
            // Billing Address fields
            contactNumber: prev.hoContactNumber,
            currency: prev.currency.length > 0 ? prev.currency[0] : "",
            email: prev.hoEmailId,
            country: prev.country,
            state: prev.state,
            district: prev.district,
            city: prev.city,
            pincode: prev.pincode,
            zone: prev.zone,
            street: prev.street,
            googleLocation: prev.googleLocation,
            CompetitorCategory: prev.CompetitorCategory,
            riskLevel: prev.riskLevel,
            creditDays: prev.creditDays,
            currentStatus: prev.currentStatus,
            blacklistReason: prev.blacklistReason,
            contactPersons: [...prev.contactPersons],
            // Compliance fields
            gstNumber: prev.gstNumber,
            panNumber: prev.panNumber,
            tanNumber: prev.tanNumber,
            // Bank Details fields
            bankName: prev.bankName,
            bankAccountNumber: prev.bankAccountNumber,
            branchName: prev.branchName,
            ifscCode: prev.ifscCode,
          }
          : branch
      ),
    }));
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
        "zoneName",
        "stateName",
        "districtName",
        "city",
        "CompetitorType",
        "CompetitorPotential",
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

      // setBranchErrors(branchValidationErrors);

      // if (Object.keys(branchValidationErrors).length > 0) {
      //   alert("Please fix branch validation errors before proceeding");
      //   return;
      // }
    }

    // If we're in register mode (not edit mode) and on step 1
    if (!isEditMode && currentStep === 1) {
      setIsLoading(true);
      try {
        let CompetitorId: string;

        // Step 1: Create Competitor with all fields except contact persons
        const CompetitorPayload: Record<string, any> = {};

        // Map UI fields to backend fields using keymap (excluding contact persons)
        Object.keys(keymap).forEach((uiKey) => {
          if (formData[uiKey as keyof typeof formData] !== undefined) {
            const backendKey = keymap[uiKey as keyof typeof keymap];
            CompetitorPayload[backendKey] =
              formData[uiKey as keyof typeof formData];
          }
        });

        // Special transformations for backend compatibility
        // 1. Convert zone/state/district names to IDs
        if (formData.zoneName) {
          const zone = zones.find(z => z.name === formData.zoneName);
          CompetitorPayload.zone_id = zone?.id || null;
        }
        if (formData.stateName) {
          const state = states.find(s => s.name === formData.stateName);
          CompetitorPayload.state_id = state?.id || null;
        }
        if (formData.districtName) {
          const district = districts.find(d => d.name === formData.districtName);
          CompetitorPayload.district_id = district?.id || null;
        }

        // 2. Convert msme_registered "Yes"/"No" to boolean msme_status
        if (formData.msmeRegistered) {
          CompetitorPayload.msme_status = formData.msmeRegistered === "Yes";
        }

        // 3. Handle CompetitorCategory as commission_percentage (if it's numeric)
        // Note: You may need to adjust this based on actual UI field
        if (formData.CompetitorCategory) {
          // If CompetitorCategory contains numeric value, use it, otherwise set to null
          const numValue = parseFloat(formData.CompetitorCategory);
          CompetitorPayload.commission_percentage = isNaN(numValue) ? null : numValue;
        }

        // 4. Clean up payload: Convert empty strings to null for numeric/optional fields
        // This prevents "invalid input syntax for type numeric" errors
        const numericFields = [
          'zone_id', 'state_id', 'district_id', 'experience_years',
          'associate_potential', 'commission_percentage'
        ];

        const optionalFields = [
          'competitor_number', 'competitor_group', 'industry_type', 'contact_number',
          'alternate_number', 'email_id', 'currency', 'competitor_classification',
          'udyam_registration_number', 'ho_contact_number', 'ho_email_id',
          'address_type', 'branch_project_name', 'city', 'pincode', 'street',
          'location', 'blacklist_reason', 'gst_number', 'pan_number', 'tan_number',
          'bank_name', 'bank_account_no', 'bank_branch_name', 'ifsc_code'
        ];

        // Convert empty strings to null for numeric fields
        numericFields.forEach(field => {
          if (CompetitorPayload[field] === '' || CompetitorPayload[field] === undefined) {
            CompetitorPayload[field] = null;
          }
        });

        // Convert empty strings to null for optional text fields
        optionalFields.forEach(field => {
          if (CompetitorPayload[field] === '' || CompetitorPayload[field] === undefined) {
            CompetitorPayload[field] = null;
          }
        });

        // Set approval_status to DRAFT if branches are not completed, otherwise use default (PENDING)
        // if (formData.branches.length === 0) {
        //   CompetitorPayload.approval_status = "DRAFT";
        // }

        // add created_by for audit
        if (currentUserId) CompetitorPayload.created_by = currentUserId;

        // Log final payload for debugging
        console.log("Final Competitor Payload:", CompetitorPayload);

        // Call POST API for Competitor
        const CompetitorResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/Competitor`,
          CompetitorPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (
          CompetitorResponse.status !== 200 &&
          CompetitorResponse.status !== 201
        ) {
          throw new Error("Failed to create Competitor");
        }

        console.log("Competitor created successfully:", CompetitorResponse.data);

        // Store the Competitor ID from the response
        CompetitorId = CompetitorResponse.data.data.id;
        setCreatedCompetitorId(CompetitorId);

        // ------------------------------------------------------------------------------------------For notifications
        try {
          await sendNotification({
            receiver_ids: ['admin'],
            title: `CRM - New Competitor Registration : ${formData.business_name || 'Competitor'}`,
            message: `Competitor ${formData.business_name || 'Competitor'} registered successfully and sent for approval!by ${userData?.name || 'a user'}`,
            service_type: 'CRM',
            link: '/Competitors',
            sender_id: userRole || 'user',
            access: {
              module: "CRM",
              menu: "Competitors",
            }
          });
          console.log(`Notification sent for CRM Competitor ${formData.business_name || 'Competitor'}`);
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
          // Continue with the flow even if notification fails
        }
        // ----------------------------------------------------------------------------------------

        // Update formData with the Competitor ID
        setFormData((prev: typeof formData) => ({ ...prev, id: CompetitorId }));

        // Step 2: Handle contact persons intelligently
        if (formData.contactPersons.length > 0) {
          // Normal flow: create all contact persons via bulk API
          // Backend expects array of objects with these fields
          const contactPersonsPayload = formData.contactPersons.map(
            (contact: any) => ({
              competitor_id: CompetitorId,
              full_name: contact.name,
              designation: contact.designation || null,
              contact_number: contact.phone || null,
              alternate_number: contact.alternativeNumber || null,
              email_id: contact.email || null,
              date_of_birth: contact.dateOfBirth || null,
              anniversary_date: contact.anniversaryDate || null,
              created_by: currentUserId
            })
          );
          console.log("Creating contact persons:", contactPersonsPayload);

          const contactResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/Competitor-contact/bulk`,
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

        // Auto-upload pending compliance files (File Queue System)
        await uploadPendingFiles(CompetitorId);
        setCurrentStep(currentStep + 1);

        // Don't auto-advance to next step - stay on Step 1 to show uploaded files
        // User will manually click "Next" when ready to proceed to Step 2
        // setCurrentStep(currentStep + 1); // REMOVED: Let user see uploaded files first
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
              Competitor_id: formData.id,
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

            // Convert zone/state/district names to IDs for bulk post
            if (branch.zone) {
              const zone = zones.find(z => z.name === branch.zone);
              payload.zone_id = zone?.id || null;
            }
            if (branch.state) {
              const state = states.find(s => s.name === branch.state);
              payload.state_id = state?.id || null;
            }
            if (branch.district) {
              const district = districts.find(d => d.name === branch.district);
              payload.district_id = district?.id || null;
            }

            if (currentUserId) payload.created_by = currentUserId;
            return payload;
          });

          console.log("Creating branches:", branchesPayload);

          const branchResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/Competitor-branch/bulk`,
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

          // Auto-upload pending branch files (File Queue System for Branches)
          // Map temp branch IDs to created branch IDs and upload files
          if (createdBranchesData && createdBranchesData.length > 0) {
            const uploadPromises = formData.branches.map(async (branch: Branch, index: number) => {
              const createdBranch = createdBranchesData[index];
              // API returns 'id' field for branch ID, not 'Competitor_branch_id'
              const branchId = createdBranch?.id || createdBranch?.Competitor_branch_id;
              console.log(`Processing branch ${index}:`, { branchId: branch.id, createdBranchId: branchId });

              if (createdBranch && branchId) {
                await uploadPendingBranchFiles(branch.id, branchId);
              }
            });
            await Promise.all(uploadPromises);
            console.log('Branch file uploads completed');
          }

          // Update Competitor status from DRAFT to PENDING since branches are now completed
          if (createdCompetitorId) {
            try {
              await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/Competitor/${createdCompetitorId}`,
                { approval_status: "PENDING" },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log("Competitor status updated to PENDING");
            } catch (updateError) {
              console.error("Failed to update Competitor status:", updateError);
            }
          }

          // Step 2: Create branch contact persons in bulk if any exist
          const allBranchContactPersons: any[] = [];

          formData.branches.forEach((branch: Branch, branchIndex: number) => {
            if (branch.contactPersons && branch.contactPersons.length > 0) {
              // Get the corresponding created branch ID
              const createdBranchId =
                createdBranchesData[branchIndex]?.id ||
                createdBranchesData[branchIndex]?.Competitor_branch_id;

              branch.contactPersons.forEach((contact: ContactPerson) => {
                const contactPayload: Record<string, any> = {
                  Competitor_branch_id: createdBranchId,
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

                if (currentUserId) contactPayload.created_by = currentUserId;

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
              }/Competitor-branch-contact/bulk`,
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
    } else if (currentStep === 3) {
      // Step 3: Upload files
      console.log("Uploading files for Competitor...");
      const CompetitorId = createdCompetitorId || formData.id;

      if (!CompetitorId) {
        console.error("No CompetitorId found. Cannot upload files.");
        return;
      }

      if (uploadedFiles.length === 0) {
        // No files to upload, just close the modal
        onClose();
        return;
      }

      setIsLoading(true);
      try {
        await uploadFilesForCompetitor(CompetitorId, uploadedFiles, (percent) => {
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

      console.log("Initial data:", initialData);
      if (initialData?.status === "APPROVED" || initialData?.approvalStatus === "approved") {
        backendPayload.approval_status = "REVISIT";
      }

      if (currentUserId) backendPayload.updated_by = currentUserId;

      console.log("Submitting edit with payload:", backendPayload);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/Competitor/${formData.id}`,
        backendPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update Competitor");
      }

      console.log("Competitor updated successfully:", response.data);
      handleClose();
    } catch (error) {
      console.error("Error updating Competitor:", error);
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
        CompetitorType: "",
        CompetitorPotential: "",
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

  // --- Reusable Section Renderers ---

  const renderBasicDetails = () => (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Business Name */}
        <div ref={CompetitorInputRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competitor Name *
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
          {showCompetitorPopup && CompetitorSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {loadingCompetitorDetails && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  Loading Competitor details...
                </div>
              )}
              {!loadingCompetitorDetails &&
                CompetitorSuggestions.map((Competitor) => (
                  <div
                    key={Competitor.id}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => {
                      fetchCompetitorDetails(Competitor.id);
                    }}
                  >
                    {Competitor.name}
                  </div>
                ))}
            </div>
          )}
        </div>



        {/* Competitor Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competitor Group
          </label>
          <select
            name="CompetitorGroup"
            value={formData.CompetitorGroup}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Group</option>
            {CompetitorGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {/* Competitor Sub Group */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competitor Sub Group
          </label>
          <select
            name="CompetitorSubGroup"
            value={formData.CompetitorSubGroup}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Sub Group</option>
            {CompetitorSubGroups.map((subGroup) => (
              <option key={subGroup} value={subGroup}>
                {subGroup}
              </option>
            ))}
          </select>
        </div> */}

        {/* Industry Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry Type *
          </label>
          <select
            name="CompetitorType"
            value={formData.CompetitorType}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Type</option>
            {CompetitorTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Contact No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number *
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

        {/* Alternate Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alternate Number
          </label>
          <input
            type="tel"
            name="alternateNumber"
            value={formData.alternateNumber}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.alternateNumber
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="+91 98765 43210"
          />
          {validationErrors.alternateNumber && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.alternateNumber}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email ID *
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
            placeholder="email@example.com"
          />
          {validationErrors.email && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Currency */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency *
          </label>
          <div className="relative">
            <div
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className={`w-full px-3 py-2 border rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[42px] flex items-center ${validationErrors.currency ? "border-red-300" : "border-gray-300"
                }`}
            >
              {formData.currency.length > 0 ? (
                <span className="text-gray-900">
                  {formData.currency.join(", ")}
                </span>
              ) : (
                <span className="text-gray-400">Select currencies</span>
              )}
            </div>
            {showCurrencyDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {currencies.map((currency) => (
                  <div
                    key={currency}
                    onClick={() => handleCurrencyToggle(currency)}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center ${formData.currency.includes(currency) ? "bg-blue-100" : ""
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.currency.includes(currency)}
                      onChange={() => { }}
                      className="mr-2"
                    />
                    <span>{currency}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 p-2">
                  <button
                    type="button"
                    onClick={() => setShowCurrencyDropdown(false)}
                    className="w-full px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
          {validationErrors.currency && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.currency}
            </p>
          )}
        </div>

        {/* Competitor Classification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competitor Classification
          </label>
          <select
            name="CompetitorClassification"
            value={formData.CompetitorClassification}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Classification</option>
            {CompetitorClassifications.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* MSME Registered */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            MSME Registered
          </label>
          <select
            name="msmeRegistered"
            value={formData.msmeRegistered}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* Udyam Registration Number */}
        {formData.msmeRegistered === "Yes" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Udyam Registration Number *
            </label>
            <input
              type="text"
              name="udyamRegistrationNumber"
              value={formData.udyamRegistrationNumber}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${validationErrors.udyamRegistrationNumber
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              placeholder="UDYAM-XX-00-0000000"
            />
            {validationErrors.udyamRegistrationNumber && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.udyamRegistrationNumber}
              </p>
            )}
          </div>
        )}

        {/* Experience Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Years
          </label>
          <input
            type="number"
            name="experienceYears"
            value={formData.experienceYears}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter years of experience"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={() => handleToggle("active")}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderBillingAddress = (
    data: any,
    onChange: (field: string, value: any) => void,
    errors: any,
    isBranch: boolean = false,
    readOnly: boolean = false
  ) => (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Billing Address
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Address Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Type
          </label>
          <select
            name={!isBranch ? "addressType" : undefined}
            value={data.addressType || ""}
            onChange={(e) => onChange("addressType", e.target.value)}
            disabled={!isBranch || readOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isBranch ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Select Type</option>
            {addressTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Name of Branch / Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name of Branch / Project
          </label>
          <input
            type="text"
            name={!isBranch ? "nameOfBranchProject" : undefined}
            value={data.nameOfBranchProject || ""}
            onChange={(e) => onChange("nameOfBranchProject", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter branch or project name"
          />
        </div>

        {!isBranch && (
          <>
            {/* HO Contact Number (Competitor specific) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                name="hoContactNumber"
                value={data.hoContactNumber || ""}
                onChange={(e) => onChange("hoContactNumber", e.target.value)}
                disabled={readOnly}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.hoContactNumber
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="+91 98765 43210"
              />
              {errors?.hoContactNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.hoContactNumber}</p>
              )}
            </div>

            {/* HO Email ID (Competitor specific) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email ID *
              </label>
              <input
                type="email"
                name="hoEmailId"
                value={data.hoEmailId || ""}
                onChange={(e) => onChange("hoEmailId", e.target.value)}
                disabled={readOnly}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.hoEmailId
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="contact@company.com"
              />
              {errors?.hoEmailId && (
                <p className="text-red-500 text-xs mt-1">{errors.hoEmailId}</p>
              )}
            </div>

            {/* Country (Competitor specific) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                name="country"
                value={data.country}
                onChange={(e) => onChange("country", e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {isBranch && (
          <>
            {/* Contact Number (Branch specific) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                value={data.contactNumber}
                onChange={(e) => onChange("contactNumber", e.target.value)}
                disabled={readOnly}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.contactNumber
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="+91 98765 43210"
              />
              {errors?.contactNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contactNumber}
                </p>
              )}
            </div>
            {/* Email (Branch specific) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email ID *
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => onChange("email", e.target.value)}
                disabled={readOnly}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.email
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="branch@company.com"
              />
              {errors?.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            {/* Country (Branch specific) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                value={data.country}
                onChange={(e) => onChange("country", e.target.value)}
                disabled={readOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {/* Currency (Branch specific) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                value={data.currency}
                onChange={(e) => onChange("currency", e.target.value)}
                disabled={readOnly || formData.currency.length === 0}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Currency</option>
                {formData.currency.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zone *
          </label>
          <select
            name={!isBranch ? "zone" : undefined}
            value={data.zoneName || ""}
            onChange={(e) => onChange("zoneName", e.target.value)}
            disabled={readOnly}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Zone</option>
            {zones.map((z) => (
              <option key={z.id} value={z.name}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <select
            name={!isBranch ? "state" : undefined}
            value={data.stateName}
            onChange={(e) => onChange("stateName", e.target.value)}
            disabled={readOnly || !data.zoneName}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.state
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } disabled:bg-gray-100`}
          >
            <option value="">Select State</option>
            {data.zoneName &&
              states
                .filter((s) => s.zone_id === zones.find(z => z.name === data.zoneName)?.id)
                .map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
          </select>
          {errors?.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District *
          </label>
          <select
            name={!isBranch ? "district" : undefined}
            value={data.districtName}
            onChange={(e) => onChange("districtName", e.target.value)}
            disabled={readOnly || !data.stateName}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select District</option>
            {data.stateName &&
              districts
                .filter((d) => d.state_id === states.find(s => s.name === data.stateName)?.id)
                .map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <select
            name={!isBranch ? "city" : undefined}
            value={data.city}
            onChange={(e) => onChange("city", e.target.value)}
            disabled={readOnly}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pincode *
          </label>
          <input
            type="text"
            name={!isBranch ? "pincode" : undefined}
            value={data.pincode}
            onChange={(e) => onChange("pincode", e.target.value)}
            disabled={readOnly}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.pincode
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="400001"
          />
          {errors?.pincode && (
            <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
          )}
        </div>

        {/* Street */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <textarea
            name={!isBranch ? "street" : undefined}
            value={data.street || ""}
            onChange={(e) => onChange("street", e.target.value)}
            disabled={readOnly}
            rows={2}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter full address"
          />
        </div>

        {/* Google Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Google Location
          </label>
          <input
            type="text"
            name={!isBranch ? "googleLocation" : undefined}
            value={data.googleLocation || ""}
            onChange={(e) => onChange("googleLocation", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Google Maps link or coordinates"
          />
        </div>



        {!isBranch && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Competitor Potential *
            </label>
            <input
              type="number"
              name="CompetitorPotential"
              value={data.CompetitorPotential}
              onChange={(e) => onChange("CompetitorPotential", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Competitor Category */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competitor Category
          </label>
          <select
            name={!isBranch ? "CompetitorCategory" : undefined}
            value={data.CompetitorCategory || ""}
            onChange={(e) => onChange("CompetitorCategory", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {CompetitorPotentials.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div> */}

        {/* Current Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Status *
          </label>
          <select
            name={!isBranch ? "currentStatus" : undefined}
            value={data.currentStatus || "Active"}
            onChange={(e) => onChange("currentStatus", e.target.value)}
            disabled={readOnly}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Blacklist Reason - Conditional */}
        {data.currentStatus === "Blacklisted" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blacklist Reason *
            </label>
            <textarea
              name={!isBranch ? "blacklistReason" : undefined}
              value={data.blacklistReason || ""}
              onChange={(e) => onChange("blacklistReason", e.target.value)}
              disabled={readOnly}
              required
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reason for blacklisting"
            />
          </div>
        )}

        {/* Risk Level */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Risk Level
          </label>
          <select
            name={!isBranch ? "riskLevel" : undefined}
            value={data.riskLevel || ""}
            onChange={(e) => onChange("riskLevel", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Risk Level</option>
            {riskLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div> */}

        {/* Credit Days */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Days
          </label>
          <select
            name={!isBranch ? "creditDays" : undefined}
            value={data.creditDays || ""}
            onChange={(e) => onChange("creditDays", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Credit Days</option>
            {creditDaysOptions.map((days) => (
              <option key={days} value={days}>
                {days} days
              </option>
            ))}
          </select>
        </div> */}
      </div>
    </div>
  );

  const renderCompliance = (
    data: any,
    onChange: (field: string, value: any) => void,
    errors: any,
    readOnly: boolean = false,
    isBranch: boolean = false,
    branchId?: string,
    queueCallbacks?: {
      onPANSelect?: (file: File | null) => void;
      onTANSelect?: (file: File | null) => void;
      onGSTSelect?: (file: File | null) => void;
      queuedPAN?: File | null;
      queuedTAN?: File | null;
      queuedGST?: File | null;
    }
  ) => (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Compliance</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* GST */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GST Number
          </label>
          <input
            type="text"
            name="gstNumber"
            value={data.gstNumber || ""}
            onChange={(e) => onChange("gstNumber", e.target.value)}
            disabled={readOnly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.gstNumber
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="GST Number"
          />
          {errors?.gstNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>
          )}
          {createdCompetitorId && isEditMode && (
            <div className="mt-2">
              <ComplianceFileUploadForCompetitor
                competitorId={createdCompetitorId}
                documentType="GST"
                entityLevel={isBranch ? "BRANCH" : "HO"}
                competitorBranchId={isBranch ? branchId : null}
                uploadBy={currentUserId}
                disabled={!createdCompetitorId}
              />
            </div>
          )}
          {/* Queue mode: Show upload before Competitor creation */}
          {!createdCompetitorId && !isBranch && !isEditMode && (
            <div className="mt-2">
              <ComplianceFileUploadForCompetitor
                competitorId={null}
                documentType="GST"
                entityLevel="HO"
                competitorBranchId={null}
                uploadBy={currentUserId}
                onFileSelect={(file) => setPendingFiles(prev => ({ ...prev, GST: file }))}
                queuedFile={pendingFiles.GST}
              />



            </div>
          )}
          {/* Branch queue mode: Show upload for branches before branch creation */}
          {isBranch && !isEditMode && queueCallbacks?.onGSTSelect && (
            <div className="mt-2">
              <ComplianceFileUploadForCompetitor
                competitorId={null}
                documentType="GST"
                entityLevel="BRANCH"
                competitorBranchId={null}
                uploadBy={currentUserId}
                onFileSelect={queueCallbacks.onGSTSelect}
                queuedFile={queueCallbacks.queuedGST || null}
              />
            </div>
          )}
        </div>
        {/* PAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN Number
          </label>
          <input
            type="text"
            name="panNumber"
            value={data.panNumber || ""}
            onChange={(e) => onChange("panNumber", e.target.value)}
            disabled={readOnly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.panNumber
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="Pan Number"
          />
          {errors?.panNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>
          )}
          {createdCompetitorId && isEditMode && (
            <div className="mt-2">
              <ComplianceFileUploadForCompetitor
                competitorId={createdCompetitorId}
                documentType="PAN"
                entityLevel={isBranch ? "BRANCH" : "HO"}
                competitorBranchId={isBranch ? branchId : null}
                uploadBy={currentUserId}
                disabled={!createdCompetitorId}
              />
            </div>
          )}
          {/* Queue mode: Show upload before Competitor creation */}
          {!createdCompetitorId && !isEditMode && !isBranch && (
            <div className="mt-2">
              <ComplianceFileUploadForCompetitor
                competitorId={null}
                documentType="PAN"
                entityLevel="HO"
                competitorBranchId={null}
                uploadBy={currentUserId}
                onFileSelect={(file) => setPendingFiles(prev => ({ ...prev, PAN: file }))}
                queuedFile={pendingFiles.PAN}
              />

            </div>
          )}
          {/* Branch queue mode: Show upload for branches before branch creation */}
          {isBranch && !isEditMode && queueCallbacks?.onPANSelect && (
            <div className="mt-2">
              <ComplianceFileUploadForCompetitor
                competitorId={null}
                documentType="PAN"
                entityLevel="BRANCH"
                competitorBranchId={null}
                uploadBy={currentUserId}
                onFileSelect={queueCallbacks.onPANSelect}
                queuedFile={queueCallbacks.queuedPAN || null}
              />
            </div>
          )}
        </div>
        {/* TAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TAN Number
          </label>
          <input
            type="text"
            name="tanNumber"
            value={data.tanNumber || ""}
            onChange={(e) => onChange("tanNumber", e.target.value)}
            disabled={readOnly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.tanNumber
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="Tan Number"
          />
          {errors?.tanNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.tanNumber}</p>
          )}
          {createdCompetitorId && isEditMode && (
            <div className="mt-2">
              <ComplianceFileUploadForCompetitor
                competitorId={createdCompetitorId}
                documentType="TAN"
                entityLevel={isBranch ? "BRANCH" : "HO"}
                competitorBranchId={isBranch ? branchId : null}
                uploadBy={currentUserId}
                disabled={!createdCompetitorId}
              />
            </div>
          )}
          {/* Queue mode: Show upload before Competitor creation */}
          {!createdCompetitorId && !isEditMode && !isBranch && (
            <div className="mt-2">
              <ComplianceFileUploadForCompetitor
                competitorId={null}
                documentType="TAN"
                entityLevel="HO"
                competitorBranchId={null}
                uploadBy={currentUserId}
                onFileSelect={(file) => setPendingFiles(prev => ({ ...prev, TAN: file }))}
                queuedFile={pendingFiles.TAN}
              />

            </div>
          )}
          {/* Branch queue mode: Show upload for branches before branch creation */}
          {isBranch && !isEditMode && queueCallbacks?.onTANSelect && (
            <div className="mt-2">
              <ComplianceFileUploadForCompetitor
                competitorId={null}
                documentType="TAN"
                entityLevel="BRANCH"
                competitorBranchId={null}
                uploadBy={currentUserId}
                onFileSelect={queueCallbacks.onTANSelect}
                queuedFile={queueCallbacks.queuedTAN || null}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBankDetails = (
    data: any,
    onChange: (field: string, value: any) => void,
    errors: any,
    isBranch: boolean = false,
    readOnly: boolean = false,
    branchId?: string,
    queueCallbacks?: {
      onBANKSelect?: (file: File | null) => void;
      queuedBANK?: File | null;
    }
  ) => (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <input
            type="text"
            name="bankName"
            value={data.bankName || ""}
            onChange={(e) => onChange("bankName", e.target.value)}
            disabled={readOnly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.bankName
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="Bank Name"
          />
          {errors?.bankName && (
            <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
          )}
        </div>
        {/* Bank Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Account Number
          </label>
          <input
            type="text"
            name="bankAccountNumber"
            value={data.bankAccountNumber || ""}
            onChange={(e) => onChange("bankAccountNumber", e.target.value)}
            disabled={readOnly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.bankAccountNumber
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="Account Number"
          />
          {errors?.bankAccountNumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.bankAccountNumber}
            </p>
          )}
        </div>
        {/* IFSC */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IFSC Code
          </label>
          <input
            type="text"
            name="ifscCode"
            value={data.ifscCode || ""}
            onChange={(e) => onChange("ifscCode", e.target.value)}
            disabled={readOnly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.ifscCode
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            placeholder="IFSC Code"
          />
          {errors?.ifscCode && (
            <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>
          )}
        </div>
        {/* Branch Name (Bank Branch) - Competitor Only */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Name (Bank)
          </label>
          <input
            type="text"
            name="branchName"
            value={data.branchName}
            onChange={(e) => onChange("branchName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Bank Branch Name"
          />
        </div>

        {/* Bank Document Upload */}
        {createdCompetitorId && isEditMode && (
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Documents
            </label>
            <ComplianceFileUploadForCompetitor
              competitorId={createdCompetitorId}
              documentType="BANK"
              entityLevel={isBranch ? "BRANCH" : "HO"}
              competitorBranchId={isBranch ? branchId : null}
              uploadBy={currentUserId}
              disabled={!createdCompetitorId}
              label="Upload Bank Document (Cancelled Cheque / Bank Proof)"
            />
          </div>
        )}
        {/* Queue mode: Show upload before Competitor creation */}
        {!createdCompetitorId && !isEditMode && !isBranch && (
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Documents
            </label>
            <ComplianceFileUploadForCompetitor
              competitorId={null}
              documentType="BANK"
              entityLevel="HO"
              competitorBranchId={null}
              uploadBy={currentUserId}
              onFileSelect={(file) => setPendingFiles(prev => ({ ...prev, BANK: file }))}
              queuedFile={pendingFiles.BANK}
              label="Upload Bank Document (Cancelled Cheque / Bank Proof)"
            />


          </div>

        )}
        {/* Branch queue mode: Show upload for branches before branch creation */}
        {isBranch && !isEditMode && queueCallbacks?.onBANKSelect && (
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Documents
            </label>
            <ComplianceFileUploadForCompetitor
              competitorId={null}
              documentType="BANK"
              entityLevel="BRANCH"
              competitorBranchId={null}
              uploadBy={currentUserId}
              onFileSelect={queueCallbacks.onBANKSelect}
              queuedFile={queueCallbacks.queuedBANK || null}
              label="Upload Bank Document (Cancelled Cheque / Bank Proof)"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderContactPersons = (
    persons: ContactPerson[],
    onAdd: () => void,
    onRemove: (id: string) => void,
    onEdit: (id: string) => void,
    onSave: (id: string) => void,
    onUpdate: (id: string, field: string, value: string) => void,
    getError: (id: string, field: string) => string | undefined,
    readOnly: boolean = false,
    title: string = "Contact Persons",
    canAdd: boolean = true
  ) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">{title}</h4>
        <button
          type="button"
          onClick={onAdd}
          disabled={readOnly || !canAdd || persons.some((p) => p.isEditing)}
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact Person
        </button>
      </div>

      {persons.map((person, index) => (
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
                onClick={() => onRemove(person.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {person.isEditing ? (
                <button
                  type="button"
                  onClick={() => onSave(person.id)}
                  className="text-green-600 hover:text-green-800"
                >
                  <Save className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onEdit(person.id)}
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
                onChange={(e) => onUpdate(person.id, "name", e.target.value)}
                disabled={!person.isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                  ? "bg-gray-50 cursor-not-allowed border-gray-300"
                  : getError(person.id, "name")
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="Contact person name"
              />
              {getError(person.id, "name") && (
                <p className="text-red-500 text-xs mt-1">
                  {getError(person.id, "name")}
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
                  onUpdate(person.id, "designation", e.target.value)
                }
                disabled={!person.isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                  ? "bg-gray-50 cursor-not-allowed border-gray-300"
                  : getError(person.id, "designation")
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="Manager, CEO, etc."
              />
              {getError(person.id, "designation") && (
                <p className="text-red-500 text-xs mt-1">
                  {getError(person.id, "designation")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                value={person.phone}
                onChange={(e) => onUpdate(person.id, "phone", e.target.value)}
                disabled={!person.isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                  ? "bg-gray-50 cursor-not-allowed border-gray-300"
                  : getError(person.id, "phone")
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="+91 98765 43210"
              />
              {getError(person.id, "phone") && (
                <p className="text-red-500 text-xs mt-1">
                  {getError(person.id, "phone")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternative Number
              </label>
              <input
                type="tel"
                value={person.alternativeNumber || ""}
                onChange={(e) => onUpdate(person.id, "alternativeNumber", e.target.value)}
                disabled={!person.isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                  ? "bg-gray-50 cursor-not-allowed border-gray-300"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="+91 98765 43211"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email ID
              </label>
              <input
                type="email"
                value={person.email}
                onChange={(e) => onUpdate(person.id, "email", e.target.value)}
                disabled={!person.isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                  ? "bg-gray-50 cursor-not-allowed border-gray-300"
                  : getError(person.id, "email")
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                placeholder="contact@company.com"
              />
              {getError(person.id, "email") && (
                <p className="text-red-500 text-xs mt-1">
                  {getError(person.id, "email")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={person.dateOfBirth || ""}
                onChange={(e) => onUpdate(person.id, "dateOfBirth", e.target.value)}
                disabled={!person.isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                  ? "bg-gray-50 cursor-not-allowed border-gray-300"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anniversary Date
              </label>
              <input
                type="date"
                value={person.anniversaryDate || ""}
                onChange={(e) => onUpdate(person.id, "anniversaryDate", e.target.value)}
                disabled={!person.isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${!person.isEditing
                  ? "bg-gray-50 cursor-not-allowed border-gray-300"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Communication Mode
              </label>
              <div className={`w-full px-3 py-2 border rounded-md ${!person.isEditing
                ? "bg-gray-50 cursor-not-allowed border-gray-300"
                : "border-gray-300"
                }`}>
                <div className="flex flex-wrap gap-2">
                  {communicationModes.map((mode) => (
                    <label key={mode} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={person.communicationMode?.includes(mode) || false}
                        onChange={(e) => {
                          const currentModes = person.communicationMode || [];
                          const newModes = e.target.checked
                            ? [...currentModes, mode]
                            : currentModes.filter(m => m !== mode);
                          onUpdate(person.id, "communicationMode", newModes);
                        }}
                        disabled={!person.isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-1 text-sm text-gray-700">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Register New Competitor
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
                {renderBasicDetails()}
                {renderBillingAddress(
                  formData,
                  (field, value) =>
                    handleInputChange({
                      target: { name: field, value },
                    } as any),
                  validationErrors
                )}
                {renderCompliance(
                  formData,
                  (field, value) =>
                    handleInputChange({
                      target: { name: field, value },
                    } as any),
                  validationErrors
                )}
                {renderBankDetails(
                  formData,
                  (field, value) =>
                    handleInputChange({
                      target: { name: field, value },
                    } as any),
                  validationErrors
                )}

                {/* Contact Persons */}
                {renderContactPersons(
                  formData.contactPersons,
                  addContactPerson,
                  removeContactPerson,
                  editContactPerson,
                  saveContactPerson,
                  updateContactPerson,
                  (id, field) =>
                    contactPersonErrors[id]?.[
                    field as keyof (typeof contactPersonErrors)[string]
                    ]
                )}
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
                            onClick={() => copyFromCompetitorDetails(branch.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy from Competitor Details
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

                    {renderBillingAddress(
                      branch,
                      (field, value) => updateBranch(branch.id, field, value),
                      branchErrors[branch.id],
                      true,
                      !branch.isEditing
                    )}


                    {/* Branch Compliance Section */}
                    {renderCompliance(
                      branch,
                      (field, value) => updateBranch(branch.id, field, value),
                      branchErrors[branch.id],
                      !branch.isEditing,
                      true,
                      branch.id,
                      // Queue mode callbacks for branches
                      {
                        onPANSelect: (file) => setPendingBranchFiles(prev => ({
                          ...prev,
                          [branch.id]: { ...prev[branch.id], PAN: file, TAN: prev[branch.id]?.TAN || null, GST: prev[branch.id]?.GST || null, BANK: prev[branch.id]?.BANK || null }
                        })),
                        onTANSelect: (file) => setPendingBranchFiles(prev => ({
                          ...prev,
                          [branch.id]: { ...prev[branch.id], TAN: file, PAN: prev[branch.id]?.PAN || null, GST: prev[branch.id]?.GST || null, BANK: prev[branch.id]?.BANK || null }
                        })),
                        onGSTSelect: (file) => setPendingBranchFiles(prev => ({
                          ...prev,
                          [branch.id]: { ...prev[branch.id], GST: file, PAN: prev[branch.id]?.PAN || null, TAN: prev[branch.id]?.TAN || null, BANK: prev[branch.id]?.BANK || null }
                        })),
                        queuedPAN: pendingBranchFiles[branch.id]?.PAN || null,
                        queuedTAN: pendingBranchFiles[branch.id]?.TAN || null,
                        queuedGST: pendingBranchFiles[branch.id]?.GST || null,
                      }
                    )}

                    {/* Branch Bank Details Section */}
                    {renderBankDetails(
                      branch,
                      (field, value) => updateBranch(branch.id, field, value),
                      branchErrors[branch.id],
                      true,
                      !branch.isEditing,
                      branch.id,
                      // Queue mode callbacks for branches
                      {
                        onBANKSelect: (file) => setPendingBranchFiles(prev => ({
                          ...prev,
                          [branch.id]: { ...prev[branch.id], BANK: file, PAN: prev[branch.id]?.PAN || null, TAN: prev[branch.id]?.TAN || null, GST: prev[branch.id]?.GST || null }
                        })),
                        queuedBANK: pendingBranchFiles[branch.id]?.BANK || null,
                      }
                    )}

                    {/* Branch Contact Persons */}
                    {/* Branch Contact Persons */}
                    {renderContactPersons(
                      branch.contactPersons,
                      () => addBranchContactPerson(branch.id),
                      (personId) =>
                        removeBranchContactPerson(branch.id, personId),
                      (personId) =>
                        editBranchContactPerson(branch.id, personId),
                      (personId) =>
                        saveBranchContactPerson(branch.id, personId),
                      (personId, field, value) =>
                        updateBranchContactPerson(
                          branch.id,
                          personId,
                          field,
                          value
                        ),
                      (personId, field) =>
                        branchErrors[branch.id]?.[
                        `contactPerson_${personId}_${field}`
                        ],
                      !branch.isEditing,
                      "Branch Contact Persons",
                      !(
                        isEditMode &&
                        !originalBranches.some(
                          (originalBranch) => originalBranch.id === branch.id
                        )
                      )
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Upload Files */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Competitor Documents
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
                          <span className="mr-1">âš </span>
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
                          key={file.originalName + idx}
                          className={`flex items-center px-3 py-1 mr-2 mb-2 rounded-t cursor-pointer ${activeFileTab === idx
                            ? "bg-blue-100 border-t-2 border-blue-500"
                            : "bg-gray-100"
                            }`}
                          onClick={() => setActiveFileTab(idx)}
                        >
                          <span className="text-xs font-medium text-gray-800 mr-2">
                            {file.originalName}
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
            {isEditMode && currentStep < 3 ? (
              <button
                type="submit"
                onClick={handleEditSubmit}
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

      {/* Competitor Details Modal */}
      {showCompetitorDetailsModal && selectedCompetitorDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold text-gray-900">
                Competitor Details
              </h3>
              <button
                onClick={() => {
                  setShowCompetitorDetailsModal(false);
                  setSelectedCompetitorDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Business Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Competitor Number</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.competitor_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Business Name</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.company_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Contact Number</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.contact_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.email_id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Competitor Type</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.industry_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Competitor Potential</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.associate_potential || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Currency</p>
                    <p className="text-sm text-gray-900">{parseCurrency(selectedCompetitorDetails.currency)}</p>
                  </div>
                  {/* <div>
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <p className={`text-sm font-medium ${selectedCompetitorDetails.active ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedCompetitorDetails.active ? 'Active' : 'Inactive'}
                    </p>
                  </div> */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Approval Status</p>
                    <p className={`text-sm font-medium ${selectedCompetitorDetails.approval_status === 'APPROVED' ? 'text-green-600' :
                      selectedCompetitorDetails.approval_status === 'REJECTED' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                      {selectedCompetitorDetails.approval_status || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Location Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Zone</p>
                    <p className="text-sm text-gray-900">{zones.find(z => z.id === selectedCompetitorDetails.zone_id)?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">State</p>
                    <p className="text-sm text-gray-900">{states.find(s => s.id === selectedCompetitorDetails.state_id)?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">District</p>
                    <p className="text-sm text-gray-900">{districts.find(d => d.id === selectedCompetitorDetails.district_id)?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">City</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Pincode</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.pincode || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Tax & Bank Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Tax & Bank Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">PAN Number</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.pan_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">TAN Number</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.tan_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">GST Number</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.gst_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Bank Name</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.bank_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Account Number</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.bank_account_no || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Branch Name</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.bank_branch_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">IFSC Code</p>
                    <p className="text-sm text-gray-900">{selectedCompetitorDetails.ifsc_code || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Persons */}
              {selectedCompetitorDetails.contactpersons && selectedCompetitorDetails.contactpersons.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Persons</h4>
                  <div className="space-y-3">
                    {selectedCompetitorDetails.contactpersons.map((contact: any, index: number) => (
                      <div key={contact.contactId} className="bg-white p-3 rounded border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Name</p>
                            <p className="text-sm text-gray-900">{contact.fullName || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Designation</p>
                            <p className="text-sm text-gray-900">{contact.designation || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Email</p>
                            <p className="text-sm text-gray-900">{contact.emailId || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Phone</p>
                            <p className="text-sm text-gray-900">{contact.contactNumber || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Branches */}
              {selectedCompetitorDetails.branches && selectedCompetitorDetails.branches.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Branches</h4>
                  <div className="space-y-4">
                    {selectedCompetitorDetails.branches.map((branch: any, index: number) => (
                      <div key={branch.branchId} className="bg-white p-4 rounded border border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-3">{branch.branchName}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Contact Number</p>
                            <p className="text-sm text-gray-900">{branch.contactNumber || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Email</p>
                            <p className="text-sm text-gray-900">{branch.emailId || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Currency</p>
                            <p className="text-sm text-gray-900">{parseCurrency(branch.currency)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Zone</p>
                            <p className="text-sm text-gray-900">{zones.find(z => z.id === branch.zoneId)?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">State</p>
                            <p className="text-sm text-gray-900">{states.find(s => s.id === branch.stateId)?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">District</p>
                            <p className="text-sm text-gray-900">{districts.find(d => d.id === branch.districtId)?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">City</p>
                            <p className="text-sm text-gray-900">{branch.city || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Pincode</p>
                            <p className="text-sm text-gray-900">{branch.pincode || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">GST Number</p>
                            <p className="text-sm text-gray-900">{branch.gstNumber || '-'}</p>
                          </div>
                        </div>

                        {/* Branch Contact Persons */}
                        {branch.contactPersons && branch.contactPersons.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 font-medium mb-2">Branch Contact Persons</p>
                            <div className="space-y-2">
                              {branch.contactPersons.map((contact: any) => (
                                <div key={contact.contactId} className="bg-gray-50 p-2 rounded">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                    <div>
                                      <p className="text-xs text-gray-500 font-medium">Name</p>
                                      <p className="text-sm text-gray-900">{contact.name || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 font-medium">Designation</p>
                                      <p className="text-sm text-gray-900">{contact.designation || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 font-medium">Email</p>
                                      <p className="text-sm text-gray-900">{contact.email || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 font-medium">Phone</p>
                                      <p className="text-sm text-gray-900">{contact.phone || '-'}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Files */}
              {selectedCompetitorDetails.uploadedfiles && selectedCompetitorDetails.uploadedfiles.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Files</h4>
                  <div className="space-y-3">
                    {selectedCompetitorDetails.uploadedfiles.map((file: any) => (
                      <div key={file.id} className="bg-white p-4 rounded border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{file.original_name}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                          <div>
                            <p className="text-xs text-gray-500 font-medium">File Size</p>
                            <p className="text-sm text-gray-900">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Uploaded At</p>
                            <p className="text-sm text-gray-900">
                              {file.createdAt ? new Date(file.createdAt).toLocaleString() : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Uploaded By</p>
                            <p className="text-sm text-gray-900">{file.createdByName || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Metadata</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Created At</p>
                    <p className="text-sm text-gray-900">
                      {selectedCompetitorDetails.created_at ? new Date(selectedCompetitorDetails.created_at).toLocaleString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Created By</p>
                    <p className="text-sm text-gray-900">
                      {selectedCompetitorDetails.created_by_name || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowCompetitorDetailsModal(false);
                  setSelectedCompetitorDetails(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCompetitorModal;

