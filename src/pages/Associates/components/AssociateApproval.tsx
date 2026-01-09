import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import { useCRM } from "../../../context/CRMContext";
import useNotifications from '../../../hook/useNotifications';
import { getAssociates, approveAssociate, rejectAssociate } from "../../../utils/associateApi";

const AssociateApproval: React.FC = () => {
  //----------------------------------------------------------------------------------- For Notification
  const token = localStorage.getItem('auth_token') || '';
  const { userData } = useCRM();
  const userRole = userData?.role || '';
  const { sendNotification } = useNotifications(userRole, token);
  //------------------------------------------------------------------------------------

  const [selectedAssociate, setSelectedAssociate] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingAssociates, setPendingAssociates] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { hasActionAccess } = useCRM();

  const fetchAssociates = async () => {
    try {
      const associates = await getAssociates();
      console.log("associates", associates);
      // Filter associates with approval_status not APPROVED or REJECTED
      const filteredAssociates = associates.data.filter(
        (associate: any) =>
          associate.approval_status !== "APPROVED" &&
          associate.approval_status !== "REJECTED" &&
          associate.approval_status !== "DRAFT"
      );
      console.log("filteredAssociates", filteredAssociates);

      // Map API keys to UI keys
      const mappedAssociates = filteredAssociates.map((associate: any) => ({
        id: associate.associate_id,
        businessName: associate.business_name,
        contactNo: associate.contact_number,
        email: associate.email,
        country: associate.country,
        currency: associate.currency,
        state: associate.state,
        district: associate.district,
        city: associate.city,
        associateType: associate.associate_type,
        associatePotential: associate.associate_potential,
        pincode: associate.pincode,
        submittedBy: associate.created_by, // Assuming created_by is the submitter
        submittedDate: new Date(associate.created_at).toLocaleDateString(
          "en-IN"
        ),
        panNumber: associate.pan_number,
        gstNumber: associate.gst_number,
        bankName: associate.bank_name,
        contactPersons: [], // Assuming no contact persons in the API response
        branches: [], // Assuming no branches in the API response
        uploadedFiles: [], // Assuming no uploaded files in the API response
      }));

      console.log("mappedAssociates", mappedAssociates);
      setPendingAssociates(mappedAssociates);
    } catch (error) {
      console.error("Error fetching associates:", error);
    }
  };

  useEffect(() => {
    fetchAssociates();
  }, [refreshTrigger]);

  const getAssociateTypeColor = (type: string) => {
    switch (type) {
      case "Enterprise":
        return "bg-blue-100 text-blue-800";
      case "SME":
        return "bg-green-100 text-green-800";
      case "Startup":
        return "bg-purple-100 text-purple-800";
      case "Government":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case "High":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprovalClick = (associate: any, action: "approve" | "reject") => {
    setSelectedAssociate(associate);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = async () => {
    if (selectedAssociate) {
      try {
        if (actionType === "approve") {
          await approveAssociate(selectedAssociate.id, reason);
        } else {
          await rejectAssociate(selectedAssociate.id, reason);
        }

        // ------------------------------------------------------------------------------------------For notifications
        try {
          await sendNotification({
            receiver_ids: ['admin'],
            title: `CRM - Associate ${actionType === "approve" ? "approved" : "rejected"} : ${selectedAssociate.businessName || 'Associate'}`,
            message: `Associate ${selectedAssociate.businessName || 'Associate'} has been ${actionType === "approve" ? "approved" : "rejected"} by ${userData?.name || 'a user'}`,
            service_type: 'CRM',
            link: '/associates',
            sender_id: userRole || 'user',
            access: {
              module: "CRM",
              menu: "Associates",
            }
          });
          console.log(`Notification sent for CRM Associate ${selectedAssociate.businessName || 'Associate'}`);
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
          // Continue with the flow even if notification fails
        }
        // ----------------------------------------------------------------------------------------

        // Refresh the associate list to show updated data
        setRefreshTrigger(prev => prev + 1);

        alert(
          `Associate ${actionType === "approve" ? "approved" : "rejected"
          } successfully!`
        );
      } catch (error) {
        console.error("Error updating associate status:", error);
        alert("Failed to update associate status. Please try again.");
      } finally {
        setShowReasonModal(false);
        setReason("");
        setSelectedAssociate(null);
      }
    }
  };

  // Filter associates by all visible attributes
  const filteredAssociates = pendingAssociates.filter((associate) => {
    const submittedDateObj = new Date(associate.submittedDate);
    const formattedDate = submittedDateObj.toLocaleDateString("en-IN");
    const formattedDateShort = submittedDateObj.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
    const valuesToSearch = [
      associate.businessName,
      associate.contactNo,
      associate.email,
      associate.country,
      associate.currency,
      associate.state,
      associate.district,
      associate.city,
      associate.associateType,
      associate.associatePotential,
      associate.pincode,
      associate.submittedBy,
      associate.submittedDate,
      formattedDate,
      formattedDateShort,
      associate.panNumber,
      associate.gstNumber,
      associate.bankName,
      (associate.contactPersons || [])
        .map((p: any) => `${p.name} ${p.phone} ${p.email}`)
        .join(" "),
      (associate.branches || [])
        .map(
          (b: any) =>
            `${b.branchName} ${b.contactNumber} ${b.email} ${b.city} ${b.state}`
        )
        .join(" "),
      (associate.uploadedFiles || [])
        .map((f: any) => `${f.name} ${f.size}`)
        .join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return valuesToSearch.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Associate Registrations
              </h3>
              <p className="text-sm text-gray-500">
                {filteredAssociates.length} associates awaiting approval
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Requires Sales Head Approval</span>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-2 py-1 border border-blue-300 rounded w-48 focus:outline-none focus:border-blue-500 hover:border-blue-500 transition-colors text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location & Type
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
              {filteredAssociates.map((associate) => (
                <tr key={associate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {associate.businessName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAssociateTypeColor(
                            associate.associateType
                          )}`}
                        >
                          {associate.associateType}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPotentialColor(
                            associate.associatePotential
                          )}`}
                        >
                          {associate.associatePotential} Potential
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PAN: {associate.panNumber} | GST: {associate.gstNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {associate.contactNo}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {associate.email}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {associate.contactPersons.length} contact person(s)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {associate.city}, {associate.state}
                      </div>
                      <p className="text-sm text-gray-600">
                        {associate.pincode}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {associate.branches.length} branch(es)
                      </p>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {associate.submittedBy}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(associate.submittedDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </td> */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {/* <button
                        onClick={() => setSelectedAssociate(associate)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button> */}
                      {hasActionAccess('Approve', 'Associate Approval', 'Associates') && (
                        <button
                          onClick={() => handleApprovalClick(associate, "approve")}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </button>
                      )}
                      {hasActionAccess('Reject', 'Associate Approval', 'Associates') && (
                        <button
                          onClick={() => handleApprovalClick(associate, "reject")}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Associate Details Modal */}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === "approve"
                  ? "Approve Associate"
                  : "Reject Associate"}
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
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedAssociate?.businessName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === "approve"
                      ? "Approve this associate registration?"
                      : "Reject this associate registration?"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === "approve"
                    ? "Approval Notes (Optional)"
                    : "Rejection Reason *"}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required={actionType === "reject"}
                  placeholder={
                    actionType === "approve"
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
                disabled={actionType === "reject" && !reason.trim()}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {actionType === "approve" ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Associate
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Associate
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

export default AssociateApproval;