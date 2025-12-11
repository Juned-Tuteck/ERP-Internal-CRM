import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Upload,
  MessageSquare,
  Trash2,
  Currency,
  UserCheck
} from "lucide-react";
import axios from "axios";

import useNotifications from '../../../hook/useNotifications';
import { useCRM } from '../../../context/CRMContext';
import { updateCustomer } from '../../../utils/customerApi';
import { CustomLoader} from '../../../components/CustomLoader';
import { create } from "domain";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: any) => void;
  initialData?: any;
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
  //------------------------------------------------------------------------------------
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(
    initialData || {
      // Step 1: General Information
      businessName: "",
      avatar: "",
      customerBranch: "",
      currency: "",
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
      approximateResponseTime: "",
      eta: "",
      leadDetails: "",
      involvedAssociates: [],
      // Step 2: Upload Files
      uploadedFiles: [],
      // Step 3: Follow-up
      followUpComments: [],
      assignedTo: "",
      nextFollowUpDate: "",
    }
  );

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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
    step2: { documents: { [worktype: string]: File[] } };
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

  const [showWorkTypeDropdown, setShowWorkTypeDropdown] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

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
    Array<{ id: string; name: string, phone: number }>
  >([]);
  const [users, setUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [usersWithLeadAccess, setUsersWithLeadAccess] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [showCustomLeadSource, setShowCustomLeadSource] = useState(false);
  const [customLeadSource, setCustomLeadSource] = useState("");

  const steps = [
    { id: 1, name: "General Information", description: "Basic lead details" },
    { id: 2, name: "Upload Files", description: "Supporting documents" },
    { id: 3, name: "Follow-up Leads", description: "Communication log" },
  ];

  const leadTypes = ["Government", "Private", "Semi-Government"];
  const workTypes = [
    "HVAC", "Ventilation", "Fire", "MGPS", "Electrical", "CCTV", "Plumbing MEP", "Interior", "Civil"
  ];
  const leadCriticalities = ["Critical", "Normal"];
  const leadSources = [
    "Lead source",
    "Others"
  ];
  const leadStages = [
    "Information Stage",
    "Enquiry",
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

  // Replace this with your actual registered associates source
  const registeredAssociates = [
    { id: "1", name: "Architect A" },
    { id: "2", name: "Consultant B" },
    { id: "3", name: "Engineer C" },
    { id: "4", name: "Designer D" },
  ];

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ""));
  };

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
    ];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension);
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

      // if (!formData.contactPerson?.trim()) {
      //   errors.contactPerson = "Contact Person is required";
      // }

      if (!formData.contactNo?.trim()) {
        errors.contactNo = "Contact Number is required";
      } else if (!validatePhoneNumber(formData.contactNo)) {
        errors.contactNo =
          "Please enter a valid phone number (e.g., +91 9876543210)";
      }

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

      if (!formData.approximateResponseTime?.toString().trim()) {
        errors.approximateResponseTime =
          "Approximate Response Time is required";
      } else if (
        !validateResponseTime(formData.approximateResponseTime.toString())
      ) {
        errors.approximateResponseTime =
          "Please enter a valid number of days (1-365)";
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
    if (currentStep === 3) {
      if (newComment && !validateStringLength(newComment.trim(), 0, 500)) {
        errors.newComment = "Comment must not exceed 500 characters";
      }
    }

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

      case "contactPerson":
      // return !value?.trim() ? "Contact Person is required" : "";

      case "contactNo":
        if (!value?.trim()) return "Contact Number is required";
        if (!validatePhoneNumber(value))
          return "Please enter a valid phone number";
        return "";

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

      case "approximateResponseTime":
        if (!value?.toString().trim())
          return "Approximate Response Time is required";
        if (!validateResponseTime(value.toString()))
          return "Please enter a valid number of days (1-365)";
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
    approximateResponseTime: "",
    eta: "",
    leadDetails: "",
    involvedAssociates: [],
    uploadedFiles: [],
    followUpComments: [],
    assignedTo: "",
    nextFollowUpDate: "",
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

        // Normalize next_follow_up_date
        let normalizedNextFollowUpDate = "";
        if (initialData.next_follow_up_date || initialData.nextFollowUpDate) {
          const nextFollowUpDateObj = new Date(initialData.next_follow_up_date || initialData.nextFollowUpDate);
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
          contactPerson: initialData.contactPerson || initialData.contact_person || "",
          contactNo: initialData.contactNo || initialData.contact_no || "",
          leadGeneratedDate: normalizedDate,
          referencedBy: initialData.referencedBy || initialData.referenced_by || "",
          projectName: initialData.projectName || initialData.project_name || "",
          projectValue:
            initialData.projectValue !== undefined && initialData.projectValue !== null
              ? String(initialData.projectValue).replace(/[^\d.]/g, "")
              : "",
          leadType: initialData.leadType || initialData.lead_type || "",
          workType: initialData.workType || initialData.work_type || "",
          leadCriticality: initialData.leadCriticality || initialData.lead_criticality || "",
          leadSource: initialData.leadSource || initialData.lead_source || "",
          leadStage: initialData.leadStage || initialData.lead_stage || "New Lead",
          leadStagnation: initialData.leadStagnation || initialData.lead_stagnation || "",
          approximateResponseTime: initialData.approximateResponseTime || initialData.approximate_response_time_day || "",
          eta: normalizedEta,
          leadDetails: initialData.leadDetails || initialData.lead_details || "",
          involvedAssociates: initialData.involvedAssociates || initialData.lead_associates || [],
          uploadedFiles: initialData.uploadedFiles || [],
          followUpComments: initialData.followUpComments || [],
          assignedTo: initialData.assignedTo || initialData.assigned_to || "",
          nextFollowUpDate: normalizedNextFollowUpDate,
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
        setUploadedFiles(initialData.uploadedFiles || []);

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
              contacts: customer.contacts || [],
            }));
            
            const approvedCustomers = customerData.filter(
              (customer: any) => customer.approval_status === "APPROVED"
            );
            
            setCustomers(approvedCustomers);
            const selectedCustomer = approvedCustomers.find(
              (customer: any) => customer.name === initialData.businessName
            );

            
            if (selectedCustomer) {
              // use local ids to snapshot accurately
              const localCustomerId = selectedCustomer.id;
              setSelectedCustomerId(localCustomerId);
              // update snapshot
              initialFormRef.current.customer_id = localCustomerId;

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
        `${import.meta.env.VITE_AUTH_BASE_URL}/users/access-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const usersData = response.data.data;

      // Filter users who have hasMenuAccess for "Lead"
      const usersWithLeadMenu = usersData.filter((user: any) => {
        if (!user.accesses || !Array.isArray(user.accesses)) {
          return false;
        }
        // Check if user has MENU level access to "Lead" within CRM module
        return user.accesses.some((access: any) =>
          access.level_type === "MENU" &&
          access.name.toLowerCase().includes("lead") &&
          access.access_type === "READ" &&
          (access.parent_name === "CRM" || access.grandparent_name === "CRM")
        );
      });

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

  const fallbackCustomer = customers.find(c => c.id === selectedCustomerId);

  const currenciesToShow = selectedBranchId ? customerBranches.map(b => b.currency) : fallbackCustomer?.currency ?? [];

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
        projectName:  value,
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

    // Handle contact person selection
    if (name === "contactPerson") {
      const selectedContact = contactPersons.find(
        (contact) => contact.name === value
      );
      if (selectedContact) {
        
        setSelectedContactId(selectedContact.id);
        setFormData((prev: any) => ({
          ...prev,
          contactNo: selectedContact.phone,
        }));
      }
    }

    // Handle lead source selection
    if (name === "leadSource") {
      if (value === "Others") {
        setShowCustomLeadSource(true);
        setFormData((prev) => ({
          ...prev,
          leadSource: "",
        }));
      } else {
        setShowCustomLeadSource(false);
        setCustomLeadSource("");
        setFormData((prev) => ({
          ...prev,
          leadSource: value,
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Perform real-time validation for critical fields
    if (
      name === "contactNo" ||
      name === "projectValue" ||
      name === "approximateResponseTime" ||
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
          `${file.name}: Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG, DWG`
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
        // Edit mode or single worktype: use existing state
        setUploadedFiles((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const uploadFilesForLead = async (
    leadId: string,
    files: File[],
    onProgress?: (percent: number) => void
  ) => {
    if (!leadId || files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
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
      contact_person: selectedContactId || null,
      contact_no: formData.contactNo || "",
      lead_date_generated_on: formData.leadGeneratedDate || "",
      referenced_by: formData.referencedBy || null,
      project_name: formData.projectName || "",
      project_value: parseFloat(String(formData.projectValue || "0")) || 0,
      lead_type: formData.leadType || "",
      work_type: formData.workType || null,
      lead_criticality: formData.leadCriticality || "",
      lead_source: formData.leadSource || "",
      lead_stage: formData.leadStage || "",
      approximate_response_time_day:
        parseInt(String(formData.approximateResponseTime || "0")) || 0,
      eta: formData.eta || null,
      lead_details: formData.leadDetails || null,
      assigned_to: formData.assignedTo || null,
      next_follow_up_date: formData.nextFollowUpDate || null,
    };
  };

  // REPLACE existing handleUpdateLead with this diffing version
  const handleUpdateLead = async () => {
    setIsLoading(true);
    try {
      if (!initialData || !initialData.id) {
        alert("No lead ID found for update.");
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
          contact_person: initialFormRef.current.contact_person_id || null,
          contact_no: initialFormRef.current.contactNo || "",
          lead_date_generated_on: initialFormRef.current.leadGeneratedDate || "",
          referenced_by: initialFormRef.current.referencedBy || null,
          project_name: initialFormRef.current.projectName || "",
          project_value: parseFloat(String(initialFormRef.current.projectValue || "0")) || 0,
          lead_type: initialFormRef.current.leadType || "",
          work_type: initialFormRef.current.workType || null,
          lead_criticality: initialFormRef.current.leadCriticality || "",
          lead_source: initialFormRef.current.leadSource || "",
          lead_stage: initialFormRef.current.leadStage || "",
          approximate_response_time_day:
            parseInt(String(initialFormRef.current.approximateResponseTime || "0")) || 0,
          eta: initialFormRef.current.eta || null,
          lead_details: initialFormRef.current.leadDetails || null,
          assigned_to: initialFormRef.current.assignedTo || null,
          next_follow_up_date: initialFormRef.current.nextFollowUpDate || null,
        }
        : {
          // best-effort fallback from initialData prop
          business_name: initialData.business_name || initialData.businessName || "",
          customer_id: initialData.customer_id || null,
          customer_branch_id: initialData.customer_branch_id || initialData.customer_branch || null,
          contact_person: initialData.contact_person || null,
          contact_no: initialData.contact_no || "",
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
          next_follow_up_date: initialData.next_follow_up_date || initialData.nextFollowUpDate || null,
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
        alert("No changes detected to update.");
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
      alert("Failed to update lead. Please try again.");
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
        // CREATE mode: Just validate and move to step 2 (save to state only)
        if (!Array.isArray(formData.workType) || formData.workType.length === 0) {
          alert("Please select at least one work type.");
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
        // CREATE mode: Just move to step 3 (documents already in state)
        setCurrentStep(3);
      }
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Complete Registration for multi-worktype CREATE mode (called from Step 3)
  const handleCompleteRegistration = async () => {
    setIsLoading(true);

    console.log("form data for lead :", formData);
    
    try {
      const selectedWorktypes = (Array.isArray(formData.workType) ? formData.workType : []) as string[];

      if (selectedWorktypes.length === 0) {
        alert("No work types selected.");
        setIsLoading(false);
        return;
      }
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
            contact_person: selectedContactId || null,
            contact_no: formData.contactNo,
            lead_date_generated_on: formData.leadGeneratedDate,
            referenced_by: formData.referencedBy || null,
            project_name: formData.projectName,
            project_value: parseFloat(formData.projectValue) || 0,
            lead_type: formData.leadType,
            work_type: worktype,
            lead_criticality: formData.leadCriticality,
            lead_source: formData.leadSource,
            lead_stage: formData.leadStage,
            approximate_response_time_day: parseInt(formData.approximateResponseTime) || 0,
            eta: formData.eta || null,
            lead_details: formData.leadDetails || null,
            currency: formData.currency || null,
            created_by: userData?.id || null,
            assigned_to: multiWorktypeState.step3.assignedTo[worktype] || null,
            next_follow_up_date: multiWorktypeState.step3.nextFollowUpDate[worktype] || null,
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
          const documents = multiWorktypeState.step2.documents[worktype] || [];
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

      alert(message);

      // Close modal and refresh
      onSubmit({ success: true });
      handleClose();
    } catch (error) {
      console.error("Error in complete registration:", error);
      alert("An unexpected error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create lead API call
  const handleCreateLead = async () => {
    setIsLoading(true);
    try {
      // Map UI fields to backend keys
      const leadPayload = {
        business_name: formData.businessName,
        customer_id: selectedCustomerId || null,
        customer_branch_id: selectedBranchId || null,
        contact_person: selectedContactId || null,
        contact_no: formData.contactNo,
        lead_date_generated_on: formData.leadGeneratedDate,
        referenced_by: formData.referencedBy || null,
        project_name: formData.projectName,
        project_value: parseFloat(formData.projectValue) || 0,
        lead_type: formData.leadType,
        work_type: Array.isArray(formData.workType) ? formData.workType[0] : formData.workType || null,
        lead_criticality: formData.leadCriticality,
        lead_source: formData.leadSource,
        lead_stage: formData.leadStage,
        approximate_response_time_day:
          parseInt(formData.approximateResponseTime) || 0,
        eta: formData.eta || null,
        lead_details: formData.leadDetails || null,
        currency: formData.currency || null,
        created_by: userData?.id || null,
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
      alert("Failed to create lead. Please try again.");
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
      alert("Failed to add comment. Please try again.");
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
      approximateResponseTime: "",
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
      registeredAssociates.find((a) => a.id === associateForm.associateId)
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
    return <CustomLoader message="Creating Lead..."/>
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
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
                  onClick={() => {
                    if (isEditMode) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`flex items-center space-x-2 ${currentStep === step.id
                    ? "text-blue-600"
                    : currentStep > step.id
                      ? "text-green-600"
                      : "text-gray-400"
                    } ${isEditMode ? "cursor-pointer hover:text-blue-700" : ""}`}
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
            {currentStep === 1 && (
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
                            className={`w-full px-3 py-2 border rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[42px] flex items-center ${
                              validationErrors.workType ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            {formData.workType.length > 0 ? (
                              <span className="text-gray-900">{formData.workType.join(", ")}</span>
                            ) : (
                              <span className="text-gray-400">Select Work types</span>
                            )}
                        </div>
                        {showWorkTypeDropdown &&(
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
                      Approximate Response Time (Days) *
                    </label>
                    <input
                      type="number"
                      name="approximateResponseTime"
                      value={formData.approximateResponseTime}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter days"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.approximateResponseTime
                        ? "border-red-500"
                        : "border-gray-300"
                        }`}
                    />
                    <ValidationError fieldName="approximateResponseTime" />
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
            )}

            {/* Step 2: Upload Files */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {!isEditMode && Array.isArray(formData.workType) && formData.workType.length > 0 ? (
                  // Multi-worktype mode: show upload per worktype
                  formData.workType.map((worktype: string) => (
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
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg"
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
                            <div className="mt-3 space-y-1">
                              {multiWorktypeState.step2.documents[worktype].map((file, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                                >
                                  <span className="truncate">{file.name}</span>
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
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  ))
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
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg"
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
              </div>
            )}

            {/* Step 3: Follow-up Leads */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {!isEditMode && Array.isArray(formData.workType) && formData.workType.length > 0 ? (
                  // Multi-worktype mode: show fields per worktype
                  formData.workType.map((worktype: string) => (
                    <div key={worktype} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Follow-up for: {worktype}
                      </h4>

                      {/* Assign to Dropdown */}
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

                      {/* Next Follow Up Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Next Follow Up Date
                        </label>
                        <input
                          type="date"
                          value={multiWorktypeState.step3.nextFollowUpDate[worktype] || ""}
                          onChange={(e) => {
                            setMultiWorktypeState((prev) => ({
                              ...prev,
                              step3: {
                                ...prev.step3,
                                nextFollowUpDate: {
                                  ...prev.step3.nextFollowUpDate,
                                  [worktype]: e.target.value,
                                },
                              },
                            }));
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>

                      {/* Follow-up Comments */}
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
                    {/* Assign to Dropdown */}
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

                    {/* Next Follow Up Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Follow Up Date
                      </label>
                      <input
                        type="date"
                        value={formData.nextFollowUpDate || ""}
                        onChange={(e) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            nextFollowUpDate: e.target.value,
                          }));
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
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
            )}
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
                  {isLoading ? "Saving..." : "Next"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Uploading..." : "Next"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Complete
                </button>
              )
            ) : (
              <>
                {currentStep < 3 ? (
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
                    {Array.isArray(formData.workType) && formData.workType.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleCompleteRegistration}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                      >
                        {isLoading ? "Processing..." : "Complete Registration"}
                        <Save className="h-4 w-4 ml-2" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Complete
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
