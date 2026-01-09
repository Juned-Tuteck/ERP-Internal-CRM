import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
  Edit
} from "lucide-react";
import axios from "axios";

import useNotifications from '../../../hook/useNotifications';
import { useCRM } from '../../../context/CRMContext';
import { updateCustomer } from '../../../utils/customerApi';
import { CustomLoader } from '../../../components/CustomLoader';
import { useToast } from '../../../components/Toast';
import { zoneApi, stateApi, districtApi } from '../../../utils/leadZoneStateDistrictApi';
import { SearchableSelect } from '../../../components/SearchableSelect';
import { getAssociates } from '../../../utils/associateApi';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: any) => void;
  initialData?: any;
}

interface FileWithNote {
  file: File;
  note: string;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({
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
  const { showToast } = useToast(); // Modern toast notifications
  //------------------------------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(
    initialData || {
      // Step 1: General Information
      businessName: "",
      avatar: "",
      customerBranch: "",
      currency: "",
      leadGeneratedDate: new Date().toLocaleDateString("en-CA"),
      referencedBy: "",
      projectName: "",
      projectValue: "",
      leadType: "",
      workType: "",
      leadCriticality: "",
      leadSource: "",
      leadStage: "Information Stage",
      leadStagnation: "",
      eta: "",
      leadDetails: "",
      involvedAssociates: [],
      // Step 2: Upload Files
      uploadedFiles: [],
      // Step 3: Follow-up
      followUpComments: [],
      assignedTo: "",
      nextFollowUpDate: "",
      // New fields
      leadTemperature: "",
      ownProbability: "",
      projectState: "",
      projectDistrict: "",
      projectCity: "",
      projectPincode: "",
      projectStreet: "",
      projectLocation: "",
      projectZone: "",
      projectCurrentStatus: "",
      // Lead Contact Persons
      leadContacts: [],
      // Lead Competitors
      leadCompetitors: [],
    }
  );

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const [uploadedFiles, setUploadedFiles] = useState<FileWithNote[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showAssociateForm, setShowAssociateForm] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [associateForm, setAssociateForm] = useState({
    designation: "",
    associateId: "",
    otherInfo: "",
  });

  // Multi-worktype state for CREATE mode only
  const [multiWorktypeState, setMultiWorktypeState] = useState<{
    step1: any;
    step2: { documents: { [worktype: string]: FileWithNote[] } };
    step3: {
      comments: { [worktype: string]: string };
      assignedTo: { [worktype: string]: string };
      nextFollowUpDate: { [worktype: string]: string };
    };
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
    step3: { comments: {}, assignedTo: {}, nextFollowUpDate: {} },
    leads: {},
  });

  // Location Data State
  const [zones, setZones] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const [zonesData, statesData, districtsData] = await Promise.all([
          zoneApi.getAll(),
          stateApi.getAll(),
          districtApi.getAll()
        ]);
        setZones(zonesData);
        setStates(statesData);
        setDistricts(districtsData);
      } catch (error) {
        console.error("Failed to fetch location data", error);
      }
    };

    if (isOpen) {
      fetchLocationData();
    }
  }, [isOpen]);

  // Dropdown states
  const [showWorkTypeDropdown, setShowWorkTypeDropdown] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [creationMode, setCreationMode] = useState<'single' | 'multiple'>('multiple');

  // State for API data
  const [customers, setCustomers] = useState<
    Array<{
      id: string; name: string; currency: string[]; contacts: Array<{
        id: string;
        name: string;
        email: string;
        phone: string;
        designation: string;
      }>;
    }>
  >([]);
  const [customerBranches, setCustomerBranches] = useState<
    Array<{ id: string; branch_name: string, currency: string }>
  >([]);
  const [contactPersons, setContactPersons] = useState<
    Array<{
      id: string;
      name: string;
      phone: string;
      email?: string;
      designation?: string;
      alternative_number?: string;
      date_of_birth?: string;
      anniversary_date?: string;
      communication_mode?: string | string[]; // Can be string or array
    }>
  >([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedContactForAdd, setSelectedContactForAdd] = useState("");
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [editingContactData, setEditingContactData] = useState<any>(null);

  // Competitor management states
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [editingCompetitorIndex, setEditingCompetitorIndex] = useState<number | null>(null);
  const [editingCompetitorData, setEditingCompetitorData] = useState<any>(null);
  const [users, setUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [usersWithLeadAccess, setUsersWithLeadAccess] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const { hasMenuAccess } = useCRM();
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [showCustomLeadSource, setShowCustomLeadSource] = useState(false);
  const [customLeadSource, setCustomLeadSource] = useState("");

  // Temporary leads states
  const [tempLeads, setTempLeads] = useState<Array<{ lead_id: string; project_name: string }>>([]);
  const [selectedTempLeadId, setSelectedTempLeadId] = useState<string>("");
  const [originalTempLeadData, setOriginalTempLeadData] = useState<any>(null);
  const [originalLeadContacts, setOriginalLeadContacts] = useState<any[]>([]);
  const [originalLeadCompetitors, setOriginalLeadCompetitors] = useState<any[]>([]);

  const steps = [
    { id: 1, name: "General Information", description: "Basic lead details" },
    { id: 2, name: "Upload Files", description: "Supporting documents" },
    // { id: 3, name: "Follow-up Leads", description: "Communication log" },
  ];

  const leadTypes = ["Industrial", "Hospital", "It", "Commercial", "Residential", "Govrment"];
  const workTypes = [
    "HVAC", "Ventilation", "Fire", "MGPS", "Electrical", "CCTV", "Plumbing MEP", "Interior", "Civil"
  ];
  const leadCriticalities = [
    "Urgent & Important",
    "Urgent & Non-important",
    "Non Urgent & Important",
    "Non Urgent & Non Importaint"
  ];
  const leadSources = [
    "Website",
    "Google Search",
    "Social Media",
    "Facebook / Instagram  Campaign",
    "LinkedIn",
    "Email Campaign",
    "WhatsApp  Campaign",
    "SMS  Campaign",
    "Referral",
    "Existing Customer",
    "Cold Call",
    "Walk-in",
    "Channel Partner",
    "Dealer / Distributor",
    "Vendor Referral",
    "Consultant Referral",
    "Contractor Referral",
    "Tender Portal – GeM",
    "Tender Portal – CPPP",
    "Govt Tender",
    "RFP / BOQ from Client",
    "Architect Referral",
    "Builder / Developer",
    "Field Visit",
    "IndiaMART",
    "TradeIndia",
    "JustDial",
    "Sulekha",
    "Exhibition / Event",
    "Cross-sell",
    "Up-sell",
    "Internal Lead",
    "Others"
  ];
  const leadStages = [
    "Information Stage",
    "Enquiry",
    "Design",
    "Costing",
    "Quoted",
    "Won",
    "Lost",
  ];
  const associateDesignations = [
    "Architect",
    "Consultant",
    "Engineer",
    "Designer",
    "Contractor",
    "Other",
  ];
  const leadTemperatures = ["Hot", "Warm", "Cold"];
  const projectCities = ["WB", "JG", "KG", "DH", "MB"];
  const projectCurrentStatuses = [
    "Hold",
    "Stalled",
    "Cancelled",
    "Active",
    "Purchase",
  ];

  // State for associates fetched from API
  const [associates, setAssociates] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const validateProjectValue = (value: string): boolean => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue > 0 && numValue <= 999999999;
  };

  const validateResponseTime = (days: string): boolean => {
    const numDays = parseInt(days);
    return !isNaN(numDays) && numDays > 0 && numDays <= 365;
  };

  const validateStringLength = (
    str: string,
    minLength: number = 0,
    maxLength: number = 500
  ): boolean => {
    return str.length >= minLength && str.length <= maxLength;
  };

  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return true; // Optional dates are valid when empty
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const validateFutureDate = (dateStr: string): boolean => {
    if (!dateStr) return true; // Optional dates are valid when empty
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  // Compute ETA as leadGeneratedDate + days
  // const computeEta = (leadDateStr: string, daysStr: string | number) => {
  //   if (!leadDateStr) return "";
  //   const days = parseInt(String(daysStr || "0"), 10);
  //   const base = new Date(leadDateStr);
  //   if (isNaN(base.getTime()) || isNaN(days)) return "";
  //   const etaDate = new Date(base);
  //   etaDate.setDate(etaDate.getDate() + (days || 0));
  //   return etaDate.toISOString().split("T")[0];
  // };

  // // Keep ETA in sync when lead date or approximate response time changes
  // useEffect(() => {
  //   const newEta = computeEta(formData.leadGeneratedDate, formData.approximateResponseTime);
  //   if (newEta !== formData.eta) {
  //     setFormData((prev: any) => ({ ...prev, eta: newEta }));
  //   }
  // }, [formData.leadGeneratedDate, formData.approximateResponseTime]);


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

  // Check Step 1 Validity (for enabling/disabling "Complete" button)
  const checkStep1Validity = (): boolean => {
    // Required field validations
    if (!formData.businessName?.trim()) return false;
    if (!formData.leadGeneratedDate || !validateDate(formData.leadGeneratedDate)) return false;
    if (!formData.projectName?.trim() || !validateStringLength(formData.projectName.trim(), 2, 200)) return false;
    if (!formData.projectValue?.toString().trim() || !validateProjectValue(formData.projectValue.toString())) return false;
    if (!formData.leadType?.trim()) return false;

    // Check workType (array or string)
    if (Array.isArray(formData.workType)) {
      if (formData.workType.length === 0) return false;
    } else if (!formData.workType) {
      return false;
    }

    if (!formData.leadCriticality?.trim()) return false;
    if (!formData.leadSource?.trim()) return false;
    if (!formData.leadStage?.trim()) return false;
    if (!formData.nextFollowUpDate || !validateDate(formData.nextFollowUpDate)) return false;

    // Optional field validations
    if (formData.referencedBy && !validateStringLength(formData.referencedBy.trim(), 0, 100)) return false;
    if (formData.eta && (!validateDate(formData.eta) || !validateFutureDate(formData.eta))) return false;
    if (formData.leadDetails && !validateStringLength(formData.leadDetails.trim(), 0, 1000)) return false;

    return true;
  };

  // Comprehensive validation function
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Step 1 validations
    if (currentStep === 1) {
      // Required field validations
      if (!formData.businessName?.trim()) {
        errors.businessName = "Customer is required";
      }

      // if (!formData.customerBranch?.trim()) {
      //   errors.customerBranch = "Customer Branch is required";
      // }

      if (!formData.leadGeneratedDate) {
        errors.leadGeneratedDate = "Lead Generated Date is required";
      } else if (!validateDate(formData.leadGeneratedDate)) {
        errors.leadGeneratedDate = "Please enter a valid date";
      }

      if (!formData.projectName?.trim()) {
        errors.projectName = "Project Name is required";
      } else if (!validateStringLength(formData.projectName.trim(), 2, 200)) {
        errors.projectName =
          "Project Name must be between 2 and 200 characters";
      }

      if (!formData.projectValue?.toString().trim()) {
        errors.projectValue = "Project Value is required";
      } else if (!validateProjectValue(formData.projectValue.toString())) {
        errors.projectValue =
          "Please enter a valid positive number (max 999,999,999)";
      }

      if (!formData.leadType?.trim()) {
        errors.leadType = "Lead Type is required";
      }

      if (!(formData.workType.length > 0)) {
        errors.workType = "Work Type is required";
      }

      if (!formData.leadCriticality?.trim()) {
        errors.leadCriticality = "Lead Criticality is required";
      }

      if (!formData.leadSource?.trim()) {
        errors.leadSource = "Lead Source is required";
      }

      if (!formData.leadStage?.trim()) {
        errors.leadStage = "Lead Stage is required";
      }

      if (!formData.nextFollowUpDate) {
        errors.nextFollowUpDate = "Next Follow-Up Date is required";
      } else {
        if (!validateDate(formData.nextFollowUpDate)) {
          errors.nextFollowUpDate = "Please enter a valid date";
        }
      }

      // Optional field validations
      if (
        formData.referencedBy &&
        !validateStringLength(formData.referencedBy.trim(), 0, 100)
      ) {
        errors.referencedBy = "Referenced By must not exceed 100 characters";
      }

      if (formData.eta && !validateDate(formData.eta)) {
        errors.eta = "Please enter a valid ETA date";
      } else if (formData.eta && !validateFutureDate(formData.eta)) {
        errors.eta = "ETA must be today or a future date";
      }

      if (
        formData.leadDetails &&
        !validateStringLength(formData.leadDetails.trim(), 0, 1000)
      ) {
        errors.leadDetails = "Lead Details must not exceed 1000 characters";
      }
    }

    // Step 3 validations
    // if (currentStep === 3) {
    //   if (newComment && !validateStringLength(newComment.trim(), 0, 500)) {
    //     errors.newComment = "Comment must not exceed 500 characters";
    //   }
    // }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation for individual fields
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case "businessName":
        return !value?.trim() ? "Customer is required" : "";

      case "customerBranch":
      // return !value?.trim() ? "Customer Branch is required" : "";


      case "projectName":
        if (!value?.trim()) return "Project Name is required";
        if (!validateStringLength(value.trim(), 2, 200))
          return "Project Name must be between 2 and 200 characters";
        return "";

      case "projectValue":
        if (!value?.toString().trim()) return "Project Value is required";
        if (!validateProjectValue(value.toString()))
          return "Please enter a valid positive number";
        return "";

      case "leadType":
        return !value?.trim() ? "Lead Type is required" : "";

      case "leadCriticality":
        return !value?.trim() ? "Lead Criticality is required" : "";

      case "leadSource":
        return !value?.trim() ? "Lead Source is required" : "";

      case "nextFollowUpDate":
        if (!value)
          return "Please enter a valid date";
        return "";

      case "eta":
        if (value && !validateDate(value)) return "Please enter a valid date";
        if (value && !validateFutureDate(value))
          return "ETA must be today or a future date";
        return "";

      case "referencedBy":
        if (value && !validateStringLength(value.trim(), 0, 100))
          return "Must not exceed 100 characters";
        return "";

      case "leadDetails":
        if (value && !validateStringLength(value.trim(), 0, 1000))
          return "Must not exceed 1000 characters";
        return "";

      default:
        return "";
    }
  };

  // NEW: ref to keep normalized snapshot of initial form for diffing
  const initialFormRef = useRef<any>(null);

  const defaultFormData = {
    businessName: "",
    avatar: "",
    customerBranch: "",
    currency: "",
    leadGeneratedDate: new Date().toLocaleDateString("en-CA"),
    referencedBy: "",
    projectName: "",
    projectValue: "",
    leadType: "",
    workType: "",
    leadCriticality: "",
    leadSource: "",
    leadStage: "Information Stage",
    leadStagnation: "",
    eta: "",
    leadDetails: "",
    involvedAssociates: [],
    uploadedFiles: [],
    followUpComments: [],
    assignedTo: "",
    nextFollowUpDate: "",
    leadTemperature: "",
    ownProbability: "",
    projectState: "",
    projectDistrict: "",
    projectCity: "",
    projectPincode: "",
    projectStreet: "",
    projectLocation: "",
    projectZone: "",
    projectCurrentStatus: "",
    leadContacts: [],
    leadCompetitors: [],
  };

  useEffect(() => {
    const fetchAllForEdit = async () => {
      if (initialData) {
        // Debug log for initialData

        // Normalize leadGeneratedDate to YYYY-MM-DD
        let normalizedDate = "";
        if (initialData.leadGeneratedDate) {
          const dateObj = new Date(initialData.leadGeneratedDate);
          if (!isNaN(dateObj.getTime())) {
            normalizedDate = dateObj.toISOString().split("T")[0];
          } else {
            normalizedDate = new Date().toLocaleDateString("en-CA");
          }
        } else {
          normalizedDate = new Date().toLocaleDateString("en-CA");
        }
        // Normalize eta
        let normalizedEta = "";
        if (initialData.eta) {
          const etaObj = new Date(initialData.eta);
          if (!isNaN(etaObj.getTime())) {
            normalizedEta = etaObj.toISOString().split("T")[0];
          } else {
            normalizedEta = "";
          }
        } else {
          normalizedEta = "";
        }

        // Normalize next_followup_date
        let normalizedNextFollowUpDate = "";
        if (initialData.next_followup_date || initialData.nextFollowUpDate) {
          const nextFollowUpDateObj = new Date(initialData.next_followup_date || initialData.nextFollowUpDate);
          if (!isNaN(nextFollowUpDateObj.getTime())) {
            normalizedNextFollowUpDate = nextFollowUpDateObj.toISOString().split("T")[0];
          } else {
            normalizedNextFollowUpDate = "";
          }
        } else {
          normalizedNextFollowUpDate = "";
        }

        // Create a normalized form object (snapshot) to compare later
        const normalizedFormSnapshot = {
          businessName: initialData.businessName || initialData.business_name || "",
          avatar: initialData.avatar || "",
          customerBranch: initialData.branch_name || initialData.customerBranch || "",
          currency: initialData.currency || "INR",
          leadGeneratedDate: normalizedDate,
          referencedBy: initialData.referencedBy || initialData.referenced_by || "",
          projectName: initialData.projectName || initialData.project_name || "",
          projectValue:
            initialData.projectValue !== undefined && initialData.projectValue !== null
              ? String(initialData.projectValue).replace(/[^\d.]/g, "")
              : "",
          leadType: initialData.leadType || initialData.lead_type || "",
          workType: (() => {
            const raw = initialData.workType || initialData.work_type;
            if (typeof raw === 'string' && raw.trim().startsWith('[')) {
              try {
                return JSON.parse(raw);
              } catch (e) {
                return raw;
              }
            }
            return raw || "";
          })(),
          leadCriticality: initialData.leadCriticality || initialData.lead_criticality || "",
          leadSource: initialData.leadSource || initialData.lead_source || "",
          leadStage: initialData.leadStage || initialData.lead_stage || "New Lead",
          leadStagnation: initialData.leadStagnation || initialData.lead_stagnation || "",
          // approximateResponseTime: initialData.approximateResponseTime || initialData.approximate_response_time_day || "",
          eta: normalizedEta,
          leadDetails: initialData.leadDetails || initialData.lead_details || "",
          involvedAssociates: initialData.involvedAssociates || initialData.lead_associates || [],
          uploadedFiles: initialData.uploadedFiles || [],
          followUpComments: initialData.followUpComments || [],
          assignedTo: initialData.assignedTo || initialData.assigned_to || "",
          nextFollowUpDate: normalizedNextFollowUpDate || (initialData?.approximateResponseTime ? initialData.approximateResponseTime : ""),
          // New fields
          leadTemperature: initialData.leadTemperature || initialData.lead_temperature || "",
          ownProbability: initialData.ownProbability || initialData.own_probability || "",
          projectState: initialData.projectState || initialData.project_state || "",
          projectDistrict: initialData.projectDistrict || initialData.project_district || "",
          projectCity: initialData.projectCity || initialData.project_city || "",
          projectPincode: initialData.projectPincode || initialData.project_pincode || "",
          projectStreet: initialData.projectStreet || initialData.project_street || "",
          projectLocation: initialData.projectLocation || initialData.project_location || "",
          projectZone: initialData.projectZone || initialData.project_zone || "",
          projectCurrentStatus: initialData.projectCurrentStatus || initialData.project_current_status || "",
          // also snapshot backend ids if present
          customer_id: initialData.customer_id || initialData.customerId || null,
          customer_branch_id: initialData.customer_branch_id || initialData.customer_branch || null,
          contact_person_id: initialData.contact_person || initialData.contact_person_id || null,
        };
        console.log("Normalized Form Snapshot for Edit:", normalizedFormSnapshot);

        // Set form data for editing
        setFormData({
          ...normalizedFormSnapshot,
        });
        setUploadedFiles([]);

        // Check if lead source is a custom value (not in predefined list)
        const leadSourceValue = initialData.leadSource || initialData.lead_source || "";
        if (leadSourceValue && !leadSources.includes(leadSourceValue)) {
          setShowCustomLeadSource(true);
          setCustomLeadSource(leadSourceValue);
        }

        // Store snapshot in ref for later diffing
        initialFormRef.current = { ...normalizedFormSnapshot };

        if (initialData.businessName && isOpen) {
          // Fetch customers and use the response directly

          try {
            // Fetch users for Referenced By dropdown
            fetchUsers();
            fetchUsersWithLeadAccess();

            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/customer`
            );

            const customerData = response.data.data.map((customer: any) => ({
              id: customer.customer_id,
              name: customer.business_name,
              approval_status: customer.approval_status,
              currency: convertCurrencyString(customer.currency),
              contacts: customer.contacts || [],
            }));

            const approvedCustomers = customerData.filter(
              (customer: any) => customer.approval_status === "APPROVED"
            );

            setCustomers(approvedCustomers);

            // First try to find by customer_id (more reliable)
            let selectedCustomer = null;
            const customerId = initialData.customer_id || initialData.customerId;

            if (customerId) {
              selectedCustomer = approvedCustomers.find(
                (customer: any) => customer.id === customerId
              );
            }

            // Fallback to name matching if ID not found
            if (!selectedCustomer && initialData.businessName) {
              selectedCustomer = approvedCustomers.find(
                (customer: any) => customer.name === initialData.businessName
              );
            }


            if (selectedCustomer) {
              // use local ids to snapshot accurately
              const localCustomerId = selectedCustomer.id;
              setSelectedCustomerId(localCustomerId);
              // update snapshot
              initialFormRef.current.customer_id = localCustomerId;

              // Update formData with the actual customer name from the found customer
              setFormData((prev: any) => ({
                ...prev,
                businessName: selectedCustomer.name, // Use the actual customer name
              }));

              // Fetch branches for this customer
              const branchResponse = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/customer-branch?customer_id=${localCustomerId}`
              );
              const branchData = branchResponse.data.data;
              setCustomerBranches(branchData);

              // Check if there's a branch in initialData
              if (initialData.branch_name) {
                const selectedBranch = branchData.find(
                  (branch: any) => branch.branch_name === initialData.branch_name
                );

                if (selectedBranch) {
                  // Branch exists: use branch contacts
                  const localBranchId = selectedBranch.id;
                  setSelectedBranchId(localBranchId);
                  initialFormRef.current.customer_branch_id = localBranchId;

                  setFormData((prev: any) => ({
                    ...prev,
                    customerBranch: selectedBranch.branch_name,
                    currency: selectedBranch.currency || prev.currency, // Set currency from branch
                  }));

                  // Fetch contacts for this branch
                  const contactResponse = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/customer-branch-contact?customer_branch_id=${localBranchId}`
                  );
                  const contactData = contactResponse.data.data;
                  setContactPersons(contactData);

                  if (initialData.contactPerson) {
                    const selectedContact = contactData.find(
                      (contact: any) => contact.name === initialData.contactPerson
                    );
                    if (selectedContact) {
                      const localContactId = selectedContact.id;
                      setSelectedContactId(localContactId);
                      initialFormRef.current.contact_person_id = localContactId;
                    }
                  }
                } else {
                  // Branch not found: clear and use customer contacts
                  setFormData((prev: any) => ({
                    ...prev,
                    customerBranch: "",
                  }));
                  setSelectedBranchId("");

                  // Use customer's direct contacts
                  if (selectedCustomer.contacts && selectedCustomer.contacts.length > 0) {
                    const customerContacts = selectedCustomer.contacts.map((contact: any) => ({
                      id: contact.id,
                      name: contact.name,
                      phone: contact.phone || contact.contact_no,
                    }));
                    setContactPersons(customerContacts);

                    if (initialData.contactPerson) {
                      const selectedContact = customerContacts.find(
                        (contact: any) => contact.name === initialData.contactPerson
                      );
                      if (selectedContact) {
                        setSelectedContactId(selectedContact.id);
                        initialFormRef.current.contact_person_id = selectedContact.id;
                      }
                    }
                  }
                }
              } else {
                // No branch: use customer contacts
                if (selectedCustomer.contacts && selectedCustomer.contacts.length > 0) {
                  const customerContacts = selectedCustomer.contacts.map((contact: any) => ({
                    id: contact.id,
                    name: contact.name,
                    phone: contact.phone || contact.contact_no,
                  }));
                  setContactPersons(customerContacts);

                  if (initialData.contactPerson) {
                    const selectedContact = customerContacts.find(
                      (contact: any) => contact.name === initialData.contactPerson
                    );
                    if (selectedContact) {
                      setSelectedContactId(selectedContact.id);
                      initialFormRef.current.contact_person_id = selectedContact.id;
                    }
                  }
                }

                // Set currency from customer if available
                if (selectedCustomer.currency && selectedCustomer.currency.length > 0) {
                  setFormData((prev: any) => ({
                    ...prev,
                    currency: initialData.currency || selectedCustomer.currency[0],
                  }));
                }
              }
            }

            // Fetch existing lead contacts for edit mode
            if (initialData.id) {
              try {
                const contactsResponse = await axios.get(
                  `${import.meta.env.VITE_API_BASE_URL}/lead-contact?lead_id=${initialData.id}`
                );
                const existingContacts = contactsResponse.data.data || [];
                setFormData((prev: any) => ({
                  ...prev,
                  leadContacts: existingContacts.map((contact: any) => ({
                    id: contact.id,
                    contact_id: contact.contact_id,
                    name: contact.name,
                    designation: contact.designation || "",
                    email: contact.email || "",
                    phone: contact.phone || "",
                    alternative_number: contact.alternative_number || "",
                    date_of_birth: contact.date_of_birth || "",
                    anniversary_date: contact.anniversary_date || "",
                    communication_mode: contact.communication_mode || "",
                  }))
                }));
              } catch (contactError) {
                console.error("Error fetching lead contacts:", contactError);
              }
            }

            // Fetch existing lead competitors for edit mode
            if (initialData.id) {
              try {
                const competitorsResponse = await axios.get(
                  `${import.meta.env.VITE_API_BASE_URL}/lead-competitor?lead_id=${initialData.id}`
                );
                const existingCompetitors = competitorsResponse.data.data || [];
                setFormData((prev: any) => ({
                  ...prev,
                  leadCompetitors: existingCompetitors.map((comp: any) => ({
                    id: comp.id,
                    competitor_name: comp.competitor_name,
                    win_probability: comp.win_probability
                  }))
                }));
              } catch (competitorError) {
                console.error("Error fetching lead competitors:", competitorError);
              }
            }
          } catch (error) {
            console.error("Error fetching data for edit mode:", error);
          }
        }
      } else if (isOpen) {
        fetchCustomers();
        fetchUsers();
        fetchUsersWithLeadAccess();
      }
    };
    fetchAllForEdit();
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showWorkTypeDropdown && !target.closest('.relative')) {
        setShowWorkTypeDropdown(false);
      }
    };

    if (showWorkTypeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWorkTypeDropdown]);

  const convertCurrencyString = (str: string): string[] => {
    return str
      .replace(/[{}"]/g, "") // remove { } and "
      .split(",")             // split by comma
      .map(s => s.trim());    // remove extra spaces
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/customer`
      );
      const customerData = response.data.data;


      const approvedCustomers = customerData.filter(
        (customer: any) => customer.approval_status === "APPROVED"
      );


      setCustomers(
        approvedCustomers.map((customer: any) => ({
          id: customer.customer_id,
          name: customer.business_name,
          currency: convertCurrencyString(customer.currency),
          contacts: customer.contacts || [],
        }))
      );
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Fetch customer branches
  const fetchCustomerBranches = async (customerId: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/customer-branch?customer_id=${customerId}`
      );

      const branchData = response.data.data;

      setCustomerBranches(branchData);
      // Reset dependent fields
      setSelectedBranchId("");
      setSelectedContactId("");
    } catch (error) {
      console.error("Error fetching customer branches:", error);
      setCustomerBranches([]);
    }
  };

  // Fetch branch contact persons
  const fetchContactPersons = async (branchId: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/customer-branch-contact?customer_branch_id=${branchId}`
      );
      const contactData = response.data.data;

      setContactPersons(contactData);
      // Reset contact selection
      setSelectedContactId("");
    } catch (error) {
      console.error("Error fetching contact persons:", error);
      setContactPersons([]);
    }
  };

  // Fetch users for Referenced By dropdown
  const fetchUsers = async () => {
    try {
      // TODO: Replace with actual API endpoint when provided
      const response = await axios.get(
        `${import.meta.env.VITE_AUTH_BASE_URL}/users/basic`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const userData = response.data.data;

      setUsers(
        userData.map((user: any) => ({
          id: user.id || user.user_id,
          name: user.name || user.full_name || user.username,
        }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  // Fetch users with Lead menu access for Assign to dropdown
  const fetchUsersWithLeadAccess = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_AUTH_BASE_URL}/users/by-access-path?module=CRM&menu=Lead`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const usersWithLeadMenu = response.data.data;

      setUsersWithLeadAccess(
        usersWithLeadMenu.map((user: any) => ({
          id: user.id || user.user_id,
          name: user.name || user.full_name || user.username,
        }))
      );
    } catch (error) {
      console.error("Error fetching users with lead access:", error);
      setUsersWithLeadAccess([]);
    }
  };

  // Fetch associates from API
  const fetchAssociates = async () => {
    try {
      const associatesData = await getAssociates();
      console.log("Associates API Response:", associatesData);

      // Handle the response - it might be the array directly or wrapped in data
      const associatesArray = Array.isArray(associatesData) ? associatesData : ((associatesData as any)?.data || []);
      console.log("Associates Array:", associatesArray);

      // Filter only approved associates
      const approvedAssociates = associatesArray.filter(
        (associate: any) => associate.approval_status === "APPROVED"
      );
      console.log("approvedAssociates", approvedAssociates);

      setAssociates(
        approvedAssociates.map((associate: any) => ({
          id: associate.associate_id,
          name: associate.business_name,
        }))
      );
    } catch (error) {
      console.error("Error fetching associates:", error);
      setAssociates([]);
    }
  };

  // Fetch temporary leads on mount
  useEffect(() => {
    const fetchTempLeads = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/lead/temp-leads`
        );
        if (response.data.success) {
          setTempLeads(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching temporary leads:', error);
        setTempLeads([]);
      }
    };
    if (isOpen && !initialData) {
      fetchTempLeads();
    }
  }, [isOpen, initialData]);

  // Fetch associates when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAssociates();
    }
  }, [isOpen]);

  // Handle temporary lead selection
  const handleTempLeadSelect = async (leadId: string) => {
    setSelectedTempLeadId(leadId);

    if (!leadId) {
      return;
    }

    try {
      // Fetch the full lead details
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/temp-lead/${leadId}`
      );

      if (response.data.success) {
        const leadData = response.data.data;
        console.log('Temp Lead Data:', leadData);

        // Parse work_type if it's a JSON string
        let parsedWorkType = leadData.work_type;
        if (typeof parsedWorkType === 'string' && parsedWorkType.trim().startsWith('[')) {
          try {
            parsedWorkType = JSON.parse(parsedWorkType);
          } catch (e) {
            console.error('Error parsing work_type:', e);
          }
        }

        // Store original lead data for comparison
        setOriginalTempLeadData({
          businessName: leadData.customer?.business_name || "",
          projectName: leadData.project_name || "",
          projectValue: leadData.project_value || "",
          leadType: leadData.lead_type || "",
          workType: parsedWorkType || "",
          leadCriticality: leadData.lead_criticality || "",
          leadSource: leadData.lead_source || "",
          leadStage: leadData.lead_stage || "Information Stage",
          leadGeneratedDate: leadData.lead_date_generated_on ? new Date(leadData.lead_date_generated_on).toISOString().split('T')[0] : new Date().toLocaleDateString("en-CA"),
          referencedBy: leadData.referenced_by || "",
          eta: leadData.eta ? new Date(leadData.eta).toISOString().split('T')[0] : "",
          leadDetails: leadData.lead_details || "",
          currency: leadData.currency || "INR",
          nextFollowUpDate: leadData.next_followup_date ? new Date(leadData.next_followup_date).toISOString().split('T')[0] : "",
          leadTemperature: leadData.lead_temperature || "",
          ownProbability: leadData.own_probability || "",
          projectState: leadData.project_state || "",
          projectDistrict: leadData.project_district || "",
          projectCity: leadData.project_city || "",
          projectPincode: leadData.project_pincode || "",
          projectStreet: leadData.project_street || "",
          projectLocation: leadData.project_location || "",
          projectZone: leadData.project_zone || "",
          projectCurrentStatus: leadData.project_current_status || "",
          assignedTo: leadData.assigned_user_id || "",
        });

        // Store original lead contacts
        if (leadData.contact) {
          setOriginalLeadContacts(leadData.contact.map((contact: any) => ({
            id: contact.id || Math.random().toString(36).substr(2, 9),
            name: contact.name || "",
            designation: contact.designation || "",
            email: contact.email || "",
            phone: contact.phone || "",
            alternativeNumber: contact.alternative_number || "",
            dateOfBirth: contact.date_of_birth ? new Date(contact.date_of_birth).toISOString().split('T')[0] : "",
            anniversaryDate: contact.anniversary_date ? new Date(contact.anniversary_date).toISOString().split('T')[0] : "",
            communicationMode: contact.communication_mode || [],
          })));
        }

        // Store original competitors
        if (leadData.competitors) {
          setOriginalLeadCompetitors(leadData.competitors.map((competitor: any) => ({
            id: competitor.id || Math.random().toString(36).substr(2, 9),
            competitorName: competitor.competitor_name || "",
            winProbability: competitor.win_probability || "",
          })));
        }

        // Populate form data with lead information
        setFormData((prev: typeof formData) => ({
          ...prev,
          businessName: leadData.customer?.business_name || "",
          projectName: leadData.project_name || "",
          projectValue: leadData.project_value || "",
          leadType: leadData.lead_type || "",
          workType: parsedWorkType || "",
          leadCriticality: leadData.lead_criticality || "",
          leadSource: leadData.lead_source || "",
          leadStage: leadData.lead_stage || "Information Stage",
          leadGeneratedDate: leadData.lead_date_generated_on ? new Date(leadData.lead_date_generated_on).toISOString().split('T')[0] : new Date().toLocaleDateString("en-CA"),
          referencedBy: leadData.referenced_by || "",
          eta: leadData.eta ? new Date(leadData.eta).toISOString().split('T')[0] : "",
          leadDetails: leadData.lead_details || "",
          currency: leadData.currency || "INR",
          nextFollowUpDate: leadData.next_followup_date ? new Date(leadData.next_followup_date).toISOString().split('T')[0] : "",
          leadTemperature: leadData.lead_temperature || "",
          ownProbability: leadData.own_probability || "",
          projectState: leadData.project_state || "",
          projectDistrict: leadData.project_district || "",
          projectCity: leadData.project_city || "",
          projectPincode: leadData.project_pincode || "",
          projectStreet: leadData.project_street || "",
          projectLocation: leadData.project_location || "",
          projectZone: leadData.project_zone || "",
          projectCurrentStatus: leadData.project_current_status || "",
          assignedTo: leadData.assigned_user_id || "",
          // Populate lead contacts
          leadContacts: leadData.contact ? leadData.contact.map((contact: any) => ({
            id: contact.id || Math.random().toString(36).substr(2, 9),
            name: contact.name || "",
            designation: contact.designation || "",
            email: contact.email || "",
            phone: contact.phone || "",
            alternativeNumber: contact.alternative_number || "",
            dateOfBirth: contact.date_of_birth ? new Date(contact.date_of_birth).toISOString().split('T')[0] : "",
            anniversaryDate: contact.anniversary_date ? new Date(contact.anniversary_date).toISOString().split('T')[0] : "",
            communicationMode: contact.communication_mode || [],
          })) : prev.leadContacts,
          // Populate competitors
          leadCompetitors: leadData.competitors ? leadData.competitors.map((competitor: any) => ({
            id: competitor.id || Math.random().toString(36).substr(2, 9),
            competitorName: competitor.competitor_name || "",
            winProbability: competitor.win_probability || "",
          })) : prev.leadCompetitors,
        }));

        // Set customer if available
        if (leadData.customer_id) {
          setSelectedCustomerId(leadData.customer_id);
          // Fetch customer branches if needed
          if (leadData.customer_id) {
            await fetchCustomerBranches(leadData.customer_id);
          }
        }

        // Set branch if available
        if (leadData.customer_branch_id) {
          setSelectedBranchId(leadData.customer_branch_id);
        }
      }
    } catch (error) {
      console.error("Error fetching temporary lead details:", error);
      showToast("Failed to load temporary lead details. Please try again.", "error");
    }
  };

  const fallbackCustomer = customers.find(c => c.id === selectedCustomerId);

  // Get currency options based on selected branch or customer
  const currenciesToShow = (() => {
    if (selectedBranchId) {
      // Find the specific selected branch and get its currency
      const selectedBranch = customerBranches.find(b => b.id === selectedBranchId);
      return selectedBranch?.currency ? [selectedBranch.currency] : [];
    }
    // Otherwise use customer's currencies
    return fallbackCustomer?.currency ?? [];
  })();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Handle customer selection
    if (name === "businessName") {
      const selectedCustomer = customers.find(
        (customer) => customer.name === value
      );
      if (selectedCustomer) {
        setSelectedCustomerId(selectedCustomer.id);
        fetchCustomerBranches(selectedCustomer.id);

        // Set customer's direct contacts as the initial contact persons
        if (selectedCustomer.contacts && selectedCustomer.contacts.length > 0) {
          setContactPersons(selectedCustomer.contacts.map((contact: any) => ({
            id: contact.id,
            name: contact.name,
            phone: contact.phone || contact.contact_no,
          })));
        } else {
          setContactPersons([]);
        }
      }
      if (selectedCustomer?.currency && selectedCustomer.currency.length > 0) {
        setFormData((prev: any) => ({
          ...prev,
          currency: selectedCustomer.currency[0], // default to first currency
        }));
      }
      setFormData((prev: any) => ({
        ...prev,
        businessName: value,
        projectName: value,
        customerBranch: "",
        contactPerson: "",
        contactNo: "",
      }));
      return;
    }

    // Handle branch selection
    if (name === "customerBranch") {
      if (value) {
        // Branch selected: fetch branch contacts
        const selectedBranch = customerBranches.find(
          (branch) => branch.branch_name === value
        );
        if (selectedBranch) {
          setSelectedBranchId(selectedBranch.id);
          fetchContactPersons(selectedBranch.id);
          if (selectedBranch.currency && selectedBranch.currency.length > 0) {
            setFormData((prev: any) => ({
              ...prev,
              currency: selectedBranch.currency, // default to first currency
            }));
          }
        }
      } else {
        // Branch cleared: revert to customer contacts
        setSelectedBranchId("");
        const selectedCustomer = customers.find(
          (customer) => customer.id === selectedCustomerId
        );
        if (selectedCustomer && selectedCustomer.contacts && selectedCustomer.contacts.length > 0) {
          setContactPersons(selectedCustomer.contacts.map((contact: any) => ({
            id: contact.id,
            name: contact.name,
            phone: contact.phone || contact.contact_no,
          })));
        } else {
          setContactPersons([]);
        }
      }
      setFormData((prev: any) => ({
        ...prev,
        customerBranch: value,
        contactPerson: "",
        contactNo: "",
      }));
      return;
    }

    if (name === "currency") {
      setFormData((prev: any) => ({
        ...prev,
        currency: value,
      }));
      return;
    }


    // Handle lead source selection
    if (name === "leadSource") {
      if (value === "Others") {
        setShowCustomLeadSource(true);
        setFormData((prev: any) => ({
          ...prev,
          leadSource: "",
        }));
      } else {
        setShowCustomLeadSource(false);
        setCustomLeadSource("");
        setFormData((prev: any) => ({
          ...prev,
          leadSource: value,
        }));
      }
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    // Perform real-time validation for critical fields
    if (
      name === "projectValue" ||
      name === "nextFollowUpDate" ||
      name === "eta"
    ) {
      const errorMessage = validateField(name, value);
      if (errorMessage) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: errorMessage,
        }));
      }
    }
  };

  useEffect(() => {
    console.log("Currncy on change", formData.currency);
  }, [formData.currency]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, worktype?: string) => {
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
      const filesWithNotes: FileWithNote[] = validFiles.map(file => ({ file, note: "" }));

      if (!isEditMode && worktype) {
        // Multi-worktype mode: store files per worktype
        setMultiWorktypeState((prev) => ({
          ...prev,
          step2: {
            documents: {
              ...prev.step2.documents,
              [worktype]: [...(prev.step2.documents[worktype] || []), ...filesWithNotes],
            },
          },
        }));
      } else {
        // Edit mode or single worktype: use existing state
        setUploadedFiles((prev) => [...prev, ...filesWithNotes]);
      }
    }
  };

  const handleFileNoteChange = (index: number, note: string, worktype?: string) => {
    if (!isEditMode && worktype) {
      setMultiWorktypeState((prev) => {
        const currentDocs = prev.step2.documents[worktype] || [];
        const updatedDocs = [...currentDocs];
        if (updatedDocs[index]) {
          updatedDocs[index] = { ...updatedDocs[index], note };
        }
        return {
          ...prev,
          step2: {
            ...prev.step2,
            documents: {
              ...prev.step2.documents,
              [worktype]: updatedDocs
            }
          }
        };
      });
    } else {
      setUploadedFiles((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = { ...updated[index], note };
        }
        return updated;
      });
    }
  };

  const uploadFilesForLead = async (
    leadId: string,
    files: FileWithNote[],
    onProgress?: (percent: number) => void
  ) => {
    if (!leadId || files.length === 0) return;

    const formData = new FormData();
    files.forEach((item) => {
      formData.append("files", item.file);
      formData.append("fileNote", item.note || "");
    });
    formData.append("upload_by", userData?.id || "");
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/lead-file/${leadId}/files`,
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

  // Update lead stage after file upload
  const updateLeadStageAfterFileUpload = async (leadId: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/lead/${leadId}`,
        {
          lead_stage: "Enquiry",
        }
      );
      console.log("Lead stage updated to Enquiry after file upload");
    } catch (error) {
      console.error("Error updating lead stage:", error);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // NEW helper: build backend-shaped object from current form state
  const buildBackendObject = () => {
    return {
      business_name: formData.businessName || "",
      customer_id: selectedCustomerId || null,
      customer_branch_id: selectedBranchId || null,
      lead_date_generated_on: formData.leadGeneratedDate || "",
      referenced_by: formData.referencedBy || null,
      project_name: formData.projectName || "",
      project_value: parseFloat(String(formData.projectValue || "0")) || 0,
      lead_type: formData.leadType || "",
      work_type: formData.workType || null,
      lead_criticality: formData.leadCriticality || "",
      lead_source: formData.leadSource || "",
      lead_stage: formData.leadStage || "",
      approximate_response_time_day: 0,
      // parseInt(String(formData.approximateResponseTime || "0")) || 0,
      eta: formData.eta || null,
      lead_details: formData.leadDetails || null,
      assigned_to: formData.assignedTo || null,
      next_followup_date: formData.nextFollowUpDate || null,
      // New fields
      lead_temperature: formData.leadTemperature || null,
      own_probability: formData.ownProbability ? parseFloat(formData.ownProbability) : null,
      project_state: formData.projectState || null,
      project_district: formData.projectDistrict || null,
      project_city: formData.projectCity || null,
      project_pincode: formData.projectPincode || null,
      project_street: formData.projectStreet || null,
      project_location: formData.projectLocation || null,
      project_zone: formData.projectZone || null,
      project_current_status: formData.projectCurrentStatus || null,
    };
  };

  // REPLACE existing handleUpdateLead with this diffing version
  const handleUpdateLead = async () => {
    setIsLoading(true);
    try {
      if (!initialData || !initialData.id) {
        showToast("No lead ID found for update.", "error");
        setIsLoading(false);
        return;
      }

      // current backend-shaped object
      const currentBackend = buildBackendObject();

      // initial snapshot: try to use the ref snapshot; if missing, create minimal fallback from initialData
      const initialSnapshotBackend = initialFormRef.current
        ? {
          business_name: initialFormRef.current.businessName || "",
          customer_id: initialFormRef.current.customer_id || null,
          customer_branch_id: initialFormRef.current.customer_branch_id || null,
          lead_date_generated_on: initialFormRef.current.leadGeneratedDate || "",
          referenced_by: initialFormRef.current.referencedBy || null,
          project_name: initialFormRef.current.projectName || "",
          project_value: parseFloat(String(initialFormRef.current.projectValue || "0")) || 0,
          lead_type: initialFormRef.current.leadType || "",
          work_type: initialFormRef.current.workType || null,
          lead_criticality: initialFormRef.current.leadCriticality || "",
          lead_source: initialFormRef.current.leadSource || "",
          lead_stage: initialFormRef.current.leadStage || "",
          approximate_response_time_day: 0,
          // parseInt(String(initialFormRef.current.approximateResponseTime || "0")) || 0,
          eta: initialFormRef.current.eta || null,
          lead_details: initialFormRef.current.leadDetails || null,
          assigned_to: initialFormRef.current.assignedTo || null,
          next_followup_date: initialFormRef.current.nextFollowUpDate || null,
          // New fields
          lead_temperature: initialFormRef.current.leadTemperature || null,
          own_probability: initialFormRef.current.ownProbability ? parseFloat(initialFormRef.current.ownProbability) : null,
          project_state: initialFormRef.current.projectState || null,
          project_district: initialFormRef.current.projectDistrict || null,
          project_city: initialFormRef.current.projectCity || null,
          project_pincode: initialFormRef.current.projectPincode || null,
          project_street: initialFormRef.current.projectStreet || null,
          project_location: initialFormRef.current.projectLocation || null,
          project_zone: initialFormRef.current.projectZone || null,
          project_current_status: initialFormRef.current.projectCurrentStatus || null,
        }
        : {
          // best-effort fallback from initialData prop
          business_name: initialData.business_name || initialData.businessName || "",
          customer_id: initialData.customer_id || null,
          customer_branch_id: initialData.customer_branch_id || initialData.customer_branch || null,
          lead_date_generated_on: initialData.lead_date_generated_on || initialData.leadGeneratedDate || "",
          referenced_by: initialData.referenced_by || null,
          project_name: initialData.project_name || initialData.projectName || "",
          project_value: parseFloat(String(initialData.project_value || 0)) || 0,
          lead_type: initialData.lead_type || initialData.leadType || "",
          work_type: initialData.work_type || initialData.workType || null,
          lead_criticality: initialData.lead_criticality || initialData.leadCriticality || "",
          lead_source: initialData.lead_source || initialData.leadSource || "",
          lead_stage: initialData.lead_stage || initialData.leadStage || "",
          approximate_response_time_day:
            parseInt(String(initialData.approximate_response_time_day || initialData.approximateResponseTime || 0)) || 0,
          eta: initialData.eta || initialData.eta || null,
          lead_details: initialData.lead_details || initialData.leadDetails || null,
          assigned_to: initialData.assigned_to || initialData.assignedTo || null,
          next_followup_date: initialData.next_followup_date || initialData.nextFollowUpDate || null,
          // New fields
          lead_temperature: initialData.lead_temperature || initialData.leadTemperature || null,
          own_probability: initialData.own_probability || initialData.ownProbability || null,
          project_state: initialData.project_state || initialData.projectState || null,
          project_district: initialData.project_district || initialData.projectDistrict || null,
          project_city: initialData.project_city || initialData.projectCity || null,
          project_pincode: initialData.project_pincode || initialData.projectPincode || null,
          project_street: initialData.project_street || initialData.projectStreet || null,
          project_location: initialData.project_location || initialData.projectLocation || null,
          project_zone: initialData.project_zone || initialData.projectZone || null,
          project_current_status: initialData.project_current_status || initialData.projectCurrentStatus || null,
        };

      // Build diff: include only keys that changed (strict comparison)
      const diffPayload: any = {};
      Object.keys(currentBackend).forEach((key) => {
        const currentVal = currentBackend[key as keyof typeof currentBackend];
        const initialVal = initialSnapshotBackend[key as keyof typeof initialSnapshotBackend];

        // Normalize null/empty for comparison
        const cur = currentVal === "" ? null : currentVal;
        const init = initialVal === "" ? null : initialVal;

        // For numbers, compare numeric values
        const changed =
          (typeof cur === "number" || typeof init === "number")
            ? Number(cur) !== Number(init)
            : String(cur) !== String(init);

        if (changed) {
          diffPayload[key] = currentVal;
        }
      });

      if (Object.keys(diffPayload).length === 0) {
        showToast("No changes detected to update.");
        setIsLoading(false);
        return;
      }

      diffPayload.updated_by = userData?.id || null;
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/lead/${initialData.id}`,
        diffPayload
      );

      // keep behavior after successful update (setCreatedLeadId, move step, reset as before)
      setCreatedLeadId(initialData.id);

      setCurrentStep(2);
      setUploadedFiles([]);
      setNewComment("");

      // ------------------------------------------------------------------------------------------For notifications
      try {
        await sendNotification({
          receiver_ids: ['admin'],
          title: `New Lead Updated Successfully : ${formData.businessName || 'Lead'}`,
          message: `Lead ${formData.businessName || 'Lead'} updated successfully by ${userData?.name || 'a user'}`,
          service_type: 'CRM',
          link: '/leads',
          sender_id: userRole || 'user',
          access: {
            module: "CRM",
            menu: "Lead",
          }
        });
        console.log(`Notification sent for CRM Lead ${formData.businessName || 'Lead'}`);
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      showToast("Failed to update lead. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    if (currentStep === 1) {
      if (isEditMode) {
        // EDIT mode: Update lead and move to step 2
        handleUpdateLead();
      } else {
        console.log("Form Data contect:", formData.leadContacts);
        // CREATE mode: Just validate and move to step 2 (save to state only)
        if (!Array.isArray(formData.workType) || formData.workType.length === 0) {
          showToast("Please select at least one work type.");
          return;
        }
        // Store Step 1 data in multi-worktype state
        setMultiWorktypeState((prev) => ({
          ...prev,
          step1: { ...formData },
        }));
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (isEditMode) {
        // EDIT mode: Upload files for existing lead
        const leadId = createdLeadId || initialData?.id;
        if (!leadId) {
          console.error("No leadId found. Cannot upload files.");
          return;
        }

        if (uploadedFiles.length === 0) {
          setCurrentStep(3);
          return;
        }

        try {
          await uploadFilesForLead(leadId, uploadedFiles, (percent) => {
            console.log("Upload progress:", percent);
          });
          await updateLeadStageAfterFileUpload(leadId);
          setCurrentStep(3);
        } catch (err) {
          console.error("Upload failed", err);
        }
      } else {
        console.log("form date in step 2 ", formData.leadContacts);

        // CREATE mode: Just move to step 3 (documents already in state)
        setCurrentStep(3);
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Complete Registration for multi-worktype CREATE mode (called from Step 3)
  const handleCompleteRegistration = async () => {
    if (!checkStep1Validity()) {
      alert("Fill required fields");
      return;
    }
    setIsLoading(true);

    console.log("form data for lead :", formData);

    try {
      const selectedWorktypes = (Array.isArray(formData.workType) ? formData.workType : []) as string[];

      if (selectedWorktypes.length === 0) {
        showToast("No work types selected.");
        setIsLoading(false);
        return;
      }

      // Check if this lead is from a temp lead
      if (selectedTempLeadId) {
        // For temp leads, update once instead of creating multiple leads
        const updatePayload: Record<string, any> = {
          is_temp_lead: false,
          customer_branch_id: selectedBranchId || null, // Add branch ID
        };

        // Field mapping from UI to backend
        const fieldMapping: Record<string, string> = {
          businessName: 'business_name',
          projectName: 'project_name',
          projectValue: 'project_value',
          leadType: 'lead_type',
          workType: 'work_type',
          leadCriticality: 'lead_criticality',
          leadSource: 'lead_source',
          leadStage: 'lead_stage',
          leadGeneratedDate: 'lead_date_generated_on',
          referencedBy: 'referenced_by',
          eta: 'eta',
          leadDetails: 'lead_details',
          currency: 'currency',
          nextFollowUpDate: 'next_followup_date',
          leadTemperature: 'lead_temperature',
          ownProbability: 'own_probability',
          projectState: 'project_state',
          projectDistrict: 'project_district',
          projectCity: 'project_city',
          projectPincode: 'project_pincode',
          projectStreet: 'project_street',
          projectLocation: 'project_location',
          projectZone: 'project_zone',
          projectCurrentStatus: 'project_current_status',
        };

        // Compare current form data with original data and add changed fields
        if (originalTempLeadData) {
          Object.keys(fieldMapping).forEach((uiKey) => {
            const currentValue = formData[uiKey as keyof typeof formData];
            const originalValue = originalTempLeadData[uiKey];

            // Compare values (handle arrays separately)
            let hasChanged = false;
            if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
              hasChanged = JSON.stringify(currentValue) !== JSON.stringify(originalValue);
            } else {
              hasChanged = currentValue !== originalValue;
            }

            // If value has changed, add to payload
            if (hasChanged) {
              const backendKey = fieldMapping[uiKey as keyof typeof fieldMapping];
              // Special handling for work_type - send as JSON string array
              if (backendKey === 'work_type') {
                updatePayload[backendKey] = JSON.stringify(Array.isArray(currentValue) ? currentValue : [currentValue]);
              } else if (backendKey === 'project_value') {
                updatePayload[backendKey] = parseFloat(currentValue as string) || 0;
              } else if (backendKey === 'own_probability') {
                updatePayload[backendKey] = currentValue ? parseFloat(currentValue as string) : null;
              } else {
                updatePayload[backendKey] = currentValue || null;
              }
            }
          });
        }

        console.log('Update payload for temp lead (complete registration):', updatePayload);

        const updateResponse = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/lead/${selectedTempLeadId}`,
          updatePayload
        );

        if (updateResponse.status !== 200 && updateResponse.status !== 201) {
          throw new Error("Failed to update lead");
        }

        console.log("Temp lead updated successfully (complete registration):", updateResponse.data);

        const leadId = selectedTempLeadId;



        // Handle document uploads (always allow uploads for temp leads)
        // In multi-worktype mode, files are stored in multiWorktypeState.step2.documents
        const worktypeDocuments = multiWorktypeState.step2.documents[selectedWorktypes[0]] || [];
        const commonDocuments = multiWorktypeState.step2.documents['COMMON'] || [];
        const allDocuments = [...worktypeDocuments, ...commonDocuments];

        console.log('[handleCompleteRegistration] Checking for files. worktypeDocuments:', worktypeDocuments);
        console.log('[handleCompleteRegistration] commonDocuments:', commonDocuments);
        console.log('[handleCompleteRegistration] Total documents:', allDocuments.length);

        if (allDocuments.length > 0) {
          try {
            await uploadFilesForLead(leadId, allDocuments);
            await updateLeadStageAfterFileUpload(leadId);
            console.log("Documents uploaded successfully for temp lead");
          } catch (uploadError) {
            console.error("Error uploading documents for temp lead:", uploadError);
          }
        }

        // Intelligent Contact Person Handling
        if (formData.leadContacts && formData.leadContacts.length > 0) {
          const newContacts: any[] = [];
          const modifiedContacts: any[] = [];

          formData.leadContacts.forEach((contact: any) => {
            const originalContact = originalLeadContacts.find((orig) => orig.id === contact.id);

            if (!originalContact) {
              // New contact
              newContacts.push(contact);
            } else {
              // Check if modified
              const hasChanged =
                contact.name !== originalContact.name ||
                contact.designation !== originalContact.designation ||
                contact.email !== originalContact.email ||
                contact.phone !== originalContact.phone ||
                contact.alternativeNumber !== originalContact.alternativeNumber ||
                contact.dateOfBirth !== originalContact.dateOfBirth ||
                contact.anniversaryDate !== originalContact.anniversaryDate ||
                JSON.stringify(contact.communicationMode) !== JSON.stringify(originalContact.communicationMode);

              if (hasChanged) {
                modifiedContacts.push(contact);
              }
            }
          });

          // Create new contacts via bulk POST
          if (newContacts.length > 0) {
            try {
              const contactsPayload = newContacts.map((contact) => ({
                lead_id: leadId,
                name: contact.name,
                designation: contact.designation || null,
                email: contact.email || null,
                phone: contact.phone,
                alternative_number: contact.alternativeNumber || null,
                date_of_birth: contact.dateOfBirth || null,
                anniversary_date: contact.anniversaryDate || null,
                communication_mode: contact.communicationMode || null,
              }));
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/lead-contact/bulk`,
                contactsPayload
              );
              console.log(`${newContacts.length} new contact(s) created for temp lead`);
            } catch (error) {
              console.error("Error creating new contacts:", error);
            }
          }

          // Update modified contacts via individual PUT
          for (const contact of modifiedContacts) {
            try {
              const updatePayload = {
                name: contact.name,
                designation: contact.designation || null,
                email: contact.email || null,
                phone: contact.phone,
                alternative_number: contact.alternativeNumber || null,
                date_of_birth: contact.dateOfBirth || null,
                anniversary_date: contact.anniversaryDate || null,
                communication_mode: contact.communicationMode || null,
              };
              await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/lead-contact/${contact.id}`,
                updatePayload
              );
              console.log(`Contact ${contact.name} updated successfully`);
            } catch (error) {
              console.error(`Error updating contact ${contact.name}:`, error);
            }
          }

          console.log(`Contacts processed: ${newContacts.length} new, ${modifiedContacts.length} modified, ${formData.leadContacts.length - newContacts.length - modifiedContacts.length} unchanged`);
        }

        // Intelligent Competitor Handling
        if (formData.leadCompetitors && formData.leadCompetitors.length > 0) {
          const newCompetitors: any[] = [];
          const modifiedCompetitors: any[] = [];

          formData.leadCompetitors.forEach((competitor: any) => {
            const originalCompetitor = originalLeadCompetitors.find((orig) => orig.id === competitor.id);

            if (!originalCompetitor) {
              // New competitor
              newCompetitors.push(competitor);
            } else {
              // Check if modified
              const hasChanged =
                competitor.competitorName !== originalCompetitor.competitorName ||
                competitor.winProbability !== originalCompetitor.winProbability;

              if (hasChanged) {
                modifiedCompetitors.push(competitor);
              }
            }
          });

          // Create new competitors via bulk POST
          if (newCompetitors.length > 0) {
            try {
              const competitorsPayload = newCompetitors.map((competitor) => ({
                lead_id: leadId,
                competitor_name: competitor.competitorName,
                win_probability: competitor.winProbability ? parseFloat(competitor.winProbability) : null,
              }));
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/lead-competitor/bulk`,
                competitorsPayload
              );
              console.log(`${newCompetitors.length} new competitor(s) created for temp lead`);
            } catch (error) {
              console.error("Error creating new competitors:", error);
            }
          }

          // Update modified competitors via individual PUT
          for (const competitor of modifiedCompetitors) {
            try {
              const updatePayload = {
                competitor_name: competitor.competitorName,
                win_probability: competitor.winProbability ? parseFloat(competitor.winProbability) : null,
              };
              await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/lead-competitor/${competitor.id}`,
                updatePayload
              );
              console.log(`Competitor ${competitor.competitorName} updated successfully`);
            } catch (error) {
              console.error(`Error updating competitor ${competitor.competitorName}:`, error);
            }
          }

          console.log(`Competitors processed: ${newCompetitors.length} new, ${modifiedCompetitors.length} modified, ${formData.leadCompetitors.length - newCompetitors.length - modifiedCompetitors.length} unchanged`);
        }

        // For temp leads, we don't create multiple leads, just update the one
        // Show success and close modal
        showToast("Lead updated successfully!");
        onClose();
        setIsLoading(false);
        return;
      }

      // Normal flow: Create multiple leads for each worktype
      const results: { [worktype: string]: { success: boolean; leadId?: string; error?: string } } = {};

      // Create leads sequentially for each worktype
      for (const worktype of selectedWorktypes) {
        try {
          console.log(`Creating lead for worktype: ${worktype}`);

          // Build lead payload from stored state
          const leadPayload = {
            business_name: formData.businessName,
            customer_id: selectedCustomerId || null,
            customer_branch_id: selectedBranchId || null,
            lead_date_generated_on: formData.leadGeneratedDate,
            referenced_by: formData.referencedBy || null,
            project_name: formData.projectName,
            project_value: parseFloat(formData.projectValue) || 0,
            lead_type: formData.leadType,
            work_type: JSON.stringify([worktype]), // Changed to JSON string array
            lead_criticality: formData.leadCriticality,
            lead_source: formData.leadSource,
            lead_stage: formData.leadStage,
            approximate_response_time_day: 0,
            //approximate_response_time_day: parseInt(formData.approximateResponseTime) || 0,
            eta: formData.eta || null,
            lead_details: formData.leadDetails || null,
            currency: formData.currency || null,
            created_by: userData?.id || null,
            assigned_user_id: multiWorktypeState.step3.assignedTo[worktype] || null,
            next_followup_date: formData.nextFollowUpDate || null, // Use unified Step 1 date
            // New fields
            lead_temperature: formData.leadTemperature || null,
            own_probability: formData.ownProbability ? parseFloat(formData.ownProbability) : null,
            project_state: formData.projectState || null,
            project_district: formData.projectDistrict || null,
            project_city: formData.projectCity || null,
            project_pincode: formData.projectPincode || null,
            project_street: formData.projectStreet || null,
            project_location: formData.projectLocation || null,
            project_zone: formData.projectZone || null,
            project_current_status: formData.projectCurrentStatus || null,
          };

          // POST: Create lead
          const leadResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/lead`,
            leadPayload
          );
          const leadData = leadResponse.data.data;
          const leadId = leadData.lead_id;

          console.log(`Lead created for ${worktype}: ${leadId}`);

          // Store lead ID
          setMultiWorktypeState((prev) => ({
            ...prev,
            leads: {
              ...prev.leads,
              [worktype]: { leadId, status: "success" },
            },
          }));

          results[worktype] = { success: true, leadId };

          // POST: Upload documents for this worktype (if any)
          const worktypeDocuments = multiWorktypeState.step2.documents[worktype] || [];
          const commonDocuments = multiWorktypeState.step2.documents['COMMON'] || [];
          const documents = [...worktypeDocuments, ...commonDocuments];

          if (documents.length > 0) {
            try {
              console.log(`Uploading ${documents.length} documents for ${worktype}`);
              await uploadFilesForLead(leadId, documents);
              console.log(`Documents uploaded for ${worktype}`);

              // PUT: Update lead stage to "Enquiry"
              await updateLeadStageAfterFileUpload(leadId);
            } catch (uploadError) {
              console.error(`Error uploading documents for ${worktype}:`, uploadError);
            }
          }

          // POST: Upload comment for this worktype (if any)
          const comment = multiWorktypeState.step3.comments[worktype];
          if (comment && comment.trim()) {
            try {
              console.log(`Uploading comment for ${worktype}`);
              const commentPayload = {
                lead_id: leadId,
                comment: comment.trim(),
                created_by: userData?.id || "unknown",
              };
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/lead-follow-up`,
                commentPayload
              );
              console.log(`Comment uploaded for ${worktype}`);
            } catch (commentError) {
              console.error(`Error uploading comment for ${worktype}:`, commentError);
            }
          }

          // POST: Associates (shared across all worktypes)
          if (formData.involvedAssociates && formData.involvedAssociates.length > 0) {
            try {
              const associatePayload = formData.involvedAssociates.map((associate: any) => ({
                lead_id: leadId,
                associate_type: associate.designation,
                associate_name: associate.associateName,
                other_information: associate.otherInfo || null,
              }));
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/lead-associate/bulk`,
                associatePayload
              );
            } catch (associateError) {
              console.error(`Error adding associates for ${worktype}:`, associateError);
            }
          }

          // POST: Lead Contacts (shared across all worktypes)
          if (formData.leadContacts && formData.leadContacts.length > 0) {
            try {
              const contactsPayload = formData.leadContacts.map((contact: any) => ({
                lead_id: leadId,
                name: contact.name,
                designation: contact.designation || null,
                email: contact.email || null,
                phone: contact.phone,
                alternative_number: contact.alternative_number || null,
                date_of_birth: contact.date_of_birth || null,
                anniversary_date: contact.anniversary_date || null,
                communication_mode: contact.communication_mode || null,
              }));
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/lead-contact/bulk`,
                contactsPayload
              );
              console.log(`Contacts added for ${worktype}`);
            } catch (contactError) {
              console.error(`Error adding contacts for ${worktype}:`, contactError);
            }
          }

          // POST: Lead Competitors (shared across all worktypes)
          if (formData.leadCompetitors && formData.leadCompetitors.length > 0) {
            try {
              const competitorPayload = formData.leadCompetitors.map((competitor: any) => ({
                lead_id: leadId,
                competitor_name: competitor.competitor_name,
                win_probability: competitor.win_probability,
                created_by: userData?.id || null,
              }));
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/lead-competitor/bulk`,
                competitorPayload
              );
              console.log(`Competitors added for ${worktype}`);
            } catch (competitorError) {
              console.error(`Error adding competitors for ${worktype}:`, competitorError);
            }
          }
        } catch (error: any) {
          console.error(`Error creating lead for ${worktype}:`, error);
          const errorMessage = error.response?.data?.message || error.message || "Unknown error";
          results[worktype] = { success: false, error: errorMessage };

          setMultiWorktypeState((prev) => ({
            ...prev,
            leads: {
              ...prev.leads,
              [worktype]: { leadId: null, status: "failed", error: errorMessage },
            },
          }));
        }
      }

      // PUT: Update customer flag
      if (selectedCustomerId) {
        try {
          await updateCustomer(selectedCustomerId, { is_lead_generated: true });
        } catch (custErr) {
          console.error("Failed to update customer is_lead_generated flag:", custErr);
        }
      }

      // POST: Send notifications
      try {
        await sendNotification({
          receiver_ids: ["admin"],
          title: `New Leads Created Successfully : ${formData.businessName || "Lead"}`,
          message: `${selectedWorktypes.length} lead(s) registered successfully for ${formData.businessName || "Lead"} by ${userData?.name || "a user"}`,
          service_type: "CRM",
          link: "/leads",
          sender_id: userRole || "user",
          access: {
            module: "CRM",
            menu: "Lead",
          },
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }

      // Show results summary
      const successCount = Object.values(results).filter((r) => r.success).length;
      const failCount = Object.values(results).filter((r) => !r.success).length;

      let message = `Registration Complete!\n\n`;
      message += `Successful: ${successCount}\n`;
      if (failCount > 0) {
        message += `Failed: ${failCount}\n\n`;
        message += `Failed worktypes:\n`;
        Object.entries(results).forEach(([worktype, result]) => {
          if (!result.success) {
            message += `- ${worktype}: ${result.error}\n`;
          }
        });
      }

      showToast(message);

      // Close modal and refresh
      onSubmit({ success: true });
      handleClose();
    } catch (error) {
      console.error("Error in complete registration:", error);
      showToast("An unexpected error occurred during registration.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Unified Lead Creation Handlers (Single Mode)
  const handleUnifiedLeadCreation = async () => {
    if (!checkStep1Validity()) {
      alert("Fill required fields");
      return;
    }
    setIsLoading(true);
    try {
      const selectedWorktypes = (Array.isArray(formData.workType) ? formData.workType : []) as string[];

      if (selectedWorktypes.length === 0) {
        showToast("No work types selected.");
        setIsLoading(false);
        return;
      }

      console.log("Creating unified lead with worktypes:", selectedWorktypes);

      let leadId: string;

      // Check if this lead is from a temp lead
      if (selectedTempLeadId) {
        // Update existing temp lead - set is_temp_lead to false and include changed fields
        const updatePayload: Record<string, any> = {
          is_temp_lead: false,
          customer_branch_id: selectedBranchId || null, // Add branch ID
        };

        // Field mapping from UI to backend
        const fieldMapping: Record<string, string> = {
          businessName: 'business_name',
          projectName: 'project_name',
          projectValue: 'project_value',
          leadType: 'lead_type',
          workType: 'work_type',
          leadCriticality: 'lead_criticality',
          leadSource: 'lead_source',
          leadStage: 'lead_stage',
          leadGeneratedDate: 'lead_date_generated_on',
          referencedBy: 'referenced_by',
          eta: 'eta',
          leadDetails: 'lead_details',
          currency: 'currency',
          nextFollowUpDate: 'next_followup_date',
          leadTemperature: 'lead_temperature',
          ownProbability: 'own_probability',
          projectState: 'project_state',
          projectDistrict: 'project_district',
          projectCity: 'project_city',
          projectPincode: 'project_pincode',
          projectStreet: 'project_street',
          projectLocation: 'project_location',
          projectZone: 'project_zone',
          projectCurrentStatus: 'project_current_status',
          assignedTo: 'assigned_user_id',
        };

        // Compare current form data with original data and add changed fields
        if (originalTempLeadData) {
          Object.keys(fieldMapping).forEach((uiKey) => {
            const currentValue = formData[uiKey as keyof typeof formData];
            const originalValue = originalTempLeadData[uiKey];

            // Compare values (handle arrays separately)
            let hasChanged = false;
            if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
              hasChanged = JSON.stringify(currentValue) !== JSON.stringify(originalValue);
            } else {
              hasChanged = currentValue !== originalValue;
            }

            // If value has changed, add to payload
            if (hasChanged) {
              const backendKey = fieldMapping[uiKey as keyof typeof fieldMapping];
              // Special handling for work_type - send as JSON string array
              if (backendKey === 'work_type') {
                updatePayload[backendKey] = JSON.stringify(Array.isArray(currentValue) ? currentValue : [currentValue]);
              } else if (backendKey === 'project_value') {
                updatePayload[backendKey] = parseFloat(currentValue as string) || 0;
              } else if (backendKey === 'own_probability') {
                updatePayload[backendKey] = currentValue ? parseFloat(currentValue as string) : null;
              } else {
                updatePayload[backendKey] = currentValue || null;
              }
            }
          });
        }

        console.log('Update payload for temp lead (unified):', updatePayload);

        const updateResponse = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/lead/${selectedTempLeadId}`,
          updatePayload
        );

        if (updateResponse.status !== 200 && updateResponse.status !== 201) {
          throw new Error("Failed to update lead");
        }

        console.log("Temp lead updated successfully (unified):", updateResponse.data);
        leadId = selectedTempLeadId;
      } else {
        // Normal flow: Create new lead
        const leadPayload = {
          business_name: formData.businessName,
          customer_id: selectedCustomerId || null,
          customer_branch_id: selectedBranchId || null,
          lead_date_generated_on: formData.leadGeneratedDate,
          referenced_by: formData.referencedBy || null,
          project_name: formData.projectName,
          project_value: parseFloat(formData.projectValue) || 0,
          lead_type: formData.leadType,
          work_type: JSON.stringify(selectedWorktypes), // Unified Array String
          lead_criticality: formData.leadCriticality,
          lead_source: formData.leadSource,
          lead_stage: formData.leadStage,
          approximate_response_time_day: 0,
          eta: formData.eta || null,
          lead_details: formData.leadDetails || null,
          currency: formData.currency || null,
          created_by: userData?.id || null,
          assigned_user_id: formData.assignedTo || null, // Single assignment
          next_followup_date: formData.nextFollowUpDate || null,
          // New fields
          lead_temperature: formData.leadTemperature || null,
          own_probability: formData.ownProbability ? parseFloat(formData.ownProbability) : null,
          project_state: formData.projectState || null,
          project_district: formData.projectDistrict || null,
          project_city: formData.projectCity || null,
          project_pincode: formData.projectPincode || null,
          project_street: formData.projectStreet || null,
          project_location: formData.projectLocation || null,
          project_zone: formData.projectZone || null,
          project_current_status: formData.projectCurrentStatus || null,
        };

        const leadResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/lead`,
          leadPayload
        );
        const leadData = leadResponse.data.data;
        leadId = leadData.lead_id;
      }

      console.log(`Unified lead created/updated: ${leadId}`);

      // 2. Upload Files (Unified)
      console.log('Checking for files to upload. uploadedFiles:', uploadedFiles);
      console.log('Number of files:', uploadedFiles.length);
      if (uploadedFiles.length > 0) {
        try {
          await uploadFilesForLead(leadId, uploadedFiles);
          await updateLeadStageAfterFileUpload(leadId);
        } catch (uploadError) {
          console.error("Error uploading unified files:", uploadError);
        }
      }

      // 3. Add Comment (Unified)
      if (newComment && newComment.trim()) {
        try {
          const commentPayload = {
            lead_id: leadId,
            comment: newComment.trim(),
            created_by: userData?.id || "unknown",
          };
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/lead-follow-up`,
            commentPayload
          );
        } catch (commentError) {
          console.error("Error adding unified comment:", commentError);
        }
      }

      // 4. Add Associates (Unified)
      if (formData.involvedAssociates && formData.involvedAssociates.length > 0) {
        try {
          const associatePayload = formData.involvedAssociates.map((associate: any) => ({
            lead_id: leadId,
            associate_type: associate.designation,
            associate_name: associate.associateName,
            other_information: associate.otherInfo || null,
          }));
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/lead-associate/bulk`,
            associatePayload
          );
        } catch (associateError) {
          console.error(`Error adding associates:`, associateError);
        }
      }

      // 4.5. Add/Update Lead Contacts (Unified) - Intelligent Handling
      if (formData.leadContacts && formData.leadContacts.length > 0) {
        if (selectedTempLeadId) {
          // Intelligent handling for temp leads
          const newContacts: any[] = [];
          const modifiedContacts: any[] = [];

          formData.leadContacts.forEach((contact: any) => {
            const originalContact = originalLeadContacts.find((orig) => orig.id === contact.id);

            if (!originalContact) {
              newContacts.push(contact);
            } else {
              const hasChanged =
                contact.name !== originalContact.name ||
                contact.designation !== originalContact.designation ||
                contact.email !== originalContact.email ||
                contact.phone !== originalContact.phone ||
                contact.alternativeNumber !== originalContact.alternativeNumber ||
                contact.dateOfBirth !== originalContact.dateOfBirth ||
                contact.anniversaryDate !== originalContact.anniversaryDate ||
                JSON.stringify(contact.communicationMode) !== JSON.stringify(originalContact.communicationMode);

              if (hasChanged) {
                modifiedContacts.push(contact);
              }
            }
          });

          // Create new contacts
          if (newContacts.length > 0) {
            try {
              const contactsPayload = newContacts.map((contact) => ({
                lead_id: leadId,
                name: contact.name,
                designation: contact.designation || null,
                email: contact.email || null,
                phone: contact.phone,
                alternative_number: contact.alternativeNumber || null,
                date_of_birth: contact.dateOfBirth || null,
                anniversary_date: contact.anniversaryDate || null,
                communication_mode: contact.communicationMode || null,
              }));
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/lead-contact/bulk`,
                contactsPayload
              );
              console.log(`${newContacts.length} new contact(s) created`);
            } catch (error) {
              console.error("Error creating new contacts:", error);
            }
          }

          // Update modified contacts
          for (const contact of modifiedContacts) {
            try {
              const updatePayload = {
                name: contact.name,
                designation: contact.designation || null,
                email: contact.email || null,
                phone: contact.phone,
                alternative_number: contact.alternativeNumber || null,
                date_of_birth: contact.dateOfBirth || null,
                anniversary_date: contact.anniversaryDate || null,
                communication_mode: contact.communicationMode || null,
              };
              await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/lead-contact/${contact.id}`,
                updatePayload
              );
              console.log(`Contact ${contact.name} updated`);
            } catch (error) {
              console.error(`Error updating contact:`, error);
            }
          }

          console.log(`Contacts: ${newContacts.length} new, ${modifiedContacts.length} modified, ${formData.leadContacts.length - newContacts.length - modifiedContacts.length} unchanged`);
        } else {
          // Normal flow: create all contacts
          try {
            const contactsPayload = formData.leadContacts.map((contact: any) => ({
              lead_id: leadId,
              name: contact.name,
              designation: contact.designation || null,
              email: contact.email || null,
              phone: contact.phone,
              alternative_number: contact.alternative_number || null,
              date_of_birth: contact.date_of_birth || null,
              anniversary_date: contact.anniversary_date || null,
              communication_mode: contact.communication_mode || null,
            }));
            await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/lead-contact/bulk`,
              contactsPayload
            );
            console.log(`Contacts added for unified lead`);
          } catch (contactError) {
            console.error(`Error adding contacts:`, contactError);
          }
        }
      }

      // 4.6. Add/Update Lead Competitors (Unified) - Intelligent Handling
      if (formData.leadCompetitors && formData.leadCompetitors.length > 0) {
        if (selectedTempLeadId) {
          // Intelligent handling for temp leads
          const newCompetitors: any[] = [];
          const modifiedCompetitors: any[] = [];

          formData.leadCompetitors.forEach((competitor: any) => {
            const originalCompetitor = originalLeadCompetitors.find((orig) => orig.id === competitor.id);

            if (!originalCompetitor) {
              newCompetitors.push(competitor);
            } else {
              const hasChanged =
                competitor.competitorName !== originalCompetitor.competitorName ||
                competitor.winProbability !== originalCompetitor.winProbability;

              if (hasChanged) {
                modifiedCompetitors.push(competitor);
              }
            }
          });

          // Create new competitors
          if (newCompetitors.length > 0) {
            try {
              const competitorsPayload = newCompetitors.map((competitor) => ({
                lead_id: leadId,
                competitor_name: competitor.competitorName,
                win_probability: competitor.winProbability ? parseFloat(competitor.winProbability) : null,
              }));
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/lead-competitor/bulk`,
                competitorsPayload
              );
              console.log(`${newCompetitors.length} new competitor(s) created`);
            } catch (error) {
              console.error("Error creating new competitors:", error);
            }
          }

          // Update modified competitors
          for (const competitor of modifiedCompetitors) {
            try {
              const updatePayload = {
                competitor_name: competitor.competitorName,
                win_probability: competitor.winProbability ? parseFloat(competitor.winProbability) : null,
              };
              await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/lead-competitor/${competitor.id}`,
                updatePayload
              );
              console.log(`Competitor ${competitor.competitorName} updated`);
            } catch (error) {
              console.error(`Error updating competitor:`, error);
            }
          }

          console.log(`Competitors: ${newCompetitors.length} new, ${modifiedCompetitors.length} modified, ${formData.leadCompetitors.length - newCompetitors.length - modifiedCompetitors.length} unchanged`);
        } else {
          // Normal flow: create all competitors
          try {
            const competitorPayload = formData.leadCompetitors.map((competitor: any) => ({
              lead_id: leadId,
              competitor_name: competitor.competitor_name,
              win_probability: competitor.win_probability,
              created_by: userData?.id || null,
            }));
            await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/lead-competitor/bulk`,
              competitorPayload
            );
            console.log(`Competitors added for unified lead`);
          } catch (competitorError) {
            console.error(`Error adding competitors:`, competitorError);
          }
        }
      }

      // 5. Update Customer Flag
      if (selectedCustomerId) {
        try {
          await updateCustomer(selectedCustomerId, { is_lead_generated: true });
        } catch (custErr) {
          console.error("Failed to update customer is_lead_generated flag:", custErr);
        }
      }

      // 6. Notification
      try {
        await sendNotification({
          receiver_ids: ["admin"],
          title: `New Unified Lead Created : ${formData.businessName || "Lead"}`,
          message: `Unified Lead ${formData.businessName || "Lead"} created successfully by ${userData?.name || "a user"} with worktypes: ${selectedWorktypes.join(", ")}`,
          service_type: "CRM",
          link: "/leads",
          sender_id: userRole || "user",
          access: {
            module: "CRM",
            menu: "Lead",
          },
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }

      showToast("Lead Created Successfully!");
      onSubmit({ success: true });
      handleClose();

    } catch (error) {
      console.error("Error creating unified lead:", error);
      showToast("Failed to create lead. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Create lead API call
  const handleCreateLead = async () => {
    setIsLoading(true);
    try {
      // Map UI fields to backend keys
      const leadPayload = {
        business_name: formData.businessName,
        customer_id: selectedCustomerId || null,
        customer_branch_id: selectedBranchId || null,
        lead_date_generated_on: formData.leadGeneratedDate,
        referenced_by: formData.referencedBy || null,
        project_name: formData.projectName,
        project_value: parseFloat(formData.projectValue) || 0,
        lead_type: formData.leadType,
        work_type: Array.isArray(formData.workType) ? formData.workType[0] : formData.workType || null,
        lead_criticality: formData.leadCriticality,
        lead_source: formData.leadSource,
        lead_stage: formData.leadStage,
        approximate_response_time_day: 0,
        //  parseInt(formData.approximateResponseTime) || 0,
        eta: formData.eta || null,
        lead_details: formData.leadDetails || null,
        currency: formData.currency || null,
        created_by: userData?.id || null,
        next_followup_date: formData.nextFollowUpDate || null,
      };

      const leadResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/lead`,
        leadPayload
      );
      const leadData = leadResponse.data.data;
      const leadId = leadData.lead_id;

      setCreatedLeadId(leadId);

      // If a customer was selected, mark is_lead_generated = true on the customer record
      if (selectedCustomerId) {
        try {
          await updateCustomer(selectedCustomerId, { is_lead_generated: true });
        } catch (custErr) {
          console.error('Failed to update customer is_lead_generated flag:', custErr);
        }
      }

      // If there are associates, create lead-associate entries
      if (
        formData.involvedAssociates &&
        formData.involvedAssociates.length > 0
      ) {
        const associatePayload = formData.involvedAssociates.map(
          (associate: any) => ({
            lead_id: leadId,
            associate_type: associate.designation,
            associate_name: associate.associateName,
            other_information: associate.otherInfo || null,
          })
        );

        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/lead-associate/bulk`,
          associatePayload
        );
      }

      // Notifications
      try {
        await sendNotification({
          receiver_ids: ['admin'],
          title: `New Lead Created Successfully : ${formData.businessName || 'Lead'}`,
          message: `Lead ${formData.businessName || 'Lead'} registered successfully and sent for approval!by ${userData?.name || 'a user'}`,
          service_type: 'CRM',
          link: '/leads',
          sender_id: userRole || 'user',
          access: {
            module: "CRM",
            menu: "Lead",
          }
        });
        console.log(`Notification sent for CRM Lead ${formData.businessName || 'Lead'}`);
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      // Move to next step
      setCurrentStep(2);
    } catch (error) {
      console.error("Error creating lead:", error);
      showToast("Failed to create lead. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add follow-up comment API call
  const handleAddComment = async () => {
    // Use createdLeadId for create mode or initialData.id for edit mode
    const leadId = createdLeadId || (isEditMode && initialData?.id);

    if (!newComment.trim() || !leadId) return;

    try {
      const commentPayload = {
        lead_id: leadId,
        comment: newComment.trim(),
        created_by: userData?.id || 'unknown',
      };

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/lead-follow-up`,
        commentPayload
      );

      // Add comment to local state for UI update
      const comment = {
        id: Date.now(),
        text: newComment,
        timestamp: new Date().toISOString(),
        author: "Current User",
      };
      setFormData((prev: any) => ({
        ...prev,
        followUpComments: [...prev.followUpComments, comment],
      }));
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast("Failed to add comment. Please try again.");
    }
  };

  const handleCommentSubmit = () => {
    // Validate comment length
    if (newComment.trim() && !validateStringLength(newComment.trim(), 0, 500)) {
      setValidationErrors((prev) => ({
        ...prev,
        newComment: "Comment must not exceed 500 characters",
      }));
      return;
    }

    // Clear any existing comment validation errors
    if (validationErrors.newComment) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.newComment;
        return newErrors;
      });
    }

    // Check if we have a valid lead ID (either from creation or edit mode)
    const leadId = createdLeadId || (isEditMode && initialData?.id);

    if (currentStep === 3 && leadId) {
      handleAddComment();
    } else {
      // Fallback for local comment addition (when not connected to API)
      if (newComment.trim()) {
        const comment = {
          id: Date.now(),
          text: newComment,
          timestamp: new Date().toISOString(),
          author: "Current User",
        };
        setFormData((prev: any) => ({
          ...prev,
          followUpComments: [...prev.followUpComments, comment],
        }));
        setNewComment("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!checkStep1Validity()) {
      alert("First fill required fields in step 1");
      return;
    }
    e.preventDefault();

    // Get the appropriate lead ID
    const leadId = createdLeadId || (isEditMode && initialData?.id);

    // Close modal and notify parent component
    onSubmit({ success: true, leadId: leadId });

    // Reset form
    setCurrentStep(1);
    setCreatedLeadId(null);
    setFormData({
      businessName: "",
      customerBranch: "",
      currency: "INR",
      contactPerson: "",
      contactNo: "",
      leadGeneratedDate: new Date().toLocaleDateString("en-CA"),
      referencedBy: "",
      projectName: "",
      projectValue: "",
      leadType: "",
      workType: "",
      leadCriticality: "",
      leadSource: "",
      leadStage: "Information Stage",
      leadStagnation: "",
      eta: "",
      leadDetails: "",
      involvedAssociates: [],
      uploadedFiles: [],
      followUpComments: [],
      assignedTo: "",
      nextFollowUpDate: "",
    });
    setUploadedFiles([]);
    setNewComment("");
  };

  const handleAssociateFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAssociateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAssociate = () => {
    if (!associateForm.designation || !associateForm.associateId) return;
    const associateName =
      associates.find((a) => a.id === associateForm.associateId)
        ?.name || "";
    setFormData((prev: any) => ({
      ...prev,
      involvedAssociates: [
        ...prev.involvedAssociates,
        {
          designation: associateForm.designation,
          associateId: associateForm.associateId,
          associateName,
          otherInfo: associateForm.otherInfo,
        },
      ],
    }));
    setAssociateForm({ designation: "", associateId: "", otherInfo: "" });
    setShowAssociateForm(false);
  };

  const removeAssociate = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      involvedAssociates: prev.involvedAssociates.filter((_: any, i: number) => i !== index),
    }));
  };

  const isEditMode = !!initialData;

  // Clear validation errors when modal closes
  const handleClose = () => {
    setValidationErrors({});
    setFileErrors([]);
    setFormData(defaultFormData);
    setSelectedTempLeadId(""); // Clear temp lead selection
    setOriginalTempLeadData(null); // Clear original temp lead data
    setOriginalLeadContacts([]); // Clear original lead contacts
    setOriginalLeadCompetitors([]); // Clear original lead competitors
    onClose();
  };

  // Helper component for displaying validation errors
  const ValidationError: React.FC<{ fieldName: string }> = ({ fieldName }) => {
    const error = validationErrors[fieldName];
    return error ? (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <span className="mr-1">⚠</span>
        {error}
      </p>
    ) : null;
  };

  if (!isOpen) return null;

  if (isLoading) {
    return <CustomLoader message={isEditMode ? "Updating Lead..." : "Creating Lead..."} />
  }

  const today = new Date().toLocaleDateString("en-CA");
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDate = maxDateObj.toLocaleDateString("en-CA");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[100vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? "Edit Lead" : "Create New Lead"}
            </h3>
            <p className="text-sm text-gray-500">
              {isEditMode
                ? `Update lead information - Step ${currentStep} of 3`
                : `Step ${currentStep} of 3`}
            </p>
          </div>
          <button
            onClick={() => setShowCancelAlert(true)}
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
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center space-x-2 ${currentStep === step.id
                    ? "text-blue-600"
                    : currentStep > step.id
                      ? "text-green-600"
                      : "text-gray-400"
                    } cursor-pointer hover:text-blue-700`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step.id
                      ? "bg-blue-100 text-blue-600"
                      : currentStep > step.id
                        ? "bg-green-100 text-green-600"
                        : "text-gray-500 bg-gray-100" // active-like style for clickable steps
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
          {/* Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center mb-2">
                <span className="text-red-500 mr-2">⚠</span>
                <h4 className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </h4>
              </div>
              <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: General Information */}
            {/* {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer *
                    </label>
                    <select
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.businessName
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    >
                      <option value="">Select Business</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.name}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    <ValidationError fieldName="businessName" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Branch

                    </label>
                    <select
                      name="customerBranch"
                      value={formData.customerBranch}
                      onChange={handleInputChange}
                      disabled={!formData.businessName}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${validationErrors.customerBranch
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    >
                      <option value="">Select Branch</option>
                      {customerBranches.map((branch) => (
                        <option key={branch.id} value={branch.branch_name}>
                          {branch.branch_name}
                        </option>
                      ))}
                    </select>
                    <ValidationError fieldName="customerBranch" />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {currenciesToShow.map((currency, index) => (
                        <option key={index} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person {selectedBranchId ? "(Branch)" : "(Customer)"}
                    </label>
                    <select
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.businessName}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${validationErrors.contactPerson
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    >
                      <option value="">Select Contact Person</option>
                      {contactPersons.map((person) => (
                        <option key={person.id} value={person.name}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                    <ValidationError fieldName="contactPerson" />
                    {contactPersons.length === 0 && formData.businessName && (
                      <p className="text-xs text-amber-600 mt-1">
                        No contacts available for this {selectedBranchId ? "branch" : "customer"}
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
                      placeholder="+91 98765 43210"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.contactNo
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    <ValidationError fieldName="contactNo" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Generated Date *
                    </label>
                    <input
                      type="date"
                      name="leadGeneratedDate"
                      value={formData.leadGeneratedDate}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                    />
                    <ValidationError fieldName="leadGeneratedDate" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referenced By
                    </label>
                    <select
                      name="referencedBy"
                      value={formData.referencedBy}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.referencedBy
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    <ValidationError fieldName="referencedBy" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter project name"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.projectName
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    <ValidationError fieldName="projectName" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Value ( lakh )*
                    </label>
                    <input
                      type="number"
                      name="projectValue"
                      value={String(formData.projectValue ?? "")}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter value in selected currency"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.projectValue
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    <ValidationError fieldName="projectValue" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Type *
                    </label>
                    <select
                      name="leadType"
                      value={formData.leadType}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadType
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    >
                      <option value="">Select Lead Type</option>
                      {leadTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ValidationError fieldName="leadType" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Type {!isEditMode && <span className="text-blue-600">(Select multiple)</span>}
                    </label>
                    {isEditMode ? (
                      <select
                        name="workType"
                        value={formData.workType}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.workType
                          ? "border-red-500"
                          : "border-gray-300"}`}
                      >
                        <option value="">Select Work Type</option>
                        {workTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <div
                          onClick={() => setShowWorkTypeDropdown(!showWorkTypeDropdown)}
                          className={`w-full px-3 py-2 border rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[42px] flex items-center ${validationErrors.workType ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                          {formData.workType.length > 0 ? (
                            <span className="text-gray-900">{formData.workType.join(", ")}</span>
                          ) : (
                            <span className="text-gray-400">Select Work types</span>
                          )}
                        </div>
                        {showWorkTypeDropdown && (
                          <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                            {workTypes.map((type) => (
                              <label key={type} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={Array.isArray(formData.workType) && formData.workType.includes(type)}
                                  onChange={(e) => {
                                    const currentWorktypes = Array.isArray(formData.workType) ? formData.workType : [];
                                    let newWorktypes;
                                    if (e.target.checked) {
                                      newWorktypes = [...currentWorktypes, type];
                                    } else {
                                      newWorktypes = currentWorktypes.filter((w) => w !== type);
                                    }
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      workType: newWorktypes,
                                    }));
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">{type}</span>
                              </label>
                            ))}

                            <div className="border-t border-gray-200 p-2">
                              <button
                                type="button"
                                onClick={() => setShowWorkTypeDropdown(false)}
                                className="w-full px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {!isEditMode && (
                      <div className="mt-2">
                        {Array.isArray(formData.workType) && formData.workType.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.workType.map((type: string) => (
                              <span
                                key={type}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {type}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      workType: prev.workType.filter((w: string) => w !== type),
                                    }));
                                  }}
                                  className="ml-1 hover:text-blue-900"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {!isEditMode && Array.isArray(formData.workType) && formData.workType.length > 0 && (
                      <div className="mt-4 mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Completion Mode</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="creationMode"
                              value="multiple"
                              checked={creationMode === 'multiple'}
                              onChange={() => setCreationMode('multiple')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Multiple Leads (One per Work Type)</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="creationMode"
                              value="single"
                              checked={creationMode === 'single'}
                              onChange={() => setCreationMode('single')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Single Lead (Unified)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    <ValidationError fieldName="workType" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Criticality *
                    </label>
                    <select
                      name="leadCriticality"
                      value={formData.leadCriticality}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadCriticality
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    >
                      <option value="">Select Criticality</option>
                      {leadCriticalities.map((criticality) => (
                        <option key={criticality} value={criticality}>
                          {criticality}
                        </option>
                      ))}
                    </select>
                    <ValidationError fieldName="leadCriticality" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Source *
                    </label>
                    {!showCustomLeadSource ? (
                      <select
                        name="leadSource"
                        value={formData.leadSource}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadSource
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      >
                        <option value="">Select Source</option>
                        {leadSources.map((source) => (
                          <option key={source} value={source}>
                            {source}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="customLeadSource"
                          value={customLeadSource}
                          onChange={(e) => {
                            setCustomLeadSource(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              leadSource: e.target.value,
                            }));
                          }}
                          placeholder="Enter custom lead source"
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadSource
                            ? "border-red-500"
                            : "border-gray-300"
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomLeadSource(false);
                            setCustomLeadSource("");
                            setFormData((prev) => ({
                              ...prev,
                              leadSource: "",
                            }));
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Back to dropdown
                        </button>
                      </div>
                    )}
                    <ValidationError fieldName="leadSource" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Stage * (Auto-updated)
                    </label>
                    <select
                      name="leadStage"
                      value={formData.leadStage}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                      title="Lead stage is automatically updated based on file uploads and quotations"
                    >
                      {leadStages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Stage changes to "Enquiry" when files are uploaded
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Follow-Up Date *
                    </label>
                    <input
                      type="date"
                      name="nextFollowUpDate"
                      value={formData.nextFollowUpDate}
                      onChange={handleInputChange}
                      min={today}
                      max={maxDate}
                      required
                      placeholder="Select date"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.nextFollowUpDate
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    <ValidationError fieldName="nextFollowUpDate" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Closure
                    </label>
                    <input
                      type="date"
                      name="eta"
                      value={formData.eta}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.eta
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    <ValidationError fieldName="eta" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Details
                  </label>
                  <textarea
                    name="leadDetails"
                    value={formData.leadDetails}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Enter detailed description of the lead..."
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadDetails
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                  />
                  <ValidationError fieldName="leadDetails" />
                  {formData.leadDetails && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.leadDetails.length}/1000 characters
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Involved Associates
                  </label>
                  {formData.involvedAssociates.length === 0 &&
                    !showAssociateForm && (
                      <button
                        type="button"
                        onClick={() => setShowAssociateForm(true)}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                      >
                        + Tag Associate
                      </button>
                    )}

                  {showAssociateForm && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <div>
                        <select
                          name="designation"
                          value={associateForm.designation}
                          onChange={handleAssociateFormChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-sm"
                        >
                          <option value="">Select Designation</option>
                          {associateDesignations.map((des) => (
                            <option key={des} value={des}>
                              {des}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          name="associateId"
                          value={associateForm.associateId}
                          onChange={handleAssociateFormChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-sm"
                        >
                          <option value="">Select Associate</option>
                          {registeredAssociates.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          name="otherInfo"
                          value={associateForm.otherInfo}
                          onChange={handleAssociateFormChange}
                          placeholder="Other Information"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-sm"
                        />
                      </div>
                      <div className="col-span-3 flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={addAssociate}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          disabled={
                            !associateForm.designation ||
                            !associateForm.associateId
                          }
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAssociateForm(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.involvedAssociates.length > 0 && (
                    <div className="space-y-2">
                      {formData.involvedAssociates.map((a: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div>
                            <span className="font-thin text-sm">
                              {a.designation}
                            </span>{" "}
                            <span className="text-gray-700 text-sm">
                              {a.associateName}
                            </span>
                            {a.otherInfo && (
                              <span className="text-gray-500 ml-2 text-xs">
                                ({a.otherInfo})
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAssociate(idx)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowAssociateForm(true)}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs mt-1"
                      >
                        + Tag Another Associate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )} */}

            {currentStep === 1 && (
              <div className="space-y-6">
                {/* ===== SECTION 1: Basic Information ===== */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer */}
                    <div>
                      <SearchableSelect
                        label="Customer *"
                        options={customers.map((customer) => ({
                          value: customer.name,
                          label: customer.name,
                        }))}
                        value={formData.businessName}
                        onChange={(value) =>
                          handleInputChange({
                            target: { name: "businessName", value },
                          } as any)
                        }
                        placeholder="Select Business"
                        error={!!validationErrors.businessName}
                      />
                      <ValidationError fieldName="businessName" />
                    </div>
                    {/* Customer Branch */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Branch
                      </label>
                      <select
                        name="customerBranch"
                        value={formData.customerBranch}
                        onChange={handleInputChange}
                        disabled={!formData.businessName}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${validationErrors.customerBranch
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      >
                        <option value="">Select Branch</option>
                        {customerBranches.map((branch) => (
                          <option key={branch.id} value={branch.branch_name}>
                            {branch.branch_name}
                          </option>
                        ))}
                      </select>
                      <ValidationError fieldName="customerBranch" />
                    </div>

                    {/* Select From Temporary Lead */}
                    {!isEditMode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select From Temporary Lead
                        </label>
                        <select
                          value={selectedTempLeadId}
                          onChange={(e) => handleTempLeadSelect(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Temporary Lead</option>
                          {tempLeads.map((lead) => (
                            <option key={lead.lead_id} value={lead.lead_id}>
                              {lead.project_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency *
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {currenciesToShow.map((currency, index) => (
                          <option key={index} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Lead Generated Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Generated Date *
                      </label>
                      <input
                        type="date"
                        name="leadGeneratedDate"
                        value={formData.leadGeneratedDate}
                        onChange={handleInputChange}
                        required
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                      />
                      <ValidationError fieldName="leadGeneratedDate" />
                    </div>
                    {/* Referenced By */}
                    <div>
                      <SearchableSelect
                        label="Referenced By"
                        options={users.map((user) => ({
                          value: user.name,
                          label: user.name,
                        }))}
                        value={formData.referencedBy}
                        onChange={(value) =>
                          handleInputChange({
                            target: { name: "referencedBy", value },
                          } as any)
                        }
                        placeholder="Select User"
                        error={!!validationErrors.referencedBy}
                      />
                      <ValidationError fieldName="referencedBy" />
                    </div>
                    {/* Lead Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Type *
                      </label>
                      <select
                        name="leadType"
                        value={formData.leadType}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadType
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      >
                        <option value="">Select Lead Type</option>
                        {leadTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ValidationError fieldName="leadType" />
                    </div>
                    {/* Work Type - KEEP EXISTING COMPLEX LOGIC AS IS */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Type {!isEditMode && <span className="text-blue-600">(Select multiple)</span>}
                      </label>
                      {isEditMode ? (
                        <select
                          name="workType"
                          value={formData.workType}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.workType
                            ? "border-red-500"
                            : "border-gray-300"}`}
                        >
                          <option value="">Select Work Type</option>
                          {workTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="relative">
                          <div
                            onClick={() => setShowWorkTypeDropdown(!showWorkTypeDropdown)}
                            className={`w-full px-3 py-2 border rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[42px] flex items-center ${validationErrors.workType ? "border-red-500" : "border-gray-300"
                              }`}
                          >
                            {formData.workType.length > 0 ? (
                              <span className="text-gray-900">{formData.workType.join(", ")}</span>
                            ) : (
                              <span className="text-gray-400">Select Work types</span>
                            )}
                          </div>
                          {showWorkTypeDropdown && (
                            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                              {workTypes.map((type) => (
                                <label key={type} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50">
                                  <input
                                    type="checkbox"
                                    checked={Array.isArray(formData.workType) && formData.workType.includes(type)}
                                    onChange={(e) => {
                                      const currentWorktypes = Array.isArray(formData.workType) ? formData.workType : [];
                                      let newWorktypes;
                                      if (e.target.checked) {
                                        newWorktypes = [...currentWorktypes, type];
                                      } else {
                                        newWorktypes = currentWorktypes.filter((w) => w !== type);
                                      }
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        workType: newWorktypes,
                                      }));
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-700">{type}</span>
                                </label>
                              ))}
                              <div className="border-t border-gray-200 p-2">
                                <button
                                  type="button"
                                  onClick={() => setShowWorkTypeDropdown(false)}
                                  className="w-full px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {!isEditMode && (
                        <div className="mt-2">
                          {Array.isArray(formData.workType) && formData.workType.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {formData.workType.map((type: string) => (
                                <span
                                  key={type}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {type}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        workType: prev.workType.filter((w: string) => w !== type),
                                      }));
                                    }}
                                    className="ml-1 hover:text-blue-900"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {!isEditMode && Array.isArray(formData.workType) && formData.workType.length > 0 && (
                        <div className="mt-4 mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Completion Mode</label>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="creationMode"
                                value="multiple"
                                checked={creationMode === 'multiple'}
                                onChange={() => setCreationMode('multiple')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-sm text-gray-700">Multiple Leads (One per Work Type)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="creationMode"
                                value="single"
                                checked={creationMode === 'single'}
                                onChange={() => setCreationMode('single')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="text-sm text-gray-700">Single Lead (Unified)</span>
                            </label>
                          </div>
                        </div>
                      )}
                      <ValidationError fieldName="workType" />
                    </div>
                    {/* Lead Criticality */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Criticality *
                      </label>
                      <select
                        name="leadCriticality"
                        value={formData.leadCriticality}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadCriticality
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      >
                        <option value="">Select Criticality</option>
                        {leadCriticalities.map((criticality) => (
                          <option key={criticality} value={criticality}>
                            {criticality}
                          </option>
                        ))}
                      </select>
                      <ValidationError fieldName="leadCriticality" />
                    </div>
                    {/* Lead Source - KEEP EXISTING CUSTOM SOURCE LOGIC */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Source *
                      </label>
                      {!showCustomLeadSource ? (
                        <select
                          name="leadSource"
                          value={formData.leadSource}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadSource
                            ? "border-red-500"
                            : "border-gray-300"
                            }`}
                        >
                          <option value="">Select Source</option>
                          {leadSources.map((source) => (
                            <option key={source} value={source}>
                              {source}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            name="customLeadSource"
                            value={customLeadSource}
                            onChange={(e) => {
                              setCustomLeadSource(e.target.value);
                              setFormData((prev) => ({
                                ...prev,
                                leadSource: e.target.value,
                              }));
                            }}
                            placeholder="Enter custom lead source"
                            required
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadSource
                              ? "border-red-500"
                              : "border-gray-300"
                              }`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomLeadSource(false);
                              setCustomLeadSource("");
                              setFormData((prev) => ({
                                ...prev,
                                leadSource: "",
                              }));
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Back to dropdown
                          </button>
                        </div>
                      )}
                      <ValidationError fieldName="leadSource" />
                    </div>
                    {/* Lead Stage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Stage * (Auto-updated)
                      </label>
                      <select
                        name="leadStage"
                        value={formData.leadStage}
                        onChange={handleInputChange}
                        required
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                        title="Lead stage is automatically updated based on file uploads and quotations"
                      >
                        {leadStages.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Stage changes to "Enquiry" when files are uploaded
                      </p>
                    </div>
                    {/* Next Follow-Up Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Follow-Up Date *
                      </label>
                      <input
                        type="date"
                        name="nextFollowUpDate"
                        value={formData.nextFollowUpDate}
                        onChange={handleInputChange}
                        min={today}
                        max={maxDate}
                        required
                        placeholder="Select date"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.nextFollowUpDate
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      />
                      <ValidationError fieldName="nextFollowUpDate" />
                    </div>
                    {/* Deal Closure */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal Closure
                      </label>
                      <input
                        type="date"
                        name="eta"
                        value={formData.eta}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.eta
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      />
                      <ValidationError fieldName="eta" />
                    </div>
                    {/* NEW FIELD: Lead Temperature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Temperature
                      </label>
                      <select
                        name="leadTemperature"
                        value={formData.leadTemperature}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Temperature</option>
                        {leadTemperatures.map((temp) => (
                          <option key={temp} value={temp}>
                            {temp}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ===== SECTION 2: Project Details ===== */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 border-b pb-2">Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Project Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter project name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.projectName
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      />
                      <ValidationError fieldName="projectName" />
                    </div>
                    {/* Project Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Value ( lakh )*
                      </label>
                      <input
                        type="number"
                        name="projectValue"
                        value={String(formData.projectValue ?? "")}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter value in selected currency"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.projectValue
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      />
                      <ValidationError fieldName="projectValue" />
                    </div>
                    {/* NEW FIELD: Project Zone */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Zone
                      </label>
                      <select
                        name="projectZone"
                        value={formData.projectZone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Zone</option>
                        {projectZones.map((zone) => (
                          <option key={zone} value={zone}>
                            {zone}
                          </option>
                        ))}
                      </select>
                    </div> */}

                    {/* NEW FIELD: Project Zone */}
                    <div>
                      <SearchableSelect
                        label="Project Zone"
                        options={zones.map(z => ({ value: z.id, label: z.name }))}
                        value={formData.projectZone}
                        onChange={(value) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            projectZone: value,
                            projectState: '',
                            projectDistrict: ''
                          }));
                        }}
                        placeholder="Select Zone"
                      />
                    </div>

                    {/* NEW FIELD: Project State */}
                    <div>
                      <SearchableSelect
                        label="Project State"
                        options={states
                          .filter(s => s.zone_id === formData.projectZone)
                          .map(s => ({ value: s.id, label: s.name }))}
                        value={formData.projectState}
                        onChange={(value) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            projectState: value,
                            projectDistrict: ''
                          }));
                        }}
                        placeholder="Select State"
                        disabled={!formData.projectZone}
                      />
                    </div>

                    {/* NEW FIELD: Project District */}
                    <div>
                      <SearchableSelect
                        label="Project District"
                        options={districts
                          .filter(d => d.state_id === formData.projectState)
                          .map(d => ({ value: d.id, label: d.name }))}
                        value={formData.projectDistrict}
                        onChange={(value) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            projectDistrict: value
                          }));
                        }}
                        placeholder="Select District"
                        disabled={!formData.projectState}
                      />
                    </div>

                    {/* NEW FIELD: Project City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project City
                      </label>
                      <select
                        name="projectCity"
                        value={formData.projectCity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select City</option>
                        {projectCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* NEW FIELD: Project Street */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Street
                      </label>
                      <input
                        type="text"
                        name="projectStreet"
                        value={formData.projectStreet}
                        onChange={handleInputChange}
                        placeholder="Enter street address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {/* NEW FIELD: Project Location */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Location
                      </label>
                      <input
                        type="text"
                        name="projectLocation"
                        value={formData.projectLocation}
                        onChange={handleInputChange}
                        placeholder="Enter location details"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* NEW FIELD: Project Pincode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Pincode
                      </label>
                      <input
                        type="text"
                        name="projectPincode"
                        value={formData.projectPincode}
                        onChange={handleInputChange}
                        placeholder="Enter pincode"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* NEW FIELD: Project Current Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Current Status
                      </label>
                      <select
                        name="projectCurrentStatus"
                        value={formData.projectCurrentStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Status</option>
                        {projectCurrentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ===== SECTION 3: Other Details ==` */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 border-b pb-2">Other Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NEW FIELD: Probability % */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Probability %
                      </label>
                      <input
                        type="number"
                        name="ownProbability"
                        value={formData.ownProbability}
                        onChange={handleInputChange}
                        placeholder="Enter probability (0-100)"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                          <h3 className="text-md font-semibold text-gray-800">Competitors</h3>
                          <button
                            type="button"
                            onClick={() => setShowAddCompetitor(true)}
                            className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                          >
                            + Add Competitor
                          </button>
                        </div>

                        {/* Display added competitors */}
                        {formData.leadCompetitors && formData.leadCompetitors.length > 0 ? (
                          <div className="space-y-3">
                            {formData.leadCompetitors.map((competitor: any, index: number) => (
                              <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-medium text-gray-900">
                                    {editingCompetitorIndex === index ? "Edit Competitor" : competitor.competitor_name}
                                  </h4>
                                  <div className="flex space-x-2">
                                    {editingCompetitorIndex === index ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            // Save changes
                                            if (competitor.id && isEditMode) {
                                              // Update existing competitor via PUT API
                                              try {
                                                // Build payload with only modified non-empty fields
                                                const modifiedFields: any = {};

                                                // Compare each field with original competitor data
                                                Object.keys(editingCompetitorData).forEach((key) => {
                                                  const originalValue = competitor[key];
                                                  const newValue = editingCompetitorData[key];

                                                  // Skip if values are the same
                                                  if (JSON.stringify(originalValue) === JSON.stringify(newValue)) {
                                                    return;
                                                  }

                                                  // Skip if new value is empty/null/undefined
                                                  if (newValue === null || newValue === undefined || newValue === '') {
                                                    return;
                                                  }

                                                  modifiedFields[key] = newValue;
                                                });

                                                // Send PUT request if there are modified fields
                                                if (Object.keys(modifiedFields).length > 0) {
                                                  const response = await axios.put(
                                                    `${import.meta.env.VITE_API_BASE_URL}/lead-competitor/${competitor.id}`,
                                                    {
                                                      ...modifiedFields,
                                                      updated_by: userData?.id || ''
                                                    }
                                                  );

                                                  if (response.data.success) {
                                                    showToast('Competitor updated successfully', 'success');

                                                    // Update local state
                                                    setFormData((prev: any) => ({
                                                      ...prev,
                                                      leadCompetitors: prev.leadCompetitors.map((c: any, i: number) =>
                                                        i === index ? { ...c, ...editingCompetitorData } : c
                                                      )
                                                    }));
                                                  }
                                                }
                                              } catch (error: any) {
                                                console.error('Error updating competitor:', error);
                                                showToast(error.response?.data?.clientMessage || 'Failed to update competitor', 'error');
                                              }
                                            } else {
                                              // Just update local state for new competitors
                                              setFormData((prev: any) => ({
                                                ...prev,
                                                leadCompetitors: prev.leadCompetitors.map((c: any, i: number) =>
                                                  i === index ? { ...editingCompetitorData } : c
                                                )
                                              }));
                                            }
                                            setEditingCompetitorIndex(null);
                                            setEditingCompetitorData(null);
                                          }}
                                          className="text-green-500 hover:text-green-700"
                                        >
                                          <Save className="h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCompetitorIndex(null);
                                            setEditingCompetitorData(null);
                                          }}
                                          className="text-gray-500 hover:text-gray-700"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCompetitorIndex(index);
                                            setEditingCompetitorData({ ...competitor });
                                          }}
                                          className="text-blue-500 hover:text-blue-700"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (competitor.id && isEditMode) {
                                              // Delete via API for existing competitors
                                              try {
                                                const response = await axios.delete(
                                                  `${import.meta.env.VITE_API_BASE_URL}/lead-competitor/${competitor.id}`
                                                );
                                                if (response.data.success) {
                                                  showToast('Competitor deleted successfully', 'success');
                                                  setFormData((prev: any) => ({
                                                    ...prev,
                                                    leadCompetitors: prev.leadCompetitors.filter((_: any, i: number) => i !== index)
                                                  }));
                                                }
                                              } catch (error: any) {
                                                console.error('Error deleting competitor:', error);
                                                showToast(error.response?.data?.clientMessage || 'Failed to delete competitor', 'error');
                                              }
                                            } else {
                                              // Just remove from array for new competitors
                                              setFormData((prev: any) => ({
                                                ...prev,
                                                leadCompetitors: prev.leadCompetitors.filter((_: any, i: number) => i !== index)
                                              }));
                                            }
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {editingCompetitorIndex === index ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Competitor Name *</label>
                                      <input
                                        type="text"
                                        value={editingCompetitorData.competitor_name}
                                        onChange={(e) => setEditingCompetitorData({ ...editingCompetitorData, competitor_name: e.target.value })}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Win Probability % *</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editingCompetitorData.win_probability}
                                        onChange={(e) => setEditingCompetitorData({ ...editingCompetitorData, win_probability: e.target.value })}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="font-medium text-gray-600">Win Probability:</span>
                                      <span className="ml-1 text-orange-600 font-semibold">{competitor.win_probability}%</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No competitors added yet. Click "Add Competitor" to add one.
                          </p>
                        )}

                        {/* Add Competitor Modal */}
                        {showAddCompetitor && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Add Competitor</h3>
                                <button
                                  onClick={() => {
                                    setShowAddCompetitor(false);
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Competitor Name *
                                  </label>
                                  <input
                                    type="text"
                                    id="new-competitor-name"
                                    placeholder="Enter competitor name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Win Probability % *
                                  </label>
                                  <input
                                    type="number"
                                    id="new-competitor-probability"
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end space-x-3 mt-6">
                                <button
                                  onClick={() => {
                                    setShowAddCompetitor(false);
                                  }}
                                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={async () => {
                                    const nameInput = document.getElementById('new-competitor-name') as HTMLInputElement;
                                    const probabilityInput = document.getElementById('new-competitor-probability') as HTMLInputElement;

                                    const competitorName = nameInput?.value?.trim();
                                    const winProbability = probabilityInput?.value?.trim();

                                    // Validation
                                    if (!competitorName) {
                                      showToast('Please enter competitor name', 'error');
                                      return;
                                    }

                                    if (!winProbability || parseFloat(winProbability) < 0 || parseFloat(winProbability) > 100) {
                                      showToast('Please enter a valid win probability between 0-100', 'error');
                                      return;
                                    }

                                    const newCompetitor = {
                                      competitor_name: competitorName,
                                      win_probability: parseFloat(winProbability)
                                    };

                                    // If in edit mode, immediately save to backend
                                    if (isEditMode && initialData?.id) {
                                      try {
                                        const response = await axios.post(
                                          `${import.meta.env.VITE_API_BASE_URL}/lead-competitor`,
                                          {
                                            lead_id: initialData.id,
                                            competitor_name: competitorName,
                                            win_probability: parseFloat(winProbability),
                                            created_by: userData?.id || ''
                                          }
                                        );

                                        if (response.data.success) {
                                          showToast('Competitor added successfully', 'success');
                                          // Add to local state with the returned ID
                                          setFormData((prev: any) => ({
                                            ...prev,
                                            leadCompetitors: [...(prev.leadCompetitors || []), {
                                              id: response.data.data.id,
                                              ...newCompetitor
                                            }]
                                          }));
                                        }
                                      } catch (error: any) {
                                        console.error('Error adding competitor:', error);
                                        showToast(error.response?.data?.clientMessage || 'Failed to add competitor', 'error');
                                        return;
                                      }
                                    } else {
                                      // In create mode, just add to array
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        leadCompetitors: [...(prev.leadCompetitors || []), newCompetitor]
                                      }));
                                      showToast('Competitor added', 'success');
                                    }

                                    // Clear inputs and close modal
                                    if (nameInput) nameInput.value = '';
                                    if (probabilityInput) probabilityInput.value = '';
                                    setShowAddCompetitor(false);
                                  }}
                                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                                >
                                  Add Competitor
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Lead Details */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead Details
                      </label>
                      <textarea
                        name="leadDetails"
                        value={formData.leadDetails}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Enter detailed description of the lead..."
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.leadDetails
                          ? "border-red-500"
                          : "border-gray-300"
                          }`}
                      />
                      <ValidationError fieldName="leadDetails" />
                      {formData.leadDetails && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.leadDetails.length}/1000 characters
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== SECTION 4: Competitors ===== */}

                {/* ===== SECTION 5: Contact Persons ===== */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-md font-semibold text-gray-800">Contact Persons</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddContact(true)}
                      disabled={!formData.businessName}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      + Add Contact Person
                    </button>
                  </div>

                  {/* Display added contacts */}
                  {formData.leadContacts && formData.leadContacts.length > 0 ? (
                    <div className="space-y-3">
                      {formData.leadContacts.map((contact: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-900">
                              {editingContactIndex === index ? "Edit Contact Person" : contact.name}
                            </h4>
                            <div className="flex space-x-2">
                              {editingContactIndex === index ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      // Save changes
                                      if (contact.id && isEditMode) {
                                        // Update existing contact via PUT API
                                        try {
                                          // Build payload with only modified non-empty fields
                                          const modifiedFields: any = {};

                                          // Compare each field with original contact data
                                          Object.keys(editingContactData).forEach((key) => {
                                            const originalValue = contact[key];
                                            const newValue = editingContactData[key];

                                            // Skip if values are the same
                                            if (JSON.stringify(originalValue) === JSON.stringify(newValue)) {
                                              return;
                                            }

                                            // Skip if new value is empty/null/undefined
                                            if (newValue === null || newValue === undefined || newValue === '') {
                                              return;
                                            }

                                            // Skip if new value is an empty array
                                            if (Array.isArray(newValue) && newValue.length === 0) {
                                              return;
                                            }

                                            // Include the modified non-empty field
                                            modifiedFields[key] = newValue;
                                          });

                                          // Always include updated_by
                                          modifiedFields.updated_by = userData?.id || null;

                                          // Only make API call if there are fields to update
                                          if (Object.keys(modifiedFields).length > 1) { // > 1 because updated_by is always included
                                            await axios.put(
                                              `${import.meta.env.VITE_API_BASE_URL}/lead-contact/${contact.id}`,
                                              modifiedFields
                                            );

                                            // Update local state
                                            setFormData((prev: any) => ({
                                              ...prev,
                                              leadContacts: prev.leadContacts.map((c: any, i: number) =>
                                                i === index ? { ...c, ...editingContactData } : c
                                              )
                                            }));
                                            setEditingContactIndex(null);
                                            setEditingContactData(null);
                                            showToast("Contact updated successfully!");
                                          } else {
                                            // No changes detected
                                            setEditingContactIndex(null);
                                            setEditingContactData(null);
                                            showToast("No changes detected.");
                                          }
                                        } catch (error) {
                                          console.error("Error updating contact:", error);
                                          showToast("Failed to update contact. Please try again.");
                                        }
                                      } else {
                                        // Just update local state for new contacts
                                        setFormData((prev: any) => ({
                                          ...prev,
                                          leadContacts: prev.leadContacts.map((c: any, i: number) =>
                                            i === index ? { ...c, ...editingContactData } : c
                                          )
                                        }));
                                        setEditingContactIndex(null);
                                        setEditingContactData(null);
                                      }
                                    }}
                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingContactIndex(null);
                                      setEditingContactData(null);
                                    }}
                                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingContactIndex(index);
                                      setEditingContactData({ ...contact });
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (contact.id && isEditMode) {
                                        // Delete via API
                                        if (window.confirm("Are you sure you want to delete this contact?")) {
                                          try {
                                            await axios.delete(
                                              `${import.meta.env.VITE_API_BASE_URL}/lead-contact/${contact.id}`
                                            );
                                            setFormData((prev: any) => ({
                                              ...prev,
                                              leadContacts: prev.leadContacts.filter((_: any, i: number) => i !== index)
                                            }));
                                            showToast("Contact deleted successfully!", "success");
                                          } catch (error) {
                                            console.error("Error deleting contact:", error);
                                            showToast("Failed to delete contact. Please try again.", "error");
                                          }
                                        }
                                      } else {
                                        // Just remove from local state
                                        if (window.confirm("Are you sure you want to remove this contact?")) {
                                          setFormData((prev: any) => ({
                                            ...prev,
                                            leadContacts: prev.leadContacts.filter((_: any, i: number) => i !== index)
                                          }));
                                        }
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {editingContactIndex === index ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                  type="text"
                                  value={editingContactData.name}
                                  onChange={(e) => setEditingContactData({ ...editingContactData, name: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                                <input
                                  type="text"
                                  value={editingContactData.designation || ""}
                                  onChange={(e) => setEditingContactData({ ...editingContactData, designation: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number *</label>
                                <input
                                  type="tel"
                                  value={editingContactData.phone}
                                  onChange={(e) => setEditingContactData({ ...editingContactData, phone: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Alternative Number</label>
                                <input
                                  type="tel"
                                  value={editingContactData.alternative_number || ""}
                                  onChange={(e) => setEditingContactData({ ...editingContactData, alternative_number: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email ID</label>
                                <input
                                  type="email"
                                  value={editingContactData.email || ""}
                                  onChange={(e) => setEditingContactData({ ...editingContactData, email: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Date Of Birth</label>
                                <input
                                  type="date"
                                  value={editingContactData.date_of_birth || ""}
                                  onChange={(e) => setEditingContactData({ ...editingContactData, date_of_birth: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Anniversary Date</label>
                                <input
                                  type="date"
                                  value={editingContactData.anniversary_date || ""}
                                  onChange={(e) => setEditingContactData({ ...editingContactData, anniversary_date: e.target.value })}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Communication Mode *</label>
                                <div className="flex flex-wrap gap-3 mt-2">
                                  {['WhatsApp', 'Email', 'Call', 'VC', 'Physical'].map((mode) => {
                                    const communicationModes = Array.isArray(editingContactData.communication_mode)
                                      ? editingContactData.communication_mode
                                      : (editingContactData.communication_mode ? editingContactData.communication_mode.split(',').map((m: string) => m.trim()) : []);

                                    return (
                                      <label key={mode} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={communicationModes.includes(mode)}
                                          onChange={(e) => {
                                            let updatedModes = [...communicationModes];
                                            if (e.target.checked) {
                                              updatedModes.push(mode);
                                            } else {
                                              updatedModes = updatedModes.filter(m => m !== mode);
                                            }
                                            setEditingContactData({
                                              ...editingContactData,
                                              communication_mode: updatedModes
                                            });
                                          }}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{mode}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 text-sm">

                              <div>
                                <span className="font-medium text-gray-600">Designation:</span>
                                <span className="ml-1 text-gray-800">{contact.designation}</span>
                              </div>

                              <div>
                                <span className="font-medium text-gray-600">Phone:</span>
                                <span className="ml-1 text-gray-800">{contact.phone}</span>
                              </div>

                              <div>
                                <span className="font-medium text-gray-600">Alt Phone:</span>
                                <span className="ml-1 text-gray-800">{contact.alternative_number}</span>
                              </div>


                              <div>
                                <span className="font-medium text-gray-600">Email:</span>
                                <span className="ml-1 text-gray-800">{contact.email}</span>
                              </div>


                              <div>
                                <span className="font-medium text-gray-600">DOB:</span>
                                <span className="ml-1 text-gray-800">{contact.date_of_birth}</span>
                              </div>


                              <div>
                                <span className="font-medium text-gray-600">Anniversary:</span>
                                <span className="ml-1 text-gray-800">{contact.anniversary_date}</span>
                              </div>


                              <div className="col-span-2">
                                <span className="font-medium text-gray-600">Communication Mode:</span>
                                <span className="ml-1 text-gray-800">
                                  {Array.isArray(contact.communication_mode)
                                    ? contact.communication_mode.join(', ')
                                    : contact.communication_mode}
                                </span>
                              </div>

                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No contact persons added yet. Click "Add Contact Person" to add one.
                    </p>
                  )}

                  {/* Add Contact Modal */}
                  {showAddContact && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Add Contact Person</h3>
                          <button
                            onClick={() => {
                              setShowAddContact(false);
                              setSelectedContactForAdd("");
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Select Contact Person {selectedBranchId ? "(Branch)" : "(Customer)"}
                            </label>
                            <select
                              value={selectedContactForAdd}
                              onChange={(e) => setSelectedContactForAdd(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Contact Person</option>
                              {contactPersons.map((person) => (
                                <option key={person.id} value={person.id}>
                                  {person.name}
                                </option>
                              ))}
                            </select>
                            {contactPersons.length === 0 && (
                              <p className="text-xs text-amber-600 mt-1">
                                No contacts available for this {selectedBranchId ? "branch" : "customer"}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddContact(false);
                                setSelectedContactForAdd("");
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (selectedContactForAdd) {
                                  const selectedContact = contactPersons.find(
                                    (p) => p.id === selectedContactForAdd
                                  );
                                  if (selectedContact) {
                                    // Check if already added using contact_id (not id, since new contacts don't have lead-contact id yet)
                                    const alreadyAdded = formData.leadContacts.some(
                                      (c: any) => c.contact_id === selectedContact.id
                                    );
                                    if (alreadyAdded) {
                                      showToast("This contact person has already been added.");
                                      return;
                                    }

                                    const newContactData = {
                                      contact_id: selectedContact.id,
                                      name: selectedContact.name,
                                      designation: selectedContact.designation || "",
                                      email: selectedContact.email || "",
                                      phone: selectedContact.phone || "",
                                      alternative_number: selectedContact.alternative_number || "",
                                      date_of_birth: selectedContact.date_of_birth || "",
                                      anniversary_date: selectedContact.anniversary_date || "",
                                      communication_mode: selectedContact.communication_mode || "",
                                    };

                                    // If in edit mode, immediately save to backend via POST API
                                    if (isEditMode && initialData?.id) {
                                      try {
                                        const response = await axios.post(
                                          `${import.meta.env.VITE_API_BASE_URL}/lead-contact`,
                                          {
                                            lead_id: initialData.id,
                                            ...newContactData,
                                            created_by: userData?.id || null
                                          }
                                        );

                                        // Add to local state with the returned lead-contact ID
                                        const createdContact = response.data.data;
                                        setFormData((prev: any) => ({
                                          ...prev,
                                          leadContacts: [
                                            ...prev.leadContacts,
                                            {
                                              id: createdContact.id, // Now it has a lead-contact record ID
                                              ...newContactData
                                            }
                                          ]
                                        }));
                                        setShowAddContact(false);
                                        setSelectedContactForAdd("");
                                        showToast("Contact person added successfully!", "success");
                                      } catch (error) {
                                        console.error("Error adding contact:", error);
                                        showToast("Failed to add contact person. Please try again.", "error");
                                      }
                                    } else {
                                      // Create mode: just add to local state (will be saved when lead is created)
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        leadContacts: [
                                          ...prev.leadContacts,
                                          newContactData
                                        ]
                                      }));
                                      setShowAddContact(false);
                                      setSelectedContactForAdd("");
                                    }
                                  }
                                }
                              }}
                              disabled={!selectedContactForAdd}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Add Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== SECTION 5: Involved Associates - KEEP EXISTING AS IS ===== */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 border-b pb-2">Involved Associates</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Involved Associates
                    </label>
                    {formData.involvedAssociates.length === 0 &&
                      !showAssociateForm && (
                        <button
                          type="button"
                          onClick={() => setShowAssociateForm(true)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                        >
                          + Tag Associate
                        </button>
                      )}
                    {showAssociateForm && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                        <div>
                          <select
                            name="designation"
                            value={associateForm.designation}
                            onChange={handleAssociateFormChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-sm"
                          >
                            <option value="">Select Designation</option>
                            {associateDesignations.map((des) => (
                              <option key={des} value={des}>
                                {des}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <select
                            name="associateId"
                            value={associateForm.associateId}
                            onChange={handleAssociateFormChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-sm"
                          >
                            <option value="">Select Associate</option>
                            {associates.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <input
                            type="number"
                            name="otherInfo"
                            value={associateForm.otherInfo}
                            onChange={handleAssociateFormChange}
                            placeholder="Other Information"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-700 text-sm"
                          />
                        </div>
                        <div className="col-span-3 flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={addAssociate}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            disabled={
                              !associateForm.designation ||
                              !associateForm.associateId
                            }
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAssociateForm(false)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {formData.involvedAssociates.length > 0 && (
                      <div className="space-y-2">
                        {formData.involvedAssociates.map((a: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                          >
                            <div>
                              <span className="font-thin text-sm">
                                {a.designation}
                              </span>{" "}
                              <span className="text-gray-700 text-sm">
                                {a.associateName}
                              </span>
                              {a.otherInfo && (
                                <span className="text-gray-500 ml-2 text-xs">
                                  ({a.otherInfo})
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAssociate(idx)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setShowAssociateForm(true)}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs mt-1"
                        >
                          + Tag Another Associate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Upload Files */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {!isEditMode && creationMode === 'multiple' && Array.isArray(formData.workType) && formData.workType.length > 0 ? (
                  // Multi-worktype mode: show upload per worktype
                  <div className="space-y-6">
                    {/* COMMON FILES SECTION */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3">
                        Common Documents (Applied to all selected work types)
                      </h4>
                      <div>
                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center bg-white">
                          <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-xs text-blue-600 mb-2">
                            Upload common documents for all leads
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.xls,.xlsx"
                            onChange={(e) => handleFileUpload(e, 'COMMON')}
                            className="hidden"
                            id="file-upload-common"
                          />
                          <label
                            htmlFor="file-upload-common"
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                          >
                            Choose Common Files
                          </label>
                        </div>

                        {multiWorktypeState.step2.documents['COMMON'] &&
                          multiWorktypeState.step2.documents['COMMON'].length > 0 && (
                            <div className="mt-3 space-y-2">
                              {multiWorktypeState.step2.documents['COMMON'].map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col p-2 bg-white border border-blue-100 rounded text-xs"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="truncate font-medium">{item.file.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMultiWorktypeState((prev) => ({
                                          ...prev,
                                          step2: {
                                            documents: {
                                              ...prev.step2.documents,
                                              'COMMON': prev.step2.documents['COMMON'].filter(
                                                (_, i) => i !== idx
                                              ),
                                            },
                                          },
                                        }));
                                      }}
                                      className="text-red-600 hover:text-red-800 ml-2"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Add note for this file..."
                                    value={item.note || ""}
                                    onChange={(e) => handleFileNoteChange(idx, e.target.value, 'COMMON')}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Worktype specific files */}
                    {formData.workType.map((worktype: string) => (
                      <div key={worktype} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Documents for: {worktype}
                        </h4>
                        <div>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-600 mb-2">
                              Upload documents for {worktype}
                            </p>
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.xls,.xlsx"
                              onChange={(e) => handleFileUpload(e, worktype)}
                              className="hidden"
                              id={`file-upload-${worktype}`}
                            />
                            <label
                              htmlFor={`file-upload-${worktype}`}
                              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            >
                              Choose Files
                            </label>
                          </div>

                          {multiWorktypeState.step2.documents[worktype] &&
                            multiWorktypeState.step2.documents[worktype].length > 0 && (
                              <div className="mt-3 space-y-2">
                                {multiWorktypeState.step2.documents[worktype].map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col p-2 bg-gray-50 rounded text-xs"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="truncate font-medium">{item.file.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMultiWorktypeState((prev) => ({
                                            ...prev,
                                            step2: {
                                              documents: {
                                                ...prev.step2.documents,
                                                [worktype]: prev.step2.documents[worktype].filter(
                                                  (_, i) => i !== idx
                                                ),
                                              },
                                            },
                                          }));
                                        }}
                                        className="text-red-600 hover:text-red-800 ml-2"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Add note for this file..."
                                      value={item.note || ""}
                                      onChange={(e) => handleFileNoteChange(idx, e.target.value, worktype)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Edit mode or single worktype: original layout
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Supporting Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload RFQ documents, technical drawings, site photos,
                        etc.
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Supported formats: PDF, DOC, DOCX, JPG, PNG, DWG, XLS, XLSX (Max 10MB
                        per file)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.xls,.xlsx"
                        onChange={(e) => handleFileUpload(e)}
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

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Uploaded Files
                        </h4>
                        <div className="space-y-3">
                          {uploadedFiles.map((item, index) => (
                            <div
                              key={index}
                              className="p-3 bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
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
                              <input
                                type="text"
                                placeholder="Add note for this file..."
                                value={item.note || ""}
                                onChange={(e) => handleFileNoteChange(index, e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Follow-up Leads - COMMENTED OUT */}
            {/* {currentStep === 3 && (
              <div className="space-y-6">
                {!isEditMode && creationMode === 'multiple' && Array.isArray(formData.workType) && formData.workType.length > 0 ? (
                  // Multi-worktype mode: show fields per worktype
                  formData.workType.map((worktype: string) => (
                    <div key={worktype} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Follow-up for: {worktype}
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assign to
                        </label>
                        <select
                          value={multiWorktypeState.step3.assignedTo[worktype] || ""}
                          onChange={(e) => {
                            setMultiWorktypeState((prev) => ({
                              ...prev,
                              step3: {
                                ...prev.step3,
                                assignedTo: {
                                  ...prev.step3.assignedTo,
                                  [worktype]: e.target.value,
                                },
                              },
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="">Select User</option>
                          {usersWithLeadAccess.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </div>



                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Follow-up Notes
                        </label>
                        <textarea
                          value={multiWorktypeState.step3.comments[worktype] || ""}
                          onChange={(e) => {
                            setMultiWorktypeState((prev) => ({
                              ...prev,
                              step3: {
                                ...prev.step3,
                                comments: {
                                  ...prev.step3.comments,
                                  [worktype]: e.target.value,
                                },
                              },
                            }));
                          }}
                          rows={2}
                          placeholder={`Enter follow-up notes for ${worktype}...`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        {multiWorktypeState.step3.comments[worktype] && (
                          <p className="text-xs text-gray-500 mt-1">
                            {multiWorktypeState.step3.comments[worktype].length}/500 characters
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  // Edit mode or single worktype: original layout
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign to
                      </label>
                      <select
                        value={formData.assignedTo || ""}
                        onChange={(e) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            assignedTo: e.target.value,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select User</option>
                        {usersWithLeadAccess.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>



                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Follow-up Comment
                      </label>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => {
                              setNewComment(e.target.value);
                              // Clear validation error when user starts typing
                              if (validationErrors.newComment) {
                                setValidationErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.newComment;
                                  return newErrors;
                                });
                              }
                            }}
                            rows={3}
                            placeholder="Enter follow-up notes, meeting details, customer feedback..."
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.newComment
                              ? "border-red-500"
                              : "border-gray-300"
                              }`}
                          />
                          <ValidationError fieldName="newComment" />
                          {newComment && (
                            <p className="text-xs text-gray-500 mt-1">
                              {newComment.length}/500 characters
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleCommentSubmit}
                          disabled={
                            !newComment.trim() ||
                            isLoading ||
                            !!validationErrors.newComment
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {formData.followUpComments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Communication History
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {formData.followUpComments.map((comment: any) => (
                            <div
                              key={comment.id}
                              className="p-3 bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {comment.author}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.timestamp).toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {comment.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )} */}
          </form>
        </div>

        {/* Footer with navigation buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowCancelAlert(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>

            {isEditMode ? (
              currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      if (uploadedFiles.length > 0) {
                        const leadId = createdLeadId || initialData?.id;
                        await uploadFilesForLead(leadId, uploadedFiles);
                        await updateLeadStageAfterFileUpload(leadId);
                      }
                      handleSubmit({ preventDefault: () => { } } as any);
                    } catch (err) {
                      console.error(err);
                      showToast("Error updating lead files");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Updating..." : "Update Complete"}
                </button>
              )
            ) : (
              <>
                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Saving..." : "Next"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <>
                    {creationMode === 'multiple' && Array.isArray(formData.workType) && formData.workType.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleCompleteRegistration}
                        disabled={isLoading || !checkStep1Validity()}
                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${isLoading || !checkStep1Validity() ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
                      >
                        {isLoading ? "Processing..." : "Complete Registration"}
                        <Save className="h-4 w-4 ml-2" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={!isEditMode && creationMode === 'single' ? handleUnifiedLeadCreation : handleSubmit}
                        disabled={(creationMode === 'single' && !isEditMode) ? (isLoading || !checkStep1Validity()) : isLoading}
                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${((creationMode === 'single' && !isEditMode && !checkStep1Validity()) || isLoading) ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {creationMode === 'single' && !isEditMode ? "Create Unified Lead" : "Complete"}
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Cancellation Alert */}
        {showCancelAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Cancellation
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your unsaved data will be lost. Do you want to cancel?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelAlert(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  No, Continue
                </button>
                <button
                  onClick={() => {
                    setShowCancelAlert(false);
                    handleClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddLeadModal;
