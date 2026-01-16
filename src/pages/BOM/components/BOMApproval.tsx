import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Search,
  Info,
} from "lucide-react";
import {
  updateBOMApprovalDecision,
  getBOMsByApproverRole,
  updateBOM,
} from "../../../utils/bomApprovalApi";
import { useCRM } from "../../../context/CRMContext";
import useNotifications from '../../../hook/useNotifications';

interface ApprovalDetail {
  approval_id: string;
  approver_role: string;
  approval_status: string;
  approved_by: string | null;
  approval_comment: string | null;
  approval_created_at: string;
  approval_updated_at: string | null;
}

interface BOMData {
  id: string;
  bom_number: string;
  name: string;
  lead_id: string;
  project_id?: string;
  work_type: string;
  total_items: number;
  total_price: number;
  created_by: string;
  created_at: string;
  approval_status: string;
  business_name?: string;
  project_name?: string;
  lead_type?: string;
  lead_number?: string;
  approvals: ApprovalDetail[];
  approval_history?: ApprovalDetail[];
}

interface BOMApprovalProps {
  onApprovalAction: (
    bomId: string,
    action: "approve" | "reject" | "revisit",
    reason?: string
  ) => void;
}

const BOMApproval: React.FC<BOMApprovalProps> = ({ onApprovalAction }) => {
  //----------------------------------------------------------------------------------- For Notification
  const token = localStorage.getItem('auth_token') || '';
  const { userData } = useCRM();
  const userRole = userData?.role || '';
  const { sendNotification } = useNotifications(userRole, token);
  //------------------------------------------------------------------------------------
  
  const [selectedBOM, setSelectedBOM] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "revisit">("approve");
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [boms, setBOMs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [reasonMessage, setReasonMessage] = useState("");
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);
  const [selectedApprovalHistory, setSelectedApprovalHistory] = useState<ApprovalDetail[]>([]);
  const [selectedBOMNumber, setSelectedBOMNumber] = useState("");
  const { hasActionAccess } = useCRM();

  const roleHierarchy = {
    level1: "design engineer",
    level2: "sales manager"
  };

  // Check if user can take action based on hierarchy
  const canTakeAction = (bom: any, action: "approve" | "reject" | "revisit") => {
    const currentUserApproval = bom.approvals?.find(
      (approval: ApprovalDetail) => approval.approver_role === userRole
    );

    if (!currentUserApproval || currentUserApproval.approval_status !== "PENDING") {
      return { canAct: false, reason: "No pending approval for your role" };
    }

    // If current user is level2, check if level1 is approved
    if (userRole === roleHierarchy.level2) {
      const level1Approval = bom.approvals?.find(
        (approval: ApprovalDetail) => approval.approver_role === roleHierarchy.level1
      );

      if (!level1Approval || level1Approval.approval_status !== "APPROVED") {
        return { 
          canAct: false, 
          reason: `${roleHierarchy.level1} approval is pending so you cannot ${action}` 
        };
      }
    }

    return { canAct: true, reason: "" };
  };

  // Handle hierarchy-based approval click
  const handleHierarchyApprovalClick = (bom: any, action: "approve" | "reject" | "revisit") => {
    const { canAct, reason } = canTakeAction(bom, action);
    
    if (!canAct) {
      setReasonMessage(reason);
      setShowReasonPopup(true);
      return;
    }

    handleApprovalClick(bom, action);
  };

  // Fetch BOMs from API
  useEffect(() => {
    const fetchBOMs = async () => {
      try {
        setLoading(true);
        // Use the new API to get BOMs by approver role
        const response = await getBOMsByApproverRole({
          approver_role: userRole
        });
        const apiBOMs = response.data || [];

        // Map API response to UI format and filter only pending BOMs
        const mappedBOMs = mapBOMData(apiBOMs);
        setBOMs(mappedBOMs);
      } catch (error) {
        console.error("Error fetching BOMs:", error);
        setBOMs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBOMs();
  }, [userRole]);

  // Calculate total value from API data
  const calculateTotalValue = (apiBOM: BOMData) => {
    const totalPrice = parseFloat(apiBOM.total_price?.toString() || "0");
    return `₹${totalPrice.toLocaleString("en-IN")}`;
  };

  // Helper function to map API BOM data to UI format
  const mapBOMData = (apiBOMs: BOMData[]) => {
    return apiBOMs
      .filter(
        (apiBOM: BOMData) =>
          apiBOM.approval_status !== "APPROVED" &&
          apiBOM.approval_status !== "REJECTED" &&
          apiBOM.approval_status !== "REVISIT"
      )
      .map((apiBOM: BOMData) => ({
        id: apiBOM.id,
        bomNumber: apiBOM.bom_number, // Using ID as BOM number, adjust if you have a specific BOM number field
        leadId: apiBOM.lead_id,
        projectId: apiBOM.project_id,
        leadName: apiBOM.name || apiBOM.project_name || "Unknown Project",
        businessName: apiBOM.business_name || "Unknown Business",
        workType: apiBOM.work_type || "Unknown",
        leadType: apiBOM.lead_type || "Unknown",
        totalValue: calculateTotalValue(apiBOM),
        itemCount: apiBOM.total_items || 0,
        createdBy: apiBOM.created_by || "Unknown",
        createdDate: apiBOM.created_at || new Date().toISOString(),
        status: "pending_approval",
        approvals: apiBOM.approvals || [],
        approval_history: apiBOM.approval_history?.filter((history: any) => history.approval_status != "PENDING") || [],
        originalData: apiBOM,
      }));
  };

  // Filter BOMs based on search term
  const filteredBOMs = boms.filter((bom) => {
    if (!searchTerm) return true;

    const searchString = searchTerm.toLowerCase();

    // Helper function to format date for search
    const formatDateForSearch = (dateString: string) => {
      const date = new Date(dateString);
      return {
        original: dateString,
        formatted: date.toLocaleDateString("en-IN"), // DD/MM/YYYY format
        day: date.getDate().toString().padStart(2, "0"),
        month: (date.getMonth() + 1).toString().padStart(2, "0"),
        year: date.getFullYear().toString(),
        monthName: date
          .toLocaleDateString("en-IN", { month: "long" })
          .toLowerCase(),
        monthShort: date
          .toLocaleDateString("en-IN", { month: "short" })
          .toLowerCase(),
      };
    };

    // Format dates for search
    const createdDate = formatDateForSearch(bom.createdDate);

    return (
      bom.leadName.toLowerCase().includes(searchString) ||
      bom.businessName.toLowerCase().includes(searchString) ||
      bom.workType.toLowerCase().includes(searchString) ||
      bom.totalValue.toLowerCase().includes(searchString) ||
      bom.createdBy.toLowerCase().includes(searchString) ||
      bom.bomNumber?.toLowerCase().includes(searchString) ||
      bom.leadId?.toLowerCase().includes(searchString) ||
      // Enhanced date searching for created date
      createdDate.original.includes(searchString) ||
      createdDate.formatted.includes(searchString) ||
      createdDate.day.includes(searchString) ||
      createdDate.month.includes(searchString) ||
      createdDate.year.includes(searchString) ||
      createdDate.monthName.includes(searchString) ||
      createdDate.monthShort.includes(searchString)
    );
  });

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case "Basement Ventilation":
        return "bg-blue-100 text-blue-800";
      case "HVAC Systems":
        return "bg-purple-100 text-purple-800";
      case "AMC":
        return "bg-red-100 text-red-800";
      case "Retrofit":
        return "bg-amber-100 text-amber-800";
      case "Chiller":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprovalClick = (
    bom: any,
    action: "approve" | "reject" | "revisit"
  ) => {
    setSelectedBOM(bom);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleShowApprovalHistory = (bom: any) => {
    setSelectedApprovalHistory(bom.approval_history || []);
    setSelectedBOMNumber(bom.bomNumber || "");
    setShowApprovalHistory(true);
  };

  const handleConfirmAction = async () => {
    if (selectedBOM) {
      try {
        setActionLoading(true);
        const status = actionType === "approve" ? "APPROVED" : actionType === "reject" ? "REJECTED" : "REVISIT";

        // Get the approval ID for the current user's role from the selected BOM
        const currentUserApproval = selectedBOM.approvals?.find(
          (approval: ApprovalDetail) => approval.approver_role === userRole
        );

        if (!currentUserApproval) {
          throw new Error("No approval record found for current user role");
        }

        // Step 1: Always update the approval status first
        await updateBOMApprovalDecision(
          currentUserApproval.approval_id, 
          status, 
          userData?.name || userData?.email || userRole,
          reason || undefined
        );

        // Step 2: Update the main BOM table for different scenarios
        if (userRole === roleHierarchy.level2 && actionType === "approve") {
          // For Level 2 (CRM Zonal Head) final approval
          await updateBOM(selectedBOM.id, {
            approval_status: status,
            updated_by: userData?.id || userData?.email || userRole
          });
        } else if (actionType === "reject" || actionType === "revisit") {
          // For reject or revisit actions, update the main BOM table
          await updateBOM(selectedBOM.id, {
            approval_status: status,
            updated_by: userData?.id || userData?.email || userRole
          });
        }

        // Call the parent callback function if provided
        onApprovalAction(selectedBOM.id, actionType, reason);

        // Close modal and reset state
        setShowReasonModal(false);
        setReason("");
        setSelectedBOM(null);

        // Refresh the BOMs list by re-fetching data
        const response = await getBOMsByApproverRole({
          approver_role: userRole
        });
        const apiBOMs = response.data || [];
        const mappedBOMs = mapBOMData(apiBOMs);
        setBOMs(mappedBOMs);

        // ------------------------------------------------------------------------------------------For notifications
        try {
            const actionText = actionType === "approve" ? "Approved" : actionType === "reject" ? "Rejected" : "Marked for Revisit";
            await sendNotification({
              receiver_ids: ['admin'],
              title: `BOM ${actionText} Successfully For : ${selectedBOM.bomNumber||'BOM'}`,
              message: `BOM ${actionText.toLowerCase()} successfully by ${userData?.name || 'a user'}`,
              service_type: 'CRM',
              link: '/bom',
              sender_id: userRole || 'user',
              access: {
                module: "CRM",
                menu: "BOM",
              }
            });
            console.log(`Notification sent for CRM BOM of ${selectedBOM.bomNumber||'BOM'}`);
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
          // Continue with the flow even if notification fails
        }
        // ----------------------------------------------------------------------------------------

        // Show success message (you can add a toast notification here)
        console.log(
          `BOM ${actionType === "approve" ? "approved" : actionType === "reject" ? "rejected" : "marked for revisit"
          } successfully`
        );
      } catch (error) {
        console.error(
          `Error ${actionType === "approve" ? "approving" : actionType === "reject" ? "rejecting" : "marking for revisit"
          } BOM:`,
          error
        );
        // You can add error toast notification here
        const actionText = actionType === "approve" ? "approve" : actionType === "reject" ? "reject" : "mark for revisit";
        alert(`Failed to ${actionText} BOM. Please try again.`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pending BOM Approvals
              </h3>
              <p className="text-sm text-gray-500">
                {filteredBOMs.length} BOMs{" "}
                {searchTerm ? "found" : "awaiting approval"}
              </p>
            </div>
            {/* <div className="flex items-center space-x-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Requires Sales Manager Approval</span>
            </div> */}
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-end">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search BOMs by any field"
                  className="block pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  style={{ width: "240px" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm">Loading BOMs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBOMs.length > 0 ? (
                filteredBOMs.map((bom) => (
                  <tr key={bom.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {bom.leadName}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getWorkTypeColor(
                            bom.workType
                          )}`}
                        >
                          {bom.workType}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getWorkTypeColor(
                            bom.workType
                          )}`}
                        >
                          {bom.bomNumber}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Created:{" "}
                            {new Date(bom.createdDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {bom.businessName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {bom.totalValue}
                      </div>
                      {/* <div className="text-xs text-gray-500">
                        {bom.itemCount} items
                      </div> */}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {bom.approvals && bom.approvals.length > 0 ? (
                          bom.approvals.map((approval: ApprovalDetail) => (
                            <div key={approval.approval_id} className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-700 capitalize">
                                {approval.approver_role}:
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                  approval.approval_status === "APPROVED"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : approval.approval_status === "REJECTED"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                }`}
                              >
                                {approval.approval_status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">No approvals</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        // Find the approval for the current user's role
                        const currentUserApproval = bom.approvals?.find(
                          (approval: ApprovalDetail) => approval.approver_role === userRole
                        );

                        if (!currentUserApproval) {
                          return (
                            <span className="text-xs text-gray-500">
                              No approval required for your role
                            </span>
                          );
                        }

                        // Check if the current user's approval is pending
                        if (currentUserApproval.approval_status === "PENDING") {
                          const canApprove = hasActionAccess('Approve', 'Bom approval', 'BOM');
                          const canReject = hasActionAccess("Reject", "Bom approval", "BOM");
                          const canRevisit = hasActionAccess("Revisit", "Bom approval", "BOM");
                          return (
                            <div className="flex items-center flex-wrap gap-2">
                              {canApprove ? (
                                <button
                                  onClick={() => handleHierarchyApprovalClick(bom, "approve")}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </button>
                              ) : (
                                <span className="text-xs text-red-500">No Approve Access</span>
                              )}
                              {canRevisit ? (
                                <button
                                  onClick={() => handleHierarchyApprovalClick(bom, "revisit")}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Revisit
                                </button>
                              ) : (
                                <span className="text-xs text-red-500">No Revisit Access</span>
                              )}
                              {canReject ? (
                                <button
                                  onClick={() => handleHierarchyApprovalClick(bom, "reject")}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </button>
                              ) : (
                                <span className="text-xs text-red-500">No Reject Access</span>
                              )}
                              {bom.approval_history && bom.approval_history.length > 0 && (
                                <button
                                  onClick={() => handleShowApprovalHistory(bom)}
                                  className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                  title="View Approval History"
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          );
                        } else {
                          // Show status for current user's role if already processed
                          return (
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col space-y-1">
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${
                                    currentUserApproval.approval_status === "APPROVED"
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : currentUserApproval.approval_status === "REJECTED"
                                      ? "bg-red-100 text-red-800 border-red-300"
                                      : "bg-gray-100 text-gray-700 border-gray-300"
                                  }`}
                                >
                                  {currentUserApproval.approval_status === "APPROVED" && (
                                    <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                  )}
                                  {currentUserApproval.approval_status === "REJECTED" && (
                                    <XCircle className="h-3 w-3 mr-1 text-red-600" />
                                  )}
                                  {currentUserApproval.approval_status === "PENDING" && (
                                    <Clock className="h-3 w-3 mr-1 text-yellow-600" />
                                  )}
                                  {currentUserApproval.approval_status.charAt(0).toUpperCase() +
                                    currentUserApproval.approval_status.slice(1).toLowerCase()}
                                </span>
                                <span className="text-xs text-gray-500 text-center">
                                  No action needed
                                </span>
                              </div>
                              {bom.approval_history && bom.approval_history.length > 0 && (
                                <button
                                  onClick={() => handleShowApprovalHistory(bom)}
                                  className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                  title="View Approval History"
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">
                        {searchTerm
                          ? `No BOMs found matching "${searchTerm}"`
                          : "No BOMs available"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === "approve"
                  ? "Approve BOM"
                  : actionType === "reject"
                  ? "Reject BOM"
                  : "Revisit BOM"}
              </h3>
              <button
                onClick={() => setShowReasonModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                {actionType === "approve" ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : actionType === "reject" ? (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                ) : (
                  <Eye className="h-8 w-8 text-yellow-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedBOM?.leadName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <p className="text-sm text-red-600 font-bold">
                      {actionType === "approve"
                        ? "Approve this BOM?"
                        : actionType === "reject"
                        ? "Are you sure you want to reject this BOM? \n This action is permanent and cannot be undone."
                        : "Mark this BOM for revisit?"}
                    </p>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === "approve"
                    ? "Approval Notes (Optional)"
                    : actionType === "reject"
                    ? "Rejection Reason *"
                    : "Revisit Notes *"}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required={actionType === "reject" || actionType === "revisit"}
                  placeholder={
                    actionType === "approve"
                      ? "Add any notes..."
                      : actionType === "reject"
                      ? "Please provide reason for rejection..."
                      : "Please provide reason for revisit..."
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowReasonModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={
                  ((actionType === "reject" || actionType === "revisit") && !reason.trim()) || actionLoading
                }
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : actionType === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {actionType === "approve" 
                      ? "Approving..." 
                      : actionType === "reject" 
                      ? "Rejecting..." 
                      : "Marking for Revisit..."}
                  </>
                ) : (
                  <>
                    {actionType === "approve" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve BOM
                      </>
                    ) : actionType === "reject" ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject BOM
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Mark for Revisit
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Reason Popup */}
      {showReasonPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Action Not Allowed
                </h3>
              </div>
              <button
                onClick={() => setShowReasonPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {reasonMessage}
                  </p>
                </div>
              </div>
              
              {/* Additional info */}
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Please wait for the required approvals before taking action on this BOM.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-6 border-t border-gray-100">
              <button
                onClick={() => setShowReasonPopup(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval History Modal */}
      {showApprovalHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Approval History
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedBOMNumber && `BOM: ${selectedBOMNumber}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApprovalHistory(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedApprovalHistory && selectedApprovalHistory.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Total {selectedApprovalHistory.length} approval record(s) found in history
                  </div>
                  
                  {/* Timeline-style display */}
                  <div className="relative">
                    {selectedApprovalHistory
                      .sort((a, b) => new Date(b.approval_created_at).getTime() - new Date(a.approval_created_at).getTime())
                      .map((approval, index) => (
                      <div key={approval.approval_id} className="relative flex items-start space-x-4 pb-6">
                        {/* Timeline line */}
                        {index < selectedApprovalHistory.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                        )}
                        
                        {/* Timeline dot */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          approval.approval_status === "APPROVED"
                            ? "bg-green-100 text-green-600"
                            : approval.approval_status === "REJECTED"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}>
                          {approval.approval_status === "APPROVED" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : approval.approval_status === "REJECTED" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-semibold text-gray-900 capitalize">
                                  {approval.approver_role}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    approval.approval_status === "APPROVED"
                                      ? "bg-green-100 text-green-800"
                                      : approval.approval_status === "REJECTED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {approval.approval_status}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(approval.approval_created_at).toLocaleString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true
                                })}
                              </div>
                            </div>
                            
                            {approval.approved_by && (
                              <div className="mb-2">
                                <span className="text-xs text-gray-600">Approved By: </span>
                                <span className="text-xs font-medium text-gray-900">{approval.approved_by}</span>
                              </div>
                            )}
                            
                            {approval.approval_comment && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-600">Comment: </span>
                                <p className="text-xs text-gray-900 mt-1 italic">"{approval.approval_comment}"</p>
                              </div>
                            )}
                            
                            {approval.approval_updated_at && (
                              <div className="mt-2 text-xs text-gray-500">
                                Last Updated: {new Date(approval.approval_updated_at).toLocaleString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Info className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-gray-500">
                      <p className="text-sm font-medium">No approval history found</p>
                      <p className="text-xs">This BOM has no previous approval records.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowApprovalHistory(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
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

export default BOMApproval;
