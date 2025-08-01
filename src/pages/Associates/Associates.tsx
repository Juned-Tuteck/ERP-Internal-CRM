import React, { useState } from 'react';
import AssociateList from './components/AssociateList';
import AssociateDetails from './components/AssociateDetails';
import AddAssociateModal from './components/AddAssociateModal';
import AssociateApproval from './components/AssociateApproval';
import { HardHat, Filter, Download, Plus, CheckCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const Associates: React.FC = () => {
  const [selectedAssociate, setSelectedAssociate] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('associates');
  const { addNotification } = useCRM();

  const handleAddAssociate = (associateData: any) => {
    console.log('Adding new associate:', associateData);
    addNotification({
      type: 'success',
      message: `Associate ${associateData.businessName} registered successfully and sent for approval!`,
    });
    setIsAddModalOpen(false);
  };

  const handleApprovalAction = (associateId: string, action: 'approve' | 'reject', reason?: string) => {
    console.log(`${action} associate:`, associateId, reason);
    addNotification({
      type: action === 'approve' ? 'success' : 'warning',
      message: `Associate ${action}d successfully!`,
    });
  };

  const handleExportAssociates = () => {
    console.log('Exporting associates...');
    addNotification({
      type: 'info',
      message: 'Associate export initiated. Download will start shortly.',
    });
  };

  const tabs = [
    { id: 'associates', name: 'All Associates', icon: HardHat },
    { id: 'approval', name: 'Associate Approval', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Associate Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportAssociates}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          {activeTab === 'associates' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Register Associate
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
      {activeTab === 'associates' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AssociateList
              selectedAssociate={selectedAssociate}
              onSelectAssociate={setSelectedAssociate}
            />
          </div>
          <div className="lg:col-span-2">
            <AssociateDetails associate={selectedAssociate} />
          </div>
        </div>
      ) : (
        <AssociateApproval onApprovalAction={handleApprovalAction} />
      )}

      <AddAssociateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAssociate}
      />
    </div>
  );
};

export default Associates;