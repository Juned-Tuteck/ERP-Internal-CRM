import React from "react";
import { useState, useEffect } from "react";
import {
  Phone,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Search,
} from "lucide-react";
import axios from "axios";
import { useCRM } from "../../../context/CRMContext";

interface Lead {
  id: string;
  leadNumber?: string;
  customerNumber?: string;
  businessName: string;
  avatar: string;
  customerBranch: string | null;
  customerBranchId: string | null;
  branchNumber: string;
  branchName: string;
  currency: string;
  is_temp_lead?: boolean;
  contactPerson: string;
  contactPersonName: string;
  contactNo: string;
  leadGeneratedDate: string;
  referencedBy: string;
  projectName: string;
  projectValue: string;
  leadType: string;
  workType: string;
  leadCriticality: string;
  leadSource: string;
  leadStage: string;
  leadStagnation: string;
  approvalStatus: string;
  approximateResponseTime: string;
  eta: string;
  leadDetails: string;
  involvedAssociates: Array<{
    designation: string;
    associateId: string;
    associateName: string;
    otherInfo: string;
  }>;
  uploadedFiles: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  followUpComments: Array<{
    id: number;
    text: string;
    timestamp: string;
    author: string;
  }>;
}

interface LeadListProps {
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

const LeadList: React.FC<LeadListProps> = ({ selectedLead, onSelectLead }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedLeadIds, setAssignedLeadIds] = useState<string[]>([]);
  const { userData } = useCRM();

  // Check if user is a design engineer
  const isDesignEngineer = userData?.role === 'design engineer' ||
    (userData?.roles && userData.roles.includes('design engineer'));

  // Filter leads based on role and search term
  const filteredLeads = leads.filter((lead) => lead.is_temp_lead !== true).filter((lead) => {
    // Role-based filtering for design engineers
    if (isDesignEngineer) {
      if (!assignedLeadIds.includes(lead.id)) {
        return false;
      }
    }

    // Search term filtering
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      lead.businessName.toLowerCase().includes(searchLower) ||
      lead.projectName.toLowerCase().includes(searchLower) ||
      lead.contactPerson.toLowerCase().includes(searchLower) ||
      lead.contactPersonName.toLowerCase().includes(searchLower) ||
      lead.contactNo.toLowerCase().includes(searchLower) ||
      lead.leadType.toLowerCase().includes(searchLower) ||
      lead.workType?.toLowerCase().includes(searchLower) ||
      lead.leadCriticality.toLowerCase().includes(searchLower) ||
      lead.leadSource.toLowerCase().includes(searchLower) ||
      lead.leadStage.toLowerCase().includes(searchLower) ||
      lead.approvalStatus.toLowerCase().includes(searchLower) ||
      lead.referencedBy.toLowerCase().includes(searchLower) ||
      lead.projectValue.toLowerCase().includes(searchLower) ||
      lead.leadDetails.toLowerCase().includes(searchLower) ||
      lead.leadNumber?.toLowerCase().includes(searchLower) ||
      lead.customerNumber?.toLowerCase().includes(searchLower) ||
      lead.customerNumber?.toLowerCase().includes(searchLower) ||
      lead.branchName.toLowerCase().includes(searchLower) ||
      lead.branchNumber.toLowerCase().includes(searchLower) ||
      lead.involvedAssociates.some(
        (associate) =>
          associate.associateName.toLowerCase().includes(searchLower) ||
          associate.designation.toLowerCase().includes(searchLower)
      )
    );
  });

  // Fetch assigned leads for design engineers
  useEffect(() => {
    const fetchAssignedLeads = async () => {
      if (!isDesignEngineer || !userData?.id) {
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/design-help?user_id=${userData.id}`
        );
        if (response.data.success && response.data.data) {
          const leadIds = response.data.data.map((item: any) => item.lead_id);
          setAssignedLeadIds(leadIds);
        }
      } catch (error) {
        console.error("Error fetching assigned leads:", error);
      }
    };

    fetchAssignedLeads();
  }, [isDesignEngineer, userData?.id]);

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/lead/`
        );
        const apiLeads = response.data.data;
        // Map API response to UI Lead interface
        const mappedLeads: Lead[] = apiLeads.map((apiLead: any) => ({
          id: apiLead.lead_id?.toString() || "",
          leadNumber: apiLead.lead_number,
          customerNumber: apiLead.customer_number,
          businessName: apiLead.business_name || "",
          avatar: "LD", // Default avatar
          customerBranch: apiLead.customer_branch || null,
          customerBranchId: apiLead.customer_branch_id?.toString() || null,
          branchNumber: "",
          branchName: "",
          currency: "INR", // Default currency
          contactPerson: apiLead.contact_person || "",
          contactPersonName: "",
          contactNo: apiLead.contact_no || "",
          leadGeneratedDate: apiLead.lead_date_generated_on || "",
          referencedBy: apiLead.referenced_by || "",
          projectName: apiLead.project_name || "",
          projectValue: apiLead.project_value?.toString() || "0",
          leadType: apiLead.lead_type || "",
          workType: apiLead.work_type || null,
          leadCriticality: apiLead.lead_criticality || "",
          leadSource: apiLead.lead_source || "",
          leadStage: apiLead.lead_stage || "",
          leadStagnation: "",
          approvalStatus: apiLead.approval_status || "PENDING",
          approximateResponseTime:
            apiLead.approximate_response_time_day?.toString() || "0",
          eta: apiLead.eta || "",
          is_temp_lead: apiLead.is_temp_lead || false,
          leadDetails: apiLead.lead_details || "",
          involvedAssociates: [], // Will be populated when lead details are fetched
          uploadedFiles: [],
          followUpComments: [],
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

  const fetchLeadDetails = async (lead: Lead) => {
    try {
      // Create a copy of the lead to update
      const updatedLead = { ...lead };

      // 1. Fetch customer branch details
      if (lead.customerBranchId) {
        try {
          const branchResponse = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/customer-branch/${lead.customerBranchId
            }`
          );
          const branchData = branchResponse.data.data;
          updatedLead.branchNumber = branchData.branch_number || "";
          updatedLead.branchName = branchData.branch_name || "";
        } catch (branchError) {
          console.error("Error fetching branch details:", branchError);
        }
      }

      // 2. Fetch contact person name
      if (lead.contactPerson) {
        try {
          const contactResponse = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/customer-branch-contact/${lead.contactPerson
            }`
          );
          const contactData = contactResponse.data.data;
          updatedLead.contactPersonName = contactData.name || "";
        } catch (contactError) {
          console.error("Error fetching contact person details:", contactError);
        }
      }

      // 3. Fetch lead associates
      try {
        const associatesResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/lead-associate/`,
          {
            params: { lead_id: lead.id },
          }
        );
        const associatesData = associatesResponse.data.data;
        updatedLead.involvedAssociates = associatesData.map(
          (associate: any) => ({
            designation: associate.associate_type || "",
            associateId: associate.id?.toString() || "",
            associateName: associate.associate_name || "",
            otherInfo: associate.other_information || "",
          })
        );
      } catch (associatesError) {
        console.error("Error fetching lead associates:", associatesError);
      }

      // 4. Fetch follow-up comments
      try {
        const followUpResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/lead-follow-up/`,
          {
            params: { lead_id: lead.id },
          }
        );
        const followUpData = followUpResponse.data.data;
        updatedLead.followUpComments = followUpData.map(
          (comment: any, index: number) => ({
            id: comment.id || index,
            text: comment.text || comment.comment || "",
            timestamp: comment.timestamp || comment.created_at || "",
            author: comment.author || comment.created_by || "",
          })
        );
      } catch (followUpError) {
        console.error("Error fetching follow-up comments:", followUpError);
      }

      // Update the leads array with the enhanced lead data
      setLeads((prevLeads) =>
        prevLeads.map((l) => (l.id === lead.id ? updatedLead : l))
      );

      // Call the original onSelectLead with updated data
      onSelectLead(updatedLead);
    } catch (error) {
      console.error("Error fetching lead details:", error);
      // Still call onSelectLead with original data if there's an error
      onSelectLead(lead);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "New Lead":
        return "bg-gray-100 text-gray-800";
      case "Qualified":
        return "bg-blue-100 text-blue-800";
      case "Meeting":
        return "bg-yellow-100 text-yellow-800";
      case "Quotation Submitted":
        return "bg-purple-100 text-purple-800";
      case "Won":
        return "bg-green-100 text-green-800";
      case "Lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "Critical":
        return "text-red-600";
      case "High":
        return "text-orange-600";
      case "Medium":
        return "text-yellow-600";
      case "Normal":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Active Leads</h3>
        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : `${filteredLeads.length} leads in pipeline`}
        </p>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search leads by name, project, contact, stage, status..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm
              ? "No leads match your search criteria"
              : "No leads found"}
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => fetchLeadDetails(lead)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${selectedLead?.id === lead.id
                  ? "bg-blue-50 border-r-2 border-blue-600"
                  : ""
                }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                    {/* Use initials as avatar */}
                    <span className="text-sm font-medium text-white">
                      {lead.businessName
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lead.projectName}
                    </p>
                    <div className="flex items-center space-x-1">
                      {/* <AlertTriangle className={`h-3 w-3 ${getCriticalityColor(lead.leadCriticality)}`} />
                    <span className={`text-xs font-medium ${getCriticalityColor(lead.leadCriticality)}`}>
                      {lead.leadCriticality}
                    </span> */}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(
                          lead.approvalStatus
                        )}`}
                      >
                        {lead.approvalStatus}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {lead.businessName}
                  </p>
                  <p className="text-xs font-bold text-blue-600 truncate">
                    Lead : {lead.leadNumber || "-"}
                  </p>
                  <p className="text-xs font-bold text-blue-400 truncate">
                    Customer : {lead.customerNumber || "-"}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(
                        lead.leadStage
                      )}`}
                    >
                      {lead.leadStage}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />₹
                        {(parseInt(lead.projectValue) / 100000).toLocaleString("en-IN")}L
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Phone className="h-3 w-3 mr-1" />
                        {lead.contactNo.replace("+91 ", "")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.workType}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      ETA:{" "}
                      {lead.eta
                        ? new Date(lead.eta).toLocaleDateString("en-IN")
                        : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Response: {lead.approximateResponseTime}d
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeadList;
