import React from 'react';
import { Phone, Mail, Star, TrendingUp } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation';
  value: string;
  avatar: string;
}

interface LeadListProps {
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

const LeadList: React.FC<LeadListProps> = ({ selectedLead, onSelectLead }) => {
  const leads: Lead[] = [
    {
      id: '1',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@startup.in',
      phone: '+91 99887 76543',
      company: 'TechStart Innovations',
      source: 'Website',
      score: 85,
      status: 'qualified',
      value: '₹8,50,000',
      avatar: 'AM',
    },
    {
      id: '2',
      name: 'Kavita Reddy',
      email: 'kavita@globaltech.co.in',
      phone: '+91 88776 65432',
      company: 'Global Tech Solutions',
      source: 'LinkedIn',
      score: 92,
      status: 'proposal',
      value: '₹12,00,000',
      avatar: 'KR',
    },
    {
      id: '3',
      name: 'Suresh Gupta',
      email: 'suresh.gupta@manufacturing.in',
      phone: '+91 77665 54321',
      company: 'Modern Manufacturing',
      source: 'Referral',
      score: 78,
      status: 'contacted',
      value: '₹5,75,000',
      avatar: 'SG',
    },
    {
      id: '4',
      name: 'Deepika Joshi',
      email: 'deepika@fintech.in',
      phone: '+91 66554 43210',
      company: 'FinTech Innovations',
      source: 'Cold Call',
      score: 95,
      status: 'negotiation',
      value: '₹15,25,000',
      avatar: 'DJ',
    },
    {
      id: '5',
      name: 'Rohit Sharma',
      email: 'rohit@ecommerce.co.in',
      phone: '+91 55443 32109',
      company: 'E-Commerce Hub',
      source: 'Trade Show',
      score: 65,
      status: 'new',
      value: '₹3,20,000',
      avatar: 'RS',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-gray-100 text-gray-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'qualified':
        return 'bg-yellow-100 text-yellow-800';
      case 'proposal':
        return 'bg-purple-100 text-purple-800';
      case 'negotiation':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
                  <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                  <div className="flex items-center">
                    <Star className={`h-3 w-3 mr-1 ${getScoreColor(lead.score)}`} />
                    <span className={`text-xs font-medium ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">{lead.company}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {lead.value}
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Phone className="h-3 w-3 mr-1" />
                    {lead.phone.replace('+91 ', '')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {lead.source}
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