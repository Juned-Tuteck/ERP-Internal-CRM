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
import ComplianceFileUpload from '../../../components/ComplianceFileUpload';

interface AddAssociateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (AssociateData: any) => void;
  initialData?: any;
  onDataChange?: () => void; // Called when data is updated (e.g., branch save)
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
  AssociateCategory?: string;
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

const AddAssociateModal: React.FC<AddAssociateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  onDataChange,
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
      AssociateType: "",
      AssociatePotential: "",
      pincode: "",
      street: "",
      googleLocation: "",
      addressType: "HO",
      currentStatus: "Active",
      blacklistReason: "",
      AssociateCategory: "",
      riskLevel: "",
      creditDays: "",
      tdsApplicability: "",
      active: true,
      AssociateGroup: "",
      AssociateSubGroup: "",
      alternateNumber: "",
      AssociateClassification: "",
      experience: "",  // Added missing experience field
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

  const [createdAssociateId, setCreatedAssociateId] = useState<string | null>(
    initialData?.Associate_id || initialData?.id || null
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

  // Associate autocomplete states
  const [AssociateSuggestions, setAssociateSuggestions] = useState<Array<{ id: string, name: string }>>([]);
  const [showAssociatePopup, setShowAssociatePopup] = useState(false);
  const AssociateInputRef = useRef<HTMLDivElement>(null);

  // Associate details modal states
  const [showAssociateDetailsModal, setShowAssociateDetailsModal] = useState(false);
  const [selectedAssociateDetails, setSelectedAssociateDetails] = useState<any>(null);
  const [loadingAssociateDetails, setLoadingAssociateDetails] = useState(false);

  // Temporary Associates states
  const [tempAssociates, setTempAssociates] = useState<Array<{ Associate_id: string; business_name: string }>>([]);
  const [selectedTempAssociateId, setSelectedTempAssociateId] = useState<string>("");
  const [tempAssociateComplianceFiles, setTempAssociateComplianceFiles] = useState<any[]>([]);
  const [originalTempAssociateData, setOriginalTempAssociateData] = useState<any>(null);

  // Clear modal state function
  const clearModalState = () => {
    // Always reset to step 1 and clear form data (both create and edit mode)
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
      AssociateType: "",
      AssociatePotential: "",
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
      AssociateCategory: "",
      riskLevel: "",
      creditDays: "",
      tdsApplicability: "",
      active: true,
      AssociateGroup: "",
      AssociateSubGroup: "",
      alternateNumber: "",
      AssociateClassification: "",
      experience: "",
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
    setValidationErrors({});
    setContactPersonErrors({});
    setBranchErrors({});
    setTouched({});
    setFileErrors([]);
    setActiveFileTab(0);
    setIsLoading(false);
    setSelectedTempAssociateId("");
    setTempAssociateComplianceFiles([]);
    setOriginalTempAssociateData(null);
    setOriginalContactPersons([]);
    setCreatedAssociateId(null);  // Reset created associate ID
    setPendingFiles({ PAN: null, TAN: null, GST: null, BANK: null });  // Clear pending files
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
    AssociateType: "associate_type",
    AssociatePotential: "associate_potential",
    pincode: "pincode",
    street: "street",
    googleLocation: "google_location",
    addressType: "address_type",
    currentStatus: "current_status",
    blacklistReason: "blacklist_reason",
    AssociateCategory: "customer_category",
    riskLevel: "risk_level",
    creditDays: "credit_days",
    tdsApplicability: "tds_applicability",
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
    AssociateGroup: "customer_group",
    AssociateSubGroup: "customer_sub_group",
    alternateNumber: "alternate_number",
    AssociateClassification: "customer_classification",
    experience: "experience",  // Added experience field mapping
    msmeRegistered: "msme_registered",
    udyamRegistrationNumber: "udyam_registration_number",
    nameOfBranchProject: "name_of_branch_project",
    zone: "zone",
    hoContactNumber: "ho_contact_number",
    hoEmailId: "ho_email_id",
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
    street: "street",
    googleLocation: "google_location",
    addressType: "address_type",
    currentStatus: "current_status",
    blacklistReason: "blacklist_reason",
    customerCategory: "customer_category",
    riskLevel: "risk_level",
    creditDays: "credit_days",
    gstNumber: "gst_number",
    panNumber: "pan_number",
    tanNumber: "tan_number",
    bankName: "bank_name",
    bankAccountNumber: "bank_account_number",
    ifscCode: "ifsc_code",
    zone: "zone",
    nameOfBranchProject: "name_of_branch_project",
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
  const AssociateTypes = ["Industrial", "Hospital", "It", "Commercial", "Residential"];
  const AssociatePotentials = ["High", "Medium", "Low"];

  // New dropdown values
  const AssociateGroups = ["Architect", "Interior", "Consultant", "Free Lancer", "Other"];
  const AssociateSubGroups = ["Sub Group A", "Sub Group B", "Sub Group C"];
  const AssociateClassifications = ["A – High Value", "B – Medium Value", "C – Low Value"];
  const addressTypes = ["HO", "Branch", "Project"];
  const statusOptions = ["Active", "Inactive", "Blacklisted"];
  const riskLevels = ["Low", "Mid", "High"];
  const creditDaysOptions = ["0", "10", "20", "30", "45"];
  const communicationModes = ["WhatsApp", "Email", "Call", "VC", "Physical"];
  // const msmeOptions = ["Yes", "No"];

  useEffect(() => {
    if (initialData) {
      // Normalize field names to match formData structure (handle casing differences)
      const normalizedData = {
        ...initialData,
        // Normalize Associate-related fields (lowercase to PascalCase)
        AssociateType: initialData.AssociateType || initialData.associateType || "",
        AssociatePotential: initialData.AssociatePotential || initialData.associatePotential || "",
        AssociateCategory: initialData.AssociateCategory || initialData.associateCategory || "",
        AssociateGroup: initialData.AssociateGroup || initialData.associateGroup || "",
        AssociateSubGroup: initialData.AssociateSubGroup || initialData.associateSubGroup || "",
        AssociateClassification: initialData.AssociateClassification || initialData.associateClassification || "",
        // Ensure branches start with isEditing: false in edit mode
        branches: (initialData.branches || []).map((branch: Branch) => ({
          ...branch,
          isEditing: false,
        })),
      };

      setFormData(normalizedData);
      setInitialFiles(initialData.uploadedFiles || []);
      setUploadedFiles([]); // Reset uploaded files for edit mode
      // Store original contact persons for comparison
      setOriginalContactPersons(initialData.contactPersons || []);
      // Store original branches for comparison
      setOriginalBranches(initialData.branches || []);
    } else if (initialData === null) {
      // Clear form data when initialData is explicitly set to null
      clearModalState();
    }
  }, [initialData]);

  // Fetch and filter Associates when businessName changes
  useEffect(() => {
    const fetchAndFilterAssociates = async () => {
      if (formData.businessName.length > 2) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/associate`
          );
          const AssociateData = response.data.data;
          console.log("AssociateData", AssociateData)

          const filteredAssociates = AssociateData
            .filter((Associate: any) =>
              Associate.business_name.trim()
                .toLowerCase()
                .includes(formData.businessName.toLowerCase())
            )
            .map((Associate: any) => ({
              id: Associate.associate_id,
              name: Associate.business_name
            }));
          console.log("filteredAssociates", filteredAssociates)
          setAssociateSuggestions(filteredAssociates);
          setShowAssociatePopup(filteredAssociates.length > 0);
        } catch (error) {
          console.error("Error fetching Associates:", error);
          setAssociateSuggestions([]);
          setShowAssociatePopup(false);
        }
      } else {
        setAssociateSuggestions([]);
        setShowAssociatePopup(false);
      }
    };

    fetchAndFilterAssociates();
  }, [formData.businessName]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        AssociateInputRef.current &&
        !AssociateInputRef.current.contains(event.target as Node)
      ) {
        setShowAssociatePopup(false);
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

  // Fetch Associate details
  const fetchAssociateDetails = async (AssociateId: string) => {
    setLoadingAssociateDetails(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate/${AssociateId}`
      );
      if (response.data.success) {
        setSelectedAssociateDetails(response.data.data);
        setShowAssociateDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching Associate details:", error);
      alert("Failed to fetch Associate details. Please try again.");
    } finally {
      setLoadingAssociateDetails(false);
    }
  };

  // Fetch temporary Associates on mount
  // useEffect(() => {
  //   const fetchTempAssociates = async () => {
  //     try {
  //       const { getTempAssociates } = await import('../../../utils/AssociateApi');
  //       const tempAssociatesData = await getTempAssociates();
  //       setTempAssociates(tempAssociatesData);
  //     } catch (error) {
  //       console.error('Error fetching temporary Associates:', error);
  //       setTempAssociates([]);
  //     }
  //   };
  //   fetchTempAssociates();
  // }, []);

  // Handle temporary Associate selection
  const handleTempAssociateSelect = async (AssociateId: string) => {
    setSelectedTempAssociateId(AssociateId);

    if (!AssociateId) {
      // Clear compliance files when deselecting
      setTempAssociateComplianceFiles([]);
      return;
    }

    try {
      // Fetch the full Associate details
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/associate/${AssociateId}`
      );

      if (response.data.success) {
        const AssociateData = response.data.data;

        console.log('Associate Data:', AssociateData);
        console.log('Compliance Files:', AssociateData.compliancefiles);

        // Store compliance files if available - keep only the latest file for each document type
        if (AssociateData.compliancefiles && Array.isArray(AssociateData.compliancefiles)) {
          console.log('Setting compliance files:', AssociateData.compliancefiles);

          // Group files by document type and entity level, then get the latest one
          const latestFiles: any[] = [];
          const fileGroups: { [key: string]: any[] } = {};

          // Group files by documentType + entityLevel
          AssociateData.compliancefiles.forEach((file: any) => {
            const key = `${file.documentType}_${file.entityLevel}`;
            if (!fileGroups[key]) {
              fileGroups[key] = [];
            }
            fileGroups[key].push(file);
          });

          // For each group, get the file with the latest createdAt
          Object.values(fileGroups).forEach((files: any[]) => {
            const latestFile = files.reduce((latest, current) => {
              const latestDate = new Date(latest.createdAt || latest.created_at);
              const currentDate = new Date(current.createdAt || current.created_at);
              return currentDate > latestDate ? current : latest;
            });
            latestFiles.push(latestFile);
          });

          console.log('Latest compliance files (filtered):', latestFiles);
          setTempAssociateComplianceFiles(latestFiles);
        } else {
          console.log('No compliance files found or not an array');
          setTempAssociateComplianceFiles([]);
        }

        // Store original Associate data for comparison
        setOriginalTempAssociateData({
          businessName: AssociateData.business_name || "",
          contactNo: AssociateData.contact_number || "",
          email: AssociateData.email || "",
          country: AssociateData.country || "India",
          currency: Array.isArray(AssociateData.currency)
            ? AssociateData.currency
            : (typeof AssociateData.currency === 'string'
              ? JSON.parse(AssociateData.currency)
              : []),
          state: AssociateData.state || "",
          district: AssociateData.district || "",
          city: AssociateData.city || "",
          AssociateType: AssociateData.Associate_type || "",
          AssociatePotential: AssociateData.Associate_potential || "",
          pincode: AssociateData.pincode || "",
          street: AssociateData.street || "",
          googleLocation: AssociateData.google_location || "",
          addressType: AssociateData.address_type || "HO",
          zone: AssociateData.zone || "",
          nameOfBranchProject: AssociateData.name_of_branch_project || "",
          hoContactNumber: AssociateData.ho_contact_number || "",
          hoEmailId: AssociateData.ho_email_id || "",
          currentStatus: AssociateData.current_status || "Active",
          blacklistReason: AssociateData.blacklist_reason || "",
          AssociateCategory: AssociateData.Associate_category || "",
          riskLevel: AssociateData.risk_level || "",
          creditDays: AssociateData.credit_days || "",
          tdsApplicability: AssociateData.tds_applicability || "",
          active: AssociateData.is_active !== undefined ? AssociateData.is_active : true,
          AssociateGroup: AssociateData.Associate_group || "",
          AssociateSubGroup: AssociateData.Associate_sub_group || "",
          alternateNumber: AssociateData.alternate_number || "",
          AssociateClassification: AssociateData.Associate_classification || "",
          msmeRegistered: AssociateData.msme_registered || "No",
          udyamRegistrationNumber: AssociateData.udyam_registration_number || "",
          panNumber: AssociateData.pan_number || "",
          tanNumber: AssociateData.tan_number || "",
          gstNumber: AssociateData.gst_number || "",
          bankName: AssociateData.bank_name || "",
          bankAccountNumber: AssociateData.bank_account_number || "",
          branchName: AssociateData.branch_name || "",
          ifscCode: AssociateData.ifsc_code || "",
        });

        // Populate form data with Associate information
        setFormData((prev: typeof formData) => ({
          ...prev,
          businessName: AssociateData.business_name || "",
          contactNo: AssociateData.contact_number || "",
          email: AssociateData.email || "",
          country: AssociateData.country || "India",
          currency: Array.isArray(AssociateData.currency)
            ? AssociateData.currency
            : (typeof AssociateData.currency === 'string'
              ? JSON.parse(AssociateData.currency)
              : []),
          state: AssociateData.state || "",
          district: AssociateData.district || "",
          city: AssociateData.city || "",
          AssociateType: AssociateData.Associate_type || "",
          AssociatePotential: AssociateData.Associate_potential || "",
          pincode: AssociateData.pincode || "",
          street: AssociateData.street || "",
          googleLocation: AssociateData.google_location || "",
          addressType: AssociateData.address_type || "HO",
          zone: AssociateData.zone || "",
          nameOfBranchProject: AssociateData.name_of_branch_project || "",
          hoContactNumber: AssociateData.ho_contact_number || "",
          hoEmailId: AssociateData.ho_email_id || "",
          currentStatus: AssociateData.current_status || "Active",
          blacklistReason: AssociateData.blacklist_reason || "",
          AssociateCategory: AssociateData.Associate_category || "",
          riskLevel: AssociateData.risk_level || "",
          creditDays: AssociateData.credit_days || "",
          tdsApplicability: AssociateData.tds_applicability || "",
          active: AssociateData.is_active !== undefined ? AssociateData.is_active : true,
          AssociateGroup: AssociateData.Associate_group || "",
          AssociateSubGroup: AssociateData.Associate_sub_group || "",
          alternateNumber: AssociateData.alternate_number || "",
          AssociateClassification: AssociateData.Associate_classification || "",
          msmeRegistered: AssociateData.msme_registered || "No",
          udyamRegistrationNumber: AssociateData.udyam_registration_number || "",
          panNumber: AssociateData.pan_number || "",
          tanNumber: AssociateData.tan_number || "",
          gstNumber: AssociateData.gst_number || "",
          bankName: AssociateData.bank_name || "",
          bankAccountNumber: AssociateData.bank_account_number || "",
          branchName: AssociateData.branch_name || "",
          ifscCode: AssociateData.ifsc_code || "",
          contactPersons: AssociateData.contactpersons ? AssociateData.contactpersons.map((contact: any) => ({
            id: contact.contactId || Math.random().toString(36).substr(2, 9),
            name: contact.name || "",
            phone: contact.phone || "",
            email: contact.email || "",
            designation: contact.designation || "",
            alternativeNumber: contact.alternative_number || "",
            dateOfBirth: contact.date_of_birth || "",
            anniversaryDate: contact.anniversary_date || "",
            communicationMode: contact.communication_mode || [],
            isEditing: false,
          })) : prev.contactPersons,
        }));

        // Store original contact persons for comparison
        if (AssociateData.contactpersons) {
          setOriginalContactPersons(AssociateData.contactpersons.map((contact: any) => ({
            id: contact.contactId || Math.random().toString(36).substr(2, 9),
            name: contact.name || "",
            phone: contact.phone || "",
            email: contact.email || "",
            designation: contact.designation || "",
            alternativeNumber: contact.alternative_number || "",
            dateOfBirth: contact.date_of_birth || "",
            anniversaryDate: contact.anniversary_date || "",
            communicationMode: contact.communication_mode || [],
            isEditing: false,
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching temporary Associate details:", error);
      alert("Failed to load temporary Associate details. Please try again.");
    }
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
      if (name === "zone") {
        // When zone changes, reset state, district and city
        updatedFormData.state = "";
        updatedFormData.district = "";
        updatedFormData.city = "";
      } else if (name === "state") {
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
      const Associateror = rule.custom(value);
      if (Associateror) {
        return Associateror;
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
      AssociateType: "Associate Type",
      AssociatePotential: "Associate Potential",
      pincode: "Pincode",
      panNumber: "PAN Number",
      tanNumber: "TAN Number",
      gstNumber: "GST Number",
      bankName: "Bank Name",
      bankAccountNumber: "Bank Account Number",
      branchName: "Branch Name",
      ifscCode: "IFSC Code",
      AssociateGroup: "Associate Group",
      AssociateSubGroup: "Associate Sub Group",
      alternateNumber: "Alternate Number",
      AssociateClassification: "Associate Classification",
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
          Associate_id: formData.id,
          created_by: currentUserId
        };

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/associate-contact`,
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
            `${import.meta.env.VITE_API_BASE_URL}/associate-contact/${id}`,
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
          `${import.meta.env.VITE_API_BASE_URL}/associate-contact/${id}`,
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
      AssociateCategory: "",
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

  // const copyFromAssociateDetails = (branchId: string) => {
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
          `${import.meta.env.VITE_API_BASE_URL}/associate-branch/${id}`,
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
          associate_id: formData.id,
        };

        // Map UI fields to backend fields using branchKeymap
        Object.keys(branchKeymap).forEach((uiKey) => {
          if (uiKey !== "id" && branch[uiKey as keyof Branch] !== undefined) {
            const backendKey = branchKeymap[uiKey as keyof typeof branchKeymap];
            payload[backendKey] = branch[uiKey as keyof Branch];
          }
        });

        if (currentUserId) payload.created_by = currentUserId;

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/associate-branch`,
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
        const actualBranchId = response.data.data?.Associate_branch_id || response.data.data?.id;

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

        if (currentUserId) changedFields.created_by = currentUserId;

        // Only make API call if there are changes
        if (Object.keys(changedFields).length > 0) {

          if (initialData?.status === "approved" || initialData?.approvalStatus === "approved") {
            await axios.put(
              `${import.meta.env.VITE_API_BASE_URL}/associate/${formData.id}`,
              { approval_status: "REVISIT" },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }

          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/associate-branch/${id}`,
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

      // Notify parent component that data has changed
      onDataChange?.();
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
          Associate_branch_id: branchId,
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
          `${import.meta.env.VITE_API_BASE_URL}/associate-branch-contact`,
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
            }/associate-branch-contact/${contactId}`,
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
          }/associate-branch-contact/${contactId}`,
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

  // Upload files for Associate
  const uploadFilesForAssociate = async (
    AssociateId: string,
    files: File[],
    onProgress?: (percent: number) => void
  ) => {
    if (!AssociateId || files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("upload_by", userData?.id || "");
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/associate-file/${AssociateId}/files`,
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

  // Upload pending files after Associate creation (File Queue System)
  const uploadPendingFiles = async (AssociateId: string) => {
    const uploadPromises: Promise<any>[] = [];

    try {
      // Import the upload function
      const { uploadComplianceFile } = await import('../../../utils/associateApi');

      // Upload PAN if selected
      if (pendingFiles.PAN) {
        console.log('Uploading pending PAN file...');
        uploadPromises.push(
          uploadComplianceFile(
            AssociateId,
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
          uploadComplianceFile(
            AssociateId,
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
          uploadComplianceFile(
            AssociateId,
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
          uploadComplianceFile(
            AssociateId,
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
      const { uploadComplianceFile } = await import('../../../utils/associateApi');

      // Upload PAN if selected
      if (branchPendingFiles.PAN) {
        console.log(`Uploading pending PAN file for branch ${createdBranchId}...`);
        uploadPromises.push(
          uploadComplianceFile(
            createdAssociateId!,
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
          uploadComplianceFile(
            createdAssociateId!,
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
          uploadComplianceFile(
            createdAssociateId!,
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
          uploadComplianceFile(
            createdAssociateId!,
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

  // Copy Billing Address, Compliance, and Bank Details from Associate (HO) to Branch
  const copyFromAssociateDetails = (branchId: string) => {
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
            AssociateCategory: prev.AssociateCategory,
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
    // In create mode, ensure Step 1 is completed before allowing submission of Step 2 or 3
    if (!isEditMode && currentStep > 1 && !isStep1Completed()) {
      alert("Please complete Step 1 (General Information) before proceeding. Click on Step 1 in the breadcrumb to go back.");
      return;
    }

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
        "AssociateType",
        "AssociatePotential",
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
        let AssociateId: string;

        // Check if this Associate is from a temp lead
        if (selectedTempAssociateId) {
          // Update existing temp Associate - set is_temp_Associate to false and include changed fields
          const updatePayload: Record<string, any> = {
            is_temp_Associate: false
          };

          // Field mapping from UI to backend
          const fieldMapping: Record<string, string> = {
            businessName: 'business_name',
            contactNo: 'contact_number',
            email: 'email',
            country: 'country',
            currency: 'currency',
            state: 'state',
            district: 'district',
            city: 'city',
            AssociateType: 'Associate_type',
            AssociatePotential: 'Associate_potential',
            pincode: 'pincode',
            street: 'street',
            googleLocation: 'google_location',
            addressType: 'address_type',
            zone: 'zone',
            nameOfBranchProject: 'name_of_branch_project',
            hoContactNumber: 'ho_contact_number',
            hoEmailId: 'ho_email_id',
            currentStatus: 'current_status',
            blacklistReason: 'blacklist_reason',
            AssociateCategory: 'Associate_category',
            riskLevel: 'risk_level',
            creditDays: 'credit_days',
            tdsApplicability: 'tds_applicability',
            active: 'is_active',
            AssociateGroup: 'Associate_group',
            AssociateSubGroup: 'Associate_sub_group',
            alternateNumber: 'alternate_number',
            AssociateClassification: 'Associate_classification',
            msmeRegistered: 'msme_registered',
            udyamRegistrationNumber: 'udyam_registration_number',
            panNumber: 'pan_number',
            tanNumber: 'tan_number',
            gstNumber: 'gst_number',
            bankName: 'bank_name',
            bankAccountNumber: 'bank_account_number',
            branchName: 'branch_name',
            ifscCode: 'ifsc_code',
          };

          // Compare current form data with original data and add changed fields
          if (originalTempAssociateData) {
            Object.keys(fieldMapping).forEach((uiKey) => {
              const currentValue = formData[uiKey as keyof typeof formData];
              const originalValue = originalTempAssociateData[uiKey];

              // Compare values (handle arrays separately)
              let hasChanged = false;
              if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
                // For arrays (like currency), compare stringified versions
                hasChanged = JSON.stringify(currentValue) !== JSON.stringify(originalValue);
              } else {
                // For other values, direct comparison
                hasChanged = currentValue !== originalValue;
              }

              // If value has changed, add to payload
              if (hasChanged) {
                const backendKey = fieldMapping[uiKey as keyof typeof fieldMapping];
                updatePayload[backendKey] = currentValue;
              }
            });
          }

          console.log('Update payload for temp Associate:', updatePayload);

          const updateResponse = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/associate/${selectedTempAssociateId}`,
            updatePayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (
            updateResponse.status !== 200 &&
            updateResponse.status !== 201
          ) {
            throw new Error("Failed to update Associate");
          }

          console.log("Temp Associate updated successfully:", updateResponse.data);
          AssociateId = selectedTempAssociateId;
          setCreatedAssociateId(AssociateId);
        } else {
          // Step 1: Create Associate with all fields except contact persons
          const AssociatePayload: Record<string, any> = {};

          // Map UI fields to backend fields using keymap (excluding contact persons)
          Object.keys(keymap).forEach((uiKey) => {
            if (formData[uiKey as keyof typeof formData] !== undefined) {
              const backendKey = keymap[uiKey as keyof typeof keymap];
              AssociatePayload[backendKey] =
                formData[uiKey as keyof typeof formData];
            }
          });

          // Set approval_status to DRAFT if branches are not completed, otherwise use default (PENDING)
          // if (formData.branches.length === 0) {
          //   AssociatePayload.approval_status = "DRAFT";
          // }

          // add created_by for audit
          if (currentUserId) AssociatePayload.created_by = currentUserId;

          // Call POST API for Associate
          const AssociateResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/associate`,
            AssociatePayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (
            AssociateResponse.status !== 200 &&
            AssociateResponse.status !== 201
          ) {
            throw new Error("Failed to create Associate");
          }

          console.log("Associate created successfully:", AssociateResponse.data);

          // Store the Associate ID from the response
          AssociateId = AssociateResponse.data.data.associate_id;
          setCreatedAssociateId(AssociateId);
        }

        // ------------------------------------------------------------------------------------------For notifications
        try {
          await sendNotification({
            receiver_ids: ['admin'],
            title: `CRM - New Associate Registration : ${formData.business_name || 'Associate'}`,
            message: `Associate ${formData.business_name || 'Associate'} registered successfully and sent for approval!by ${userData?.name || 'a user'}`,
            service_type: 'CRM',
            link: '/Associates',
            sender_id: userRole || 'user',
            access: {
              module: "CRM",
              menu: "Associates",
            }
          });
          console.log(`Notification sent for CRM Associate ${formData.business_name || 'Associate'}`);
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
          // Continue with the flow even if notification fails
        }
        // ----------------------------------------------------------------------------------------

        // Update formData with the Associate ID
        setFormData((prev: typeof formData) => ({ ...prev, id: AssociateId }));

        // Step 2: Handle contact persons intelligently
        if (formData.contactPersons.length > 0) {
          // If this is from a temp Associate, compare with original contact persons
          if (selectedTempAssociateId) {
            // Separate new and modified contact persons
            const newContactPersons: any[] = [];
            const modifiedContactPersons: any[] = [];

            formData.contactPersons.forEach((contact: ContactPerson) => {
              // Find if this contact existed in original data
              console.log("Contact Person:", contact);
              console.log("Original Contact Persons:", originalContactPersons);
              const originalContact = originalContactPersons.find(
                (orig) => orig.id === contact.id
              );

              if (!originalContact) {
                // This is a new contact person
                newContactPersons.push(contact);
              } else {
                // Check if contact has been modified
                const hasChanged =
                  contact.name !== originalContact.name ||
                  contact.phone !== originalContact.phone ||
                  contact.email !== originalContact.email ||
                  contact.designation !== originalContact.designation ||
                  contact.alternativeNumber !== originalContact.alternativeNumber ||
                  contact.dateOfBirth !== originalContact.dateOfBirth ||
                  contact.anniversaryDate !== originalContact.anniversaryDate ||
                  JSON.stringify(contact.communicationMode) !== JSON.stringify(originalContact.communicationMode);

                if (hasChanged) {
                  modifiedContactPersons.push(contact);
                }
                // If unchanged, we skip it (don't add to any array)
              }
            });

            // Create new contact persons via bulk API
            if (newContactPersons.length > 0) {
              const newContactsPayload = newContactPersons.map((contact: any) => ({
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
                designation: contact.designation || "",
                alternative_number: contact.alternativeNumber || "",
                date_of_birth: contact.dateOfBirth || "",
                anniversary_date: contact.anniversaryDate || "",
                communication_mode: contact.communicationMode || [],
                associate_id: createdAssociateId,
                created_by: currentUserId
              }));

              console.log("Creating new contact persons:", newContactsPayload);

              const newContactResponse = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/associate-contact/bulk`,
                newContactsPayload,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (
                newContactResponse.status !== 200 &&
                newContactResponse.status !== 201
              ) {
                throw new Error("Failed to create new contact persons");
              }

              console.log("New contact persons created successfully:", newContactResponse.data);
            }

            // Update modified contact persons via PUT API
            if (modifiedContactPersons.length > 0) {
              console.log("Updating modified contact persons:", modifiedContactPersons);

              for (const contact of modifiedContactPersons) {
                const updateContactPayload = {
                  name: contact.name,
                  phone: contact.phone,
                  email: contact.email,
                  designation: contact.designation || "",
                  alternative_number: contact.alternativeNumber || "",
                  date_of_birth: contact.dateOfBirth || "",
                  anniversary_date: contact.anniversaryDate || "",
                  communication_mode: contact.communicationMode || [],
                  updated_by: currentUserId
                };

                const updateContactResponse = await axios.put(
                  `${import.meta.env.VITE_API_BASE_URL}/associate-contact/${contact.id}`,
                  updateContactPayload,
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (
                  updateContactResponse.status !== 200 &&
                  updateContactResponse.status !== 201
                ) {
                  throw new Error(`Failed to update contact person ${contact.name}`);
                }

                console.log(`Contact person ${contact.name} updated successfully`);
              }
            }

            console.log(`Contact persons processed: ${newContactPersons.length} new, ${modifiedContactPersons.length} modified, ${formData.contactPersons.length - newContactPersons.length - modifiedContactPersons.length} unchanged`);
          } else {
            // Normal flow: create all contact persons via bulk API
            const contactPersonsPayload = formData.contactPersons.map(
              (contact: any) => ({
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
                designation: contact.designation || "",
                alternative_number: contact.alternativeNumber || "",
                date_of_birth: contact.dateOfBirth || "",
                anniversary_date: contact.anniversaryDate || "",
                communication_mode: contact.communicationMode || [],
                associate_id: AssociateId,
                created_by: currentUserId
              })
            );
            console.log("Creating contact persons:", contactPersonsPayload);

            const contactResponse = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/associate-contact/bulk`,
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
        }

        // Auto-upload pending compliance files (File Queue System)
        await uploadPendingFiles(AssociateId);
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
              associate_id: formData.id,
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

            if (currentUserId) payload.created_by = currentUserId;
            return payload;
          });

          console.log("Creating branches:", branchesPayload);

          const branchResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/associate-branch/bulk`,
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
              // API returns 'id' field for branch ID, not 'Associate_branch_id'
              const branchId = createdBranch?.id || createdBranch?.Associate_branch_id;
              console.log(`Processing branch ${index}:`, { branchId: branch.id, createdBranchId: branchId });

              if (createdBranch && branchId) {
                await uploadPendingBranchFiles(branch.id, branchId);
              }
            });
            await Promise.all(uploadPromises);
            console.log('Branch file uploads completed');
          }

          // Update Associate status from DRAFT to PENDING since branches are now completed
          if (createdAssociateId) {
            try {
              await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/associate/${createdAssociateId}`,
                { approval_status: "PENDING" },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log("Associate status updated to PENDING");
            } catch (updateError) {
              console.error("Failed to update Associate status:", updateError);
            }
          }

          // Step 2: Create branch contact persons in bulk if any exist
          const allBranchContactPersons: any[] = [];

          formData.branches.forEach((branch: Branch, branchIndex: number) => {
            if (branch.contactPersons && branch.contactPersons.length > 0) {
              // Get the corresponding created branch ID
              const createdBranchId =
                createdBranchesData[branchIndex]?.id ||
                createdBranchesData[branchIndex]?.Associate_branch_id;

              branch.contactPersons.forEach((contact: ContactPerson) => {
                const contactPayload: Record<string, any> = {
                  associate_branch_id: createdBranchId,
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
              }/associate-branch-contact/bulk`,
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
      console.log("Uploading files for Associate...");
      const AssociateId = createdAssociateId || formData.id;

      if (!AssociateId) {
        console.error("No AssociateId found. Cannot upload files.");
        return;
      }

      if (uploadedFiles.length === 0) {
        // No files to upload, notify parent and close the modal
        onSubmit(formData);
        onClose();
        return;
      }

      setIsLoading(true);
      try {
        await uploadFilesForAssociate(AssociateId, uploadedFiles, (percent) => {
          console.log("Upload progress:", percent);
        });

        console.log("Files uploaded successfully");
        // Notify parent component of successful associate creation
        onSubmit(formData);
        // Close modal after successful upload
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

  // Validate if Step 1 is completed
  const isStep1Completed = (): boolean => {
    // In edit mode, step 1 is always considered completed
    if (isEditMode) return true;

    // Check if Associate has been created (createdAssociateId exists)
    if (createdAssociateId) return true;

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
      "AssociateType",
      "AssociatePotential",
      "pincode",
    ];

    // Check if all required fields are filled
    for (const fieldName of step1Fields) {
      const value = formData[fieldName as keyof typeof formData];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return false;
      }
    }

    // Check if at least one contact person exists
    if (formData.contactPersons.length === 0) {
      return false;
    }

    return true;
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

      // Get the associate ID from initialData or createdAssociateId
      const associateId = initialData?.Associate_id || initialData?.id || createdAssociateId;

      if (!associateId) {
        console.error("No associate ID found for update");
        throw new Error("Associate ID is required for update");
      }

      console.log("Submitting edit with payload:", backendPayload, "Associate ID:", associateId);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/associate/${associateId}`,
        backendPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update Associate");
      }

      console.log("Associate updated successfully:", response.data);

      // Call onSubmit to trigger refresh in parent component
      if (onSubmit) {
        onSubmit(response.data);
      }

      handleClose();
    } catch (error) {
      console.error("Error updating Associate:", error);
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
        AssociateType: "",
        AssociatePotential: "",
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
        <div ref={AssociateInputRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Associate Name *
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
          {showAssociatePopup && AssociateSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {loadingAssociateDetails && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  Loading Associate details...
                </div>
              )}
              {!loadingAssociateDetails &&
                AssociateSuggestions.map((Associate) => (
                  <div
                    key={Associate.id}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => {
                      fetchAssociateDetails(Associate.id);
                    }}
                  >
                    {Associate.name}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Select From Temporary Associate */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select From Temporary Associate
          </label>
          <select
            value={selectedTempAssociateId}
            onChange={(e) => handleTempAssociateSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Temporary Associate</option>
            {tempAssociates.map((Associate) => (
              <option key={Associate.Associate_id} value={Associate.Associate_id}>
                {Associate.business_name}
              </option>
            ))}
          </select>
        </div> */}

        {/* Associate Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Associate Group
          </label>
          <select
            name="AssociateGroup"
            value={formData.AssociateGroup}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Group</option>
            {AssociateGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {/* Associate Sub Group */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Associate Sub Group
          </label>
          <select
            name="AssociateSubGroup"
            value={formData.AssociateSubGroup}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Sub Group</option>
            {AssociateSubGroups.map((subGroup) => (
              <option key={subGroup} value={subGroup}>
                {subGroup}
              </option>
            ))}
          </select>
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience *
          </label>
          <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        {/* Industry Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry Type *
          </label>
          <select
            name="AssociateType"
            value={formData.AssociateType}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Type</option>
            {AssociateTypes.map((type) => (
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
                    className="w-full px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 text-sm"
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

        {/* Associate Classification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Associate Classification
          </label>
          <select
            name="AssociateClassification"
            value={formData.AssociateClassification}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Classification</option>
            {AssociateClassifications.map((cls) => (
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

        {/* TDS Applicability */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TDS Applicability
          </label>
          <input
            type="text"
            name="tdsApplicability"
            value={formData.tdsApplicability}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter TDS details"
          />
        </div> */}

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
            {/* HO Contact Number (Associate specific) */}
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

            {/* HO Email ID (Associate specific) */}
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

            {/* Country (Associate specific) */}
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
                {formData.currency.map((c: any) => (
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
            Zone
          </label>
          <select
            name={!isBranch ? "zone" : undefined}
            value={data.zone || ""}
            onChange={(e) => onChange("zone", e.target.value)}
            disabled={readOnly}
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
            value={data.state}
            onChange={(e) => onChange("state", e.target.value)}
            disabled={readOnly || !data.zone}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors?.state
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } disabled:bg-gray-100`}
          >
            <option value="">Select State</option>
            {data.zone &&
              states
                .filter((s) => s.zone_id === zones.find(z => z.name === data.zone)?.id)
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
            value={data.district}
            onChange={(e) => onChange("district", e.target.value)}
            disabled={readOnly || !data.state}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select District</option>
            {data.state &&
              districts
                .filter((d) => d.state_id === states.find(s => s.name === data.state)?.id)
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
              Associate Potential *
            </label>
            <input
              type="number"
              name="AssociatePotential"
              value={data.AssociatePotential}
              onChange={(e) => onChange("AssociatePotential", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Associate Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Associate Category
          </label>
          <select
            name={!isBranch ? "AssociateCategory" : undefined}
            value={data.AssociateCategory || ""}
            onChange={(e) => onChange("AssociateCategory", e.target.value)}
            disabled={readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Category</option>
            {AssociatePotentials.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

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
        <div>
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
        </div>

        {/* Credit Days */}
        <div>
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
        </div>
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
          {createdAssociateId && isEditMode && (
            <div className="mt-2">
              <ComplianceFileUpload
                entityType="associate"
                entityId={createdAssociateId}
                documentType="GST"
                entityLevel={isBranch ? "BRANCH" : "HO"}
                branchId={isBranch ? branchId : null}
                uploadBy={currentUserId}
                disabled={!createdAssociateId}
              />
            </div>
          )}
          {/* Queue mode: Show upload before Associate creation */}
          {!createdAssociateId && !isBranch && !isEditMode && (
            <div className="mt-2">
              <ComplianceFileUpload
                entityType="associate"
                entityId={null}
                documentType="GST"
                entityLevel="HO"
                branchId={null}
                uploadBy={currentUserId}
                onFileSelect={(file) => setPendingFiles(prev => ({ ...prev, GST: file }))}
                queuedFile={pendingFiles.GST}
              />

              {/* Display temp Associate's existing GST file */}
              {tempAssociateComplianceFiles.length > 0 && selectedTempAssociateId && (
                <div className="mt-2">
                  {tempAssociateComplianceFiles
                    .filter(file => file.documentType === 'GST' && file.entityLevel === 'HO')
                    .map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        <span className="text-blue-600">📄</span>
                        <span className="flex-1">{file.originalName}</span>
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL}/associate-compliance-file/${selectedTempAssociateId}/compliance-files/${file.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View
                        </a>
                      </div>
                    ))}
                </div>
              )}

            </div>
          )}
          {/* Branch queue mode: Show upload for branches before branch creation */}
          {isBranch && !isEditMode && queueCallbacks?.onGSTSelect && (
            <div className="mt-2">
              <ComplianceFileUpload
                AssociateId={null}
                documentType="GST"
                entityLevel="BRANCH"
                AssociateBranchId={null}
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
          {createdAssociateId && isEditMode && (
            <div className="mt-2">
              <ComplianceFileUpload
                entityType="associate"
                entityId={createdAssociateId}
                documentType="PAN"
                entityLevel={isBranch ? "BRANCH" : "HO"}
                branchId={isBranch ? branchId : null}
                uploadBy={currentUserId}
                disabled={!createdAssociateId}
              />
            </div>
          )}
          {/* Queue mode: Show upload before Associate creation */}
          {!createdAssociateId && !isEditMode && !isBranch && (
            <div className="mt-2">
              <ComplianceFileUpload
                AssociateId={null}
                documentType="PAN"
                entityLevel="HO"
                AssociateBranchId={null}
                uploadBy={currentUserId}
                onFileSelect={(file) => setPendingFiles(prev => ({ ...prev, PAN: file }))}
                queuedFile={pendingFiles.PAN}
              />
              {/* Display temp Associate's existing PAN file */}
              {tempAssociateComplianceFiles.length > 0 && (
                <div className="mt-2">
                  {tempAssociateComplianceFiles
                    .filter(file => file.documentType === 'PAN' && file.entityLevel === 'HO')
                    .map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        <span className="text-blue-600">📄</span>
                        <span className="flex-1">{file.originalName}</span>
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL}/associate-compliance-file/${selectedTempAssociateId}/compliance-files/${file.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View
                        </a>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          {/* Branch queue mode: Show upload for branches before branch creation */}
          {isBranch && !isEditMode && queueCallbacks?.onPANSelect && (
            <div className="mt-2">
              <ComplianceFileUpload
                AssociateId={null}
                documentType="PAN"
                entityLevel="BRANCH"
                AssociateBranchId={null}
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
          {createdAssociateId && isEditMode && (
            <div className="mt-2">
              <ComplianceFileUpload
                entityType="associate"
                entityId={createdAssociateId}
                documentType="TAN"
                entityLevel={isBranch ? "BRANCH" : "HO"}
                branchId={isBranch ? branchId : null}
                uploadBy={currentUserId}
                disabled={!createdAssociateId}
              />
            </div>
          )}
          {/* Queue mode: Show upload before Associate creation */}
          {!createdAssociateId && !isEditMode && !isBranch && (
            <div className="mt-2">
              <ComplianceFileUpload
                AssociateId={null}
                documentType="TAN"
                entityLevel="HO"
                AssociateBranchId={null}
                uploadBy={currentUserId}
                onFileSelect={(file) => setPendingFiles(prev => ({ ...prev, TAN: file }))}
                queuedFile={pendingFiles.TAN}
              />
              {/* Display temp Associate's existing TAN file */}
              {tempAssociateComplianceFiles.length > 0 && (
                <div className="mt-2">
                  {tempAssociateComplianceFiles
                    .filter(file => file.documentType === 'TAN' && file.entityLevel === 'HO')
                    .map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        <span className="text-blue-600">📄</span>
                        <span className="flex-1">{file.originalName}</span>
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL}/associate-compliance-file/${selectedTempAssociateId}/compliance-files/${file.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View
                        </a>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          {/* Branch queue mode: Show upload for branches before branch creation */}
          {isBranch && !isEditMode && queueCallbacks?.onTANSelect && (
            <div className="mt-2">
              <ComplianceFileUpload
                AssociateId={null}
                documentType="TAN"
                entityLevel="BRANCH"
                AssociateBranchId={null}
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
        {/* Branch Name (Bank Branch) - Associate Only */}

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
        {createdAssociateId && isEditMode && (
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Documents
            </label>
            <ComplianceFileUpload
              entityType="associate"
              entityId={createdAssociateId}
              documentType="BANK"
              entityLevel={isBranch ? "BRANCH" : "HO"}
              branchId={isBranch ? branchId : null}
              uploadBy={currentUserId}
              disabled={!createdAssociateId}
              label="Upload Bank Document (Cancelled Cheque / Bank Proof)"
            />
          </div>
        )}
        {/* Queue mode: Show upload before Associate creation */}
        {!createdAssociateId && !isEditMode && !isBranch && (
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Documents
            </label>
            <ComplianceFileUpload
              AssociateId={null}
              documentType="BANK"
              entityLevel="HO"
              AssociateBranchId={null}
              uploadBy={currentUserId}
              onFileSelect={(file) => setPendingFiles(prev => ({ ...prev, BANK: file }))}
              queuedFile={pendingFiles.BANK}
              label="Upload Bank Document (Cancelled Cheque / Bank Proof)"
            />

            {/* Display temp Associate's existing BANK file */}
            {tempAssociateComplianceFiles.length > 0 && (
              <div className="mt-2">
                {tempAssociateComplianceFiles
                  .filter(file => file.documentType === 'BANK' && file.entityLevel === 'HO')
                  .map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      <span className="text-blue-600">📄</span>
                      <span className="flex-1">{file.originalName}</span>
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL}/associate-compliance-file/${selectedTempAssociateId}/compliance-files/${file.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View
                      </a>
                    </div>
                  ))}
              </div>
            )}
          </div>

        )}
        {/* Branch queue mode: Show upload for branches before branch creation */}
        {isBranch && !isEditMode && queueCallbacks?.onBANKSelect && (
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Documents
            </label>
            <ComplianceFileUpload
              AssociateId={null}
              documentType="BANK"
              entityLevel="BRANCH"
              AssociateBranchId={null}
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
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              Register New Associate
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
                  onClick={() => handleBreadcrumbClick(step.id)}
                  className={`flex items-center space-x-2 focus:outline-none cursor-pointer hover:opacity-80 transition-opacity ${currentStep === step.id
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
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                            onClick={() => copyFromAssociateDetails(branch.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy from Associate Details
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
                    Upload Associate Documents
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
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 cursor-pointer"
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
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
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

      {/* Associate Details Modal */}
      {showAssociateDetailsModal && selectedAssociateDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold text-gray-900">
                Associate Details
              </h3>
              <button
                onClick={() => {
                  setShowAssociateDetailsModal(false);
                  setSelectedAssociateDetails(null);
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
                    <p className="text-xs text-gray-500 font-medium">Associate Number</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.Associate_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Business Name</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.business_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Contact Number</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.contact_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Associate Type</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.Associate_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Associate Potential</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.Associate_potential || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Currency</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.currency || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <p className={`text-sm font-medium ${selectedAssociateDetails.active ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAssociateDetails.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Approval Status</p>
                    <p className={`text-sm font-medium ${selectedAssociateDetails.approval_status === 'APPROVED' ? 'text-green-600' :
                      selectedAssociateDetails.approval_status === 'REJECTED' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                      {selectedAssociateDetails.approval_status || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Location Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Country</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.country || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">State</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.state || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">District</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.district || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">City</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Pincode</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.pincode || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Tax & Bank Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Tax & Bank Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">PAN Number</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.pan_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">TAN Number</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.tan_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">GST Number</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.gst_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Bank Name</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.bank_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Account Number</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.bank_account_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Branch Name</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.branch_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">IFSC Code</p>
                    <p className="text-sm text-gray-900">{selectedAssociateDetails.ifsc_code || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Persons */}
              {selectedAssociateDetails.contactpersons && selectedAssociateDetails.contactpersons.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Persons</h4>
                  <div className="space-y-3">
                    {selectedAssociateDetails.contactpersons.map((contact: any, index: number) => (
                      <div key={contact.contactId} className="bg-white p-3 rounded border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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

              {/* Branches */}
              {selectedAssociateDetails.branches && selectedAssociateDetails.branches.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Branches</h4>
                  <div className="space-y-4">
                    {selectedAssociateDetails.branches.map((branch: any, index: number) => (
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
                            <p className="text-sm text-gray-900">{branch.currency || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Country</p>
                            <p className="text-sm text-gray-900">{branch.country || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">State</p>
                            <p className="text-sm text-gray-900">{branch.state || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">District</p>
                            <p className="text-sm text-gray-900">{branch.district || '-'}</p>
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
              {selectedAssociateDetails.uploadedfiles && selectedAssociateDetails.uploadedfiles.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Files</h4>
                  <div className="space-y-3">
                    {selectedAssociateDetails.uploadedfiles.map((file: any) => (
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
                              {file.created_at ? new Date(file.created_at).toLocaleString() : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Uploaded By</p>
                            <p className="text-sm text-gray-900">{file.created_by_name || '-'}</p>
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
                      {selectedAssociateDetails.created_at ? new Date(selectedAssociateDetails.created_at).toLocaleString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Created By</p>
                    <p className="text-sm text-gray-900">
                      {selectedAssociateDetails.created_by_name || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowAssociateDetailsModal(false);
                  setSelectedAssociateDetails(null);
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

export default AddAssociateModal;


