import React from 'react';
import { Phone, Mail, Star, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

interface Lead {
  id: string;
  projectName: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  projectValue: string;
  leadType: string;
  leadCriticality: string;
  leadStage: string;
  leadSource: string;
  workType: string;
  eta: string;
  approximateResponseTime: string;
  avatar: string;
  submittedDate: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

interface LeadListProps {
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

const LeadList: React.FC<LeadListProps> = ({ selectedLead, onSelectLead }) => {
  const leads: Lead[] = [
    {
      id: '1',
      projectName: 'Mumbai Metro Ventilation System',
      businessName: 'TechCorp Solutions Pvt Ltd',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh.kumar@techcorp.in',
      phone: '+91 98765 43210',
      projectValue: '₹25,00,000',
      leadType: 'Government',
      leadCriticality: 'Critical',
      leadStage: 'Quotation Submitted',
      leadSource: 'Government Tender',
      workType: 'Basement Ventilation',
      eta: '2024-06-30',
      approximateResponseTime: '7',
      avatar: 'MM',
      submittedDate: '2024-01-15',
      approvalStatus: 'approved'
    },
    {
      id: '2',
      projectName: 'Corporate Office HVAC Upgrade',
      businessName: 'Innovate India Limited',
      contactPerson: 'Priya Sharma',
      email: 'priya.sharma@innovate.co.in',
      phone: '+91 87654 32109',
      projectValue: '₹15,75,000',
      leadType: 'Corporate',
      leadCriticality: 'High',
      leadStage: 'Meeting',
      leadSource: 'LinkedIn',
      workType: 'HVAC Systems',
      eta: '2024-05-15',
      approximateResponseTime: '5',
      avatar: 'CO',
      submittedDate: '2024-01-14',
      approvalStatus: 'approved'
    },
    {
      id: '3',
      projectName: 'Hospital Fire Safety System',
      businessName: 'Digital Solutions Enterprise',
      contactPerson: 'Amit Singh',
      email: 'amit@digitalsolutions.in',
      phone: '+91 76543 21098',
      projectValue: '₹35,50,000',
      leadType: 'Private',
      leadCriticality: 'Critical',
      leadStage: 'Qualified',
      leadSource: 'Referral',
      workType: 'Fire Safety',
      eta: '2024-08-20',
      approximateResponseTime: '10',
      avatar: 'HF',
      submittedDate: '2024-01-13',
      approvalStatus: 'approved'
    },
    {
      id: '4',
      projectName: 'Residential Complex Electrical',
      businessName: 'Manufacturing Industries Co',
      contactPerson: 'Sneha Patel',
      email: 'sneha.patel@manufacturing.in',
      phone: '+91 65432 10987',
      projectValue: '₹12,25,000',
      leadType: 'Private',
      leadCriticality: 'Medium',
      leadStage: 'New Lead',
      leadSource: 'Website',
      workType: 'Electrical',
      eta: '2024-07-10',
      approximateResponseTime: '14',
      avatar: 'RC',
      submittedDate: '2024-01-12',
      approvalStatus: 'pending'
    },
    {
      id: '5',
      projectName: 'Shopping Mall Plumbing System',
      businessName: 'FinTech Innovations Pvt Ltd',
      contactPerson: 'Vikram Gupta',
      email: 'vikram@fintech.in',
      phone: '+91 54321 09876',
      projectValue: '₹18,90,000',
      leadType: 'Corporate',
      leadCriticality: 'High',
      leadStage: 'Won',
      leadSource: 'Trade Show',
      workType: 'Plumbing',
      eta: '2024-04-25',
      approximateResponseTime: '3',
      avatar: 'SM',
      submittedDate: '2024-01-10',
      approvalStatus: 'approved'
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
                  <span className="text-sm font-medium text-white">{lead.avatar}</span>
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
                      {lead.phone.replace('+91 ', '')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lead.workType}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getApprovalStatusColor(lead.approvalStatus)}`}>
                    {lead.approvalStatus}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    ETA: {new Date(lead.eta).toLocaleDateString('en-IN')}
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