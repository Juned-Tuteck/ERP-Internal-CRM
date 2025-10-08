import React, { useState, useEffect } from "react";
import axios from "axios";
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

const CustomerApproval: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingCustomers, setPendingCustomers] = useState<any[]>([]);
  const { hasActionAccess } = useCRM();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/customer/`
        );
        const customers = response.data.data;

        // Filter customers with approval_status not APPROVED or REJECTED
        const filteredCustomers = customers.filter(
          (customer: any) =>
            customer.approval_status !== "APPROVED" &&
            customer.approval_status !== "REJECTED"
        );

        // Map API keys to UI keys
        const mappedCustomers = filteredCustomers.map((customer: any) => ({
          id: customer.customer_id,
          businessName: customer.business_name,
          contactNo: customer.contact_number,
          email: customer.email,
          country: customer.country,
          currency: customer.currency,
          state: customer.state,
          district: customer.district,
          city: customer.city,
          customerType: customer.customer_type,
          customerPotential: customer.customer_potential,
          pincode: customer.pincode,
          submittedBy: customer.created_by, // Assuming created_by is the submitter
          submittedDate: new Date(customer.created_at).toLocaleDateString(
            "en-IN"
          ),
          panNumber: customer.pan_number,
          gstNumber: customer.gst_number,
          bankName: customer.bank_name,
          contactPersons: [], // Assuming no contact persons in the API response
          branches: [], // Assuming no branches in the API response
          uploadedFiles: [], // Assuming no uploaded files in the API response
        }));

        setPendingCustomers(mappedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const getCustomerTypeColor = (type: string) => {
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

  const handleApprovalClick = (customer: any, action: "approve" | "reject") => {
    setSelectedCustomer(customer);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = async () => {
    if (selectedCustomer) {
      try {
        const response = await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/customer/${selectedCustomer.id
          }/decision`,
          null,
          {
            params: {
              status: actionType === "approve" ? "APPROVED" : "REJECTED",
            },
          }
        );

        if (response.status === 200) {
          // Update the UI after successful approval/rejection
          setPendingCustomers((prevCustomers) =>
            prevCustomers.filter(
              (customer) => customer.id !== selectedCustomer.id
            )
          );
          alert(
            `Customer ${actionType === "approve" ? "approved" : "rejected"
            } successfully!`
          );
        }
      } catch (error) {
        console.error("Error updating customer status:", error);
        alert("Failed to update customer status. Please try again.");
      } finally {
        setShowReasonModal(false);
        setReason("");
        setSelectedCustomer(null);
      }
    }
  };

  // Filter customers by all visible attributes
  const filteredCustomers = pendingCustomers.filter((customer) => {
    const submittedDateObj = new Date(customer.submittedDate);
    const formattedDate = submittedDateObj.toLocaleDateString("en-IN");
    const formattedDateShort = submittedDateObj.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
    const valuesToSearch = [
      customer.businessName,
      customer.contactNo,
      customer.email,
      customer.country,
      customer.currency,
      customer.state,
      customer.district,
      customer.city,
      customer.customerType,
      customer.customerPotential,
      customer.pincode,
      customer.submittedBy,
      customer.submittedDate,
      formattedDate,
      formattedDateShort,
      customer.panNumber,
      customer.gstNumber,
      customer.bankName,
      (customer.contactPersons || [])
        .map((p: any) => `${p.name} ${p.phone} ${p.email}`)
        .join(" "),
      (customer.branches || [])
        .map(
          (b: any) =>
            `${b.branchName} ${b.contactNumber} ${b.email} ${b.city} ${b.state}`
        )
        .join(" "),
      (customer.uploadedFiles || [])
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
                Pending Customer Registrations
              </h3>
              <p className="text-sm text-gray-500">
                {filteredCustomers.length} customers awaiting approval
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
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {customer.businessName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCustomerTypeColor(
                            customer.customerType
                          )}`}
                        >
                          {customer.customerType}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPotentialColor(
                            customer.customerPotential
                          )}`}
                        >
                          {customer.customerPotential} Potential
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PAN: {customer.panNumber} | GST: {customer.gstNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.contactNo}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {customer.contactPersons.length} contact person(s)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.city}, {customer.state}
                      </div>
                      <p className="text-sm text-gray-600">
                        {customer.pincode}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {customer.branches.length} branch(es)
                      </p>
                    </div>
                  </td>
                  {/* <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {customer.submittedBy}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(customer.submittedDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </td> */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {/* <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button> */}
                      {hasActionAccess('Approve', 'Customer Approval', 'customers') && (
                        <button
                          onClick={() => handleApprovalClick(customer, "approve")}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </button>
                      )}
                      {hasActionAccess('Reject', 'Customer Approval', 'customers') && (
                        <button
                          onClick={() => handleApprovalClick(customer, "reject")}
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

      {/* Customer Details Modal */}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === "approve"
                  ? "Approve Customer"
                  : "Reject Customer"}
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
                    {selectedCustomer?.businessName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {actionType === "approve"
                      ? "Approve this customer registration?"
                      : "Reject this customer registration?"}
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
                    Approve Customer
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Customer
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

export default CustomerApproval;
