import React, { useState } from 'react';
import axios from 'axios';
import CustomerList from './components/CustomerList';
import CustomerDetails from './components/CustomerDetails';
import AddCustomerModal from './components/AddCustomerModal';
import CustomerApproval from './components/CustomerApproval';
import { Building2, Filter, Download, Plus, CheckCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const Customers: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('customers');
  const [customerInitialData, setCustomerInitialData] = useState(null);
  const [screenRefresh, setScreenRefresh] = useState(0);
  const { addNotification } = useCRM();

  const handleAddCustomer = (customerData: any) => {
    console.log('Adding new customer:', customerData);
    addNotification({
      type: 'success',
      message: `Customer ${customerData.businessName} registered successfully and sent for approval!`,
    });
    setIsAddModalOpen(false);
  };

  const handleApprovalAction = (customerId: string, action: 'approve' | 'reject', reason?: string) => {
    console.log(`${action} customer:`, customerId, reason);
    addNotification({
      type: action === 'approve' ? 'success' : 'warning',
      message: `Customer ${action}d successfully!`,
    });
  };

  const handleExportCustomers = () => {
    console.log('Exporting customers...');
    addNotification({
      type: 'info',
      message: 'Customer export initiated. Download will start shortly.',
    });
  };

  const tabs = [
    { id: 'customers', name: 'All Customers', icon: Building2 },
    { id: 'approval', name: 'Customer Approval', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <div className="flex space-x-3">
          {/* <button
            onClick={handleExportCustomers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button> */}
          {activeTab === 'customers' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register Customer
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
      {activeTab === 'customers' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CustomerList
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              screenRefresh={screenRefresh}
            />
          </div>
          <div className="lg:col-span-2">
            <CustomerDetails customer={selectedCustomer} setCustomerInitialData={setCustomerInitialData} />
          </div>
        </div>
      ) : (
        <CustomerApproval onApprovalAction={handleApprovalAction} />
      )}

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => {setIsAddModalOpen(false); setScreenRefresh(prev => prev + 1);}}
        onSubmit={handleAddCustomer}
      />
    </div>
  );
};

export default Customers;