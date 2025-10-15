import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is installed and imported
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

const baseURL = import.meta.env.VITE_API_BASE_URL; // Import the base URL from environment variables

interface VendorApprovalProps {
  onApprovalAction: (
    vendorId: string,
    action: "approve" | "reject",
    reason?: string
  ) => void;
  onRefresh?: () => Promise<void>;
}

const VendorApproval: React.FC<VendorApprovalProps> = ({
  onApprovalAction,
  onRefresh,
}) => {
  //----------------------------------------------------------------------------------- For Notification
  const token = localStorage.getItem('auth_token') || '';
  const { userData } = useCRM();
  const userRole = userData?.role || '';
  const { sendNotification } = useNotifications(userRole, token);
  //------------------------------------------------------------------------------------
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [reason, setReason] = useState("");
  const { hasActionAccess } = useCRM();

  // Fetch vendor data on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(`${baseURL}/vendor/`);
        console.log("Fetched vendors:", response.data.data);
        const filteredVendors = response.data.data?.filter(
          (vendor: any) =>
            !["APPROVED", "REJECTED"].includes(vendor.approval_status)
        );

        const vendors = filteredVendors?.map((vendor: any) => ({
          id: vendor.vendor_id,
          vendorNumber: vendor.vendor_number || "-",
          vendorType: vendor.vendor_type || "-",
          businessName: vendor.business_name || "-",
          contactNo: vendor.contact_no || "-",
          email: vendor.email || "-",
          country: vendor.country || "-",
          currency: vendor.currency || "-",
          state: vendor.state || "-",
          district: vendor.district || "-",
          city: vendor.city || "-",
          pincode: vendor.pincode || "-",
          panNumber: vendor.pan_number || "-",
          tanNumber: vendor.tan_number || "-",
          gstNumber: vendor.gst_number || "-",
          bankName: vendor.bank_name || "-",
          bankAccountNumber: vendor.bank_account_number || "-",
          branchName: vendor.branch_name || "-",
          ifscCode: vendor.ifsc_code || "-",
          approvalStatus: vendor.approval_status || "-",
          approvedBy: vendor.approved_by || "-",
          submittedDate: vendor.created_at || "-",
          submittedBy: vendor.created_by || "-",
          updatedAt: vendor.updated_at || "-",
          updatedBy: vendor.updated_by || "-",
          isActive: vendor.is_active,
          isDeleted: vendor.is_deleted,
        }));
        setPendingVendors(vendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  const handleApprovalClick = (vendor: any, action: "approve" | "reject") => {
    setSelectedVendor(vendor);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = async () => {
    if (selectedVendor) {
      try {
        const decision = actionType === "approve" ? "approved" : "rejected";
        await axios.patch(
          `${baseURL}/vendor/${selectedVendor.id}/decision`,
          null,
          {
            params: { status: decision },
          }
        );
        setPendingVendors((prev) =>
          prev.filter((vendor) => vendor.id !== selectedVendor.id)
        );
        setShowReasonModal(false);
        setReason("");
        setSelectedVendor(null);

        // ------------------------------------------------------------------------------------------For notifications
        try {
              await sendNotification({
                receiver_ids: ['admin'],
                title: `CRM - Vendor ${actionType === "approve" ? "approved" : "rejected"} : ${selectedVendor.businessName || 'Vendor'}`,
                message: `Vendor ${selectedVendor.businessName || 'Vendor'} has been ${actionType === "approve" ? "approved" : "rejected"} by ${userData?.name || 'a user'}`,
                service_type: 'CRM',
                link: '/vendors',
                sender_id: userRole || 'user',
                access: {
                  module: "CRM",
                  menu: "Vendors",
                }
              });
              console.log(`Notification sent for CRM Vendor ${selectedVendor.businessName || 'Vendor'}`);
          } catch (notifError) {
            console.error('Failed to send notification:', notifError);
            // Continue with the flow even if notification fails
          }
        // ----------------------------------------------------------------------------------------

        if (typeof onRefresh === "function") {
          await onRefresh();
        }
      } catch (error) {
        console.error("Error updating vendor decision:", error);
      }
    }
  };

  const filteredVendors = pendingVendors.filter((vendor) => {
    const q = search.toLowerCase();
    return (
      vendor.businessName.toLowerCase().includes(q) ||
      vendor.vendorNumber.toLowerCase().includes(q) ||
      vendor.vendorType.toLowerCase().includes(q) ||
      vendor.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Vendor Registrations
              </h3>
              <p className="text-sm text-gray-500">
                {pendingVendors.length} vendors awaiting approval
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Requires Procurement Head Approval</span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
              style={{ minWidth: 0 }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {vendor.businessName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}
                        >
                          {vendor.vendorCategory}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}
                        >
                          {vendor.vendorType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PAN: {vendor.panNumber} | GST: {vendor.gstNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {vendor.contactNo}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {vendor.email}
                      </div>
                      {/* <p className="text-xs text-gray-500 mt-1">
                        {vendor.contactPersons.length} contact person(s)
                      </p> */}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {vendor.city}, {vendor.state}
                      </div>
                      <p className="text-sm text-gray-600">{vendor.pincode}</p>
                      {/* <p className="text-xs text-gray-500 mt-1">
                        {vendor.branches.length} branch(es)
                      </p> */}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      {/* <p className="text-sm font-medium text-gray-900">
                        {vendor.submittedBy}
                      </p> */}
                      <p className="text-xs text-gray-500">
                        {new Date(vendor.submittedDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {hasActionAccess('Approve', 'Vendor Approval', 'Vendors') && (
                        <button
                          onClick={() => handleApprovalClick(vendor, "approve")}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </button>
                      )}
                      {hasActionAccess('Reject', 'Vendor Approval', 'Vendors') && (
                        <button
                          onClick={() => handleApprovalClick(vendor, "reject")}
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

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === "approve" ? "Approve Vendor" : "Reject Vendor"}
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
                    {selectedVendor?.businessName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === "approve"
                      ? "Approve this vendor?"
                      : "Reject this vendor?"}
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
                    Approve Vendor
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Vendor
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

export default VendorApproval;
