import React from "react";
import { useState, useEffect } from "react";
import { useCRM } from "../../../context/CRMContext";

import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Phone,
  Mail,
  Globe,
  FileText,
  CreditCard,
  SquarePen,
  Trash2,
  Power,
  Image, FileSpreadsheet, File, Download, FileCheck
} from "lucide-react";
import axios from "axios";
import AddCustomerModal from "./AddCustomerModal";


interface CustomerDetailsProps {
  customer: any;
  setCustomerInitialData: (data: any) => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  setCustomerInitialData,
}) => {
  const { hasActionAccess, userData } = useCRM();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mappedApiData, setMappedApiData] = useState<any>({
    ...customer,
    panNumber: "ABCDE1234F",
    gstNumber: "27ABCDE1234F1Z5",
    bankName: "State Bank of India",
    bankAccountNumber: "1234567890123456",
    ifscCode: "SBIN0001234",
    contactPersons: [
      {
        name: "Amit Sharma",
        phone: "+91 98765 43211",
        email: "amit@company.in",
        designation: "CEO",
      },
      {
        name: "Priya Patel",
        phone: "+91 98765 43212",
        email: "priya@company.in",
        designation: "CTO",
      },
    ],
    branches: [
      {
        branchName: "Mumbai Head Office",
        contactNumber: "+91 98765 43210",
        email: "mumbai@company.in",
        address: "Andheri East, Mumbai, Maharashtra - 400069",
        contactPersons: [
          {
            name: "Rajesh Kumar",
            phone: "+91 98765 43213",
            email: "rajesh@company.in",
          },
        ],
      },
      {
        branchName: "Pune Branch",
        contactNumber: "+91 98765 43214",
        email: "pune@company.in",
        address: "Hinjewadi, Pune, Maharashtra - 411057",
        contactPersons: [
          {
            name: "Sneha Gupta",
            phone: "+91 98765 43215",
            email: "sneha@company.in",
          },
        ],
      },
    ],
    uploadedFiles: [
      {
        name: "Business_Registration.pdf",
        size: "2.4 MB",
        uploadDate: "2024-01-15",
      },
      { name: "GST_Certificate.pdf", size: "1.8 MB", uploadDate: "2024-01-15" },
      { name: "PAN_Card.jpg", size: "0.5 MB", uploadDate: "2024-01-15" },
    ],
  });

  const transformToFormData = (customer: any) => {
    return {
      businessName: customer.name || "",
      contactNo: customer.phone || "",
      email: customer.email || "",
      country: customer.country || "India",
      currency: customer.currency || "INR",
      state: customer.state || "",
      district: customer.district || "",
      city: customer.city || "",
      customerType: customer.type || "",
      customerPotential: customer.potential || "",
      pincode: customer.pincode || "",
      active: customer.status === "active",
      panNumber: customer.panNumber || "",
      tanNumber: customer.tanNumber || "",
      gstNumber: customer.gstNumber || "",
      bankName: customer.bankName || "",
      bankAccountNumber: customer.bankAccountNumber || "",
      branchName: customer.branchName || "",
      ifscCode: customer.ifscCode || "",
      contactPersons: customer.contactPersons || [],
      branches: customer.branches || [],
      uploadedFiles: customer.uploadedFiles || [],
    };
  };

  useEffect(() => {
    if (customer?.id) {
      console.log("Fetching customer details for ID:", customer);
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/customer/${customer.id}`)
        .then((response) => {
          console.log("Fetched customer details:", response.data.data);
          const apiData = response.data.data;
          const mappedEnhancedCustomer = {
            businessName: apiData.business_name || "",
            contactNo: apiData.contact_number || "",
            email: apiData.email || "",
            country: apiData.country || "",
            currency: typeof apiData.currency === 'string' 
              ? apiData.currency.replace(/["{}\[\]]/g, '').split(',').map((c: string) => c.trim())
              : [],
            state: apiData.state || "",
            district: apiData.district || "",
            city: apiData.city || "",
            customerType: apiData.customer_type || "",
            customerPotential: apiData.customer_potential || "",
            pincode: apiData.pincode || "",
            active: apiData.active || "",
            panNumber: apiData.pan_number || "",
            tanNumber: apiData.tan_number || "",
            gstNumber: apiData.gst_number || "",
            bankName: apiData.bank_name || "",
            bankAccountNumber: apiData.bank_account_number || "",
            branchName: apiData.branch_name || "",
            ifscCode: apiData.ifsc_code || "",
            contactPersons:
              apiData.contactpersons?.map((person: any) => ({
                id: person.contactId,
                name: person.name,
                phone: person.phone,
                email: person.email,
                designation: person.designation,
              })) || [],
            branches:
              apiData.branches?.map((branch: any) => ({
                id: branch.branchId,
                branchName: branch.branchName,
                contactNumber: branch.contactNumber,
                email: branch.emailId,
                country: branch.country || "India",
                currency: typeof branch.currency === 'string'
                  ? branch.currency.replace(/["{}\[\]]/g, '').split(',').map((c: string) => c.trim())
                  : [],
                state: branch.state || "",
                district: branch.district || "",
                city: branch.city || "",
                pincode: branch.pincode || "",
                address: `${branch.city}, ${branch.district}, ${branch.state} - ${branch.pincode}`,
                gstNumber: branch.gstNumber || "",
                contactPersons:
                  branch.contactPersons?.map((person: any) => ({
                    id: person.contactId,
                    name: person.name,
                    phone: person.phone,
                    email: person.email,
                  })) || [],
              })) || [],
            uploadedFiles:
              apiData.uploadedfiles || customer.uploadedFiles || [],
          };
          console.log("Mapped enhanced customer:", mappedEnhancedCustomer);
          setMappedApiData(mappedEnhancedCustomer);
          setCustomerInitialData({ ...customer, ...mappedEnhancedCustomer });
        })
        .catch((error) => {
          console.error("Error fetching customer details:", error);
        });
    }
  }, [customer?.id, refreshTrigger]);

  useEffect(() => {
    console.log("API Data:", mappedApiData);
  });

  // Mock enhanced customer data
  const enhancedCustomer = {
    ...customer,
    panNumber: "ABCDE1234F",
    gstNumber: "27ABCDE1234F1Z5",
    bankName: "State Bank of India",
    bankAccountNumber: "1234567890123456",
    ifscCode: "SBIN0001234",
    contactPersons: [
      {
        name: "Amit Sharma",
        phone: "+91 98765 43211",
        email: "amit@company.in",
        designation: "CEO",
      },
      {
        name: "Priya Patel",
        phone: "+91 98765 43212",
        email: "priya@company.in",
        designation: "CTO",
      },
    ],
    branches: [
      {
        branchName: "Mumbai Head Office",
        contactNumber: "+91 98765 43210",
        email: "mumbai@company.in",
        address: "Andheri East, Mumbai, Maharashtra - 400069",
        contactPersons: [
          {
            name: "Rajesh Kumar",
            phone: "+91 98765 43213",
            email: "rajesh@company.in",
          },
        ],
      },
      {
        branchName: "Pune Branch",
        contactNumber: "+91 98765 43214",
        email: "pune@company.in",
        address: "Hinjewadi, Pune, Maharashtra - 411057",
        contactPersons: [
          {
            name: "Sneha Gupta",
            phone: "+91 98765 43215",
            email: "sneha@company.in",
          },
        ],
      },
    ],
    uploadedFiles: [
      {
        name: "Business_Registration.pdf",
        size: "2.4 MB",
        uploadDate: "2024-01-15",
      },
      { name: "GST_Certificate.pdf", size: "1.8 MB", uploadDate: "2024-01-15" },
      { name: "PAN_Card.jpg", size: "0.5 MB", uploadDate: "2024-01-15" },
    ],
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "revisit":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", name: "General Information", icon: Building2 },
    { id: "branches", name: "Branch Information", icon: MapPin },
    { id: "documents", name: "Documents", icon: FileText },
  ];

  if (!customer) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <Building2 className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a customer</h3>
          <p className="text-sm">
            Choose a customer from the list to view their details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Customer Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">
                {customer.avatar}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {customer.name}
              </h2>
              <div>
                <p className="text-sm text-gray-600">{customer.industry}</p>
                <p className="text-sm font-bold text-blue-600">
                  Customer : {customer.customerNumber || "-"}
                </p>
              </div>
              {/* <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                  customer.status
                )}`}
              >
                {customer.status}
              </span> */}
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-1 w-full md:w-auto">
            <div className="flex flex-col items-end">
              <div className={`text-2xl font-bold px-6 py-1 rounded-full text-green-600 capitalize ${getStatusColor(customer.status)}`}>
                {customer.status}
              </div>
              {/* <p className="text-xs text-gray-500">Total Revenue</p> */}
            </div>
            <div className="flex items-center gap-2 mt-1">
              { hasActionAccess('edit', 'All customers', 'customers') && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                  title="Edit Customer"
                >
                  <SquarePen className="h-5 w-5" /> {((customer.status === "approved" || customer.status === "revisit")) && "EDIT after approval"}
                </button>
              )}
              {(customer.status === "pending" || customer.status === "draft") && hasActionAccess('Deactivate', 'All customers', 'customers') && (
                <button
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition"
                  title="Deactivate Customer"
                >
                  <Power className="h-5 w-5" />
                </button>
              )}
              {/* {customer.status === "pending" && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete Customer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "general" && (
          <div className="space-y-8">
            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.industry}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Customer Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(customer.joinDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                     {customer.contactNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total Leads</p>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.dealCount} leads
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.panNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.gstNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.bankName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.bankAccountNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.ifscCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Persons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Persons
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mappedApiData.contactPersons.map(
                  (person: any, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {person.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {person.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {person.designation}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {person.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {person.email}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {customer.revenue}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div> */}

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {customer.dealCount}
                </p>
                <p className="text-sm text-gray-500">Total Leads</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(customer.joinDate).getTime()) /
                    (1000 * 60 * 60 * 24 * 30)
                  )}
                </p>
                <p className="text-sm text-gray-500">Months Active</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "branches" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Branch Information
            </h3>

            {mappedApiData.branches.map((branch: any, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 mb-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {branch.branchName}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {branch.contactNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">
                        {branch.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">
                        {branch.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">GST Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {branch.gstNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">
                    Branch Contact Persons
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {branch.contactPersons.map(
                      (person: any, personIndex: number) => (
                        <div
                          key={personIndex}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {person.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {person.name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {person.phone}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Mail className="h-3 w-3 mr-1" />
                              {person.email}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Documents
            </h3>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mappedApiData.uploadedFiles?.map((file: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.original_name}
                      </p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Uploaded:{" "}
                      {new Date(file.created_at).toLocaleDateString("en-IN")}
                    </span>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(mappedApiData?.uploadedFiles ?? []).map((file : any) => {
                const Icon = getIconByMime(file.mime, file.original_name);
                const sizeLabel = formatBytes(file.size);

                return (
                  <a
                    key={file.id}
                    href={`${import.meta.env.VITE_API_BASE_URL}/customer-file/${file.customerId}/files/${file.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Icon className="h-8 w-8 text-blue-600 mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate" title={file.original_name}>
                        {file.original_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sizeLabel} • {file.mime ?? "unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.created_at ? new Date(file.created_at).toLocaleDateString("en-IN") : "-"}
                      </p>
                    </div>

                    <Download className="h-4 w-4 text-gray-400 ml-3" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Customer
              </h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold text-red-600">
                permanently delete
              </span>{" "}
              this customer? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  try {
                    await axios.delete(
                      `${import.meta.env.VITE_API_BASE_URL}/customer/${customer.id
                      }`
                    );
                    alert("Customer deleted successfully!");
                    setIsDeleteModalOpen(false);
                    // You might want to redirect or refresh the parent component here
                    // For example: navigate back to customer list or call a callback function
                  } catch (error) {
                    console.error("Error deleting customer:", error);
                    alert("Failed to delete customer. Please try again.");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <Power className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Deactivate Customer
              </h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold text-yellow-600">deactivate</span>{" "}
              this customer? You can reactivate them later.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setIsDeactivateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700"
                onClick={() => {
                  // TODO: Replace with actual deactivate logic
                  alert("Customer deactivated!");
                  setIsDeactivateModalOpen(false);
                }}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      <AddCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
        onSubmit={(updatedCustomerData) => {
          console.log("Updated Customer:", updatedCustomerData);
          setIsEditModalOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
        initialData={{ ...customer, ...mappedApiData }}
      />
    </div>
  );
};

export default CustomerDetails;
