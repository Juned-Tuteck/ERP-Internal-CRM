import React, { useState } from 'react';
import VendorList from './components/VendorList';
import VendorDetails from './components/VendorDetails';
import AddVendorModal from './components/AddVendorModal';
import VendorApproval from './components/VendorApproval';
import { Truck, Filter, Download, Plus, CheckCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const Vendors: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('vendors');
  const { addNotification } = useCRM();

  const handleAddVendor = (vendorData: any) => {
    console.log('Adding new vendor:', vendorData);
    addNotification({
      type: 'success',
      message: `Vendor ${vendorData.businessName} registered successfully and sent for approval!`,
    });
    setIsAddModalOpen(false);
  };

  const handleApprovalAction = (vendorId: string, action: 'approve' | 'reject', reason?: string) => {
    console.log(`${action} vendor:`, vendorId, reason);
    addNotification({
      type: action === 'approve' ? 'success' : 'warning',
      message: `Vendor ${action}d successfully!`,
    });
  };

  const handleExportVendors = () => {
    console.log('Exporting vendors...');
    addNotification({
      type: 'info',
      message: 'Vendor export initiated. Download will start shortly.',
    });
  };

  const tabs = [
    { id: 'vendors', name: 'All Vendors', icon: Truck },
    { id: 'approval', name: 'Vendor Approval', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportVendors}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          {activeTab === 'vendors' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register Vendor
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
      {activeTab === 'vendors' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <VendorList
              selectedVendor={selectedVendor}
              onSelectVendor={setSelectedVendor}
            />
          </div>
          <div className="lg:col-span-2">
            <VendorDetails vendor={selectedVendor} />
          </div>
        </div>
      ) : (
        <VendorApproval onApprovalAction={handleApprovalAction} />
      )}

      <AddVendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddVendor}
      />
    </div>
  );
};

export default Vendors;