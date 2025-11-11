import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, Tag, Edit, Trash2, Download, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { getAllSalesOrders } from '../../../utils/salesOrderApi';

interface SalesOrder {
  id: string;
  orderNumber: string;
  businessName: string;
  quotationNumber: string;
  bomNumber: string;
  leadNumber: string;
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
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesOrders = async () => {
      try {
        setLoading(true);
        const data = await getAllSalesOrders();
        const mappedData = data.map((so: any) => ({
          id: so.id,
          orderNumber: so.so_number,
          businessName: so.customer_id, // You may want to fetch customer name
          quotationNumber: so.quotation_id,
          bomNumber: so.bom_number || 'N/A',
          leadNumber: so.lead_number || 'N/A',
          totalValue: so.total_cost ? `₹${parseFloat(so.total_cost).toLocaleString('en-IN')}` : '₹0',
          createdBy: so.created_by,
          createdDate: so.created_at,
          projectStartDate: so.estimated_start_date || '',
          projectEndDate: so.estimated_end_date || '',
          status: so.approval_status?.toLowerCase() || 'draft',
        }));
        setSalesOrders(mappedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching sales orders:', err);
        setError('Failed to load sales orders');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-500">Loading sales orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-red-600">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-2 text-blue-600 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


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
                          {salesOrder.leadNumber}
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
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesOrderList;