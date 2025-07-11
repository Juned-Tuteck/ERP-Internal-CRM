import React from 'react';
import { ShoppingCart, Calendar, Tag, Edit, Trash2, Download, CheckCircle, XCircle, Building2 } from 'lucide-react';

interface SalesOrder {
  id: string;
  orderNumber: string;
  businessName: string;
  quotationNumber: string;
  bomNumber: string;
  totalValue: string;
  createdBy: string;
  createdDate: string;
  projectStartDate: string;
  projectEndDate: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'in_progress' | 'completed';
}

interface SalesOrderListProps {
  selectedSalesOrder: SalesOrder | null;
  onSelectSalesOrder: (salesOrder: SalesOrder) => void;
}

const SalesOrderList: React.FC<SalesOrderListProps> = ({ selectedSalesOrder, onSelectSalesOrder }) => {
  const salesOrders: SalesOrder[] = [
    {
      id: '1',
      orderNumber: 'SO-2024-001',
      businessName: 'TechCorp Solutions Pvt Ltd',
      quotationNumber: 'QT-2024-001',
      bomNumber: 'BOM-2024-001',
      totalValue: '₹24,75,000',
      createdBy: 'Rajesh Kumar',
      createdDate: '2024-01-15',
      projectStartDate: '2024-02-01',
      projectEndDate: '2024-06-30',
      status: 'approved',
    },
    {
      id: '2',
      orderNumber: 'SO-2024-002',
      businessName: 'Innovate India Limited',
      quotationNumber: 'QT-2024-002',
      bomNumber: 'BOM-2024-002',
      totalValue: '₹18,50,000',
      createdBy: 'Priya Sharma',
      createdDate: '2024-01-10',
      projectStartDate: '2024-02-15',
      projectEndDate: '2024-05-15',
      status: 'pending_approval',
    },
    {
      id: '3',
      orderNumber: 'SO-2024-003',
      businessName: 'Digital Solutions Enterprise',
      quotationNumber: 'QT-2024-003',
      bomNumber: 'BOM-2024-003',
      totalValue: '₹32,80,000',
      createdBy: 'Amit Singh',
      createdDate: '2024-01-05',
      projectStartDate: '2024-03-01',
      projectEndDate: '2024-08-20',
      status: 'in_progress',
    },
    {
      id: '4',
      orderNumber: 'SO-2023-045',
      businessName: 'Manufacturing Industries Co',
      quotationNumber: 'QT-2023-045',
      bomNumber: 'BOM-2023-045',
      totalValue: '₹12,45,000',
      createdBy: 'Sneha Patel',
      createdDate: '2023-12-28',
      projectStartDate: '2024-01-15',
      projectEndDate: '2024-07-10',
      status: 'draft',
    },
    {
      id: '5',
      orderNumber: 'SO-2023-044',
      businessName: 'FinTech Innovations Pvt Ltd',
      quotationNumber: 'QT-2023-044',
      bomNumber: 'BOM-2023-044',
      totalValue: '₹19,30,000',
      createdBy: 'Vikram Gupta',
      createdDate: '2023-12-20',
      projectStartDate: '2024-01-10',
      projectEndDate: '2024-04-25',
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
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
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
      case 'in_progress':
        return <Calendar className="h-4 w-4 text-blue-600 mr-1" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-purple-600 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">All Sales Orders</h3>
        <p className="text-sm text-gray-500">{salesOrders.length} total sales orders</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
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
            {salesOrders.map((salesOrder) => (
              <tr 
                key={salesOrder.id} 
                className={`hover:bg-gray-50 cursor-pointer ${selectedSalesOrder?.id === salesOrder.id ? 'bg-blue-50' : ''}`}
                onClick={() => onSelectSalesOrder(salesOrder)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingCart className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{salesOrder.orderNumber}</div>
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {salesOrder.businessName}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          BOM: {salesOrder.bomNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">{salesOrder.totalValue}</div>
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created: {new Date(salesOrder.createdDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(salesOrder.status)}`}>
                    {getStatusIcon(salesOrder.status)}
                    {salesOrder.status.replace('_', ' ')}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    By: {salesOrder.createdBy}
                  </div>
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

export default SalesOrderList;