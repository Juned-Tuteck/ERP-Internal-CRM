import React from 'react';
import { Phone, Mail, Star, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

interface Lead {
  id: string;
  businessName: string;
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
  const leads: Lead[] = [
    {
      id: '1',
      businessName: 'TechCorp Solutions Pvt Ltd',
      customerBranch: 'Mumbai HQ',
      currency: 'INR',
      contactPerson: 'Rajesh Kumar',
      contactNo: '+91 98765 43210',
      leadGeneratedDate: '2025-07-10',
      referencedBy: 'LinkedIn',
      projectName: 'Mumbai Metro Ventilation System',
      projectValue: '2500000',
      leadType: 'Government',
      workType: 'Basement Ventilation',
      leadCriticality: 'Critical',
      leadSource: 'Government Tender',
      leadStage: 'Quotation Submitted',
      leadStagnation: '',
      approximateResponseTime: '7',
      eta: '2025-08-01',
      leadDetails: 'Ventilation system for Mumbai Metro project.',
      involvedAssociates: [
        {
          designation: 'Consultant',
          associateId: '2',
          associateName: 'Consultant B',
          otherInfo: 'Lead Consultant'
        },
        {
          designation: 'Consultant',
          associateId: '2',
          associateName: 'Consultant B',
          otherInfo: 'Lead Consultant'
        }
      ],
      uploadedFiles: [
        { name: 'rfq.pdf', size: 204800, type: 'application/pdf' }
      ],
      followUpComments: [
        {
          id: 1,
          text: 'Initial call with client completed.',
          timestamp: '2025-07-11T10:00:00Z',
          author: 'Sales User'
        }
      ]
    },
    {
      id: '2',
      businessName: 'Innovate India Limited',
      customerBranch: 'Pune Main',
      currency: 'INR',
      contactPerson: 'Priya Sharma',
      contactNo: '+91 87654 32109',
      leadGeneratedDate: '2025-07-12',
      referencedBy: 'Referral',
      projectName: 'Corporate Office HVAC Upgrade',
      projectValue: '1575000',
      leadType: 'Corporate',
      workType: 'HVAC Systems',
      leadCriticality: 'High',
      leadSource: 'LinkedIn',
      leadStage: 'Meeting',
      leadStagnation: '',
      approximateResponseTime: '5',
      eta: '2025-08-15',
      leadDetails: 'Upgrade HVAC for corporate office.',
      involvedAssociates: [
        {
          designation: 'Engineer',
          associateId: '3',
          associateName: 'Engineer C',
          otherInfo: ''
        }
      ],
      uploadedFiles: [
        { name: 'drawing.dwg', size: 1048576, type: 'application/acad' }
      ],
      followUpComments: [
        {
          id: 2,
          text: 'Site visit scheduled.',
          timestamp: '2025-07-13T09:30:00Z',
          author: 'Sales User'
        }
      ]
    },
    {
      id: '3',
      businessName: 'Digital Solutions Enterprise',
      customerBranch: 'Gurgaon HQ',
      currency: 'INR',
      contactPerson: 'Amit Singh',
      contactNo: '+91 76543 21098',
      leadGeneratedDate: '2025-07-09',
      referencedBy: 'Trade Show',
      projectName: 'Hospital Fire Safety System',
      projectValue: '3550000',
      leadType: 'Private',
      workType: 'Fire Safety',
      leadCriticality: 'Critical',
      leadSource: 'Referral',
      leadStage: 'Qualified',
      leadStagnation: '',
      approximateResponseTime: '10',
      eta: '2025-09-10',
      leadDetails: 'Fire safety system for hospital.',
      involvedAssociates: [
        {
          designation: 'Architect',
          associateId: '1',
          associateName: 'Architect A',
          otherInfo: 'External Consultant'
        }
      ],
      uploadedFiles: [
        { name: 'site-photo.jpg', size: 512000, type: 'image/jpeg' }
      ],
      followUpComments: [
        {
          id: 3,
          text: 'Meeting with architect scheduled.',
          timestamp: '2025-07-10T15:00:00Z',
          author: 'Sales User'
        }
      ]
    },
    {
      id: '4',
      businessName: 'Manufacturing Industries Co',
      customerBranch: 'Aurangabad Factory',
      currency: 'INR',
      contactPerson: 'Sneha Patel',
      contactNo: '+91 65432 10987',
      leadGeneratedDate: '2025-07-08',
      referencedBy: 'Website',
      projectName: 'Residential Complex Electrical',
      projectValue: '1225000',
      leadType: 'Private',
      workType: 'Electrical',
      leadCriticality: 'Medium',
      leadSource: 'Website',
      leadStage: 'New Lead',
      leadStagnation: '',
      approximateResponseTime: '14',
      eta: '2025-08-20',
      leadDetails: 'Electrical system for residential complex.',
      involvedAssociates: [],
      uploadedFiles: [],
      followUpComments: []
    },
    {
      id: '5',
      businessName: 'FinTech Innovations Pvt Ltd',
      customerBranch: 'Bangalore HQ',
      currency: 'INR',
      contactPerson: 'Vikram Gupta',
      contactNo: '+91 54321 09876',
      leadGeneratedDate: '2025-07-07',
      referencedBy: 'Trade Show',
      projectName: 'Shopping Mall Plumbing System',
      projectValue: '1890000',
      leadType: 'Corporate',
      workType: 'Plumbing',
      leadCriticality: 'High',
      leadSource: 'Trade Show',
      leadStage: 'Won',
      leadStagnation: '',
      approximateResponseTime: '3',
      eta: '2025-08-05',
      leadDetails: 'Plumbing system for new shopping mall.',
      involvedAssociates: [
        {
          designation: 'Designer',
          associateId: '4',
          associateName: 'Designer D',
          otherInfo: ''
        }
      ],
      uploadedFiles: [
        { name: 'plumbing-plan.pdf', size: 307200, type: 'application/pdf' }
      ],
      followUpComments: [
        {
          id: 4,
          text: 'Project won and contract signed.',
          timestamp: '2025-07-14T11:00:00Z',
          author: 'Sales User'
        }
      ]
    }
  ];

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
        <p className="text-sm text-gray-500">{leads.length} leads in pipeline</p>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {leads.map((lead) => (
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
        ))}
      </div>
    </div>
  );
};

export default LeadList;