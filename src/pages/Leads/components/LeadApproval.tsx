import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
} from "lucide-react";
import axios from "axios";
import { useCRM } from "../../../context/CRMContext";
import useNotifications from '../../../hook/useNotifications';

interface LeadApprovalProps {
  onApprovalAction: (
    leadId: string,
    action: "approved" | "rejected",
    reason?: string
  ) => void;
}

const LeadApproval: React.FC<LeadApprovalProps> = ({ onApprovalAction }) => {
  
  //----------------------------------------------------------------------------------- For Notification
  const token = localStorage.getItem('auth_token') || '';
  const { userData } = useCRM();
  const userRole = userData?.role || '';
  const { sendNotification } = useNotifications(userRole, token);
  //------------------------------------------------------------------------------------
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<"approved" | "rejected">(
    "approved"
  );
  const [reason, setReason] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { hasActionAccess } = useCRM();

  // Filter leads based on search term
  const filteredLeads = leads.filter((lead) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      lead.projectName.toLowerCase().includes(searchLower) ||
      lead.businessName.toLowerCase().includes(searchLower) ||
      lead.contactPerson.toLowerCase().includes(searchLower) ||
      lead.leadType.toLowerCase().includes(searchLower) ||
      lead.workType.toLowerCase().includes(searchLower) ||
      lead.leadCriticality.toLowerCase().includes(searchLower) ||
      lead.leadStage.toLowerCase().includes(searchLower) ||
      lead.submittedBy.toLowerCase().includes(searchLower) ||
      lead.projectValue.toLowerCase().includes(searchLower) ||
      lead.leadDetails.toLowerCase().includes(searchLower) ||
      lead.approvalStatus.toLowerCase().includes(searchLower) ||
      lead.eta?.toLowerCase().includes(searchLower) ||
      lead.approximateResponseTime.toLowerCase().includes(searchLower)
    );
  });

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/lead/`
        );
        const apiLeads = response.data.data;
        console.log("Fetched leads for approval:", apiLeads);

        // Filter leads that need approval (not already approved or rejected)
        const pendingLeads = apiLeads.filter(
          (apiLead: any) =>
            apiLead.approval_status !== "APPROVED" &&
            apiLead.approval_status !== "REJECTED"
        );
        console.log("Pending leads for approval:", pendingLeads);

        // Map API response to UI format
        const mappedLeads = pendingLeads.map((apiLead: any) => ({
          id: apiLead.lead_id?.toString() || "",
          projectName: apiLead.project_name || "",
          businessName: apiLead.business_name || "",
          contactPerson: apiLead.contact_person || "",
          projectValue: `₹${(apiLead.project_value || 0).toLocaleString(
            "en-IN"
          )}`,
          leadType: apiLead.lead_type || "",
          leadCriticality: apiLead.lead_criticality || "",
          leadStage: apiLead.lead_stage || "",
          submittedBy: apiLead.created_by || "Unknown",
          submittedDate: apiLead.created_at || "",
          leadDetails: apiLead.lead_details || "",
          workType: apiLead.work_type || "",
          eta: apiLead.eta || "",
          approximateResponseTime:
            apiLead.approximate_response_time_day?.toString() || "0",
          approvalStatus: apiLead.approval_status || "PENDING",
          involvedAssociates: [],
        }));

        setLeads(mappedLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "New Lead":
        return "bg-blue-100 text-blue-800";
      case "Qualified":
        return "bg-purple-100 text-purple-800";
      case "Meeting":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprovalClick = (lead: any, action: "approved" | "rejected") => {
    setSelectedLead(lead);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = async () => {
    if (selectedLead) {
      try {
        // Call PUT API to update lead decision
        const approved = actionType === "approved" ? "approved" : "rejected";
        const response = await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/lead/decision/${selectedLead.id
          }?status=${approved}`
        );

        console.log("Lead decision updated successfully:", response.data);

        // Call the original callback
        onApprovalAction(selectedLead.id, actionType, reason);

        // Close modal and reset form
        setShowReasonModal(false);
        setReason("");
        setSelectedLead(null);

        // ------------------------------------------------------------------------------------------For notifications
        try {
              await sendNotification({
                receiver_ids: ['admin'],
                title: `Lead ${actionType === "approved" ? "approved" : "rejected"} : ${selectedLead.businessName || 'Lead'}`,
                message: `Lead ${selectedLead.businessName || 'Lead'} has been ${actionType === "approved" ? "approved" : "rejected"} by ${userData?.name || 'a user'}`,
                service_type: 'CRM',
                link: '/leads',
                sender_id: userRole || 'user',
                access: {
                  module: "CRM",
                  menu: "Lead",
                }
              });
              console.log(`Notification sent for CRM Lead ${selectedLead.businessName || 'Lead'}`);
          } catch (notifError) {
            console.error('Failed to send notification:', notifError);
            // Continue with the flow even if notification fails
          }
        // ----------------------------------------------------------------------------------------

        // Optionally refresh the leads list
        // You might want to call fetchLeads() here to refresh the data
      } catch (error) {
        console.error("Error updating lead decision:", error);
        alert("Failed to update lead decision. Please try again.");
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
                Pending Lead Approvals
              </h3>
              <p className="text-sm text-gray-500">
                {loading
                  ? "Loading..."
                  : `${filteredLeads.length} leads awaiting approval`}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Requires Manager Approval</span>
            </div>
          </div>

          {/* Search Bar - Right Aligned */}
          <div className="mt-3 flex justify-end">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3 w-3 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search leads..."
                className="block w-48 pl-9 pr-3 py-1.5 border border-gray-300 rounded-md leading-4 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm
                ? "No leads match your search criteria"
                : "No leads pending approval"}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business & Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value & Priority
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted By
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.projectName}
                        </p>
                        <p className="text-sm text-gray-600">{lead.workType}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(
                              lead.leadStage
                            )}`}
                          >
                            {lead.leadStage}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(
                              lead.leadCriticality
                            )}`}
                          >
                            {lead.leadCriticality}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.businessName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {lead.contactPerson}
                        </p>
                        <p className="text-xs text-gray-500">{lead.leadType}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          {lead.projectValue}
                        </p>
                        <p className="text-xs text-gray-500">
                          ETA:{" "}
                          {lead.eta
                            ? new Date(lead.eta).toLocaleDateString("en-IN")
                            : "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Response: {lead.approximateResponseTime} days
                        </p>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.submittedBy}</p>
                        <p className="text-xs text-gray-500">
                          {lead.submittedDate ? new Date(lead.submittedDate).toLocaleDateString('en-IN') : 'N/A'}
                        </p>
                      </div>
                    </td> */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {lead.approvalStatus !== "APPROVED" &&
                          lead.approvalStatus !== "REJECTED" ? (
                          <>
                            {hasActionAccess('Approve', 'Lead Approval', 'Lead') && (
                              <button
                                onClick={() =>
                                  handleApprovalClick(lead, "approved")
                                }
                                className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </button>
                            )}
                            {hasActionAccess('Reject', 'Lead Approval', 'Lead') && (
                              <button
                                onClick={() =>
                                  handleApprovalClick(lead, "rejected")
                                }
                                className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </button>
                            )}
                          </>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${lead.approvalStatus === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {lead.approvalStatus}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && !showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Lead Details
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.projectName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project Value
                    </label>
                    <p className="text-sm text-green-600 font-medium">
                      {selectedLead.projectValue}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.businessName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Person
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.contactPerson}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lead Type
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.leadType}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Work Type
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.workType}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Criticality
                    </label>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(
                        selectedLead.leadCriticality
                      )}`}
                    >
                      {selectedLead.leadCriticality}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Stage
                    </label>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(
                        selectedLead.leadStage
                      )}`}
                    >
                      {selectedLead.leadStage}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lead Details
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedLead.leadDetails}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Involved Associates
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedLead.involvedAssociates.map(
                      (associate: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {associate}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleApprovalClick(selectedLead, "rejected")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprovalClick(selectedLead, "approved")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === "approved" ? "Approve Lead" : "Reject Lead"}
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
                {actionType === "approved" ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedLead?.projectName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === "approved"
                      ? "Approve this lead for further processing?"
                      : "Reject this lead?"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === "approved"
                    ? "Approval Notes (Optional)"
                    : "Rejection Reason *"}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required={actionType === "rejected"}
                  placeholder={
                    actionType === "approved"
                      ? "Add any notes..."
                      : "Please provide reason for rejection..."
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowReasonModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionType === "rejected" && !reason.trim()}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${actionType === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {actionType === "approved" ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Lead
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Lead
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

export default LeadApproval;
