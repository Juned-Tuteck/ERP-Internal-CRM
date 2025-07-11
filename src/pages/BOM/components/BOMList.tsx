import React from 'react';
import { FileText, Calendar, Tag, Edit, Trash2, Download, CheckCircle, XCircle } from 'lucide-react';

interface BOM {
  id: string;
  leadName: string;
  workType: string;
  itemCount: number;
  totalValue: string;
  createdBy: string;
  createdDate: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
}

interface BOMListProps {
  selectedBOM: BOM | null;
  onSelectBOM: (bom: BOM) => void;
}

const BOMList: React.FC<BOMListProps> = ({ selectedBOM, onSelectBOM }) => {
  const boms: BOM[] = [
    {
      id: '1',
      leadName: 'Mumbai Metro Ventilation System',
      workType: 'Basement Ventilation',
      itemCount: 24,
      totalValue: '₹18,75,000',
      createdBy: 'Rajesh Kumar',
      createdDate: '2024-01-15',
      status: 'approved',
    },
    {
      id: '2',
      leadName: 'Corporate Office HVAC Upgrade',
      workType: 'HVAC Systems',
      itemCount: 36,
      totalValue: '₹12,50,000',
      createdBy: 'Priya Sharma',
      createdDate: '2024-01-10',
      status: 'pending_approval',
    },
    {
      id: '3',
      leadName: 'Hospital Fire Safety System',
      workType: 'Fire Safety',
      itemCount: 18,
      totalValue: '₹22,80,000',
      createdBy: 'Amit Singh',
      createdDate: '2024-01-05',
      status: 'draft',
    },
    {
      id: '4',
      leadName: 'Residential Complex Electrical',
      workType: 'Electrical',
      itemCount: 42,
      totalValue: '₹8,45,000',
      createdBy: 'Sneha Patel',
      createdDate: '2023-12-28',
      status: 'approved',
    },
    {
      id: '5',
      leadName: 'Shopping Mall Plumbing System',
      workType: 'Plumbing',
      itemCount: 29,
      totalValue: '₹14,30,000',
      createdBy: 'Vikram Gupta',
      createdDate: '2023-12-20',
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
        <h3 className="text-lg font-semibold text-gray-900">Bills of Materials</h3>
        <p className="text-sm text-gray-500">{boms.length} total BOMs</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Work Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {boms.map((bom) => (
              <tr 
                key={bom.id} 
                className={`hover:bg-gray-50 cursor-pointer ${selectedBOM?.id === bom.id ? 'bg-blue-50' : ''}`}
                onClick={() => onSelectBOM(bom)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{bom.leadName}</div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(bom.createdDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getWorkTypeColor(bom.workType)}`}>
                    {bom.workType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {bom.itemCount} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">{bom.totalValue}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(bom.status)}`}>
                    {getStatusIcon(bom.status)}
                    {bom.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
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

export default BOMList;