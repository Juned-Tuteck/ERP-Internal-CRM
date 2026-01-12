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
  Image, FileSpreadsheet, File, Download, FileCheck,
  User,
  ChevronDown
} from "lucide-react";
import axios from "axios";
import AddCompetitorModal from "./AddCompetitorModal";
import { zoneApi, stateApi, districtApi } from '../../../utils/leadZoneStateDistrictApi';


interface CompetitorDetailsProps {
  Competitor: any;
  setCompetitorInitialData: (data: any) => void;
}

const CompetitorDetails: React.FC<CompetitorDetailsProps> = ({
  Competitor,
  setCompetitorInitialData,
}) => {
  const { hasActionAccess, userData } = useCRM();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedBranches, setExpandedBranches] = useState<number[]>([]);

  // Location lookup data
  const [zones, setZones] = useState<Array<{ id: string; name: string }>>([]);
  const [states, setStates] = useState<Array<{ id: string; name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ id: string; name: string }>>([]);

  const [mappedApiData, setMappedApiData] = useState<any>({
    ...Competitor,
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

  // Fetch zones, states, and districts on component mount
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const [zonesData, statesData, districtsData] = await Promise.all([
          zoneApi.getAll(),
          stateApi.getAll(),
          districtApi.getAll()
        ]);
        setZones(zonesData || []);
        setStates(statesData || []);
        setDistricts(districtsData || []);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchLocationData();
  }, []);

  useEffect(() => {
    if (Competitor?.id && zones.length > 0 && states.length > 0 && districts.length > 0) {
      console.log("Fetching Competitor details for ID:", Competitor);
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/Competitor/${Competitor.id}`)
        .then((response) => {
          console.log("Fetched Competitor details:", response.data.data);
          const apiData = response.data.data;

          // Helper function to resolve UUID to name
          const getZoneName = (zoneId: string) => zones.find(z => z.id === zoneId)?.name || "";
          const getStateName = (stateId: string) => states.find(s => s.id === stateId)?.name || "";
          const getDistrictName = (districtId: string) => districts.find(d => d.id === districtId)?.name || "";

          const mappedEnhancedCompetitor = {
            businessName: apiData.company_name || "",
            contactNo: apiData.contact_number || "",
            email: apiData.email_id || "",
            country: apiData.country || "",
            currency: apiData.currency,
            state: apiData.state_id || "",
            stateName: getStateName(apiData.state_id || ""),
            district: apiData.district_id || "",
            districtName: getDistrictName(apiData.district_id || ""),
            city: apiData.city || "",
            CompetitorType: apiData.industry_type || "",
            CompetitorPotential: apiData.associate_potential || "",
            pincode: apiData.pincode || "",
            active: apiData.active || "",
            panNumber: apiData.pan_number || "",
            tanNumber: apiData.tan_number || "",
            gstNumber: apiData.gst_number || "",
            bankName: apiData.bank_name || "",
            bankAccountNumber: apiData.bank_account_no || "",
            branchName: apiData.bank_branch_name || "",
            ifscCode: apiData.ifsc_code || "",
            status: apiData.approval_status || Competitor.status || "",
            CompetitorGroup: apiData.competitor_group || "",
            CompetitorSubGroup: apiData.competitor_sub_group || "",
            alternateNumber: apiData.alternate_number || "",
            CompetitorClassification: apiData.competitor_classification || "",
            msmeRegistered: apiData.msme_status ? "Yes" : "No",
            udyamRegistrationNumber: apiData.udyam_registration_number || "",
            experienceYears: apiData.experience_years || "",
            addressType: apiData.address_type || "",
            street: apiData.street || "",
            googleLocation: apiData.location || "",
            zone: apiData.zone_id || "",
            zoneName: getZoneName(apiData.zone_id || ""),
            nameOfBranchProject: apiData.branch_project_name || "",
            hoContactNumber: apiData.ho_contact_number || "",
            hoEmailId: apiData.ho_email_id || "",
            currentStatus: apiData.current_status || "",
            blacklistReason: apiData.blacklist_reason || "",
            CompetitorCategory: apiData.commission_percentage || "",
            riskLevel: apiData.risk_level || "",
            creditDays: apiData.credit_days || "",
            contactPersons:
              apiData.contactpersons?.map((person: any) => ({
                id: person.contactId,
                name: person.fullName,
                designation: person.designation,
                phone: person.contactNumber,
                email: person.emailId,
                alternativeNumber: person.alternateNumber,
                dateOfBirth: person.dateOfBirth,
                anniversaryDate: person.anniversaryDate,
                communicationMode: person.communication_mode || [],
              })) || [],
            branches:
              apiData.branches?.map((branch: any) => ({
                id: branch.branchId,
                nameOfBranchProject: branch.branchProjectName || "",
                contactNumber: branch.contactNumber,
                email: branch.emailId,
                country: branch.country || "India",
                currency: branch.currency,
                state: branch.stateId || "",
                stateName: getStateName(branch.stateId || ""),
                district: branch.districtId || "",
                districtName: getDistrictName(branch.districtId || ""),
                city: branch.city || "",
                pincode: branch.pincode || "",
                address: `${branch.city}, ${branch.district}, ${branch.state} - ${branch.pincode}`,
                gstNumber: branch.gstNumber || "",
                panNumber: branch.panNumber || "",
                tanNumber: branch.tanNumber || "",
                bankName: branch.bankName || "",
                branchName: branch.bankBranchName,
                bankAccountNumber: branch.bankAccountNo || "",
                ifscCode: branch.ifscCode || "",
                addressType: branch.addressType || "",
                street: branch.street || "",
                googleLocation: branch.location || "",
                zone: branch.zoneId || "",
                zoneName: getZoneName(branch.zoneId || ""),
                currentStatus: branch.currentStatus || "",
                blacklistReason: branch.blacklist_reason || "",
                CompetitorCategory: branch.Competitor_category || "",
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
              apiData.uploadedfiles || Competitor.uploadedFiles || [],
            complianceFiles: apiData.compliancefiles || [],
          };
          console.log("Mapped enhanced Competitor:", mappedEnhancedCompetitor);
          setMappedApiData(mappedEnhancedCompetitor);

          // For edit mode, pass name fields instead of UUIDs so dropdowns can pre-fill
          const editModeData = {
            ...Competitor,
            ...mappedEnhancedCompetitor,
            // Replace UUID fields with name fields for dropdowns
            zone: mappedEnhancedCompetitor.zoneName || "",
            state: mappedEnhancedCompetitor.stateName || "",
            district: mappedEnhancedCompetitor.districtName || "",
            // Update branches to use name fields
            branches: mappedEnhancedCompetitor.branches?.map((branch: any) => ({
              ...branch,
              zone: branch.zoneName || "",
              state: branch.stateName || "",
              district: branch.districtName || "",
            })) || [],
          };
          setCompetitorInitialData(editModeData);
        })
        .catch((error) => {
          console.error("Error fetching Competitor details:", error);
        });
    }
  }, [Competitor?.id, refreshTrigger, zones, states, districts]);

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
        href={`${import.meta.env.VITE_API_BASE_URL}/Competitor-compliance-file/${file.competitorId}/compliance-files/${file.id}/download`}
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
        href={`${import.meta.env.VITE_API_BASE_URL}/Competitor-compliance-file/${file.CompetitorId}/compliance-files/${file.id}/download`}
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

  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", name: "General Information", icon: Building2 },
    { id: "branches", name: "Branch Information", icon: MapPin },
    { id: "documents", name: "Documents", icon: FileText },
  ];

  if (!Competitor) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400">
          <Building2 className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Select a Competitor</h3>
          <p className="text-sm">
            Choose a Competitor from the list to view their details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Competitor Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">
                {Competitor.avatar}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {Competitor.name}
              </h2>
              <div>
                <p className="text-sm text-gray-600">{Competitor.industry}</p>
                <p className="text-sm font-bold text-blue-600">
                  Competitor : {Competitor.CompetitorNumber || "-"}
                </p>
              </div>
              {/* <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                  Competitor.status
                )}`}
              >
                {Competitor.status}
              </span> */}
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-1 w-full md:w-auto">
            <div className="flex flex-col items-end">
              <div className={`text-2xl font-bold px-6 py-1 rounded-full text-green-600 capitalize ${getStatusColor(mappedApiData.status)}`}>
                {mappedApiData.status}
              </div>
              {/* <p className="text-xs text-gray-500">Total Revenue</p> */}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {hasActionAccess('Edit', 'All competitors', 'competitors') && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                  title="Edit Competitor"
                >
                  <SquarePen className="h-5 w-5" /> {((Competitor.status === "approved" || Competitor.status === "revisit")) && "EDIT after approval"}
                </button>
              )}
              {(Competitor.status === "pending" || Competitor.status === "draft") && hasActionAccess('Deactivate', 'All Competitors', 'Competitors') && (
                <button
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition"
                  title="Deactivate Competitor"
                >
                  <Power className="h-5 w-5" />
                </button>
              )}
              {/* {Competitor.status === "pending" && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete Competitor"
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
                      {mappedApiData.businessName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Competitor Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.CompetitorType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Competitor Group</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.CompetitorGroup}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Competitor Sub Group</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.CompetitorSubGroup}
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Competitor Classification</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.CompetitorClassification}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">MSME Registered</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.msmeRegistered}
                    </p>
                  </div>
                </div>

                {mappedApiData.msmeRegistered === "Yes" && (
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Udyam Registration Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {mappedApiData.udyamRegistrationNumber}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Competitor Potential</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.CompetitorPotential}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">TDS Applicability</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.tdsApplicability}
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.currentStatus}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Competitor Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(Competitor.joinDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Total Leads</p>
                    <p className="text-sm font-medium text-gray-900">
                      {Competitor.dealCount} leads
                    </p>
                  </div>
                </div> */}
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
                      {mappedApiData.addressType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Name of Branch / Project</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.nameOfBranchProject}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.hoContactNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email ID</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.hoEmailId}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.country}
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Zone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.zoneName || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.stateName || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.districtName || "-"}
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

                <div className="flex items-start space-x-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Street</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.street}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Google Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.googleLocation}
                    </p>
                  </div>
                </div>
                {/* 
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Competitor Category</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.CompetitorCategory}
                    </p>
                  </div>
                </div> */}

                {/* <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Risk Level</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.riskLevel}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Credit Days</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.creditDays}
                    </p>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Compliance Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Compliance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.gstNumber}
                    </p>
                    {/* GST File Display */}
                    {renderComplianceFile(mappedApiData.complianceFiles, 'GST')}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.panNumber}
                    </p>
                    {/* PAN File Display */}
                    {renderComplianceFile(mappedApiData.complianceFiles, 'PAN')}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">TAN Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.tanNumber}
                    </p>
                    {/* TAN File Display */}
                    {renderComplianceFile(mappedApiData.complianceFiles, 'TAN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Branch Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.branchName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.bankName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.bankAccountNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mappedApiData.ifscCode}
                    </p>
                  </div>
                </div>

                {/* Bank Document Display */}
                <div className="md:col-span-3">
                  <p className="text-sm text-gray-500 mb-2">Bank Documents</p>
                  {renderComplianceFile(mappedApiData.complianceFiles, 'BANK')}
                </div>
              </div>
            </div>

            {/* Contact Persons Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
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
              {/* Stats removed as per user request */}
            </div>
          </div>
        )
        }

        {
          activeTab === "branches" && (
            <div className="space-y-6">
              {mappedApiData.branches.map((branch: any, index: number) => {
                const isExpanded = expandedBranches.includes(index);
                const toggleBranch = () => {
                  setExpandedBranches(prev =>
                    prev.includes(index)
                      ? prev.filter(i => i !== index)
                      : [...prev, index]
                  );
                };

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Branch Header - Clickable */}
                    <div
                      className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b"
                      onClick={toggleBranch}
                    >
                      <h3 className="text-xl font-semibold text-gray-900">
                        {branch.nameOfBranchProject}
                      </h3>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''
                          }`}
                      />
                    </div>

                    {/* Collapsible Content */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <div className="p-6 space-y-6">
                        {/* Billing Address Section */}
                        <div className="border border-gray-200 rounded-lg p-6 space-y-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                            Billing Address
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Address Type</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.addressType}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Name of Branch / Project</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.nameOfBranchProject}
                                </p>
                              </div>
                            </div>

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
                                <p className="text-sm text-gray-500">Email ID</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Country</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.country}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Zone</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.zoneName || "-"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">State</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.stateName || "-"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">District</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.districtName || "-"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">City</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.city}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Pincode</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.pincode}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3 md:col-span-2">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Street</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.street}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Google Location</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.googleLocation}
                                </p>
                              </div>
                            </div>

                            {/* <div className="flex items-start space-x-3">
                              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Competitor Category</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.CompetitorCategory}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Risk Level</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.riskLevel}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Credit Days</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.creditDays}
                                </p>
                              </div>
                            </div> */}

                            <div className="flex items-start space-x-3">
                              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Current Status</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.currentStatus}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Compliance Section */}
                        <div className="border border-gray-200 rounded-lg p-6 space-y-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                            Compliance
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-start space-x-3">
                              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-500">GST Number</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.gstNumber}
                                </p>
                                {/* Branch GST File Display */}
                                {renderBranchComplianceFile(branch.complianceFiles, 'GST')}
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-500">PAN Number</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.panNumber}
                                </p>
                                {/* Branch PAN File Display */}
                                {renderBranchComplianceFile(branch.complianceFiles, 'PAN')}
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-500">TAN Number</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.tanNumber}
                                </p>
                                {/* Branch TAN File Display */}
                                {renderBranchComplianceFile(branch.complianceFiles, 'TAN')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bank Details Section */}
                        <div className="border border-gray-200 rounded-lg p-6 space-y-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                            Bank Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-start space-x-3">
                              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Bank Name</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.bankName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Branch Name</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.branchName}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Account Number</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.bankAccountNumber}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start space-x-3">
                              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">IFSC Code</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {branch.ifscCode}
                                </p>
                              </div>
                            </div>

                            {/* Branch Bank Document Display */}
                            <div className="md:col-span-3">
                              <p className="text-sm text-gray-500 mb-2">Bank Documents</p>
                              {renderBranchComplianceFile(branch.complianceFiles, 'BANK')}
                            </div>
                          </div>
                        </div>

                        {/* Contact Persons Section */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                            Contact Persons
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {branch.contactPersons.map(
                              (person: any, personIndex: number) => (
                                <div
                                  key={personIndex}
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }

        {
          activeTab === "documents" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Competitor Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(mappedApiData?.uploadedFiles ?? []).map((file: any) => {
                  const Icon = getIconByMime(file.mime, file.original_name);
                  const sizeLabel = formatBytes(file.size);

                  return (
                    <a
                      key={file.id}
                      href={`${import.meta.env.VITE_API_BASE_URL}/Competitor-file/${file.competitorId}/files/${file.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-2.5 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                    >
                      <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate mb-0.5" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{file.createdAt ? new Date(file.createdAt).toLocaleDateString("en-IN") : "-"}</span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {file.createdByName || "-"}
                          </span>
                        </div>
                      </div>

                      <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )
        }
      </div >
      {/* Delete Confirmation Modal */}
      {
        isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
              <div className="flex items-center mb-4">
                <Trash2 className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Competitor
                </h3>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to{" "}
                <span className="font-semibold text-red-600">
                  permanently delete
                </span>{" "}
                this Competitor? This action cannot be undone.
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
                        `${import.meta.env.VITE_API_BASE_URL}/Competitor/${Competitor.id
                        }`
                      );
                      alert("Competitor deleted successfully!");
                      setIsDeleteModalOpen(false);
                      // You might want to redirect or refresh the parent component here
                      // For example: navigate back to Competitor list or call a callback function
                    } catch (error) {
                      console.error("Error deleting Competitor:", error);
                      alert("Failed to delete Competitor. Please try again.");
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Deactivate Confirmation Modal */}
      {
        isDeactivateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
              <div className="flex items-center mb-4">
                <Power className="h-6 w-6 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Deactivate Competitor
                </h3>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to{" "}
                <span className="font-semibold text-yellow-600">deactivate</span>{" "}
                this Competitor? You can reactivate them later.
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
                    alert("Competitor deactivated!");
                    setIsDeactivateModalOpen(false);
                  }}
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )
      }

      <AddCompetitorModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
        onSubmit={(updatedCompetitorData) => {
          console.log("Updated Competitor:", updatedCompetitorData);
          setIsEditModalOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
        initialData={{ ...Competitor, ...mappedApiData }}
      />
    </div >
  );
};

export default CompetitorDetails;
