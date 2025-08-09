import React, { useState } from 'react';
import LeadList from './components/LeadList';
import LeadDetails from './components/LeadDetails';
import AddLeadModal from './components/AddLeadModal';
import LeadApproval from './components/LeadApproval';
import { Plus, Filter, Download, CheckCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const Leads: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('leads');
  const { addNotification } = useCRM();

  const handleAddLead = (leadData: any) => {
    if (leadData.success) {
      console.log('Lead created successfully with ID:', leadData.leadId);
      addNotification({
        type: 'success',
        message: 'Lead created successfully!',
      });
      setIsAddModalOpen(false);
      // Optionally refresh the lead list here
      window.location.reload(); // Simple refresh - you might want to implement a more elegant solution
    } else {
      console.log('Adding new lead:', leadData);
      addNotification({
        type: 'success',
        message: `Lead ${leadData.projectName} created successfully!`,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleConvertLead = (leadId: string) => {
    console.log('Converting lead:', leadId);
    addNotification({
      type: 'success',
      message: 'Lead converted to project successfully!',
    });
  };

  const handleApprovalAction = (leadId: string, action: 'approve' | 'reject', reason?: string) => {
    console.log(`${action} lead:`, leadId, reason);
    addNotification({
      type: action === 'approve' ? 'success' : 'warning',
      message: `Lead ${action}d successfully!`,
    });
  };

  const tabs = [
    { id: 'leads', name: 'All Leads', icon: Plus },
    { id: 'approval', name: 'Lead Approval', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
        <div className="flex space-x-3">
          {/* <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button> */}
          {activeTab === 'leads' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Lead
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
      {activeTab === 'leads' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <LeadList
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
            />
          </div>
          <div className="lg:col-span-2">
            <LeadDetails
              lead={selectedLead}
              onConvert={handleConvertLead}
            />
          </div>
        </div>
      ) : (
        <LeadApproval onApprovalAction={handleApprovalAction} />
      )}

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLead}
      />
    </div>
  );
};

export default Leads;