import React from "react";
import { useState, useEffect } from "react";
import { useCRM } from "../../../context/CRMContext";

import {
  HardHat,
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
  Image, FileSpreadsheet, File, Download, FileCheck,
  User
} from "lucide-react";
import { getAssociateById } from "../../../utils/associateApi";
import AddAssociateModal from "./AddAssociateModal";


interface AssociateDetailsProps {
  associate: any;
  setAssociateInitialData: (data: any) => void;
}

const AssociateDetails: React.FC<AssociateDetailsProps> = ({
  associate,
  setAssociateInitialData,
}) => {
  const { hasActionAccess, userData } = useCRM();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mappedApiData, setMappedApiData] = useState<any>({
    ...associate,
    panNumber: "ABCDE1234F",
    gstNumber: "27ABCDE1234F1Z5",
    bankName: "State Bank of India",
    bankAccountNumber: "1234567890123456",
    ifscCode: "SBIN0001234",
    contactPersons: [],
    branches: [],
    uploadedFiles: [],
  });

  const transformToFormData = (associate: any) => {
    return {
      businessName: associate.name || "",
      contactNo: associate.phone || "",
      email: associate.email || "",
      country: associate.country || "India",
      currency: associate.currency || "INR",
      state: associate.state || "",
      district: associate.district || "",
      city: associate.city || "",
      associateType: associate.type || "",
      associatePotential: associate.potential || "",
      pincode: associate.pincode || "",
      active: associate.status === "active",
      panNumber: associate.panNumber || "",
      tanNumber: associate.tanNumber || "",
      gstNumber: associate.gstNumber || "",
      bankName: associate.bankName || "",
      bankAccountNumber: associate.bankAccountNumber || "",
      branchName: associate.branchName || "",
      ifscCode: associate.ifscCode || "",
      contactPersons: associate.contactPersons || [],
      branches: associate.branches || [],
      uploadedFiles: associate.uploadedFiles || [],
    };
  };

  useEffect(() => {
    if (associate?.id) {
      console.log("Fetching associate details for ID:", associate);
      getAssociateById(associate.id)
        .then((response) => {
          console.log("Fetched associate details:", response.data);
          const apiData = response.data;
          const mappedEnhancedAssociate = {
            businessName: apiData.business_name || "",
            contactNo: apiData.contact_number || "",
            email: apiData.email || "",
            country: apiData.country || "",
            currency: typeof apiData.currency === 'string'
              ? apiData.currency.replace(/["{}[\]]/g, '').split(',').map((c: string) => c.trim())
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
            associateGroup: apiData.associate_group || "",
            associateSubGroup: apiData.associate_sub_group || "",
            alternateNumber: apiData.alternate_number || "",
            associateClassification: apiData.associate_classification || "",
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
            associateCategory: apiData.associate_category || "",
            riskLevel: apiData.risk_level || "",
            creditDays: apiData.credit_days || "",
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
                  ? branch.currency.replace(/["{}[\]]/g, '').split(',').map((c: string) => c.trim())
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
            uploadedFiles:
              apiData.uploadedfiles || associate.uploadedFiles || [],
            complianceFiles: apiData.compliancefiles || [],
          };
          console.log("Mapped enhanced associate:", mappedEnhancedAssociate);
          setMappedApiData(mappedEnhancedAssociate);
          setAssociateInitialData({ ...associate, ...mappedEnhancedAssociate });
        })
        .catch((error) => {
          console.error("Error fetching associate details:", error);
        });
    }
  }, [associate?.id, refreshTrigger]);

  useEffect(() => {
    console.log("API Data:", mappedApiData);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
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
    // fallback
    return File;
  }

  // Helper function to render HO level compliance file
  const renderComplianceFile = (files: any[], documentType: string) => {
    const file = files?.find(f => f.documentType === documentType && f.entityLevel === 'HO');
    console.log("file", file);
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
        <Icon className="h-4 w-4 text-teal-600 mr-2" />
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
        <Icon className="h-4 w-4 text-teal-600 mr-2" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate" title={file.originalName}>{file.originalName}</p>
          <p className="text-gray-500">{sizeLabel}</p>
        </div>
        <Download className="h-3 w-3 text-gray-400 ml-2" />
      </a>
    );
  };

  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", name: "General Information", icon: HardHat },
    { id: "branches", name: "Branch Information", icon: MapPin },
    { id: "documents", name: "Documents", icon: FileText },
  ];

  if (!associate) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <HardHat className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select an associate</h3>
          <p className="text-sm">
            Choose an associate from the list to view their details
          </p>
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
            <div className="h-16 w-16 bg-teal-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">
                {associate.avatar}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {associate.name}
              </h2>
              <div>
                <p className="text-sm text-gray-600">{associate.industry}</p>
                <p className="text-sm font-bold text-teal-600">
                  Associate : {associate.associateNumber || "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-1 w-full md:w-auto">
            <div className="flex flex-col items-end">
              <div className={`text-2xl font-bold px-6 py-1 rounded-full text-green-600 capitalize ${getStatusColor(mappedApiData.status)}`}>
                {mappedApiData.status}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {hasActionAccess('edit', 'All associates', 'Associates') && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition"
                  title="Edit Associate"
                >
                  <SquarePen className="h-5 w-5" /> {((associate.status === "approved" || associate.status === "revisit")) && "EDIT after approval"}
                </button>
              )}
              {(associate.status === "pending" || associate.status === "draft") && hasActionAccess('Deactivate', 'All associates', 'Associates') && (
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
                ? "border-teal-500 text-teal-600"
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
                  <HardHat className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.businessName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <HardHat className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Associate Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.associateType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Associate Potential</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.associatePotential}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.contactNo}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Associate Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(associate.joinDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.district}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Pincode</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Details Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Compliance & Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.panNumber}
                    </p>
                    {renderComplianceFile(mappedApiData.complianceFiles, 'PAN')}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.gstNumber}
                    </p>
                    {renderComplianceFile(mappedApiData.complianceFiles, 'GST')}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">TAN Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.tanNumber || "-"}
                    </p>
                    {renderComplianceFile(mappedApiData.complianceFiles, 'TAN')}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.bankName}
                    </p>
                    {renderComplianceFile(mappedApiData.complianceFiles, 'BANK')}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.bankAccountNumber || "-"}
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
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <User className="h-5 w-5 text-teal-600" />
                        <h4 className="font-medium text-gray-900">{person.name}</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {person.phone}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {person.email}
                        </div>
                        {person.designation && (
                          <p className="text-gray-600">
                            <span className="font-medium">Designation:</span> {person.designation}
                          </p>
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
          <div className="space-y-6">
            {mappedApiData.branches && mappedApiData.branches.length > 0 ? (
              mappedApiData.branches.map((branch: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-teal-600" />
                      {branch.branchName}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="text-sm font-medium text-gray-900">
                          {branch.contactNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {branch.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {branch.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Branch Contact Persons */}
                  {branch.contactPersons && branch.contactPersons.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Branch Contact Persons</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {branch.contactPersons.map((person: any, pIndex: number) => (
                          <div key={pIndex} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-medium text-gray-900 text-sm">{person.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              <Phone className="h-3 w-3 inline mr-1" />
                              {person.phone}
                            </p>
                            <p className="text-xs text-gray-600">
                              <Mail className="h-3 w-3 inline mr-1" />
                              {person.email}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No branches registered</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            {mappedApiData.uploadedFiles && mappedApiData.uploadedFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mappedApiData.uploadedFiles.map((file: any, index: number) => {
                  const Icon = getIconByMime(file.mime, file.originalName);
                  const sizeLabel = formatBytes(file.size);

                  return (
                    <a
                      key={index}
                      href={`${import.meta.env.VITE_API_BASE_URL}/associate-file/${file.associateId}/files/${file.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Icon className="h-8 w-8 text-teal-600 mr-3" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <p className="text-xs text-gray-500">{sizeLabel}</p>
                      </div>
                      <Download className="h-4 w-4 text-gray-400 ml-2" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
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
            setIsEditModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
          }}
          initialData={mappedApiData}
        />
      )}
    </div>
  );
};

export default AssociateDetails;