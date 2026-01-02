import React, { useState } from "react";
import { useEffect } from "react";
import {
  Building,
  Globe,
  Star,
  TrendingUp,
  UserCheck,
  Calendar,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  GitPullRequestArrow,
  Link,
  Image,
  FileSpreadsheet,
  File,
  Download,
  SquarePen,
  User,
  FileBarChart,
  PauseCircle
} from "lucide-react";
import AddLeadModal from "./AddLeadModal";
import axios from "axios";
import { useCRM } from "../../../context/CRMContext";
import { useToast } from '../../../components/Toast';
// import { createProjectFromLead, CreateProjectRequest } from "../../../utils/projectApi";
import { zoneApi, stateApi, districtApi } from '../../../utils/leadZoneStateDistrictApi';

interface LeadDetailsProps {
  lead: any;
  onConvert: (leadId: string) => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onConvert }) => {
  const [leadDetails, setLeadDetails] = useState<any>(null);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showWinLossModal, setShowWinLossModal] = useState(false);
  const [winLossReason, setWinLossReason] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState<"Won" | "Lost" | "Hold">("Won");

  const [statusModalTab, setStatusModalTab] = useState<'closure' | 'other'>('closure');
  const [winLossRemark, setWinLossRemark] = useState("");
  const showHistoryModalHook = useState(false);
  const [showHistoryModal, setShowHistoryModal] = showHistoryModalHook;

  const winLossReasons = [
    "Price/Commercials",
    "Technical Incompatibility",
    "Competitor",
    "Delivery Timeline",
    "Service/Support",
    "Budget Constraints",
    "Other"
  ];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isGeneratingQuotation, setIsGeneratingQuotation] = useState(false);
  const [showGenerateQuotationModal, setShowGenerateQuotationModal] = useState(false);
  const { hasActionAccess, userData } = useCRM();

  // Add state for edit modal
  const [showEditModal, setShowEditModal] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'basic' | 'followup' | 'assign'>('basic');

  // Assign To state
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [usersWithLeadAccess, setUsersWithLeadAccess] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Follow-up comment state
  const [newComment, setNewComment] = useState('');
  const [followUpComments, setFollowUpComments] = useState<any[]>([]);
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Design Help state
  const [showDesignHelpModal, setShowDesignHelpModal] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSendingHelp, setIsSendingHelp] = useState(false);
  const [designHelpSent, setDesignHelpSent] = useState(false);
  const [targetRole, setTargetRole] = useState<'design head' | 'design engineer'>('design engineer');
  const [designHelpStatus, setDesignHelpStatus] = useState<{
    sentToDesignHead: boolean;
    sentToDesignEngineer: boolean;
    lastRole: string | null;
  }>({ sentToDesignHead: false, sentToDesignEngineer: false, lastRole: null });

  // Lead competitors state
  const [leadCompetitors, setLeadCompetitors] = useState<any[]>([]);

  // Location Data State
  const [zones, setZones] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  // Fetch detailed lead information when lead is selected

  useEffect(() => {
    const fetchLeadDetails = async () => {
      if (!lead?.id) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/lead/${lead.id}`
        );
        const apiLead = response.data.data;

        let branchName = null;
        let branchCurrency = apiLead.currency || "INR";

        // Fetch customer branch details if customer_branch exists
        if (apiLead.customer_branch_id) {
          try {
            const branchRes = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/customer-branch/${apiLead.customer_branch_id
              }`
            );
            const branchData = branchRes.data?.data;
            branchName = branchData?.branch_name || null;
            branchCurrency = branchData?.currency || "INR";
          } catch (err) {
            // fallback to null if branch fetch fails
            branchName = null;
            branchCurrency = apiLead.currency || "INR";
          }
        }

        // Map API response to UI format
        const mappedLead = {
          id: apiLead.lead_id?.toString() || lead.id,
          businessName: apiLead.business_name || lead.businessName,
          avatar: lead.avatar || "LD",
          customerBranch: apiLead.customer_branch || null,
          branch_name: branchName, // <-- set branch_name for UI
          currency: branchCurrency,
          contactPerson: lead.contactPersonName,
          contactNo: apiLead.contact_no || lead.contactNo,
          phone: apiLead.contact_no || lead.contactNo, // For compatibility
          leadGeneratedDate:
            apiLead.lead_date_generated_on || lead.leadGeneratedDate,
          referencedBy: apiLead.referenced_by || null,
          projectName: apiLead.project_name || lead.projectName,
          projectValue: `₹${(apiLead.project_value || 0).toLocaleString(
            "en-IN"
          )}`,
          leadType: apiLead.lead_type || lead.leadType,
          workType: apiLead.work_type || null,
          leadCriticality: apiLead.lead_criticality || lead.leadCriticality,
          leadSource: apiLead.lead_source || lead.leadSource,
          leadStage: apiLead.lead_stage || lead.leadStage,
          approximateResponseTime:
            apiLead.approximate_response_time_day?.toString() || "0",
          eta: apiLead.eta || null,
          leadDetails: apiLead.lead_details || null,
          approvalStatus: apiLead.approval_status?.toLowerCase() || "pending",
          submittedDate: apiLead.created_at || lead.leadGeneratedDate,
          involvedAssociates: lead.involvedAssociates || [],
          uploadedFiles: apiLead.files || [],
          followUpComments: lead.followUpComments || [],
          leadNumber: apiLead.lead_number || lead.leadNumber,
          customerNumber: apiLead.customer_number || lead.customerNumber,
          created_by_name: apiLead.created_by_name || null,
          temp_quotation_number: apiLead.temp_quotation_number || lead.temp_quotation_number || null,
          assignedTo: apiLead.assigned_user_id || null,
          nextFollowUpDate: apiLead.next_followup_date || null,
          assigned_user_name: apiLead.assigned_user_name || null,
          // New fields for edit mode
          leadTemperature: apiLead.lead_temperature || null,
          ownProbability: apiLead.own_probability || null,
          projectState: apiLead.project_state || null,
          projectDistrict: apiLead.project_district || null,
          projectCity: apiLead.project_city || null,
          projectPincode: apiLead.project_pincode || null,
          projectStreet: apiLead.project_street || null,
          projectLocation: apiLead.project_location || null,
          projectZone: apiLead.project_zone || null,
          projectCurrentStatus: apiLead.project_current_status || null,
          // Contact persons
          contactPersons: apiLead.contact || [],
          // IDs for edit mode
          customer_id: apiLead.customer_id || null,
          customer_branch_id: apiLead.customer_branch_id || null,
        };

        setLeadDetails(mappedLead);

        // Fetch follow-up comments
        fetchFollowUpComments(lead.id);

        // Fetch lead competitors
        try {
          const competitorsResponse = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/lead-competitor?lead_id=${lead.id}`
          );
          setLeadCompetitors(competitorsResponse.data.data || []);
        } catch (competitorError) {
          console.error("Error fetching lead competitors:", competitorError);
          setLeadCompetitors([]);
        }

        // Check if design help was sent
        checkDesignHelpStatus(lead.id);
      } catch (error) {
        console.error("Error fetching lead details:", error);
        // Fallback to the lead data passed as prop
        setLeadDetails(lead);
      } finally {
        setLoading(false);
      }
    };

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

    fetchLocationData();
    fetchLeadDetails();
  }, [lead, refreshTrigger]);

  // Check if design help was sent for this lead
  const checkDesignHelpStatus = async (leadId: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/design-help?lead_id=${leadId}`
      );
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const designHelpRecords = response.data.data;

        // Check what roles were sent to
        const sentToDesignHead = designHelpRecords.some((record: any) => record.role === 'design head');
        const sentToDesignEngineer = designHelpRecords.some((record: any) => record.role === 'design engineer');
        const lastRecord = designHelpRecords[designHelpRecords.length - 1];

        console.log("sentToDesignHead", sentToDesignHead);
        console.log("sentToDesignEngineer", sentToDesignEngineer);
        console.log("lastRecord", lastRecord);

        setDesignHelpStatus({
          sentToDesignHead,
          sentToDesignEngineer,
          lastRole: lastRecord.role || null
        });
        setDesignHelpSent(true);
      } else {
        setDesignHelpStatus({ sentToDesignHead: false, sentToDesignEngineer: false, lastRole: null });
        setDesignHelpSent(false);
      }
    } catch (error) {
      console.error('Error checking design help status:', error);
      setDesignHelpStatus({ sentToDesignHead: false, sentToDesignEngineer: false, lastRole: null });
      setDesignHelpSent(false);
    }
  };

  // Fetch follow-up comments
  const fetchFollowUpComments = async (leadId: string) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/lead-follow-up?lead_id=${leadId}`
      );
      const comments = response.data.data || [];
      setFollowUpComments(comments);
    } catch (error) {
      console.error('Error fetching follow-up comments:', error);
      setFollowUpComments([]);
    }
  };

  // Add follow-up comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !displayLead?.id) return;

    setIsAddingComment(true);
    try {
      const commentPayload = {
        lead_id: displayLead.id,
        comment: newComment.trim(),
        created_by: userData?.id
      };

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/lead-follow-up`,
        commentPayload
      );

      // Refresh comments list
      await fetchFollowUpComments(displayLead.id);
      setNewComment('');
      showToast('Comment added successfully By ' + userData?.name, 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Failed to add comment. Please try again.', 'error');
    } finally {
      setIsAddingComment(false);
    }
  };

  // Fetch eligible users based on role and zone
  const fetchEligibleUsers = async (role: string, leadZone: string | null) => {
    setIsLoadingUsers(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_AUTH_BASE_URL}/users/basic`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        }
      );

      if (response.data.success && response.data.data) {
        const filtered = response.data.data.filter((user: any) => {
          // Check if user has the required role
          const hasRole = user.role === role || (user.roles && user.roles.includes(role));

          // Check if user is in the same zone (if leadZone is specified)
          const inSameZone = !leadZone || user.zone === leadZone;

          return hasRole && inSameZone;
        });
        setEligibleUsers(filtered);
      }
    } catch (error) {
      console.error('Error fetching eligible users:', error);
      showToast('Failed to load users. Please try again.', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch users with Lead menu access for Assign to dropdown
  const fetchUsersWithLeadAccess = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_AUTH_BASE_URL}/users/by-access-path?module=CRM&menu=Lead`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
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

  // Load users when Assign tab is active
  useEffect(() => {
    if (activeTab === 'assign') {
      fetchUsersWithLeadAccess();
      // Initialize selected assignee from current lead
      const currentLead = leadDetails || lead;
      if (currentLead?.assignedTo) {
        setSelectedAssignee(currentLead.assignedTo);
      }
    }
  }, [activeTab, leadDetails, lead]);

  // Handle design help modal open
  const handleDesignHelpModalOpen = () => {
    // Determine target role based on current user's role and relation to the lead
    let role: 'design head' | 'design engineer' = 'design engineer';

    // If current user is the assigned user, they should send to design head
    if (userData?.id === displayLead.assignedTo) {
      role = 'design head';
    }
    // If current user is a design head, they should forward to design engineer
    else if (userData?.role === 'design head' || (userData?.roles && userData.roles.includes('design head'))) {
      role = 'design engineer';
    }

    setTargetRole(role);
    setShowDesignHelpModal(true);
    setSelectedUserId('');

    // Fetch eligible users based on target role and lead's zone
    fetchEligibleUsers(role, displayLead.projectZone);
  };

  // Send design help request
  const handleSendDesignHelp = async () => {
    if (!selectedUserId || !displayLead?.id || !userData?.id) {
      showToast('Please select a user.', 'error');
      return;
    }

    setIsSendingHelp(true);
    try {
      const payload = {
        lead_id: displayLead.id,
        user_id: selectedUserId,
        role: targetRole,
        created_by: userData.id
      };

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/design-help`,
        payload
      );

      const roleLabel = targetRole === 'design head' ? 'Design Head' : 'Design Engineer';
      showToast(`Successfully sent to ${roleLabel}!`, 'success');
      setDesignHelpSent(true);
      setShowDesignHelpModal(false);
      setSelectedUserId('');

      // Send notification to the assigned user
      try {
        const notificationPayload = {
          sender_id: userData.id,
          receiver_user_id: selectedUserId,
          title: `You have been assigned as ${roleLabel} for design help`,
          message: `Lead: ${displayLead.projectName || 'Untitled'} (${displayLead.leadNumber || 'N/A'})`,
          link: "/leads",
          service_type: 'design_help'
        };

        await axios.post(
          `${import.meta.env.VITE_AUTH_BASE_URL}/notifications/user`,
          notificationPayload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Don't disrupt the main flow - notification is auxiliary
      }

      // Refresh design help status
      checkDesignHelpStatus(displayLead.id);
    } catch (error) {
      console.error('Error sending design help request:', error);
      showToast('Failed to send design help request. Please try again.', 'error');
    } finally {
      setIsSendingHelp(false);
    }
  };

  const handleAssignUser = async () => {
    const currentLead = leadDetails || lead;
    if (!selectedAssignee) {
      showToast("Please select a user to assign.", "error");
      return;
    }

    if (window.confirm("Are you sure you want to assign this lead to the selected user?")) {
      try {
        setIsSubmitting(true);
        const payload = {
          assigned_user_id: selectedAssignee,
        };

        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/lead/${currentLead.id}`,
          payload
        );

        showToast("Lead assigned successfully!", "success");
        setRefreshTrigger(prev => prev + 1); // Refresh lead details
      } catch (error) {
        console.error("Error assigning lead:", error);
        showToast("Failed to assign lead. Please try again.", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Dummy history data for modal
  const historyData = [
    {
      user: "js.qa@tuteck.com",
      type: "UPDATE",
      date: "05-07-2025",
      stage: "LEAD",
    },
    {
      user: "js.qa@tuteck.com",
      type: "UPDATE",
      date: "05-07-2025",
      stage: "LEAD",
    },
    {
      user: "js.qa@tuteck.com",
      type: "UPDATE",
      date: "05-07-2025",
      stage: "LEAD",
    },
    {
      user: "js.qa@tuteck.com",
      type: "UPDATE",
      date: "05-07-2025",
      stage: "LEAD",
    },
    {
      user: "js.qa@tuteck.com",
      type: "UPDATE",
      date: "06-07-2025",
      stage: "LEAD",
    },
    {
      user: "js.qa@tuteck.com",
      type: "UPDATE",
      date: "06-07-2025",
      stage: "LEAD",
    },
    {
      user: "js.qa@tuteck.com",
      type: "UPDATE",
      date: "06-07-2025",
      stage: "LEAD",
    },
    {
      user: "js.qa@tuteck.com",
      type: "UPDATE",
      date: "06-07-2025",
      stage: "LEAD",
    },
    {
      user: "js.qa@tuteck.com",
      type: "UPDATE",
      date: "06-07-2025",
      stage: "LEAD",
    },
  ];

  if (!lead && !leadDetails) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <UserCheck className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a lead</h3>
          <p className="text-sm">
            Choose a lead from the list to view their details
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <UserCheck className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Loading lead details...</h3>
        </div>
      </div>
    );
  }

  // Use detailed lead data if available, otherwise fallback to prop data
  const displayLead = leadDetails || lead;

  function formatBytes(bytes?: string | number | null) {
    if (bytes == null || isNaN(Number(bytes))) return "-";
    const b = Number(bytes);
    if (b === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Information Stage":
        return "bg-gray-100 text-gray-800";
      case "Enquiry":
        return "bg-blue-100 text-blue-800";
      case "Quoted":
        return "bg-purple-100 text-purple-800";
      case "Quotation Submitted":
        return "bg-purple-100 text-purple-800";
      case "Won":
        return "bg-green-100 text-green-800";
      case "Lost":
        return "bg-red-100 text-red-800";
      case "Hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "Urgent & Important":
        return "text-red-600";
      case "Urgent & Non-important":
        return "text-orange-600";
      case "Non Urgent & Important":
        return "text-yellow-600";
      case "Non Urgent & Non Importaint":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleWinLossSubmit = async () => {
    try {
      // Validation Logic
      if (statusModalTab === 'closure') {
        if (!winLossReason) {
          showToast("Reason is mandatory.", "error");
          return;
        }
        if (selectedOutcome === 'Lost' && !winLossRemark.trim()) {
          showToast("Remark is mandatory when status is Lost.", "error");
          return;
        }
      } else {
        // Hold/Other tab
        if (!winLossReason.trim()) {
          showToast("Reason is mandatory.", "error");
          return;
        }
      }

      setIsSubmitting(true);

      const payload: any = {
        reason: winLossReason,
        lead_stage: selectedOutcome,
        remark: winLossRemark
      };

      if (selectedOutcome === "Hold") {
        payload.hold_stage = displayLead.leadStage;
      }

      // Call PUT API to update lead status with lead ID in path params
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/lead/${displayLead.id}`,
        payload
      );

      console.log("Lead status updated successfully:", response.data);

      // If marked as Won, instantly create project via PMS API
      // if (selectedOutcome === "Won") {
      //   try {
      //     const projectData: CreateProjectRequest = {
      //       // Required fields
      //       name: displayLead.projectName || "Untitled Project",
      //       created_by: displayLead.created_by || "00000000-0000-0000-0000-000000000000",

      //       // UUID fields
      //       lead_id: displayLead.id,
      //       warehouse_id: displayLead.warehouse_id || undefined,
      //       project_template_id: displayLead.project_template_id || undefined,
      //       customer_id: displayLead.customer_id || undefined,
      //       location: displayLead.location || undefined,
      //       approved_by: displayLead.approved_by || undefined,
      //       updated_by: displayLead.updated_by || undefined,

      //       // VARCHAR fields
      //       project_species: displayLead.project_species || undefined,
      //       project_type: displayLead.leadType || undefined,
      //       project_status: displayLead.project_status || "IN PROGRESS",
      //       comment_baseline: displayLead.comment_baseline || undefined,
      //       comment_other: winLossReason || "Lead converted to project",
      //       project_number: displayLead.project_number || undefined,
      //       insurance_no: displayLead.insurance_no || undefined,

      //       // DATE fields (ISO date format)
      //       estimated_start: displayLead.estimated_start || undefined,
      //       estimated_end: displayLead.estimated_end || undefined,
      //       actual_start: displayLead.actual_start || undefined,
      //       actual_end: displayLead.actual_end || undefined,
      //       kick_off: displayLead.kick_off || undefined,
      //       insurance_from_date: displayLead.insurance_from_date || undefined,
      //       insurance_to_date: displayLead.insurance_to_date || undefined,

      //       // NUMERIC fields
      //       price_customer: displayLead.projectValue ? parseFloat(displayLead.projectValue.replace(/[₹,]/g, '')) : undefined,
      //       estimated_price: displayLead.estimated_price || undefined,
      //       actual_price: displayLead.actual_price || undefined,

      //       // INTEGER fields
      //       completion: displayLead.completion || 0,

      //       // BOOLEAN fields
      //       is_insured: displayLead.is_insured || false,
      //       is_active: true,
      //       is_deleted: false,

      //       // TEXT fields
      //       project_address: displayLead.project_address || undefined,
      //       approval_comment: displayLead.approval_comment || undefined,

      //       // ENUM and TIMESTAMP fields
      //       approval_status: "PENDING" as const, // Use proper enum value
      //       approved_on: displayLead.approved_on || undefined
      //     };

      //     console.log("Creating project with data:", projectData);

      //     const projectResult = await createProjectFromLead(projectData);

      //     if (projectResult.success) {
      //       console.log("Project created successfully:", projectResult.data);
      //       alert(`Lead marked as Won and Project created successfully!`);

      //       // Also trigger the parent conversion handler
      //       onConvert(displayLead.id);
      //     } else {
      //       console.error("Error creating project:", projectResult.error);
      //       alert(`Lead marked as Won but failed to create project: ${projectResult.error}`);
      //     }
      //   } catch (projectError) {
      //     console.error("Unexpected error during project creation:", projectError);
      //     alert("Lead marked as Won but an unexpected error occurred while creating the project.");
      //   }
      // }

      console.log(`Lead marked as ${selectedOutcome}:`, winLossReason);

      // Close modal and reset form
      setShowWinLossModal(false);
      setWinLossReason("");
      setWinLossRemark("");
      setStatusModalTab('closure');

      // Refresh the lead details to show updated data
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error updating lead status:", error);
      // You might want to show an error message to the user here
      showToast("Failed to update lead status. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate Quotation Number Handler
  const handleGenerateQuotationNumber = async () => {
    if (!displayLead?.id || !displayLead?.leadNumber) {
      showToast('Missing required information to generate quotation number.', "error");
      return;
    }

    setIsGeneratingQuotation(true);
    try {
      const quotationNumber = `QUOT-${displayLead.id.substring(0, 5)}-${displayLead.leadNumber.split("-")[1]}-${Date.now()}`;

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/lead/${displayLead.id}`,
        {
          temp_quotation_number: quotationNumber,
          lead_stage: "Quoted"
        }
      );

      console.log("Quotation number generated successfully:", response.data);

      // Update local state
      setLeadDetails((prev: any) => ({
        ...prev,
        temp_quotation_number: quotationNumber,
        leadStage: "Quoted"
      }));

      showToast(`Quotation number generated: ${quotationNumber}`, "success");

      // Close modal and refresh
      setShowGenerateQuotationModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error generating quotation number:", error);
      showToast("Failed to generate quotation number. Please try again.", "error");
    } finally {
      setIsGeneratingQuotation(false);
    }
  };

  // Helper function to get button style based on design help status
  const getDesignHelpButtonStyle = () => {
    // Determine current state
    let state: 'sent' | 'pending' | 'disabled';

    if (designHelpSent) {
      state = 'sent';
    } else if (
      (userData?.id === displayLead.assignedTo && designHelpStatus.sentToDesignHead) ||
      (userData?.role === 'design head' && designHelpStatus.sentToDesignEngineer) ||
      (userData?.id !== displayLead.assignedTo && userData?.role !== 'design head')
    ) {
      state = 'disabled';
    } else {
      state = 'pending';
    }

    // Return style based on state using switch
    switch (state) {
      case 'sent':
        return 'border-green-600 text-green-600 bg-green-50 opacity-75';
      case 'disabled':
        return 'border-gray-300 text-gray-400 bg-gray-50 opacity-50';
      case 'pending':
      default:
        return 'border-blue-600 text-blue-600 bg-white hover:bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-white">
                {displayLead.avatar}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {displayLead.projectName}
              </h2>
              <div>
                <p className="text-sm text-gray-600">
                  {displayLead.businessName}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm font-bold text-blue-600">
                    Lead : {displayLead.leadNumber || "-"}
                  </p>
                  <p className="text-sm font-bold text-blue-400">
                    Customer : {displayLead.customerNumber || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(
                    displayLead.leadStage
                  )}`}
                >
                  {displayLead.leadStage}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(
                    displayLead.approvalStatus || "pending"
                  )}`}
                >
                  {displayLead.approvalStatus || "pending"}
                </span>
                {/* <div className="flex items-center">
                  <AlertTriangle
                    className={`h-4 w-4 mr-1 ${getCriticalityColor(
                      displayLead.leadCriticality
                    )}`}
                  />
                  <span
                    className={`text-sm font-medium ${getCriticalityColor(
                      displayLead.leadCriticality
                    )}`}
                  >
                    {displayLead.leadCriticality}
                  </span>
                </div> */}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-lg font-bold text-green-600">
              <TrendingUp className="h-5 w-5 mr-1" />
              {displayLead.projectValue}L
            </div>
            <div className="flex space-x-2 mt-2">
              {/* Generate Quotation Number Button */}
              {displayLead.approvalStatus === "approved" &&
                displayLead.leadStage !== "Quoted" &&
                displayLead.leadStage !== "Won" &&
                displayLead.leadStage !== "Lost" &&
                displayLead.leadStage !== "Hold" && (
                  <button
                    onClick={() => setShowGenerateQuotationModal(true)}
                    disabled={isGeneratingQuotation}
                    className="rounded-full p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate Quotation Number"
                  >
                    {isGeneratingQuotation ? (
                      <div className="animate-spin">
                        <FileBarChart className="h-5 w-5" />
                      </div>
                    ) : (
                      <FileBarChart className="h-5 w-5" />
                    )}
                  </button>
                )}
              {/* Update Status: Only visible when lead is approved */}
              {displayLead.approvalStatus === "approved" &&
                displayLead.leadStage !== "Won" && displayLead.leadStage !== "Lost" && hasActionAccess('Update Status', 'All Leads', 'Lead') && (
                  <button
                    onClick={() => setShowWinLossModal(true)}
                    className="rounded-full p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition"
                    title="Update Status"
                  >
                    <GitPullRequestArrow className="h-5 w-5" />
                  </button>
                )}
              {/* History Button */}
              {/* {hasActionAccess('View History', 'All Leads', 'Lead') && (
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition"
                  title="View History"
                >
                  <History className="h-5 w-5" />
                </button>
              )} */}
              {/* Edit Button */}
              {/* {hasActionAccess('Edit', 'All Leads', 'Lead') && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className={`rounded-full p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 transition ${displayLead.approvalStatus === "approved" ||
                    displayLead.approvalStatus === "rejected"
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : ""
                    }`}
                  title="Edit Lead"
                  disabled={
                    displayLead.approvalStatus === "approved" ||
                    displayLead.approvalStatus === "rejected"
                  }
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              )} */}

              {(displayLead.approvalStatus === "pending" || displayLead.approvalStatus === "draft" || userData?.role == 'admin') && hasActionAccess('edit', 'All customers', 'customers') && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                  title="Edit Customer"
                >
                  <SquarePen className="h-5 w-5" /> {(userData?.role == 'admin' && !(displayLead.approvalStatus === "pending" || displayLead.approvalStatus === "draft")) && "Super Admin EDIT"}
                </button>
              )}
              {/* Delete Button */}
              {/* <button
                onClick={() => setShowDeleteModal(true)}
                className="rounded-full p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
                title="Delete Lead"
              >
                <Trash2 className="h-5 w-5" />
              </button> */}
              {/* Create Project Button */}
              {/* {displayLead.leadStage === "Won" && (
                <button
                  onClick={() => onConvert(displayLead.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Create Project
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'basic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab('followup')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'followup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Follow-Up
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assign'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Assign To
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* ===== SECTION 1: Basic Information ===== */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.businessName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Customer Branch</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.branch_name || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-500">Currency</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.currency || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Lead Ageing </p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.submittedDate
                          ? Math.floor(
                            (new Date().getTime() -
                              new Date(displayLead.submittedDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )
                          : 0}{" "}
                        days
                      </p>
                    </div>
                  </div>

                  {/* <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact No</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.phone || displayLead.contactNo}
                      </p>
                    </div>
                  </div> */}

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Lead Generated Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.leadGeneratedDate
                          ? new Date(displayLead.leadGeneratedDate).toLocaleDateString(
                            "en-IN"
                          )
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Link className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Referenced By</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.referencedBy || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Lead Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.leadType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Work Type</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.workType || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`h-5 w-5 ${getCriticalityColor(displayLead.leadCriticality)}`} />
                    <div>
                      <p className="text-sm text-gray-500">Lead Criticality</p>
                      <p className={`text-sm font-medium ${getCriticalityColor(displayLead.leadCriticality)}`}>
                        {displayLead.leadCriticality}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Lead Source</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.leadSource}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-500">Lead Stage</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.leadStage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Next Follow-Up Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.nextFollowUpDate
                          ? new Date(displayLead.nextFollowUpDate).toLocaleDateString("en-IN")
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Deal Closure (ETA)</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.eta
                          ? new Date(displayLead.eta).toLocaleDateString("en-IN")
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* NEW FIELD: Lead Temperature */}
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Lead Temperature</p>
                      <p className={`text-sm font-medium ${displayLead.leadTemperature === 'Hot' ? 'text-red-600' :
                        displayLead.leadTemperature === 'Warm' ? 'text-orange-600' :
                          displayLead.leadTemperature === 'Cold' ? 'text-blue-600' :
                            'text-gray-900'
                        }`}>
                        {displayLead.leadTemperature || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.created_by_name || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.assigned_user_name || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FileBarChart className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Quotation Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.temp_quotation_number || "-"}
                      </p>
                    </div>
                  </div>

                  {/* <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Response Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.approximateResponseTime} days
                      </p>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Project Progress */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Project Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Stage</span>
                    <span className="font-medium">{displayLead.leadStage}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          displayLead.leadStage === "Information Stage"
                            ? "20%"
                            : displayLead.leadStage === "Enquiry"
                              ? "40%"
                              : displayLead.leadStage === "Meeting"
                                ? "60%"
                                : displayLead.leadStage === "Quoted"
                                  ? "80%"
                                  : displayLead.leadStage === "Won"
                                    ? "100%"
                                    : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* ===== SECTION 2: Project Details ===== */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Project Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Project Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.projectName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Project Value</p>
                      <p className="text-sm font-bold text-green-600">
                        {displayLead.projectValue}L
                      </p>
                    </div>
                  </div>

                  {/* NEW FIELD: Project Zone */}
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Project Zone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {zones.find((zone) => zone.id === displayLead.projectZone)?.name || "-"}
                      </p>
                    </div>
                  </div>

                  {/* NEW FIELD: Project State */}
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Project State</p>
                      <p className="text-sm font-medium text-gray-900">
                        {states.find((state) => state.id === displayLead.projectState)?.name || "-"}
                      </p>
                    </div>
                  </div>

                  {/* NEW FIELD: Project District */}
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Project District</p>
                      <p className="text-sm font-medium text-gray-900">
                        {districts.find((district) => district.id === displayLead.projectDistrict)?.name || "-"}
                      </p>
                    </div>
                  </div>

                  {/* NEW FIELD: Project City */}
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Project City</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.projectCity || "-"}
                      </p>
                    </div>
                  </div>

                  {/* NEW FIELD: Project Street - Full Width */}
                  <div className="md:col-span-2 lg:col-span-3 flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Project Street</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.projectStreet || "-"}
                      </p>
                    </div>
                  </div>

                  {/* NEW FIELD: Project Location - Full Width */}
                  <div className="md:col-span-2 lg:col-span-3 flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Project Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.projectLocation || "-"}
                      </p>
                    </div>
                  </div>

                  {/* NEW FIELD: Project Pincode */}
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Project Pincode</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.projectPincode || "-"}
                      </p>
                    </div>
                  </div>

                  {/* NEW FIELD: Project Current Status */}
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-500">Project Current Status</p>
                      <p className={`text-sm font-medium ${displayLead.projectCurrentStatus === 'Active' ? 'text-green-600' :
                        displayLead.projectCurrentStatus === 'Hold' ? 'text-yellow-600' :
                          displayLead.projectCurrentStatus === 'Stalled' ? 'text-orange-600' :
                            displayLead.projectCurrentStatus === 'Cancelled' ? 'text-red-600' :
                              displayLead.projectCurrentStatus === 'Purchase' ? 'text-blue-600' :
                                'text-gray-900'
                        }`}>
                        {displayLead.projectCurrentStatus || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== SECTION 3: Contact Persons ===== */}
              {displayLead.contactPersons && displayLead.contactPersons.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Contact Persons</h3>
                  <div className="space-y-2">
                    {displayLead.contactPersons.map((contact: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        {/* Header Row with Name and Designation */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {contact.name || "Unnamed Contact"}
                            </p>
                            {contact.designation && (
                              <p className="text-xs text-gray-500 truncate">{contact.designation}</p>
                            )}
                          </div>
                          {displayLead.contactPersons.length > 1 && (
                            <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full flex-shrink-0">
                              #{index + 1}
                            </span>
                          )}
                        </div>

                        {/* Compact Info Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                          {contact.email && (
                            <div className="col-span-2">
                              <span className="text-gray-500">📧</span>
                              <span className="ml-1 text-gray-700 truncate">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div>
                              <span className="text-gray-500">📞</span>
                              <span className="ml-1 text-gray-700">{contact.phone}</span>
                            </div>
                          )}
                          {contact.alternative_number && (
                            <div>
                              <span className="text-gray-500">📱</span>
                              <span className="ml-1 text-gray-700">{contact.alternative_number}</span>
                            </div>
                          )}
                          {contact.date_of_birth && (
                            <div>
                              <span className="text-gray-500">🎂</span>
                              <span className="ml-1 text-gray-700">
                                {new Date(contact.date_of_birth).toLocaleDateString("en-IN", {
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                          )}
                          {contact.anniversary_date && (
                            <div>
                              <span className="text-gray-500">💝</span>
                              <span className="ml-1 text-gray-700">
                                {new Date(contact.anniversary_date).toLocaleDateString("en-IN", {
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* ===== SECTION 4: Other Details ===== */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Other Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* NEW FIELD: Probability % */}
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-500">Win Probability</p>
                      <p className="text-sm font-medium text-purple-600">
                        {displayLead.ownProbability ? `${displayLead.ownProbability}%` : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Competitors Section - Full Width */}
                  <div className="md:col-span-2">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Competitors</h4>
                        {leadCompetitors && leadCompetitors.length > 0 ? (
                          <div className="flex flex-wrap gap-2.5">
                            {leadCompetitors.map((competitor: any, idx: number) => (
                              <div
                                key={idx}
                                className="group relative inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                              >
                                {/* Competitor Name */}
                                <span className="text-sm font-medium text-gray-900">
                                  {competitor.competitor_name}
                                </span>

                                {/* Divider */}
                                <div className="h-4 w-px bg-gray-200"></div>

                                {/* Win Probability Badge */}
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full ${competitor.win_probability >= 70 ? 'bg-red-500' :
                                    competitor.win_probability >= 40 ? 'bg-amber-500' :
                                      'bg-green-500'
                                    }`}></div>
                                  <span className={`text-sm font-semibold ${competitor.win_probability >= 70 ? 'text-red-700' :
                                    competitor.win_probability >= 40 ? 'text-amber-700' :
                                      'text-green-700'
                                    }`}>
                                    {competitor.win_probability}%
                                  </span>
                                </div>

                                {/* Hover indicator */}
                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <span>No competitors identified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Submitted Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.submittedDate
                          ? new Date(displayLead.submittedDate).toLocaleDateString(
                            "en-IN"
                          )
                          : "N/A"}
                      </p>
                    </div>
                  </div> */}

                  {/* <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Days in Pipeline</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayLead.submittedDate
                          ? Math.floor(
                            (new Date().getTime() -
                              new Date(displayLead.submittedDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )
                          : 0}{" "}
                        days
                      </p>
                    </div>
                  </div> */}

                  {/* Lead Details - Full Width */}
                  <div className="md:col-span-2 border-t pt-2">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Lead Details</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                          {displayLead.leadDetails || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Involved Associates - Full Width */}
                  <div className="md:col-span-2">
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-blue-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-2">Involved Associates</p>
                        {displayLead.involvedAssociates &&
                          displayLead.involvedAssociates.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {displayLead.involvedAssociates.map((a: any, idx: number) => (
                              <div
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium"
                              >
                                <span className="mr-1">{a.designation}</span>
                                <span className="font-semibold">{a.associateName}</span>
                                {a.otherInfo && (
                                  <span className="ml-1 text-gray-500">
                                    ({a.otherInfo})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">-</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Supporting Documents</h3>
                  {displayLead.leadStage !== "Information Stage" && (
                    <button
                      onClick={handleDesignHelpModalOpen}
                      disabled={
                        // Disable if assigned user already sent to design head
                        (userData?.id === displayLead.assignedTo && designHelpStatus.sentToDesignHead) ||
                        // // Disable if design head already sent to design engineer
                        // (userData?.role === 'design head' && designHelpStatus.sentToDesignEngineer) ||
                        // Disable if user is neither assigned user nor design head
                        (userData?.id !== displayLead.assignedTo && userData?.role !== 'design head')
                      }
                      className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition ${getDesignHelpButtonStyle()} disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={
                        designHelpSent
                          ? 'Design help has been assigned'
                          : userData?.id !== displayLead.assignedTo && userData?.role !== 'design head'
                            ? 'Only assigned user or design head can send for design help'
                            : ''
                      }
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {designHelpSent
                        ? 'Design Help Assigned'
                        : userData?.id === displayLead.assignedTo
                          ? 'Send to Design Head'
                          : userData?.role === 'design head'
                            ? 'Forward to Design Engineer'
                            : 'Send for Design Help'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(displayLead?.uploadedFiles ?? []).map((file: any) => {
                    const Icon = getIconByMime(file.mime, file.original_name);
                    const sizeLabel = formatBytes(file.size);

                    return (
                      <a
                        key={file.id}
                        href={`${import.meta.env.VITE_API_BASE_URL}/lead-file/${displayLead.id}/files/${file.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200 overflow-hidden"
                      >
                        {/* Header with Icon and Download Button */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>

                        {/* File Name */}
                        <h4
                          className="text-sm font-semibold text-gray-900 truncate mb-1"
                          title={file.original_name}
                        >
                          {file.original_name}
                        </h4>

                        {/* File Metadata */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span className="font-medium">{sizeLabel}</span>
                          <span className="text-gray-300">•</span>
                          <span>{file.created_at ? new Date(file.created_at).toLocaleDateString("en-IN") : "-"}</span>
                        </div>

                        {/* Uploaded By */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 pb-3 border-b border-gray-100">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-medium">{file.created_by_name || "Unknown"}</span>
                        </div>

                        {/* File Note */}
                        {file.file_note && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <div className="flex items-start gap-2">
                              <svg className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {file.file_note}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Hover Overlay Effect */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'followup' && (
            <div className="space-y-6">
              {/* Add Comment Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Follow-up Comment
                </label>
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    placeholder="Enter follow-up notes, meeting details, customer feedback..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isAddingComment}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isAddingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Comment'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Follow-up Comments
                </h3>
                {followUpComments && followUpComments.length > 0 ? (
                  <div className="space-y-4">
                    {followUpComments.map((comment: any, index: number) => (
                      <div
                        key={comment.id || index}
                        className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-2">
                              {comment.comment || comment.text}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {comment.created_at || comment.timestamp
                                    ? new Date(
                                      comment.created_at || comment.timestamp
                                    ).toLocaleString('en-IN', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
                                    })
                                    : 'No timestamp'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{comment.created_by || 'Unknown'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No follow-up comments yet</p>
                    <p className="text-xs mt-1">
                      Add your first comment using the form above
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'assign' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Assign Lead
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign to
                    </label>
                    <select
                      disabled={displayLead.approvalStatus.toLowerCase() != "approved"}
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
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

                  <div className="flex justify-end">
                    <button
                      onClick={handleAssignUser}
                      disabled={isSubmitting || displayLead.approvalStatus.toLowerCase() != "approved"}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Assigning...' : 'Assign User'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Win/Loss Modal */}
      {showWinLossModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Lead Status
              </h3>
              <button
                onClick={() => setShowWinLossModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-0">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 py-3 text-sm font-medium text-center ${statusModalTab === 'closure'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => {
                    setStatusModalTab('closure');
                    setSelectedOutcome('Won');
                    setWinLossReason("");
                  }}
                >
                  Won / Loss
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-medium text-center ${statusModalTab === 'other'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => {
                    setStatusModalTab('other');
                    setSelectedOutcome('Hold');
                    setWinLossReason("");
                  }}
                >
                  Hold / Other
                </button>
              </div>

              <div className="p-6 space-y-4">
                {statusModalTab === 'closure' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="flex space-x-6">
                        <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                          <input
                            type="radio"
                            value="Won"
                            checked={selectedOutcome === "Won"}
                            onChange={() => setSelectedOutcome("Won")}
                            className="mr-2"
                          />
                          <CheckCircle className={`h-4 w-4 mr-1 ${selectedOutcome === "Won" ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className={`${selectedOutcome === "Won" ? 'text-green-700 font-medium' : 'text-gray-600'}`}>Won</span>
                        </label>

                        <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors flex-1 justify-center has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                          <input
                            type="radio"
                            value="Lost"
                            checked={selectedOutcome === "Lost"}
                            onChange={() => setSelectedOutcome("Lost")}
                            className="mr-2"
                          />
                          <XCircle className={`h-4 w-4 mr-1 ${selectedOutcome === "Lost" ? 'text-red-600' : 'text-gray-400'}`} />
                          <span className={`${selectedOutcome === "Lost" ? 'text-red-700 font-medium' : 'text-gray-600'}`}>Lost</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={winLossReason}
                        onChange={(e) => setWinLossReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Reason</option>
                        {winLossReasons.map((reason) => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remark {selectedOutcome === "Lost" && <span className="text-red-500">*</span>}
                        {selectedOutcome === "Won" && <span className="text-gray-400 text-xs ml-1">(Optional)</span>}
                      </label>
                      <textarea
                        value={winLossRemark}
                        onChange={(e) => setWinLossRemark(e.target.value)}
                        rows={3}
                        placeholder={selectedOutcome === "Won" ? "Additional remarks about the win..." : "Specific details about the loss..."}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm text-yellow-800 mb-2 flex items-center">
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Marking lead as <strong>Hold</strong> will preserve the current stage.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hold Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={winLossReason}
                        onChange={(e) => setWinLossReason(e.target.value)}
                        rows={4}
                        placeholder="Why is this lead being put on hold?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowWinLossModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWinLossSubmit}
                disabled={isSubmitting} // Validation alerts handle the disabled-like logic better for complex rules
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${selectedOutcome === "Won"
                  ? "bg-green-600 hover:bg-green-700"
                  : selectedOutcome === "Hold"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-red-600 hover:bg-red-700"
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedOutcome === "Won" && <CheckCircle className="h-4 w-4 mr-2" />}
                    {selectedOutcome === "Lost" && <XCircle className="h-4 w-4 mr-2" />}
                    {selectedOutcome === "Hold" && <PauseCircle className="h-4 w-4 mr-2" />}
                    Mark as {selectedOutcome}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                History Details
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50 flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border border-gray-300 rounded px-3 py-1 w-1/3 text-sm"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          User Name
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          Operation Type
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          Operation Date
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          Lead Stage
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-2">{row.user}</td>
                          <td className="px-4 py-2">{row.type}</td>
                          <td className="px-4 py-2">{row.date}</td>
                          <td className="px-4 py-2">{row.stage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t">
                  <span className="text-xs text-gray-500"></span>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Lead
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this lead? This action cannot be
                undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add your delete logic here (same as AddVendorModal)
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && (
        <AddLeadModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setRefreshTrigger(prev => prev + 1);
          }}
          onSubmit={(_updatedLead) => {
            // Handle update logic here (e.g., call API or update state)
            setShowEditModal(false);
            setRefreshTrigger(prev => prev + 1);
          }}
          initialData={displayLead}
        />
      )}

      {/* Generate Quotation Number Confirmation Modal */}
      {showGenerateQuotationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Generate Quotation Number
              </h3>
              <button
                onClick={() => setShowGenerateQuotationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0">
                  <FileBarChart className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    Are you sure you want to generate a quotation number?
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    This will create a unique quotation number and update the lead stage to "Quoted".
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Quotation Number Format:</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  QUOT-{displayLead.id.substring(0, 8)}-{displayLead.leadNumber.split("-")[1]}-{new Date().getTime()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowGenerateQuotationModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateQuotationNumber}
                disabled={isGeneratingQuotation}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGeneratingQuotation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Design Help Modal */}
      {showDesignHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {targetRole === 'design head' ? 'Send to Design Head' : 'Forward to Design Engineer'}
              </h3>
              <button
                onClick={() => setShowDesignHelpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {targetRole === 'design head' ? 'Select Design Head' : 'Select Design Engineer'}
                  </label>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading users...</span>
                    </div>
                  ) : eligibleUsers.length > 0 ? (
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Select User --</option>
                      {eligibleUsers.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500 py-4 text-center">
                      No users available for the selected role in this zone
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDesignHelpModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendDesignHelp}
                disabled={!selectedUserId || isSendingHelp}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSendingHelp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetails;
