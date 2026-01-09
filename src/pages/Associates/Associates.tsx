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
  const [screenRefresh, setScreenRefresh] = useState(0);
  const [associateInitialData, setAssociateInitialData] = useState<any>(null);
  const { addNotification } = useCRM();

  const handleAddAssociate = (associateData: any) => {
    console.log('Adding new associate:', associateData);
    addNotification({
      type: 'success',
      message: `Associate ${associateData.businessName} registered successfully and sent for approval!`,
    });
    setIsAddModalOpen(false);
    setScreenRefresh(prev => prev + 1);
  };

  const handleApprovalAction = (associateId: string, action: 'approve' | 'reject', reason?: string) => {
    console.log(`${action} associate:`, associateId, reason);
    addNotification({
      type: action === 'approve' ? 'success' : 'warning',
      message: `Associate ${action}d successfully!`,
    });
    setScreenRefresh(prev => prev + 1);
  };

  const handleExportAssociates = () => {
    console.log('Exporting associates...');
    addNotification({
      type: 'info',
      message: 'Associate export initiated. Download will start shortly.',
    });
  };

  const handleRegisterAssociate = () => {
    // Clear any previously set initial data before opening the modal
    setAssociateInitialData(null);
    setIsAddModalOpen(true);
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
              onClick={handleRegisterAssociate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-teal-500 text-teal-600'
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
              screenRefresh={screenRefresh}
            />
          </div>
          <div className="lg:col-span-2">
            <AssociateDetails
              associate={selectedAssociate}
              setAssociateInitialData={setAssociateInitialData}
              onAssociateUpdate={() => setScreenRefresh(prev => prev + 1)}
            />
          </div>
        </div>
      ) : (
        <AssociateApproval onApprovalAction={handleApprovalAction} />
      )}

      <AddAssociateModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setAssociateInitialData(null);
          setIsAddModalOpen(false);
        }}
        onSubmit={handleAddAssociate}
        initialData={associateInitialData}
      />
    </div>
  );
};

export default Associates;