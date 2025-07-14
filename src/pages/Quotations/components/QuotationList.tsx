import React from 'react';
import { FileSpreadsheet, Calendar, Tag, Edit, Trash2, Download, CheckCircle, XCircle, Building2 } from 'lucide-react';

interface Quotation {
  id: string;
  leadName: string;
  businessName: string;
  workType: string;
  totalValue: string;
  createdBy: string;
  createdDate: string;
  expiryDate: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
}

interface QuotationListProps {
  selectedQuotation: Quotation | null;
  onSelectQuotation: (quotation: Quotation) => void;
}

const QuotationList: React.FC<QuotationListProps> = ({ selectedQuotation, onSelectQuotation }) => {
  const quotations: Quotation[] = [
    {
      id: '1',
      leadName: 'Mumbai Metro Ventilation System',
      businessName: 'TechCorp Solutions Pvt Ltd',
      workType: 'Basement Ventilation',
      totalValue: '₹24,75,000',
      createdBy: 'Rajesh Kumar',
      createdDate: '2024-01-15',
      expiryDate: '2024-02-15',
      status: 'approved',
    },
    {
      id: '2',
      leadName: 'Corporate Office HVAC Upgrade',
      businessName: 'Innovate India Limited',
      workType: 'HVAC Systems',
      totalValue: '₹18,50,000',
      createdBy: 'Priya Sharma',
      createdDate: '2024-01-10',
      expiryDate: '2024-02-10',
      status: 'pending_approval',
    },
    {
      id: '3',
      leadName: 'Hospital Fire Safety System',
      businessName: 'Digital Solutions Enterprise',
      workType: 'Fire Safety',
      totalValue: '₹32,80,000',
      createdBy: 'Amit Singh',
      createdDate: '2024-01-05',
      expiryDate: '2024-02-05',
      status: 'draft',
    },
    {
      id: '4',
      leadName: 'Residential Complex Electrical',
      businessName: 'Manufacturing Industries Co',
      workType: 'Electrical',
      totalValue: '₹12,45,000',
      createdBy: 'Sneha Patel',
      createdDate: '2023-12-28',
      expiryDate: '2024-01-28',
      status: 'expired',
    },
    {
      id: '5',
      leadName: 'Shopping Mall Plumbing System',
      businessName: 'FinTech Innovations Pvt Ltd',
      workType: 'Plumbing',
      totalValue: '₹19,30,000',
      createdBy: 'Vikram Gupta',
      createdDate: '2023-12-20',
      expiryDate: '2024-01-20',
      status: 'rejected',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600 mr-1" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600 mr-1" />;
      case 'pending_approval':
        return <Calendar className="h-4 w-4 text-yellow-600 mr-1" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600 mr-1" />;
      case 'expired':
        return <Calendar className="h-4 w-4 text-orange-600 mr-1" />;
      default:
        return null;
    }
  };

  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case 'Basement Ventilation':
        return 'bg-blue-100 text-blue-800';
      case 'HVAC Systems':
        return 'bg-purple-100 text-purple-800';
      case 'Fire Safety':
        return 'bg-red-100 text-red-800';
      case 'Electrical':
        return 'bg-amber-100 text-amber-800';
      case 'Plumbing':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Quotations</h3>
        <p className="text-sm text-gray-500">{quotations.length} total quotations</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Details
              </th>
              
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotations.map((quotation) => (
              <tr 
                key={quotation.id} 
                className={`hover:bg-gray-50 cursor-pointer ${selectedQuotation?.id === quotation.id ? 'bg-blue-50' : ''}`}
                onClick={() => onSelectQuotation(quotation)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileSpreadsheet className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{quotation.leadName}</div>
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {quotation.businessName}
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkTypeColor(quotation.workType)}`}>
                          {quotation.workType}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotationList;