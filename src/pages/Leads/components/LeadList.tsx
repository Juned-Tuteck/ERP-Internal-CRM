import React from 'react';
import { useState, useEffect } from 'react';
import { Phone, Mail, Star, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface Lead {
  id: string;
  businessName: string;
  avatar: string; 
  customerBranch: string;
  currency: string;
  contactPerson: string;
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

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/lead/`);
        const apiLeads = response.data.data;
        
        // Map API response to UI Lead interface
        const mappedLeads: Lead[] = apiLeads.map((apiLead: any) => ({
          id: apiLead.lead_id?.toString() || '',
          businessName: apiLead.business_name || '',
          avatar: 'LD', // Default avatar
          customerBranch: apiLead.customer_branch || null,
          currency: 'INR', // Default currency
          contactPerson: apiLead.contact_person || '',
          contactNo: apiLead.contact_no || '',
          leadGeneratedDate: apiLead.lead_date_generated_on || '',
          referencedBy: apiLead.referenced_by || '',
          projectName: apiLead.project_name || '',
          projectValue: apiLead.project_value?.toString() || '0',
          leadType: apiLead.lead_type || '',
          workType: apiLead.work_type || null,
          leadCriticality: apiLead.lead_criticality || '',
          leadSource: apiLead.lead_source || '',
          leadStage: apiLead.lead_stage || '',
          leadStagnation: '',
          approximateResponseTime: apiLead.approximate_response_time_day?.toString() || '0',
          eta: apiLead.eta || '',
          leadDetails: apiLead.lead_details || '',
          involvedAssociates: [], // Will be populated when lead details are fetched
          uploadedFiles: [],
          followUpComments: []
        }));
        
        setLeads(mappedLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New Lead':
        return 'bg-gray-100 text-gray-800';
      case 'Qualified':
        return 'bg-blue-100 text-blue-800';
      case 'Meeting':
        return 'bg-yellow-100 text-yellow-800';
      case 'Quotation Submitted':
        return 'bg-purple-100 text-purple-800';
      case 'Won':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical':
        return 'text-red-600';
      case 'High':
        return 'text-orange-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Active Leads</h3>
        <p className="text-sm text-gray-500">
          {loading ? 'Loading...' : `${leads.length} leads in pipeline`}
        </p>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No leads found
          </div>
        ) : (
          leads.map((lead) => (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
              selectedLead?.id === lead.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                  {/* Use initials as avatar */}
                  <span className="text-sm font-medium text-white">
                    {lead.businessName
                      .split(' ')
                      .map(word => word[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{lead.projectName}</p>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className={`h-3 w-3 ${getCriticalityColor(lead.leadCriticality)}`} />
                    <span className={`text-xs font-medium ${getCriticalityColor(lead.leadCriticality)}`}>
                      {lead.leadCriticality}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">{lead.businessName}</p>
                <p className="text-xs text-gray-500 truncate">{lead.contactPerson}</p>

                <div className="flex items-center justify-between mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(lead.leadStage)}`}>
                    {lead.leadStage}
                  </span>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {lead.projectValue}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="h-3 w-3 mr-1" />
                      {lead.contactNo.replace('+91 ', '')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lead.workType}
                    </div>
                  </div>
                  {/* approvalStatus is not in Lead, so remove this */}
                  {/* <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getApprovalStatusColor(lead.approvalStatus)}`}>
                    {lead.approvalStatus}
                  </span> */}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    ETA: {lead.eta ? new Date(lead.eta).toLocaleDateString('en-IN') : 'N/A'}
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