import React, { useState } from 'react';
import SalesOrderList from './components/SalesOrderList';
import SalesOrderDetails from './components/SalesOrderDetails';
import CreateSalesOrderModal from './components/CreateSalesOrderModal';
import SalesOrderApproval from './components/SalesOrderApproval';
import { ShoppingCart, Filter, Download, Plus, CheckCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const SalesOrders: React.FC = () => {
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('salesOrders');
  const { addNotification } = useCRM();

  const handleCreateSalesOrder = (salesOrderData: any) => {
    console.log('Creating new sales order:', salesOrderData);
    addNotification({
      type: 'success',
      message: `Sales Order for ${salesOrderData.businessName} created successfully and sent for approval!`,
    });
    setIsCreateModalOpen(false);
  };

  const handleApprovalAction = (salesOrderId: string, action: 'approve' | 'reject', reason?: string) => {
    console.log(`${action} sales order:`, salesOrderId, reason);
    addNotification({
      type: action === 'approve' ? 'success' : 'warning',
      message: `Sales Order ${action}d successfully!`,
    });
  };

  const handleExportSalesOrders = () => {
    console.log('Exporting sales orders...');
    addNotification({
      type: 'info',
      message: 'Sales Order export initiated. Download will start shortly.',
    });
  };

  const tabs = [
    { id: 'salesOrders', name: 'All Sales Orders', icon: ShoppingCart },
    { id: 'approval', name: 'Sales Order Approval', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales Order Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportSalesOrders}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          {activeTab === 'salesOrders' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Sales Order
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
      {activeTab === 'salesOrders' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SalesOrderList
              selectedSalesOrder={selectedSalesOrder}
              onSelectSalesOrder={setSelectedSalesOrder}
            />
          </div>
          <div className="lg:col-span-2">
            <SalesOrderDetails salesOrder={selectedSalesOrder} />
          </div>
        </div>
      ) : (
        <SalesOrderApproval onApprovalAction={handleApprovalAction} />
      )}

      <CreateSalesOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSalesOrder}
      />
    </div>
  );
};

export default SalesOrders;