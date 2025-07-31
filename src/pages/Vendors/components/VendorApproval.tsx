import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertTriangle,
  Truck,
  Phone,
  Mail,
  MapPin,
  Tag,
} from "lucide-react";

interface VendorApprovalProps {
  onApprovalAction: (
    vendorId: string,
    action: "approve" | "reject",
    reason?: string
  ) => void;
}

const VendorApproval: React.FC<VendorApprovalProps> = ({
  onApprovalAction,
}) => {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [reason, setReason] = useState("");

  // Mock data for pending vendors
  const pendingVendors = [
    {
      id: "1",
      businessName: "Bharat Electronics Ltd",
      vendorCategory: "Electronics",
      vendorType: "Manufacturer",
      contactNo: "+91 98765 43210",
      email: "contact@bel.co.in",
      country: "India",
      currency: "INR",
      state: "Karnataka",
      district: "Bangalore Urban",
      city: "Bangalore",
      pincode: "560001",
      submittedBy: "Rajesh Kumar",
      submittedDate: "2024-01-15",
      panNumber: "ABCDE1234F",
      gstNumber: "29ABCDE1234F1Z5",
      bankName: "State Bank of India",
      contactPersons: [
        {
          name: "Vikram Singh",
          phone: "+91 98765 43211",
          email: "vikram@bel.co.in",
        },
        {
          name: "Priya Sharma",
          phone: "+91 98765 43212",
          email: "priya@bel.co.in",
        },
      ],
      branches: [
        {
          branchName: "Bangalore Head Office",
          contactNumber: "+91 98765 43210",
          email: "bangalore@bel.co.in",
          city: "Bangalore",
          state: "Karnataka",
        },
        {
          branchName: "Delhi Branch",
          contactNumber: "+91 98765 43213",
          email: "delhi@bel.co.in",
          city: "Delhi",
          state: "Delhi",
        },
      ],
      uploadedFiles: [
        { name: "Company_Profile.pdf", size: "3.2 MB" },
        { name: "ISO_Certificate.pdf", size: "1.5 MB" },
        { name: "GST_Registration.pdf", size: "0.8 MB" },
      ],
    },
    {
      id: "2",
      businessName: "Tata Steel Supplies",
      vendorCategory: "Raw Materials",
      vendorType: "Distributor",
      contactNo: "+91 87654 32109",
      email: "info@tatasteel.com",
      country: "India",
      currency: "INR",
      state: "Maharashtra",
      district: "Mumbai",
      city: "Mumbai",
      pincode: "400001",
      submittedBy: "Sneha Gupta",
      submittedDate: "2024-01-14",
      panNumber: "FGHIJ5678K",
      gstNumber: "27FGHIJ5678K1A2",
      bankName: "HDFC Bank",
      contactPersons: [
        {
          name: "Amit Patel",
          phone: "+91 87654 32110",
          email: "amit@tatasteel.com",
        },
      ],
      branches: [
        {
          branchName: "Mumbai Main Office",
          contactNumber: "+91 87654 32109",
          email: "mumbai@tatasteel.com",
          city: "Mumbai",
          state: "Maharashtra",
        },
      ],
      uploadedFiles: [
        { name: "Company_Certificate.pdf", size: "3.1 MB" },
        { name: "Tax_Documents.pdf", size: "2.7 MB" },
      ],
    },
    {
      id: "3",
      businessName: "Ashok Leyland Parts",
      vendorCategory: "Automotive",
      vendorType: "Manufacturer",
      contactNo: "+91 76543 21098",
      email: "contact@ashokleyland.com",
      country: "India",
      currency: "INR",
      state: "Tamil Nadu",
      district: "Chennai",
      city: "Chennai",
      pincode: "600001",
      submittedBy: "Kavita Reddy",
      submittedDate: "2024-01-13",
      panNumber: "LMNOP9012Q",
      gstNumber: "33LMNOP9012Q1B3",
      bankName: "ICICI Bank",
      contactPersons: [
        {
          name: "Arjun Mehta",
          phone: "+91 76543 21099",
          email: "arjun@ashokleyland.com",
        },
        {
          name: "Deepika Joshi",
          phone: "+91 76543 21100",
          email: "deepika@ashokleyland.com",
        },
      ],
      branches: [
        {
          branchName: "Chennai Head Office",
          contactNumber: "+91 76543 21098",
          email: "chennai@ashokleyland.com",
          city: "Chennai",
          state: "Tamil Nadu",
        },
      ],
      uploadedFiles: [
        { name: "Manufacturing_License.pdf", size: "1.9 MB" },
        { name: "Quality_Certification.pdf", size: "2.2 MB" },
      ],
    },
  ];

  const getVendorCategoryColor = (category: string) => {
    switch (category) {
      case "Electronics":
        return "bg-blue-100 text-blue-800";
      case "Raw Materials":
        return "bg-gray-100 text-gray-800";
      case "Automotive":
        return "bg-red-100 text-red-800";
      case "Chemicals":
        return "bg-purple-100 text-purple-800";
      case "Furniture":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVendorTypeColor = (type: string) => {
    switch (type) {
      case "Manufacturer":
        return "bg-green-100 text-green-800";
      case "Distributor":
        return "bg-blue-100 text-blue-800";
      case "Supplier":
        return "bg-purple-100 text-purple-800";
      case "Service Provider":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprovalClick = (vendor: any, action: "approve" | "reject") => {
    setSelectedVendor(vendor);
    setActionType(action);
    setShowReasonModal(true);
  };

  const handleConfirmAction = () => {
    if (selectedVendor) {
      onApprovalAction(selectedVendor.id, actionType, reason);
      setShowReasonModal(false);
      setReason("");
      setSelectedVendor(null);
    }
  };

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
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {vendor.businessName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVendorCategoryColor(
                            vendor.vendorCategory
                          )}`}
                        >
                          {vendor.vendorCategory}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVendorTypeColor(
                            vendor.vendorType
                          )}`}
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
                      <p className="text-xs text-gray-500 mt-1">
                        {vendor.contactPersons.length} contact person(s)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {vendor.city}, {vendor.state}
                      </div>
                      <p className="text-sm text-gray-600">{vendor.pincode}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {vendor.branches.length} branch(es)
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {vendor.submittedBy}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(vendor.submittedDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleApprovalClick(vendor, "approve")}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprovalClick(vendor, "reject")}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && !showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Vendor Registration Details
              </h3>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {/* Business Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Business Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Business Name
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedVendor.businessName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Vendor Category
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVendorCategoryColor(
                          selectedVendor.vendorCategory
                        )}`}
                      >
                        {selectedVendor.vendorCategory}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Vendor Type
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVendorTypeColor(
                          selectedVendor.vendorType
                        )}`}
                      >
                        {selectedVendor.vendorType}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contact Number
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedVendor.contactNo}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedVendor.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedVendor.city}, {selectedVendor.state} -{" "}
                        {selectedVendor.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Bank Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        PAN Number
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedVendor.panNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        GST Number
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedVendor.gstNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Bank Name
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedVendor.bankName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Persons */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Contact Persons
                  </h4>
                  <div className="space-y-3">
                    {selectedVendor.contactPersons.map(
                      (person: any, index: number) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                Name
                              </label>
                              <p className="text-sm text-gray-900">
                                {person.name}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                Phone
                              </label>
                              <p className="text-sm text-gray-900">
                                {person.phone}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                Email
                              </label>
                              <p className="text-sm text-gray-900">
                                {person.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Branches */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Branch Information
                  </h4>
                  <div className="space-y-4">
                    {selectedVendor.branches.map(
                      (branch: any, index: number) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h5 className="text-sm font-medium text-gray-900 mb-2">
                            {branch.branchName}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                Contact Number
                              </label>
                              <p className="text-sm text-gray-900">
                                {branch.contactNumber}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                Email
                              </label>
                              <p className="text-sm text-gray-900">
                                {branch.email}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                City
                              </label>
                              <p className="text-sm text-gray-900">
                                {branch.city}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">
                                State
                              </label>
                              <p className="text-sm text-gray-900">
                                {branch.state}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Uploaded Files */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Uploaded Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedVendor.uploadedFiles.map(
                      (file: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center p-3 border border-gray-200 rounded-lg"
                        >
                          <FileText className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedVendor(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleApprovalClick(selectedVendor, "reject")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprovalClick(selectedVendor, "approve")}
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
                      ? "Approve this vendor registration?"
                      : "Reject this vendor registration?"}
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
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  actionType === "approve"
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
