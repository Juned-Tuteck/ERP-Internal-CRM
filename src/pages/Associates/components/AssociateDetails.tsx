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
  Image,
  FileSpreadsheet,
  File,
  Download,
  FileCheck,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getAssociateById } from "../../../utils/associateApi";
import AddAssociateModal from "./AddAssociateModal";

interface AssociateDetailsProps {
  associate: any;
  setAssociateInitialData: (data: any) => void;
  onAssociateUpdate?: () => void;
}

const AssociateDetails: React.FC<AssociateDetailsProps> = ({
  associate,
  setAssociateInitialData,
  onAssociateUpdate,
}) => {
  const { hasActionAccess, userData } = useCRM();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mappedApiData, setMappedApiData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());

  // Fetch associate details from API
  useEffect(() => {
    if (associate?.id) {
      console.log("Fetching associate details for ID:", associate.id, "refreshTrigger:", refreshTrigger);
      getAssociateById(associate.id)
        .then((response) => {
          console.log("Fetched associate details - Full Response:", response);
          console.log("Fetched associate details - Response Data:", response.data);
          const apiData = response.data;

          // Log branch data specifically
          if (apiData.branches) {
            console.log("Branch data from API:", apiData.branches);
          }

          const mappedEnhancedAssociate = {
            id: apiData.id || associate.id,
            Associate_id: apiData.Associate_id || apiData.id || associate.id,
            businessName: apiData.business_name || "",
            contactNo: apiData.contact_number || "",
            email: apiData.email || "",
            country: apiData.country || "",
            currency: typeof apiData.currency === 'string'
              ? apiData.currency.replace(/[\"{}[\]]/g, '').split(',').map((c: string) => c.trim())
              : [],
            state: apiData.state || "",
            district: apiData.district || "",
            city: apiData.city || "",
            associateType: apiData.associate_type || "",
            associatePotential: apiData.associate_potential || "",
            pincode: apiData.pincode || "",
            active: apiData.active || "",
            panNumber: apiData.pan_number || "",
            tanNumber: apiData.tan_number || "",
            gstNumber: apiData.gst_number || "",
            bankName: apiData.bank_name || "",
            bankAccountNumber: apiData.bank_account_number || "",
            branchName: apiData.branch_name || "",
            ifscCode: apiData.ifsc_code || "",
            status: apiData.approval_status || associate.status || "",
            associateGroup: apiData.customer_group || apiData.associate_group || "",
            associateSubGroup: apiData.customer_sub_group || apiData.associate_sub_group || "",
            alternateNumber: apiData.alternate_number || "",
            associateClassification: apiData.customer_classification || apiData.associate_classification || "",
            experience: apiData.experience || "",
            msmeRegistered: apiData.msme_registered || "",
            udyamRegistrationNumber: apiData.udyam_registration_number || "",
            tdsApplicability: apiData.tds_applicability || "",
            addressType: apiData.address_type || "",
            street: apiData.street || "",
            googleLocation: apiData.google_location || "",
            zone: apiData.zone || "",
            nameOfBranchProject: apiData.name_of_branch_project || "",
            hoContactNumber: apiData.ho_contact_number || "",
            hoEmailId: apiData.ho_email_id || "",
            currentStatus: apiData.current_status || "",
            blacklistReason: apiData.blacklist_reason || "",
            associateCategory: apiData.customer_category || apiData.associate_category || "",
            riskLevel: apiData.risk_level || "",
            creditDays: apiData.credit_days || "",
            createdAt: apiData.created_at || "",
            contactPersons:
              apiData.contactpersons?.map((person: any) => ({
                id: person.contactId,
                name: person.name,
                designation: person.designation,
                phone: person.phone,
                email: person.email,
                alternativeNumber: person.alternative_number,
                dateOfBirth: person.date_of_birth,
                anniversaryDate: person.anniversary_date,
                communicationMode: person.communication_mode,
              })) || [],
            branches:
              apiData.branches?.map((branch: any) => ({
                id: branch.branchId,
                branchName: branch.branchName,
                contactNumber: branch.contactNumber,
                email: branch.emailId,
                country: branch.country || "India",
                currency: typeof branch.currency === 'string'
                  ? branch.currency.replace(/[\"{}[\]]/g, '').split(',').map((c: string) => c.trim())
                  : [],
                state: branch.state || "",
                district: branch.district || "",
                city: branch.city || "",
                pincode: branch.pincode || "",
                address: `${branch.city}, ${branch.district}, ${branch.state} - ${branch.pincode}`,
                gstNumber: branch.gstNumber || "",
                panNumber: branch.panNumber || "",
                tanNumber: branch.tanNumber || "",
                bankName: branch.bankName || "",
                bankAccountNumber: branch.bankAccountNumber || "",
                ifscCode: branch.ifscCode || "",
                addressType: branch.addressType || "",
                street: branch.street || "",
                googleLocation: branch.google_location || "",
                zone: branch.zone || "",
                nameOfBranchProject: branch.name_of_branch_project || "",
                currentStatus: branch.current_status || "",
                blacklistReason: branch.blacklist_reason || "",
                associateCategory: branch.associate_category || "",
                riskLevel: branch.risk_level || "",
                creditDays: branch.credit_days || "",
                contactPersons:
                  branch.contactPersons?.map((person: any) => ({
                    id: person.contactId,
                    name: person.name,
                    designation: person.designation,
                    phone: person.phone,
                    email: person.email,
                    alternativeNumber: person.alternative_number,
                    dateOfBirth: person.date_of_birth,
                    anniversaryDate: person.anniversary_date,
                    communicationMode: person.communication_mode,
                  })) || [],
                complianceFiles: branch.complianceFiles || [],
              })) || [],
            uploadedFiles: apiData.uploadedfiles || associate.uploadedFiles || [],
            complianceFiles: apiData.compliancefiles || [],
          };
          console.log("Mapped enhanced associate:", mappedEnhancedAssociate);
          console.log("Mapped branches:", mappedEnhancedAssociate.branches);
          setMappedApiData(mappedEnhancedAssociate);
          setAssociateInitialData({ ...associate, ...mappedEnhancedAssociate });
        })
        .catch((error) => {
          console.error("Error fetching associate details:", error);
        });
    }
  }, [associate?.id, refreshTrigger]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "REVISIT":
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
    return File;
  }

  // Helper function to render HO level compliance file
  const renderComplianceFile = (files: any[], documentType: string) => {
    const file = files?.find(f => f.documentType === documentType && f.entityLevel === 'HO');
    if (!file) return null;

    const Icon = getIconByMime(file.mime, file.originalName);
    const sizeLabel = formatBytes(file.size);

    return (
      <a
        href={`${import.meta.env.VITE_API_BASE_URL}/associate-compliance-file/${file.associateId}/compliance-files/${file.id}/download`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs"
      >
        <Icon className="h-4 w-4 text-blue-600 mr-2" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate" title={file.originalName}>{file.originalName}</p>
          <p className="text-gray-500">{sizeLabel}</p>
        </div>
        <Download className="h-3 w-3 text-gray-400 ml-2" />
      </a>
    );
  };

  // Helper function to render branch level compliance file
  const renderBranchComplianceFile = (files: any[], documentType: string) => {
    const file = files?.find(f => f.documentType === documentType && f.entityLevel === 'BRANCH');
    if (!file) return null;

    const Icon = getIconByMime(file.mime, file.originalName);
    const sizeLabel = formatBytes(file.size);

    return (
      <a
        href={`${import.meta.env.VITE_API_BASE_URL}/associate-compliance-file/${file.associateId}/compliance-files/${file.id}/download`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs"
      >
        <Icon className="h-4 w-4 text-blue-600 mr-2" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate" title={file.originalName}>{file.originalName}</p>
          <p className="text-gray-500">{sizeLabel}</p>
        </div>
        <Download className="h-3 w-3 text-gray-400 ml-2" />
      </a>
    );
  };

  const toggleBranch = (branchId: string) => {
    setExpandedBranches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(branchId)) {
        newSet.delete(branchId);
      } else {
        newSet.add(branchId);
      }
      return newSet;
    });
  };

  const tabs = [
    { id: "general", name: "General Information", icon: Building2 },
    { id: "branches", name: "Branch Information", icon: MapPin },
    { id: "documents", name: "Documents", icon: FileText },
  ];

  if (!associate) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <Building2 className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select an associate</h3>
          <p className="text-sm">
            Choose an associate from the list to view their details
          </p>
        </div>
      </div>
    );
  }

  if (!mappedApiData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <Building2 className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium">Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Associate Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">
                {associate.avatar}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {mappedApiData.businessName}
              </h2>
              <div>
                <p className="text-sm text-gray-600">{mappedApiData.associateType}</p>
                <p className="text-sm font-bold text-blue-600">
                  Associate: {associate.associateNumber || "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-1 w-full md:w-auto">
            <div className="flex flex-col items-end">
              <div className={`text-2xl font-bold px-6 py-1 rounded-full capitalize ${getStatusColor(mappedApiData.status)}`}>
                {mappedApiData.status}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {hasActionAccess('edit', 'All Associates', 'Associates') && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                  title="Edit Associate"
                >
                  <SquarePen className="h-5 w-5" />
                </button>
              )}
              {(mappedApiData.status === "PENDING" || mappedApiData.status === "draft") && hasActionAccess('Deactivate', 'All Associates', 'Associates') && (
                <button
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition"
                  title="Deactivate Associate"
                >
                  <Power className="h-5 w-5" />
                </button>
              )}
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
            {/* Basic Details Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.businessName || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Associate Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.associateType || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Associate Group</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.associateGroup || "-"}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Associate Sub Group</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.associateSubGroup || "-"}
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Associate Classification</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.associateClassification || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">MSME Registered</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.msmeRegistered || "-"}
                    </p>
                  </div>
                </div>

                {mappedApiData.msmeRegistered === "Yes" && (
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Udyam Registration Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {mappedApiData.udyamRegistrationNumber || "-"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Associate Potential</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.associatePotential || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.experience ? `${mappedApiData.experience} years` : "-"}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">TDS Applicability</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.tdsApplicability || "-"}
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.currentStatus || "-"}
                    </p>
                  </div>
                </div>

                {mappedApiData.createdAt && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Associate Since</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(mappedApiData.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Information Fields */}
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Primary Contact</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.contactNo || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Alternate Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.alternateNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="text-sm font-medium text-gray-900">
                      {Array.isArray(mappedApiData.currency)
                        ? mappedApiData.currency.join(", ")
                        : mappedApiData.currency || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Billing Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.addressType || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Name of Branch / Project</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.nameOfBranchProject || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.hoContactNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email ID</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.hoEmailId || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.country || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Zone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.zone || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.state || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.district || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.city || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Pincode</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.pincode || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Street</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.street || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Google Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.googleLocation || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Associate Category</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.associateCategory || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Risk Level</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.riskLevel || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Credit Days</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.creditDays ? `${mappedApiData.creditDays} days` : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>



            {/* Compliance Documents Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Compliance Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAN Card
                  </label>
                  {renderComplianceFile(mappedApiData.complianceFiles || [], 'PAN')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TAN Document
                  </label>
                  {renderComplianceFile(mappedApiData.complianceFiles || [], 'TAN')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Certificate
                  </label>
                  {renderComplianceFile(mappedApiData.complianceFiles || [], 'GST')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Document
                  </label>
                  {renderComplianceFile(mappedApiData.complianceFiles || [], 'BANK')}
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.panNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">TAN Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.tanNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.gstNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.bankName || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Bank Account Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.bankAccountNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Branch Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.branchName || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.ifscCode || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Persons Section */}
            {mappedApiData.contactPersons && mappedApiData.contactPersons.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Contact Persons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mappedApiData.contactPersons.map((person: any, index: number) => (
                    <div key={person.id || index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">{person.name}</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Designation:</span>
                          <span className="text-gray-900 font-medium">{person.designation || "-"}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Phone:</span>
                          <span className="text-gray-900 font-medium">{person.phone || "-"}</span>
                        </div>
                        {person.alternativeNumber && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Alt. Phone:</span>
                            <span className="text-gray-900 font-medium">{person.alternativeNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Email:</span>
                          <span className="text-gray-900 font-medium">{person.email || "-"}</span>
                        </div>
                        {person.dateOfBirth && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">DOB:</span>
                            <span className="text-gray-900 font-medium">
                              {new Date(person.dateOfBirth).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        )}
                        {person.anniversaryDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Anniversary:</span>
                            <span className="text-gray-900 font-medium">
                              {new Date(person.anniversaryDate).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        )}
                        {person.communicationMode && person.communicationMode.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-600">Communication:</span>
                            <div className="flex flex-wrap gap-1">
                              {person.communicationMode.map((mode: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                  {mode}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "branches" && (
          <div className="space-y-4">
            {mappedApiData.branches && mappedApiData.branches.length > 0 ? (
              mappedApiData.branches.map((branch: any) => (
                <div key={branch.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Branch Header */}
                  <div
                    className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => toggleBranch(branch.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <MapPin className="h-6 w-6 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{branch.nameOfBranchProject}</h4>
                          <p className="text-sm text-gray-600">{branch.address}</p>
                        </div>
                      </div>
                      {expandedBranches.has(branch.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Branch Details (Expandable) */}
                  {expandedBranches.has(branch.id) && (
                    <div className="p-6 space-y-6">
                      {/* Address Information */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">
                          Address Information
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Address Type</p>
                              <p className="text-sm font-medium text-gray-900">{branch.addressType || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Contact Number</p>
                              <p className="text-sm font-medium text-gray-900">{branch.contactNumber || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm font-medium text-gray-900">{branch.email || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Street</p>
                              <p className="text-sm font-medium text-gray-900">{branch.street || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">City</p>
                              <p className="text-sm font-medium text-gray-900">{branch.city || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">State</p>
                              <p className="text-sm font-medium text-gray-900">{branch.state || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Pincode</p>
                              <p className="text-sm font-medium text-gray-900">{branch.pincode || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Zone</p>
                              <p className="text-sm font-medium text-gray-900">{branch.zone || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Globe className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Country</p>
                              <p className="text-sm font-medium text-gray-900">{branch.country || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Currency</p>
                              <p className="text-sm font-medium text-gray-900">
                                {Array.isArray(branch.currency) ? branch.currency.join(", ") : branch.currency || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Risk Level</p>
                              <p className="text-sm font-medium text-gray-900">{branch.riskLevel || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Credit Days</p>
                              <p className="text-sm font-medium text-gray-900">
                                {branch.creditDays ? `${branch.creditDays} days` : "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Branch Compliance Documents */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">
                          Compliance Documents
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">PAN Card</label>
                            {renderBranchComplianceFile(branch.complianceFiles || [], 'PAN')}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">TAN Document</label>
                            {renderBranchComplianceFile(branch.complianceFiles || [], 'TAN')}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">GST Certificate</label>
                            {renderBranchComplianceFile(branch.complianceFiles || [], 'GST')}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bank Document</label>
                            {renderBranchComplianceFile(branch.complianceFiles || [], 'BANK')}
                          </div>
                        </div>
                      </div>

                      {/* Branch Financial Info */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">
                          Financial Information
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-start space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">PAN Number</p>
                              <p className="text-sm font-medium text-gray-900">{branch.panNumber || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">TAN Number</p>
                              <p className="text-sm font-medium text-gray-900">{branch.tanNumber || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">GST Number</p>
                              <p className="text-sm font-medium text-gray-900">{branch.gstNumber || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Bank Name</p>
                              <p className="text-sm font-medium text-gray-900">{branch.bankName || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Account Number</p>
                              <p className="text-sm font-medium text-gray-900">{branch.bankAccountNumber || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">IFSC Code</p>
                              <p className="text-sm font-medium text-gray-900">{branch.ifscCode || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Branch Name</p>
                              <p className="text-sm font-medium text-gray-900">{branch.branchName || "-"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Branch Contact Persons */}
                      {branch.contactPersons && branch.contactPersons.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">
                            Contact Persons
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {branch.contactPersons.map((person: any, idx: number) => (
                              <div key={person.id || idx} className="border border-gray-200 rounded p-3 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <h6 className="font-semibold text-sm text-gray-900">{person.name}</h6>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center space-x-2">
                                    <Building2 className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600">Designation:</span>
                                    <span className="text-gray-900 font-medium">{person.designation || "-"}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="text-gray-900 font-medium">{person.phone || "-"}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600">Email:</span>
                                    <span className="text-gray-900 font-medium">{person.email || "-"}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No branches found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-4">
            {mappedApiData.uploadedFiles && mappedApiData.uploadedFiles.length > 0 ? (
              mappedApiData.uploadedFiles.map((file: any) => {
                const Icon = getIconByMime(file.mime, file.original_name);
                return (
                  <a
                    key={file.id}
                    href={`${import.meta.env.VITE_API_BASE_URL}/associate-file/${mappedApiData.id}/files/${file.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Icon className="h-8 w-8 text-blue-600 mr-4" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{file.original_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatBytes(file.size)}</span>
                        {file.created_at && (
                          <span>
                            Uploaded: {new Date(file.created_at).toLocaleDateString("en-IN")}
                          </span>
                        )}
                        {file.created_by_name && (
                          <span>By: {file.created_by_name}</span>
                        )}
                      </div>
                    </div>
                    <Download className="h-5 w-5 text-gray-400 ml-4" />
                  </a>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No documents uploaded</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <AddAssociateModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(data) => {
            console.log("Updated associate:", data);
            // Trigger refresh first to fetch updated data
            setRefreshTrigger(prev => prev + 1);
            // Notify parent component about the update
            onAssociateUpdate?.();
            // Close modal after triggering refresh
            setIsEditModalOpen(false);
          }}
          onDataChange={() => {
            // Trigger refresh when data changes (e.g., branch save)
            console.log("Branch data changed, triggering refresh");
            setRefreshTrigger(prev => prev + 1);
          }}
          initialData={mappedApiData}
        />
      )}
    </div>
  );
};

export default AssociateDetails;