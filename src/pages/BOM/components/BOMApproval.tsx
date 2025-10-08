import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react";
import { useCRM } from "../../../context/CRMContext";

interface BOMApprovalProps {
  onApprovalAction: (
    bomId: string,
    action: "approve" | "reject",
    reason?: string
  ) => void;
}

const BOMApproval: React.FC<BOMApprovalProps> = ({ onApprovalAction }) => {
  const [selectedBOM, setSelectedBOM] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [reason, setReason] = useState("");
  const [pendingBOMs, setPendingBOMs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const { hasActionAccess } = useCRM();

  // Fetch BOMs with pending approval status
  useEffect(() => {
    const fetchPendingBOMs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/bom/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch BOMs");
        }

        const data = await response.json();

        // Filter BOMs with pending approval status and map to component format
        const filteredBOMs = (data.data || [])
          .filter((bom: any) => bom.approval_status === "PENDING")
          .map((bom: any) => ({
            id: bom.id,
            leadName: bom.name,
            workType: bom.work_type,
            itemCount: bom.total_items || 0,
            totalValue: `₹${(bom.total_price || 0).toLocaleString("en-IN")}`,
            createdBy: bom.created_by || "Unknown",
            createdDate: bom.created_at || new Date().toISOString(),
            status: bom.approval_status,
            description: bom.description,
            leadId: bom.lead_id,
            bomTemplateId: bom.bom_template_id,
            // Add any other fields you need
          }));

        setPendingBOMs(filteredBOMs);
      } catch (error) {
        console.error("Error fetching pending BOMs:", error);
        setPendingBOMs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBOMs();
  }, []);

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

  const handleApprovalClick = (bom: any, action: "approve" | "reject") => {
    setSelectedBOM(bom);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBOM) return;

    setIsSubmitting(true);
    try {
      const status = actionType === "approve" ? "APPROVED" : "REJECTED";
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/bom/${selectedBOM.id
        }/approval?status=${status}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${actionType} BOM`);
      }

      // Remove the BOM from the pending list
      setPendingBOMs((prev) => prev.filter((bom) => bom.id !== selectedBOM.id));

      // Call the parent callback
      onApprovalAction(selectedBOM.id, actionType, reason);

      // Reset modal state
      setShowReasonModal(false);
      setReason("");
      setSelectedBOM(null);

      // Show success message (you can replace with a toast notification)
      alert(
        `BOM ${actionType === "approve" ? "approved" : "rejected"
        } successfully!`
      );
    } catch (error) {
      console.error(`Error ${actionType}ing BOM:`, error);
      alert(`Failed to ${actionType} BOM. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBOMs = pendingBOMs.filter((bom) => {
    const q = search.toLowerCase();
    return (
      (bom.leadName || "").toLowerCase().includes(q) ||
      (bom.workType || "").toLowerCase().includes(q) ||
      (bom.status || "").toLowerCase().includes(q)
    );
  });

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
                {pendingBOMs.length} BOMs awaiting approval
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Requires Engineering Approval</span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search BOMs..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 h-10"
              style={{ minWidth: 0 }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">
                Loading BOMs...
              </span>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBOMs.map((bom) => (
                  <tr key={bom.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {bom.leadName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Created:{" "}
                            {new Date(bom.createdDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkTypeColor(
                          bom.workType
                        )}`}
                      >
                        {bom.workType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bom.itemCount} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {bom.totalValue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bom.createdBy}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {hasActionAccess('Approve', 'Bom approval', 'BOM') && (
                          <button
                            onClick={() => handleApprovalClick(bom, "approve")}
                            className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </button>
                        )}
                        {hasActionAccess('Reject', 'Bom approval', 'BOM') && (
                          <button
                            onClick={() => handleApprovalClick(bom, "reject")}
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
                {filteredBOMs.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-sm text-gray-500 text-center"
                    >
                      No BOMs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* BOM Details Modal */}
      {selectedBOM && !showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                BOM Details
              </h3>
              <button
                onClick={() => setSelectedBOM(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    BOM Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Lead Name:</span>{" "}
                      {selectedBOM.leadName}
                    </div>
                    <div>
                      <span className="text-gray-500">Work Type:</span>{" "}
                      {selectedBOM.workType}
                    </div>
                    <div>
                      <span className="text-gray-500">Created By:</span>{" "}
                      {selectedBOM.createdBy}
                    </div>
                    <div>
                      <span className="text-gray-500">Created Date:</span>{" "}
                      {new Date(selectedBOM.createdDate).toLocaleDateString(
                        "en-IN"
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Total Items:</span>{" "}
                      {selectedBOM.itemCount}
                    </div>
                    <div>
                      <span className="text-gray-500">Total Value:</span>{" "}
                      {selectedBOM.totalValue}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    BOM Items
                  </h4>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            UOM
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rate (₹)
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedBOM.items.map((item: any) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {item.itemCode}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                {item.itemName}
                                {item.specifications && (
                                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                    Spec: {item.specifications}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {item.uomName}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              ₹{item.rate.toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{item.price.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-2 text-sm font-medium text-right"
                          >
                            Total:
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            ₹
                            {selectedBOM.items
                              .reduce(
                                (sum: number, item: any) => sum + item.price,
                                0
                              )
                              .toLocaleString("en-IN")}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedBOM(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleApprovalClick(selectedBOM, "reject")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprovalClick(selectedBOM, "approve")}
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
                {actionType === "approve" ? "Approve BOM" : "Reject BOM"}
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
                    {selectedBOM?.leadName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === "approve"
                      ? "Approve this BOM?"
                      : "Reject this BOM?"}
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
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={
                  (actionType === "reject" && !reason.trim()) || isSubmitting
                }
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {actionType === "approve" ? "Approving..." : "Rejecting..."}
                  </>
                ) : (
                  <>
                    {actionType === "approve" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve BOM
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject BOM
                      </>
                    )}
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

export default BOMApproval;
